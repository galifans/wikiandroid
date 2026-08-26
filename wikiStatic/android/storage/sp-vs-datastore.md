---
icon: storage
title: SharedPreferences 与 DataStore 对比
description: 从 API 设计、异步模型、一致性、类型安全四个维度深度对比 SP 与 DataStore
---

# SharedPreferences 与 DataStore 对比

> 面试高频指数：高
> 这是面试官最爱问的"新旧技术对比"类问题，也是从旧项目迁移到新架构的必经之路。

## 1. 一句话总结

- **SharedPreferences（SP）**：Android 早期提供的键值对存储，简单但**主线程阻塞、无一致性保证、无类型安全**。
- **DataStore**：官方推荐的替代方案，基于 **Flow 的异步响应式**存储，支持 Preferences 与 Proto 两种模式。

## 2. 使用方式对比

### 2.1 SharedPreferences

::: code-tabs

@tab:active Java

```java
// 获取实例
SharedPreferences sp = getSharedPreferences("user_config", Context.MODE_PRIVATE);

// 写入（两种方式）
sp.edit().putString("nickname", "Tom").apply();    // 异步：内存立即生效，磁盘异步写
sp.edit().putString("nickname", "Tom").commit();   // 同步：写盘完成后返回，可能卡线程

// 读取（可能阻塞）
String nickname = sp.getString("nickname", "default");
```

@tab Kotlin

```kotlin
// 获取实例
val sp = getSharedPreferences("user_config", Context.MODE_PRIVATE)

// 写入（两种方式）
sp.edit().putString("nickname", "Tom").apply()    // 异步：内存立即生效，磁盘异步写
sp.edit().putString("nickname", "Tom").commit()   // 同步：写盘完成后返回，可能卡线程

// 读取（ 可能阻塞）
val nickname = sp.getString("nickname", "default")
```

:::

### 2.2 Preferences DataStore

::: code-tabs

@tab:active Java

```java
// Preferences DataStore（Java 中用 PreferenceDataStoreFactory 创建实例）
private final DataStore<Preferences> dataStore =
        new PreferenceDataStoreFactory().create(
                CoroutineScope(Dispatchers.IO + SupervisorJob()),
                () -> new File(context.getFilesDir(), "user_config.preferences_pb"));

// 读取：Flow，异步 + 响应式
Flow<String> nickname = dataStore.getData().map(prefs ->
        prefs.contains(Keys.NICKNAME) ? prefs.get(Keys.NICKNAME) : "default");

// 写入：suspend（Java 中在协程/WorkManager 中调用）
public void setNickname(String name, CoroutineScope scope) {
    scope.launch(Dispatchers.IO) {
        dataStore.edit(prefs -> prefs.put(Keys.NICKNAME, name));
    }
}

private static class Keys {
    static final Preferences.Key<String> NICKNAME =
            PreferencesKeys.stringKey("nickname");
}
```

@tab Kotlin

```kotlin
private val Context.dataStore by preferencesDataStore(name = "user_config")

// 读取：Flow，异步 + 响应式
val nickname: Flow<String> = context.dataStore.data.map { prefs ->
    prefs[Keys.NICKNAME] ?: "default"
}

// 写入：suspend，事务性
suspend fun setNickname(name: String) {
    context.dataStore.edit { prefs ->
        prefs[Keys.NICKNAME] = name
    }
}

private object Keys {
    val NICKNAME = stringPreferencesKey("nickname")
}
```

:::

### 2.3 观察变化

::: code-tabs

@tab:active Java

```java
// SP 需要手动监听
sp.registerOnSharedPreferenceChangeListener((prefs, key) -> { /* ... */ });
// 记得注销，且回调线程不保证

// DataStore：Flow 天然可观察
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        dataStore.data.collect { prefs ->
            // 任何变化都会自动推送
        }
    }
}
```

@tab Kotlin

```kotlin
// SP 需要手动监听
sp.registerOnSharedPreferenceChangeListener { _, _ -> ... }
// 记得注销，且回调线程不保证

// DataStore：Flow 天然可观察
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        dataStore.data.collect { prefs ->
            // 任何变化都会自动推送
        }
    }
}
```

:::

## 3. 六大维度对比表

| 维度 | SharedPreferences | DataStore |
| --- | --- | --- |
| 数据模型 | 键值对（无类型） | 键值对 / Proto（类型安全） |
| 读取方式 | 同步（可能阻塞主线程） | 异步 Flow |
| 写入一致性 | apply 无回调、失败静默 | 事务性，失败抛异常可重试 |
| 是否响应式 | ✗ 需手动监听 | ✓ 天然 Flow |
| 跨进程安全 | ✗（MODE_MULTI_PROCESS 已废弃） | 单进程单实例 |
| 生命周期集成 | ✗ | ✓ 协程+生命周期感知 |

## 4. 深挖原理：为什么 SP 会卡

### 4.1 读取路径

```text
getSharedPreferences() 首次调用
  → 如果磁盘文件还没加载
  → 同步读文件 + XML 解析
  → 一次性加载所有键值对到内存（startLoadFromDisk 是异步的，
     但 getXxx() 会调用 awaitLoadedLocked 等待加载完成）
```

::: code-tabs

@tab:active Java

```java
// SP 源码关键逻辑（伪代码）
public String getString(String key, String defValue) {
    synchronized (this) {
        awaitLoadedLocked();  // ← 阻塞等待磁盘加载完成
        String v = (String) mMap.get(key);
        return v != null ? v : defValue;
    }
}
```

@tab Kotlin

```kotlin
// SP 源码关键逻辑（伪代码，Kotlin 等价示意）
@Synchronized
fun getString(key: String, defValue: String): String {
    awaitLoadedLocked()  // ← 阻塞等待磁盘加载完成
    return mMap[key] as? String ?: defValue
}
```

:::

### 4.2 写入路径

::: code-tabs

@tab:active Java

```java
public void apply() {
    // ① 先同步写入内存 map（立即生效）
    // ② 异步写磁盘（QueuedWork 排队，在 onPause 时会被强制 flush！）
    QueuedWork.addFinisher(...);   // 可能阻塞 onPause/onStop
}
```

@tab Kotlin

```kotlin
fun apply() {
    // ① 先同步写入内存 map（立即生效）
    // ② 异步写磁盘（QueuedWork 排队，在 onPause 时会被强制 flush！）
    QueuedWork.addFinisher(...)   // 可能阻塞 onPause/onStop
}
```

:::

> **经典卡顿场景**：主线程频繁 `getXxx()` 且文件大；或 `apply()` 排队任务过多，
> 在 `onPause` 时 `QueuedWork.waitToFinish()` 强制等待写盘完成。

## 5. 深挖原理：DataStore 为什么可靠

```text
DataStore 核心机制：
  - 单例：同进程同一文件名只有一个实例
  - 事务：所有写操作通过单线程 Actor（协程）串行执行
  - 冲突检测：写之前读取当前版本，写后比对，冲突则重试
  - 异常处理：读失败抛 IOException（需自行处理/重试），写失败不破坏原数据
```

::: code-tabs

@tab:active Java

```java
// DataStore 内部：SingleProcessDataStore 使用协程 Actor 串行化所有操作
// 保证：不会出现 SP 那种"两个进程同时写导致数据错乱"的问题
```

@tab Kotlin

```kotlin
// DataStore 内部：SingleProcessDataStore 使用协程 Actor 串行化所有操作
// 保证：不会出现 SP 那种"两个进程同时写导致数据错乱"的问题
```

:::

## 6. 迁移建议

### 6.1 何时必须迁移

- 项目准备上 **响应式架构（StateFlow/Compose）**。
- 有跨进程读写需求。
- 主线程性能敏感（SP 频繁读取）。

### 6.2 何时可以暂缓

- 存量代码量大，SP 使用简单且无性能问题。
- 迁移成本 > 收益（评估后再决定）。

### 6.3 迁移方案

官方推荐：**一次性迁移**（首次启动把 SP 数据导入 DataStore，之后删除 SP 文件）。

::: code-tabs

@tab:active Java

```java
// 使用 SharedPreferencesMigration（Java 中在协程作用域内调用）
DataStore<Preferences> dataStore =
        new PreferenceDataStoreFactory().create(
                CoroutineScope(Dispatchers.IO + SupervisorJob()),
                () -> new File(context.getFilesDir(), "data_store.preferences_pb"),
                new SharedPreferencesMigration(context, "user_config")   // 自动迁移旧数据
        );
```

@tab Kotlin

```kotlin
// 使用 SharedPreferencesMigration
val dataStore = PreferenceDataStoreFactory.create(
    scope = CoroutineScope(Dispatchers.IO + SupervisorJob()),
    produceFile = { File(context.filesDir, "data_store.preferences_pb") },
    migrations = listOf(
        SharedPreferencesMigration(context, "user_config")   // 自动迁移旧数据
    )
)
```

:::

## 7. 高频面试题

**Q1：为什么 SharedPreferences 被官方标记为 legacy？**
A：性能（同步读阻塞）、一致性（apply 失败无感知）、类型安全（无编译期校验）、
跨进程不安全，且不响应式，与协程/Flow 架构不匹配。

**Q2：DataStore 的写操作是原子的吗？**
A：是。同一进程内所有写操作通过协程 Actor 串行执行，且带冲突检测（写前读版本、
写后校验），失败时抛出异常而非静默丢弃，保证数据一致性。

**Q3：DataStore 能替代 Room 吗？**
A：不能。DataStore 是键值对/单对象存储，适合配置类数据；Room 是关系型数据库，
支持复杂查询、索引、关联。两者定位不同。

**Q4：DataStore 读取失败怎么办？**
A：`data` Flow 抛 `IOException`。可在 collect 中 try-catch 返回默认值，或用
`catch { emit(emptyPreferences()) }` 优雅降级。

**Q5：SP 的 commit 和 apply 有什么区别？**
A：`commit` 同步写盘返回布尔结果（可能阻塞主线程）；`apply` 先更新内存、异步写盘
（不阻塞，但失败无感知，且 onPause 时 QueuedWork 可能强制等待写盘完成）。

## 8. 小结

- **SP**：简单但有性能与一致性隐患；**DataStore**：异步、响应式、可靠。
- 面试答题公式：`同步 vs 异步 → 一致性 → 类型安全 → 响应式 → 跨进程`。
- 新项目直接用 DataStore，旧项目按需迁移。

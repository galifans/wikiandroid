---
icon: database
title: DataStore 使用详解
description: Preferences DataStore 与 Proto DataStore 完整使用、迁移 SP、异常处理与最佳实践
---

# 🧊 DataStore 使用详解

> 面试高频指数：⭐⭐⭐⭐
> SharedPreferences 的官方替代品，配合 Flow 与协程实现完全异步的键值存储。

## 1. 两种 DataStore

| 类型 | 存储内容 | 类型安全 | 依赖 |
| --- | --- | --- | --- |
| Preferences DataStore | 键值对 | ❌（key 为字符串） | `datastore-preferences` |
| Proto DataStore | 自定义对象 | ✅（生成的类） | `datastore` + protobuf |

## 2. Preferences DataStore

### 2.1 添加依赖

```gradle
implementation("androidx.datastore:datastore-preferences:1.1.1")
```

### 2.2 基本使用

```kotlin
// 顶层属性（每个文件一个实例）
private val Context.settingsDataStore by preferencesDataStore(name = "settings")

class SettingsRepository(private val context: Context) {

    // 读取：Flow（异步、可观察）
    val themeMode: Flow<ThemeMode> = context.settingsDataStore.data
        .catch { exception ->
            // 读取失败时优雅降级
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { prefs ->
            ThemeMode.valueOf(
                prefs[Keys.THEME_MODE] ?: ThemeMode.SYSTEM.name
            )
        }

    // 写入：suspend（事务性）
    suspend fun setThemeMode(mode: ThemeMode) {
        context.settingsDataStore.edit { prefs ->
            prefs[Keys.THEME_MODE] = mode.name
        }
    }

    private object Keys {
        val THEME_MODE = stringPreferencesKey("theme_mode")
    }
}

enum class ThemeMode { SYSTEM, LIGHT, DARK }
```

### 2.3 支持的 key 类型

| 函数 | 类型 |
| --- | --- |
| `intPreferencesKey()` | Int |
| `stringPreferencesKey()` | String |
| `booleanPreferencesKey()` | Boolean |
| `longPreferencesKey()` | Long |
| `floatPreferencesKey()` | Float |
| `stringSetPreferencesKey()` | Set\<String\> |

## 3. Proto DataStore

### 3.1 定义 schema

```protobuf
// proto/user_preferences.proto
syntax = "proto3";

package com.example;

option java_package = "com.example.datastore";
option java_multiple_files = true;

message UserPreferences {
    string username = 1;
    bool notifications_enabled = 2;
    int32 refresh_interval_minutes = 3;
}
```

### 3.2 构建配置

```gradle
plugins {
    id "com.google.protobuf"
}

protobuf {
    protoc { artifact = "com.google.protobuf:protoc:3.25.1" }
    generateProtoTasks {
        all().each { task ->
            task.builtins {
                java { option "lite" }
            }
        }
    }
}

dependencies {
    implementation("androidx.datastore:datastore:1.1.1")
    implementation("com.google.protobuf:protobuf-javalite:3.25.1")
}
```

### 3.3 使用生成的类

```kotlin
// 序列化器
object UserPreferencesSerializer : Serializer<UserPreferences> {
    override val defaultValue: UserPreferences = UserPreferences.getDefaultInstance()

    override suspend fun readFrom(input: InputStream): UserPreferences {
        return try {
            UserPreferences.parseFrom(input)
        } catch (e: InvalidProtocolBufferException) {
            throw CorruptionException("Cannot read proto.", e)
        }
    }

    override suspend fun writeTo(t: UserPreferences, output: OutputStream) {
        t.writeTo(output)
    }
}

val Context.userPreferencesDataStore by dataStore(
    fileName = "user_preferences.pb",
    serializer = UserPreferencesSerializer
)

// 使用
class UserRepository(private val context: Context) {
    val userPrefs: Flow<UserPreferences> = context.userPreferencesDataStore.data

    suspend fun setUsername(name: String) {
        context.userPreferencesDataStore.updateData { prefs ->
            prefs.toBuilder().setUsername(name).build()
        }
    }
}
```

## 4. 迁移 SharedPreferences

### 4.1 自动迁移

```kotlin
val Context.dataStore by preferencesDataStore(
    name = "settings",
    produceMigrations = { context ->
        listOf(SharedPreferencesMigration(context, "legacy_settings"))
    }
)
```

### 4.2 迁移时机

- 首次创建 DataStore 时执行一次。
- 迁移完成即删除 SP 文件（`SharedPreferencesMigration` 内部处理）。
- **注意**：迁移只读取一次；若 SP 在迁移后又被写入，数据不会同步。

## 5. 异常处理

```kotlin
// 读取失败：IO 异常（如磁盘损坏）
val safeData: Flow<Preferences> = context.dataStore.data
    .catch { exception ->
        if (exception is IOException) {
            emit(emptyPreferences())   // 返回空数据继续运行
        } else {
            throw exception            // 其他异常直接抛
        }
    }

// 写入失败：edit 中抛 IOException，需捕获处理
try {
    context.dataStore.edit { prefs -> prefs[Keys.X] = value }
} catch (e: IOException) {
    // 写入失败处理（如提示用户）
}
```

## 6. 与 SharedPreferences 对比

| 维度 | SharedPreferences | DataStore |
| --- | --- | --- |
| 异步性 | 读取同步（阻塞）、写入异步 | 完全异步（Flow） |
| 一致性 | apply 失败无感知 | 事务性、失败可重试 |
| 响应式 | 需手动监听 | 天然 Flow |
| 类型安全 | 无 | Proto 支持 |
| 多进程 | 不安全 | 单进程单实例 |

## 7. 高频面试题

**Q1：DataStore 和 MMKV 怎么选？**
A：DataStore 官方维护、纯 Kotlin/协程、Flow 响应式，适合大多数场景；MMKV 基于 mmap，
性能极高、支持多进程，适合超大 KV 或跨进程高频读写。两者各有取舍，按需选择。

**Q2：DataStore 的 edit 是原子的吗？**
A：是。所有写操作在**单个协程 Actor** 中串行执行；写前读取当前值，写后校验
（版本比对），冲突则重试。保证同一进程内数据一致。

**Q3：Preferences DataStore 能存 List 吗？**
A：不能直接存。方案：① JSON 序列化成 String 存；② 用 Proto DataStore 存 repeated 字段；
③ 拆成多个 key（`key_0`、`key_1`）。

**Q4：为什么 DataStore 不能在多进程使用？**
A：DataStore 在单进程中保证单实例 + 事务一致性；多进程各自实例会互相覆盖。
`MultiProcessDataStore`（实验性）或换 MMKV 才能跨进程。

## 8. 小结

- Preferences DataStore：KV 配置存储；Proto DataStore：类型安全对象存储。
- 完全异步（Flow + suspend）、事务一致、异常可恢复。
- 新项目直接使用；旧项目通过 `SharedPreferencesMigration` 平滑迁移。

---
icon: lifecycle
title: SavedStateHandle 状态保存
description: SavedStateHandle 原理、与 Bundle 的区别、ViewModel 中保存和恢复 UI 状态的最佳实践
---

# SavedStateHandle 状态保存

> 面试高频指数：高
> 进程被杀后如何恢复状态？`SavedStateHandle` 是官方推荐的 ViewModel 状态持久方案。

## 1. 问题背景

### 1.1 配置变更 vs 进程死亡

| 场景 | 内存是否被清空 | ViewModel 是否存活 | 需要持久化 |
| --- | --- | --- | --- |
| 旋转屏幕 | ✗ 否 | ✓ 存活 | ✗ 不需要 |
| 内存不足回收 | ✓ 是 | ✗ 销毁 | ✓ 需要 |
| 用户主动划掉 | ✓ 是 | ✗ 销毁 | ✓ 看需求 |

> ViewModel 只在**配置变更**时存活；**进程死亡**时整个进程没了，状态需要靠
> `SavedStateHandle` / `onSaveInstanceState` 保存。

### 1.2 传统方案的不足

::: code-tabs

@tab:active Java

```java
// ✗ 传统方案：手动保存到 Bundle，代码分散且容易遗漏
@Override
protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putString("query", queryText);
}

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    queryText = savedInstanceState != null
            ? savedInstanceState.getString("query", "") : "";
}
```

@tab Kotlin

```kotlin
// ✗ 传统方案：手动保存到 Bundle，代码分散且容易遗漏
override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)
    outState.putString("query", queryText)
}

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    queryText = savedInstanceState?.getString("query") ?: ""
}
```

:::

问题：与 UI 层耦合、key 易写错、代码分散。

## 2. SavedStateHandle 是什么

`SavedStateHandle` 是 ViewModel 的**状态保存容器**，配合 `SavedStateViewModelFactory`
自动在进程死亡后恢复数据。

::: code-tabs

@tab:active Java

```java
public class SearchViewModel extends ViewModel {
    private static final String KEY_QUERY = "query";
    private static final String KEY_RESULTS = "results";

    private final SavedStateHandle savedStateHandle;   // 构造注入

    public SearchViewModel(SavedStateHandle savedStateHandle) {
        this.savedStateHandle = savedStateHandle;
    }

    // 保存：直接写入
    public String getQuery() {
        return savedStateHandle.get(KEY_QUERY, "");
    }

    public void setQuery(String value) {
        savedStateHandle.set(KEY_QUERY, value);
    }

    // 或使用状态化 API（推荐）：返回 LiveData/StateFlow
    public LiveData<List<String>> getResults() {
        return savedStateHandle.getLiveData(KEY_RESULTS);
    }

    public void search() {
        // 对应 Kotlin 的 viewModelScope.launch：Java 中可配合回调 / 线程池执行
        List<String> data = repo.search(getQuery());
        savedStateHandle.set(KEY_RESULTS, data);
    }
}
```

@tab Kotlin

```kotlin
class SearchViewModel(
    private val savedStateHandle: SavedStateHandle   // 构造注入
) : ViewModel() {

    companion object {
        private const val KEY_QUERY = "query"
        private const val KEY_RESULTS = "results"
    }

    // 保存：直接写入
    var query: String
        get() = savedStateHandle.get<String>(KEY_QUERY) ?: ""
        set(value) { savedStateHandle[KEY_QUERY] = value }

    // 或使用状态化 API（推荐）：返回 LiveData/StateFlow
    val results: LiveData<List<String>> =
        savedStateHandle.getLiveData(KEY_RESULTS)

    fun search() {
        viewModelScope.launch {
            val data = repo.search(query)
            savedStateHandle[KEY_RESULTS] = data
        }
    }
}
```

:::

## 3. 获取 SavedStateHandle 的方式

### 3.1 构造注入（推荐）

::: code-tabs

@tab:active Java

```java
public class MyViewModel extends ViewModel {
    private final SavedStateHandle savedStateHandle;

    public MyViewModel(SavedStateHandle savedStateHandle) {
        this.savedStateHandle = savedStateHandle;
    }
}
```

@tab Kotlin

```kotlin
class MyViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel()
```

:::

> 配合 `SavedStateViewModelFactory` 自动注入，无需手动创建。

### 3.2 Hilt 注入

::: code-tabs

@tab:active Java

```java
@HiltViewModel
public class MyViewModel extends ViewModel {
    private final SavedStateHandle savedStateHandle;

    @Inject
    public MyViewModel(SavedStateHandle savedStateHandle) {
        this.savedStateHandle = savedStateHandle;
    }
}
```

@tab Kotlin

```kotlin
@HiltViewModel
class MyViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle
) : ViewModel()
```

:::

### 3.3 获取 Activity 的 Intent 参数

::: code-tabs

@tab:active Java

```java
public class DetailViewModel extends ViewModel {
    public final String userId;

    public DetailViewModel(SavedStateHandle savedStateHandle) {
        // 自动读取 Intent extra 中的 "id"
        this.userId = Objects.requireNonNull(savedStateHandle.get("id"));
    }
}
```

@tab Kotlin

```kotlin
class DetailViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    // 自动读取 Intent extra 中的 "id"
    val userId: String = checkNotNull(savedStateHandle["id"])
}
```

:::

## 4. 原理分析

### 4.1 数据流向

```text
Activity 创建
  → SavedStateViewModelFactory 创建 ViewModel
  → 从 SavedStateRegistry（Activity 持有）获取已保存的 Bundle
  → 包装成 SavedStateHandle
  → 进程死亡后：Activity 重建时 Bundle 恢复
  → SavedStateHandle 自动恢复上次保存的数据
```

### 4.2 关键类

| 类 | 职责 |
| --- | --- |
| `SavedStateRegistry` | 注册/获取保存的状态（Activity 内单例） |
| `SavedStateController` | 连接 SavedStateRegistry 与 SavedStateHandle |
| `SavedStateViewModelFactory` | 创建带 SavedStateHandle 的 ViewModel |
| `AbstractSavedStateViewModelFactory` | 自定义 Factory 的基类 |

### 4.3 与 onSaveInstanceState 的关系

- `SavedStateHandle` 底层就是使用 `SavedStateRegistry` + Bundle。
- Activity 的 `onSaveInstanceState` 会调用所有注册的 `SavedStateProvider`。
- ViewModel 的 SavedStateHandle 数据**在进程死亡时**会序列化进 Bundle（受 Binder 大小限制）。

## 5. 与 Bundle / ViewModel 的对比

| 维度 | onSaveInstanceState | ViewModel | SavedStateHandle |
| --- | --- | --- | --- |
| 旋转屏幕 | 不调用（API 28+ 默认不调） | 存活 | 存活 |
| 进程死亡 | ✓ 恢复 | ✗ 丢失 | ✓ 恢复 |
| 数据类型 | Bundle（可序列化） | 任意对象 | Bundle 兼容类型 |
| 与 UI 解耦 | ✗ 耦合 | ✓ 解耦 | ✓ 解耦 |
| 可观察 | ✗ | ✓ LiveData/Flow | ✓ LiveData/Flow |

> **最佳实践组合**：临时数据（列表对象）放 ViewModel；需要跨进程恢复的关键状态
> （筛选条件、页码、输入内容）放 SavedStateHandle。

## 6. 高频面试题

**Q1：SavedStateHandle 和 ViewModel 有什么区别？**
A：ViewModel 在配置变更时存活、进程死亡时丢失；SavedStateHandle 在进程死亡后也能
恢复（底层走 Bundle 序列化）。SavedStateHandle 相当于"可持久化的 ViewModel 状态"。

**Q2：SavedStateHandle 能保存任意对象吗？**
A：不能直接保存任意对象。它内部是 `Map<String, Any>`，写入的值必须能放进 Bundle
（可序列化类型）。自定义对象需实现 `Parcelable`/`Serializable` 或用 `@Parcelize`。

**Q3：SavedStateHandle 的数据什么时候保存？**
A：Activity `onStop` 之后、`onSaveInstanceState` 期间，通过 `SavedStateRegistry` 
统一收集各 Provider 的状态并写入 Bundle。

**Q4：为什么说不要用 SavedStateHandle 保存大对象？**
A：进程死亡恢复时数据走 Binder 传输（`onSaveInstanceState` 的 Bundle 经 Binder 传递给
system_server），有 **~1MB 限制**。大对象应存 Room/DataStore，SavedStateHandle 只存
关键标识（如 id），重建时重新查询。

## 7. 小结

- SavedStateHandle = 进程死亡也能恢复的 ViewModel 状态容器。
- 配合构造注入/Hilt 使用，自动与 SavedStateRegistry 联动。
- 小数据用 SavedStateHandle，大数据存数据库存 id。

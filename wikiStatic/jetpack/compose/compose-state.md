---
icon: compose
title: Compose 状态管理
description: mutableStateOf/remember/rememberSaveable、状态提升、ViewModel 集成、Flow 收集与状态容器最佳实践
---

# Compose 状态管理

> 面试高频指数：极高
> 状态管理是 Compose 开发的核心，直接决定代码质量与性能。

## 1. 状态的三要素

```text
状态（State）：随时间变化的数据（count、加载状态、用户信息）
事件（Event）：触发状态变化的行为（点击、网络回调）
界面（UI）：由状态推导（UI = f(state)）

单向数据流：
事件 → 状态更新 → UI 重组
```

## 2. 基础 API

### 2.1 mutableStateOf：可观察状态

::: code-tabs

@tab:active Java

```java
// Compose 仅支持 Kotlin DSL，无 Java 等价写法；
// 可观察状态对应 View 体系：LiveData / MutableLiveData + Observer
```

@tab Kotlin

```kotlin
// 创建可观察状态
var count by remember { mutableStateOf(0) }

// 读取 → 值变化时触发重组
Text("Count: $count")

// 修改 → 自动触发重组
Button(onClick = { count++ }) { Text("+1") }
```

:::

### 2.2 remember / rememberSaveable

::: code-tabs

@tab:active Java

```java
// Compose 仅支持 Kotlin DSL，无 Java 等价写法；
// remember 对应 View 体系：Activity/ViewModel 字段；rememberSaveable 对应 onSaveInstanceState / SavedStateHandle
```

@tab Kotlin

```kotlin
// remember：重组间保留（进程死亡不保留）
var count by remember { mutableStateOf(0) }

// rememberSaveable：配置变化（旋转）也保留（内部走 Bundle）
var count by rememberSaveable { mutableStateOf(0) }

// 需要自定义 Saver 的复杂对象
var user by rememberSaveable(stateSaver = UserSaver) {
    mutableStateOf(User())
}
```

:::

### 2.3 derivedStateOf：派生状态

::: code-tabs

@tab:active Java

```java
// Compose 仅支持 Kotlin DSL，无 Java 等价写法；
// 派生状态对应 View 体系：滚动监听回调中按需更新 UI，或 MediatorLiveData 派生
```

@tab Kotlin

```kotlin
// 列表很大时，避免每次滚动都全量重组
val isVisible by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
}

// derivedStateOf：只在"计算结果"变化时触发重组
```

:::

## 3. 状态提升（Hoisting）

::: code-tabs

@tab:active Java

```java
// Compose 仅支持 Kotlin DSL，无 Java 等价写法；
// 状态提升对应 View 体系：自定义 View 用回调接口上抛事件，状态由父容器持有
```

@tab Kotlin

```kotlin
// 无状态组件（stateless）：状态由外部传入
@Composable
fun CounterView(count: Int, onIncrement: () -> Unit) {
    Text("Count: $count")
    Button(onClick = onIncrement) { Text("+1") }
}

// 有状态组件（stateful）：持有状态
@Composable
fun Screen() {
    var count by remember { mutableStateOf(0) }
    CounterView(count = count, onIncrement = { count++ })
}
```

:::

**规则**：尽可能无状态；状态提升到最近的公共父级。

## 4. ViewModel 集成（官方推荐）

::: code-tabs

@tab:active Java

```java
// ViewModel 部分：Java 中常用 LiveData 承载可观察状态
public class CounterViewModel extends ViewModel {
    // ① 状态暴露为 LiveData
    private final MutableLiveData<Integer> _count = new MutableLiveData<>(0);
    public LiveData<Integer> getCount() {
        return _count;
    }

    public void increment() {
        _count.setValue(_count.getValue() + 1);
    }
}

// @Composable 的 UI 部分仅支持 Kotlin DSL，无 Java 等价写法；
// 对应 View 体系：observe(getViewLifecycleOwner(), ...) 收到变化后手动更新控件
```

@tab Kotlin

```kotlin
class CounterViewModel : ViewModel() {
    // ① 状态暴露为 State
    private val _count = mutableStateOf(0)
    val count: State<Int> = _count

    fun increment() {
        _count.value++
    }
}

@Composable
fun CounterScreen(viewModel: CounterViewModel = viewModel()) {
    val count = viewModel.count.value   // 读取状态

    Column {
        Text("Count: $count")
        Button(onClick = viewModel::increment) {
            Text("+1")
        }
    }
}
```

:::

**原则**：

- ViewModel 持有状态（跨配置变化存活）。
- UI 只读状态、发事件（`viewModel::increment`）。
- 不在 ViewModel 中使用 `remember`/`LaunchedEffect`。

## 5. 协程与 Flow 收集

::: code-tabs

@tab:active Java

```java
// ViewModel 部分：Java 中常用 LiveData 承载数据流结果
public class UserViewModel extends ViewModel {
    // 业务数据：数据源返回后 setValue 更新
    private final MutableLiveData<User> userLiveData = new MutableLiveData<>();
    public LiveData<User> getUserLiveData() {
        return userLiveData;
    }
}

// @Composable 的 UI 部分仅支持 Kotlin DSL，无 Java 等价写法；
// 对应 View 体系：observe() 回调中更新控件；一次性事件在 onClick 回调中触发
```

@tab Kotlin

```kotlin
class UserViewModel : ViewModel() {
    // 业务数据用 Flow
    val userFlow: Flow<User> = repository.getUser()
}

@Composable
fun UserScreen(viewModel: UserViewModel = viewModel()) {
    // collectAsState：把 Flow 转为 Compose 状态
    val user by viewModel.userFlow.collectAsState(initial = null)

    user?.let {
        Text("Hello, ${it.name}")
    }
}

// 一次性事件用 LaunchedEffect
@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    val scope = rememberCoroutineScope()
    Button(onClick = {
        scope.launch {
            val success = api.login()
            if (success) onLoginSuccess()
        }
    }) { Text("登录") }
}
```

:::

## 6. 状态容器模式（StateHolder）

::: code-tabs

@tab:active Java

```java
// data class 对应 Java 普通类 + getter + copy() 方法
public final class SearchUiState {
    private final String query;
    private final List<Result> results;
    private final boolean isLoading;

    public SearchUiState(String query, List<Result> results, boolean isLoading) {
        this.query = query;
        this.results = results;
        this.isLoading = isLoading;
    }

    public SearchUiState copy(String query, List<Result> results, boolean isLoading) {
        return new SearchUiState(query, results, isLoading);
    }

    public String getQuery() { return query; }
    public List<Result> getResults() { return results; }
    public boolean isLoading() { return isLoading; }
}

// 状态容器：Java 中可用 LiveData 承载 UI 状态
public class SearchStateHolder {
    private final MutableLiveData<SearchUiState> uiState =
            new MutableLiveData<>(new SearchUiState("", Collections.emptyList(), false));

    public LiveData<SearchUiState> getUiState() { return uiState; }

    public void onQueryChange(String query) {
        SearchUiState cur = uiState.getValue();
        uiState.setValue(cur.copy(query, cur.getResults(), cur.isLoading()));
    }
}

// rememberSearchStateHolder 对应 View 体系：由 Activity/Fragment 持有 SearchStateHolder 实例
```

@tab Kotlin

```kotlin
// 复杂 UI 状态 → 抽取 StateHolder 类（支持单元测试）
data class SearchUiState(
    val query: String = "",
    val results: List<Result> = emptyList(),
    val isLoading: Boolean = false
)

class SearchStateHolder {
    var uiState by mutableStateOf(SearchUiState())
        private set

    fun onQueryChange(query: String) {
        uiState = uiState.copy(query = query)
    }
}

@Composable
fun rememberSearchStateHolder(): SearchStateHolder =
    remember { SearchStateHolder() }
```

:::

## 7. 状态管理决策树

```text
需要跨配置变化保留？
├─ 否 → remember（或 rememberSaveable）
├─ 是 → ViewModel（业务状态）
│        └─ 简单 UI 状态 → rememberSaveable
需要跨组件共享？
├─ 否 → 局部状态（remember）
└─ 是 → 状态提升 / ViewModel / 单例仓库
```

## 8. 高频面试题

**Q1：remember 和 rememberSaveable 的区别？**
A：remember 重组时保留；rememberSaveable 额外在配置变化（旋转/进程重建）
时通过 Bundle 保存（需可序列化或自定义 Saver）。

**Q2：为什么要用 ViewModel 管理状态？**
A：ViewModel 在配置变化（旋转）后存活，避免状态丢失；与生命周期解耦；
支持 `viewModelScope` 协程；职责分离（业务逻辑不在 UI 层），可单元测试。

**Q3：collectAsState 和 collectAsStateWithLifecycle 的区别？**
A：后者在生命周期 STOPPED 时停止收集（省电、防泄漏），是官方推荐；
需依赖 `androidx.lifecycle:lifecycle-runtime-compose`。

**Q4：mutableStateOf 和 Flow 怎么选？**
A：UI 内部状态用 mutableStateOf（简单直接）；跨层业务数据用 Flow
（响应式、操作符丰富、可测试）；需要时用 collectAsState 桥接。

**Q5：如何避免重组导致的性能问题？**
A：状态作用域最小化（哪用哪读）、derivedStateOf 派生、remember 缓存
计算结果、稳定参数（不可变类）、LazyColumn 懒加载、避免 lambda 捕获大对象。

## 9. 小结

- 单向数据流：事件 → 状态 → UI。
- 基础 API：mutableStateOf + remember/rememberSaveable。
- 架构：ViewModel 持状态，UI 只读；Flow → collectAsState。
- 复杂状态用 StateHolder 模式，可测试可维护。

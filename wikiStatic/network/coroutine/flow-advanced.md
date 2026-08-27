---
icon: flow
title: 协程 Flow 进阶
description: 冷流与热流、StateFlow/SharedFlow、背压处理、扁平化操作符、错误处理与测试
---

# 协程 Flow 进阶

> 面试高频指数：极高
> Flow 是 Kotlin 响应式编程的核心，StateFlow 已成为 Android 状态管理的事实标准。

## 1. 冷流与热流

### 1.1 冷流（Cold Flow）：flow {}

冷流的等价写法如下：

::: code-tabs

@tab:active Java

```java
// 冷流等价写法:RxJava Flowable(只有订阅时才执行)
Flowable<Integer> coldFlow = Flowable.create(emitter -> {
    System.out.println("开始发射");          // 只有 subscribe 时才执行
    emitter.onNext(1);
    emitter.onNext(2);
}, BackpressureStrategy.BUFFER);

// 每次 subscribe 都重新执行
coldFlow.subscribe(item -> System.out.println("接收: " + item));  // 输出 开始发射 / 接收: 1 / 接收: 2
coldFlow.subscribe(item -> System.out.println("接收: " + item));  // 再次输出（重新执行）
```

@tab Kotlin

```kotlin
val coldFlow = flow {
    println("开始发射")        // 只有 collect 时才执行
    emit(1)
    emit(2)
}

// 每次 collect 都重新执行
coldFlow.collect { println("接收: $it") }   // 输出 开始发射 / 接收: 1 / 接收: 2
coldFlow.collect { println("接收: $it") }   // 再次输出（重新执行）
```

:::

特征：**惰性**、每个收集者独立数据流、无状态。

### 1.2 热流（Hot Flow）：StateFlow / SharedFlow

热流的等价写法如下：

::: code-tabs

@tab:active Java

```java
// 热流等价写法:RxJava(多订阅者共享)
PublishProcessor<Integer> sharedFlow = PublishProcessor.create();  // 对应 SharedFlow(replay=0)

// 带状态的热流:BehaviorProcessor(对应 StateFlow,必须初始值)
BehaviorProcessor<Integer> stateFlow = BehaviorProcessor.createDefault(0);

// 生产者（任意地方）
executor.execute(() -> {
    while (true) {
        Thread.sleep(1000);
        stateFlow.onNext(stateFlow.getValue() + 1);      // 更新状态
    }
});

// 消费者（多个，共享同一个流）
stateFlow.subscribe(v -> log("A: " + v));
stateFlow.subscribe(v -> log("B: " + v));
```

@tab Kotlin

```kotlin
// SharedFlow：多收集者共享，有缓冲
val sharedFlow = MutableSharedFlow<Int>(replay = 0)

// StateFlow：带状态的热流（类似 LiveData 的协程版）
val stateFlow = MutableStateFlow(0)   // 必须初始值

// 生产者（任意地方）
lifecycleScope.launch {
    while (true) {
        delay(1000)
        stateFlow.value++      // 更新状态
    }
}

// 消费者（多个，共享同一个流）
lifecycleScope.launch { stateFlow.collect { log("A: $it") } }
lifecycleScope.launch { stateFlow.collect { log("B: $it") } }
```

:::

## 2. StateFlow vs LiveData

StateFlow 与 LiveData 的对比说明如下：

| 维度 | LiveData | StateFlow |
| --- | --- | --- |
| 平台依赖 | androidx | 纯 Kotlin |
| 初始值 | 可空/无 | **必须有** |
| 防抖（重复值） | 不防抖 | 相同值不发射 |
| 生命周期感知 | 内置 | 需 `repeatOnLifecycle` |
| 单元测试 | 需主线程规则 | 纯协程，好测 |
| 组合/变换 | MediatorLiveData | 丰富操作符 |

对应的状态管理实现如下：

::: code-tabs

@tab:active Java

```java
// 等价写法:LiveData(Java 侧对应 StateFlow 的状态管理)
class MainViewModel extends ViewModel {
    private final MutableLiveData<MainUiState> _uiState = new MutableLiveData<>(new MainUiState());
    public LiveData<MainUiState> getUiState() { return _uiState; }

    public void load() {
        _uiState.setValue(new MainUiState(true));   // isLoading = true
        repository.fetch(new Callback<Data>() {
            @Override
            public void onSuccess(Data data) {
                MainUiState cur = _uiState.getValue();
                _uiState.setValue(cur.withData(data, false));   // 更新数据
            }
        });
    }
}

// UI 观察（生命周期感知收集）
getViewLifecycleOwner().getLifecycle().addObserver(new LifecycleEventObserver() {
    @Override
    public void onStateChanged(@NonNull LifecycleOwner source, @NonNull Lifecycle.Event event) {
        if (event == Lifecycle.Event.ON_START) {
            viewModel.getUiState().observe(getViewLifecycleOwner(), state -> render(state));
        }
    }
});
```

@tab Kotlin

```kotlin
// Compose/Jetpack 时代推荐 StateFlow
class MainViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = MainUiState(isLoading = true)
            val data = repository.fetch()
            _uiState.update { it.copy(data = data, isLoading = false) }
        }
    }
}

// UI 收集
viewLifecycleOwner.lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { state ->
            render(state)
        }
    }
}
```

::: 

## 3. 背压处理

当生产速度 > 消费速度时：

::: code-tabs

@tab:active Java

```java
// 等价写法:RxJava 同步生产 + 慢消费
Flowable.range(0, 100)
    .doOnNext(i -> Thread.sleep(10))      // 生产者快
    .observeOn(Schedulers.io())
    .subscribe(i -> {
        Thread.sleep(100);                // 消费者慢
    });
```

@tab Kotlin

```kotlin
flow {
    repeat(100) { emit(it); delay(10) }   // 生产者快
}.collect { 
    delay(100)                            // 消费者慢
}
```

:::

### 3.1 buffer（缓冲）

buffer 缓冲的标准写法如下：

::: code-tabs

@tab:active Java

```java
// 等价写法:RxJava buffer 操作符
Flowable.create(emitter -> { /* ... */ }, BackpressureStrategy.BUFFER)
    .buffer(10)   // 独立缓冲，生产者不等待消费者
```

@tab Kotlin

```kotlin
flow { ... }.buffer(10)   // 独立缓冲，生产者不等待消费者
```

:::

### 3.2 conflate（合并）

conflate 合并的标准写法如下：

::: code-tabs

@tab:active Java

```java
// 等价写法:RxJava onBackpressureLatest(丢弃中间值)
Flowable.create(emitter -> { /* ... */ }, BackpressureStrategy.DROP)
    .onBackpressureLatest()   // 只保留最新值，跳过中间值
```

@tab Kotlin

```kotlin
flow { ... }.conflate()   // 只保留最新值，跳过中间值
```

:::

### 3.3 collectLatest（取最新）

collectLatest 的标准写法如下：

::: code-tabs

@tab:active Java

```java
// 等价写法:RxJava switchMap(新值到达取消前一个处理)
Flowable.create(emitter -> { /* ... */ }, BackpressureStrategy.BUFFER)
    .switchMap(i -> Flowable.just(i).delay(100, TimeUnit.MILLISECONDS))
```

@tab Kotlin

```kotlin
flow { ... }.collectLatest {
    delay(100)            // 新值到达时取消前一个处理
}
```

:::

各背压处理方式的对比说明如下：

| 操作符 | 行为 |
| --- | --- |
| 无 | 生产等待消费（逐项） |
| `buffer` | 预缓冲，生产者先跑 |
| `conflate` | 丢弃中间值，只处理最新 |
| `collectLatest` | 新值到达取消旧处理 |

## 4. 扁平化操作符

扁平化操作符的示例代码如下：

::: code-tabs

@tab:active Java

```java
// 场景：每个 item 触发一个请求
Flowable.just(1, 2, 3)
    .map(id -> api.fetch(id))   // ✗ 错误：map 是同步的，不能返回 Flowable

// ✓ concatMap：串行
Flowable.just(1, 2, 3)
    .concatMap(id -> api.fetchAsFlowable(id))   // 一个一个来

// ✓ flatMap：并发（顺序不定）
Flowable.just(1, 2, 3)
    .flatMap(id -> api.fetchAsFlowable(id))    // 并发执行

// ✓ switchMap：取最新
Flowable.just(1, 2, 3)
    .switchMap(id -> api.fetchAsFlowable(id))   // 新 item 取消旧的

// ✓ 常用组合：filter + map + onErrorResumeNext
flowable.filter(item -> item.isValid())
    .map(item -> transform(item))
    .onErrorResumeNext(Flowable.just(fallback))   // 捕获上游异常，发射兜底值
```

@tab Kotlin

```kotlin
// 场景：每个 item 触发一个请求
flowOf(1, 2, 3)
    .map { id -> api.fetch(id) }   // ✗ 错误：map 是同步的，不能返回 Flow

// ✓ flatMapConcat：串行
flowOf(1, 2, 3)
    .flatMapConcat { id -> api.fetchAsFlow(id) }   // 一个一个来

// ✓ flatMapMerge：并发（顺序不定）
flowOf(1, 2, 3)
    .flatMapMerge { id -> api.fetchAsFlow(id) }    // 并发执行

// ✓ flatMapLatest：取最新
flowOf(1, 2, 3)
    .flatMapLatest { id -> api.fetchAsFlow(id) }   // 新 item 取消旧的

// ✓ 常用组合：filter + map + catch
flow.filter { it.isValid }
    .map { transform(it) }
    .catch { e -> emit(fallback) }   // 捕获上游异常，发射兜底值
```

:::

## 5. 错误处理

错误处理的示例代码如下：

::: code-tabs

@tab:active Java

```java
// 使用 onErrorResumeNext 捕获上游异常
viewModel.fetchData()
    .onErrorResumeNext(e -> {
        _uiState.setValue(cur.withError(e.getMessage()));
        return Flowable.just(Collections.emptyList());   // 出错后必须发射或抛
    })
    .subscribe(data -> _uiState.setValue(cur.withData(data)));

// 重试
Flowable.create(emitter -> { /* ... */ }, BackpressureStrategy.BUFFER)
    .retryWhen(errors -> errors.zipWith(Flowable.range(1, 3), (e, i) -> i))  // 重试 3 次(可加条件)
    .onErrorResumeNext(e -> Flowable.empty())
```

@tab Kotlin

```kotlin
// 使用 catch 捕获上游异常
viewModelScope.launch {
    repository.fetchData()
        .catch { e ->
            _uiState.update { it.copy(error = e.message) }
            emit(emptyList())          // catch 后必须 emit 或抛
        }
        .collect { data ->
            _uiState.update { it.copy(data = data) }
        }
}

// 重试
flow { ... }
    .retry(retries = 3) { e -> e is IOException }   // 可重试条件
    .catch { ... }
```

:::

## 6. 组合多个流

多流组合的示例代码如下：

::: code-tabs

@tab:active Java

```java
// combineLatest：任一变化都触发
Flowable<User> userFlow = ...;
Flowable<List<Post>> postsFlow = ...;

Flowable.combineLatest(userFlow, postsFlow, (user, posts) ->
    new ProfileUiState(user, posts)
).subscribe(state -> render(state));

// zip：配对（按顺序一一对应）
Flowable.just(1, 2, 3).zipWith(Flowable.just("a", "b"), (a, b) -> a + b)
// 结果："1a", "2b"
```

@tab Kotlin

```kotlin
// combine：任一变化都触发
val userFlow: Flow<User> = ...
val postsFlow: Flow<List<Post>> = ...

combine(userFlow, postsFlow) { user, posts ->
    ProfileUiState(user = user, posts = posts)
}.collect { state -> render(state) }

// zip：配对（按顺序一一对应）
flowOf(1, 2, 3).zip(flowOf("a", "b")) { a, b -> "$a$b" }
// 结果："1a", "2b"
```

:::

## 7. 高频面试题

**Q1：冷流和热流的区别？**
A：冷流（flow {}）惰性、每次收集独立执行、无状态；热流（StateFlow/SharedFlow）
共享数据、多收集者同时接收、有状态（StateFlow 保留最新值）。

**Q2：StateFlow 和 SharedFlow 的区别？**
A：StateFlow 必须有初始值、相同值不重复发射、`replay=1`（只保留最新）；
SharedFlow 可配置 replay 缓冲、无初始值、可发空事件（replay=0，如"刷新"事件）。

**Q3：为什么用 repeatOnLifecycle 而不是直接在 onCreate 收集？**
A：`repeatOnLifecycle(STARTED)` 在页面进入 STARTED 时启动收集、进入 STOPPED
时**自动取消**，避免后台收集浪费资源；直接在 onCreate 收集无法感知生命周期。

**Q4：Flow 的背压怎么处理？**
A：`buffer` 预缓冲、`conflate` 合并中间值、`collectLatest` 取消旧处理。
注意 Flow 本身有**挂起式背压**（生产端 suspend 等待），真正需要的是按需选择策略。

**Q5：为什么推荐 StateFlow 而不是 LiveData？**
A：纯 Kotlin 无平台依赖、协程原生、有初始值防空、操作符丰富、易测试；
Compose 场景 StateFlow 是官方推荐状态方案。

## 8. 小结

- 冷流惰性独立、热流共享有状态。
- StateFlow/SharedFlow 是 Android 状态管理标配。
- 背压三件套：buffer / conflate / collectLatest。
- 面试重点：冷热流、StateFlow vs LiveData、repeatOnLifecycle、扁平化操作符。

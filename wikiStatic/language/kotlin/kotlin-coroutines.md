---
icon: flow
title: Kotlin 协程
---

# Kotlin 协程从入门到进阶

> 协程（Coroutine）是 Kotlin 提供的轻量级并发解决方案，用于简化异步编程，避免回调地狱。

## 一、协程基础概念

**协程**：可挂起（suspend）和恢复的计算单元，运行在线程之上，但不受线程调度限制。

::: code-tabs

@tab:active Java

```java
// 协程等价写法：用线程池 + 延迟执行
ExecutorService executor = Executors.newSingleThreadExecutor();
executor.execute(() -> {
    try {
        Thread.sleep(1000);       // 阻塞 1 秒
        System.out.println("World");
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});
System.out.println("Hello");
// 输出：Hello → World（顺序一致）
```

@tab Kotlin

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {           // 启动一个协程
        delay(1000L)   // 挂起 1 秒（不阻塞线程）
        println("World")
    }
    println("Hello")
}
// 输出：Hello → World
```

:::

## 二、协程构建器

| 构建器 | 作用 |
|--------|------|
| `launch` | 启动协程，返回 `Job`，不返回结果 |
| `async` | 启动协程，返回 `Deferred<T>`，可获取结果 |
| `runBlocking` | 阻塞当前线程直到完成（仅测试/主函数使用） |

## 三、调度器（Dispatcher）

| 调度器 | 线程 | 适用场景 |
|--------|------|----------|
| `Dispatchers.Main` | 主线程 | UI 操作 |
| `Dispatchers.IO` | IO 线程池 | 网络、磁盘 |
| `Dispatchers.Default` | CPU 密集型 | 计算任务 |
| `Dispatchers.Unconfined` | 不限制 | 极少使用 |

::: code-tabs

@tab:active Java

```java
// 协程等价写法：IO 线程池执行，主线程更新 UI
Executors.newSingleThreadExecutor().execute(() -> {
    String data = repository.fetchData();        // IO 线程执行
    new Handler(Looper.getMainLooper()).post(() -> {
        _uiState.setValue(data);                 // 主线程更新 UI
    });
});
```

@tab Kotlin

```kotlin
viewModelScope.launch(Dispatchers.IO) {
    val data = repository.fetchData()   // IO 线程执行
    withContext(Dispatchers.Main) {
        _uiState.value = data           // 主线程更新 UI
    }
}
```

:::

## 四、结构化并发

::: code-tabs

@tab:active Java

```java
// 协程等价写法：通过线程池管理与取消
ExecutorService scope = Executors.newCachedThreadPool();

// Job：取消与等待
Future<?> job = scope.submit(() -> { /* ... */ });
job.cancel(true);
try { job.get(); } catch (Exception e) { } // 等待完成

// 子任务：父任务取消时需手动管理
scope.execute(() -> work1());
scope.execute(() -> work2());
```

@tab Kotlin

```kotlin
val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

// Job：取消与等待
val job = scope.launch { ... }
job.cancel()
job.join()

// 子协程：父协程取消时自动取消子协程
scope.launch {
    launch { work1() }
    launch { work2() }
}
```

:::

**异常处理**：`SupervisorJob` 使子协程异常互不影响，配合 `CoroutineExceptionHandler` 统一兜底。

## 五、Flow 冷流

::: code-tabs

@tab:active Java

```java
// Flow 等价写法：RxJava Observable 冷流
Observable<String> fetchData() {
    return Observable.create(emitter -> {
        emitter.onNext("第一次数据");
        try { Thread.sleep(1000); } catch (InterruptedException e) { }
        emitter.onNext("第二次数据");
        emitter.onComplete();
    });
}

// 收集
fetchData()
    .subscribeOn(Schedulers.io())        // 切换上游执行线程
    .map(String::toUpperCase)            // 操作符
    .onErrorReturn(e -> "error: " + e)   // 异常捕获
    .subscribe(data -> System.out.println(data));
```

@tab Kotlin

```kotlin
fun fetchData(): Flow<String> = flow {
    emit("第一次数据")
    delay(1000)
    emit("第二次数据")
}

// 收集
scope.launch {
    fetchData()
        .flowOn(Dispatchers.IO)          // 切换上游执行线程
        .map { it.uppercase() }          // 操作符
        .catch { e -> emit("error: $e") } // 异常捕获
        .collect { data -> println(data) }
}
```

:::

## 六、实战建议

1. **页面级作用域**：使用 `viewModelScope` 与 `lifecycleScope`，避免内存泄漏
2. **避免全局 scope**：不要用 `GlobalScope`（无法取消，易泄漏）
3. **线程切换**：用 `withContext` 而非多次 `launch`
4. **背压**：高频数据流使用 `conflate` 或 `collectLatest`

> 进阶阅读：[协程 Flow 与 RxJava](/network/coroutine/) | [线程池与并发](/network/thread/)

---
icon: flow
title: RxJava 操作符详解
description: RxJava 核心概念、创建/变换/过滤/组合操作符、线程调度、背压与协程对比
---

# ⚡ RxJava 操作符详解

> 面试高频指数：⭐⭐⭐⭐
> RxJava 虽然逐渐被协程替代，但响应式思维与操作符依然是面试高频考点。

## 1. 核心概念

### 1.1 观察者模式

```text
Observable（被观察者/数据源）
    │ 订阅
    ▼
Observer（观察者）
    ├─ onNext(item)   逐个接收数据
    ├─ onError(e)     出错
    └─ onComplete()   完成
```

```kotlin
// 订阅
Observable.just(1, 2, 3)
    .subscribe(
        { item -> println("onNext: $item") },   // onNext
        { error -> println("onError: $error") }, // onError
        { println("onComplete") }                // onComplete
    )
```

### 1.2 线程调度：subscribeOn / observeOn

```kotlin
Observable.create<String> { emitter ->
    println("数据源线程: ${Thread.currentThread().name}")
    emitter.onNext("data")
    emitter.onComplete()
}
.subscribeOn(Schedulers.io())      // 上游（数据源）在 IO 线程
.observeOn(AndroidSchedulers.mainThread())  // 下游（观察者）在主线程
.subscribe { value ->
    println("观察者线程: ${Thread.currentThread().name}")  // main
}
```

| 调度器 | 用途 |
| --- | --- |
| `Schedulers.io()` | IO 操作（网络、文件） |
| `Schedulers.computation()` | 计算密集型 |
| `Schedulers.newThread()` | 新线程（不推荐滥用） |
| `AndroidSchedulers.mainThread()` | Android 主线程 |
| `Schedulers.single()` | 单线程串行 |

> **核心规则**：`subscribeOn` 控制"上面"（数据源），`observeOn` 控制"下面"（观察者），
> 就近原则。

## 2. 创建操作符

```kotlin
Observable.just(1, 2, 3)              // 直接发射多个值
Observable.fromArray(1, 2, 3)         // 从数组
Observable.fromIterable(list)         // 从集合
Observable.range(1, 10)               // 范围 1..10
Observable.interval(1, TimeUnit.SECONDS)  // 周期发射（热流）
Observable.defer { ... }              // 订阅时才创建
Observable.create { emitter -> ... }  // 手动创建
```

## 3. 变换操作符

```kotlin
// map：一对一变换
Observable.just(1, 2, 3).map { it * 10 }       // 10, 20, 30

// flatMap：一对多 + 合并（无序）
Observable.just("a", "b")
    .flatMap { s -> Observable.just("$s-1", "$s-2") }
    // 结果：a-1, b-1, a-2, b-2（顺序不定）

// concatMap：一对多 + 顺序（有序，保序）
Observable.just("a", "b")
    .concatMap { s -> Observable.just("$s-1", "$s-2") }
    // 结果：a-1, a-2, b-1, b-2（严格保序）

// switchMap：取最新
Observable.just("a", "b")
    .switchMap { s -> fetch(s) }   // 新值到来取消旧的

// scan：累加
Observable.just(1, 2, 3).scan { acc, x -> acc + x }  // 1, 3, 6

// buffer：分批
Observable.range(1, 6).buffer(3)   // [1,2,3], [4,5,6]
```

## 4. 过滤操作符

```kotlin
Observable.just(1, 2, 3, 4, 5)
    .filter { it % 2 == 0 }        // 2, 4
    .take(2)                       // 取前2个：1, 2
    .skip(1)                       // 跳过前1个
    .distinct()                    // 去重
    .firstElement()                // 第一个
    .elementAt(2)                  // 第3个
```

## 5. 组合操作符

```kotlin
// zip：配对组合（按序配对）
Observable.zip(
    Observable.just(1, 2, 3),
    Observable.just("a", "b")
) { num, ch -> "$num$ch" }
// "1a", "2b"（短者为准）

// combineLatest：任一变化触发（取最新）
Observable.combineLatest(
    Observable.just(1, 2, 3),
    Observable.just("a", "b")
) { num, ch -> "$num$ch" }
// 3a, 3b（最后一个 num 与每个 ch 组合）

// merge：合并（交错）
Observable.merge(obs1, obs2)      // 事件交错发射

// concat：拼接（先1后2）
Observable.concat(obs1, obs2)     // 1 全部发完再发 2
```

## 6. 错误处理

```kotlin
Observable.just(1, 2, 0, 3)
    .map { 10 / it }
    .onErrorReturn { -1 }          // 出错返回默认值
    .onErrorResumeNext { Observable.just(100) }  // 出错切换新流
    .retry(2)                      // 重试 2 次
    .retryWhen { errors ->
        errors.zipWith(Observable.range(1, 3)) { _, retry -> retry }
    }
    .subscribe(...)
```

## 7. 背压（Backpressure）

```kotlin
// 策略：生产 > 消费时如何处理
Flowable.just(1, 2, 3, 4, 5, 6)
    .onBackpressureBuffer()       // 缓冲全部（可能 OOM）
    .onBackpressureDrop()         // 丢弃超出部分
    .onBackpressureLatest()       // 只保留最新
    .observeOn(Schedulers.computation())
    .subscribe(...)

// 手动请求
Flowable.create({ emitter ->
    for (i in 0..100) emitter.onNext(i)
}, BackpressureStrategy.BUFFER)
    .subscribe(object : Subscriber<Int> {
        override fun onSubscribe(s: Subscription) {
            s.request(10)         // 每次请求 10 个
        }
        override fun onNext(t: Int) { /* 处理 */ }
        ...
    })
```

## 8. RxJava vs 协程

| 维度 | RxJava | 协程 Flow |
| --- | --- | --- |
| 学习成本 | 高（操作符多） | 低（suspend + 操作符少而精） |
| 性能 | 较重（回调链） | 轻量（挂起非阻塞） |
| 取消 | 手动/自动 | 结构化并发自动 |
| 背压 | 需 Flowable 处理 | 挂起天然背压 |
| 主流趋势 | 存量项目 | **新项目推荐** |
| Android 集成 | RxAndroid | lifecycleScope/viewModelScope |

> 结论：新项目用协程；维护 RxJava 存量项目需掌握操作符。

## 9. 高频面试题

**Q1：subscribeOn 和 observeOn 的区别？**
A：`subscribeOn` 指定**数据源**执行线程（上流），`observeOn` 指定**观察者**回调线程
（下流）。`subscribeOn` 只影响其"上面"的最近一次，多个 subscribeOn 只有第一个生效；
`observeOn` 从调用处开始影响下游。

**Q2：flatMap 与 concatMap 的区别？**
A：都做一对多展开。`flatMap` 内部流并发发射、结果**无序**；`concatMap` 严格
**保序**（串行）。需要顺序依赖用 concatMap。

**Q3：RxJava 的背压怎么处理？**
A：`Flowable`（带背压） + 策略：`BUFFER`（缓冲）、`DROP`（丢弃）、`LATEST`
（最新）、`ERROR`（报错），或 `request(n)` 手动控制。Observable 不支持背压。

**Q4：RxJava 与协程怎么选？**
A：新项目选协程（轻量、结构化并发、语言原生）；存量 RxJava 项目继续维护。
两者思想相通（流式处理），会一个学另一个不难。

**Q5：如何避免 RxJava 内存泄漏？**
A：① 使用 `CompositeDisposable` 在 onDestroy 中 `dispose()`；
② 用 `RxLifecycle`/`AutoDispose` 绑定生命周期；③ 协程时代用 `repeatOnLifecycle`。

## 10. 小结

- 响应式核心：Observable + Observer + 调度器。
- 操作符分类：创建、变换（map/flatMap/concatMap）、过滤、组合、错误处理。
- 背压用 Flowable；内存管理用 CompositeDisposable。
- 面试重点：线程调度、flatMap 系区别、背压、内存泄漏治理。

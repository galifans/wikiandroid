---
icon: thread
title: 线程池详解
description: ThreadPoolExecutor 七大参数、四种拒绝策略、Executors 工厂、线程池选择与源码解析
---

# 🧵 线程池详解

> 面试高频指数：⭐⭐⭐⭐⭐
> 线程池是并发编程的核心，七大参数 + 拒绝策略是面试必考题。

## 1. 为什么用线程池

```text
不使用线程池：
  每次任务 new Thread() → 创建/销毁开销大 → 大量线程竞争 → 系统崩溃风险

线程池好处：
  ① 复用线程，减少创建/销毁开销
  ② 控制并发数量，防止资源耗尽
  ③ 统一管理（定时、延迟、队列）
```

## 2. ThreadPoolExecutor 七大参数

```kotlin
ThreadPoolExecutor(
    corePoolSize = 2,          // ① 核心线程数
    maximumPoolSize = 8,       // ② 最大线程数
    keepAliveTime = 60L,       // ③ 非核心线程空闲存活时间
    TimeUnit.SECONDS,          // ④ 时间单位
    LinkedBlockingQueue<Runnable>(100),  // ⑤ 任务队列
    threadFactory,             // ⑥ 线程工厂（命名、优先级）
    AbortPolicy()              // ⑦ 拒绝策略
)
```

### 2.1 任务执行流程

```text
提交任务
  │
  ├─ ① 当前线程数 < corePoolSize？
  │     ├─ 是 → 创建核心线程执行
  │     └─ 否 ↓
  ├─ ② 任务队列未满？
  │     ├─ 是 → 放入队列等待
  │     └─ 否 ↓
  ├─ ③ 当前线程数 < maximumPoolSize？
  │     ├─ 是 → 创建非核心线程执行
  │     └─ 否 ↓
  └─ ④ 执行拒绝策略
```

### 2.2 四种拒绝策略

| 策略 | 行为 |
| --- | --- |
| `AbortPolicy`（默认） | 抛 `RejectedExecutionException` |
| `CallerRunsPolicy` | 调用者线程自己执行（降级） |
| `DiscardPolicy` | 静默丢弃 |
| `DiscardOldestPolicy` | 丢弃队列中最老的任务 |

```kotlin
// 推荐：CallerRunsPolicy —— 任务不丢失，且天然限流
ThreadPoolExecutor(
    2, 8, 60, TimeUnit.SECONDS,
    LinkedBlockingQueue(100),
    Executors.defaultThreadFactory(),
    ThreadPoolExecutor.CallerRunsPolicy()
)
```

## 3. Executors 工厂方法

```kotlin
// 固定线程数
val fixed = Executors.newFixedThreadPool(4)
// 内部：core = max = 4，LinkedBlockingQueue（无界）

// 缓存线程池（弹性）
val cached = Executors.newCachedThreadPool()
// 内部：core = 0，max = MAX_VALUE，SynchronousQueue（来一个建一个）

// 单线程
val single = Executors.newSingleThreadExecutor()

// 定时任务
val scheduled = Executors.newScheduledThreadPool(2)
scheduled.scheduleAtFixedRate(task, 0, 1, TimeUnit.SECONDS)
```

> ⚠️ **Android 开发警告**：`Executors` 的工厂方法有隐患（无界队列、线程数无上限）。
> 推荐**手动配置 ThreadPoolExecutor**，或使用三方库（协程 Dispatchers）。

## 4. Android 中的线程池

### 4.1 协程调度器

```kotlin
// 协程场景：直接用调度器，不手动建池
viewModelScope.launch(Dispatchers.IO) { ... }
Dispatchers.IO          // 动态线程池（默认 64 线程上限）
Dispatchers.Default     // CPU 密集（核心数线程）
Dispatchers.Main        // 主线程
```

### 4.2 自定义调度器

```kotlin
// 限制并发（如数据库写）
private val dbDispatcher = Executors.newFixedThreadPool(4)
    .asCoroutineDispatcher()

// 使用
viewModelScope.launch(dbDispatcher) { db.userDao().insertAll(data) }

// 记得关闭
override fun onCleared() {
    (dbDispatcher as ExecutorCoroutineDispatcher).close()
}
```

## 5. 源码核心

```java
// execute() 流程（ThreadPoolExecutor 源码简化）
public void execute(Runnable command) {
    int c = ctl.get();
    // ① 核心线程未满 → addWorker(core)
    if (workerCountOf(c) < corePoolSize) {
        if (addWorker(command, true)) return;
    }
    // ② 队列未满 → 入队
    if (isRunning(c) && workQueue.offer(command)) {
        // 双重检查：防止入队后线程被回收
    }
    // ③ 非核心线程未满 → addWorker(非core)
    else if (!addWorker(command, false)) {
        reject(command);   // ④ 拒绝
    }
}

// Worker 循环取任务
// runWorker()：while (task != null || (task = getTask()) != null)
// getTask()：从队列 take()/poll(keepAliveTime) → 决定非核心线程回收
```

**核心机制**：

- `ctl`：一个 AtomicInteger 同时保存线程数与池状态。
- `addWorker`：CAS 增加线程数后创建 Worker。
- `getTask`：超时 poll 为空 → 非核心线程回收（keepAliveTime）。

## 6. 高频面试题

**Q1：线程池的执行流程？**
A：先看核心线程是否满 → 未满创建核心线程；满则入队；队列满看非核心线程
是否满 → 未满创建非核心线程；满则执行拒绝策略。（core → queue → max → reject）

**Q2：核心线程会被回收吗？**
A：默认不会。但 `allowCoreThreadTimeOut(true)` 开启后，核心线程空闲超过
keepAliveTime 也会被回收。

**Q3：Executors 工厂方法有什么坑？**
A：`newFixedThreadPool`/`newSingleThreadExecutor` 用**无界队列**（任务堆积
可能 OOM）；`newCachedThreadPool` 最大线程数无上限（大量任务创建大量线程）。
生产环境建议手动配置。

**Q4：线程池如何优雅关闭？**
A：`shutdown()`：不再接收新任务，执行完队列任务后关闭；
`shutdownNow()`：立即中断所有任务返回未执行列表；
`awaitTermination`：等待关闭完成。先 shutdown 再 awaitTermination。

**Q5：如何选择核心线程数？**
A：CPU 密集型：`CPU 核心数 + 1`；IO 密集型：`CPU 核心数 * 2` 或按
`线程数 = 任务等待时间/任务计算时间 * CPU核心数` 估算；实际通过压测调整。

## 7. 小结

- 七大参数：core、max、keepAlive、unit、queue、factory、handler。
- 流程：core → queue → max → reject。
- 拒绝策略：默认 Abort，生产常用 CallerRuns（不丢任务）。
- 面试重点：执行流程、参数含义、Executors 隐患、关闭方式。

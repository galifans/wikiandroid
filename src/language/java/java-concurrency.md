---
icon: java
title: Java 并发编程基础
description: 线程创建方式、线程生命周期、wait/notify、ThreadLocal、AQS 原理与并发工具全景
---

# Java 并发编程基础

> 面试高频指数：极高
> 并发是 Java 面试的深水区，本文梳理从线程到 AQS 的完整知识体系。

## 1. 线程的创建方式

::: code-tabs

@tab:active Java

```java
// ① 继承 Thread（不推荐，Java 单继承限制）
class MyThread extends Thread {
    @Override public void run() { }
}

// ② 实现 Runnable（推荐）
Runnable task = () -> System.out.println("run");
new Thread(task).start();

// ③ 实现 Callable（有返回值）
Callable<Integer> callable = () -> 42;
FutureTask<Integer> future = new FutureTask<>(callable);
new Thread(future).start();
int result = future.get();    // 阻塞获取结果

// ④ 线程池（最佳实践）
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.execute(() -> { });
```

@tab Kotlin

```kotlin
// ① 继承 Thread（不推荐，Java 单继承限制）
class MyThread : Thread() {
    override fun run() { }
}

// ② 实现 Runnable（推荐）
val task = Runnable { println("run") }
Thread(task).start()

// ③ 实现 Callable（有返回值）
val callable = Callable { 42 }
val future = FutureTask<Int>(callable)
Thread(future).start()
val result = future.get()    // 阻塞获取结果

// ④ 线程池（最佳实践）
val pool = Executors.newFixedThreadPool(4)
pool.execute { }
```

:::

## 2. 线程生命周期

```text
NEW（新建）→ RUNNABLE（就绪/运行）→ BLOCKED（阻塞，等锁）
                                  → WAITING（等待，wait/join）
                                  → TIMED_WAITING（超时等待）
                                  → TERMINATED（终止）
```

| 方法 | 状态 | 说明 |
| --- | --- | --- |
| `sleep(ms)` | TIMED_WAITING | 不释放锁 |
| `wait()` | WAITING | 释放锁，需 notify 唤醒 |
| `notify/notifyAll` | - | 唤醒等待线程 |
| `join()` | WAITING | 等待线程结束 |
| `yield()` | RUNNABLE | 让出 CPU（不一定生效） |

**wait/notify 使用规范**：

::: code-tabs

@tab:active Java

```java
// 必须在同步代码块中调用
synchronized (lock) {
    while (condition) {      // 用 while 而非 if（防止虚假唤醒）
        lock.wait();
    }
    // 业务逻辑
    lock.notifyAll();
}
```

@tab Kotlin

```kotlin
// 必须在同步代码块中调用
synchronized(lock) {
    while (condition) {      // 用 while 而非 if（防止虚假唤醒）
        lock.wait()
    }
    // 业务逻辑
    lock.notifyAll()
}
```

:::

## 3. 线程安全三要素

```text
① 原子性（Atomicity）：操作不可分割 → synchronized / Lock / CAS
② 可见性（Visibility）：修改对其他线程可见 → volatile / synchronized
③ 有序性（Ordering）：禁止指令重排 → volatile / synchronized / happens-before
```

**happens-before 规则**（JMM 保证）：

```text
- 程序顺序规则：代码书写顺序
- 锁规则：解锁 happens-before 加锁
- volatile 规则：写 happens-before 读
- 传递性：A→B，B→C 则 A→C
- 线程启动/终止规则：start() 前操作对线程可见
```

## 4. ThreadLocal

::: code-tabs

@tab:active Java

```java
// 每个线程独立的变量副本
ThreadLocal<Integer> counter = new ThreadLocal<>();

counter.set(100);       // 存（当前线程）
counter.get();          // 取
counter.remove();       // 移除（防泄漏！）

// 原理：每个 Thread 有 ThreadLocalMap
// Thread → ThreadLocalMap（key: ThreadLocal, value: 副本）
```

@tab Kotlin

```kotlin
// 每个线程独立的变量副本
val counter = ThreadLocal<Int>()

counter.set(100)        // 存（当前线程）
counter.get()           // 取
counter.remove()        // 移除（防泄漏！）

// 原理：每个 Thread 有 ThreadLocalMap
// Thread → ThreadLocalMap（key: ThreadLocal, value: 副本）
```

:::

**内存泄漏**：ThreadLocalMap 的 key 是弱引用，value 是强引用。线程长期存活
（线程池）时 value 无法回收 → **用完必须 remove()**。

## 5. AQS（AbstractQueuedSynchronizer）

### 5.1 什么是 AQS

```text
JUC 并发工具的核心基类
ReentrantLock / Semaphore / CountDownLatch / ReentrantReadWriteLock 都基于它

核心组件：
① state：同步状态（volatile int）
② CLH 队列：等待线程的双向队列
③ 模板方法：acquire / release（子类实现 tryAcquire / tryRelease）
```

::: code-tabs

@tab:active Java

```java
// 自定义一个简单的排他锁
class SimpleLock extends AbstractQueuedSynchronizer {
    @Override
    protected boolean tryAcquire(int arg) {
        return compareAndSetState(0, 1);   // CAS 获取
    }
    @Override
    protected boolean tryRelease(int arg) {
        setState(0);
        return true;
    }
}
```

@tab Kotlin

```kotlin
// 自定义一个简单的排他锁
class SimpleLock : AbstractQueuedSynchronizer() {
    override fun tryAcquire(arg: Int): Boolean {
        return compareAndSetState(0, 1)   // CAS 获取
    }
    override fun tryRelease(arg: Int): Boolean {
        setState(0)
        return true
    }
}
```

:::

### 5.2 常用并发工具对比

| 工具 | 作用 | 适用场景 |
| --- | --- | --- |
| ReentrantLock | 可重入排他锁 | 替代 synchronized |
| Semaphore | 信号量（许可数） | 限流（N 个许可） |
| CountDownLatch | 倒数门闩 | 等待 N 个任务完成 |
| CyclicBarrier | 循环屏障 | 多线程到达后一起执行 |
| Phaser | 分阶段屏障 | 复杂分阶段任务 |

## 6. 线程池

::: code-tabs

@tab:active Java

```java
// 七大参数
new ThreadPoolExecutor(
    2,                  // corePoolSize 核心线程
    5,                  // maximumPoolSize 最大线程
    60L, TimeUnit.SECONDS,   // 空闲存活时间
    new LinkedBlockingQueue<>(100),  // 任务队列
    Executors.defaultThreadFactory(),
    new ThreadPoolExecutor.AbortPolicy()   // 拒绝策略
);

// 执行流程：核心线程 → 队列 → 非核心线程 → 拒绝策略
```

@tab Kotlin

```kotlin
// 七大参数
ThreadPoolExecutor(
    2,                  // corePoolSize 核心线程
    5,                  // maximumPoolSize 最大线程
    60L, TimeUnit.SECONDS,   // 空闲存活时间
    LinkedBlockingQueue(100),  // 任务队列
    Executors.defaultThreadFactory(),
    ThreadPoolExecutor.AbortPolicy()   // 拒绝策略
)

// 执行流程：核心线程 → 队列 → 非核心线程 → 拒绝策略
```

:::

## 7. 高频面试题

**Q1：sleep 和 wait 的区别？**
A：sleep 不释放锁（TIMED_WAITING）；wait 释放锁（WAITING）需 notify 唤醒。
sleep 是 Thread 静态方法，wait 是 Object 方法且必须在同步块中。

**Q2：ThreadLocal 的原理和泄漏问题？**
A：每个线程持有 ThreadLocalMap，key 为 ThreadLocal 弱引用、value 强引用。
线程池线程长期存活时 value 无法回收 → 泄漏。解决：使用后 remove()；
ThreadLocal 用 static 修饰（避免 ThreadLocal 自身被回收导致 value 无法访问）。

**Q3：什么是 AQS？基于 AQS 实现了什么？**
A：抽象队列同步器，用 state + CLH 队列实现同步状态管理。ReentrantLock、
Semaphore、CountDownLatch、ReentrantReadWriteLock 都基于它。核心：CAS 修改
state + 获取失败入队阻塞 + 释放唤醒队首。

**Q4：什么是虚假唤醒？如何避免？**
A：wait 可能在没有 notify 的情况下被唤醒。用 while 循环检查条件
（而非 if），唤醒后重新检查，不满足继续等待。

**Q5：如何保证多线程顺序执行？**
A：join()、CountDownLatch、单线程池（newSingleThreadExecutor）、
synchronized + 条件变量按序唤醒、CompletableFuture（thenApply 链）。

## 8. 小结

- 创建线程优先用线程池。
- 三要素：原子性、可见性、有序性。
- ThreadLocal 用后 remove。
- AQS 是 JUC 的基石（state + CLH 队列）。
- 面试主线：线程 → 锁 → JMM → AQS → 并发工具 → 线程池。

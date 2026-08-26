---
icon: thread
title: Java 并发工具类
description: CountDownLatch、CyclicBarrier、Semaphore、Atomic、ConcurrentHashMap 详解与实战
---

# Java 并发工具类

> 面试高频指数：高
> JUC（java.util.concurrent）工具类是与线程池并列的高频面试考点。

## 1. CountDownLatch：倒计时门闩

**场景**：等待 N 个任务全部完成后再继续。

```kotlin
// 模拟：等待 3 个线程都完成
val latch = CountDownLatch(3)

repeat(3) { index ->
    Thread {
        Thread.sleep(1000L * (index + 1))
        println("任务 $index 完成")
        latch.countDown()          // 计数 -1
    }.start()
}

latch.await()                      // 阻塞直到计数归 0
println("全部任务完成，继续执行")

// 带超时（避免永久阻塞）
latch.await(5, TimeUnit.SECONDS)
```

**特点**：

- **一次性**：计数归 0 后不能复用。
- `countDown()` 与 `await()` 解耦，任意线程可调用。

## 2. CyclicBarrier：循环屏障

**场景**：N 个线程互相等待，全部到达后**同时**继续。

```kotlin
val barrier = CyclicBarrier(3) { println("所有线程已到达，集体行动！") }

repeat(3) { index ->
    Thread {
        Thread.sleep(1000L * index)
        println("线程 $index 到达屏障")
        barrier.await()            // 等待其他线程
        println("线程 $index 继续执行")
    }.start()
}
```

**CountDownLatch vs CyclicBarrier**：

| 维度 | CountDownLatch | CyclicBarrier |
| --- | --- | --- |
| 语义 | 等待计数归零 | 线程互相等待 |
| 复用 | ✗ 一次性 | ✓ 可循环使用（reset） |
| 参与者 | 计数与线程解耦 | 参与者固定（构造函数） |
| 使用 | 主线程等待子任务 | 线程间互相等待 |

## 3. Semaphore：信号量

**场景**：控制并发访问数量（限流）。

```kotlin
// 模拟：数据库连接池只有 2 个连接
val semaphore = Semaphore(2)

repeat(5) { index ->
    Thread {
        semaphore.acquire()        // 获取许可（无则阻塞）
        try {
            println("线程 $index 获取连接")
            Thread.sleep(2000)
            println("线程 $index 释放连接")
        } finally {
            semaphore.release()    // 释放许可（必须 finally）
        }
    }.start()
}
// 效果：同一时刻最多 2 个线程执行
```

## 4. Atomic 原子类

**场景**：无锁线程安全计数。

```kotlin
// ✗ 非原子：多线程下 i++ 会丢数据
var count = 0
repeat(1000) { Thread { count++ } }  // 结果 < 1000

// ✓ AtomicInteger：CAS 实现无锁原子操作
val atomicCount = AtomicInteger(0)
repeat(1000) { Thread { atomicCount.incrementAndGet() } }
println(atomicCount.get())           // 1000

// 常用方法
atomicCount.get()                     // 读取
atomicCount.incrementAndGet()         // ++i
atomicCount.getAndIncrement()         // i++
atomicCount.compareAndSet(expect, update)  // CAS
atomicCount.updateAndGet { it * 2 }   // 函数式更新
```

**CAS 原理**：`compareAndSwapInt`（底层 Unsafe/CMPXCHG 指令）——比较期望值，
相等则交换，不相等则自旋重试（`do while` 循环）。

## 5. ConcurrentHashMap

**场景**：线程安全的 HashMap（高并发读）。

```kotlin
// ✗ HashMap 多线程会丢数据/死循环（JDK7 扩容头插法）
//  Hashtable 全表锁，并发低

// ✓ ConcurrentHashMap：分段锁（JDK7）/ CAS+synchronized（JDK8）
val map = ConcurrentHashMap<String, Int>()
map["a"] = 1
map.computeIfAbsent("b") { 2 }   // 原子操作

// JDK8 实现要点
//  - 数组 + 链表/红黑树
//  - 头节点加锁（synchronized），非全表锁
//  - 扩容：多线程协助迁移
//  - size：counterCells 分散计数
```

**其他并发容器**：

| 容器 | 替代 | 特性 |
| --- | --- | --- |
| `CopyOnWriteArrayList` | ArrayList | 写时复制，读无锁 |
| `ConcurrentLinkedQueue` | LinkedList | CAS 无锁队列 |
| `BlockingQueue` | 队列+阻塞 | 线程池任务队列 |

## 6. volatile 与 synchronized

```kotlin
// volatile：可见性（禁止指令重排），不保证原子性
@Volatile
var running = true

// 典型用法：线程停止标志
class Worker : Thread() {
    @Volatile
    var running = true
    override fun run() {
        while (running) { /* 工作 */ }
    }
}

// synchronized：互斥（原子性 + 可见性）
@Synchronized
fun increment() { count++ }
```

| 关键字 | 可见性 | 原子性 | 使用场景 |
| --- | --- | --- | --- |
| `volatile` | ✓ | ✗ | 状态标志、单例双重检查 |
| `synchronized` | ✓ | ✓ | 临界区保护 |
| `Atomic*` | ✓ | ✓（CAS） | 计数器、累加器 |
| `Lock`（ReentrantLock） | ✓ | ✓ | 需超时/公平/条件变量 |

## 7. 高频面试题

**Q1：CountDownLatch 和 CyclicBarrier 的区别？**
A：CountDownLatch 是"倒计时门闩"，主线程等待 N 个任务，一次性；
CyclicBarrier 是"循环屏障"，N 个线程互相等待齐后再继续，可复用。
CountDownLatch 等待者与任务解耦，CyclicBarrier 参与者互相等待。

**Q2：CAS 的缺点？**
A：① ABA 问题（加版本号 AtomicStampedReference）；② 自旋消耗 CPU
（长时间竞争）；③ 只能保证单个变量的原子性。

**Q3：ConcurrentHashMap 为什么高效？**
A：JDK8 采用**数组+链表/红黑树**，put 时只对**桶头节点**加 synchronized 锁，
不同桶可并发；读操作无锁（volatile 保证可见性）；扩容多线程协作。相比
Hashtable 的全表锁并发度大幅提升。

**Q4：volatile 能保证原子性吗？**
A：不能。volatile 只保证**可见性**和**有序性**（禁止重排），`count++` 这种
读-改-写操作仍可能丢数据，需用 Atomic 或 synchronized。

**Q5：Semaphore 和锁的区别？**
A：锁（synchronized/Lock）是**互斥**（同一时刻一个线程）；Semaphore 是
**计数信号量**（同一时刻 N 个线程），更灵活，常用于限流、连接池。

## 8. 小结

- 工具类定位：CountDownLatch（等待完成）、CyclicBarrier（互相等待）、
  Semaphore（限流）、Atomic（无锁计数）、ConcurrentHashMap（高并发 Map）。
- 记忆口诀：**等待用 Latch，齐步用 Barrier，限流用 Semaphore，
  计数用 Atomic，Map 用 CHM**。

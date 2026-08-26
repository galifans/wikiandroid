---
icon: thread
title: 锁机制详解
description: synchronized 与 ReentrantLock、volatile、CAS、死锁、Java 内存模型完整解析
---

# 锁机制详解

> 面试高频指数：极高
> 锁是并发面试的核心，从 synchronized 到 JMM 再到死锁，一条线讲透。

## 1. synchronized 详解

### 1.1 三种用法

```kotlin
// ① 修饰实例方法：锁是当前实例
@Synchronized
fun syncMethod() { ... }

// ② 修饰静态方法：锁是 Class 对象
companion object {
    @Synchronized
    fun staticMethod() { ... }
}

// ③ 同步代码块：锁是指定对象
fun blockMethod() {
    synchronized(lock) { ... }
}
```

### 1.2 锁升级（重量级 → 轻量级）

JDK6 之后 synchronized 经过锁优化：

```text
无锁 → 偏向锁 → 轻量级锁 → 重量级锁（单向升级，不可降级）

偏向锁：只有一个线程访问，记录线程 ID，无竞争
轻量级锁：少量竞争，CAS 自旋
重量级锁：竞争激烈，阻塞 + 操作系统互斥量
```

> **自旋**：轻量级锁在等待时不阻塞线程而是循环尝试（适合短临界区），
> 超过阈值（自旋次数）后升级重量级锁。

## 2. ReentrantLock 详解

```kotlin
val lock = ReentrantLock()

fun work() {
    lock.lock()
    try {
        // 临界区
    } finally {
        lock.unlock()      // 必须释放！
    }
}
```

### 2.1 synchronized vs ReentrantLock

| 维度 | synchronized | ReentrantLock |
| --- | --- | --- |
| 锁获取 | 自动 | 手动（必须 unlock） |
| 可中断 | ✗ | ✓ `lockInterruptibly()` |
| 超时 | ✗ | ✓ `tryLock(1, TimeUnit.SECONDS)` |
| 公平锁 | ✗（非公平） | ✓ 可配置公平 |
| 条件变量 | `wait/notify` | `Condition.await/signal` |
| 性能 | 已优化（差不大） | 略灵活 |

### 2.2 读写锁（ReadWriteLock）

```kotlin
val rwLock = ReentrantReadWriteLock()
val readLock = rwLock.readLock()
val writeLock = rwLock.writeLock()

fun read() {
    readLock.lock()          // 多读并行
    try { /* 读操作 */ } finally { readLock.unlock() }
}

fun write() {
    writeLock.lock()         // 写独占
    try { /* 写操作 */ } finally { writeLock.unlock() }
}
```

> **读多写少**场景大幅提升并发：读读并行、读写互斥、写写互斥。

## 3. volatile 与 JMM

### 3.1 Java 内存模型（JMM）

```text
每个线程有自己的工作内存（寄存器/缓存）
主内存（共享）
写入顺序：工作内存 → 刷新主内存
读取顺序：主内存 → 拷贝工作内存

可见性问题：线程 A 修改了变量，线程 B 可能看不到（未刷新主内存）
```

### 3.2 volatile 的两大保证

```kotlin
// ① 可见性：修改立即刷新主内存，其他线程立即可见
// ② 有序性：禁止指令重排（内存屏障）
@Volatile
var flag = false

// 经典应用：单例双重检查
class Singleton private constructor() {
    companion object {
        @Volatile
        private var instance: Singleton? = null

        fun getInstance(): Singleton {
            if (instance == null) {                    // 第一次检查
                synchronized(this) {
                    if (instance == null) {            // 第二次检查
                        instance = Singleton()         // 防止指令重排
                    }
                }
            }
            return instance!!
        }
    }
}
```

> 为什么需要 volatile：`instance = Singleton()` 分三步（分配内存、初始化、赋值），
> 不加 volatile 可能"先赋值后初始化"（指令重排），另一个线程读到未初始化的实例。

## 4. CAS 与原子类

```kotlin
// CAS（Compare And Swap）：比较并交换
// 底层：Unsafe.compareAndSwapInt → CPU CMPXCHG 指令

// 手写 CAS 自旋（理解原理）
class AtomicCounter {
    private val value = AtomicInteger(0)

    fun increment(): Int {
        while (true) {                        // 自旋
            val current = value.get()
            val next = current + 1
            if (value.compareAndSet(current, next)) {  // CAS
                return next
            }
            // 失败重试（别人先改了）
        }
    }
}
```

**CAS 三问题**：ABA（版本号）、自旋消耗 CPU、单变量局限。

## 5. 死锁

### 5.1 死锁四条件

| 条件 | 说明 |
| --- | --- |
| 互斥 | 资源一次只能一个线程用 |
| 占有且等待 | 持有一个锁又等另一个 |
| 不可剥夺 | 已持有的锁不能强抢 |
| 循环等待 | A 等 B，B 等 A |

```kotlin
// 死锁示例
val lockA = Object()
val lockB = Object()

Thread {
    synchronized(lockA) {
        Thread.sleep(100)
        synchronized(lockB) { }   // 等 B
    }
}.start()

Thread {
    synchronized(lockB) {
        Thread.sleep(100)
        synchronized(lockA) { }   // 等 A → 死锁！
    }
}.start()
```

### 5.2 避免死锁

1. **按固定顺序加锁**（所有线程按同一顺序获取）。
2. **加锁超时**：`tryLock(timeout)` 拿不到就释放已持有的。
3. **避免嵌套锁**。
4. 减少锁粒度。

## 6. 高频面试题

**Q1：synchronized 锁升级过程？**
A：无锁 → 偏向锁（单线程，记录线程 ID）→ 轻量级锁（CAS 自旋）→
重量级锁（竞争激烈，阻塞挂起）。单向升级，JDK15 后偏向锁废弃。

**Q2：volatile 和 synchronized 的区别？**
A：volatile 保证可见性+有序性，不保证原子性，无阻塞；synchronized 保证
原子性+可见性+有序性，会阻塞。volatile 适合标志位，synchronized 适合临界区。

**Q3：ReentrantLock 和 synchronized 怎么选？**
A：需要超时、可中断、公平锁、多条件时用 ReentrantLock；否则 synchronized
更简单（自动释放、已优化）。

**Q4：死锁怎么排查？**
A：`jstack <pid>` 查看线程栈，找 `Found one Java-level deadlock`；
或 `jconsole`/`jvisualvm` 图形化查看。修复：统一加锁顺序、tryLock 超时。

**Q5：什么是可重入锁？**
A：同一线程可重复获取同一把锁（synchronized 和 ReentrantLock 都支持）。
实现：记录持有者线程 + 计数器，重入时计数+1，释放时-1 归零才真正释放。

## 7. 小结

- synchronized：自动、锁升级、适合简单场景。
- ReentrantLock：手动、灵活（超时/中断/公平/条件）。
- volatile：可见性+有序性，标志位利器。
- 死锁：四条件 + 统一顺序 + 超时。
- 面试重点：锁升级、JMM、双重检查单例、死锁排查。

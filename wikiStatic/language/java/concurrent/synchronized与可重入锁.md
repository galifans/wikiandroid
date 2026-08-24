---
icon: lock
title: synchronized 与可重入锁
---

# synchronized 与可重入锁

> synchronized 互斥锁机制的原理、锁的级别，以及内置锁的可重入特性与内存可见性。

## 互斥锁机制

多线程同时并发访问的资源叫**临界资源**，同时访问会造成数据不一致。采用 `synchronized` 实现的同步机制叫**互斥锁机制**。

每个对象都有一个 **monitor（锁标记）**：线程拥有锁标记才能访问资源，没有则进入锁池。每个对象的锁只能分配给一个线程，因此叫互斥锁。

编译后，synchronized 块前后会生成 `monitorenter` / `monitorexit` 字节码指令：进入时获取锁并将计数器加 1，退出时减 1，**计数器为 0 时锁被释放**。

## 锁的级别

| 级别 | 说明 |
|------|------|
| 方法锁 | synchronized 修饰的方法 |
| 对象锁 | 实例对象的对象级别锁，控制 static 之外的成员并发访问 |
| 类锁 | 被特定类的所有实例共享，控制 static 成员/方法的并发访问 |

## 对象级别锁的关键点

1. 同一方法内多个线程各有自己的局部变量拷贝
2. 线程访问实例的 synchronized 块/方法时获取该实例的对象级别锁，其他线程访问同步代码需阻塞等待
3. **不同实例**的同步代码互不影响（各自持有自己的对象锁）
4. 持有对象锁的线程被交换出去时，其他线程仍可执行该对象的**非同步代码**
5. 持有对象锁的线程会让其他线程阻塞在**所有** synchronized 方法外（a、b、c 三个同步方法会被同时阻塞）
6. `synchronized(obj)` 可获取指定对象上的锁；`obj` 为 `this` 时获取当前对象锁

## 可重入内置锁

每个 Java 对象都可作为同步的锁（内置锁/监视器锁），进入同步代码块自动获取、退出自动释放。**内置锁是可重入的**——重入意味着获取锁的粒度是"线程"而非"调用"。

**实现方式**：为每个锁关联获取计数值和所有者线程。计数值为 0 时锁未被持有；线程获取未持有锁时记下持有者并将计数值置 1；同一线程再次获取则递增；退出时递减，为 0 时释放。

**为什么需要重入**：子类覆写父类同步方法后调用 `super.doSomething()`，如果锁不可重入，将无法获得已被持有的 Child 对象锁，产生死锁。重入避免了这种死锁。

```java
public class Child extends Father {
    public synchronized void doSomething() {
        super.doSomething(); // 锁可重入，不会死锁
    }
}
```

## 内存可见性

synchronized 不仅提供互斥，还保证**内存可见性**：线程 A 在释放锁前的所有变量修改，线程 B 获得同一把锁后都能看到。

```java
public class SynchronizedInteger {
    private int value;

    public synchronized int get() { return value; }
    public synchronized void set(int value) { this.value = value; }
}
```

对 get/set 加同一把对象锁，get 就能看到 set 的修改，每次读到最新值。

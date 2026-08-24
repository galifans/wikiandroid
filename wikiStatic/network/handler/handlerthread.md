---
icon: handler
title: HandlerThread 使用详解
description: HandlerThread 原理、与普通线程区别、SerialExecutor 实现、应用场景与源码解析
---

# 🧵 HandlerThread 使用详解

> 面试高频指数：⭐⭐⭐⭐
> HandlerThread = Thread + Looper，面试常考它与普通 Thread 的区别和源码。

## 1. 是什么

**HandlerThread** 是一个自带 `Looper` 的线程。它解决的核心问题：
**如何在一个子线程中接收并依次执行多个任务**。

```text
普通线程：run() 执行完就结束，无法复用。
HandlerThread：Looper 循环等待消息，可反复 post 任务，线程不退出。
```

## 2. 基本使用

```kotlin
// 1. 创建并启动
val handlerThread = HandlerThread("worker-thread")
handlerThread.start()

// 2. 拿到该线程的 Looper 创建 Handler
val handler = Handler(handlerThread.looper)

// 3. 提交任务（依次执行，串行队列）
handler.post {
    // 在子线程执行任务1
    val data = loadFromDisk()
    handler.post {
        // 任务2 依赖任务1，一定在其后执行
    }
}

// 4. 不再使用时退出
handlerThread.quitSafely()   // 处理完队列中已有消息后退出
```

### 2.1 典型场景：顺序执行耗时任务

```kotlin
class ImageLoader {

    // 单线程队列：解码任务串行执行，避免并发争抢
    private val thread = HandlerThread("image-decode").apply { start() }
    private val handler = Handler(thread.looper)

    fun load(path: String, callback: (Bitmap?) -> Unit) {
        handler.post {
            val bitmap = decode(path)
            // 切回主线程回调
            mainHandler.post { callback(bitmap) }
        }
    }
}
```

## 3. 源码解析

```java
// HandlerThread 源码（核心）
public class HandlerThread extends Thread {

    @Override
    public void run() {
        mTid = Process.myTid();
        Looper.prepare();          // ① 创建 Looper（ThreadLocal 绑定本线程）
        synchronized (this) {
            mLooper = Looper.myLooper();
            notifyAll();           // ② 唤醒等待 getLooper() 的线程
        }
        Process.setThreadPriority(mPriority);
        onLooperPrepared();        // ③ 回调（可在这里初始化）
        Looper.loop();             // ④ 进入消息循环（阻塞式）
        mTid = -1;
    }

    public Looper getLooper() {
        if (!isAlive()) return null;
        synchronized (this) {
            while (isAlive() && mLooper == null) {
                try {
                    wait();        // 等待 run() 中 notifyAll
                } catch (InterruptedException e) {}
            }
        }
        return mLooper;
    }
}
```

**关键点**：

1. `Looper.prepare()` 创建并绑定当前线程的 Looper。
2. `getLooper()` 会**阻塞等待**直到 Looper 创建完成（wait/notify 机制）。
3. `Looper.loop()` 是死循环，线程因此"永不结束"。
4. `quit()/quitSafely()` 退出循环。

## 4. 与普通 Thread 对比

| 维度 | Thread | HandlerThread |
| --- | --- | --- |
| 生命周期 | run() 结束即退出 | Looper 循环，直到 quit() |
| 复用性 | ❌ 一任务一线程 | ✅ 一个线程处理多个任务 |
| 任务队列 | ❌ 无 | ✅ MessageQueue 串行队列 |
| 线程切换 | 需手动 | Handler 天然支持 |
| 使用场景 | 单次任务 | 串行队列、长时间存活 |

## 5. SerialExecutor：AOSP 中的经典用法

`AsyncTask` 的串行执行器就是用 HandlerThread 实现的：

```java
// AsyncTask.SERIAL_EXECUTOR 内部（简化）
private static class SerialExecutor implements Executor {
    final ArrayDeque<Runnable> mTasks = new ArrayDeque<Runnable>();
    Runnable mActive;

    public synchronized void execute(final Runnable r) {
        mTasks.offer(new Runnable() {
            public void run() {
                try {
                    r.run();
                } finally {
                    scheduleNext();   // 执行完取下一个任务
                }
            }
        });
        if (mActive == null) scheduleNext();
    }

    protected synchronized void scheduleNext() {
        if ((mActive = mTasks.poll()) != null) {
            THREAD_POOL_EXECUTOR.execute(mActive);  // 单线程池
        }
    }
}
```

> 核心思想：**任务队列 + 单线程消费者** = 串行执行。HandlerThread 就是天然的实现。

## 6. 常见应用场景

```kotlin
// 场景1：数据库批量写入
class DbWriter(private val db: AppDatabase) {
    private val thread = HandlerThread("db-writer").apply { start() }
    private val handler = Handler(thread.looper)

    fun enqueue(users: List<User>) {
        handler.post { db.userDao().insertAll(users) }  // 串行写，避免并发锁
    }
}

// 场景2：传感器数据聚合
class SensorCollector {
    private val thread = HandlerThread("sensor").apply { start() }
    private val handler = Handler(thread.looper)

    fun start() {
        handler.post(object : Runnable {
            override fun run() {
                val data = readSensor()
                process(data)
                handler.postDelayed(this, 100)  // 每 100ms 轮询
            }
        })
    }
}
```

### 6.1 生命周期注意

```kotlin
override fun onDestroy() {
    super.onDestroy()
    handlerThread.quitSafely()   // 必须退出，否则线程泄漏
}
```

## 7. 高频面试题

**Q1：HandlerThread 和普通 Thread 的区别？**
A：HandlerThread 内部 `Looper.prepare()` + `Looper.loop()`，线程不结束、可接收
多个任务串行执行；普通 Thread run() 结束即销毁。HandlerThread 还自带
MessageQueue，任务自动排队。

**Q2：getLooper() 为什么会阻塞？**
A：Looper 是在 `run()` 中创建的，`start()` 返回时 Looper 可能还没创建完。
`getLooper()` 通过 wait/notify 等待 run() 中 `notifyAll()`，保证拿到的是有效的 Looper。

**Q3：quit() 和 quitSafely() 的区别？**
A：`quit()` 立即清空消息队列退出（已入队的消息丢弃）；`quitSafely()` 等队列中
**已有消息处理完**再退出（新消息不再接收）。推荐 `quitSafely()`。

**Q4：HandlerThread 能接收延迟消息吗？**
A：能。Handler 的 `postDelayed`/`sendMessageDelayed` 依赖 MessageQueue 的
`enqueueMessage` 时间排序，与是否 HandlerThread 无关。

**Q5：为什么说 HandlerThread 是"单线程串行队列"？**
A：一个 HandlerThread 只有一个 Looper、一个 MessageQueue、一个线程消费消息。
所有任务在同一个线程依次执行，天然串行（无并发竞争）。

## 8. 小结

- HandlerThread = 带 Looper 的可复用线程，任务串行排队执行。
- 源码核心：`Looper.prepare()` + `loop()` + getLooper 的 wait/notify。
- 记得 `quitSafely()` 防止线程泄漏。
- 面试重点：与 Thread 区别、getLooper 阻塞原因、quit 与 quitSafely。

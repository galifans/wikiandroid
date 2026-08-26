---
icon: person-running
title: AsyncTask 与 IntentService 原理
---

# AsyncTask 与 IntentService 原理

> AsyncTask 封装了 Thread 和 Handler，适合轻量级后台任务；IntentService 封装了 HandlerThread 和 Handler，适合高优先级后台任务。

## 一、AsyncTask 基本使用

| 方法 | 说明 |
| --- | --- |
| `onPreExecute()` | 异步任务执行前调用，做准备工作 |
| `doInBackground(Params...)` | 执行异步任务，可通过 `publishProgress` 更新进度 |
| `onProgressUpdate(...)` | 主线程中执行，后台任务进度改变时调用 |
| `onPostExecute(...)` | 主线程中执行，异步任务执行完之后 |

::: code-tabs

@tab:active Java

```java
public class DownloadTask extends AsyncTask<String, Integer, Boolean> {

    @Override
    protected void onPreExecute() {
        super.onPreExecute();
    }

    @Override
    protected Boolean doInBackground(String... strings) {
        return null;
    }

    @Override
    protected void onProgressUpdate(Integer... values) {
        super.onProgressUpdate(values);
    }

    @Override
    protected void onPostExecute(Boolean aBoolean) {
        super.onPostExecute(aBoolean);
    }
}
```

@tab Kotlin

```kotlin
class DownloadTask : AsyncTask<String, Int, Boolean>() {

    override fun onPreExecute() {
        super.onPreExecute()
    }

    override fun doInBackground(vararg strings: String): Boolean? {
        return null
    }

    override fun onProgressUpdate(vararg values: Int?) {
        super.onProgressUpdate(*values)
    }

    override fun onPostExecute(aBoolean: Boolean?) {
        super.onPostExecute(aBoolean)
    }
}
```

:::

**使用约束：**

1. AsyncTask 对象必须在 UI 线程中创建；
2. `execute()` 方法必须在 UI 线程中调用；
3. 不要手动调用四个回调方法；
4. 不能在 `doInBackground()` 中更改 UI 组件；
5. 一个任务实例只能执行一次，第二次执行抛异常；
6. `execute()` 让同进程中的 AsyncTask 串行执行，需要并行时调用 `executeOnExecutor`。

## 二、AsyncTask 工作原理

::: code-tabs

@tab:active Java

```java
@MainThread
public final AsyncTask<Params, Progress, Result> execute(Params... params) {
    return executeOnExecutor(sDefaultExecutor, params);
}
```

@tab Kotlin

```kotlin
@MainThread
fun execute(vararg params: Params): AsyncTask<Params, Progress, Result> {
    return executeOnExecutor(sDefaultExecutor, params)
}
```

:::

`execute()` 最终调用 `executeOnExecutor(sDefaultExecutor, params)`：

- 检查 `mStatus`：RUNNING 或 FINISHED 时抛 `IllegalStateException`；
- 置为 RUNNING，调用 `onPreExecute()`；
- `sDefaultExecutor` 执行 `mFuture`。

**核心三件套：**

| 组件 | 作用 |
| --- | --- |
| `SerialExecutor` | 串行线程池，用于任务排队 |
| `THREAD_POOL_EXECUTOR` | 真正执行任务的线程池 |
| `InternalHandler` | 将执行环境从线程池切换到主线程 |

`sDefaultExecutor` 是一个串行线程池，一个进程中的所有 AsyncTask 全部在该线程池排队执行。

`InternalHandler` 绑定主线程 Looper，通过 `MESSAGE_POST_RESULT` / `MESSAGE_POST_PROGRESS` 消息在主线程回调 `finish()` 与 `onProgressUpdate()`。

## 三、HandlerThread

HandlerThread 继承 Thread，但内部创建了消息队列，外界通过 Handler 消息方式通知它执行任务：

::: code-tabs

@tab:active Java

```java
@Override
public void run() {
    mTid = Process.myTid();
    Looper.prepare();
    synchronized (this) {
        mLooper = Looper.myLooper();
        notifyAll();
    }
    Process.setThreadPriority(mPriority);
    onLooperPrepared();
    Looper.loop();
    mTid = -1;
}
```

@tab Kotlin

```kotlin
override fun run() {
    mTid = Process.myTid()
    Looper.prepare()
    synchronized(this) {
        mLooper = Looper.myLooper()
        notifyAll()
    }
    Process.setThreadPriority(mPriority)
    onLooperPrepared()
    Looper.loop()
    mTid = -1
}
```

:::

普通的 Thread 主要用于在 run 方法中执行一个耗时任务，而 HandlerThread 通过 Handler 消息驱动，可处理多个串行任务，适合需要循环处理消息的场景（如本地文件 IO、数据库操作）。

## 四、IntentService

IntentService 用于执行后台耗时任务，任务执行后自动停止。由于是 Service，优先级比单纯线程高，适合执行高优先级后台任务。实现上封装了 HandlerThread 和 Handler。

**执行流程：**

::: code-tabs

@tab:active Java

```java
@Override
public void onCreate() {
    super.onCreate();
    HandlerThread thread = new HandlerThread("IntentService[" + mName + "]");
    thread.start();
    mServiceLooper = thread.getLooper();
    mServiceHandler = new ServiceHandler(mServiceLooper);
}
```

@tab Kotlin

```kotlin
override fun onCreate() {
    super.onCreate()
    val thread = HandlerThread("IntentService[$mName]")
    thread.start()
    mServiceLooper = thread.looper
    mServiceHandler = ServiceHandler(mServiceLooper)
}
```

:::

1. 第一次启动时在 `onCreate` 创建 HandlerThread，用其 Looper 构造 `mServiceHandler`；
2. 每次启动，`onStartCommand` 调用一次，内部调用 `onStart` 将 Intent 包装成 Message 发给 `mServiceHandler`；
3. `mServiceHandler` 收到消息后在 HandlerThread 中执行 `onHandleIntent(Intent)`；
4. 执行结束后调用 `stopSelf(startId)` 尝试停止服务。

**stopSelf 的区别：** `stopSelf()` 立即停止服务；`stopSelf(int startId)` 等待所有消息处理完毕后才终止服务。

## 五、对比总结

| 组件 | 封装 | 适用场景 | 特点 |
| --- | --- | --- | --- |
| AsyncTask | Thread + Handler | 轻量级后台任务 | 串行执行、回调主线程 |
| HandlerThread | Thread + Looper | 串行消息队列任务 | 可复用、需主动 quit |
| IntentService | HandlerThread + Handler + Service | 高优先级后台任务 | 任务完成自动停止 |
| 线程池 | Executor | 大量并发任务 | 复用线程、控制并发数 |

::: tip 建议
AsyncTask 已不建议使用（Google 在 API 30 标记废弃），新项目推荐协程或线程池。
:::

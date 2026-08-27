---
icon: workmanager
title: WorkManager 后台任务详解
description: WorkManager 适用场景、约束条件、任务链、周期性任务、与前台服务/协程对比
---

# WorkManager 后台任务详解

> 面试高频指数：高
> 后台任务调度是面试高频题，WorkManager 是官方推荐的"保证执行"型后台方案。

## 1. 适用场景

WorkManager 解决的是**可延迟、需要保证执行**的后台任务：

| ✓ 适合 | ✗ 不适合 |
| --- | --- |
| 数据同步（后台同步用户数据） | 即时任务（点击按钮立即上传） |
| 日志上传 | 精确时间任务（闹钟） |
| 图片压缩/上传 | 前台 UI 相关操作 |
| 定期数据清理 | 需要立即响应用户操作 |

判断是否该用 WorkManager 的关键问题只有一个：**这个任务能不能等？** 如果能接受"稍后执行、但必须执行"，就交给 WorkManager（系统会在合适时机调度，进程被杀也能恢复）；如果必须立即响应，就应该走协程、前台服务或闹钟。**点击按钮后立刻要看到结果的"即时任务"不是 WorkManager 的菜。**

## 2. 基础使用

### 2.1 定义 Worker

自定义 `Worker` 时只需要重写 `doWork()` 方法，它运行在 WorkManager 的后台线程中。返回值表达任务结局：`Result.success()` 表示成功结束，`Result.failure()` 表示不可重试的失败，`Result.retry()` 表示按退避策略稍后重试。传入参数通过 `getInputData()` 读取，一个 Worker 类的骨架如下：

::: code-tabs

@tab:active Java

```java
public class UploadWorker extends Worker {

    public UploadWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        try {
            // 执行任务（在后台线程）
            String url = getInputData().getString("url");
            if (url == null) return Result.failure();
            uploadFile(url);

            return Result.success();       // 成功
        } catch (IOException e) {
            return Result.retry();         // 失败重试（按 Backoff 策略）
        }
    }
}
```

@tab Kotlin

```kotlin
class UploadWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {

    override fun doWork(): Result {
        return try {
            // 执行任务（在后台线程）
            val url = inputData.getString("url") ?: return Result.failure()
            uploadFile(url)

            Result.success()       // 成功
        } catch (e: IOException) {
            Result.retry()         // 失败重试（按 Backoff 策略）
        }
    }
}
```

:::

### 2.2 提交任务

`OneTimeWorkRequest.Builder` 负责配置任务的"运行条件"：**约束（Constraints）** 决定何时才允许执行（需要网络、充电中、电量充足等），**退避（Backoff）** 决定失败后如何重试（线性或指数退避）。这些条件在 `enqueue()` 时注册进 WorkManager，系统只在条件满足时执行任务：

::: code-tabs

@tab:active Java

```java
OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(UploadWorker.class)
        .setInputData(new Data.Builder()
                .putString("url", "https://example.com/file")
                .build())
        .setConstraints(new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)  // 需要网络
                .setRequiresCharging(true)                      // 需要充电
                .setRequiresBatteryNotLow(true)                 // 电量充足
                .build())
        .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,   // 指数退避
                TimeUnit.SECONDS.toMillis(10))
        .build();

WorkManager.getInstance(context).enqueue(request);
```

@tab Kotlin

```kotlin
val request = OneTimeWorkRequestBuilder<UploadWorker>()
    .setInputData(workDataOf("url" to "https://example.com/file"))
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)  // 需要网络
            .setRequiresCharging(true)                      // 需要充电
            .setRequiresBatteryNotLow(true)                 // 电量充足
            .build()
    )
    .setBackoffCriteria(
        BackoffPolicy.EXPONENTIAL,   // 指数退避
        TimeUnit.SECONDS.toMillis(10)
    )
    .build()

WorkManager.getInstance(context).enqueue(request)
```

:::

### 2.3 观察结果

任务状态通过 `WorkInfo` 观察：`getWorkInfoByIdLiveData` 返回的 LiveData 会随状态变化推送最新信息。UI 层通常在这里根据 `SUCCEEDED`/`FAILED`/`RUNNING` 等状态刷新界面，也顺带读取任务上报的进度数据：

::: code-tabs

@tab:active Java

```java
WorkManager.getInstance(context)
        .getWorkInfoByIdLiveData(request.getId())
        .observe(this, workInfo -> {
            if (workInfo == null) return;
            switch (workInfo.getState()) {
                case SUCCEEDED: showSuccess(); break;
                case FAILED: showFailed(); break;
                case RUNNING: showProgress(workInfo.getProgress()); break;
                default: break;
            }
        });
```

@tab Kotlin

```kotlin
WorkManager.getInstance(context)
    .getWorkInfoByIdLiveData(request.id)
    .observe(this) { workInfo ->
        when (workInfo.state) {
            WorkInfo.State.SUCCEEDED -> showSuccess()
            WorkInfo.State.FAILED -> showFailed()
            WorkInfo.State.RUNNING -> showProgress(workInfo.progress)
            else -> {}
        }
    }
```

:::

## 3. 任务链（Chain）

任务链用于表达任务间的**依赖关系**：`beginWith` 声明起点（可以是一个或并行的多个），`then` 追加后续步骤——后续任务只在所有前置任务成功后才会启动，其中任何一个失败都会中断链条。典型的"压缩 → 上传 → 清理"流水线就是这么搭出来的：

::: code-tabs

@tab:active Java

```java
// 顺序执行：压缩 → 上传 → 清理
WorkManager.getInstance(context)
        .beginWith(compressWork)       // 第一步
        .then(uploadWork)              // 第二步（依赖第一步成功）
        .then(cleanupWork)             // 第三步
        .enqueue();

// 并行执行
WorkManager.getInstance(context)
        .beginWith(Arrays.asList(compressA, compressB))   // 并行
        .then(uploadWork)                                 // 都完成后执行
        .enqueue();
```

@tab Kotlin

```kotlin
// 顺序执行：压缩 → 上传 → 清理
WorkManager.getInstance(context)
    .beginWith(compressWork)       // 第一步
    .then(uploadWork)              // 第二步（依赖第一步成功）
    .then(cleanupWork)             // 第三步
    .enqueue()

// 并行执行
WorkManager.getInstance(context)
    .beginWith(listOf(compressA, compressB))   // 并行
    .then(uploadWork)                          // 都完成后执行
    .enqueue()
```

:::

## 4. 周期性任务

周期性任务用 `PeriodicWorkRequestBuilder` 创建，注意两个特性：一是**最小间隔 15 分钟**，更短的周期会被忽略；二是实际执行时间不精确——系统会结合 Doze 等省电机制自行安排，因此它适合"定期同步"而非"定点闹钟"。搭配 `enqueueUniquePeriodicWork` 可保证全局只有一份周期任务：

::: code-tabs

@tab:active Java

```java
PeriodicWorkRequest periodicRequest = new PeriodicWorkRequest.Builder(
        SyncWorker.class,
        6, TimeUnit.HOURS          // 最小间隔 15 分钟
)
        .setConstraints(new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.UNMETERED)  // Wi-Fi
                .setRequiresCharging(true)
                .build())
        .build();

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        "sync_work",
        ExistingPeriodicWorkPolicy.UPDATE,   // 更新已存在的任务
        periodicRequest
);
```

@tab Kotlin

```kotlin
val periodicRequest = PeriodicWorkRequestBuilder<SyncWorker>(
    6, TimeUnit.HOURS          // 最小间隔 15 分钟
)
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.UNMETERED)  // Wi-Fi
            .setRequiresCharging(true)
            .build()
    )
    .build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "sync_work",
    ExistingPeriodicWorkPolicy.UPDATE,   // 更新已存在的任务
    periodicRequest
)
```

:::

## 5. 高级特性

### 5.1 唯一任务（避免重复）

同一用户快速多次触发上传时，普通 `enqueue` 会产生多份重复任务。`enqueueUniqueWork` 以唯一名称登记任务，并通过 `ExistingWorkPolicy` 决定冲突策略：`KEEP` 保留旧任务、`REPLACE` 用新任务替换、`APPEND` 让新任务排队等待：

::: code-tabs

@tab:active Java

```java
WorkManager.getInstance(context).enqueueUniqueWork(
        "upload_" + userId,
        ExistingWorkPolicy.REPLACE,   // KEEP / APPEND / REPLACE
        uploadRequest
);
```

@tab Kotlin

```kotlin
WorkManager.getInstance(context).enqueueUniqueWork(
    "upload_${userId}",
    ExistingWorkPolicy.REPLACE,   // KEEP / APPEND / REPLACE
    uploadRequest
)
```

:::

### 5.2 取消任务

::: code-tabs

@tab:active Java

```java
WorkManager.getInstance(context).cancelWorkById(workId);
WorkManager.getInstance(context).cancelUniqueWork("sync_work");
WorkManager.getInstance(context).cancelAllWork();
```

@tab Kotlin

```kotlin
WorkManager.getInstance(context).cancelWorkById(workId)
WorkManager.getInstance(context).cancelUniqueWork("sync_work")
WorkManager.getInstance(context).cancelAllWork()
```

:::

### 5.3 进度上报

长任务的进度可以通过 `setProgress` 上报，配合 `getWorkInfoByIdLiveData` 观察即可实时驱动进度条。注意 `setProgress` 只能在任务运行中调用，且每次调用都会触发一次 WorkInfo 更新：

::: code-tabs

@tab:active Java

```java
public class DownloadWorker extends Worker {

    public DownloadWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        // 对应 CoroutineWorker + repeat/delay：Java 中用循环 + Thread.sleep
        for (int i = 0; i < 10; i++) {
            setProgress(new Data.Builder()
                    .putInt("progress", (i + 1) * 10)
                    .build());
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                return Result.retry();
            }
        }
        return Result.success();
    }
}

// 观察进度
WorkManager.getInstance(context)
        .getWorkInfoByIdLiveData(workId)
        .observe(this, info -> {
            int progress = info.getProgress().getInt("progress", 0);
            progressBar.setProgress(progress);
        });
```

@tab Kotlin

```kotlin
class DownloadWorker(...) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        repeat(10) { i ->
            setProgress(workDataOf("progress" to (i + 1) * 10))
            delay(1000)
        }
        return Result.success()
    }
}

// 观察进度
WorkManager.getInstance(context)
    .getWorkInfoByIdLiveData(workId)
    .observe(this) { info ->
        val progress = info.progress.getInt("progress", 0)
        progressBar.progress = progress
    }
```

:::

### 5.4 CoroutineWorker（推荐）

生产环境更推荐用 `CoroutineWorker` 替代普通 `Worker`：`doWork()` 变成 suspend 函数，可以直接调用协程 API（`delay`、`withContext`），还自动绑定协程取消——任务被取消时协程随之取消，不会泄漏。普通 `Worker` 的 `doWork` 是同步阻塞式，写异步逻辑要自己处理线程：

::: code-tabs

@tab:active Java

```java
public class SyncWorker extends Worker {

    public SyncWorker(@NonNull Context appContext, @NonNull WorkerParameters params) {
        super(appContext, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        // 对应 withContext(Dispatchers.IO)：Worker.doWork 本身在后台线程执行
        try {
            syncData();
            return Result.success();
        } catch (Exception e) {
            return Result.retry();
        }
    }
}
```

@tab Kotlin

```kotlin
class SyncWorker(
    appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            syncData()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
```

:::

> `CoroutineWorker` 基于协程，任务自动绑定协程取消（`setForeground` 可更新进度）。

## 6. 对比总结

四个方案各有分工，核心差异看三个维度：能否延迟执行、能否保证执行（跨进程存活）、能否精确到点触发：

| 方案 | 延迟执行 | 保证执行 | 精确时间 | 场景 |
| --- | --- | --- | --- | --- |
| WorkManager | ✓ | ✓（系统调度） | ✗ | 可延迟后台任务 |
| AlarmManager | ✗ |  Doze 受限 | ✓ | 闹钟、定时提醒 |
| 前台服务 | ✗ | ✓ | ✗ | 用户感知的持续任务 |
| 协程 | ✗ | ✗（进程被杀即消失） | ✗ | 即时异步操作 |

**为什么 WorkManager 能"保证执行"？**
进程被杀后，任务持久化到数据库中；系统恢复时（开机、应用启动）重新调度执行。

## 7. 高频面试题

**Q1：WorkManager 和协程的区别？**
A：协程是进程内的异步机制，进程被杀就没了；WorkManager 任务**持久化到数据库**，
进程死亡后由系统重新调度，能跨进程/开机恢复执行。协程用于即时异步，WorkManager 用于后台保证执行。

**Q2：WorkManager 能替代前台服务吗？**
A：不能完全替代。前台服务有可见通知、保证进程优先级，适合用户感知的持续任务
（播放音乐、导航）；WorkManager 适合后台同步类任务。两者定位不同。

**Q3：PeriodicWorkRequest 最小间隔是多少？为什么？**
A：15 分钟。过短的周期任务会频繁唤醒设备浪费电量，且 Doze 模式下实际执行时间
由系统决定（可能延迟）。

**Q4：任务执行被系统杀掉了怎么办？**
A：Worker 返回 `Result.retry()` 或未返回结果时，任务按 `setBackoffCriteria` 策略
指数退避重试；WorkManager 数据库持久化保证任务不会丢。

**Q5：如何保证唯一任务不重复执行？**
A：`enqueueUniqueWork` + `ExistingWorkPolicy`：
`KEEP`（已有则忽略新任务）、`REPLACE`（替换）、`APPEND`（排到后面）。

## 8. 小结

- WorkManager = 可延迟 + 保证执行 + 系统最优调度。
- 核心 API：Worker/CoroutineWorker、Constraints、Chain、Periodic。
- 与前台服务、协程各司其职，面试要能讲清适用场景。

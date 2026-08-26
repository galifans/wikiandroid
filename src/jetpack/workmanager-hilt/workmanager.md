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

## 2. 基础使用

### 2.1 定义 Worker

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

### 2.2 提交任务

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

### 2.3 观察结果

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

## 3. 任务链（Chain）

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

## 4. 周期性任务

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

## 5. 高级特性

### 5.1 唯一任务（避免重复）

```kotlin
WorkManager.getInstance(context).enqueueUniqueWork(
    "upload_${userId}",
    ExistingWorkPolicy.REPLACE,   // KEEP / APPEND / REPLACE
    uploadRequest
)
```

### 5.2 取消任务

```kotlin
WorkManager.getInstance(context).cancelWorkById(workId)
WorkManager.getInstance(context).cancelUniqueWork("sync_work")
WorkManager.getInstance(context).cancelAllWork()
```

### 5.3 进度上报

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

### 5.4 CoroutineWorker（推荐）

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

> `CoroutineWorker` 基于协程，任务自动绑定协程取消（`setForeground` 可更新进度）。

## 6. 对比总结

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

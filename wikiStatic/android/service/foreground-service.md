---
icon: service
title: 前台服务与通知
description: 前台服务的使用场景、通知渠道、Android 8.0+ 限制与权限申请，以及后台启动限制的完整指南
---

# 🔔 前台服务与通知

> 面试高频指数：⭐⭐⭐⭐
> Android 8.0+ 对后台服务与通知的约束日益严格，前台服务是"保活 + 可见性"的官方正解。

## 1. 为什么需要前台服务

普通后台服务在以下场景会被系统限制或杀死：

- **Android 8.0（API 26）**：后台服务不能随意启动（`Context.startService` 抛 `IllegalStateException`）。
- **Android 9（API 28）**：前台服务必须申请 `FOREGROUND_SERVICE` 权限。
- **Android 12（API 31）**：前台服务启动增加限制（不能从后台启动大多数类型）。
- **Android 14（API 34）**：新增前台服务类型必须声明（如 `dataSync`、`mediaPlayback`）。

**前台服务 = 带常驻通知的服务**，通知让用户"看得到"，系统因此放宽了对它的限制。

## 2. 通知渠道（Notification Channel）

Android 8.0 起，所有通知**必须**关联一个渠道，否则通知不显示：

```kotlin
// 创建渠道（应用启动时执行一次）
val channel = NotificationChannel(
    CHANNEL_ID,          // 渠道 ID（全局唯一）
    "下载任务",           // 用户可见名称
    NotificationManager.IMPORTANCE_LOW  // 重要级别
).apply {
    description = "文件下载与进度通知"
    setSound(null, null)          // 前台服务建议静音
    enableVibration(false)
}

val manager = getSystemService(NotificationManager::class.java)
manager.createNotificationChannel(channel)
```

重要级别（`IMPORTANCE_*`）决定通知是否弹横幅/发声音：

| 级别 | 行为 |
| --- | --- |
| IMPORTANCE_HIGH | 横幅 + 声音 + 震动，可出现在锁屏 |
| IMPORTANCE_DEFAULT | 声音，无横幅 |
| IMPORTANCE_LOW | 无声音无横幅，状态栏可见 |
| IMPORTANCE_MIN | 折叠进抽屉，无声音 |

## 3. 启动前台服务（完整示例）

```kotlin
class DownloadService : Service() {

    override fun onCreate() {
        super.onCreate()
        startForeground(NOTIFICATION_ID, buildNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 处理业务（如开启协程下载）
        return START_STICKY
    }

    private fun buildNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("正在下载")
            .setContentText("progress 0%")
            .setSmallIcon(R.drawable.ic_download)
            .setContentIntent(pendingIntent)
            .setOngoing(true)          // 不可滑动清除
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val CHANNEL_ID = "download_channel"
        private const val NOTIFICATION_ID = 1001
    }
}
```

### 3.1 Manifest 声明（Android 14+ 必须指定类型）

```xml
<service
    android:name=".DownloadService"
    android:exported="false"
    android:foregroundServiceType="dataSync" />
```

Android 14（API 34）+ 常用类型：`dataSync`、`mediaPlayback`、`location`、`connectedDevice`、
`camera`、`microphone` 等。运行时还需申请对应权限（如 `FOREGROUND_SERVICE_DATA_SYNC`）。

### 3.2 启动服务

```kotlin
// Android 8+ 启动前台服务的推荐方式
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    startForegroundService(Intent(this, DownloadService::class.java))
} else {
    startService(Intent(this, DownloadService::class.java))
}
```

**注意**：`startForegroundService` 要求服务在 **5 秒内** 调用 `startForeground()`，
否则抛 `ForegroundServiceDidNotStartInTimeException`（ANR）。

## 4. 更新与移除通知

```kotlin
// 更新进度（服务内部）
val manager = getSystemService(NotificationManager::class.java)
manager.notify(NOTIFICATION_ID, newNotification(percent))

// 移除前台状态 + 清除通知
stopForeground(STOP_FOREGROUND_REMOVE)

// 或仅移除通知、保留前台状态
stopForeground(STOP_FOREGROUND_DETACH)

// 停止服务
stopSelf()
```

## 5. 后台启动限制（重点）

### 5.1 Android 12+ 的限制

Android 12 起，**从后台启动前台服务**被严格限制（`BackgroundActivityStartManager` 拦截），
以下场景允许例外：

- 用户可见操作（点击通知、Activity 回调）
- 高优先级 FCM 消息（`high_priority`）
- 系统广播（`BOOT_COMPLETED`、`LOCKED_BOOT_COMPLETED`、`MY_PACKAGE_REPLACED` 等豁免列表）
- 闹钟、Geofence 等场景

### 5.2 最佳实践

```kotlin
// 需要后台执行任务时，优先考虑 WorkManager（系统调度，无需前台）
val request = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(Constraints.Builder().setRequiresCharging(true).build())
    .build()
WorkManager.getInstance(this).enqueue(request)

// 只有当任务必须"长时间且用户可见"时才用前台服务
// 例如：下载、播放音乐、导航、录屏
```

## 6. 前台服务 vs WorkManager 对比

| 维度 | 前台服务 | WorkManager |
| --- | --- | --- |
| 用户可见 | 是（常驻通知） | 否 |
| 保活优先级 | 高 | 中（由系统调度） |
| 适用场景 | 下载/播放/导航 | 同步、上传、定时任务 |
| 电量策略 | 用户可感知 | Doze 模式下自动延迟 |
| 权限要求 | FOREGROUND_SERVICE + 类型权限 | 无 |

## 7. 高频面试题

**Q1：Android 8.0 之后为什么不能用后台 Service？**
A：后台服务常被滥用做"保活"，严重消耗内存与电量。Android 8.0 禁止后台启动服务
（`Context.startService` 抛异常），改为：前台服务（用户可见）或 JobScheduler/WorkManager（系统调度）。

**Q2：startForegroundService 与 startService 的区别？**
A：`startForegroundService` 是 8.0 后启动前台服务的专用入口，要求服务在 5 秒内调用
`startForeground()`，否则 ANR；`startService` 在 8.0+ 仅限应用处于前台时使用。

**Q3：通知渠道被用户关闭后，如何判断？**
A：

```kotlin
val channel = manager.getNotificationChannel(CHANNEL_ID)
if (channel.importance == NotificationManager.IMPORTANCE_NONE) {
    // 引导用户去系统设置打开
    val intent = Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS).apply {
        putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
        putExtra(Settings.EXTRA_CHANNEL_ID, CHANNEL_ID)
    }
    startActivity(intent)
}
```

**Q4：FCM 推送消息如何在不开启前台服务的情况下后台执行任务？**
A：使用 WorkManager 调度；或对高优先级消息走 FCM 的 `high_priority` + 前台服务组合，
但需遵守 Android 12+ 后台启动限制（`onMessageReceived` 中调用 `startForegroundService` 可能被拦截）。

## 8. 小结

- 前台服务 = Service + 常驻通知 +（Android 9+）权限 +（Android 14+）类型声明。
- 8.0+ 用 `startForegroundService` 启动，5 秒内必须 `startForeground()`。
- 能用 WorkManager 就别用前台服务；前台服务是"长时可见任务"的专属方案。

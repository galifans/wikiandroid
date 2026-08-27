---
icon: service
title: 前台服务与通知
description: 前台服务的使用场景、通知渠道、Android 8.0+ 限制与权限申请，以及后台启动限制的完整指南
---

# 前台服务与通知

> 面试高频指数：高
> Android 8.0+ 对后台服务与通知的约束日益严格，前台服务是"保活 + 可见性"的官方正解。

## 1. 为什么需要前台服务

普通后台服务在以下场景会被系统限制或杀死：

- **Android 8.0（API 26）**：后台服务不能随意启动（`Context.startService` 抛 `IllegalStateException`）。
- **Android 9（API 28）**：前台服务必须申请 `FOREGROUND_SERVICE` 权限。
- **Android 12（API 31）**：前台服务启动增加限制（不能从后台启动大多数类型）。
- **Android 14（API 34）**：新增前台服务类型必须声明（如 `dataSync`、`mediaPlayback`）。
- **Android 15（API 35）**：新增 **FGS 超时机制**——`dataSync` 等类型最长运行 6 小时，超时抛 `ForegroundServiceTimeoutException`（ANR）；且启动前台服务时**不能**同时启动定位/摄像头等新类型，必须先 `startForeground` 完成后再启动新的前台服务类型。

**前台服务 = 带常驻通知的服务**，通知让用户"看得到"，系统因此放宽了对它的限制。

## 1.1 前台服务类型总表（Android 14+）

各前台服务类型的用途与权限要求如下：

| 类型 | 用途 | 对应权限 |
|------|------|----------|
| `dataSync` | 数据同步/上传下载 | `FOREGROUND_SERVICE_DATA_SYNC` |
| `mediaPlayback` | 媒体播放（音视频） | `FOREGROUND_SERVICE_MEDIA_PLAYBACK` |
| `mediaProjection` | 屏幕录制/截图 | `FOREGROUND_SERVICE_MEDIA_PROJECTION`（+ 系统弹窗授权） |
| `location` | 后台定位 | `FOREGROUND_SERVICE_LOCATION` + `ACCESS_COARSE/FINE_LOCATION` |
| `connectedDevice` | 蓝牙/NFC/USB 等外设 | `FOREGROUND_SERVICE_CONNECTED_DEVICE` |
| `camera` | 后台相机 | `FOREGROUND_SERVICE_CAMERA` |
| `microphone` | 后台录音 | `FOREGROUND_SERVICE_MICROPHONE` |
| `phoneCall` | 通话相关 | `FOREGROUND_SERVICE_PHONE_CALL` |
| `shortService` | 短时任务（3 分钟上限） | `FOREGROUND_SERVICE_SHORT_SERVICE` |

::: warning Android 15 的 FGS 超时
`dataSync` / `mediaProcessing` 等类型从启动起 **6 小时**后强制终止并抛 `ForegroundServiceTimeoutException`；`shortService` 只有 **3 分钟**。需要超长时间运行的任务应设计为分段执行（配合 WorkManager 重新调度）或引导用户使用媒体会话等正规类型。
:::

## 2. 通知渠道（Notification Channel）

Android 8.0 起，所有通知**必须**关联一个渠道，否则通知不显示：

::: code-tabs

@tab:active Java

```java
// 创建渠道（应用启动时执行一次）
NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,          // 渠道 ID（全局唯一）
        "下载任务",           // 用户可见名称
        NotificationManager.IMPORTANCE_LOW  // 重要级别
);
channel.setDescription("文件下载与进度通知");
channel.setSound(null, null);          // 前台服务建议静音
channel.enableVibration(false);

NotificationManager manager = getSystemService(NotificationManager.class);
manager.createNotificationChannel(channel);
```

@tab Kotlin

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

:::

重要级别（`IMPORTANCE_*`）决定通知是否弹横幅/发声音：

| 级别 | 行为 |
| --- | --- |
| IMPORTANCE_HIGH | 横幅 + 声音 + 震动，可出现在锁屏 |
| IMPORTANCE_DEFAULT | 声音，无横幅 |
| IMPORTANCE_LOW | 无声音无横幅，状态栏可见 |
| IMPORTANCE_MIN | 折叠进抽屉，无声音 |

## 3. 启动前台服务（完整示例）

启动前台服务的完整示例代码如下：

::: code-tabs

@tab:active Java

```java
public class DownloadService extends Service {

    @Override
    public void onCreate() {
        super.onCreate();
        startForeground(NOTIFICATION_ID, buildNotification());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // 处理业务（如开启线程池下载）
        return START_STICKY;
    }

    private Notification buildNotification() {
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("正在下载")
                .setContentText("progress 0%")
                .setSmallIcon(R.drawable.ic_download)
                .setContentIntent(pendingIntent)
                .setOngoing(true)          // 不可滑动清除
                .build();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private static final String CHANNEL_ID = "download_channel";
    private static final int NOTIFICATION_ID = 1001;
}
```

@tab Kotlin

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

:::

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

启动前台服务的标准写法如下：

::: code-tabs

@tab:active Java

```java
// Android 8+ 启动前台服务的推荐方式
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    startForegroundService(new Intent(this, DownloadService.class));
} else {
    startService(new Intent(this, DownloadService.class));
}
```

@tab Kotlin

```kotlin
// Android 8+ 启动前台服务的推荐方式
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    startForegroundService(Intent(this, DownloadService::class.java))
} else {
    startService(Intent(this, DownloadService::class.java))
}
```

:::

**注意**：`startForegroundService` 要求服务在 **5 秒内** 调用 `startForeground()`，
否则抛 `ForegroundServiceDidNotStartInTimeException`（ANR）。

## 4. 更新与移除通知

通知的更新与移除写法如下：

::: code-tabs

@tab:active Java

```java
// 更新进度（服务内部）
NotificationManager manager = getSystemService(NotificationManager.class);
manager.notify(NOTIFICATION_ID, newNotification(percent));

// 移除前台状态 + 清除通知
stopForeground(STOP_FOREGROUND_REMOVE);

// 或仅移除通知、保留前台状态
stopForeground(STOP_FOREGROUND_DETACH);

// 停止服务
stopSelf();
```

@tab Kotlin

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

:::

## 5. 后台启动限制（重点）

### 5.1 Android 12+ 的限制

Android 12 起，**从后台启动前台服务**被严格限制（`BackgroundActivityStartManager` 拦截），
以下场景允许例外：

- 用户可见操作（点击通知、Activity 回调）
- 高优先级 FCM 消息（`high_priority`）
- 系统广播（`BOOT_COMPLETED`、`LOCKED_BOOT_COMPLETED`、`MY_PACKAGE_REPLACED` 等豁免列表）
- 闹钟、Geofence 等场景

### 5.2 开机自启的正确姿势（BOOT_COMPLETED）

开机自启的推荐实现如下：

::: code-tabs

@tab:active Java

```java
// 开机广播接收后，不能直接 startForegroundService？
// 可以，但必须立即 startForeground 且依赖系统广播豁免；
// 更稳妥：用 WorkManager 处理"开机后的初始化任务"
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            OneTimeWorkRequest workRequest =
                    new OneTimeWorkRequest.Builder(InitWorker.class).build();
            WorkManager.getInstance(context).enqueue(workRequest);
        }
    }
}
```

@tab Kotlin

```kotlin
// 开机广播接收后，不能直接 startForegroundService？
// 可以，但必须立即 startForeground 且依赖系统广播豁免；
// 更稳妥：用 WorkManager 处理"开机后的初始化任务"
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val workRequest = OneTimeWorkRequestBuilder<InitWorker>().build()
            WorkManager.getInstance(context).enqueue(workRequest)
        }
    }
}
```

:::

::: tip 注意
- `BOOT_COMPLETED` 广播在 Android 15 起默认**不再自动送达**（`RECEIVER_BOOT_COMPLETED` 权限改为"限制"级别），声明权限的同时需在应用被用户启动过至少一次后才有效。
- 开机后直接启动前台服务受限；使用 WorkManager + 前台服务组合是标准做法。
:::

### 5.3 前台服务通知必须可关闭的场景

用户可以从通知设置中关闭通知渠道，前台服务通知被关闭会导致服务异常。开发时注意：

::: code-tabs

@tab:active Java

```java
// 前台服务通知渠道建议使用低重要性 + 不可关闭的提示逻辑
NotificationChannel channel =
        new NotificationChannel(CHANNEL_ID, "前台服务", NotificationManager.IMPORTANCE_LOW);
channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
// 无法强制用户开启，只能引导
```

@tab Kotlin

```kotlin
// 前台服务通知渠道建议使用低重要性 + 不可关闭的提示逻辑
val channel = NotificationChannel(CHANNEL_ID, "前台服务", NotificationManager.IMPORTANCE_LOW)
channel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
// 无法强制用户开启，只能引导
```

:::

### 5.2 最佳实践

任务调度的最佳实践代码如下：

::: code-tabs

@tab:active Java

```java
// 需要后台执行任务时，优先考虑 WorkManager（系统调度，无需前台）
OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(SyncWorker.class)
        .setConstraints(new Constraints.Builder().setRequiresCharging(true).build())
        .build();
WorkManager.getInstance(this).enqueue(request);

// 只有当任务必须"长时间且用户可见"时才用前台服务
// 例如：下载、播放音乐、导航、录屏
```

@tab Kotlin

```kotlin
// 需要后台执行任务时，优先考虑 WorkManager（系统调度，无需前台）
val request = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(Constraints.Builder().setRequiresCharging(true).build())
    .build()
WorkManager.getInstance(this).enqueue(request)

// 只有当任务必须"长时间且用户可见"时才用前台服务
// 例如：下载、播放音乐、导航、录屏
```

:::

## 6. 前台服务 vs WorkManager 对比

前台服务与 WorkManager 的对比说明如下：

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

::: code-tabs

@tab:active Java

```java
NotificationChannel channel = manager.getNotificationChannel(CHANNEL_ID);
if (channel.getImportance() == NotificationManager.IMPORTANCE_NONE) {
    // 引导用户去系统设置打开
    Intent intent = new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS);
    intent.putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName());
    intent.putExtra(Settings.EXTRA_CHANNEL_ID, CHANNEL_ID);
    startActivity(intent);
}
```

@tab Kotlin

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

:::

**Q4：FCM 推送消息如何在不开启前台服务的情况下后台执行任务？**
A：使用 WorkManager 调度；或对高优先级消息走 FCM 的 `high_priority` + 前台服务组合，
但需遵守 Android 12+ 后台启动限制（`onMessageReceived` 中调用 `startForegroundService` 可能被拦截）。

## 8. 小结

- 前台服务 = Service + 常驻通知 +（Android 9+）权限 +（Android 14+）类型声明。
- 8.0+ 用 `startForegroundService` 启动，5 秒内必须 `startForeground()`。
- 能用 WorkManager 就别用前台服务；前台服务是"长时可见任务"的专属方案。

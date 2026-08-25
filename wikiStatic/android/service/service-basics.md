---
icon: service
title: Service 详解
---

# Service 详解：启动方式与绑定方式

> Service 是 Android 四大组件之一，用于在后台执行不提供 UI 的长时间任务。

## 一、Service 的两种使用方式

### 1. 启动式（startService）

```kotlin
// 启动
startService(Intent(this, DownloadService::class.java))

class DownloadService : Service() {
    override fun onBind(intent: Intent): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 执行后台任务
        return START_STICKY  // 被杀死后自动重建
    }
}
```

**生命周期**：`onCreate → onStartCommand → ... → onDestroy`
**特点**：不返回结果给调用方，任务完成后需自行 `stopSelf()`

#### onStartCommand 的三种返回值

| 返回值 | 行为 | 适用场景 |
|--------|------|----------|
| `START_NOT_STICKY` | 系统杀死服务后**不重建**（除非有挂起的 Intent 要传递） | 可随时重启的作业，最安全的选择 |
| `START_STICKY` | 系统杀死服务后**重建**并回调 `onStartCommand`，但 Intent 为 `null`（除非有挂起 Intent） | 不执行命令但需无限期运行的媒体播放类服务 |
| `START_REDELIVER_INTENT` | 系统杀死服务后**重建**并**重新传递最后一个 Intent**（挂起 Intent 依次传递） | 需要立即恢复的下载类作业 |

### 2. 绑定式（bindService）

```kotlin
val connection = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
        val myBinder = binder as MyService.MyBinder
        myBinder.startWork()
    }
    override fun onServiceDisconnected(name: ComponentName?) {}
}

bindService(intent, connection, Context.BIND_AUTO_CREATE)
```

**生命周期**：`onCreate → onBind → onUnbind → onDestroy`
**特点**：可与 Service 通信，最后一个客户端解绑时销毁

## 二、前台服务（Foreground Service）

Android 8.0+ 后台服务限制，长时间任务必须使用前台服务并显示通知：

```kotlin
val notification = NotificationCompat.Builder(this, CHANNEL_ID)
    .setContentTitle("下载中")
    .setSmallIcon(R.drawable.ic_download)
    .build()

startForeground(1, notification)
```

::: warning
- Android 12+ 启动前台服务需声明权限 `FOREGROUND_SERVICE`
- 特殊类型（定位、媒体播放等）还需声明 `FOREGROUND_SERVICE_LOCATION` 等
:::

## 三、AIDL 跨进程通信（IPC）

当 Service 运行在独立进程时（`android:process=":remote"`），需要 AIDL 传递自定义对象：

```aidl
// IRemoteService.aidl
interface IRemoteService {
    int getPid();
    void basicTypes(int anInt, long aLong, boolean aBoolean);
}
```

**进程通信方式对比**：

| 方式 | 适用场景 | 特点 |
|------|----------|------|
| Binder（AIDL） | 跨进程调用方法 | 高效、支持双向 |
| Messenger | 简单消息传递 | 基于 Handler，串行 |
| ContentProvider | 数据共享 | 适合结构化数据 |
| 广播 | 全局通知 | 单向、低频 |

## 四、面试高频追问

1. `startService` 与 `bindService` 能否同时使用？如何停止？
2. Service 在子线程执行任务会 ANR 吗？如何规避？
3. `IntentService` 与普通 Service 的区别？
4. 前台服务在 Android 12+ 的限制？

> 📖 进阶阅读：[AIDL 跨进程通信](aidl.md) | [Binder 机制详解](/system/binder/binder-mechanism.md)

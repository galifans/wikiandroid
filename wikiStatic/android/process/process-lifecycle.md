---
icon: sitemap
title: Android 进程与保活
---

# Android 进程与保活

> Android 通过进程管理来平衡内存与体验。本章梳理进程概念、五级生命周期、多进程注意事项以及进程保活方案。

## 一、进程概念

进程（Process）是计算机中程序关于某数据集合上的一次运行活动，是系统进行资源分配和调度的基本单位。

当某个应用组件启动且应用没有运行其他任何组件时，Android 系统会使用单个执行线程为应用启动新的 Linux 进程。默认情况下，同一应用的所有组件在相同的进程和线程（称为"主"线程）中运行。

四大组件（`activity`、`service`、`receiver`、`provider`）的清单文件条目均支持 `android:process` 属性，用于指定该组件应在哪个进程运行。

## 二、进程生命周期（五级）

| 级别 | 条件 | 被杀优先级 |
| --- | --- | --- |
| 前台进程 | 托管用户正在交互的 Activity（已执行 `onResume()`）；托管绑定到交互 Activity 的 Service；托管正在前台运行的 Service（已调用 `startForeground()`）；托管正在执行生命周期回调的 Service；托管正在执行 `onReceive()` 的 BroadcastReceiver | 最后被杀 |
| 可见进程 | 托管不在前台但仍对用户可见的 Activity（已调用 `onPause()`）；托管绑定到可见 Activity 的 Service | 次之 |
| 服务进程 | 正在运行已用 `startService()` 启动的服务，且不属于上述两类 | 再次 |
| 后台进程 | 包含对用户不可见的 Activity（已调用 `onStop()`），保存在 LRU 列表中，最近查看的进程最后被终止 | 较前 |
| 空进程 | 不含任何活动应用组件，仅作缓存以缩短下次启动时间 | 最先被杀 |

**避免后台进程被杀的方法：**

1. 调用 `startForeground()`，让 Service 所在进程成为前台进程。
2. Service 的 `onStartCommand()` 返回 `START_STICKY` 或 `START_REDELIVER_INTENT`。
3. 在 Service 的 `onDestroy()` 中重新启动自己。

## 三、多进程

如果四大组件中的任意一个使用了多进程，运行该组件时都会创建一个新的 Application 对象。可通过对当前进程加以判断来处理：

```java
public class MyApplication extends Application {

    @Override
    public void onCreate() {
        Log.d("MyApplication", getProcessName(android.os.Process.myPid()));
        super.onCreate();
    }

    /** 根据进程 ID 获取进程名 */
    public String getProcessName(int pid) {
        ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> processInfoList = am.getRunningAppProcesses();
        if (processInfoList == null) {
            return null;
        }
        for (ActivityManager.RunningAppProcessInfo processInfo : processInfoList) {
            if (processInfo.pid == pid) {
                return processInfo.processName;
            }
        }
        return null;
    }
}
```

**使用多进程带来的问题：**

- 静态成员和单例模式完全失效。
- 线程同步机制完全失效。
- SharedPreferences 的可靠性下降。
- Application 会多次创建。

## 四、进程存活与 OOM_ADJ

系统通过 ADJ（Adjustment）值决定进程被杀顺序，值越小优先级越高：

| ADJ 级别 | 取值 | 解释 |
| --- | --- | --- |
| NATIVE_ADJ | -17 | native 进程（不被系统管理） |
| SYSTEM_ADJ | -16 | 系统进程 |
| PERSISTENT_PROC_ADJ | -12 | 系统 persistent 进程，如 telephony |
| PERSISTENT_SERVICE_ADJ | -11 | 关联着系统或 persistent 进程 |
| FOREGROUND_APP_ADJ | 0 | 前台进程 |
| VISIBLE_APP_ADJ | 1 | 可见进程 |
| PERCEPTIBLE_APP_ADJ | 2 | 可感知进程，如后台音乐播放 |
| BACKUP_APP_ADJ | 3 | 备份进程 |
| HEAVY_WEIGHT_APP_ADJ | 4 | 后台的重量级进程 |
| SERVICE_ADJ | 5 | 服务进程 |
| HOME_APP_ADJ | 6 | Home 进程 |
| PREVIOUS_APP_ADJ | 7 | 上一个 App 的进程（往往通过按返回键） |
| SERVICE_B_ADJ | 8 | B List 中的 Service（较老、使用可能性更小） |
| CACHED_APP_MIN_ADJ | 9 | 不可见进程 adj 最小值 |
| CACHED_APP_MAX_ADJ | 15 | 不可见进程 adj 最大值 |
| UNKNOWN_ADJ | 16 | 一般指将要变成缓存进程，无法确定值 |

## 五、进程保活方案

- **开启一个像素的 Activity：** 使用透明 Activity 将进程提升为前台进程（已被系统限制）。
- **使用前台服务：** `startForeground()` 通知系统该进程有用户感知的前台服务。
- **多进程相互唤醒：** 多进程互拉，一个被杀另一个拉起。
- **JobScheduler 唤醒：** 利用系统 JobScheduler 周期性调度任务唤醒。
- **粘性服务 & 与系统服务捆绑：** 返回 `START_STICKY`，或与系统级服务绑定。

> 注意：Android 8.0 之后系统对后台服务、隐式广播等限制越来越严，传统的保活手段大多失效。合理做法是使用前台服务 + 引导用户加入电池优化白名单。

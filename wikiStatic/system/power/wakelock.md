---
icon: power
title: WakeLock 与唤醒机制
description: WakeLock 类型详解、超时与释放、泄露检测、唤醒源、内核 wakelock
---

# WakeLock 与唤醒机制

> 面试高频指数：中
> WakeLock 是应用与电源管理的直接接口。滥用它会显著增加功耗，面试常问类型、超时与泄露排查。

## 1. WakeLock 是什么

```text
WakeLock：应用向系统申请"保持唤醒"的锁

本质：
- 计数器机制（PMS 内维护）
- 有锁 → 系统不进入休眠/不灭屏
- 全部释放 → 可正常休眠

来源：
应用获取 → PMS.addWakeLock
内核也有 wakelock（驱动用）
```

## 2. 类型详解

### 2.1 官方类型

| 类型 | 标志 | CPU | 屏幕 | 键盘 |
|------|------|-----|------|------|
| PARTIAL_WAKE_LOCK | 0x1 | 保持 | 可灭 | 可灭 |
| SCREEN_DIM_WAKE_LOCK | 0x6 | 保持 | 变暗 | 可灭 |
| SCREEN_BRIGHT_WAKE_LOCK | 0xa | 保持 | 点亮 | 可灭 |
| FULL_WAKE_LOCK | 0x1a | 保持 | 点亮 | 点亮 |
| PROXIMITY_SCREEN_OFF_WAKE_LOCK | 0x20 | — | 距离传感器控制 | — |

```text
注意：
- SCREEN_*/FULL 类型已被标记为 deprecated
- Android 5.0+ 屏幕唤醒应由应用内 FLAG_KEEP_SCREEN_ON 管理
- PARTIAL 是唯一推荐长期持有的锁
```

### 2.2 权限要求

```text
使用 WakeLock 需要权限：
<uses-permission android:name="android.permission.WAKE_LOCK" />

系统应用可申请更多类型；
普通应用通常只允许 PARTIAL。
```

## 3. 获取与释放

### 3.1 标准用法

```java
PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
PowerManager.WakeLock wl = pm.newWakeLock(
        PowerManager.PARTIAL_WAKE_LOCK, "myapp:upload");
wl.setReferenceCounted(false); // 避免计数混乱
wl.acquire(30 * 60 * 1000L);   // 超时 30 分钟自动释放
try {
    doUpload();
} finally {
    if (wl.isHeld()) {
        wl.release();
    }
}
```

### 3.2 引用计数

```text
setReferenceCounted(true)（默认）：
- 多次 acquire 需等量 release
- 计数归零才真正释放

setReferenceCounted(false)：
- 一次 release 即释放
- 适合简单的持有/释放场景

建议：固定为 false 或严格配对 acquire/release
```

## 4. 泄露与排查

### 4.1 泄露危害

```text
WakeLock 泄露后果：
- CPU 无法休眠 → 电量快速消耗
- 设备发热
- 系统续航统计显示异常

常见泄露场景：
- 异步任务 release 忘记调用
- 异常分支未释放
- 服务被杀死前未清理
```

### 4.2 排查手段

```text
排查 WakeLock 泄露：
① dumpsys power
   查看 WAKE LOCKS 列表（谁持有、持有多久）
② dumpsys battery_stats
   查看各应用唤醒次数与时长
③ Battery Historian / bugreport 分析
④ 代码审查 acquire/release 配对

系统日志：
PowerManagerService: WakeLock acquired/released
（logcat 中可追踪获取释放时序）
```

## 5. 内核 wakelock

```text
内核 wakelock：
- 驱动通过 wake_lock/wake_unlock 保持系统唤醒
- /sys/power/wake_lock 可查看
- 内核 wakelock 异常会导致"无法休眠"

排查：
cat /sys/power/wake_lock
（查看当前持锁的内核组件）
常见：GPS/传感器/网络驱动/充电
```

## 6. 替代方案

| 场景 | 替代方案 | 说明 |
|------|----------|------|
| 后台任务 | WorkManager | 系统调度，自动休眠感知 |
| 长连接 | FCM 推送 | 服务器触发，避免长持锁 |
| 播放音频 | 前台服务 + 音频焦点 | 系统保障 |
| 屏幕常亮 | FLAG_KEEP_SCREEN_ON | 页面内管理 |
| 传感器 | Sensor 批处理 | 降低采样频率 |

```text
最佳实践总结：
- 尽量不用 WakeLock，用 WorkManager
- 必须用时：设置超时 + finally 释放
- 后台音乐/导航用前台服务（系统可见）
```

## 7. 高频面试题

**Q1：WakeLock 有哪些类型？各自作用？**
A：PARTIAL（保 CPU）、SCREEN_DIM/BRIGHT/FULL（保屏幕）、PROXIMITY（距离传感器控屏）。5.0+ 建议只用 PARTIAL。

**Q2：WakeLock 为什么会导致耗电？**
A：持锁期间系统无法进入深度休眠，CPU 持续工作，长时间持锁（尤其泄露）会显著增加功耗。

**Q3：如何防止 WakeLock 泄露？**
A：acquire 带超时、finally 中 release、WorkManager 替代；dumpsys power 检查持锁者与时长。

**Q4：引用计数 WakeLock 注意什么？**
A：默认计数模式要求 acquire/release 严格配对；也可 setReferenceCounted(false) 简化为一次释放。

**Q5：内核 wakelock 是什么？**
A：驱动层保持系统唤醒的锁，通过 /sys/power/wake_lock 查看；内核持锁异常会导致系统无法休眠、耗电异常。

## 8. 小结

- WakeLock 是应用向系统申请保持唤醒的机制。
- PARTIAL 是主要类型，屏幕锁已废弃。
- 超时 + finally 释放 + WorkManager 是最佳实践。
- dumpsys power / battery_stats 排查泄露。
- 内核 wakelock 异常同样导致耗电。

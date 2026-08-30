---
icon: power
title: 电源管理架构
description: PowerManagerService、电源状态机、亮屏流程、DisplayManager、深度休眠
---

# 电源管理架构

> 面试高频指数：中
> Android 电源管理决定设备何时亮屏、何时休眠，是功耗与续航的调度中枢。WakeLock、Doze、省电模式都挂在它下面。

## 1. 电源管理全景

```text
电源管理核心组件：

应用层：PowerManager / PowerManager.WakeLock
  ↓
Framework：PowerManagerService（PMS）
  ↓
Native：PowerManagerService native（power HAL 接口）
  ↓
HAL：power HAL（电源提示、交互状态）
  ↓
内核：Linux Power Management
       （suspend / wakelock / state_notifier）
```

## 2. PowerManagerService

### 2.1 服务职责

```text
PMS 核心职责：
① 维护电源状态（Awake/Doze/Sleep/Off）
② WakeLock 管理与超时
③ 屏幕亮灭控制（与 DisplayManager 协作）
④ 交互状态通知（userActivity）
⑤ 省电模式与 Doze 调度
⑥ 电池状态监听（BatteryService）
```

### 2.2 状态机

```text
电源状态流转：

AWAKEN（亮屏）──userActivity──> DOZE（息屏待机）
   ↑                          （可选，深省电）
   └──────唤醒事件────────┘
DOZE ──超时/省电──> SLEEP（深度休眠）
SLEEP ──唤醒源──> AWAKEN

关键概念：
- userActivity：用户交互触发（触摸/按键）
- sleepTimeout：无操作自动休眠
- 唤醒源：电源键/闹钟/来电/传感器
```

## 3. 亮屏与灭屏

### 3.1 亮屏流程

```text
亮屏链路：
用户操作（触摸/电源键）
→ 内核 input 事件
→ InputDispatcher → PMS 通知 userActivity
→ PMS 请求 DisplayManager 开屏
→ DisplayPowerController
→ 点亮背光 + 状态机更新
→ 通知 WindowManager 显示

关键：屏幕点亮前系统处于低功耗状态，
事件唤醒需要快速响应（体现启动速度）
```

### 3.2 灭屏流程

```text
灭屏触发：
- sleepTimeout 超时
- 电源键
- 省电策略

灭屏后：
- 屏幕断电（DisplayPowerState）
- 应用进入 onPause/onStop
- 系统进入 Doze（可选）
- CPU 可进入低功耗/休眠
```

## 4. WakeLock 机制

### 4.1 WakeLock 类型

| 类型 | 作用 | 屏幕 | CPU |
|------|------|------|-----|
| PARTIAL_WAKE_LOCK | 保持 CPU 运行 | 熄灭 | 保持 |
| SCREEN_DIM_WAKE_LOCK | 屏幕变暗 | 变暗 | 保持 |
| SCREEN_BRIGHT_WAKE_LOCK | 屏幕常亮 | 点亮 | 保持 |
| FULL_WAKE_LOCK | 全亮 | 点亮 | 保持 |

```text
注意：
- SCREEN_* 类型 Android 5.0+ 已不建议使用
  （屏幕应由应用自行管理）
- 推荐使用 PARTIAL + 屏幕管理分离
- 需配合权限 android.permission.WAKE_LOCK
```

### 4.2 获取与释放

```java
PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
PowerManager.WakeLock wl = pm.newWakeLock(
        PowerManager.PARTIAL_WAKE_LOCK, "app:download");
wl.acquire(10 * 60 * 1000L); // 超时自动释放（防泄露）
try {
    // 耗时任务
} finally {
    wl.release(); // 必须释放
}
```

```text
最佳实践：
- acquire 设置超时参数
- finally 中 release
- 使用 WorkManager 替代长任务保活
- 检测泄露：dumpsys power 查看 WakeLock 列表
```

## 5. DisplayManager

### 5.1 显示服务

```text
DisplayManagerService（DMS）
管理显示设备与屏幕状态

- DisplayPowerController：背光与电源状态
- 多屏支持（内置/HDMI/无线投屏）
- 亮度调节（自动/手动）
- 屏幕超时策略

与 PMS 协作：
PMS 决定"是否亮"，DMS 决定"怎么亮"
```

## 6. 深度休眠与唤醒

```text
深度休眠（suspend）：
- 无唤醒源且系统空闲
- CPU 挂起，仅保留唤醒源电路
- 唤醒源：RTC 闹钟/电源键/传感器/网络（部分）

Android 对 suspend 的约束：
- 有 WakeLock 时不允许深度休眠
- Doze 期间周期性唤醒处理任务
- 闹钟通过 AlarmManager 在唤醒窗口触发
```

## 7. 高频面试题

**Q1：PowerManagerService 的作用？**
A：维护电源状态机、管理 WakeLock、控制屏幕亮灭、调度 Doze 与省电模式，是电源管理的核心服务。

**Q2：WakeLock 有哪些类型？**
A：PARTIAL（只保 CPU）、SCREEN_DIM/BRIGHT/FULL（保屏幕）。Android 5.0+ 建议只使用 PARTIAL，屏幕交给应用管理。

**Q3：WakeLock 怎么防止泄露？**
A：acquire 时设置超时、finally 中 release、用 WorkManager 替代长任务；用 dumpsys power 检查泄露。

**Q4：屏幕亮灭由谁控制？**
A：PMS 决策电源状态，DisplayPowerController（DMS 内）执行点亮/熄灭与背光控制。

**Q5：深度休眠是什么？何时进入？**
A：系统空闲且无 WakeLock 时 CPU 挂起的低功耗状态，仅保留唤醒源；Doze 用周期唤醒窗口处理闹钟等任务。

## 8. 小结

- PMS 是电源管理中枢，维护状态机与 WakeLock。
- 亮灭屏由 PMS + DMS（DisplayPowerController）协作。
- WakeLock 类型与超时释放是防耗电关键。
- 深度休眠需无 WakeLock 且系统空闲。
- dumpsys power 是排查功耗问题的主要工具。

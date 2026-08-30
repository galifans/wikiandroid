---
icon: power
title: Doze 模式与电池优化
description: Doze 状态机、待机限制、App Standby、省电白名单、JobScheduler 适配
---

# Doze 模式与电池优化

> 面试高频指数：中
> Doze（打盹）与 App Standby 是 Android 6.0 起的系统级省电机制。面试高频：Doze 的限制范围、白名单、以及应用如何适配。

## 1. Doze 是什么

```text
Doze（打盹模式）Android 6.0（API 23）引入

目标：设备长时间静止时大幅降低功耗

触发条件：
- 设备静止（未移动）
- 屏幕熄灭
- 未充电

效果：延迟后台任务、限制网络、合并唤醒
```

## 2. Doze 状态机

```text
Doze 状态流转：

ACTIVE（活跃）
  → 静止 + 灭屏 + 未充电
  → INACTIVE（进入待机候选）
  → 维持 30 分钟
  → IDLE（深度打盹）

IDLE 期间：
- 禁止网络访问（除白名单）
- 延迟 Job/Alarm
- 周期性维护窗口（maintenance window）
  约每 30 分钟一次，窗口内恢复网络执行任务

退出条件：
- 设备移动
- 屏幕点亮
- 充电
```

| 状态 | 行为 |
|------|------|
| ACTIVE | 正常 |
| INACTIVE | 待机候选，屏幕熄灭 |
| IDLE_PENDING | 预打盹 |
| IDLE | 深度打盹，限制网络与任务 |
| IDLE_MAINTENANCE | 维护窗口，短暂恢复 |

## 3. 待机限制（App Standby）

```text
App Standby（应用待机）：
按"不活跃时间"将应用分为活跃/待机

活跃标准：
- 用户主动打开（前台）
- 有前台服务/可见组件
- 用户交互

待机应用限制：
- 网络访问受限
- Job/Alarm 延迟
- 推送受限（白名单除外）

与 Doze 区别：
- Doze 针对整机（设备级）
- App Standby 针对单个应用
```

## 4. 白名单机制

### 4.1 电池优化白名单

```java
PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
// 查询是否被豁免
boolean ignored = pm.isIgnoringBatteryOptimizations(packageName);
// 申请豁免（需 ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS）
Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
intent.setData(Uri.parse("package:" + getPackageName()));
startActivity(intent);
```

```text
注意：
- 白名单需用户确认，Google Play 政策限制
- 适合：闹钟/即时通讯/导航类应用
- 滥用白名单会被商店下架
```

### 4.2 可改变系统设置

```text
部分应用可请求"可改变系统设置"
（ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS 之外）
- 获取 SYSTEM_ALERT_WINDOW 权限的应用
- 影响 Doze 网络限制

实际适配重点：
- 用 FCM 高优先级消息
- 用 WorkManager 约束
- 前台服务保活（播放/导航）
```

## 5. 应用适配策略

### 5.1 消息推送

```text
Doze 下的推送适配：
① FCM 高优先级推送（data 消息）
   可唤醒设备（少量豁免）
② 合并推送：多个通知批量发送
③ 避免长连接心跳频繁

Doze 内网络行为：
- IDLE 期间 socket 可能断开
- 维护窗口到来时重连
```

### 5.2 后台任务

```text
任务调度适配：
- 使用 WorkManager（系统感知 Doze）
- 设置约束（充电/网络）
- 设置退避策略（指数退避）
- 避免固定时间任务（Alarm 会被延迟）

AlarmManager 适配：
- setAndAllowWhileIdle：Doze 下可触发（每应用 9 分钟/次窗口限制）
- setExactAndAllowWhileIdle：精确唤醒（受限）
- 闹钟类应用合理使用
```

## 6. 省电模式（Battery Saver）

```text
Battery Saver（省电模式）：
用户手动开启/低电量自动开启

限制：
- 限制后台活动
- 降低屏幕亮度/刷新率
- 限制定位
- 冻结后台应用（Android 12+）
- 暂停动画

与 Doze 关系：
- 省电模式可加速进入 Doze
- 白名单应用部分豁免
```

## 7. 高频面试题

**Q1：Doze 模式是什么？触发条件？**
A：Android 6.0 引入的整机省电机制：设备静止 + 屏幕熄灭 + 未充电时进入，限制网络与后台任务，周期性维护窗口执行任务。

**Q2：Doze 与 App Standby 区别？**
A：Doze 是设备级（整机省电）；App Standby 是应用级（按不活跃程度限制单应用网络与任务）。

**Q3：Doze 下推送怎么送达？**
A：FCM 高优先级消息可短暂唤醒；普通推送延迟到维护窗口；应用应尽量用 FCM 而非自建长连接。

**Q4：白名单怎么申请？**
A：Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS 申请豁免，需用户确认，Google Play 有政策限制，适合闹钟/IM/导航类。

**Q5：WorkManager 和 AlarmManager 在 Doze 下的行为？**
A：WorkManager 系统感知 Doze 自动适配；Alarm 默认延迟，setAndAllowWhileIdle 可在 Doze 触发但受窗口限制。

## 8. 小结

- Doze：设备级省电，限制网络与任务，维护窗口执行。
- App Standby：应用级待机限制。
- 白名单需用户确认且有政策限制。
- FCM 高优消息 + WorkManager 是标准适配。
- 省电模式加速 Doze 并冻结后台应用。

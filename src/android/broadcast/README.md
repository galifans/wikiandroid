---
icon: broadcast
title: BroadcastReceiver
---

# 📡 BroadcastReceiver

BroadcastReceiver 用于接收系统或应用发出的全局广播消息。

## 文章列表

- [BroadcastReceiver 详解](broadcast-basics.md)（待更新）
- [动态注册与静态注册对比](register-comparison.md)（待更新）

## 核心要点

1. **两种注册方式**：静态注册（Manifest，8.0+ 限制）/ 动态注册（代码）
2. **两种广播类型**：普通广播 / 有序广播（可拦截）
3. **本地广播**：`LocalBroadcastManager`（已废弃，推荐 LiveData/Flow）
4. **限制**：Android 8.0+ 隐式广播静态注册受限

## 常见系统广播

- `ACTION_BOOT_COMPLETED`（开机完成）
- `ACTION_BATTERY_CHANGED`（电量变化）
- `ACTION_SCREEN_ON/OFF`（屏幕亮灭）
- `CONNECTIVITY_ACTION`（网络变化）

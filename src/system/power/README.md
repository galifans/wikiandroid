---
icon: power
title: 电源与功耗
shortTitle: 概览
dir:
  text: 电源与功耗
  order: 8
---

# 电源与功耗

> PowerManagerService 电源状态机、WakeLock 唤醒机制、Doze 省电模式与电池优化适配。

## 文章列表

- [电源管理架构](power-architecture.md) — PMS / 电源状态机 / 亮灭屏 / 深度休眠
- [WakeLock 与唤醒机制](wakelock.md) — 类型 / 超时 / 泄露排查 / 内核 wakelock
- [Doze 模式与电池优化](doze-battery.md) — Doze 状态机 / App Standby / 白名单 / 适配

## 相关知识

- [cgroup 与低内存回收](../../system/os/cgroup-lmk.md) — 进程冻结与后台资源限制
- [进程优先级与回收](../../system/ams-wms/ams-process-priority.md) — 后台进程保活与回收

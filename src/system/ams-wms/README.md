---
icon: service
title: AMS / WMS
shortTitle: 概览
dir:
  text: AMS / WMS
  order: 2
---

# 🏢 AMS / WMS

系统核心服务：ActivityManagerService 与 WindowManagerService。

## 文章列表

- [AMS 与 Activity 启动流程](ams-activity-launch.md)
- [WMS 窗口管理原理](wms-principle.md)

## 核心要点

### AMS（ActivityManagerService）
1. 管理四大组件、进程、任务栈
2. Activity 启动流程的核心调度者
3. 进程优先级（OOM Adj）的决策者

### WMS（WindowManagerService）
1. 窗口管理：添加、更新、删除窗口
2. 窗口层级与 Z-order
3. SurfaceFlinger 调度与合成
4. 输入事件分发（InputDispatcher）

## 启动流程简版

```
startActivity → AMS.startActivity → 进程创建（Zygote fork）
→ ActivityThread.main → 创建 Activity → ViewRootImpl → 添加窗口
→ WMS 布局 → SurfaceFlinger 合成 → 首帧显示
```

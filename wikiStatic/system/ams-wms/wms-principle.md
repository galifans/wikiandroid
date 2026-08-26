---
icon: service
title: WMS 窗口管理原理
description: WMS 职责、Window/WindowManager/WindowManagerService 关系、窗口层级 Z-order、SurfaceFlinger 合成、输入事件分发
---

# WMS 窗口管理原理

> 面试高频指数：高
> WMS 是窗口系统的核心，理解 Window 到 Surface 的链路是关键。

## 1. WMS 是什么

```text
WMS（WindowManagerService）
运行在 SystemServer 进程的系统服务

主要职责：
① 窗口管理：添加/更新/删除窗口
② 窗口层级：计算 Z-order（窗口叠加顺序）
③ 输入事件：InputDispatcher 将事件分发给目标窗口
④ 动画：窗口切换动画协调
⑤ 与 SurfaceFlinger 协作合成画面
```

## 2. Window 相关概念

```text
Window：抽象概念（不是 View），"窗口"的模型
  - PhoneWindow：Activity 中的 Window 实现
  - 每种窗口有 type 与 flags

WindowManager：应用侧接口
  - WindowManager.addView() 添加窗口（如悬浮窗）
  - 通过 Binder 调用 WMS

WindowManagerService：系统侧实现
  - 管理 WindowState（窗口状态）
```

```kotlin
// 应用侧添加窗口（悬浮窗示例）
val params = WindowManager.LayoutParams(
    WindowManager.LayoutParams.WRAP_CONTENT,
    WindowManager.LayoutParams.WRAP_CONTENT,
    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,   // 类型
    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,        // 标志
    PixelFormat.TRANSLUCENT
)
windowManager.addView(floatView, params)
```

## 3. 窗口类型与 Z-order

```text
窗口类型（决定层级）：
① 应用窗口（1-99）：Activity 窗口
② 子窗口（1000-1999）：Dialog、PopupWindow（依附父窗口）
③ 系统窗口（2000-2999）：Toast、状态栏、输入法、悬浮窗

层级（从低到高）：
应用窗口 < 子窗口 < 系统窗口
同类型内：按 addView 顺序与焦点状态排序
```

**Z-order 计算**：WMS 维护 `mWindowMap` 与 `mWindows`（有序列表），
每次 add/remove 时重排。`WindowState` 有 `mBaseLayer`（类型决定）+ 
`mSubLayer`（子窗口）决定最终顺序。

## 4. 窗口添加流程

```text
应用进程：WindowManager.addView()
  → WindowManagerGlobal.addView()
  → 创建 ViewRootImpl
  → ViewRootImpl.setView()
  → IWindowSession（Binder 代理）
  → WMS.addWindow()（系统进程）

WMS 处理：
  → 校验（token、权限）
  → 创建 WindowState
  → 计算 Z-order
  → 请求 SurfaceFlinger 创建 Surface
  → 开始渲染
```

## 5. 渲染链路

```text
应用进程（UI 线程）：
  ViewRootImpl.performTraversals()
  → measure/layout/draw
  → RenderThread 通过 HWUI 渲染到 Surface

SurfaceFlinger（系统进程）：
  → 接收各窗口的 Surface（BufferQueue）
  → 合成（Composition）
  → 送显（Display）

Vsync 驱动：
  Choreographer 接收 Vsync 信号
  → 通知应用开始绘制（16.6ms 一帧）
```

## 6. 输入事件分发

```text
InputManagerService（IMS）
  → InputReader（读取输入设备事件）
  → InputDispatcher（分发）

分发流程：
  InputDispatcher 找到目标窗口（根据触摸位置 + Z-order）
  → 通过 InputChannel（socket 对）发送事件
  → 应用进程 ViewRootImpl 接收
  → View.dispatchTouchEvent 事件分发
```

## 7. 高频面试题

**Q1：Window、WindowManager、WMS 的关系？**
A：Window 是抽象窗口模型（PhoneWindow 是 Activity 的实现）；WindowManager
是应用侧接口（addView/removeView，内部通过 Binder 调 WMS）；WMS 是系统侧
实现（管理 WindowState、层级、输入分发、与 SurfaceFlinger 协作）。

**Q2：如何实现悬浮窗？**
A：WindowManager.addView + TYPE_APPLICATION_OVERLAY 类型 + 悬浮窗权限
（SYSTEM_ALERT_WINDOW）。Android 8.0+ 统一用 TYPE_APPLICATION_OVERLAY，
且需在设置中授权。

**Q3：Dialog 的 Window 层级为什么高于 Activity？**
A：Dialog 是子窗口类型（TYPE_APPLICATION_PANEL，1000 区间），在 Z-order
中高于应用窗口。所以 Dialog 显示在 Activity 之上。

**Q4：windowBackground 能提升启动速度吗？**
A：不能减少实际启动耗时，但能给用户"秒开"的视觉反馈（启动瞬间显示
占位背景，替代白屏），是冷启动体验优化的常用手段。

**Q5：Surface 和 View 的关系？**
A：View 是 UI 模型（测量/布局/绘制），最终绘制到 Surface（BufferQueue
的生产者）；每个窗口有一个 Surface，由 SurfaceFlinger 合成显示。
ViewRootImpl 负责把 View 树渲染到 Surface。

## 8. 小结

- WMS 管理窗口生命周期与层级。
- 窗口类型决定 Z-order（应用 < 子 < 系统）。
- 渲染链路：View → HWUI → Surface → SurfaceFlinger → 屏幕。
- 输入链路：IMS → InputDispatcher → View 事件分发。
- 面试重点：窗口添加流程、Z-order、Surface 与合成。

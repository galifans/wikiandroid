---
icon: window
title: 《Android开发艺术探索》第八章笔记
---

# 《Android开发艺术探索》第八章：Window 机制

> Window 是 View 的直接管理者，理解 Window 的添加、删除、更新流程与创建过程是掌握 View 体系的关键。

## 一、Window 与 WindowManager

- `Window` 是抽象类，实现为 `PhoneWindow`；`WindowManager` 是访问 Window 的入口
- WindowManager 与 WindowManagerService 的交互是 **IPC 过程**
- Activity、Dialog、Toast 的视图都附加在 Window 上

### Flags 常用选项

| Flag | 作用 |
|------|------|
| `FLAG_NOT_FOCUSABLE` | 不获取焦点、不接收输入事件，事件传给下层 Window |
| `FLAG_NOT_TOUCH_MODAL` | 区域外点击事件传给底层 Window，区域内自己处理（一般都应开启） |
| `FLAG_SHOW_WHEN_LOCKED` | 显示在锁屏界面 |

### Type 三种类型

| 类型 | 层级范围 | 说明 |
|------|----------|------|
| 应用 Window | 1~99 | 对应 Activity |
| 子 Window | 1000~1999 | 不能独立存在，需附属父 Window（如 Dialog） |
| 系统 Window | 2000~2999 | 需声明权限才能创建（如 Toast、状态栏） |

Window 分层由 z-ordered 决定，层级大的覆盖小的（类似 HTML z-index）。

## 二、Window 内部机制

- Window 以 View 形式存在：每个 Window 对应一个 View 和一个 ViewRootImpl
- Window 的添加/更新/删除由 `WindowManagerImpl` 委托给 `WindowManagerGlobal`

### 添加过程

1. 校验参数，子 Window 调整布局参数
2. 创建 ViewRootImpl 并添加 View
3. 通过 ViewRootImpl 更新界面，完成添加

### 删除过程

`dispatchDetachedFromWindow` 四件事：清理数据与消息 → 通过 Session 调 WMS 的 `removeWindow`（IPC）→ 调用 `dispatchDetachedFromWindow` → 刷新 `mRoots/mParams/mDyingViews` 列表。

### 更新过程

更新 LayoutParams → `ViewRootImpl.setLayoutParams` → `scheduleTraversals` 重新布局（测量/布局/重绘）→ 通过 WindowSession 调 WMS 的 `relayoutWindow`（IPC）。

## 三、Window 的创建过程

### Activity

1. `performLaunchActivity` 创建 Activity 实例并 attach 上下文
2. Activity 实现 Window 的 Callback 接口（`dispatchTouchEvent` 等）
3. Window 由 Policy 创建为 PhoneWindow；`setContentView` 由 PhoneWindow 实现：创建 DecorView → 添加到 mContentParent → 回调 `onContentChanged`

### Dialog

- 同样通过 Policy 创建 PhoneWindow，初始化 DecorView 并添加视图
- 必须使用 **Activity 的 Context**（Dialog 需要应用 token，只有 Activity 拥有）

### Toast

- 内部两类 IPC：访问 NotificationManagerService、NMS 回调 Toast 的 TN 接口
- TN 是 Binder 类，运行在 Binder 线程池，需通过 Handler 切回发送线程，因此 **Toast 不能在无 Looper 的线程弹出**
- 非系统应用最多同时存在 50 个 ToastRecord（防 DoS 攻击）

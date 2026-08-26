---
icon: basics
title: 面试基础篇
---

# 面试高频题：基础篇

> 覆盖 Java/Kotlin、四大组件、View 体系等基础高频考点。

## 一、语言基础

### 1. `==` 与 `equals` 的区别？
- `==` 比较引用地址（基本类型比较值）
- `equals` 默认同 `==`，可重写（如 String 比较内容）

### 2. `String` 为什么不可变？
- 线程安全、常量池复用、安全性（参数传递）

### 3. HashMap 的实现原理？
- 数组 + 链表 + 红黑树（链表 ≥ 8 且容量 ≥ 64 转红黑树）
- 默认容量 16、负载因子 0.75、扩容为 2 倍

### 4. Kotlin 的 `val` 与 `var`？
- `val` 只读引用（不可重新赋值，对象内部可变）
- `var` 可变引用

### 5. 协程与线程的区别？
- 协程是**协作式**调度，挂起不阻塞线程
- 线程是**抢占式**调度，重量级

## 二、四大组件

### 6. Activity 的四种启动模式？
- `standard` / `singleTop` / `singleTask` / `singleInstance`（详见[生命周期](/android/activity/activity-lifecycle.md)）

### 7. Service 的启动方式？
- `startService`（后台任务，不通信）
- `bindService`（绑定通信）

### 8. 静态注册与动态注册广播？
- 静态：Manifest 声明，8.0+ 隐式广播受限
- 动态：代码注册，随组件生命周期销毁

## 三、View 体系

### 9. View 绘制流程？
- `measure → layout → draw`（详见[绘制流程](/ui/view/view-draw-process.md)）

### 10. 事件分发机制？
- `dispatchTouchEvent → onInterceptTouchEvent → onTouchEvent`
- 责任链，子不消费回传父

## 四、进程与线程

### 11. 进程优先级？
- 前台进程 > 可见进程 > 服务进程 > 后台进程 > 空进程

### 12. 主线程为什么不能做耗时操作？
- 主线程负责 UI 渲染与输入响应，耗时操作导致卡顿/ANR

> 进阶阅读：[面试进阶篇](/interview/advanced.md) | [面试源码篇](/interview/source-code.md)

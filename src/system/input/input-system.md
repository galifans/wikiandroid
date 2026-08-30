---
icon: input
title: 输入系统整体架构
description: InputManagerService、InputReader、InputDispatcher、事件管线从驱动到应用的完整链路
---

# 输入系统整体架构

> 面试高频指数：中
> 从触摸屏/按键驱动到应用 onTouchEvent，输入事件经历了一条完整的内核 → native → Framework 管线。理解这条链路是排查输入卡顿与 ANR 的基础。

## 1. 输入系统全景

```text
输入事件链路：

硬件设备（触摸屏/按键/鼠标）
   ↓ 内核驱动（input 子系统，生成 input_event）
/dev/input/eventX
   ↓ EventHub（native）
InputReader（native 线程）
   ↓ 加工后的 NotifyArgs
InputDispatcher（native 线程）
   ↓ Binder 跨进程（InputChannel）
Window 对应进程（ViewRootImpl）
   ↓ 事件队列
View 体系（dispatchTouchEvent 等）
```

## 2. InputManagerService

### 2.1 服务职责

```text
InputManagerService（IMS）
SystemServer 启动的核心服务之一

职责：
① 管理输入设备（插拔、配置）
② 与 native InputManager 双向通信
③ 提供窗口焦点注册接口
④ 输入 ANR 的触发与超时管理
⑤ 输入事件统计（InputStats）
```

### 2.2 核心组件

| 组件 | 所在层 | 职责 |
|------|--------|------|
| EventHub | native | 读取 /dev/input 内核事件 |
| InputReader | native | 事件解析与加工 |
| InputDispatcher | native | 事件分发与窗口命中 |
| InputManagerService | Java | 系统服务封装与回调 |
| InputChannel | native | 进程间事件通道 |

## 3. 事件读取与加工

### 3.1 EventHub

```text
EventHub 职责：
- 打开 /dev/input/event* 设备
- 监控设备热插拔（uevent）
- 读取原始 input_event
- 解析设备能力（键位表、触摸参数）

产出：RawEvent（原始事件）
```

### 3.2 InputReader

```text
InputReader 职责：
- 从 EventHub 取 RawEvent
- 按设备类型加工：
  触摸屏 → 触点合并、坐标换算、去抖
  按键   → keycode 映射、长按检测
  鼠标   → 指针移动计算
- 产出：NotifyArgs（NotifyMotionArgs / NotifyKeyArgs）
- 通知 InputDispatcher

配置来源：设备 IDC 文件 / 键位映射 / 触摸校准
```

## 4. 事件分发

### 4.1 InputDispatcher

```text
InputDispatcher 职责：
① 接收 InputReader 的通知
② 通过 WindowManager 查找目标窗口（命中测试）
③ 将事件放入目标窗口的 InputChannel 队列
④ 跟踪事件完成（finishedCallback）
⑤ 超时未消费 → 触发输入 ANR
⑥ 处理注入事件（Instrumentation / 自动化测试）
```

### 4.2 分发目标

```text
目标窗口查找：
触摸事件 → 命中测试（hit test）找最上层可接收窗口
按键事件 → 焦点窗口（focused window）
导航键   → 焦点窗口或系统 UI

分发前拦截：
- 系统手势（导航栏、状态栏）
- Window 的 FLAG_NOT_TOUCHABLE 等标志
- 事件区域裁剪
```

## 5. 跨进程投递

```text
InputChannel 投递：
InputDispatcher → 目标进程的 InputConsumer
（通过 Binder 建立 socketpair，native 层传输）

到达应用后：
ViewRootImpl.WindowInputEventReceiver
→ InputEventReceiver.onInputEvent
→ 加入 ViewRootImpl 的 InputQueue
→ View 体系分发（dispatchTouchEvent）

消费完成后回调 finishedCallback
（告知 InputDispatcher 事件已处理）
```

## 6. 输入 ANR

```text
输入 ANR 触发条件：
- 按键/触摸事件投递后，应用超时未完成处理
- 超时时间：5 秒（输入事件）
- 应用无响应或主线程阻塞

表现：
- 系统提示"应用无响应"
- 事件队列堆积（InputDispatcher 阻塞）
- 后续事件全部排队等待

排查：
- 主线程耗时操作 / 死锁
- 查看 ANR trace（主线程栈）
```

## 7. 高频面试题

**Q1：输入事件从内核到应用经过哪些组件？**
A：内核 input 子系统 → EventHub → InputReader（加工）→ InputDispatcher（分发）→ InputChannel（跨进程）→ ViewRootImpl → View 体系分发。

**Q2：InputReader 和 InputDispatcher 的关系？**
A：Reader 负责从内核读取并加工原始事件；Dispatcher 负责按窗口命中分发并跟踪超时。Reader 线程和 Dispatcher 线程是独立的两个 native 线程。

**Q3：什么是输入 ANR？超时多久？**
A：事件投递后应用 5 秒内未完成处理触发输入 ANR，系统弹"无响应"提示，通常是主线程阻塞。

**Q4：InputDispatcher 怎么找到目标窗口？**
A：触摸事件做命中测试（hit test），按键事件找焦点窗口，由 WindowManager 维护的窗口层级决定。

**Q5：输入卡顿如何定位？**
A：查看事件从 InputReader 到应用消费的延迟；应用内用 dispatchTouchEvent 耗时分析；系统层用 systrace 看 input 相关线程调度。

## 8. 小结

- 输入链路：驱动 → EventHub → InputReader → InputDispatcher → 应用。
- IMS 是 Java 封装，核心逻辑在 native（Reader/Dispatcher）。
- 命中测试决定触摸目标，焦点决定按键目标。
- 输入 ANR：5 秒未消费，主线程阻塞为主因。
- 排查卡顿从事件时间戳与线程调度入手。

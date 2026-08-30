---
icon: input
title: InputDispatcher 分发策略
description: 命中测试、焦点窗口、分发队列、事件完成回执、输入 ANR、拦截与注入
---

# InputDispatcher 分发策略

> 面试高频指数：中
> InputDispatcher 决定"事件发给谁、何时发、超时怎么办"。它直接关联输入 ANR 与触摸响应速度。

## 1. InputDispatcher 定位

```text
InputDispatcher（native 线程）
输入系统的"交通警察"

职责：
① 维护窗口注册信息（WindowHandle）
② 命中测试决定触摸目标
③ 维护每个窗口的事件队列
④ 跟踪事件生命周期（pending → delivered → finished）
⑤ 超时管理 → 输入 ANR
```

## 2. 窗口注册与焦点

### 2.1 窗口信息

```text
应用注册窗口：
ViewRootImpl.setView
→ WMS.addWindow
→ IMS.setInputWindows / setFocusedWindow
→ native InputDispatcher 更新 WindowHandle

WindowHandle 包含：
- 窗口句柄（InputChannel）
- 触摸区域（frame + 裁剪）
- 标志（可触摸、可聚焦）
- 输入管道（InputChannel pair）
```

### 2.2 命中测试

```text
触摸命中测试：
遍历窗口层级（Z-order 从高到低）
→ 找到包含触摸点且可接收的窗口
→ 考虑窗口 flag（FLAG_NOT_TOUCHABLE 跳过）
→ 区域裁剪（child 窗口叠加）

按键分发：
- 焦点窗口（FOCUSED_WINDOW）
- 无焦点 → 系统 UI（状态栏/导航栏）
- 特殊键（电源、音量）→ 系统服务直接处理
```

## 3. 分发流程

### 3.1 事件队列

```text
事件分发状态机：
QUEUED（排队）
  → 发送到窗口 InputChannel
  → DELIVERED（已投递）
  → 应用消费回调 finishedCallback
  → FINISHED（完成）

每个窗口一条队列（per-window queue）
同一队列内事件按序处理
```

### 3.2 分发策略

| 场景 | 策略 |
|------|------|
| 普通触摸 | 命中窗口队列 |
| 按键 | 焦点窗口队列 |
| 拦截事件 | 系统拦截后不投递应用 |
| 注入事件 | 走注入通道（自动化/输入法） |
| 无窗口 | 直接丢弃并回收 |

```text
同步机制：
- 事件分发给一个窗口时，
  同队列后续事件等待完成
- 不同窗口队列可并行
- 超时未完成 → 输入 ANR
```

## 4. 输入 ANR 详解

### 4.1 触发条件

```text
输入 ANR：
- 投递后应用 5 秒未 finishedCallback
- 常见原因：
  主线程阻塞（死锁/耗时）
  事件循环未处理（Choreographer 卡死）
  进程被冻结/内存不足

系统处理：
- 弹出 ANR 对话框
- 记录 ANR trace
- 用户可选择等待或关闭
```

### 4.2 排查手段

```text
排查输入 ANR：
① dumpsys input：查看分发队列与超时
② ANR trace：主线程栈（寻找锁/耗时）
③ systrace：input 线程与主线程调度
④ 检查 InputChannel 是否被阻塞

预防：
- 主线程避免耗时操作
- 触摸事件处理保持轻量
- 避免动画期间主线程卡顿
```

## 5. 注入与测试

```text
事件注入：
- InputManager.injectInputEvent（系统 API）
- Instrumentation.sendPointerSync（测试）
- 输入法（IME）注入按键
- 自动化（UiAutomator/Appium）

注入流程：
注入源（权限校验）
→ InputDispatcher 模拟真实分发
→ 命中测试 → 目标窗口
```

## 6. 性能与调优

```text
输入延迟优化：
- 减少命中测试开销（窗口层级扁平）
- 事件处理回调轻量化
- 避免主线程排队（处理耗时）
- 高频事件合并（MOVE 事件采样）

工具：
- dumpsys input（状态与统计）
- InputStats：事件延迟统计
- systrace：input 调度分析
```

## 7. 高频面试题

**Q1：InputDispatcher 如何决定事件给谁？**
A：触摸事件做命中测试（Z 序遍历找包含触摸点且可接收的窗口）；按键事件发给焦点窗口；特殊键由系统直接处理。

**Q2：输入 ANR 是什么？如何触发？**
A：事件投递后应用 5 秒内未消费（finishedCallback），通常因主线程阻塞，系统弹"无响应"提示。

**Q3：事件的完整生命周期？**
A：QUEUED → 发送到 InputChannel → DELIVERED → 应用消费回调 → FINISHED。窗口队列内严格有序。

**Q4：窗口标志如何影响分发？**
A：FLAG_NOT_TOUCHABLE 让窗口跳过命中；FLAG_NOT_FOCUSABLE 不参与焦点；系统窗口可拦截区域事件。

**Q5：怎么排查触摸卡顿？**
A：dumpsys input 看队列积压与超时，systrace 看 input 线程与主线程调度，检查主线程是否有耗时/死锁。

## 8. 小结

- Dispatcher 维护窗口注册、做命中测试、按队列分发。
- 触摸走命中测试，按键走焦点窗口。
- 事件四态：QUEUED → DELIVERED → FINISHED。
- 输入 ANR 5 秒超时，主线程阻塞为主因。
- dumpsys input / systrace 是主要排查工具。

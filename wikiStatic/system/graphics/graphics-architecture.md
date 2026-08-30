---
icon: animation
title: Android 图形架构
description: 应用渲染、BufferQueue、SurfaceFlinger、HWC、显示输出的完整图形链路
---

# Android 图形架构

> 面试高频指数：高
> 一帧画面从应用绘制到屏幕显示，经过"应用渲染 → 缓冲队列 → SurfaceFlinger 合成 → HWC 输出"四段旅程。这是系统级渲染知识的核心。

## 1. 图形架构全景

```text
应用进程：
View 绘制（软件/硬件加速）
  → RenderThread 生成 GPU 指令
  → 渲染到 Surface 的 Buffer
  ↓（BufferQueue 流转）
SurfaceFlinger（system 进程）
  接收各应用 Buffer
  → 图层合成（GPU/硬件）
  ↓
HWC（Hardware Composer）
  硬件合成 + 显示时序
  ↓
屏幕显示

驱动：VSYNC 同步整个流水线
```

## 2. 应用侧渲染

### 2.1 渲染路径

```text
应用渲染两种方式：
软件渲染（Skia）：
- 无 GPU 环境/禁用硬件加速
- CPU 绘制位图 → 上传纹理

硬件加速（默认）：
- View.draw → 生成 DisplayList
- RenderThread 提交 GPU 指令
- 纹理渲染到 Buffer
- 效率高，动画流畅
```

### 2.2 渲染与提交

```text
一帧应用侧流程：
① Choreographer 收到 VSYNC 回调
② 执行 measure/layout/draw
③ 生成 DisplayList
④ RenderThread 渲染到 Buffer
⑤ 提交 Buffer 到 BufferQueue（queueBuffer）
⑥ 请求合成（SurfaceFlinger 唤醒）

Buffer 数量：通常 2-3 个（双缓冲/三缓冲）
```

## 3. BufferQueue

### 3.1 核心角色

```text
BufferQueue（缓冲队列）：
生产者/消费者模型

生产者（Producer）：
- 应用侧 Surface
- dequeueBuffer → 绘制 → queueBuffer

消费者（Consumer）：
- SurfaceFlinger（合成）
- 或视频解码器/相机预览

流程：
dequeue → 绘制 → queue
→ 消费者 acquire → 处理 → release
```

### 3.2 缓冲策略

```text
缓冲数量决策：
- 默认 3 个（triple buffering）
- 双缓冲减少延迟但易掉帧
- SurfaceFlinger 根据帧率动态调整

关键：
- 生产者不能覆盖消费者正在用的 Buffer
- 队列满时 dequeue 阻塞（背压）
- 掉帧往往是缓冲不足或渲染超时
```

## 4. SurfaceFlinger

### 4.1 合成职责

```text
SurfaceFlinger 职责：
① 收集各窗口 Surface 的 Buffer
② 计算合成策略（GPU / HWC）
③ 合成最终画面
④ 输出到显示设备

图层概念：
- 每个窗口/应用一个 Layer
- Layer 有 Z 序（窗口层级决定）
- 合成 = 按 Z 序叠加所有 Layer
```

### 4.2 合成流程

```text
合成流程（每帧）：
① VSYNC 触发合成
② 遍历 Layer 取最新 Buffer
③ 与 HWC 协商合成方式
④ GPU 合成或 HWC 硬件合成
⑤ 提交显示（present）

性能目标：
- 每帧 16.6ms（60Hz）内完成
- 超时 = 掉帧（jank）
```

## 5. HWC 与显示

### 5.1 HWC 角色

```text
Hardware Composer（HWC）：
- 显示 HAL 的一部分
- 硬件合成能力（Overlay 层）
- 显示时序控制（VSYNC）
- 刷新率管理

分工：
- 简单场景 → HWC 直接合成（省电）
- 复杂场景 → GPU 合成后 HWC 显示
```

### 5.2 显示链路

```text
最终输出：
合成帧 → HWC → 显示面板（LCD/OLED）

刷新率：
- 60Hz 常见（16.6ms/帧）
- 90/120Hz 高刷（游戏/旗舰）
- 可变刷新率（LTPO 省电）

多屏：
- 主屏/副屏/投屏
- 每屏独立合成输出
```

## 6. VSYNC 同步

```text
VSYNC（垂直同步）：
- 屏幕刷新信号的同步脉冲
- 驱动整个渲染/合成节奏

三个 VSYNC 点：
① App VSYNC：应用开始渲染
② SF VSYNC：SurfaceFlinger 合成
③ 硬件 VSYNC：屏幕实际刷新

调度器（Scheduler）：
- 分配 VSYNC 到各阶段
- 处理空闲/繁忙状态
- 掉帧时调整（如降低刷新率）
```

## 7. 高频面试题

**Q1：一帧画面如何显示到屏幕？**
A：应用渲染到 Buffer → BufferQueue 流转 → SurfaceFlinger 合成所有 Layer → HWC 输出到屏幕，全程由 VSYNC 同步。

**Q2：BufferQueue 是什么？**
A：生产者消费者缓冲队列：应用生产（dequeue/queue），SurfaceFlinger 消费（acquire/release），实现跨进程 Buffer 流转。

**Q3：为什么需要双缓冲/三缓冲？**
A：避免绘制一半被读取（撕裂）；双缓冲延迟低但易掉帧，三缓冲抗掉帧但增加延迟，系统按需动态调整。

**Q4：SurfaceFlinger 怎么合成？**
A：按 Z 序叠加所有 Layer 的 Buffer，简单场景交给 HWC 硬件合成，复杂场景 GPU 合成后交给 HWC 显示。

**Q5：VSYNC 的作用？**
A：同步屏幕刷新信号，驱动应用渲染、SurfaceFlinger 合成、硬件显示三个节奏，避免撕裂并控制帧率。

## 8. 小结

- 图形链路：应用渲染 → BufferQueue → SurfaceFlinger → HWC → 屏幕。
- BufferQueue 实现跨进程缓冲流转。
- SurfaceFlinger 按 Z 序合成所有图层。
- HWC 负责硬件合成与显示时序。
- VSYNC 同步全链路，掉帧是核心性能指标。

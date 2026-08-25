---
icon: render
title: 渲染原理
shortTitle: 概览
dir:
  text: 渲染原理
  order: 8
---

# 🖥️ 渲染原理

从 VSYNC 到屏幕像素：Android 渲染管线、Choreographer、硬件加速与性能指标。

## 文章列表

- [渲染原理与硬件加速](render-principle.md)

## 核心要点

| 主题 | 说明 |
|------|------|
| VSYNC | 垂直同步信号，屏幕刷新节拍 |
| Choreographer | 帧回调编排者（doFrame） |
| 渲染管线 | CPU 测量布局 → GPU 光栅化 → 合成显示 |
| 硬件加速 | View 绘制由 Skia/OpenGL/Vulkan 执行 |
| 帧率指标 | 16.6ms / 60fps / 掉帧卡顿 |

## 高频考点

- 一帧画面是如何从代码变成屏幕像素的
- Choreographer 的作用与调用链
- 硬件加速与软件绘制的区别

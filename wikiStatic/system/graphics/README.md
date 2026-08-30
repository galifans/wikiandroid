---
icon: animation
title: 图形显示系统
shortTitle: 概览
dir:
  text: 图形显示系统
  order: 12
---

# 图形显示系统

> 应用渲染到屏幕显示的完整图形链路：BufferQueue、SurfaceFlinger 合成、HWC 硬件输出、VSYNC 帧调度。

## 文章列表

- [Android 图形架构](graphics-architecture.md) — 应用渲染 / BufferQueue / 合成 / 显示全链路
- [SurfaceFlinger 合成机制](surfaceflinger.md) — Layer / Transaction / 合成策略 / 掉帧
- [VSYNC 与 Choreographer](vsync-choreographer.md) — 帧调度 / 16.6ms / 掉帧检测
- [HWC 硬件合成与显示](hardware-composer.md) — Composer HAL / Overlay / 多屏

## 相关知识

- [渲染原理](../../ui/render/README.md) — 应用内渲染管线与硬件加速
- [Window 机制](../../ui/window/README.md) — 窗口层级与 Surface

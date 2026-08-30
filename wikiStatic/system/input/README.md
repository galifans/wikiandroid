---
icon: input
title: 输入系统
shortTitle: 概览
dir:
  text: 输入系统
  order: 7
---

# 输入系统

> 触摸、按键、鼠标等输入事件从内核驱动到应用窗口的完整管线：EventHub 读取、InputReader 加工、InputDispatcher 分发。

## 文章列表

- [输入系统整体架构](input-system.md) — InputManagerService / InputReader / InputDispatcher 全链路
- [InputReader 事件读取与加工](input-reader.md) — EventHub / 触摸聚合 / 坐标换算 / 按键映射
- [InputDispatcher 分发策略](input-dispatcher.md) — 命中测试 / 焦点窗口 / 输入 ANR

## 相关知识

- [WMS 触摸事件分发深入](../../system/ams-wms/wms-touch-dispatch.md) — 应用内 View 事件分发
- [View 事件分发机制](../../ui/event/README.md) — dispatchTouchEvent 体系

---
icon: layout
title: 布局优化
shortTitle: 概览
dir:
  text: 布局优化
  order: 7
---

# 布局优化

布局层级与绘制性能直接相关，优化布局是提升 UI 流畅度的关键。

## 文章列表

- [布局优化实战指南](layout-optimization.md)
- [屏幕适配方案](screen-adaptation.md)

## 核心手段

| 手段 | 说明 |
|------|------|
| `include` | 复用公共布局 |
| `merge` | 减少一层嵌套（配合 include） |
| `ViewStub` | 延迟加载不常用布局 |
| `ConstraintLayout` | 扁平化复杂布局 |
| 避免过度绘制 | 减少背景重复、`clipRect` 裁剪 |

## 分析工具

- **Layout Inspector**：查看层级与渲染耗时
- **Systrace / Perfetto**：分析渲染帧
- **GPU 过度绘制调试**：开发者选项开启

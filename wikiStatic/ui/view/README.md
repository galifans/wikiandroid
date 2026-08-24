---
icon: view
title: View 体系
---

# 🖼️ View 体系

View 是 Android UI 的基本单元，理解绘制流程是进阶的必修课。

## 文章列表

- [View 绘制流程详解](view-draw-process.md)
- [View 与 ViewGroup 的关系](view-viewgroup.md)
- [MeasureSpec 完全解析](measurespec.md)
- [RecyclerView 优化与 ListView 对比](recyclerview-guide.md)
- [WebView 使用与优化](webview-guide.md)

## 核心要点

1. **三大流程**：`measure`（测量）→ `layout`（布局）→ `draw`（绘制）
2. **MeasureSpec**：由父容器约束与子 View 自身尺寸决定
3. **职责链**：ViewGroup 递归调用子 View 的流程方法
4. **绘制内容**：背景、内容、子 View、装饰（fading edges 等）

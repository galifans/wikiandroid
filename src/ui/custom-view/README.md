---
icon: brush
title: 自定义 View
shortTitle: 概览
dir:
  text: 自定义 View
  order: 3
---

# 自定义 View

自定义 View 是 Android UI 进阶的必备技能。

## 文章列表

- [自定义 View 入门指南](custom-view-guide.md)
- [自定义 ViewGroup 实战](custom-viewgroup.md)
- [触摸辅助类与 View 滑动](touch-helper.md)
- [Canvas 与 Path 绘制艺术](canvas-path.md) — Paint 样式、贝塞尔曲线、渐变/阴影/文字高级绘制

## 分类

| 类型 | 场景 | 要点 |
|------|------|------|
| 自定义 View | 全新控件（图表、进度） | 重写 `onDraw` |
| 组合控件 | 复用已有控件 | 继承 ViewGroup/LinearLayout |
| 自定义 ViewGroup | 自定义布局 | 重写 `onMeasure` + `onLayout` |

## 核心步骤

1. 构造方法获取自定义属性（`obtainStyledAttributes`）
2. 重写 `onMeasure` 处理 `wrap_content`
3. 重写 `onDraw` 绘制内容
4. 处理触摸事件与状态
5. 处理滚动、动画等交互

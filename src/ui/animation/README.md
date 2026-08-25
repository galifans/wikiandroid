---
icon: animation
title: 动画机制
shortTitle: 概览
dir:
  text: 动画机制
  order: 6
---

# ✨ 动画机制

Android 动画体系的演进：帧动画 → 补间动画 → 属性动画。

## 文章列表

- [属性动画完全解析](property-animation.md)
- [补间动画与插值器](tween-animation.md) — 帧/补间/属性动画对比、插值器与估值器原理
- [转场动画与共享元素](scene-transition.md) — Activity 转场、Transition 框架、Compose 动画

## 核心要点

| 类型 | 机制 | 说明 |
|------|------|------|
| 帧动画 | 逐帧切换图片 | 简单但占用内存大 |
| 补间动画 | 改变 View 外观（平移/缩放/旋转/透明） | 不改变实际位置 |
| 属性动画 | 改变属性值（ObjectAnimator / ValueAnimator） | 推荐，真正改变属性 |
| 转场动画 | Activity/Fragment 切换与共享元素 | Transition 框架驱动 |
| Compose 动画 | 状态驱动的声明式动画 | 现代方案 |

## 高频考点

- 属性动画与补间动画的区别
- `ValueAnimator` 与 `ObjectAnimator` 的关系
- 动画监听器（`AnimatorListener`）
- 动画与性能（硬件加速）

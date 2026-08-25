---
icon: palette
title: UI 与渲染
index: false
---

# 🎨 UI 与渲染

View 体系、渲染原理与自定义绘制。

## View 体系

| 模块 | 说明 | 入口 |
|------|------|------|
| View 绘制流程 | measure / layout / draw | [View](/ui/view/) |
| 事件分发机制 | dispatchTouchEvent 链条 | [事件分发](/ui/event/) |
| 自定义 View | 绘制与交互实战 | [自定义 View](/ui/custom-view/) |
| 动画机制 | 属性动画 / 帧动画 | [动画](/ui/animation/) |
| 布局优化 | ConstraintLayout / include / 屏幕适配 | [布局优化](/ui/layout/) |
| Window 机制 | Window / WindowManager | [Window](/ui/window/) |
| Bitmap | 图片解码与压缩 | [Bitmap](/ui/bitmap/) |

## 学习路径

```
View 体系基础 → 绘制流程 → 事件分发 → 自定义 View → 动画 → 性能优化
```

> 💡 声明式 UI 开发见 [Jetpack Compose](/jetpack/compose/)。

## 📑 全部文章导航

### 🖼️ View 体系
- [View 绘制流程详解](/ui/view/view-draw-process.md)：measure / layout / draw 三大流程
- [View 与 ViewGroup 的关系](/ui/view/view-viewgroup.md)：职责链与组合模式
- [MeasureSpec 完全解析](/ui/view/measurespec.md)：UNSPECIFIED / EXACTLY / AT_MOST
- [RecyclerView 优化与 ListView 对比](/ui/view/recyclerview-guide.md)
- [WebView 使用与优化](/ui/view/webview-guide.md)

### 🖱️ 事件分发
- [事件分发机制详解](/ui/event/event-dispatch.md)：dispatchTouchEvent 链条
- [事件冲突解决方案](/ui/event/conflict-solution.md)：滑动冲突的拦截与处理

### ✏️ 自定义 View
- [自定义 View 实战](/ui/custom-view/custom-view-guide.md)：绘制 / 测量 / 交互
- [自定义 ViewGroup](/ui/custom-view/custom-viewgroup.md)
- [VelocityTracker / GestureDetector / Scroller](/ui/custom-view/touch-helper.md)：触摸辅助类

### 🎬 动画机制
- [属性动画机制](/ui/animation/property-animation.md)：ValueAnimator / ObjectAnimator

### 📐 布局优化
- [布局优化实战](/ui/layout/layout-optimization.md)：include / merge / ConstraintLayout
- [屏幕适配方案](/ui/layout/screen-adaptation.md)：dp / sp / 头条适配 / 刘海屏

### 🪟 Window 机制
- [Window 机制详解](/ui/window/window-mechanism.md)：Window / WindowManager / 创建过程

### 🖼️ Bitmap
- [Bitmap 详解与图片压缩](/ui/bitmap/bitmap-guide.md)：采样压缩 / 内存回收 / 三级缓存

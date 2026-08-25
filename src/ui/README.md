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
| 动画机制 | 属性动画 / 转场动画 | [动画](/ui/animation/) |
| 布局优化 | ConstraintLayout / include / 屏幕适配 | [布局优化](/ui/layout/) |
| Window 机制 | Window / WindowManager | [Window](/ui/window/) |
| Bitmap | 图片解码与压缩 | [Bitmap](/ui/bitmap/) |
| 渲染原理 | VSYNC / Choreographer / 硬件加速 | [渲染原理](/ui/render/) |

## 学习路径

```
View 体系基础 → 绘制流程 → 事件分发 → 自定义 View → 动画 → 渲染原理 → 性能优化
```

> 💡 声明式 UI 开发见 [Jetpack Compose](/jetpack/compose/)。

## 📑 全部文章导航

### 🖼️ View 体系
- [View 绘制流程详解](/ui/view/view-draw-process.md)：measure / layout / draw 三大流程
- [View 与 ViewGroup 的关系](/ui/view/view-viewgroup.md)：职责链与组合模式
- [MeasureSpec 完全解析](/ui/view/measurespec.md)：UNSPECIFIED / EXACTLY / AT_MOST
- [RecyclerView 优化与 ListView 对比](/ui/view/recyclerview-guide.md)
- [RecyclerView 源码解析](/ui/view/recyclerview-source.md)：五级缓存 / 预取 / DiffUtil
- [WebView 使用与优化](/ui/view/webview-guide.md)

### 🖱️ 事件分发
- [事件分发机制详解](/ui/event/event-dispatch.md)：dispatchTouchEvent 链条
- [事件冲突解决方案](/ui/event/conflict-solution.md)：滑动冲突的拦截与处理
- [输入系统与触摸事件分发](/ui/event/input-system.md)：InputReader / InputDispatcher / ACTION_CANCEL

### ✏️ 自定义 View
- [自定义 View 实战](/ui/custom-view/custom-view-guide.md)：绘制 / 测量 / 交互
- [自定义 ViewGroup](/ui/custom-view/custom-viewgroup.md)
- [VelocityTracker / GestureDetector / Scroller](/ui/custom-view/touch-helper.md)：触摸辅助类
- [Canvas 与 Path 绘制艺术](/ui/custom-view/canvas-path.md)：贝塞尔曲线 / 渐变 / 文字绘制

### 🎬 动画机制
- [属性动画机制](/ui/animation/property-animation.md)：ValueAnimator / ObjectAnimator
- [补间动画与插值器](/ui/animation/tween-animation.md)：插值器 / 估值器原理
- [转场动画与共享元素](/ui/animation/scene-transition.md)：Transition 框架 / 共享元素

### 📐 布局优化
- [布局优化实战](/ui/layout/layout-optimization.md)：include / merge / ConstraintLayout
- [屏幕适配方案](/ui/layout/screen-adaptation.md)：dp / sp / 头条适配 / 刘海屏

### 🪟 Window 机制
- [Window 机制详解](/ui/window/window-mechanism.md)：Window / WindowManager / 创建过程
- [WindowManager 深入与悬浮窗](/ui/window/windowmanager-deep.md)：addView 源码链 / 悬浮窗实战

### 🖼️ Bitmap
- [Bitmap 详解与图片压缩](/ui/bitmap/bitmap-guide.md)：采样压缩 / 内存回收 / 三级缓存
- [Glide 源码解析](/ui/bitmap/glide-source.md)：生命周期绑定 / 三级缓存 / Transformations

### ⚡ 渲染原理
- [渲染原理与硬件加速](/ui/render/render-principle.md)：VSYNC / 渲染管线 / 16.6ms 预算

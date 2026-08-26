---
icon: palette
title: UI 与渲染
index: false
---

# UI 与渲染

View 体系、渲染原理与自定义绘制，共 **37 篇原创文章**，从绘制流程到渲染管线的完整知识链。

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

> 声明式 UI 开发见 [Jetpack Compose](/jetpack/compose/)。

## 全部文章导航

### View 体系
- [View 绘制流程详解](/ui/view/view-draw-process.md)：measure / layout / draw 三大流程
- [View 与 ViewGroup 的关系](/ui/view/view-viewgroup.md)：职责链与组合模式
- [MeasureSpec 完全解析](/ui/view/measurespec.md)：UNSPECIFIED / EXACTLY / AT_MOST
- [RecyclerView 优化与 ListView 对比](/ui/view/recyclerview-guide.md)
- [RecyclerView 源码解析](/ui/view/recyclerview-source.md)：五级缓存 / 预取 / DiffUtil
- [WebView 使用与优化](/ui/view/webview-guide.md)
- [ViewPager2 使用指南](/ui/view/viewpager2-guide.md)：与 ViewPager 对比、RecyclerView 架构、懒加载与预加载

### 事件分发
- [事件分发机制详解](/ui/event/event-dispatch.md)：dispatchTouchEvent 链条
- [事件冲突解决方案](/ui/event/conflict-solution.md)：滑动冲突的拦截与处理
- [输入系统与触摸事件分发](/ui/event/input-system.md)：InputReader / InputDispatcher / ACTION_CANCEL
- [Android 坐标系与手势](/ui/event/coordinate-system.md)：View/屏幕坐标换算、MotionEvent 封装、手势判定
- [多指触控与手势识别](/ui/event/multitouch.md)：多点触控事件流、PointerIndex 管理、缩放/旋转手势实现

### 自定义 View
- [自定义 View 实战](/ui/custom-view/custom-view-guide.md)：绘制 / 测量 / 交互
- [自定义 ViewGroup](/ui/custom-view/custom-viewgroup.md)
- [VelocityTracker / GestureDetector / Scroller](/ui/custom-view/touch-helper.md)：触摸辅助类
- [Canvas 与 Path 绘制艺术](/ui/custom-view/canvas-path.md)：贝塞尔曲线 / 渐变 / 文字绘制
- [自定义属性与 XML 解析](/ui/custom-view/custom-attributes.md)：attrs.xml 定义、TypedArray 获取、自定义 View 与主题联动

### 动画机制
- [属性动画机制](/ui/animation/property-animation.md)：ValueAnimator / ObjectAnimator
- [补间动画与插值器](/ui/animation/tween-animation.md)：插值器 / 估值器原理
- [转场动画与共享元素](/ui/animation/scene-transition.md)：Transition 框架 / 共享元素
- [插值器与估值器源码解析](/ui/animation/interpolator-evaluator.md)：加速/回弹/周期插值器、TypeEvaluator 自定义、动画刷新机制

### 布局优化
- [布局优化实战](/ui/layout/layout-optimization.md)：include / merge / ConstraintLayout
- [屏幕适配方案](/ui/layout/screen-adaptation.md)：dp / sp / 头条适配 / 刘海屏
- [ConstraintLayout 完全指南](/ui/layout/constraintlayout-guide.md)：约束体系 / 链 / 辅助线 / 性能优势
- [布局方案选型](/ui/layout/layout-selection.md)：五大布局对比、性能差异、嵌套层级与面试常问

### Window 机制
- [Window 机制详解](/ui/window/window-mechanism.md)：Window / WindowManager / 创建过程
- [WindowManager 深入与悬浮窗](/ui/window/windowmanager-deep.md)：addView 源码链 / 悬浮窗实战
- [系统栏适配与沉浸式](/ui/window/systembar-adaptation.md)：状态栏/导航栏深浅色、WindowInsets、刘海屏与全屏适配
- [Dialog / Toast / PopupWindow](/ui/window/dialog-toast-popup.md)：三种浮层对比、Window Token 限制、Android 12 弹窗限制

### Bitmap
- [Bitmap 详解与图片压缩](/ui/bitmap/bitmap-guide.md)：采样压缩 / 内存回收 / 三级缓存
- [Glide 源码解析](/ui/bitmap/glide-source.md)：生命周期绑定 / 三级缓存 / Transformations
- [Bitmap 压缩与内存优化](/ui/bitmap/bitmap-compress.md)：采样率 / 质量 / 颜色格式、inBitmap 复用、大图分块加载

### 渲染原理
- [渲染原理与硬件加速](/ui/render/render-principle.md)：VSYNC / 渲染管线 / 16.6ms 预算
- [Choreographer 与帧同步](/ui/render/choreographer.md)：Vsync 回调链、FrameCallback、掉帧统计与卡顿定位
- [硬件加速渲染原理](/ui/render/hardware-acceleration.md)：GPU 渲染管线、DisplayList 录制与回放、Layer 与离屏缓冲
- [SurfaceView 与 TextureView](/ui/render/surfaceview-textureview.md)：双缓冲原理、与主线程渲染隔离、视频播放选型

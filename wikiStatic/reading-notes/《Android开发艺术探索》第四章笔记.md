---
icon: draw
title: 《Android开发艺术探索》第四章笔记
---

# 《Android开发艺术探索》第四章：View 工作原理

> 理解 measure / layout / draw 三大流程与 MeasureSpec 是自定义 View 的基础。

## 一、ViewRoot 与 DecorView

- **ViewRootImpl**：连接 WindowManager 与 DecorView 的纽带，View 三大流程均由其驱动
- 绘制从 `performTraversals` 开始，依次执行 `performMeasure` → `performLayout` → `performDraw`，对应 measure、layout、draw 三大流程
- **DecorView**：本质是 FrameLayout，内部为竖直 LinearLayout（标题栏 + 内容栏，内容栏 id 为 `android.R.id.content`）

## 二、MeasureSpec

### 三种模式

| 模式 | 含义 | 对应 LayoutParams |
|------|------|-------------------|
| `UNSPECIFIED` | 父容器不限制，要多大给多大（系统内部使用） | — |
| `EXACTLY` | 父容器已确定精确大小 | `match_parent` / 具体数值 |
| `AT_MOST` | 大小不能超过 SpecSize | `wrap_content` |

### 生成规则

- MeasureSpec 由 **父容器的 MeasureSpec + 自身的 LayoutParams** 共同决定
- 固定宽高：始终为精确模式
- `match_parent`：继承父容器模式，大小为父容器剩余空间
- `wrap_content`：始终为 `AT_MOST`，大小不超过父容器剩余空间

## 三、View 工作流程

### 获取宽高的时机问题

measure 与 Activity 生命周期不同步，`onCreate/onStart/onResume` 中获取可能为 0。四种解决方式：

| 方式 | 说明 |
|------|------|
| `onWindowFocusChanged` | View 初始化完毕，注意会多次回调 |
| `View.post(runnable)` | 投递到消息队列尾部，执行时 View 已初始化 |
| `ViewTreeObserver` | `onGlobalLayoutListener` 回调 |
| 手动 `view.measure()` | 需按 LayoutParams 构造 MeasureSpec（wrap_content 用 `(1 << 30) - 1` 的 AT_MOST） |

### draw 过程四步

1. 绘制背景：`background.draw(canvas)`
2. 绘制自己：`onDraw()`
3. 绘制子元素：`dispatchDraw()`
4. 绘制装饰：`onDrawScrollBars`

## 四、自定义 View 分类与须知

### 四类自定义 View

1. 继承 View 重写 `onDraw`
2. 继承 ViewGroup 派生特殊 Layout
3. 继承特定 View（如 TextView）
4. 继承特殊 ViewGroup（如 LinearLayout）

### 注意事项

- 让 View 支持 `wrap_content`
- 必要时支持 `padding`
- 尽量避免在 View 中使用 Handler
- 线程或动画需在 `onDetachedFromWindow` 及时停止
- 嵌套滑动时处理好滑动冲突

---
icon: touch
title: 《Android开发艺术探索》第三章笔记
---

# 《Android开发艺术探索》第三章：View 事件体系

> 覆盖 View 基础、滑动实现、事件分发机制与滑动冲突处理，是自定义 View 的必修课。

## 一、View 基础

### 位置参数

- 位置由 `left`、`top`、`right`、`bottom` 四个顶点决定，均为相对父容器的坐标
- `width = right - left`，`height = bottom - top`
- Android 3.0+ 新增 `x`、`y`、`translationX`、`translationY`：
  - `x = left + translationX`，`y = top + translationY`

### MotionEvent 与 TouchSlop

- 典型事件：`ACTION_DOWN`（按下）、`ACTION_MOVE`（移动）、`ACTION_UP`（抬起）
- 事件序列：点击后离开为 `DOWN → UP`；滑动为 `DOWN → MOVE… → UP`
- `getX/getY` 相对当前 View 左上角；`getRawX/getRawY` 相对屏幕左上角
- **TouchSlop**：系统可识别为滑动的最小距离，通过 `ViewConfiguration.get(context).getScaledTouchSlop()` 获取

### 辅助类

| 类 | 用途 |
|----|------|
| `VelocityTracker` | 追踪滑动速度；`computeCurrentVelocity(1000)` 指定单位时间（ms） |
| `GestureDetector` | 手势检测：单击、双击、长按、快速滑动等 |
| `Scroller` | 配合 `computeScroll` 实现弹性滑动 |

## 二、View 的滑动

| 方式 | 特点 |
|------|------|
| `scrollTo/scrollBy` | 改变**内容**位置而非控件位置；适合内容滑动 |
| 动画 | 操作 `translationX/Y`；3.0 以下注意点击事件位置问题 |
| 修改 LayoutParams | 灵活，适合有交互的 View |

### 弹性滑动

- **Scroller**：本身不能滑动，配合 `computeScroll` 不断重绘，每次重绘根据时间间隔计算新位置并 `scrollTo`
- **动画**：在 `onAnimationUpdate` 中叠加其他操作
- **延时策略**：`Handler.sendEmptyMessageDelayed` / `postDelayed` 渐进式滑动

## 三、事件分发机制

### 三个核心方法

| 方法 | 作用 |
|------|------|
| `dispatchTouchEvent` | 分发事件，返回是否消耗 |
| `onInterceptTouchEvent` | 判断是否拦截（仅 ViewGroup 有） |
| `onTouchEvent` | 处理事件，返回是否消耗 |

传递顺序：**Activity → Window → View**；ViewGroup 不拦截时向下传递，最终无人处理则回到 Activity。

### 关键结论

- 一个事件序列（DOWN 开始、UP 结束）**只能被一个 View 拦截并消耗**
- 不消耗 `ACTION_DOWN` 的 View，后续事件不再交给它
- `OnTouchListener` 优先级高于 `onTouchEvent`，`OnClickListener` 优先级最低
- ViewGroup 默认**不拦截**事件；View 默认消耗事件（除非不可点击）
- `requestDisallowInterceptTouchEvent` 可在子 View 干预父容器分发，但 **DOWN 事件除外**

## 四、滑动冲突

### 常见场景

1. 外部与内部滑动方向不一致（ViewPager + ListView）
2. 方向一致
3. 上述两种情况嵌套

### 处理规则

根据滑动夹角、水平/垂直距离差或速度差判断。

### 解决方式

- **外部拦截法**：重写父容器 `onInterceptTouchEvent`，DOWN 不拦截、MOVE 按需拦截、UP 不拦截
- **内部拦截法**：父容器不拦截，子 View 在 `dispatchTouchEvent` 中通过 `requestDisallowInterceptTouchEvent` 控制是否交给父容器处理

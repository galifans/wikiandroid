---
icon: view
title: View 与 ViewGroup 的关系
description: View/ViewGroup 职责划分、View 树结构、LayoutParams、三大流程协作与自定义 ViewGroup 基础
---

# View 与 ViewGroup 的关系

> 面试高频指数：高
> 理解 View 与 ViewGroup 的关系是理解 Android UI 体系的基石。

## 1. 基本概念

先分清两个基类各自的定位：

```text
View：所有 UI 控件的基类（TextView、Button、ImageView...）
ViewGroup：View 的子类，可以容纳其他 View（LinearLayout、FrameLayout...）

ViewGroup 本身也是 View，因此可以嵌套（View 树）
```

继承关系可以画成一棵树：

```text
继承关系：
View
 └─ ViewGroup
     ├─ LinearLayout
     ├─ FrameLayout
     ├─ ConstraintLayout
     └─ 自定义 ViewGroup
```

## 2. View 树的构成

一个 Activity 的视图层级从窗口根节点展开：

```text
PhoneWindow（窗口）
 └─ DecorView（根 View，继承 FrameLayout）
     ├─ TitleBar（标题栏）
     └─ ContentFrameLayout（内容区）
         └─ 用户布局
             ├─ LinearLayout
             │   ├─ TextView
             │   └─ Button
             └─ ImageView
```

**关键点**：

- 一个 Activity 对应一个 `PhoneWindow`，`Window` 是"视图容器"的抽象。
- `DecorView` 是窗口的根视图，也是 View 树的根。
- View 树通过 `setContentView` 挂载用户布局到 ContentFrameLayout。

## 3. 职责划分

两者在三大流程中的分工如下：

| 职责 | View | ViewGroup |
| --- | --- | --- |
| 测量自己 | ✓ `onMeasure` | ✓ 递归测量子 View |
| 摆放自己 | ✓ `onLayout` | ✓ 递归摆放子 View |
| 绘制自己 | ✓ `onDraw` | ✓ 先绘制自己再绘制子 View |
| 管理子 View | ✗ | ✓ add/remove |
| 事件分发 | 处理事件 | 拦截 + 分发 |

一个最小可用的 ViewGroup 只需实现测量和布局两个方法：

::: code-tabs

@tab Kotlin

```kotlin
// ViewGroup 核心方法（职责示例）
class MyViewGroup : ViewGroup {

    // ① 测量：确定子 View 尺寸
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        // 测量所有子 View
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            measureChild(child, widthMeasureSpec, heightMeasureSpec)
        }
        setMeasuredDimension(defaultWidth, defaultHeight)
    }

    // ② 布局：摆放子 View 位置
    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            child.layout(left, top, left + child.measuredWidth, top + child.measuredHeight)
        }
    }
}
```

:::

## 4. LayoutParams：父容器视角的约束

LayoutParams 是子 View 和父容器之间的"契约"：

::: code-tabs

@tab:active Java

```java
// LayoutParams 是"父容器如何看待子 View"
// 每个 ViewGroup 有自己的 LayoutParams 子类
// LinearLayout.LayoutParams / FrameLayout.LayoutParams / MarginLayoutParams

// 常见取值
LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,   // 宽度
        LinearLayout.LayoutParams.WRAP_CONTENT    // 高度
);
params.weight = 1f;   // LinearLayout 特有的权重
```

@tab Kotlin

```kotlin
// LayoutParams 是"父容器如何看待子 View"
// 每个 ViewGroup 有自己的 LayoutParams 子类
// LinearLayout.LayoutParams / FrameLayout.LayoutParams / MarginLayoutParams

// 常见取值
val params = LinearLayout.LayoutParams(
    LinearLayout.LayoutParams.MATCH_PARENT,   // 宽度
    LinearLayout.LayoutParams.WRAP_CONTENT    // 高度
)
params.weight = 1f   // LinearLayout 特有的权重
```

:::

**测量时的配合**：父容器读 LayoutParams 生成 MeasureSpec，再传给子 View：

```text
父 ViewGroup.onMeasure
  → 读取子 View 的 LayoutParams（宽高期望）
  → 结合父容器约束生成 MeasureSpec
  → 传给子 View 的 measure()
```

## 5. 三大流程协作

measure、layout、draw 三步从根到叶递归执行：

```text
measure（测量）：从根到叶，确定每个 View 的尺寸
  View.measure() → onMeasure()
  └─ ViewGroup：先测子 View（结合 LayoutParams + 自身约束）
       → 再确定自己尺寸 → setMeasuredDimension()

layout（布局）：从根到叶，确定每个 View 的位置
  View.layout(l, t, r, b) → onLayout()
  └─ ViewGroup：遍历子 View，调用子 View.layout()

draw（绘制）：从根到叶（背景 → 内容 → 子 View）
  View.draw(canvas)
  └─ ViewGroup：dispatchDraw() 绘制子 View
```

## 6. ViewGroup 的三个核心回调

自定义 ViewGroup 最少要处理下面几个回调：

::: code-tabs

@tab:active Java

```java
public class CustomViewGroup extends ViewGroup {

    // ① 生成子 View 的 LayoutParams
    @Override
    public LayoutParams generateLayoutParams(AttributeSet attrs) {
        return new MarginLayoutParams(getContext(), attrs);
    }

    // ② 测量子 View（默认实现：读取子 View 的 LayoutParams）
    // 可重写 measureChildren 做特殊处理

    // ③ 布局子 View
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        // 必须实现！否则子 View 不显示
    }

    // ④ 是否拦截事件（可选）
    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) { ... }
}
```

@tab Kotlin

```kotlin
class CustomViewGroup : ViewGroup {

    // ① 生成子 View 的 LayoutParams
    override fun generateLayoutParams(attrs: AttributeSet?): LayoutParams {
        return MarginLayoutParams(context, attrs)
    }

    // ② 测量子 View（默认实现：读取子 View 的 LayoutParams）
    // 可重写 measureChildren 做特殊处理

    // ③ 布局子 View
    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        // 必须实现！否则子 View 不显示
    }

    // ④ 是否拦截事件（可选）
    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean { ... }
}
```

:::

## 7. 高频面试题

**Q1：View 和 ViewGroup 的区别？**
A：View 是所有控件的基类，负责绘制与事件处理；ViewGroup 继承 View，额外
管理子 View（添加、测量、布局、绘制分发）。ViewGroup 也是 View，可嵌套。

**Q2：ViewGroup 的 onMeasure 和 View 的 onMeasure 有什么区别？**
A：View 的 onMeasure 只确定自己尺寸；ViewGroup 的 onMeasure 要先测量所有子
View（根据 LayoutParams 与约束生成子 View 的 MeasureSpec），再综合确定自己尺寸。

**Q3：为什么自定义 ViewGroup 必须重写 onLayout？**
A：`onLayout` 是抽象方法（ViewGroup 未实现），不重写子 View 不会被摆放
（都在 (0,0) 或不可见）。onMeasure/onDraw 有默认实现可选择性重写。

**Q4：LayoutParams 的作用？**
A：LayoutParams 是子 View 与父容器之间的"契约"，声明子 View 的期望尺寸
（MATCH_PARENT/WRAP_CONTENT/具体值）与约束（margin、weight 等）。
父容器测量时读取它生成 MeasureSpec。

**Q5：DecorView 是什么？**
A：Window 的根视图（FrameLayout），包含标题栏与内容区。`setContentView` 的
布局被添加为 ContentFrameLayout 的子 View。View 树的遍历从 DecorView 开始。

## 8. 小结

- View = 绘制单元，ViewGroup = 容器 + 递归管理。
- 三大流程：measure → layout → draw，从根到叶递归。
- LayoutParams 是父子协作的契约。
- 自定义 ViewGroup 必须重写 onLayout，根据需要重写 onMeasure。

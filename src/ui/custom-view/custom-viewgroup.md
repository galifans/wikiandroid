---
icon: brush
title: 自定义 ViewGroup 实战
description: ViewGroup 测量与布局原理、onMeasure/onLayout 实战、自定义流式布局完整示例与性能优化
---

# 🧱 自定义 ViewGroup 实战

> 面试高频指数：⭐⭐⭐⭐
> 自定义 ViewGroup 是解决复杂布局问题的终极武器（如流式标签、九宫格、瀑布流）。

## 1. ViewGroup 的核心职责

```text
1. onMeasure：测量所有子 View，确定自身尺寸
2. onLayout：为所有子 View 分配位置
3. 可选：事件拦截、触摸处理
```

**与自定义 View 的区别**：

| 维度 | 自定义 View | 自定义 ViewGroup |
| --- | --- | --- |
| onMeasure | 测量自己 | 先测子 View 再测自己 |
| onLayout | 无需实现 | **必须实现**（抽象方法） |
| onDraw | 绘制自己 | 默认不绘制（dispatchDraw 绘制子 View） |
| 核心 API | Paint/Canvas | measureChild/getChildAt |

## 2. 完整示例：流式布局（FlowLayout）

```kotlin
class FlowLayout @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : ViewGroup(context, attrs, defStyleAttr) {

    private val horizontalSpacing = dp2px(8f).toInt()
    private val verticalSpacing = dp2px(8f).toInt()

    // 记录每行子 View（用于 onLayout）
    private val lines = mutableListOf<List<View>>()
    private val lineHeights = mutableListOf<Int>()

    // ─────────── ① onMeasure：先测量子 View ───────────
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val widthMode = MeasureSpec.getMode(widthMeasureSpec)
        val widthSize = MeasureSpec.getSize(widthMeasureSpec)

        var curLineWidth = 0      // 当前行累计宽度
        var curLineHeight = 0     // 当前行最高子 View 高度
        var totalHeight = paddingTop + paddingBottom

        lines.clear()
        lineHeights.clear()
        val currentLine = mutableListOf<View>()

        for (i in 0 until childCount) {
            val child = getChildAt(i)
            // 测量子 View（根据子 View 的 LayoutParams 生成 MeasureSpec）
            measureChild(child, widthMeasureSpec, heightMeasureSpec)

            // 判断是否需要换行（加上间距后超宽）
            val needWrap = curLineWidth + child.measuredWidth > widthSize - paddingLeft - paddingRight
            if (needWrap && currentLine.isNotEmpty()) {
                // 保存当前行
                lines.add(currentLine.toList())
                lineHeights.add(curLineHeight)
                // 换行
                currentLine.clear()
                totalHeight += curLineHeight + verticalSpacing
                curLineWidth = 0
                curLineHeight = 0
            }

            currentLine.add(child)
            curLineWidth += child.measuredWidth + horizontalSpacing
            curLineHeight = maxOf(curLineHeight, child.measuredHeight)
        }

        // 保存最后一行
        if (currentLine.isNotEmpty()) {
            lines.add(currentLine.toList())
            lineHeights.add(curLineHeight)
            totalHeight += curLineHeight
        }

        // 设置自身尺寸（AT_MOST 时高度为内容高度）
        val height = if (MeasureSpec.getMode(heightMeasureSpec) == MeasureSpec.AT_MOST) {
            totalHeight
        } else {
            MeasureSpec.getSize(heightMeasureSpec)
        }
        setMeasuredDimension(widthSize, height)
    }

    // ─────────── ② onLayout：摆放子 View ───────────
    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        var curX = paddingLeft
        var curY = paddingTop

        for (lineIndex in lines.indices) {
            val line = lines[lineIndex]
            val lineHeight = lineHeights[lineIndex]

            for (child in line) {
                child.layout(curX, curY, curX + child.measuredWidth, curY + child.measuredHeight)
                curX += child.measuredWidth + horizontalSpacing
            }

            curX = paddingLeft
            curY += lineHeight + verticalSpacing
        }
    }

    // ─────────── ③ 支持 margin ───────────
    override fun generateLayoutParams(attrs: AttributeSet?): LayoutParams =
        MarginLayoutParams(context, attrs)

    override fun generateLayoutParams(p: LayoutParams?): LayoutParams =
        MarginLayoutParams(p)

    override fun checkLayoutParams(p: LayoutParams?): Boolean =
        p is MarginLayoutParams

    private fun dp2px(dp: Float): Float = dp * resources.displayMetrics.density
}
```

**使用方式**：

```xml
<com.example.FlowLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <TextView ... />   <!-- 可放任意多个子 View -->
</com.example.FlowLayout>
```

## 3. 关键方法总结

| 方法 | 作用 | 时机 |
| --- | --- | --- |
| `measureChild` | 测量单个子 View | onMeasure |
| `measureChildren` | 批量测量所有子 View | onMeasure |
| `getChildAt(i)` | 获取子 View | 任意 |
| `childCount` | 子 View 数量 | 任意 |
| `layout(l,t,r,b)` | 设置子 View 位置 | onLayout |
| `generateLayoutParams` | 生成自定义 LayoutParams | 添加子 View 时 |
| `onInterceptTouchEvent` | 事件拦截 | 触摸时 |

## 4. 性能优化要点

```text
① onMeasure/onLayout 中避免创建对象（复用列表/循环）
② 大量子 View 时考虑 RecyclerView（虚拟化）而非 ViewGroup
③ 嵌套层级影响性能：能用自定义 ViewGroup 扁平化就扁平化
④ 子 View 状态保存：onSaveInstanceState 遍历子 View
```

## 5. 高频面试题

**Q1：自定义 ViewGroup 必须实现哪些方法？**
A：`onLayout` 是抽象方法必须实现（否则子 View 不显示）；onMeasure 推荐重写
（否则所有子 View 尺寸为 0 或默认）；generateLayoutParams 需要时重写以支持
MarginLayoutParams。

**Q2：onMeasure 中如何测量子 View？**
A：用 `measureChild(child, widthMeasureSpec, heightMeasureSpec)`（内部会
结合子 View 的 LayoutParams 计算 MeasureSpec）。若子 View 带 margin，
需用 `measureChildWithMargins` 并重写 generateLayoutParams。

**Q3：为什么子 View 不显示？**
A：最常见原因：① onLayout 未实现或坐标错误（如全部在 0,0 且重叠）；
② onMeasure 中未调用 measureChild，子 View 尺寸为 0。

**Q4：measure 和 layout 中子 View 尺寸不一致会怎样？**
A：layout 最终决定显示位置与大小。measure 的 measuredWidth/Height 是
layout 时的参考；自定义 ViewGroup 可强制修改（如平分宽度），子 View 按
layout 后的实际位置绘制。

**Q5：ViewGroup 默认 onDraw 为什么是空的？**
A：ViewGroup 默认 `setWillNotDraw(true)`，因为它主要职责是"容器"。
如需绘制背景/分割线，重写 onDraw 并调用 `setWillNotDraw(false)`。

## 6. 小结

- 核心两件事：onMeasure（测子、算自己）、onLayout（摆子）。
- MarginLayoutParams 支持 margin 的标配。
- 流式布局示例可扩展为九宫格、瀑布流等。
- 大量数据场景用 RecyclerView，小规模自定义用 ViewGroup。

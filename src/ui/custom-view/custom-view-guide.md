---
icon: brush
title: 自定义 View 入门指南
description: 自定义 View 分类、构造方法、自定义属性、onMeasure/onDraw 实战、触摸处理与完整示例
---

# 自定义 View 入门指南

> 面试高频指数：高
> 自定义 View 是进阶必备技能，掌握这套流程即可应对 90% 的绘制需求。

## 1. 自定义 View 的分类

| 类型 | 场景 | 核心工作 |
| --- | --- | --- |
| 自定义 View | 全新控件（图表、进度条、表情） | 重写 `onDraw` |
| 组合控件 | 复用已有控件拼装（搜索框） | 组合 + 暴露 API |
| 自定义 ViewGroup | 自定义布局容器 | `onMeasure` + `onLayout` |

## 2. 标准流程

### 2.1 继承 View 并实现构造方法

::: code-tabs

@tab:active Java

```java
public class CircleView extends View {
    // 三个构造：代码创建 / XML 使用（带属性）/ 带默认样式
    public CircleView(Context context) {
        this(context, null);
    }

    public CircleView(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public CircleView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }
}
```

@tab Kotlin

```kotlin
class CircleView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {
    // 三个构造：代码创建 / XML 使用（带属性）/ 带默认样式
}
```

:::

### 2.2 自定义属性

```xml
<!-- res/values/attrs.xml -->
<resources>
    <declare-styleable name="CircleView">
        <attr name="circleColor" format="color" />
        <attr name="radius" format="dimension" />
    </declare-styleable>
</resources>
```

::: code-tabs

@tab:active Java

```java
// 读取自定义属性（在构造函数中）
private int circleColor;
private float radius;

public CircleView(Context context, AttributeSet attrs, int defStyleAttr) {
    super(context, attrs, defStyleAttr);
    TypedArray ta = context.obtainStyledAttributes(attrs, R.styleable.CircleView);
    circleColor = ta.getColor(R.styleable.CircleView_circleColor, Color.GREEN);
    radius = ta.getDimension(R.styleable.CircleView_radius, dp2px(50f));
    ta.recycle();          // 必须回收！
}
```

@tab Kotlin

```kotlin
// 读取自定义属性
private val circleColor: Int
private val radius: Float

init {
    val ta = context.obtainStyledAttributes(attrs, R.styleable.CircleView)
    circleColor = ta.getColor(R.styleable.CircleView_circleColor, Color.GREEN)
    radius = ta.getDimension(R.styleable.CircleView_radius, dp2px(50f))
    ta.recycle()          // 必须回收！
}
```

:::

### 2.3 处理 wrap_content（onMeasure）

::: code-tabs

@tab:active Java

```java
@Override
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    int defaultSize = dp2px(100f);   // 内容默认尺寸
    int width = resolveSize(defaultSize, widthMeasureSpec);
    int height = resolveSize(defaultSize, heightMeasureSpec);
    setMeasuredDimension(width, height);
}
```

@tab Kotlin

```kotlin
override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    val defaultSize = dp2px(100f)   // 内容默认尺寸
    val width = resolveSize(defaultSize, widthMeasureSpec)
    val height = resolveSize(defaultSize, heightMeasureSpec)
    setMeasuredDimension(width, height)
}
```

:::

### 2.4 绘制内容（onDraw）

::: code-tabs

@tab:active Java

```java
private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

@Override
protected void onDraw(Canvas canvas) {
    super.onDraw(canvas);
    // 绘制圆形
    paint.setColor(circleColor);
    canvas.drawCircle(getWidth() / 2f, getHeight() / 2f, radius, paint);
}
```

@tab Kotlin

```kotlin
private val paint = Paint(Paint.ANTI_ALIAS_FLAG)

override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    // 绘制圆形
    paint.color = circleColor
    canvas.drawCircle(width / 2f, height / 2f, radius, paint)
}
```

:::

## 3. 完整示例：可点击的圆

::: code-tabs

@tab:active Java

```java
public class ClickableCircleView extends View {

    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private float radius;
    private boolean isPressed = false;

    public ClickableCircleView(Context context) {
        this(context, null);
    }

    public ClickableCircleView(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public ClickableCircleView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        paint.setStyle(Paint.Style.FILL);
        radius = dp2px(50f);
        setClickable(true);      // 让 onTouchEvent 消费事件
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int size = resolveSize((int) (radius * 2), widthMeasureSpec);
        setMeasuredDimension(size, size);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        paint.setColor(isPressed ? Color.LTGRAY : Color.GREEN);
        canvas.drawCircle(getWidth() / 2f, getHeight() / 2f, radius, paint);
    }

    // 触摸反馈
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
                isPressed = true;
                invalidate();
                break;
            case MotionEvent.ACTION_UP:
                isPressed = false;
                invalidate();
                performClick();    // 触发 OnClickListener
                break;
            case MotionEvent.ACTION_CANCEL:
                isPressed = false;
                invalidate();
                break;
        }
        return super.onTouchEvent(event);
    }

    private float dp2px(float dp) {
        return dp * getResources().getDisplayMetrics().density;
    }
}
```

@tab Kotlin

```kotlin
class ClickableCircleView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }
    private var radius = dp2px(50f)
    private var isPressed = false

    init {
        isClickable = true      // 让 onTouchEvent 消费事件
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val size = resolveSize((radius * 2).toInt(), widthMeasureSpec)
        setMeasuredDimension(size, size)
    }

    override fun onDraw(canvas: Canvas) {
        paint.color = if (isPressed) Color.LTGRAY else Color.GREEN
        canvas.drawCircle(width / 2f, height / 2f, radius, paint)
    }

    // 触摸反馈
    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                isPressed = true
                invalidate()
            }
            MotionEvent.ACTION_UP -> {
                isPressed = false
                invalidate()
                performClick()    // 触发 OnClickListener
            }
            MotionEvent.ACTION_CANCEL -> {
                isPressed = false
                invalidate()
            }
        }
        return super.onTouchEvent(event)
    }

    private fun dp2px(dp: Float): Float =
        dp * resources.displayMetrics.density
}
```

:::

## 4. 关键知识点

### 4.1 invalidate 与 postInvalidate

::: code-tabs

@tab:active Java

```java
invalidate()          // 主线程请求重绘（onDraw 会再次调用）
postInvalidate()      // 子线程调用时使用（内部切回主线程）
requestLayout()       // 重新测量 + 布局 + 绘制（尺寸/位置变化时）
```

@tab Kotlin

```kotlin
invalidate()          // 主线程请求重绘（onDraw 会再次调用）
postInvalidate()      // 子线程调用时使用（内部切回主线程）
requestLayout()       // 重新测量 + 布局 + 绘制（尺寸/位置变化时）
```

:::

### 4.2 坐标系

```text
getLeft/getTop   ：相对父容器的左边/上边
getX/getY        ：相对父容器的坐标（含 translation）
getRawX/getRawY  ：相对屏幕的坐标
canvas 坐标系    ：View 自身的左上角为原点 (0,0)
```

### 4.3 硬件加速

```text
默认开启。硬件加速下不支持：
- Canvas.clipPath（复杂路径）
- 部分 Paint 效果（setMaskFilter 等）
检查：view.isHardwareAccelerated
```

## 5. 高频面试题

**Q1：自定义 View 的流程？**
A：构造方法 → 读取自定义属性 → onMeasure（处理 wrap_content）→
onLayout（ViewGroup 才需要）→ onDraw 绘制 → 处理触摸/动画。
尺寸变化用 requestLayout，内容变化用 invalidate。

**Q2：invalidate 和 requestLayout 的区别？**
A：invalidate 只触发 onDraw（内容变了）；requestLayout 触发
measure + layout + draw（尺寸/位置变了），代价更大。

**Q3：obtainStyledAttributes 后为什么要 recycle？**
A：TypedArray 持有原生资源引用，不回收会导致内存泄漏。最佳实践是
try/finally 中回收。

**Q4：wrap_content 为什么需要特殊处理？**
A：不处理时 onMeasure 直接用 specSize，wrap_content 会变成 match_parent
的大小（AT_MOST 模式返回父容器尺寸）。需用 resolveSize(默认尺寸, spec)。

**Q5：如何提高自定义 View 的绘制性能？**
A：避免在 onDraw 中创建对象（复用 Paint/Path）；减少过度绘制
（clipRect）；使用硬件加速；必要时用 invalidate 局部刷新区域。

## 6. 小结

- 三要素：onMeasure（尺寸）、onDraw（绘制）、onTouchEvent（交互）。
- 自定义属性：attrs.xml + obtainStyledAttributes + recycle。
- 性能红线：onDraw 不 new 对象、不写复杂逻辑。
- 学习路径：绘制流程 → 自定义 View → 自定义 ViewGroup → 组合控件。

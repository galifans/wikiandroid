---
icon: animation
title: 属性动画完全解析
description: ValueAnimator/ObjectAnimator/AnimatorSet、插值器与估值器、PropertyValuesHolder、Compose 动画对比
---

# 属性动画完全解析

> 面试高频指数：高
> 属性动画是 Android 动画体系的核心，理解估值器与插值器才能写出流畅动画。

## 1. 动画体系演进

```text
帧动画（FrameAnimation）→ 补间动画（Tween）→ 属性动画（Property Animation）
                                      ↓
                          Compose 动画（声明式、状态驱动）
```

| 类型 | 原理 | 特点 |
| --- | --- | --- |
| 帧动画 | 逐帧换图 | 简单、内存大 |
| 补间动画 | 只改外观（平移/缩放/旋转/透明） | 不改变真实属性、点击位置不变 |
| 属性动画 | 真正改变属性值 | 灵活、推荐 |
| Compose 动画 | 状态驱动重组 | 现代方案 |

## 2. 基础用法

### 2.1 ValueAnimator：值变化器

```kotlin
// ValueAnimator 只负责"值"的变化，不直接操作 View
val animator = ValueAnimator.ofFloat(0f, 1f).apply {
    duration = 1000
    interpolator = AccelerateDecelerateInterpolator()
    addUpdateListener {
        val value = it.animatedValue as Float
        view.alpha = value          // 手动应用值
        view.translationX = value * 100
    }
}
animator.start()
```

### 2.2 ObjectAnimator：属性动画器（最常用）

```kotlin
// ObjectAnimator 自动调用 setter 方法
ObjectAnimator.ofFloat(view, "translationX", 0f, 300f).apply {
    duration = 500
    start()
}

// 多属性同时
ObjectAnimator.ofFloat(view, View.ROTATION, 0f, 360f).apply {
    duration = 1000
    start()
}
```

**原理**：`ObjectAnimator` 通过反射调用 `setTranslationX(float)`，所以：

- View 必须提供对应的 setter（如 `setAlpha`、`setTranslationX`）。
- 属性名对应 `setXxx` 方法，例如 `"alpha"` → `setAlpha`。
- 没有 setter 的属性需自定义（`PropertyValuesHolder` + `TypeEvaluator`）。

### 2.3 AnimatorSet：动画集合

```kotlin
AnimatorSet().apply {
    playTogether(                  // 同时播放
        ObjectAnimator.ofFloat(view, "scaleX", 1f, 1.5f),
        ObjectAnimator.ofFloat(view, "scaleY", 1f, 1.5f)
    )
    playSequentially(              // 顺序播放
        ObjectAnimator.ofFloat(view, "rotation", 0f, 360f),
        ObjectAnimator.ofFloat(view, "alpha", 1f, 0f)
    )
    duration = 1000
    start()
}
```

## 3. 插值器与估值器

### 3.1 插值器（Interpolator）：控制时间节奏

```text
输入：0→1 的时间进度（t）
输出：0→1 的动画进度（插值后的值）

LinearInterpolator     ：匀速
AccelerateInterpolator ：加速
DecelerateInterpolator ：减速
AccelerateDecelerate   ：先加速后减速
OvershootInterpolator  ：超出目标再回弹
BounceInterpolator     ：落地弹跳
```

```kotlin
animator.interpolator = OvershootInterpolator(2f)
```

### 3.2 估值器（Evaluator）：把进度换算成属性值

```text
TypeEvaluator 输入：插值后的进度（0~1）
输出：具体属性值（如颜色、坐标）

IntEvaluator      ：int 值
FloatEvaluator    ：float 值
ArgbEvaluator     ：颜色渐变
自定义：实现 evaluate(fraction, startValue, endValue)
```

```kotlin
// 自定义估值器：百分比计算（圆形进度条）
class PercentEvaluator : TypeEvaluator<Float> {
    override fun evaluate(fraction: Float, startValue: Float, endValue: Float): Float {
        return startValue + (endValue - startValue) * fraction
    }
}

// 颜色渐变
val colorAnimator = ValueAnimator.ofObject(
    ArgbEvaluator(),
    Color.RED, Color.BLUE
).apply {
    duration = 2000
    addUpdateListener {
        view.setBackgroundColor(it.animatedValue as Int)
    }
    start()
}
```

### 3.3 计算流程

```text
时间 t → 插值器（fraction）→ 估值器（value）→ setter → 重绘
    ↑                                  ↓
 时长 / 延迟                    属性值（如 0→300f）
```

## 4. PropertyValuesHolder 与 ViewPropertyAnimator

```kotlin
// ① PropertyValuesHolder：一个动画多个属性
val pvhX = PropertyValuesHolder.ofFloat("translationX", 0f, 300f)
val pvhY = PropertyValuesHolder.ofFloat("translationY", 0f, 300f)
ObjectAnimator.ofPropertyValuesHolder(view, pvhX, pvhY).apply {
    duration = 1000
    start()
}

// ② ViewPropertyAnimator：链式 API（性能最优，内部合并）
view.animate()
    .translationX(300f)
    .alpha(0.5f)
    .scaleX(1.5f)
    .setDuration(1000)
    .start()
```

## 5. 动画监听

```kotlin
animator.addListener(object : AnimatorListenerAdapter() {
    override fun onAnimationEnd(animation: Animator) {
        // 动画结束
    }
})

// 或 Kotlin 扩展
animator.doOnEnd { /* 结束回调 */ }
```

## 6. 动画与性能

```text
① 使用硬件加速：View 属性动画默认走 RenderThread，不阻塞主线程
② 避免在动画中触发 requestLayout（改变布局属性会重新测量）
③ translationX/Y、alpha、scaleX/Y、rotation 是"轻量属性"（只触发重绘）
④ 大量动画考虑 PropertyAnimator 合并 + 关闭自动绘制
```

## 7. 高频面试题

**Q1：补间动画和属性动画的区别？**
A：补间动画只改变 View 的视觉（Matrix 变换），不改变真实属性，动画结束后
点击位置不变、位置可能复位；属性动画真正调用 setter 改变属性值，结束后
保持最终状态，可交互位置正确。

**Q2：插值器和估值器的区别？**
A：插值器把"时间进度"映射为"动画进度"（控制节奏）；估值器把"动画进度"
换算为"具体属性值"（如坐标、颜色）。流程：时间 → 插值器 → 估值器 → setter。

**Q3：ObjectAnimator 为什么能直接操作属性？**
A：反射调用属性的 setter（`setXxx`）。所以要求：属性有 setter、setter 能
触发 View 重绘（invalidate）。不满足时可用自定义 PropertyValuesHolder +
TypeEvaluator，或 ViewPropertyAnimator。

**Q4：动画卡顿如何优化？**
A：用轻量属性（translation/alpha/scale/rotation，走硬件加速）；避免动画中
改变 layout 属性（触发 measure/layout）；减少 onDraw 复杂度；ViewPropertyAnimator
合并多个属性为一次绘制。

**Q5：Compose 动画和 View 动画的区别？**
A：Compose 是声明式，`animateFloatAsState` 等 API 由状态驱动自动重组；
View 动画是命令式，手动控制 Animator 对象。Compose 动画天然支持插值器、
无限动画、动画规格（spring/tween）。

## 8. 小结

- 属性动画三件套：ValueAnimator / ObjectAnimator / AnimatorSet。
- 插值器管节奏，估值器管数值。
- 轻量属性 + 硬件加速 = 流畅动画。
- ViewPropertyAnimator 是简单场景的最佳选择。

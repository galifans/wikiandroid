---
icon: view
title: MeasureSpec 完全解析
description: MeasureSpec 三种模式、EXACTLY/AT_MOST/UNSPECIFIED、getChildMeasureSpec 逻辑与实战
---

# MeasureSpec 完全解析

> 面试高频指数：高
> MeasureSpec 是 View 测量机制的核心，理解了它才算真正理解 onMeasure。

## 1. 什么是 MeasureSpec

**MeasureSpec** 封装了"父容器对子 View 的尺寸要求"，由两部分组成：

```text
32 位 int
├─ 高 2 位：SpecMode（测量模式）
└─ 低 30 位：SpecSize（尺寸大小）
```

```java
// 源码定义
public static class MeasureSpec {
    private static final int MODE_SHIFT = 30;    // 模式位移
    private static final int MODE_MASK  = 0x3 << MODE_SHIFT;

    public static final int UNSPECIFIED = 0 << MODE_SHIFT;  // 不限定
    public static final int EXACTLY     = 1 << MODE_SHIFT;  // 精确
    public static final int AT_MOST     = 2 << MODE_SHIFT;  // 最大

    // 打包：模式 + 尺寸 → MeasureSpec
    public static int makeMeasureSpec(int size, int mode) { ... }

    // 解包
    public static int getMode(int measureSpec) { return measureSpec & MODE_MASK; }
    public static int getSize(int measureSpec) { return measureSpec & ~MODE_MASK; }
}
```

## 2. 三种模式

| 模式 | 含义 | 产生条件 |
| --- | --- | --- |
| `EXACTLY` | 精确尺寸（或 match_parent） | 父 ViewGroup 确定尺寸 |
| `AT_MOST` | 最大不超过 size（wrap_content） | 父 ViewGroup 给上限 |
| `UNSPECIFIED` | 无限制 | ScrollView 等可滚动容器 |

```kotlin
// 从 MeasureSpec 解包
val mode = MeasureSpec.getMode(measureSpec)
val size = MeasureSpec.getSize(measureSpec)

when (mode) {
    MeasureSpec.EXACTLY -> // size 是精确值
    MeasureSpec.AT_MOST -> // size 是最大值
    MeasureSpec.UNSPECIFIED -> // 不限
}
```

## 3. 测量规格的生成：getChildMeasureSpec

父 ViewGroup 测量子 View 时，根据**父容器的 MeasureSpec + 子 View 的 LayoutParams** 生成子 View 的 MeasureSpec：

```java
// ViewGroup.getChildMeasureSpec 核心逻辑（简化）
public static int getChildMeasureSpec(int spec, int padding, int childDimension) {
    int specMode = MeasureSpec.getMode(spec);
    int specSize = MeasureSpec.getSize(spec);

    int size = Math.max(0, specSize - padding);   // 减去父容器 padding

    int resultSize;
    int resultMode;

    switch (specMode) {
        case EXACTLY:                       // 父容器尺寸精确
            if (childDimension >= 0) {      // 子 View 指定具体值
                resultSize = childDimension;
                resultMode = EXACTLY;
            } else if (childDimension == MATCH_PARENT) {   // 匹配父容器
                resultSize = size;
                resultMode = EXACTLY;
            } else if (childDimension == WRAP_CONTENT) {   // 包裹内容
                resultSize = size;
                resultMode = AT_MOST;
            }
            break;

        case AT_MOST:                       // 父容器有上限
            if (childDimension >= 0) {
                resultSize = childDimension;
                resultMode = EXACTLY;
            } else if (childDimension == MATCH_PARENT) {
                resultSize = size;
                resultMode = AT_MOST;
            } else if (childDimension == WRAP_CONTENT) {
                resultSize = size;
                resultMode = AT_MOST;
            }
            break;

        case UNSPECIFIED:                   // 无限制（ScrollView）
            if (childDimension >= 0) {
                resultSize = childDimension;
                resultMode = EXACTLY;
            } else {
                resultSize = 0;
                resultMode = UNSPECIFIED;
            }
            break;
    }
    return MeasureSpec.makeMeasureSpec(resultSize, resultMode);
}
```

### 3.1 规则汇总表

| 父模式 | 子 LayoutParams | 子 MeasureSpec |
| --- | --- | --- |
| EXACTLY | 具体值 | EXACTLY / 具体值 |
| EXACTLY | MATCH_PARENT | EXACTLY / 父大小 |
| EXACTLY | WRAP_CONTENT | AT_MOST / 父大小 |
| AT_MOST | 具体值 | EXACTLY / 具体值 |
| AT_MOST | MATCH_PARENT | AT_MOST / 父上限 |
| AT_MOST | WRAP_CONTENT | AT_MOST / 父上限 |
| UNSPECIFIED | 具体值 | EXACTLY / 具体值 |
| UNSPECIFIED | MATCH/WRAP | UNSPECIFIED / 0 |

## 4. onMeasure 的正确写法

```kotlin
// ✗ 常见错误：wrap_content 失效（等于 match_parent）
override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    setMeasuredDimension(
        MeasureSpec.getSize(widthMeasureSpec),
        MeasureSpec.getSize(heightMeasureSpec)
    )
}

// ✓ 正确处理 wrap_content
override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    // 内容默认尺寸（如 100dp x 100dp）
    val defaultWidth = dp2px(100f)
    val defaultHeight = dp2px(100f)

    val width = resolveSize(defaultWidth, widthMeasureSpec)
    val height = resolveSize(defaultHeight, heightMeasureSpec)

    setMeasuredDimension(width, height)
}

// resolveSize 内部逻辑
// EXACTLY → 返回 specSize
// AT_MOST → min(size, specSize)
// UNSPECIFIED → 返回 size
```

## 5. 完整测量流程

```text
ViewRootImpl.performTraversals()
  └─ performMeasure()
      └─ DecorView.measure(widthSpec, heightSpec)   // 根：屏幕尺寸 EXACTLY
          └─ ViewGroup.onMeasure()
              ├─ measureChildren() / measureChild()
              │   └─ getChildMeasureSpec(父spec, padding, childParams)
              │       └─ child.measure(childSpec)
              │           └─ child.onMeasure()
              └─ setMeasuredDimension()   // 确定自己的最终尺寸
```

## 6. 高频面试题

**Q1：MeasureSpec 有几种模式？分别代表什么？**
A：三种。`EXACTLY`（精确值/match_parent）、`AT_MOST`（上限/wrap_content）、
`UNSPECIFIED`（无限制/ScrollView）。通过 `getMode`/`getSize` 解包。

**Q2：为什么 wrap_content 和 match_parent 效果不同？**
A：因为生成的 MeasureSpec 模式不同：match_parent → EXACTLY（父大小），
wrap_content → AT_MOST（不能超过父大小）。自定义 View 若不处理 AT_MOST，
直接用 specSize，wrap_content 会退化为 match_parent。

**Q3：getChildMeasureSpec 的作用？**
A：父 ViewGroup 结合自身 MeasureSpec 与子 View 的 LayoutParams，计算出子 View
的 MeasureSpec（减去 padding 等），再传给子 View 测量。这是"约束传递"的关键。

**Q4：UNSPECIFIED 什么时候出现？**
A：ScrollView/RecyclerView 等可滚动容器，子 View 高度不受限；以及系统内部
测量（如 View 的 getMeasuredHeight 之前）。此时子 View 按自身内容确定尺寸。

**Q5：measure 和 layout 的尺寸关系？**
A：`measure` 确定 `measuredWidth/measuredHeight`（测量值），`layout` 确定
`left/top/right/bottom` 与 `width/height`（最终值）。layout 可改变最终尺寸，
但通常一致；measure 结果可能被父容器在 layout 时调整。

## 7. 小结

- MeasureSpec = 模式（高2位）+ 尺寸（低30位）。
- EXACTLY / AT_MOST / UNSPECIFIED 三种模式对应三种约束。
- 约束传递链：父 MeasureSpec + 子 LayoutParams → 子 MeasureSpec。
- 自定义 View 必须处理 AT_MOST（wrap_content）模式。

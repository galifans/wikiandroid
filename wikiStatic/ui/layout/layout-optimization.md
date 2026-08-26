---
icon: layout
title: 布局优化实战指南
description: include/merge/ViewStub/ConstraintLayout 优化手段、过度绘制分析、渲染性能工具链实战
---

# 布局优化实战指南

> 面试高频指数：高
> 布局层级直接影响渲染性能，掌握这些手段能让 UI 流畅度显著提升。

## 1. 为什么要优化布局

```text
布局层级越深 → 测量/布局/绘制耗时越长
原因：
① 每个 View 都要 measure + layout + draw（递归）
② 层级深导致过度绘制（Overdraw）
③ 复杂布局阻塞主线程（掉帧）

目标：层级扁平化、延迟加载、减少过度绘制
```

## 2. 四大优化手段

### 2.1 include：复用公共布局

```xml
<!-- 公共布局 item_header.xml -->
<LinearLayout ...>
    <TextView android:id="@+id/tv_title" ... />
</LinearLayout>

<!-- 复用 -->
<include
    layout="@layout/item_header"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />

<!-- 覆盖 id 后可用 findViewById 找到子 View -->
```

**注意**：`include` 的根布局不能有 id，否则覆盖无效；margin 需在 include
标签上设置（根布局的 margin 失效）。

### 2.2 merge：减少嵌套层级

```xml
<!-- 根布局用 merge，被 include 后直接并入父布局，减少一层 -->
<merge>
    <TextView ... />
    <Button ... />
</merge>

<!-- 注意：merge 只能作为 include 的根；ViewStub 的根不可用 merge -->
```

**原理**：`merge` 不生成实际 ViewGroup，其子 View 直接添加进外层容器，减少
一层嵌套。**仅当 include 的根布局是 LinearLayout 且外层也是同类容器时收益最大**。

### 2.3 ViewStub：延迟加载

```xml
<ViewStub
    android:id="@+id/stub_loading"
    android:layout="@layout/view_loading"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />

<!-- 需要时再加载 -->
<ViewStub
    android:id="@+id/stub_error"
    android:layout="@layout/view_error" />
```

::: code-tabs

@tab:active Java

```java
// 触发加载（只会加载一次，inflate 后 ViewStub 被替换为实际布局）
View loadingView = ((ViewStub) findViewById(R.id.stub_loading)).inflate();

// 或
View stubLoading = findViewById(R.id.stub_loading);
if (stubLoading != null) {
    stubLoading.setVisibility(View.VISIBLE);
}
```

@tab Kotlin

```kotlin
// 触发加载（只会加载一次，inflate 后 ViewStub 被替换为实际布局）
val loadingView = findViewById<ViewStub>(R.id.stub_loading).inflate()

// 或
findViewById<View>(R.id.stub_loading)?.visibility = View.VISIBLE
```

:::

**适用场景**：错误页、空状态、引导层等不常用布局。

### 2.4 ConstraintLayout：扁平化布局

```text
传统：多层 LinearLayout 嵌套（3-5 层）
优化：单层 ConstraintLayout（1 层）

ConstraintLayout 优势：
① 一次测量解决所有约束（测量优化）
② 支持 0dp 比例、链、Guideline、Barrier、Group
③ 配合 MotionLayout 做动画
```

```xml
<androidx.constraintlayout.widget.ConstraintLayout ...>
    <TextView
        android:id="@+id/title"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <Button
        app:layout_constraintStart_toEndOf="@id/title"
        app:layout_constraintBaseline_toBaselineOf="@id/title" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

## 3. 过度绘制（Overdraw）

### 3.1 什么是过度绘制

```text
同一像素被绘制多次
系统检查：开发者选项 → 调试 GPU 过度绘制

颜色含义：
- 无颜色：未过度绘制（正常）
- 蓝色：绘制 1 次
- 绿色：绘制 2 次
- 粉色：绘制 3 次
- 红色：绘制 4 次+（严重）
```

### 3.2 常见原因与解决

| 原因 | 解决 |
| --- | --- |
| 根布局/子 View 重复设置背景 | 删除重复背景 |
| 圆角背景（阴影） | 减少阴影层级、clipToOutline |
| 复杂动画（模糊、阴影） | 控制动画范围 |
| 多层级窗口 | 透明窗口设置为 false |

::: code-tabs

@tab:active Java

```java
// 减少绘制区域
canvas.clipRect(0, 0, getWidth() / 2, getHeight());

// 移除不必要的背景
view.setBackground(null);
```

@tab Kotlin

```kotlin
// 减少绘制区域
canvas.clipRect(0, 0, width / 2, height)

// 移除不必要的背景
view.background = null
```

:::

## 4. 分析工具链

| 工具 | 用途 |
| --- | --- |
| Layout Inspector | 查看层级树、各 View 属性与耗时 |
| GPU 过度绘制调试 | 可视化过度绘制 |
| Profile GPU Rendering | 每帧渲染耗时（柱状图） |
| Systrace / Perfetto | 系统级性能分析（Vsync/Choreographer） |
| lint | 静态检查布局层级警告 |

```text
关键指标：16ms/帧（60fps）
超过即掉帧（jank）
```

## 5. 高频面试题

**Q1：include、merge、ViewStub 的区别？**
A：include 复用布局；merge 合并根布局（减少一层嵌套，仅作 include 的根）；
ViewStub 延迟加载（不常用布局按需 inflate，inflate 后不可复用）。

**Q2：为什么 ConstraintLayout 能减少测量次数？**
A：ConstraintLayout 一次遍历即可确定所有子 View 的约束关系，无需像嵌套
LinearLayout 那样逐层测量；配合 0dp 比例避免二次测量（LinearLayout 的
weight 需要二次测量）。

**Q3：如何定位布局卡顿？**
A：先用 Layout Inspector 看层级与耗时；用 GPU 过度绘制看 Overdraw；
用 Systrace/Perfetto 分析主线程与渲染线程；逐级优化（去掉深层嵌套、
ViewStub 化、ConstraintLayout 化）。

**Q4：ViewStub 和 GONE 的区别？**
A：GONE 的 View 仍会创建对象、参与测量（只是不显示）；ViewStub 是 0 尺寸
的轻量占位，inflate 前不创建实际 View，加载后替换自身。更适合"几乎不用"
的布局。

**Q5：布局优化的最佳实践？**
A：① 能 ConstraintLayout 就单层；② 公共布局 include+merge；③ 不常用
布局 ViewStub；④ 删除多余背景减少 Overdraw；⑤ 用 lint 与 Layout Inspector
定期检查；⑥ 列表 item 布局尽量扁平（RecyclerView 复用）。

## 6. 小结

- 层级 = 性能：能平则平（ConstraintLayout）。
- 复用用 include，减层用 merge，懒加载用 ViewStub。
- 过度绘制四色调试，红区必查。
- 工具链：Layout Inspector + Overdraw + Perfetto。

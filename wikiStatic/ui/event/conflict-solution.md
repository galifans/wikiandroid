---
icon: touch
title: 滑动冲突解决方案
description: 三种滑动冲突场景、外部拦截法与内部拦截法、NestedScrolling 机制实战
---

# 🔄 滑动冲突解决方案

> 面试高频指数：⭐⭐⭐⭐⭐
> 滑动冲突是事件分发机制的实战应用，几乎每个复杂页面都会遇到。

## 1. 滑动冲突的三种场景

| 场景 | 示例 | 冲突本质 |
| --- | --- | --- |
| 外部滑动方向不同 | ViewPager（横向）+ ListView（纵向） | 方向不同，按方向分 |
| 内部滑动方向不同 | ScrollView（纵向）+ 内部横向 ViewPager | 方向不同，按方向分 |
| 内外同方向 | ScrollView 嵌套 RecyclerView | 方向相同，按业务分 |

## 2. 解决方案一：外部拦截法（推荐）

**思路**：父 View 在 `onInterceptTouchEvent` 中根据业务规则决定是否拦截。

```kotlin
// 父容器（如纵向 ScrollView）外部拦截法
override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
    var intercepted = false
    when (ev.actionMasked) {
        MotionEvent.ACTION_DOWN -> {
            // DOWN 不拦截（一旦拦截，后续事件全给父 View，子 View 无法工作）
            intercepted = false
        }
        MotionEvent.ACTION_MOVE -> {
            // 纵向滑动 → 父 View 拦截（处理滑动）
            // 横向滑动 → 不拦截（交给子 View）
            intercepted = isVerticalScroll(ev) && shouldIntercept()
        }
        MotionEvent.ACTION_UP -> {
            intercepted = false     // UP 无需拦截
        }
    }
    return intercepted
}
```

**规则口诀**：**DOWN 不拦、MOVE 判断、UP 不拦**。

### 2.1 判断滑动方向

```kotlin
// 记录 DOWN 坐标，在 MOVE 中判断方向
private var lastX = 0f
private var lastY = 0f

override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
    var intercepted = false
    when (ev.actionMasked) {
        MotionEvent.ACTION_DOWN -> {
            lastX = ev.x
            lastY = ev.y
            intercepted = false
        }
        MotionEvent.ACTION_MOVE -> {
            val dx = ev.x - lastX
            val dy = ev.y - lastY
            // 纵向距离 > 横向距离 → 纵向滑动 → 拦截
            intercepted = abs(dy) > abs(dx) && abs(dy) > touchSlop
        }
        else -> intercepted = false
    }
    return intercepted
}
```

> `touchSlop`：`ViewConfiguration.get(context).scaledTouchSlop`，系统滑动最小距离。

## 3. 解决方案二：内部拦截法

**思路**：子 View 消费 DOWN，通过 `requestDisallowInterceptTouchEvent(true)`
禁止父 View 拦截，需要时再"归还"。

```kotlin
// 子 View（如内部 RecyclerView）内部拦截法
override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
    when (ev.actionMasked) {
        MotionEvent.ACTION_DOWN -> {
            // 禁止父 View 拦截
            parent.requestDisallowInterceptTouchEvent(true)
        }
        MotionEvent.ACTION_MOVE -> {
            // 父 View 需要处理时，允许父 View 拦截
            if (shouldParentIntercept(ev)) {
                parent.requestDisallowInterceptTouchEvent(false)
            }
        }
    }
    return super.dispatchTouchEvent(ev)
}

// 配合父 View：拦截除 DOWN 以外的所有事件
override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
    return ev.actionMasked != MotionEvent.ACTION_DOWN
}
```

**注意**：`FLAG_DISALLOW_INTERCEPT` 标志在 DOWN 事件时会被重置，所以子 View
必须在 DOWN 中重新调用。

## 4. 解决方案三：NestedScrolling（现代方案）

Android 5.0+ 提供了 NestedScrolling 嵌套滚动机制，**无需拦截**即可协调父子滚动。

```text
参与者：
NestedScrollingChild   （如 RecyclerView、NestedScrollView）
NestedScrollingParent  （如 CoordinatorLayout）

流程：
子 View 滚动前先询问父 View（dispatchNestedPreScroll）
父 View 消耗一部分（onNestedPreScroll）
剩余部分子 View 自己滚动
子 View 滚动后再通知父 View（dispatchNestedScroll）
```

```kotlin
// 父容器（CoordinatorLayout.Behavior 示例）
class HeaderBehavior : CoordinatorLayout.Behavior<View>() {

    // 子 View 滚动前：父 View 先"预消费"
    override fun onNestedPreScroll(
        coordinatorLayout: CoordinatorLayout,
        child: View,
        target: View,
        dx: Int, dy: Int,
        consumed: IntArray
    ) {
        // 如：向上滑动时先收起头部（消费 dy）
        if (dy > 0 && headerVisible) {
            child.translationY -= dy
            consumed[1] = dy     // 告知子 View 已消费多少
        }
    }
}
```

**优点**：各层只关心"消费多少"，不需要判断谁拦截，逻辑清晰；
兼容 `NestedScrollView`、`RecyclerView`、`CoordinatorLayout`。

## 5. 高频面试题

**Q1：外部拦截法和内部拦截法的区别？**
A：外部拦截在父 View 的 onInterceptTouchEvent 中判断（DOWN 不拦、MOVE 判断、
UP 不拦）；内部拦截在子 View 的 dispatchTouchEvent 中通过
requestDisallowInterceptTouchEvent 控制（DOWN 禁止拦截、需要时归还）。
推荐外部拦截法，逻辑简单可控。

**Q2：ViewPager 与 ListView 嵌套如何解决冲突？**
A：ViewPager 是横向、ListView 是纵向，方向不同。按滑动方向判断：
横向滑动交给 ViewPager，纵向滑动交给 ListView。外部拦截法即可。

**Q3：NestedScrolling 相比传统拦截法的优势？**
A：不需要拦截事件，通过"预消费-后消费"机制协调，子 View 与父 View 各消费
一部分（如头部收起 + 列表滚动同时进行）；支持惯性滚动传递；代码清晰可复用。

**Q4：requestDisallowInterceptTouchEvent 什么时候会被重置？**
A：DOWN 事件分发时 ViewGroup 会清除 `FLAG_DISALLOW_INTERCEPT`，所以子 View
需要在每次 DOWN 时重新设置，否则 MOVE 阶段父 View 会恢复拦截。

**Q5：滑动冲突在 CoordinatorLayout 中如何解决？**
A：通过 Behavior 的 `onNestedPreScroll`/`onNestedScroll` 回调实现联动，
不需要手写事件拦截。这是 NestedScrolling 机制的官方实践。

## 6. 小结

- 三类冲突：内外方向不同（按方向分）、同方向（按业务分）。
- 外部拦截法：父 View 判断（推荐，简单可靠）。
- 内部拦截法：子 View 控制（需处理 DOWN 重置）。
- NestedScrolling：现代方案的协调机制，优先使用。

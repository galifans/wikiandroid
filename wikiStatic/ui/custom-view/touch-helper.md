---
icon: hand
title: 触摸辅助类与 View 滑动
---

# 触摸辅助类与 View 滑动

> VelocityTracker 追踪滑动速度、GestureDetector 检测手势、Scroller 实现弹性滑动，三者是自定义 View 交互的常用辅助类。

## 一、VelocityTracker 速度追踪

VelocityTracker 用于追踪手指在滑动中的速度：

```java
view.setOnTouchListener(new View.OnTouchListener() {
    @Override
    public boolean onTouch(View v, MotionEvent event) {
        VelocityTracker velocityTracker = VelocityTracker.obtain();
        velocityTracker.addMovement(event);
        velocityTracker.computeCurrentVelocity(1000);  // 单位：像素/秒
        int xVelocity = (int) velocityTracker.getXVelocity();
        int yVelocity = (int) velocityTracker.getYVelocity();
        velocityTracker.clear();
        velocityTracker.recycle();
        return false;
    }
});
```

## 二、GestureDetector 手势检测

GestureDetector 辅助检测单击、滑动、长按、双击等行为：

```java
final GestureDetector mGestureDetector = new GestureDetector(this,
        new GestureDetector.OnGestureListener() {
    @Override public boolean onDown(MotionEvent e) { return false; }
    @Override public void onShowPress(MotionEvent e) { }
    @Override public boolean onSingleTapUp(MotionEvent e) { return false; }
    @Override public boolean onScroll(MotionEvent e1, MotionEvent e2,
            float distanceX, float distanceY) { return false; }
    @Override public void onLongPress(MotionEvent e) { }
    @Override public boolean onFling(MotionEvent e1, MotionEvent e2,
            float velocityX, float velocityY) { return false; }
});

mGestureDetector.setOnDoubleTapListener(new OnDoubleTapListener() {
    @Override public boolean onSingleTapConfirmed(MotionEvent e) { return false; }
    @Override public boolean onDoubleTap(MotionEvent e) { return false; }
    @Override public boolean onDoubleTapEvent(MotionEvent e) { return false; }
});

// 解决长按屏幕后无法拖动的问题
mGestureDetector.setIsLongpressEnabled(false);

imageView.setOnTouchListener(new View.OnTouchListener() {
    @Override
    public boolean onTouch(View v, MotionEvent event) {
        return mGestureDetector.onTouchEvent(event);
    }
});
```

::: tip 选择建议
监听滑动相关建议在 `onTouchEvent` 中实现；监听双击等复杂手势使用 `GestureDetector`。
:::

## 三、Scroller 弹性滑动

Scroller 本身无法让 View 弹性滑动，需要和 View 的 `computeScroll` 方法配合使用：

```java
Scroller mScroller = new Scroller(mContext);

private void smoothScrollTo(int destX) {
    int scrollX = getScrollX();
    int delta = destX - scrollX;
    // 1000ms 内滑向 destX，效果就是慢慢滑动
    mScroller.startScroll(scrollX, 0, delta, 0, 1000);
    invalidate();
}

@Override
public void computeScroll() {
    if (mScroller.computeScrollOffset()) {
        scrollTo(mScroller.getCurrX(), mScroller.getCurrY());
        postInvalidate();
    }
}
```

**原理：** `startScroll` 本身无法让 View 滑动；`invalidate` 导致 View 重绘，重绘时在 `draw` 方法中调用 `computeScroll`，`computeScroll` 向 Scroller 获取当前 scrollX/scrollY，通过 `scrollTo` 滑动，再调用 `postInvalidate` 如此反复，直到滑动结束。

## 四、View 的滑动方式

### 1. scrollTo / scrollBy

适合对 View 内容的滑动，`scrollBy` 实际上也是调用了 `scrollTo`：

```java
public void scrollTo(int x, int y) {
    if (mScrollX != x || mScrollY != y) {
        int oldX = mScrollX;
        int oldY = mScrollY;
        mScrollX = x;
        mScrollY = y;
        invalidateParentCaches();
        onScrollChanged(mScrollX, mScrollY, oldX, oldY);
        if (!awakenScrollBars()) {
            postInvalidateOnAnimation();
        }
    }
}

public void scrollBy(int x, int y) {
    scrollTo(mScrollX + x, mScrollY + y);
}
```

**要点：**

- `mScrollX` 等于 View 左边缘与 View 内容左边缘在水平方向的距离；
- `mScrollY` 等于 View 上边缘与 View 内容上边缘在竖直方向的距离；
- `scrollTo/scrollBy` 只能改变 View 内容的位置，不能改变 View 在布局中的位置。

### 2. 使用动画

操作简单，主要适用于没有交互的 View 和实现复杂动画效果。

### 3. 改变布局参数

操作稍微复杂，适用于有交互的 View：

```java
ViewGroup.MarginLayoutParams params =
        (ViewGroup.MarginLayoutParams) view.getLayoutParams();
params.width += 100;
params.leftMargin += 100;
view.requestLayout();
// 或者 view.setLayoutParams(params);
```

## 五、方式对比

| 滑动方式 | 特点 | 适用场景 |
| --- | --- | --- |
| scrollTo/scrollBy | 简单，只能滑动内容 | 内容滚动 |
| 动画 | 简单，无交互 | 无交互 View、复杂动画 |
| 改变布局参数 | 灵活，可交互 | 有交互的 View |

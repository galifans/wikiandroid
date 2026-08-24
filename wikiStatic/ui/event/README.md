---
icon: touch
title: 事件分发机制
---

# 👆 事件分发机制

事件分发是 Android 交互的核心机制，也是面试必考难点。

## 文章列表

- [事件分发机制完全解析](event-dispatch.md)
- [滑动冲突解决方案](conflict-solution.md)

## 核心要点

1. **三个核心方法**：`dispatchTouchEvent` / `onInterceptTouchEvent` / `onTouchEvent`
2. **分发顺序**：Activity → ViewGroup → View（自顶向下），消费则终止
3. **责任链**：子 View 不消费，事件回传给父 View
4. **滑动冲突**：外部拦截法 / 内部拦截法

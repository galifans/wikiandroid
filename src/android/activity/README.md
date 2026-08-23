---
icon: activity
title: Activity
---

# 🧩 Activity

Activity 是 Android 四大组件之首，承载用户交互界面。

## 文章列表

- [Activity 生命周期与启动模式](activity-lifecycle.md)
- [Activity 任务栈与返回栈](task-stack.md)（待更新）
- [Activity 启动流程源码分析](activity-launch-process.md)（待更新）

## 核心要点

1. **生命周期**：`onCreate` → `onStart` → `onResume` → `onPause` → `onStop` → `onDestroy`
2. **启动模式**：`standard` / `singleTop` / `singleTask` / `singleInstance`
3. **任务栈**：Task 与 Back Stack 的关系
4. **进程被杀恢复**：`onSaveInstanceState` / `onRestoreInstanceState`

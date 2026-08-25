---
icon: activity
title: Activity
shortTitle: 概览
dir:
  text: Activity
  order: 1
---

# 🧩 Activity

Activity 是 Android 四大组件之首，承载用户交互界面。

## 文章列表

- [Activity 生命周期与启动模式](activity-lifecycle.md)
- [Intent 匹配规则](intent-filter.md)
- [Activity 任务栈与返回栈](task-stack.md)
- [Activity 启动流程源码分析](activity-launch-process.md)

## 核心要点

1. **生命周期**：`onCreate` → `onStart` → `onResume` → `onPause` → `onStop` → `onDestroy`，掌握典型场景回调顺序（如内存不足回收无 `onDestroy`）
2. **启动模式**：`standard` / `singleTop` / `singleTask` / `singleInstance`，配合 Intent Flags 灵活控制
3. **状态保存**：配置变更 / 进程被杀场景下 `onSaveInstanceState` + ViewModel + SavedStateHandle 的配合
4. **任务栈**：Task 与 Back Stack 的关系、`allowTaskReparenting`、多窗口模式适配
5. **源码链路**：从 `startActivity` 到 `onResume` 的完整启动流程与冷启动优化

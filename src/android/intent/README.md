---
icon: route
title: Intent 与组件通信
shortTitle: 概览
dir:
  text: Intent 与组件通信
  order: 6
---

# Intent 与组件通信

Intent 是 Android 四大组件之间通信的"邮递员"——它携带动作、数据与目标信息，驱动 Activity / Service / BroadcastReceiver 三大组件完成页面跳转、服务启动与广播发送。理解 Intent 的解析机制是掌握组件间通信的钥匙。

## 文章列表

- [Intent 详解：显式与隐式](./intent-basics.md)
- [IntentFilter 匹配规则](./intent-filter.md)

## 核心要点

1. **显式与隐式**：显式指定组件类名（应用内跳转首选）；隐式依赖 IntentFilter 匹配（跨应用能力复用）
2. **IntentFilter 三大匹配**：`action`（必选）、`category`（默认 `DEFAULT`）、`data`（scheme/host/port/path）
3. **Flags 与 Extras**：`FLAG_ACTIVITY_NEW_TASK` / `CLEAR_TOP` 等控制任务栈行为；Extras 传递数据
4. **组件间通信**：Activity 跳转、Service 启动/绑定、广播发送（普通/有序/粘性）都通过 Intent 完成
5. **安全**：隐式 Intent 建议显式声明包名或使用 `createChooser`，避免组件暴露与恶意调用

## 关联阅读

- [Activity 任务栈与返回栈](/android/activity/task-stack.md)：Flags 如何影响任务栈
- [BroadcastReceiver 详解](/android/broadcast/broadcast-basics.md)：广播如何通过 Intent 分发
- [Context 详解](/android/context/context-overview.md)：`startActivity` 需要 Activity Context 的原因

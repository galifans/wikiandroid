---
icon: activity
title: Activity 库
shortTitle: 概览
dir:
  text: Activity 库
  order: 6
---

# Activity 库

基于 androidx.activity 的现代 Activity 能力：ActivityResult API、Edge-to-Edge、预测性返回。

## 文章列表

- [ActivityResult API 详解](activity-result.md) — registerForActivityResult / ActivityResultContracts / 生命周期安全
- [Edge-to-Edge 全面屏适配](activity-edge2edge.md) — enableEdgeToEdge / WindowInsets / 预测性返回

## 核心概念

1. **ActivityResult API**：替代已废弃的 startActivityForResult / onActivityResult
2. **生命周期安全**：回调在 STARTED 之后注册、与状态恢复联动
3. **ActivityResultContracts**：内置相机、权限、文件选择等契约
4. **Edge-to-Edge**：Android 15+ 强制，内容延伸到系统栏之后
5. **预测性返回**：OnBackPressedDispatcher 统一返回事件处理

## 学习资源

- [Android Activity 机制](/android/activity/)
- [Fragment 通信](/android/fragment/fragment-communication.md)

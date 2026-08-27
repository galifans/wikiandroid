---
icon: fragment
title: Fragment 库原理
shortTitle: 概览
dir:
  text: Fragment 库原理
  order: 11
---

# Fragment 库原理

深入 androidx.fragment 库：FragmentManager 源码、事务机制、状态保存、FragmentFactory。

## 文章列表

- [FragmentManager 源码解析](fragment-source.md) — FragmentManager / 事务 / 状态保存 / FragmentFactory / 回退栈

## 核心概念

1. **FragmentManager**：Fragment 的调度中心，管理事务与状态
2. **状态保存**：FragmentState / SavedState 机制，自动保存 View 状态
3. **FragmentFactory**：自定义 Fragment 实例化入口
4. **回退栈**：popBackStack 与保存/恢复

## 学习资源

- [Fragment 生命周期与通信](/android/fragment/fragment-basics.md)
- [Fragment 常见坑点总结](/android/fragment/fragment-pitfalls.md)
- [Jetpack Navigation](/jetpack/paging-navigation/navigation.md)

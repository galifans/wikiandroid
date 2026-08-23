---
icon: fragment
title: Fragment
---

# 🧩 Fragment

Fragment 是界面模块化与适配多屏的核心组件。

## 文章列表

- [Fragment 生命周期与通信](fragment-basics.md)
- [Fragment 常见坑点总结](fragment-pitfalls.md)（待更新）

## 核心要点

1. **生命周期**：与 Activity 生命周期联动，包含 `onCreateView`、`onViewCreated`
2. **FragmentManager 事务**：`add` / `replace` / `remove` / `show` / `hide`
3. **通信方式**：接口回调、ViewModel 共享、`setFragmentResult`
4. **常见坑**：状态丢失、重叠问题、`commit` 时机

## 使用建议

- 单 Activity + 多 Fragment 架构（推荐）
- 使用 Navigation 组件管理 Fragment 导航
- 避免在 `onActivityCreated` 之前提交事务

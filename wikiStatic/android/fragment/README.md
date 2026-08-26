---
icon: fragment
title: Fragment
shortTitle: 概览
dir:
  text: Fragment
  order: 5
---

# Fragment

Fragment 是界面模块化与适配多屏的核心组件。

## 文章列表

- [Fragment 生命周期与通信](fragment-basics.md)
- [Fragment 常见坑点总结](fragment-pitfalls.md)

## 核心要点

1. **生命周期**：与 Activity 联动，**实例生命周期与 View 生命周期分离**是核心心智模型
2. **FragmentManager 事务**：`add` / `replace` / `remove` / `show` / `hide` / `detach`，嵌套用 `childFragmentManager`
3. **通信方式**：共享 ViewModel、`setFragmentResult`、接口回调、直接引用
4. **状态保存**：arguments / View 状态 / onSaveInstanceState / ViewModel 的职责划分
5. **常见坑**：状态丢失、重叠问题、`commit` 时机、`viewLifecycleOwner` 时序

## 使用建议

- 单 Activity + 多 Fragment 架构（推荐），配合 Navigation 组件管理导航
- View 操作绑定 `viewLifecycleOwner`，异步用 `lifecycleScope`
- 提交事务前判断 `isStateSaved`

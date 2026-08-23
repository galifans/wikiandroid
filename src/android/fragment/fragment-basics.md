---
icon: fragment
title: Fragment 详解
---

# Fragment 生命周期与通信

> Fragment 表示 Activity 中的一段可重用 UI，支持在不同屏幕尺寸下灵活组合。

## 一、生命周期

Fragment 的生命周期与宿主 Activity 联动，并多出两个关键回调：

```
onAttach → onCreate → onCreateView → onViewCreated → onStart → onResume
onPause → onStop → onDestroyView → onDestroy → onDetach
```

| 回调 | 时机 |
|------|------|
| `onAttach` | 与 Activity 关联 |
| `onCreateView` | 创建 UI 视图（inflate 布局） |
| `onViewCreated` | 视图创建完成（初始化 View） |
| `onDestroyView` | 视图销毁（注意与 Fragment 销毁的区别） |

::: warning 常见误区
`onDestroyView` 后 Fragment 实例仍在，但视图已销毁。**切勿在 View 销毁后仍持有 View 引用**，否则会造成内存泄漏。
:::

## 二、Fragment 事务管理

```kotlin
supportFragmentManager.commit {
    setReorderingAllowed(true)
    add<DetailFragment>(R.id.fragment_container)
    addToBackStack("detail")  // 加入返回栈
}
```

**常用操作**：

| 操作 | 说明 |
|------|------|
| `add` | 添加（叠加显示） |
| `replace` | 替换（移除旧 Fragment） |
| `show` / `hide` | 显示/隐藏（保留状态） |
| `remove` | 移除 |

## 三、Fragment 间通信

### 1. 共享 ViewModel（推荐）

```kotlin
class SharedViewModel : ViewModel() { ... }

// 两个 Fragment 获取同一实例
val vm: SharedViewModel by activityViewModels()
```

### 2. setFragmentResult

```kotlin
// 发送方
setFragmentResult("request_key", bundleOf("result" to "data"))

// 接收方
setFragmentResultListener("request_key") { key, bundle ->
    val data = bundle.getString("result")
}
```

### 3. 接口回调

```kotlin
interface OnItemClickListener {
    fun onItemClick(item: Item)
}
```

## 四、高频面试题

1. Fragment 与 Activity 的通信方式有哪些？
2. `add` 与 `replace` 的区别？谁更容易造成重叠？
3. Fragment 状态丢失（`IllegalStateException: Can not perform this action after onSaveInstanceState`）如何解决？
4. 如何解决 Fragment 重叠问题（进程被杀死恢复）？

> 📖 进阶阅读：[Fragment 常见坑点总结](fragment-pitfalls.md)（待更新）| [Paging / Navigation](/jetpack/paging-navigation/)

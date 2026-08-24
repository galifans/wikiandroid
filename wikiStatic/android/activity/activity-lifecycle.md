---
icon: activity
title: Activity 生命周期
---

# Activity 生命周期与启动模式

> Activity 是 Android 四大组件之首，理解其生命周期与启动模式是开发与面试的核心。

## 一、生命周期详解

### 完整生命周期

| 回调 | 时机 | 典型操作 |
|------|------|----------|
| `onCreate` | 首次创建 | 初始化布局、绑定数据 |
| `onStart` | 可见但不可交互 | 注册广播/观察者 |
| `onResume` | 可交互（前台） | 开始动画、恢复传感器 |
| `onPause` | 失去焦点（部分可见） | 暂停动画、释放资源 |
| `onStop` | 完全不可见 | 停止后台任务 |
| `onRestart` | 从 Stop 回到 Start | 恢复状态 |
| `onDestroy` | 销毁 | 释放全部资源、解绑 |

### 常见场景回调顺序

- **首次启动**：`onCreate → onStart → onResume`
- **打开新 Activity**：A 的 `onPause` → B 的 `onCreate/onStart/onResume` → A 的 `onStop`
- **返回键退出**：`onPause → onStop → onDestroy`
- **Home 键**：`onPause → onStop`（不销毁）
- **屏幕旋转**：`onPause → onStop → onDestroy → onCreate → onStart → onResume`

## 二、启动模式（Launch Mode）

| 模式 | 行为 | 适用场景 |
|------|------|----------|
| `standard` | 每次创建新实例 | 默认模式 |
| `singleTop` | 栈顶已存在则复用（回调 `onNewIntent`） | 通知栏跳转 |
| `singleTask` | 栈内唯一，会清理其上方 Activity | 主页面、详情页 |
| `singleInstance` | 全局唯一，独立任务栈 | 拨号、来电界面 |

```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask" />
```

**Intent Flags**：`FLAG_ACTIVITY_NEW_TASK`、`FLAG_ACTIVITY_CLEAR_TOP` 与启动模式等价，动态优先级更高。

## 三、状态保存与恢复

```kotlin
override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)
    outState.putString("input", inputText.text.toString())
}

override fun onRestoreInstanceState(savedInstanceState: Bundle) {
    super.onRestoreInstanceState(savedInstanceState)
    inputText.setText(savedInstanceState.getString("input"))
}
```

::: tip
- 内存不足杀进程时才会触发 `onSaveInstanceState`
- 系统配置变更（旋转屏幕）也会触发，推荐使用 `ViewModel` + `SavedStateHandle` 保存状态
:::

## 四、面试高频追问

1. `onPause` 与 `onStop` 的区别？
2. `singleTask` 的 `onNewIntent` 何时触发？
3. 进程被杀后如何恢复状态？
4. 为什么 `onSaveInstanceState` 不能在 `onPause` 之后调用？

> 📖 进阶阅读：[Activity 启动流程源码分析](activity-launch-process.md) | [Fragment](/android/fragment/)

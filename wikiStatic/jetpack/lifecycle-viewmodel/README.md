---
icon: lifecycle
title: Lifecycle / ViewModel
shortTitle: 概览
dir:
  text: Lifecycle / ViewModel
  order: 1
---

# 🔄 Lifecycle / ViewModel / LiveData

Jetpack 生命周期组件，解决组件生命周期管理难题。

## 文章列表

- [Lifecycle 原理与使用](lifecycle.md)
- [ViewModel 与 LiveData 详解](viewmodel-livedata.md)
- [SavedStateHandle 状态保存](savedstate.md)
- [ViewModel 源码解析](viewmodel-source.md) — ViewModelStore/onCleared/viewModelScope 原理

## 核心要点

1. **Lifecycle**：观察者模式，`LifecycleOwner` + `LifecycleObserver`
2. **ViewModel**：持有 UI 数据，配置变更（旋转）不丢失，随 View 销毁而清空
3. **LiveData**：可观察数据，感知生命周期，仅在活跃状态回调
4. **替代方案**：Kotlin Flow + StateFlow 逐渐成为主流（Compose 场景推荐）

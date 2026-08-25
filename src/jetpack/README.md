---
icon: boxes
title: Jetpack
index: false
---

# 🧩 Jetpack 全家桶

Android 官方组件库，助力构建健壮、可维护的应用。

## 分类

| 分类 | 组件 | 入口 |
|------|------|------|
| 声明式 UI | Jetpack Compose | [Jetpack Compose](/jetpack/compose/) |
| 生命周期 | Lifecycle / ViewModel / LiveData | [Lifecycle / ViewModel](/jetpack/lifecycle-viewmodel/) |
| 数据持久化 | Room / DataStore | [Room / DataStore](/jetpack/room-datastore/) |
| 导航与分页 | Paging / Navigation | [Paging / Navigation](/jetpack/paging-navigation/) |
| 后台与注入 | WorkManager / Hilt | [WorkManager / Hilt](/jetpack/workmanager-hilt/) |

## 核心组件关系

```
UI（Activity/Fragment/Compose）
   │ 观察
   ▼
ViewModel ──→ LiveData / StateFlow
   │
   ├── Room（数据库）
   ├── DataStore（KV）
   ├── WorkManager（后台任务）
   └── Paging（分页加载）
```

## 📑 全部文章导航

### 🧩 声明式 UI
- [Compose 核心概念](/jetpack/compose/compose-basics.md)：声明式 UI / 重组 / Modifier
- [Compose 状态管理](/jetpack/compose/compose-state.md)：remember / mutableStateOf
- [Compose 性能优化](/jetpack/compose/compose-performance.md)：重组优化 / 列表性能
- [Compose 布局系统](/jetpack/compose/compose-layout.md)：Row/Column/Box / ConstraintLayout / 自定义 Layout
- [Compose 动画](/jetpack/compose/compose-animation.md)：animate*AsState / Animatable / 转场
- [Compose 与 View 互操作](/jetpack/compose/compose-interop.md)：AndroidView / ComposeView / 渐进式迁移

### 🔄 生命周期
- [Lifecycle 组件详解](/jetpack/lifecycle-viewmodel/lifecycle.md)：LifecycleOwner / 观察者
- [ViewModel + LiveData](/jetpack/lifecycle-viewmodel/viewmodel-livedata.md)：状态保存 / 数据驱动 UI
- [SavedStateHandle 状态保存](/jetpack/lifecycle-viewmodel/savedstate.md)：进程被杀恢复
- [ViewModel 源码解析](/jetpack/lifecycle-viewmodel/viewmodel-source.md)：ViewModelStore / onCleared / viewModelScope

### 🗄️ 数据持久化
- [Room 数据库详解](/jetpack/room-datastore/room-guide.md)：Entity / DAO / 迁移 / 协程
- [DataStore 使用指南](/jetpack/room-datastore/datastore-guide.md)：Preferences / Proto
- [Room 高级进阶](/jetpack/room-datastore/room-advanced.md)：实体关系 / TypeConverter / 事务 / Flow

### 🧭 导航与分页
- [Paging 3 分页加载](/jetpack/paging-navigation/paging3.md)：PagingSource / 加载状态
- [Navigation 导航组件](/jetpack/paging-navigation/navigation.md)：导航图 / 参数传递
- [Navigation 高级进阶](/jetpack/paging-navigation/navigation-advanced.md)：类型安全导航 / Deep Link / 返回栈

### ⚙️ 后台与注入
- [WorkManager 后台任务](/jetpack/workmanager-hilt/workmanager.md)：约束 / 链式任务
- [Hilt 依赖注入](/jetpack/workmanager-hilt/hilt.md)：模块 / 限定符 / 组件作用域
- [Hilt 依赖注入进阶](/jetpack/workmanager-hilt/hilt-advanced.md)：多模块 / 测试替身 / 协程集成

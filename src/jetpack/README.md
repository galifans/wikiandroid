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

### 🔄 生命周期
- [Lifecycle 组件详解](/jetpack/lifecycle-viewmodel/lifecycle.md)：LifecycleOwner / 观察者
- [ViewModel + LiveData](/jetpack/lifecycle-viewmodel/viewmodel-livedata.md)：状态保存 / 数据驱动 UI
- [SavedStateHandle 状态保存](/jetpack/lifecycle-viewmodel/savedstate.md)：进程被杀恢复

### 🗄️ 数据持久化
- [Room 数据库详解](/jetpack/room-datastore/room-guide.md)：Entity / DAO / 迁移 / 协程
- [DataStore 使用指南](/jetpack/room-datastore/datastore-guide.md)：Preferences / Proto

### 🧭 导航与分页
- [Paging 3 分页加载](/jetpack/paging-navigation/paging3.md)：PagingSource / 加载状态
- [Navigation 导航组件](/jetpack/paging-navigation/navigation.md)：导航图 / 参数传递

### ⚙️ 后台与注入
- [WorkManager 后台任务](/jetpack/workmanager-hilt/workmanager.md)：约束 / 链式任务
- [Hilt 依赖注入](/jetpack/workmanager-hilt/hilt.md)：模块 / 限定符 / 组件作用域

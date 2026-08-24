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

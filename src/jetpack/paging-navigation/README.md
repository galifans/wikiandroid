---
icon: paging
title: Paging / Navigation
---

# 📄 Paging / Navigation

分页加载与导航组件。

## 文章列表

- [Paging 3 分页加载](paging3.md)
- [Navigation 组件使用](navigation.md)

## 核心要点

### Paging 3
1. **数据源**：`PagingSource`（加载分页数据）
2. **PagingData**：分页数据流，`PagingDataAdapter` 展示
3. **RemoteMediator**：网络 + 数据库缓存架构
4. **加载状态**：`LoadState` 管理 loading / error / refresh

### Navigation
1. **NavHost**：导航宿主（Fragment / Compose）
2. **NavController**：导航控制器
3. **类型安全导航**：Navigation Compose 2.8+ 支持 `@Serializable` 路由
4. **返回栈管理**：`popBackStack` / 深链

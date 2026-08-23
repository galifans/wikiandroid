---
icon: database
title: Room / DataStore
---

# 🗄️ Room / DataStore

Jetpack 数据持久化方案：Room（关系型）与 DataStore（键值）。

## 文章列表

- [Room 数据库完全指南](room-guide.md)（待更新）
- [DataStore 使用详解](datastore-guide.md)（待更新）

## 核心要点

### Room
1. **三要素**：`@Entity`（表）、`@Dao`（数据访问）、`@Database`（数据库）
2. **编译期校验**：SQL 语句编译期检查
3. **Flow 支持**：`@Query` 返回 Flow，数据变化自动推送
4. **迁移**：`Migration` 处理数据库升级

### DataStore
1. **Preferences DataStore**：KV 存储（替代 SharedPreferences）
2. **Proto DataStore**：类型安全，支持自定义对象
3. **协程 + Flow**：完全异步，无主线程阻塞

---
icon: database
title: ContentProvider
---

# 🗃️ ContentProvider

ContentProvider 是 Android 四大组件之一，用于跨进程共享数据。

## 文章列表

- [ContentProvider 详解](content-provider-basics.md)（待更新）

## 核心要点

1. **跨进程数据共享**：基于 Binder 机制
2. **URI 结构**：`content://authority/path/id`
3. **核心方法**：`query` / `insert` / `update` / `delete`
4. **ContentObserver**：监听数据变化
5. **应用场景**：联系人、相册、跨应用数据共享

## 典型流程

```
App A（客户端）
   │ query() 通过 ContentResolver
   ▼
ContentProvider（App B）
   │ 访问 SQLite / 文件
   ▼
返回 Cursor / 结果给 App A
```

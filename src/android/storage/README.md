---
icon: storage
title: 数据存储
shortTitle: 概览
dir:
  text: 数据存储
  order: 13
---

# 数据存储

Android 数据持久化的多种方案对比与选择。

## 文章列表

- [数据存储方案对比](storage-comparison.md)
- [SharedPreferences 深度剖析](sharedpreferences-deep.md)
- [SharedPreferences 与 DataStore](sp-vs-datastore.md)
- [Room 数据库详解](/jetpack/room-datastore/)

## 方案对比

| 方案 | 适用场景 | 特点 |
|------|----------|------|
| SharedPreferences | 轻量 KV | 简单，但线程安全与性能欠佳（已不推荐） |
| DataStore | 轻量 KV / 偏好设置 | 协程支持、类型安全、异步 |
| Room | 结构化数据 | SQLite 封装、编译期校验、Flow 支持 |
| 文件存储 | 大文件/多媒体 | 内外部存储、Scoped Storage 限制 |
| MMKV | 高频 KV | 微信开源，性能极高 |

## 选择建议

- **KV 数据**：优先 DataStore（替代 SharedPreferences）
- **结构化数据**：Room
- **高频读写**：MMKV
- **大文件**：文件存储 + 缓存策略

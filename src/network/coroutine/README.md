---
icon: flow
title: 协程 Flow / RxJava
---

# 🌊 协程 Flow / RxJava

响应式编程与异步数据流。

## 文章列表

- [协程 Flow 进阶](flow-advanced.md)（待更新）
- [RxJava 操作符详解](rxjava-operators.md)（待更新）

## 核心要点

### 协程 Flow
1. **冷流**：`flow {}`，收集时才开始执行
2. **热流**：`StateFlow` / `SharedFlow`（状态共享）
3. **背压处理**：`conflate` / `buffer` / `collectLatest`
4. **操作符**：`map` / `filter` / `flatMapConcat` / `combine` / `catch`

### RxJava
1. **核心概念**：Observable / Observer / Scheduler
2. **线程切换**：`subscribeOn` / `observeOn`
3. **操作符分类**：创建、变换、过滤、组合、错误处理
4. **与协程对比**：协程更轻量，建议新项目用协程

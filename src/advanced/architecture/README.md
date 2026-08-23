---
icon: architecture
title: 架构设计
---

# 🏗️ 架构设计

Android 应用架构模式的演进与实践。

## 文章列表

- [MVC → MVP → MVVM → MVI 演进](architecture-evolution.md)（待更新）
- [Clean Architecture 实践](clean-architecture.md)（待更新）
- [数据层设计：Repository 模式](repository-pattern.md)（待更新）

## 架构对比

| 模式 | 分层 | 优点 | 缺点 |
|------|------|------|------|
| MVC | Model / View / Controller | 简单 | Controller 膨胀 |
| MVP | Model / View / Presenter | 职责清晰 | 接口爆炸 |
| MVVM | Model / View / ViewModel | 双向绑定、可测试 | 调试困难 |
| MVI | Model / View / Intent | 单向数据流、状态不可变 | 学习成本高 |

## 推荐架构（官方）

```
UI Layer（Activity/Fragment/Compose）
   │ State 观察
   ▼
ViewModel（StateFlow / UiState）
   │
   ▼
Domain Layer（用例 UseCase）── 可选
   │
   ▼
Data Layer（Repository → Remote / Local）
```

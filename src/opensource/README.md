---
icon: package
title: 开源组件
index: false
---

# 开源组件

> Android 开发离不开优秀的开源组件。读懂源码，才能站在巨人的肩膀上写出高质量的代码。
> 本章收录 Android 最经典的 9 个开源库：从网络、图片、数据库到依赖注入与事件总线，逐库拆解设计思想、核心原理与高频面试题。

## 组件一览

| 分类 | 组件 | 一句话定位 | 入口 |
|------|------|-----------|------|
| 网络 | OkHttp | Android 最优秀的网络底层框架，没有之一 | [OkHttp 底层网络框架](okhttp.md) |
| 网络 | Retrofit | 基于 OkHttp 的优雅封装，内含九种常用设计模式 | [Retrofit 网络封装框架](retrofit.md) |
| 图片 | Glide | Android 使用最广泛的图片加载框架 | [Glide 图片加载框架](glide.md) |
| 数据库 | GreenDao | Android 中数据库操作综合效率最高的框架 | [GreenDao 数据库框架](greendao.md) |
| 响应式编程 | RxJava | 探究它的异步、简洁、优雅与强大的操作符 | [RxJava 响应式编程](rxjava.md) |
| 内存泄露 | LeakCanary | 探究它是如何检测出内存泄露的 | [LeakCanary 内存泄漏检测](leakcanary.md) |
| 依赖注入 | ButterKnife | 使用 APT + 注解攻破了 findViewById()，Jake Wharton 大神之作 | [ButterKnife 视图注入框架](butterknife.md) |
| 依赖注入 | Dagger2 | 提升开发效率、自动管理类的实例、解耦 | [Dagger2 依赖注入框架](dagger2.md) |
| 事件总线 | EventBus | 使用扩展的观察者模式实现的组件间通信框架，是广播的替代者 | [EventBus 事件总线](eventbus.md) |

## 阅读建议

- 刚入门：按「OkHttp → Retrofit → Glide」顺序先掌握三个高频组件，配合实战项目理解使用姿势。
- 进阶：对照各组件文章中的「源码解析」小节，结合章节末尾的进阶阅读链接深入源码细节。
- 面试前：重点复习 OkHttp 责任链、Retrofit 动态代理、Glide 三级缓存、RxJava 线程切换、LeakCanary 引用链分析、Dagger2 编译期生成这六个核心考点。

## 关联板块

| 板块 | 说明 |
|------|------|
| [网络与异步](/network/) | HTTP 协议、OkHttp/Retrofit 源码深度解析、协程与 RxJava 操作符 |
| [UI 与渲染](/ui/) | Glide 图片加载源码分析、Bitmap 内存优化 |
| [进阶实战](/advanced/) | LeakCanary 源码分析、EventBus 源码分析、性能优化实战 |
| [Jetpack](/jetpack/) | Room 对比 GreenDao、Hilt 对比 Dagger2 |

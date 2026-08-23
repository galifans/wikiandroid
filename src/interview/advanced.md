---
icon: advanced
title: 面试进阶篇
---

# 📗 面试高频题：进阶篇

> 覆盖性能优化、架构、组件化、Jetpack 等进阶考点。

## 一、性能优化

### 1. 启动优化怎么做？
- 主题优化、异步初始化、Application 精简、布局优化（详见[启动优化](/advanced/performance/startup-optimization.md)）

### 2. 内存泄漏的常见场景？
- 静态引用、Handler、内部类、注册未注销、单例持有 Context

### 3. 如何解决卡顿？
- 减少主线程耗时、布局扁平化、避免过度绘制、列表优化

### 4. OOM 如何排查？
- Memory Profiler 堆转储 → MAT/LeakCanary 分析引用链

## 二、架构设计

### 5. MVVM 与 MVP 的区别？
- MVP：View 与 Presenter 通过接口交互
- MVVM：View 与 ViewModel 通过**数据绑定**（LiveData/Flow）解耦

### 6. 组件化的好处？
- 解耦、并行开发、独立调试、复用、插件化基础

### 7. 如何做依赖注入？
- 手动注入 / Hilt（编译期注解生成）/ Koin（运行时）

## 三、Jetpack

### 8. ViewModel 为什么旋转不销毁？
- `ViewModelStore` 在配置变更时保留（详见[ViewModel](/jetpack/lifecycle-viewmodel/viewmodel-livedata.md)）

### 9. LiveData 与 StateFlow 的对比？
- 生命周期感知 vs 协程原生（详见[对比表](/jetpack/lifecycle-viewmodel/viewmodel-livedata.md)）

### 10. Room 与原生 SQLite 的区别？
- 编译期 SQL 校验、Flow 响应式、类型安全

## 四、网络

### 11. Retrofit 的原理？
- 动态代理生成接口实现 → 注解解析 → OkHttp 请求

### 12. OkHttp 的拦截器链？
- 重试 → 桥接 → 缓存 → 连接 → 网络（责任链模式）

## 五、安全与兼容

### 13. HTTPS 的握手流程？
- 客户端 Hello → 服务端证书 → 密钥交换 → 加密通信

### 14. 如何做屏幕适配？
- dp 适配、ConstraintLayout、`smallestWidth` 限定符、AutoSize

> 📖 进阶阅读：[面试源码篇](/interview/source-code.md) | [面试准备计划](/interview/interview-plan.md)

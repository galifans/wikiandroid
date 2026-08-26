---
icon: workmanager
title: WorkManager / Hilt
shortTitle: 概览
dir:
  text: WorkManager / Hilt
  order: 4
---

# WorkManager / Hilt

后台任务调度与依赖注入。

## 文章列表

- [WorkManager 后台任务](workmanager.md)
- [Hilt 依赖注入](hilt.md)
- [Hilt 依赖注入进阶](hilt-advanced.md) — 多模块/自定义 Qualifier/测试替身

## 核心要点

### WorkManager
1. **适用场景**：可延迟、需保证执行的后台任务（同步、备份）
2. **约束条件**：网络、充电、空闲时执行
3. **任务链**：`beginWith` → `then` 链式组合
4. **周期性任务**：`PeriodicWorkRequest`（最小间隔 15 分钟）

### Hilt
1. **注解**：`@HiltAndroidApp`、`@AndroidEntryPoint`、`@Inject`、`@Module`、`@Provides`
2. **作用域**：`@Singleton`、`@ActivityScoped`、`@ViewModelScoped`
3. **与 Dagger 关系**：Hilt 是 Dagger 的 Android 封装，简化配置
4. **配合 ViewModel**：`@HiltViewModel` + `by viewModels()`

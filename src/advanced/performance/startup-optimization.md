---
icon: performance
title: 启动优化
---

# Android 启动优化实践

> 启动速度直接影响用户第一印象与留存率。本文从原理到实践系统讲解启动优化。

## 一、启动类型

| 类型 | 场景 | 特点 |
|------|------|------|
| 冷启动 | 进程不存在 | 最慢，重点优化对象 |
| 温启动 | 进程存活，Activity 重建 | 中等 |
| 热启动 | Activity 在栈顶 | 最快 |

## 二、冷启动流程

```
Application.attachBaseContext → Application.onCreate
→ 首屏 Activity 创建 → 布局 inflate → 首帧绘制 → 可交互
```

**优化目标**：缩短到首帧（First Frame）的时间。

## 三、优化手段

### 1. 主题优化（最快见效）

```xml
<!-- values/themes.xml -->
<style name="Theme.App.Starting" parent="Theme.Material3.Light">
    <!-- 用启动背景代替空白窗口 -->
    <item name="android:windowBackground">@drawable/splash_background</item>
</style>
```

### 2. 异步初始化（启动器框架）

```kotlin
// 使用启动器框架（如 Android Startup）分层初始化
StartupInitializer.initialize(context, listOf(
    CrashInit::class,      // 第一优先级（主线程）
    NetworkInit::class,    // 异步初始化
    ImageLoaderInit::class
))
```

### 3. 优化 Application.onCreate

- 只做**必需**初始化
- 延迟非关键初始化（IdleHandler / 懒加载单例）
- 减少类加载：移除冗余依赖、开启 `baseline profile`

### 4. 布局优化

- 首屏布局扁平化（ConstraintLayout）
- 减少 `measure/layout/draw` 耗时
- 首屏使用 `ViewStub` 延迟加载非关键视图

## 四、测量工具

| 工具 | 用途 |
|------|------|
| `adb shell am start -W` | 查看启动耗时（totalTime） |
| Systrace / Perfetto | 分析启动阶段主线程任务 |
| `Debug.startMethodTracing` | 方法耗时分析 |
| Macrobenchmark | 启动性能自动化测试 |

## 五、面试高频题

1. 冷启动优化有哪些手段？优先级如何？
2. `windowBackground` 优化原理？
3. 如何统计启动耗时？
4. 启动器框架（Android Startup）如何保证依赖顺序？
5. Baseline Profile 是什么？如何生成？

> 📖 进阶阅读：[内存优化与泄漏排查](memory-optimization.md) | [布局优化](/ui/layout/) | [工程实践：CI/CD](/engineering/cicd/)

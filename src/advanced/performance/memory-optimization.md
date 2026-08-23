---
icon: memory
title: 内存优化
---

# 内存优化与泄漏排查

> 内存问题表现为 OOM 崩溃与卡顿，是稳定性与体验的关键。

## 一、Android 内存模型

- **Java 堆**：对象分配（受 `largeHeap` 影响）
- **Native 堆**：Bitmap 像素数据（Android 8.0+ 在 Native 堆）
- **虚拟机栈 / 方法区 / 元空间**

## 二、常见内存泄漏场景

| 场景 | 原因 | 解决 |
|------|------|------|
| 静态变量持有 Activity | 生命周期错位 | 使用弱引用 / 及时置空 |
| Handler 持有 Activity | 消息未移除 | 静态内部类 + WeakReference |
| 非静态内部类（Runnable） | 隐式持有外部类 | 静态内部类 |
| 注册未注销 | 广播/观察者泄漏 | `onDestroy` 中反注册 |
| 单例持有 Context | 生命周期长于 Activity | 使用 ApplicationContext |
| 数据库 Cursor 未关闭 | 资源泄漏 | try-with-resources |

## 三、泄漏检测工具

- **LeakCanary**：自动检测，HAHA 分析引用链
- **Android Studio Profiler**：Memory Profiler 实时监控
- **MAT（Memory Analyzer）**：堆转储分析
- **adb**：`adb shell dumpsys meminfo <pkg>`

## 四、Bitmap 优化

```kotlin
// 采样压缩：按需加载
val options = BitmapFactory.Options().apply {
    inSampleSize = 2  // 1/2 采样
}
BitmapFactory.decodeResource(resources, R.drawable.large, options)

// 使用 LruCache 缓存
val cache = LruCache<String, Bitmap>(maxMemory / 8)
```

## 五、OOM 常见原因

1. 大图一次性加载
2. 集合无限增长（缓存未清理）
3. 字符串拼接过多（大对象）
4. 线程过多导致栈内存溢出

> 📖 进阶阅读：[启动优化实践](startup-optimization.md) | [卡顿优化与掉帧分析](jank-optimization.md)（待更新）

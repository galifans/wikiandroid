---
icon: flask
title: LeakCanary 源码分析
---

# LeakCanary 源码分析

> LeakCanary 是 Android 内存泄漏检测的利器。本章剖析其初始化注册、引用泄漏观察、Dump Heap 三大核心流程。

## 一、初始化注册

LeakCanary 在清单文件中注册了一个 ContentProvider 用于在应用启动时初始化代码：

```xml
<application>
    <provider
        android:name="leakcanary.internal.LeakSentryInstaller"
        android:authorities="${applicationId}.leak-sentry-installer"
        android:exported="false" />
</application>
```

在 LeakSentryInstaller 生命周期 `onCreate()` 中完成初始化：

::: code-tabs

@tab:active Java

```java
internal class LeakSentryInstaller extends ContentProvider {

    @Override
    public boolean onCreate() {
        CanaryLog.logger = new DefaultCanaryLog();
        Application application =
                (Application) getContext().getApplicationContext();
        InternalLeakSentry.install(application);
        return true;
    }
}
```

@tab Kotlin

```kotlin
internal class LeakSentryInstaller : ContentProvider() {

    override fun onCreate(): Boolean {
        CanaryLog.logger = DefaultCanaryLog()
        val application = context!!.applicationContext as Application
        InternalLeakSentry.install(application)
        return true
    }
}
```

:::

> 使用 ContentProvider 的 `onCreate()` 做初始化，可以免去手动调用 `LeakCanary.install()`，且保证在 Application.onCreate 之前执行。

## 二、注册组件销毁监听

`InternalLeakSentry.install()` 中注册 Activity / Fragment 的销毁监听：

::: code-tabs

@tab:active Java

```java
void install(Application application) {
    CanaryLog.d("Installing LeakSentry");
    checkMainThread();
    InternalLeakSentry.application = application;

    Provider<LeakSentry.Config> configProvider = () -> LeakSentry.config;
    ActivityDestroyWatcher.install(application, refWatcher, configProvider);
    FragmentDestroyWatcher.install(application, refWatcher, configProvider);
    listener.onLeakSentryInstalled(application);
}
```

@tab Kotlin

```kotlin
fun install(application: Application) {
    CanaryLog.d("Installing LeakSentry")
    checkMainThread()
    InternalLeakSentry.application = application

    val configProvider = { LeakSentry.config }
    ActivityDestroyWatcher.install(application, refWatcher, configProvider)
    FragmentDestroyWatcher.install(application, refWatcher, configProvider)
    listener.onLeakSentryInstalled(application)
}
```

:::

- **Activity：** 通过 `application.registerActivityLifecycleCallbacks()` 监听 onActivityDestroyed。
- **Fragment：** 通过 `fragmentManager.registerFragmentLifecycleCallbacks()` 监听（Android 原生与 AndroidX 分别处理）。

## 三、引用泄漏观察

`RefWatcher.watch()` 是核心方法，用 **KeyedWeakReference（带 key 的弱引用）** 观察对象：

::: code-tabs

@tab:active Java

```java
@Synchronized
void watch(Object watchedInstance, String name) {
    if (!isEnabled()) {
        return;
    }
    removeWeaklyReachableInstances();
    String key = UUID.randomUUID().toString();
    long watchUptimeMillis = clock.uptimeMillis();
    KeyedWeakReference reference = new KeyedWeakReference(
            watchedInstance, key, name, watchUptimeMillis, queue
    );
    watchedInstances.put(key, reference);
    checkRetainedExecutor.execute(() ->
            moveToRetained(key)  // 延迟（默认 5 秒）后检查对象是否仍存活
    );
}
```

@tab Kotlin

```kotlin
@Synchronized fun watch(watchedInstance: Any, name: String) {
    if (!isEnabled()) {
        return
    }
    removeWeaklyReachableInstances()
    val key = UUID.randomUUID().toString()
    val watchUptimeMillis = clock.uptimeMillis()
    val reference = KeyedWeakReference(
        watchedInstance, key, name, watchUptimeMillis, queue
    )
    watchedInstances[key] = reference
    checkRetainedExecutor.execute {
        moveToRetained(key)  // 延迟（默认 5 秒）后检查对象是否仍存活
    }
}
```

:::

**判断泄漏的原理：**

1. 给每个被观察对象生成唯一 key，用 WeakReference 包裹并关联到 ReferenceQueue。
2. 若对象被正常回收，弱引用会进入 ReferenceQueue，说明无泄漏。
3. 若延迟一段时间后对象仍未回收（弱引用还在 watchedInstances 中且未入队），则判定为**可能泄漏**（retained）。

## 四、Dump Heap

发现泄漏后，获取 Heap Dump 文件：

::: code-tabs

@tab:active Java

```java
@Override
public File dumpHeap() {
    File heapDumpFile = leakDirectoryProvider.newHeapDumpFile();
    if (heapDumpFile == null) return null;
    try {
        Debug.dumpHprofData(heapDumpFile.getAbsolutePath());  // 系统 API 导出堆
        // ...
    } catch (Exception e) {
        return null;
    }
    return heapDumpFile;
}
```

@tab Kotlin

```kotlin
override fun dumpHeap(): File? {
    val heapDumpFile = leakDirectoryProvider.newHeapDumpFile() ?: return null
    return try {
        Debug.dumpHprofData(heapDumpFile.absolutePath)  // 系统 API 导出堆
        ...
    } catch (e: Exception) {
        null
    }
}
```

:::

::: code-tabs

@tab:active Java

```java
private void checkRetainedInstances(String reason) {
    // ...
    File heapDumpFile = heapDumper.dumpHeap();
    // ...
    refWatcher.removeInstancesWatchedBeforeHeapDump(heapDumpUptimeMillis);
    HeapAnalyzerService.runAnalysis(application, heapDumpFile);
}
```

@tab Kotlin

```kotlin
private fun checkRetainedInstances(reason: String) {
    ...
    val heapDumpFile = heapDumper.dumpHeap()
    ...
    refWatcher.removeInstancesWatchedBeforeHeapDump(heapDumpUptimeMillis)
    HeapAnalyzerService.runAnalysis(application, heapDumpFile)
}
```

:::

启动 HeapAnalyzerService 分析 heapDumpFile：

::: code-tabs

@tab:active Java

```java
@Override
protected void onHandleIntentInForeground(Intent intent) {
    HeapAnalyzer heapAnalyzer = new HeapAnalyzer(this);
    LeakCanary.Config config = LeakCanary.config;
    HeapAnalysis heapAnalysis = heapAnalyzer.checkForLeaks(
            heapDumpFile,
            config.referenceMatchers,
            config.computeRetainedHeapSize,
            config.objectInspectors,
            // ...
    );
    config.analysisResultListener(application, heapAnalysis);
}
```

@tab Kotlin

```kotlin
override fun onHandleIntentInForeground(intent: Intent?) {
    val heapAnalyzer = HeapAnalyzer(this)
    val config = LeakCanary.config
    val heapAnalysis = heapAnalyzer.checkForLeaks(
        heapDumpFile,
        config.referenceMatchers,
        config.computeRetainedHeapSize,
        config.objectInspectors,
        ...
    )
    config.analysisResultListener(application, heapAnalysis)
}
```

:::

## 五、Heap Dump 能看什么

- 应用分配了哪些类型的对象，以及每种对象的数量。
- 每个对象使用多少内存。
- 代码中保存对每个对象的引用（引用链）。
- 分配对象的调用堆栈（仅 Android 7.1 及以下有效）。

## 六、总结

```
初始化：ContentProvider.onCreate → InternalLeakSentry.install
监听：ActivityLifecycleCallbacks / FragmentLifecycleCallbacks
观察：RefWatcher.watch → KeyedWeakReference + 延迟检查
判定：对象延迟后仍存活 → 判定泄漏
分析：Debug.dumpHprofData → HeapAnalyzerService 解析 → 输出引用链
```

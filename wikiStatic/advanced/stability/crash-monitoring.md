---
icon: stability
title: 崩溃监控体系
description: 崩溃类型、捕获原理、Native 崩溃、崩溃上报链路、Bugly 方案、崩溃治理流程
---

# 崩溃监控体系

> 面试高频指数：高
> 崩溃治理是稳定性工程的核心，监控体系是第一步。

## 1. 崩溃类型

```text
① Java/Kotlin 崩溃：未捕获异常（Exception/Error）
② Native 崩溃：C/C++ 层（段错误、空指针、非法指令）
③ 系统崩溃：系统进程（无法直接捕获）
④ 主线程 ANR：无响应（单独治理）
```

```text
指标：
崩溃率 = 崩溃次数 / 启动次数（UV）
核心目标：崩溃率 < 0.1%（优秀 < 0.05%）
```

## 2. Java 崩溃捕获原理

::: code-tabs

@tab:active Java

```java
// 核心：设置全局未捕获异常处理器
public class CrashHandler implements Thread.UncaughtExceptionHandler {

    @Override
    public void uncaughtException(Thread t, Throwable e) {
        // ① 保存崩溃日志
        saveCrashInfo(e);

        // ② 上报（异步，然后退出）
        reportAsync(e);

        // ③ 让系统默认处理器退出
        if (defaultHandler != null) defaultHandler.uncaughtException(t, e);
    }

    private void saveCrashInfo(Throwable e) {
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        String stack = sw.toString();
        // 写入本地文件（含时间、线程、堆栈、设备信息）
        Log.e("Crash", stack);
    }
}

// Application 中注册
public class MyApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        CrashHandler crashHandler = new CrashHandler();
        crashHandler.setDefaultHandler();
        Thread.setDefaultUncaughtExceptionHandler(crashHandler);
    }
}
```

@tab Kotlin

```kotlin
// 核心：设置全局未捕获异常处理器
class CrashHandler : Thread.UncaughtExceptionHandler {

    override fun uncaughtException(t: Thread, e: Throwable) {
        // ① 保存崩溃日志
        saveCrashInfo(e)

        // ② 上报（异步，然后退出）
        reportAsync(e)

        // ③ 让系统默认处理器退出
        defaultHandler?.uncaughtException(t, e)
    }

    private fun saveCrashInfo(e: Throwable) {
        val sw = StringWriter()
        e.printStackTrace(PrintWriter(sw))
        val stack = sw.toString()
        // 写入本地文件（含时间、线程、堆栈、设备信息）
        Log.e("Crash", stack)
    }
}

// Application 中注册
class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Thread.setDefaultUncaughtExceptionHandler(
            CrashHandler().also { it.setDefaultHandler() }
        )
    }
}
```

:::

```text
原理：Thread.setDefaultUncaughtExceptionHandler
主线程崩溃 → 该 Handler 收到 → 记录 + 上报
```

## 3. Native 崩溃捕获

```text
Native 崩溃：信号机制（SIGSEGV/SIGABRT 等）

捕获方案：
① Breakpad（Google，开源）
   - 注册信号处理器（signal handler）
   - 崩溃时在信号处理器中 dump 堆栈（minidump）
   - 解析 minidump → 符号化（so 符号表）
② 系统 tombstone：/data/tombstones（调试用）
③ 第三方：Bugly / Firebase Crashlytics 集成

难点：
- 信号处理器中不能做复杂操作（malloc 等不安全）
- 需要符号化（release so 需保留符号文件）
- 需处理多线程/异步信号安全
```

## 4. 崩溃上报链路

```text
采集 → 本地存储 → 上报 → 服务端聚合 → 分析 → 修复

上报时机：
① 崩溃时立即上报（网络可用）
② 下次启动补报（网络失败重试）
③ 批量上报（合并减少请求）

上报内容：
- 崩溃堆栈（Java/Native）
- 设备信息（型号、系统、内存）
- App 信息（版本、渠道）
- 上下文（页面、操作路径、自定义日志）
- 内存快照（可用时）
```

## 5. 崩溃治理流程

```text
① 采集：崩溃监控 SDK 接入（自研/Bugly/Crashlytics）
② 聚合：按堆栈归并（去重、统计 TOP 崩溃）
③ 分析：
   - TOP 崩溃优先处理（影响面）
   - 堆栈定位（行号/符号化）
   - 复现（堆栈 + 上下文 + 设备）
④ 修复：热修复（紧急）/ 发版（常规）
⑤ 验证：修复版本崩溃率观察、灰度

优先级：崩溃率 × 用户影响 × 修复成本
```

## 6. 线上方案选型

| 方案 | 特点 | 适用 |
| --- | --- | --- |
| Bugly（腾讯） | 接入快、Native 支持好、免费 | 中小团队 |
| Firebase Crashlytics | 海外主流、集成 Firebase | 出海应用 |
| 自研 | 完全可控、可定制 | 大厂（数据安全） |
| Sentry | 开源、功能全、可私有化 | 有运维能力 |

## 7. 高频面试题

**Q1：如何捕获 Java 崩溃？**
A：Thread.setDefaultUncaughtExceptionHandler 设置全局处理器，
崩溃时记录堆栈（时间/线程/设备信息）并上报。注意处理器内不要做
耗时/不安全操作（如主线程 IO），上报用异步。

**Q2：Native 崩溃怎么捕获？**
A：信号处理（Breakpad）：注册 SIGSEGV 等信号处理器，崩溃时 dump
minidump，服务端符号化。或集成 Bugly/Crashlytics。Native 崩溃
堆栈需要符号文件（release 保留 so 符号表）。

**Q3：崩溃上报的时机？**
A：崩溃时立即上报（异步、非阻塞）；失败下次启动补报；批量合并。
避免频繁网络请求（电量/流量），本地队列 + 时机策略。

**Q4：如何分析线上崩溃？**
A：按堆栈聚合（去重统计）；TOP 崩溃优先；结合设备/版本/页面上下文
复现；Native 崩溃符号化；对比版本（回归崩溃）；利用日志/内存快照。

**Q5：崩溃率怎么定义和治理？**
A：崩溃率 = 崩溃用户数 / 活跃用户数（UV 口径）。治理：监控报警
（异常波动）→ TOP 分析 → 修复（热修复/发版）→ 灰度验证 → 观察
指标回落。

## 8. 小结

- 崩溃 = Java（UncaughtException）+ Native（信号）。
- Java 捕获简单，Native 需 Breakpad/符号化。
- 链路：采集 → 聚合 → 分析 → 修复 → 验证。
- 方案：Bugly（快）/ 自研（可控）/ Crashlytics（出海）。
- 面试重点：捕获原理、Native 方案、治理流程。

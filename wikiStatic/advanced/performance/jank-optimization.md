---
icon: performance
title: 卡顿优化与掉帧分析
description: 掉帧原理、Choreographer 与 VSYNC、卡顿检测、Systrace/Perfetto 分析、布局与渲染优化
---

# 卡顿优化与掉帧分析

> 面试高频指数：极高
> 卡顿是性能面试第一话题，从掉帧原理到工具链全解析。

## 1. 掉帧原理

```text
屏幕刷新率 60Hz → 每帧 16.6ms（1000/60）
90Hz → 11.1ms；120Hz → 8.3ms

掉帧（Jank）：一帧绘制耗时超过刷新间隔
→ 画面停顿（肉眼可见 >100ms 的卡顿）

原因：
- 主线程耗时（测量/布局/绘制/业务代码）
- 渲染线程阻塞（GPU 负载高）
- GC 暂停（内存抖动）
- 输入事件处理慢
```

## 2. VSYNC 与 Choreographer

```text
VSYNC（垂直同步）：屏幕刷新信号

Android 渲染：
- Choreographer 监听 VSYNC
- 每帧回调 doFrame → 测量/布局/绘制
- 错过 VSYNC → 掉帧

时间线：
┌─────────────────────────────────────┐
│ VSYNC 信号                            │
│  → doFrame（主线程 measure/layout/draw）│
│  → 渲染线程（RenderThread 提交 GPU）    │
│  → SurfaceFlinger 合成 → 显示           │
└─────────────────────────────────────┘
```

## 3. 卡顿检测方法

### 3.1 工具检测

```text
① Systrace / Perfetto（官方，最权威）
   - 查看各阶段耗时（VSYNC/主线程/渲染线程）
   - adb shell perfetto -t 10s -o /data/misc/perfetto-traces/trace.perfetto-trace
   
② 开发者选项：Profile GPU Rendering（柱状图看帧耗时）

③ 卡顿监控库（线上）：
   - BlockCanary：主线程消息耗时（Looper 监控）
   - 线上采集 frame 耗时上报（dropFrame 统计）
```

### 3.2 代码检测（Looper 监控原理）

::: code-tabs

@tab:active Java

```java
// 卡顿监控核心：监听主线程消息执行时间
Looper.getMainLooper().setMessageLogging(new Printer() {
    @Override
    public void println(String x) {
        if (x.startsWith(">>>>> Dispatching")) {
            // 消息开始
            startTime = SystemClock.uptimeMillis();
        } else if (x.startsWith("<<<<< Finished")) {
            // 消息结束
            long cost = SystemClock.uptimeMillis() - startTime;
            if (cost > 100) { // 超过阈值
                // 抓取主线程堆栈（卡顿现场）
                Thread.currentThread().getStackTrace();
            }
        }
    }
});
```

@tab Kotlin

```kotlin
// 卡顿监控核心：监听主线程消息执行时间
Looper.getMainLooper().setMessageLogging(object : Printer {
    override fun println(x: String) {
        if (x.startsWith(">>>>> Dispatching")) {
            // 消息开始
            startTime = SystemClock.uptimeMillis()
        } else if (x.startsWith("<<<<< Finished")) {
            // 消息结束
            val cost = SystemClock.uptimeMillis() - startTime
            if (cost > 100) { // 超过阈值
                // 抓取主线程堆栈（卡顿现场）
                Thread.getStackTrace()
            }
        }
    }
})
```

:::

## 4. 常见卡顿原因与优化

### 4.1 布局优化

```text
① 减少层级：ConstraintLayout 扁平化（< 3 层）
② 延迟加载：ViewStub 按需 inflate
③ 复用：RecyclerView 复用 + 稳定 Id
④ 避免重绘：固定背景、避免过度 clip
⑤ 异步加载：列表项图片异步解码
```

### 4.2 绘制优化

```text
① 避免 onDraw 频繁失效（invalidate 次数）
② 复杂图形用硬件加速特性
③ 动画优化：属性动画（而非 View 动画）
④ 避免过度绘制（Overdraw）：检查"蓝色"区域
   - adb shell dumpsys gfxinfo <pkg> 查看
```

### 4.3 内存优化

```text
① 减少 GC：对象复用、避免内存抖动（循环中 new 对象）
② Bitmap 优化：inSampleSize 采样、复用 inBitmap
③ 避免大对象：大图分块加载（BitmapRegionDecoder）
④ 泄漏：LeakCanary 检测，泄漏导致 GC 压力增大
```

### 4.4 业务优化

```text
① 主线程不做 IO（网络/磁盘/数据库）
② 复杂计算移到子线程/协程
③ 减少主线程大方法（拆分）
④ 预加载：列表预取数据、图片预解码
⑤ 线程池复用（避免频繁创建线程）
```

## 5. Perfetto 分析实战

```bash
# ① 抓取 trace（Android 10+）
adb shell perfetto -t 10 -o /data/misc/perfetto-traces/trace perfetto.trace
# 或直接：
adb shell perfetto -t 10 -o /data/misc/perfetto-traces/trace

# ② 拉取到本地
adb pull /data/misc/perfetto-traces/trace ./

# ③ 打开 Perfetto UI（ui.perfetto.dev）分析
# 关注：主线程 Slice 耗时、Binder 等待、GC、渲染线程
```

```text
分析要点：
- 找超长 Slice（哪段代码耗时）
- 看是否有 Binder 阻塞（跨进程等待）
- 看 GC 频率（内存抖动）
- 对比渲染线程与主线程（GPU 瓶颈？）
```

## 6. 高频面试题

**Q1：一帧的绘制流程是什么？掉帧原因？**
A：VSYNC → Choreographer.doFrame → measure/layout/draw（主线程）→
RenderThread 提交 GPU → SurfaceFlinger 合成。掉帧 = 任一阶段超时
（主线程耗时、渲染阻塞、GC、输入处理慢）。

**Q2：如何检测卡顿？**
A：开发期：Perfetto/Systrace、Profile GPU Rendering、开发者选项
帧率显示；线上：Looper 监控（BlockCanary 思路，主线程消息超阈值
抓堆栈）、frame drop 统计上报。

**Q3：布局怎么优化？**
A：层级扁平（ConstraintLayout）、ViewStub 延迟加载、RecyclerView
复用、避免过度绘制、布局预加载（预 inflate）。可用 Layout Inspector
检查层级。

**Q4：过度绘制怎么检测和优化？**
A：开发者选项"显示布局边界"（Debug GPU Overdraw），颜色越红越严重。
优化：去除无意义背景、减少层级嵌套、使用 clipRect 裁剪、
合并绘制（invalidate 区域控制）。

**Q5：如何定位主线程耗时方法？**
A：Perfetto 主线程 Slice（方法 trace）；Android Studio CPU Profiler
（Method Trace / Java Method）；Looper 监控抓堆栈；自定义
Trace.beginSection 埋点（配合 systrace 查看）。

## 7. 小结

- 掉帧 = 帧耗时 > 刷新间隔（16.6ms @60Hz）。
- 渲染链路：VSYNC → Choreographer → 主线程 → 渲染线程 → 合成。
- 工具：Perfetto 最权威，Looper 监控做线上。
- 优化：布局扁平、绘制精简、内存稳定、主线程无 IO。
- 面试重点：掉帧原理、检测手段、四大类优化。

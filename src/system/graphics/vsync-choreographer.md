---
icon: animation
title: VSYNC 与 Choreographer
description: VSYNC 信号、Choreographer 回调、帧调度、16.6ms 掉帧检测、帧率控制
---

# VSYNC 与 Choreographer

> 面试高频指数：高
> 应用流畅度由"每 16.6ms 完成一帧"保证。Choreographer 把 VSYNC 信号转成应用绘制节奏，是帧率与掉帧分析的钥匙。

## 1. VSYNC 机制

### 1.1 什么是 VSYNC

```text
VSYNC（Vertical Synchronization，垂直同步）：
- 屏幕刷新完成一帧时的脉冲信号
- 硬件产生（显示控制器）
- 用于同步绘制，避免撕裂（tearing）

撕裂原因：
屏幕刷新中 Buffer 被切换 → 上下半屏不同帧
VSYNC 保证只在刷新间隙切换
```

### 1.2 VSYNC 分发

```text
VSYNC 信号分发：
硬件 VSYNC
→ HWC 上报（disp sync）
→ SurfaceFlinger Scheduler
→ 分发两个通道：
   ① App VSYNC → Choreographer（应用）
   ② SF VSYNC → SurfaceFlinger 合成

相位（offset）：
- App 先开始渲染
- SF 稍后合成（错开避免竞争）
```

## 2. Choreographer

### 2.1 职责

```text
Choreographer（编舞者）：
应用侧帧调度器（每个线程一个）

职责：
① 接收 VSYNC（通过 FrameDisplayEventReceiver）
② 回调三阶段：
   - CALLBACK_INPUT（输入事件）
   - CALLBACK_ANIMATION（动画）
   - CALLBACK_TRAVERSAL（measure/layout/draw）
③ 掉帧检测与回调

主线程每帧流程：
VSYNC → input → animation → traversal → 提交
```

### 2.2 帧回调

```java
// 监听下一帧
Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
    @Override
    public void doFrame(long frameTimeNanos) {
        // 每帧执行（掉帧时跳过）
    }
});

// 自定义掉帧检测
long lastFrameTime = 0;
@Override
public void doFrame(long frameTimeNanos) {
    long interval = (frameTimeNanos - lastFrameTime) / 1_000_000L;
    if (lastFrameTime != 0 && interval > 16.6) {
        // 掉帧：interval ms 内未完成一帧
    }
    lastFrameTime = frameTimeNanos;
    Choreographer.getInstance().postFrameCallback(this);
}
```

## 3. 帧调度流程

### 3.1 一帧的旅程

```text
一帧时间线（60Hz，16.6ms）：

VSYNC #1（App）：
→ Choreographer 回调
→ input/animation/traversal
→ 生成 DisplayList
→ RenderThread 渲染（与主线程并行）

VSYNC #2（SF）：
→ 应用 Buffer 就绪
→ SurfaceFlinger 合成
→ 提交 HWC 显示

重叠优化：
- 渲染与合成流水线化（pipeline）
- 主线程处理第 N 帧时
  RenderThread 渲染第 N-1 帧
```

### 3.2 三缓冲

```text
缓冲策略：
单缓冲：绘制与显示共用 → 撕裂
双缓冲：两个 Buffer 交替 → 可能阻塞
三缓冲：第三个 Buffer 兜底 → 减少掉帧

三缓冲流程：
App 绘制 A → 显示 B → SF 合成 C
→ App 继续绘制（不等待）

缺点：增加一帧延迟
优点：渲染超时时减少掉帧
```

## 4. 掉帧与流畅度

### 4.1 掉帧定义

```text
掉帧（Jank）：
- 一帧耗时超过 16.6ms（60Hz）
- 或错过 VSYNC 提交窗口

表现：
- 画面卡顿/跳跃
- 帧率降低（如 60 → 45）

原因：
- 主线程耗时（布局/绘制/IO）
- GPU 负载高
- 合成繁忙
- 内存抖动（GC）
- 调度延迟
```

### 4.2 流畅度指标

```text
衡量指标：
- 平均帧耗时
- Jank 次数/率
- Frame Missed 数
- 掉帧分布（P50/P90/P99）

获取：
adb shell dumpsys gfxinfo <package> framestats
→ 输出每帧各阶段耗时

开发者选项：
- 显示刷新率（帧率悬浮窗）
- GPU 渲染模式分析（柱状图）
```

## 5. 帧率与省电

### 5.1 刷新率控制

```text
刷新率策略：
- 静态内容：降至 30Hz/更低（省电）
- 动画/游戏：90/120Hz（流畅）
- LTPO 面板：1-120Hz 可变

系统控制：
- SurfaceFlinger 根据内容动态调整
- 应用可请求（setFrameRate，API 30+）
- 游戏常锁 60/120
```

### 5.2 功耗权衡

```text
高刷与功耗：
- 120Hz 功耗高于 60Hz
- 动态刷新率在省电与流畅间平衡
- 应用避免无意义动画持续刷新

实践：
- 静止页面停用动画
- 列表滚动适度
- 后台无动画不请求高刷
```

## 6. 高频面试题

**Q1：VSYNC 是什么？为什么需要？**
A：屏幕刷新完成信号，同步绘制与显示节奏，避免撕裂；App VSYNC 驱动应用渲染，SF VSYNC 驱动合成。

**Q2：Choreographer 的作用？**
A：接收 VSYNC 并在主线程按 input → animation → traversal 顺序回调，驱动每帧的测量、布局、绘制。

**Q3：一帧 16.6ms 怎么算的？**
A：60Hz 屏幕 1 秒 60 帧，1000/60 ≈ 16.6ms；超过即掉帧。高刷屏（120Hz）为 8.3ms。

**Q4：双缓冲和三缓冲区别？**
A：双缓冲延迟低但渲染超时易阻塞掉帧；三缓冲多一个 Buffer 兜底，减少掉帧但增加一帧延迟。

**Q5：如何检测应用掉帧？**
A：postFrameCallback 计算帧间隔、gfxinfo framestats 看每帧耗时、开发者选项 GPU 渲染分析柱状图。

## 7. 小结

- VSYNC 同步渲染与显示，避免撕裂。
- Choreographer 把 VSYNC 转为应用绘制节奏。
- 三阶段回调：input / animation / traversal。
- 16.6ms 是 60Hz 帧预算，超时即掉帧。
- 动态刷新率在流畅与省电间平衡。

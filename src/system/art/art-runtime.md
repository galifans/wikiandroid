---
icon: art
title: ART 运行时与 JIT/AOT
description: ART vs Dalvik、JIT/AOT 混合编译、解释执行与编译执行、GC 机制、ART 优化对启动与性能的影响
---

# 🧠 ART 运行时与 JIT/AOT

> 面试高频指数：⭐⭐⭐⭐
> ART 是 Android 5.0+ 的默认运行时，混合编译模式是性能的关键。

## 1. ART vs Dalvik

| 维度 | Dalvik | ART |
| --- | --- | --- |
| 首次安装 | 快（无编译） | 慢（AOT 预编译） |
| 运行速度 | 解释执行（慢） | 编译执行（快） |
| 启动 | 快 | 慢（旧版） |
| 内存 | 较小 | 较大（编译产物） |
| 引入版本 | Android 2.2 | Android 5.0（默认） |
| 64K 方法数 | 有 | 依然有（同 dex） |

```text
Dalvik 退出历史：ART 取代（Android 5.0 起）
ART 特点：AOT 预编译 + 运行时优化 + 更好的 GC
```

## 2. JIT 与 AOT

### 2.1 什么是 JIT / AOT

```text
JIT（Just-In-Time，即时编译）：
- 运行时把热点代码编译为机器码
- 边运行边编译（启动快，运行中慢热）

AOT（Ahead-Of-Time，预先编译）：
- 安装时把字节码全部编译为机器码
- 启动快、运行快（但安装慢、占用大）
```

### 2.2 ART 的混合编译（Hybrid）

```text
Android 7.0+（Nougat）的混合模式：
① 安装时：不 AOT 全量编译（改为解释执行 + 记录热点）
② 运行时：JIT 编译热点方法（profile 记录）
③ 空闲时：根据 profile 对热点方法做 AOT（后台编译）
④ 下次启动：直接使用编译产物

优势：
- 安装快（不再全量 AOT）
- 启动快（热点方法已编译）
- 节省空间（只编译热点）
```

### 2.3 各版本演进

```text
Android 5.0：纯 AOT（安装时全量编译，安装慢）
Android 5.1：AOT + 部分优化
Android 7.0：JIT + AOT 混合（profile-guided）
Android 8.0：dex2oat 优化（AOT 编译缓存）
Android 9.0：进一步优化（d8 编译、profile 更智能）
```

## 3. 解释执行与编译执行

```text
字节码执行方式：
① 解释执行：逐条解释字节码（慢，兼容性好）
② JIT 编译：运行中编译热点为机器码（快，内存占用）
③ AOT 编译：安装/空闲时编译（最快，占用磁盘）

dex2oat 工具：字节码 → OAT 文件（机器码）
```

## 4. GC 机制（ART）

```text
ART GC 特点（相比 Dalvik）：
- 并行 GC（缩短暂停）
- 压缩 GC（减少碎片）
- 更精确的回收策略

主要 GC 类型：
① Concurrent Mark Sweep（CMS）：并发标记清除
② Concurrent Copying（CC）：并发复制（低延迟）
③ Generational：分代回收

GC 影响：
- GC 暂停（STW）影响流畅度
- 内存抖动（频繁分配小对象）导致频繁 GC
- 优化：对象复用、避免大对象、注意 Bitmap 内存
```

## 5. ART 对开发的影响

```text
① 启动优化：
   - 首次启动 vs 后续启动（profile 编译后更快）
   - Baseline Profile 预编译关键路径（加速首启）

② 包体积：
   - dex 编译为 OAT 需要额外空间
   - 64K 方法数仍存在（multidex）

③ 性能分析：
   - 用 Profile GPU Rendering 观察
   - 注意 GC 导致的卡顿（Android Studio Profiler）

④ 兼容性：
   - ART 对 dex 更严格（某些黑科技失效）
   - 热修复需适配（类加载方案）
```

## 6. 高频面试题

**Q1：ART 和 Dalvik 的区别？**
A：Dalvik 解释执行（快安装、慢运行）；ART 编译执行（AOT/JIT 混合），
运行更快、GC 更优。Android 5.0 起 ART 默认。

**Q2：什么是 JIT？什么是 AOT？ART 怎么结合？**
A：JIT 运行时编译热点（慢热）；AOT 预编译（安装/空闲）。ART 混合模式：
安装解释执行 → 运行记录热点（JIT）→ 空闲 AOT 编译热点 → 后续启动直接用。
兼顾安装速度与运行性能。

**Q3：ART 的 GC 有什么特点？**
A：并行、压缩（减少碎片）、分代；暂停时间更短。但仍存在 STW 暂停，
内存抖动会频繁触发 GC 造成卡顿，需优化对象分配。

**Q4：为什么 App 首次启动比后续慢？**
A：首次启动时热点方法还未被 JIT/profile 编译，解释执行较慢；后续启动
使用已编译产物（AOT），更快。Baseline Profile 可预编译关键路径，缩小差异。

**Q5：ART 下 64K 方法数还有限制吗？**
A：有。dex 格式限制单个 dex 引用数（约 65536），与运行时无关。需
multidex（D8 自动分包）解决，且注意类加载顺序问题。

## 7. 小结

- ART = 编译执行 + 现代 GC，取代 Dalvik。
- 混合编译：JIT（热点）+ AOT（profile 引导）。
- GC 影响流畅度：减少内存抖动。
- 首启慢与 profile 相关：Baseline Profile 优化。
- 面试重点：JIT/AOT 演进、GC、启动差异。

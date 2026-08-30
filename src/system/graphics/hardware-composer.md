---
icon: animation
title: HWC 硬件合成与显示
description: Composer HAL、Overlay 层、合成决策、VSYNC 输出、多屏显示
---

# HWC 硬件合成与显示

> 面试高频指数：低
> HWC（Hardware Composer）是显示链路的最后一环：硬件合成图层并控制屏幕时序。它决定了省电能力与画面流畅度。

## 1. HWC 定位

```text
Hardware Composer（HWC）：
显示 HAL 层（vendor 实现）

职责：
① 硬件合成（Overlay）
② 显示时序（VSYNC/刷新率）
③ 帧提交（present）
④ 显示属性（分辨率/色彩/背光）

与 SurfaceFlinger 关系：
SF 决定"合成什么"，HWC 决定"怎么显示"
```

## 2. Composer HAL

### 2.1 接口演进

```text
Composer HAL 版本演进：
- HWC 1.x：早期接口（固定合成）
- HWC 2.x：扩展（多显示/时序控制）
- Composer 3.x（AIDL，Android 13+）：
  统一为 AIDL 接口

HIDL 时代：
- IComposer / IComposerClient
- createLayer / validate / present

AIDL 时代：
- 简化版本控制
- 更严格的接口检查
```

### 2.2 核心调用

```text
Composer 关键流程（每帧）：
① setLayerState（设置图层）
② validate（验证合成方案）
③ present（提交显示）

返回值：
- 合成方案变更 → 重新配置
- 验证通过 → present 输出

异步：
- present 后等待完成回调
- 支持同步/异步模式
```

## 3. Overlay 合成

### 3.1 硬件图层

```text
Overlay（硬件层）：
显示控制器内的硬件图层

特点：
- 数量有限（通常 4-8 层）
- 支持格式/缩放/旋转
- 合成零 GPU 开销（省电）

设备合成：
所有图层 → 硬件 Overlay 直接合成
条件：
- 图层数 ≤ Overlay 数
- 格式/属性硬件支持
- 无需特殊特效
```

### 3.2 合成决策

```text
合成方案选择：
场景 A（全硬件）：
3 个普通窗口 → 3 个 Overlay → Device 合成

场景 B（混合）：
背景 + 视频 + 特效窗口
→ 视频/特效 GPU 合成
→ 结果与背景 Overlay 合成

场景 C（全 GPU）：
复杂特效/过多图层
→ SurfaceFlinger GPU 合成 → 单层输出

目标：最大化硬件合成（省电）
```

## 4. VSYNC 与时序

### 4.1 VSYNC 输出

```text
VSYNC 来源：
- HWC 从显示控制器读取
- 或软件模拟（无硬件支持时）

分发：
HWC 上报 → SurfaceFlinger Scheduler
→ App VSYNC（应用渲染）
→ SF VSYNC（合成）

刷新率：
- 固定（60/90/120Hz）
- 可变（LTPO 面板 1-120Hz）
- 应用可影响（setFrameRate）
```

### 4.2 帧提交

```text
Present 流程：
合成完成 → present（HWC 提交）
→ 等待 VSYNC 窗口
→ 屏幕切换显示
→ 完成回调 → Buffer 释放

时序控制：
- present 需在 VSYNC 前完成
- 错过窗口 → 下一帧显示（掉帧）
- 自适应刷新率减少浪费
```

## 5. 多显示支持

### 5.1 多屏场景

```text
多显示：
- 主屏（内置面板）
- 外接（HDMI/DP）
- 无线投屏（Miracast/Chromecast）

每屏独立：
- 合成输出
- 刷新率
- 分辨率/旋转

SurfaceFlinger 支持多 Display：
- DisplayId 管理
- 各屏独立 Layer 集合
```

### 5.2 显示属性

```text
HWC 提供：
- 物理分辨率
- 刷新率范围
- 色彩模式（sRGB/P3/HDR）
- 背光控制
- 旋转/裁剪

系统使用：
- DisplayManager 查询
- 亮度调节（背光）
- HDR 内容显示（色彩映射）
```

## 6. 常见问题

```text
显示问题排查：
① 花屏/闪烁：
   - 合成方案错误
   - Buffer 时序错乱
   - 色彩空间不匹配
② 掉帧：
   - present 错过 VSYNC
   - 硬件 Overlay 不足 → GPU 合成慢
③ 黑屏：
   - 无内容提交
   - 显示电源管理异常
④ 撕裂：
   - VSYNC 未生效

工具：
dumpsys SurfaceFlinger
dumpsys display
logcat（composer 日志）
```

## 7. 高频面试题

**Q1：HWC 的作用？**
A：硬件合成图层（Overlay）、控制显示时序（VSYNC/刷新率）、提交帧到屏幕；负责省电高效的显示输出。

**Q2：为什么优先硬件合成？**
A：硬件 Overlay 合成不需要 GPU 逐像素处理，功耗低、延迟小；GPU 合成是兜底方案。

**Q3：合成方案怎么定？**
A：图层数、格式、特效决定：全部支持 → 硬件合成；部分特效 → 混合；复杂 → GPU 合成后输出。

**Q4：HWC 与 SurfaceFlinger 的分工？**
A：SF 管理 Layer 并决策合成方式（与 HWC 协商），HWC 执行硬件合成、控制时序并最终提交显示。

**Q5：刷新率怎么控制？**
A：HWC 提供刷新率能力，SurfaceFlinger 根据内容与省电策略动态调整，LTPO 面板支持 1-120Hz 可变刷新。

## 8. 小结

- HWC 是显示链路最后一环：硬件合成 + 时序。
- Overlay 硬件层数量有限，决定合成策略。
- 最大化硬件合成可省电降延迟。
- VSYNC 由 HWC 提供并分发到 App/SF。
- 多屏独立合成输出，属性由 HWC 管理。

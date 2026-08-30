---
icon: apk
title: AAPT2 资源编译与打包
description: AAPT2 编译流程、资源表 resources.arsc、资源 ID 生成、资源链接、混淆资源名、编译优化
---

# AAPT2 资源编译与打包

> 面试高频指数：高
> 资源的编译与打包决定了 App 的体积与加载速度，AAPT2 是 AGP 默认的资源编译器，理解其流程是 APK 优化的基础。

## 1. AAPT 与 AAPT2

```text
AAPT（Android Asset Packaging Tool）
AAPT2（Android Asset Packaging Tool 2，AGP 3.0+ 默认）

AAPT2 的核心改进：编译与链接分离
① compile：单个资源编译为中间产物（.flat）
② link：合并中间产物生成 resources.arsc + 资源 ID
```

| 对比项 | AAPT | AAPT2 |
|--------|------|-------|
| 编译模型 | 一步打包 | 编译 + 链接分离 |
| 增量编译 | 不支持 | 支持（增量） |
| 资源冲突 | 后加载覆盖 | 链接期检测 |
| 性能 | 慢 | 快（并行编译） |

## 2. 编译流程（compile）

### 2.1 资源类型

```text
res/ 下的资源分类：
- values/：字符串、颜色、尺寸、样式（xml 值资源）
- drawable/：图片、xml drawable
- layout/：布局 xml
- mipmap/：应用图标
- anim/、color/、menu/、raw/ 等
```

### 2.2 compile 阶段

```text
AAPT2 compile 输入：单个资源文件
输出：中间产物 .flat 文件（编译后的二进制资源）

例如：
res/values/strings.xml → values_strings.arsc.flat
res/layout/main.xml    → layout_main.xml.flat
res/drawable/icon.png  → drawable_icon.png.flat

特点：
- 每个资源独立编译，可并行
- 支持增量（只编译变更的资源）
- xml 被编译为二进制格式（更快解析）
```

## 3. 资源 ID 生成

### 3.1 资源 ID 结构

```text
资源 ID = 0xPPTTEEEE

PP：包 ID（0x7f = 应用资源，0x01 = 系统 android）
TT：资源类型 ID（layout=0x02、drawable=0x02... 实际按顺序）
EEEE：资源条目 ID（从 0x0001 递增）
```

| 段 | 位数 | 含义 |
|----|------|------|
| PP | 8bit | 包 ID（7f = 应用包） |
| TT | 8bit | 类型 ID |
| EEEE | 16bit | 条目 ID |

### 3.2 代码中引用

```java
// Java 层：R 类持有资源 ID 常量
R.layout.activity_main   // 0x7f0b0001 之类
R.string.app_name        // 0x7f100001

// 资源 ID 在链接期固定，运行时通过 ID 查 resources.arsc
```

## 4. 链接流程（link）

### 4.1 link 做什么

```text
AAPT2 link 输入：所有 .flat 文件 + AndroidManifest
输出：
- resources.arsc（资源表，运行时查找的核心）
- R.java（Java 资源 ID 常量）
- 编译后的资源文件（drawable、layout 等）
- 资源混淆映射（proguard）

link 阶段工作：
① 合并所有资源
② 分配资源 ID（去重、增量复用）
③ 生成 resources.arsc 二进制表
④ 检测冲突与缺失引用
```

### 4.2 resources.arsc 结构

```text
resources.arsc（二进制资源表）：
- 全局字符串池（资源名、值字符串）
- 包表（package → 类型表 → 条目表）
- 配置限定（density、language、night 等）
- 资源值（String/Int/Complex 等）

运行时查找流程：
资源 ID → 定位包 → 类型 → 条目 → 按配置选择值
```

## 5. 资源混淆（资源名缩短）

### 5.1 原理

```text
资源混淆 = 缩短资源路径与名字，减少体积 + 提高逆向难度

resourceShrinker / 资源混淆器：
R.string.app_name → R.string.a
res/layout/activity_main.xml → res/a/a.xml

同时生成 mapping 文件（混淆前后对照），
方便崩溃日志还原。
```

### 5.2 注意点

```text
资源混淆注意事项：
- 动态获取资源名（getIdentifier）会失效，需 keep
- 第三方库资源名需 keep 规则
- 混淆后 resources.arsc 字符串池变小 → 体积优化
```

## 6. 资源编译与体积优化

### 6.1 常见优化手段

| 手段 | 原理 |
|------|------|
| 资源混淆 | 缩短资源名 |
| 无用资源清理 | shrinkResources 删除未引用资源 |
| 图片压缩 | WebP/矢量图替代 |
| 语言/密度分包 | 只保留需要的配置 |
| 资源去重 | 相似资源合并 |

### 6.2 布局优化与编译

```text
xml 编译为二进制后：
- 解析更快（不逐字符解析）
- 占用更小（去空格/注释）
- 支持引用池（@string/@dimen 等高效索引）

运行时：Resources.getLayout → XmlResourceParser 读取
```

## 7. 高频面试题

**Q1：AAPT 和 AAPT2 的区别？**
A：AAPT2 将编译与链接分离（compile + link），支持增量编译与并行，链接期检测资源冲突，是 AGP 3.0+ 默认编译器。

**Q2：资源 ID 的结构是什么？**
A：0xPPTTEEEE，PP 包 ID（0x7f 应用）、TT 类型 ID、EEEE 条目 ID。链接期固定，运行时查 resources.arsc。

**Q3：resources.arsc 是什么？**
A：二进制资源表，包含全局字符串池、包/类型/条目表、配置限定与资源值。运行时按 ID + 配置查找资源。

**Q4：资源混淆的原理与风险？**
A：缩短资源路径与名称减小体积并增加逆向难度；风险是动态获取资源名（getIdentifier）失效，需 keep 规则保护。

**Q5：为什么 xml 编译成二进制？**
A：二进制格式解析更快（直接读结构而非文本解析）、体积更小（去冗余）、支持引用池高效索引，提升运行时加载性能。

## 8. 小结

- AAPT2：compile + link 分离，增量编译，AGP 默认。
- 资源 ID 0xPPTTEEEE：包/类型/条目三段。
- resources.arsc 是运行时资源查找的核心表。
- 资源混淆 + shrinkResources 优化体积。
- 二进制 xml 提升运行时解析性能。

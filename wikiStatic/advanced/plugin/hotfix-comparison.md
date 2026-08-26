---
icon: plugin
title: 热修复方案对比
description: 热修复主流方案：类加载、底层替换、Instant Run；Tinker/Sophix/AndFix 对比与选型
---

# 热修复方案对比

> 面试高频指数：高
> 热修复在国内是标配能力，理解方案原理才能正确选型。

## 1. 什么是热修复

```text
热修复（Hotfix）：不发新版本，线上修复 bug

适用：线上紧急 bug（崩溃、严重逻辑错误）
不适用：新增功能、UI 大改（需发版）

流程：
① 修复代码 → 生成补丁（patch）
② 上传补丁包
③ App 启动/运行时拉取补丁
④ 加载补丁 → 修复生效
```

## 2. 主流方案分类

| 方案 | 原理 | 代表框架 | 特点 |
| --- | --- | --- | --- |
| 类加载替换 | 补丁 dex 插到 ClassLoader 前面 | Tinker（微信） | 兼容性好 |
| 底层方法替换 | Native 替换方法指针 | AndFix（阿里） | 即时生效 |
| Instant Run | Android Studio 专用 | 官方（开发用） | 仅开发期 |
| 资源修复 | 替换资源包 | Tinker/Sophix | 修资源问题 |

## 3. 方案一：类加载替换（Tinker）

```text
原理：
① 修复后的类编译为补丁 dex
② 把补丁 dex 插入类加载器 dexElements 数组最前面
③ 加载同名类时优先找到补丁类 → 替换生效

限制：
- 只能修改方法实现
- 不能新增/删除方法或字段（结构变化 → ClassVerifyError）
- 生效时机：下次启动（类加载前注入）
```

::: code-tabs

@tab:active Java

```java
// Tinker 使用（简化）
// ① 生成补丁：TinkerPatch 插件
// ② 客户端加载
Tinker.install(applicationLike);

// 补丁下载后：
Tinker.with(appContext).loadPatch(patchPath, callback);
```

@tab Kotlin

```kotlin
// Tinker 使用（简化）
// ① 生成补丁：TinkerPatch 插件
// ② 客户端加载
Tinker.install(applicationLike)

// 补丁下载后：
Tinker.with(appContext).loadPatch(patchPath, callback)
```

:::

**优点**：兼容性好（不依赖系统私有 API）、覆盖面广。
**缺点**：结构变化受限、需重启生效、补丁包较大（dex 级）。

## 4. 方案二：底层方法替换（AndFix）

```text
原理：
- Native 层直接替换方法在 ArtMethod 结构中的入口
- 修复方法 → 生成补丁（含修复方法）
- 运行时把原方法的 ArtMethod 入口替换为补丁方法

特点：
- 即时生效（无需重启）
- 粒度：方法级别
```

**优点**：即时生效。
**缺点**：依赖 ART 内部结构（版本差异脆弱）、兼容性差、
复杂逻辑难处理。已基本被 Sophix 替代。

## 5. 方案三：综合方案（Sophix / 阿里）

```text
Sophix：阿里移动热修复（基于 AndFix 演进）

特点：
- 支持方法级即时生效 + 类级补丁
- 服务端一体化（补丁制作、发布、回滚）
- 兼容性改进（多种 fallback）

补充（Instant Run）：仅开发期热更新，不是线上方案
```

## 6. 方案对比总结

| 维度 | Tinker | AndFix | Sophix |
| --- | --- | --- | --- |
| 原理 | 类加载替换 | ArtMethod 替换 | 综合（类+方法） |
| 生效时机 | 重启 | 即时 | 即时/重启 |
| 方法修改 | ✓ | ✓ | ✓ |
| 新增方法 | ✗ | ✓ | ✓ |
| 兼容性 | 高 | 低 | 中高 |
| 补丁大小 | 较大 | 小 | 中 |
| 代表 | 微信 | - | 阿里 |

## 7. 热修复最佳实践

```text
① 补丁发布流程：
   修复 → 生成补丁 → 灰度（小比例）→ 全量 → 观察指标
② 回滚：服务端一键回滚（补丁下架/切换）
③ 成功率监控：补丁拉取率、应用率、崩溃率
④ 安全：补丁签名校验（防篡改）
⑤ 与发版策略配合：热修复救急，正常迭代走发版
```

## 8. 高频面试题

**Q1：热修复的原理有哪些？**
A：三种：① 类加载替换（补丁 dex 插队，Tinker）；② 底层方法替换
（ArtMethod 指针替换，AndFix）；③ 资源替换（修复资源）。主流是
类加载方案（兼容性最好）。

**Q2：Tinker 为什么只能改方法不能改结构？**
A：类加载替换基于"同名类优先加载"。如果类结构变化（新增方法/字段），
补丁类与旧类结构不同，被引用的旧代码校验失败（VerifyError）。
所以只能改方法实现（签名不变）。

**Q3：Tinker 和 AndFix 的优缺点？**
A：Tinker 兼容性好、需重启、只能改方法体；AndFix 即时生效、
依赖 ART 内部结构（版本脆弱）。选型：追求稳定兼容选 Tinker，
追求即时生效且能控制机型范围选 Sophix 类方案。

**Q4：热修复为什么不适用于海外？**
A：Google Play 政策禁止动态下发可执行代码（dex）。海外合规替代：
Google Play Console 的紧急更新（提高版本）、App Bundle 动态特性。

**Q5：如何保证补丁安全？**
A：补丁签名校验（与宿主签名匹配）、加密传输（HTTPS）、服务端
鉴权（补丁只对指定版本下发）、补丁完整性校验（MD5）、发布灰度。

## 9. 小结

- 三大原理：类加载替换、方法替换、资源替换。
- Tinker：兼容稳、重启生效；AndFix：即时、脆弱；Sophix：综合。
- 流程：灰度发布 + 回滚 + 指标监控。
- 政策：海外受限，国内主流。
- 面试重点：原理对比、Tinker 限制、选型逻辑。

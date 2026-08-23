---
icon: gradle
title: Gradle 基础与构建优化
description: Gradle 与 AGP、构建生命周期、构建变体、缓存与并行、Configuration Cache 构建优化
---

# 📦 Gradle 基础与构建优化

> 面试高频指数：⭐⭐⭐⭐
> 构建速度直接影响开发效率，Gradle 优化是工程能力的体现。

## 1. Gradle 与 AGP

```text
Gradle：通用构建工具（基于 Groovy/Kotlin DSL）
AGP（Android Gradle Plugin）：Gradle 的 Android 插件

版本配套（关键！）：
| Gradle 版本 | AGP 版本 | 要求 JDK |
|-------------|----------|----------|
| 8.x | 8.x（如 8.5） | 17 |
| 8.7 | 8.4/8.5 | 17 |
| 9.0 | 8.9+ | 17 |

⚠️ 升级必须查兼容矩阵，否则构建失败
```

## 2. 构建生命周期

```text
三个阶段：
① 初始化（Initialization）：找到 settings.gradle，创建工程
② 配置（Configuration）：执行 build.gradle，构建任务图
③ 执行（Execution）：按依赖执行任务

优化方向：
- 配置阶段：减少脚本耗时（避免不必要逻辑）
- 执行阶段：缓存 + 并行 + 跳过无用任务
```

## 3. 构建变体（Build Variants）

```text
变体 = buildType × flavor

buildType：
- debug（调试：可调试、不混淆）
- release（发布：混淆、压缩）

flavor（维度）：
- 渠道（free/pro）
- 环境（dev/test/prod）

组合示例：freeDebug / freeRelease / proDebug / proRelease

多环境配置：
buildTypes {
    debug {
        buildConfigField("String", "API_BASE_URL", "\"https://test.api.com\"")
    }
    release {
        buildConfigField("String", "API_BASE_URL", "\"https://api.com\"")
        isMinifyEnabled = true
    }
}
```

## 4. 构建优化

### 4.1 缓存与并行

```groovy
// gradle.properties（全局优化）
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g  // 内存
org.gradle.parallel=true                            // 并行模块构建
org.gradle.caching=true                             // 构建缓存
org.gradle.configuration-cache=true                 // 配置缓存（大提速）
```

```text
Configuration Cache 收益：
- 配置阶段只执行一次（跨构建复用）
- 大型项目可提速 30%+

注意：
- 需要插件兼容（AGP 8+ 默认支持）
- 避免在配置阶段使用运行时 API
```

### 4.2 其他优化

```text
① 只构建目标变体：
   ./gradlew :app:assembleDebug（而非 assemble）

② 增量构建：
   - 减少任务依赖（模块拆分合理）
   - 避免全量 clean

③ 依赖优化：
   - 统一版本（Version Catalog）
   - 避免动态版本（1.0.+ → 固定版本）

④ 本地构建缓存：
   - 设置 Gradle 用户目录（多项目共享）
   - Build Cache Node（远程缓存，团队共享）

⑤ 开启并行：
   - 并行构建 + 并行测试
```

## 5. 常用命令与调试

```bash
./gradlew assembleDebug                # 构建 debug
./gradlew :app:assembleRelease         # 构建 release（单模块）
./gradlew testDebugUnitTest            # 单元测试
./gradlew lintDebug                    # Lint 检查
./gradlew installDebug                 # 安装到设备
./gradlew tasks                        # 查看所有任务
./gradlew build --scan                 # 生成构建报告（分析耗时）
./gradlew :app:dependencies            # 查看依赖树
./gradlew --profile                    # 构建性能分析
```

## 6. 高频面试题

**Q1：Gradle 构建流程分几个阶段？**
A：初始化（settings）→ 配置（执行脚本、构建任务图）→ 执行（按依赖
运行任务）。优化重点是配置阶段和执行阶段。

**Q2：如何提升构建速度？**
A：Configuration Cache + 并行 + 构建缓存；只构建目标变体；增量构建；
依赖固定版本；合理模块划分；升级 Gradle/AGP；远程构建缓存。

**Q3：Configuration Cache 的原理？**
A：把配置阶段结果序列化缓存，下次构建直接复用（跳过脚本执行）。
避免重复配置计算。要求脚本"配置可缓存"（无运行时副作用）。

**Q4：buildType 和 flavor 的区别？**
A：buildType 是构建类型（debug/release，影响混淆/签名/调试）；
flavor 是产品维度（渠道/环境，可组合多维度）。两者组合生成构建变体。

**Q5：依赖冲突怎么解决？**
A：查看依赖树（:app:dependencies）；排除传递依赖（exclude）；
强制版本（resolutionStrategy force）；统一版本管理（Version Catalog）
从源头避免。

## 7. 小结

- Gradle + AGP 版本必须配套。
- 生命周期：初始化 → 配置 → 执行。
- 变体 = buildType × flavor。
- 优化三件套：缓存、并行、Configuration Cache。
- 面试重点：阶段、优化手段、变体、依赖冲突。

---
icon: gradle
title: Version Catalog 依赖管理
description: Version Catalog 原理、libs.versions.toml 配置、依赖引用、版本统一与迁移
---

# Version Catalog 依赖管理

> 面试高频指数：中
> Version Catalog 是 AGP 7.0+ 官方推荐的依赖管理方式，取代 buildSrc。

## 1. 为什么需要统一依赖管理

```text
问题：
- 多模块重复声明依赖（版本不一致）
- 升级版本要改多处（遗漏导致冲突）
- buildSrc 方案编译慢（每次改动全量重编译）

Version Catalog 优势：
- 集中管理（libs.versions.toml）
- 类型安全（生成访问器）
- 自动建议升级（IDE 支持）
- 构建快（不参与编译）
```

## 2. 目录文件结构

```toml
# gradle/libs.versions.toml

[versions]
agp = "8.5.2"
kotlin = "2.0.0"
coreKtx = "1.13.1"
lifecycle = "2.8.4"
retrofit = "2.11.0"
okhttp = "4.12.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycle" }
lifecycle-viewmodel-ktx = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-ktx", version.ref = "lifecycle" }
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
retrofit-converter-gson = { group = "com.squareup.retrofit2", name = "converter-gson", version.ref = "retrofit" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }

[bundles]
network = ["retrofit", "retrofit-converter-gson", "okhttp"]

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
```

## 3. 在构建脚本中使用

```groovy
// 根 build.gradle（声明插件版本）
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}

// 模块 build.gradle
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

dependencies {
    // 单个依赖（使用访问器）
    implementation(libs.androidx.core.ktx)
    implementation(libs.lifecycle.runtime.ktx)
    implementation(libs.lifecycle.viewmodel.ktx)

    // Bundle（一组依赖）
    implementation(libs.bundles.network)

    // 测试
    testImplementation(libs.junit)
}
```

```text
访问器规则：
libs.versions.toml 中的名字：
- 短横线（-）→ 点（.）：core-ktx → libs.core.ktx
- 下划线（_）→ 点（.）：core_ktx → libs.core.ktx

bundle 引用：libs.bundles.xxx
插件引用：libs.plugins.xxx
```

## 4. 多模块复用

```groovy
// 每个模块引用同一 catalog（自动可用）
// 无需重复配置，根 settings.gradle 中开启：

// settings.gradle
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
// libs.versions.toml 默认在 gradle/ 目录自动加载
```

## 5. 迁移与注意事项

```text
从 build.gradle 直接声明迁移：
① 创建 gradle/libs.versions.toml
② 把版本 + 依赖移入（version.ref 引用）
③ 模块中使用 libs.xxx 替代字符串
④ 删除重复的 ext 定义

注意事项：
- version.ref 引用的 key 必须在 [versions] 中
- 模块级声明带版本会报错（需在 catalog 统一）
- AGP 7.0+ 支持；8.x 完全推荐
```

## 6. 高频面试题

**Q1：Version Catalog 是什么？**
A：AGP 官方依赖管理方案：用 gradle/libs.versions.toml 集中声明版本
与依赖，生成类型安全的访问器（libs.xxx），多模块自动共享。

**Q2：和 buildSrc 比有什么优势？**
A：buildSrc 是构建脚本目录（Kotlin DSL），任何改动触发全量重编译
（慢）；Version Catalog 纯 TOML 数据，不参与编译，构建快，且
IDE 支持版本升级提示。

**Q3：Bundle 是什么？**
A：依赖分组：把一组常一起使用的依赖定义为一个 bundle，
引用一次即可全部引入（如网络栈 retrofit + gson + okhttp）。

**Q4：如何统一版本避免冲突？**
A：Version Catalog 集中管理 + 多模块共享；升级只改 toml 一处；
配合 resolutionStrategy 处理特殊冲突；禁用动态版本。

**Q5：访问器名称怎么生成？**
A：toml 中的 key：`-` 和 `_` 转为 `.`（core-ktx → core.ktx）。
bundle 前缀 `libs.bundles.`，插件前缀 `libs.plugins.`。
避免 key 含特殊字符（用 `-`/`_` 分隔）。

## 7. 小结

- Version Catalog = 统一版本 + 类型安全访问器。
- 文件：gradle/libs.versions.toml（versions/libraries/bundles/plugins）。
- 引用：libs.xxx、libs.bundles.xxx、libs.plugins.xxx。
- 优势：构建快、升级集中、IDE 支持。
- 面试重点：与 buildSrc 对比、目录结构、访问器规则。

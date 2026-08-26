---
icon: performance
title: 包体积优化
description: APK 体积构成分析、代码压缩 R8、资源优化、SO 裁剪、动态特性模块、App Bundle 分发
---

# 包体积优化

> 面试高频指数：高
> 包体积影响下载转化率与安装率，是性能优化的重要维度。

## 1. 为什么优化包体积

```text
① 下载转化率：体积每大 1MB，转化率下降约 1%
② 安装成功率：体积大 → 下载失败/超时多
③ 渠道/商店限制：部分市场限制包体
④ 用户体验：流量与存储成本

目标：基础包（不含动态模块）尽量小
```

## 2. APK 构成分析

```text
APK 组成：
├── classes.dex（代码，可压缩）
├── resources.arsc（资源索引表）
├── res/（资源：图片、布局、值）
├── assets/（原始资源：字体、json）
├── lib/（SO 库：arm64-v8a / armeabi-v7a / x86）
└── META-INF/（签名）

分析工具：
- Android Studio：Build → Analyze APK
- 查看各类型占比，针对性优化
```

## 3. 代码层优化（最有效）

### 3.1 R8 开启

```groovy
// build.gradle（默认 release 开启）
android {
    buildTypes {
        release {
            isMinifyEnabled = true        // 压缩 + 混淆
            isShrinkResources = true      // 资源压缩（配合 minify）
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro")
        }
    }
}
```

```text
R8 效果：
- 删除未使用的类/方法/字段（可达性分析）
- 混淆（短名称）
- 优化（内联、去冗余）
- 删除未使用资源（配合 shrinkResources）
```

### 3.2 其他代码优化

```text
① 移除无用依赖（dependencies 审查）
② 用支持库替代大库（或用模块化子库）
③ 避免引入大框架（如整个 retrofit 换成轻量方案需权衡）
④ 去除 debug 代码/日志
⑤ 图片库选择（尽量内置，避免引入过多）
```

## 4. 资源层优化

### 4.1 图片优化

```text
① 格式选型：
   - PNG → WebP（无损/有损，体积更小）
   - 简单图形用 VectorDrawable（矢量）
   - 照片用 JPEG/WebP（有损）
② 压缩：
   - 删除未使用资源（Lint UnusedResources + shrinkResources）
   - 尺寸裁剪（配合分辨率限定符）
③ 位图配置：ARGB_8888 → RGB_565（无透明通道时）
```

### 4.2 其他资源

```text
① 语言资源：按需保留（resConfigs "zh-rCN","en"）
② 多 Density：用 VectorDrawable/WebP，减少多套图
③ 资源混淆：资源名缩短（资源混淆器，配合 R8）
④ assets 审查：大文件（字体/JSON）压缩或裁剪
```

## 5. SO 库优化

```text
① ABI 裁剪：只保留主流架构
   defaultConfig {
       ndk {
           abiFilters "arm64-v8a", "armeabi-v7a"
           // 剔除 x86（模拟器可用 x86_64 调试包）
       }
   }
② 按需加载：动态特性模块中放可选 SO
③ 合并/去重：lib 合并、去除 debug SO
④ 尽量用官方精简版（如 FFmpeg 裁剪编译）
```

## 6. 动态特性模块（Dynamic Delivery）

```text
App Bundle（.aab）+ Play Dynamic Delivery：
- 基础包（base）：核心功能
- 动态特性模块（feature_*）：按需下载
  - 功能模块（如 直播模块）
  - 配置模块（如 不同地区资源）
  - 按需分发（on-demand）

优势：首次安装包更小，功能按需加载

注意：国内渠道不支持 .aab，可自建动态下载（或降级静态打包）
```

```groovy
// 动态特性模块
plugins {
    id("com.android.dynamic-feature")
}

// 应用内按需下载
val splitInstallManager = SplitInstallManagerFactory.create(context)
val request = SplitInstallRequest.newBuilder()
    .addModule("videoModule")
    .build()
splitInstallManager.startInstall(request)
```

## 7. 高频面试题

**Q1：包体积主要由什么组成？如何分析？**
A：dex（代码）+ resources.arsc + res + assets + lib（SO）+ 签名。
用 Analyze APK 查看占比，通常 dex 和图片、SO 是大头，针对性优化。

**Q2：R8 和 shrinkResources 的原理？**
A：R8 基于可达性分析删除无用代码并混淆优化（只保留被引用部分）；
shrinkResources 配合 R8 删除未被引用的资源。注意 keep 规则避免误删
（反射调用的类/资源）。

**Q3：图片怎么优化？**
A：WebP 替代 PNG；矢量图（VectorDrawable）替代简单位图；压缩裁剪；
删除未用资源；尺寸限定符适配。多 Density 用矢量图/WebP 减少套数。

**Q4：如何裁剪 SO 库？**
A：abiFilters 只保留目标架构（arm64-v8a/armeabi-v7a）；按需加载（动态
模块）；FFmpeg 等裁剪编译（去无用功能）；合并重复 SO。

**Q5：App Bundle 是什么？国内能用吗？**
A：AAB 是 Google Play 的分发格式，按设备生成最精简 APK（ABI/语言/
密度裁剪）。国内渠道不支持，可自建动态特性模块或静态打包全量 APK。

## 8. 小结

- 分析先行：Analyze APK 看构成。
- 代码：R8 压缩 + 混淆（最大收益）。
- 资源：WebP/矢量图 + shrinkResources + resConfigs。
- SO：abiFilters 裁剪 + 按需加载。
- 分发：AAB 动态交付（海外）/ 动态模块（国内自建）。
- 面试重点：R8 原理、图片方案、SO 裁剪、AAB。

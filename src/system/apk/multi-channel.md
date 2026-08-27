---
icon: apk
title: 多渠道打包方案
description: 多渠道打包原理、Gradle 维度配置、productFlavors、美团 Walle 方案、V2/V3 签名与渠道信息注入
---

# 多渠道打包方案

> 面试高频指数：高
> 多渠道打包是发布流程的必备技能，从 Gradle 配置到 Walle 秒级打包全解析。

## 1. 什么是多渠道

```text
多渠道（Channel）：区分应用来源的标识
常见渠道：应用宝、华为、小米、OPPO、vivo、Google Play、官网...

用途：
① 统计各渠道下载/激活/转化数据
② 分渠道运营（不同活动、不同配置）
③ 渠道包灰度、审核
```

## 2. 传统方案：Gradle productFlavors

```groovy
// build.gradle（app 模块）
android {
    defaultConfig {
        // 默认渠道（占位符）
        manifestPlaceholders = [channel: "default"]
    }

    productFlavors {
        tencent {
            manifestPlaceholders = [channel: "tencent"]
            buildConfigField "String", "CHANNEL", "\"tencent\""
        }
        huawei {
            manifestPlaceholders = [channel: "huawei"]
            buildConfigField "String", "CHANNEL", "\"huawei\""
        }
        xiaomi {
            manifestPlaceholders = [channel: "xiaomi"]
            buildConfigField "String", "CHANNEL", "\"xiaomi\""
        }
    }
}
```

```xml
<!-- AndroidManifest.xml -->
<application>
    <meta-data
        android:name="CHANNEL"
        android:value="${channel}" />
</application>
```

读取渠道信息的核心实现如下：

::: code-tabs

@tab:active Java

```java
// 读取渠道
String getChannel(Context context) {
    PackageManager pm = context.getPackageManager();
    ApplicationInfo info = pm.getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
    String channel = info.metaData.getString("CHANNEL");
    return channel != null ? channel : "unknown";
}
```

@tab Kotlin

```kotlin
// 读取渠道
fun getChannel(context: Context): String {
    val pm = context.packageManager
    val info = pm.getApplicationInfo(context.packageName, PackageManager.GET_META_DATA)
    return info.metaData?.getString("CHANNEL") ?: "unknown"
}
```

:::

**缺点**：每个渠道**完整编译打包一次**（慢），几十个渠道就要编译几十次。

## 3. 现代方案：美团 Walle（推荐）

```text
Walle（瓦力）：美团开源的多渠道打包工具

原理：
利用 APK 的 V2/V3 签名块（APK Signing Block）
在其"空白区"写入渠道信息，不重新签名、不重新编译

优点：
- 秒级打包（复制 APK + 写入渠道信息）
- 不影响签名（V2/V3 校验区之外）
- 渠道信息读取快（内存解析）
```

```groovy
// ① 集成
// 根 build.gradle
buildscript {
    dependencies {
        classpath 'com.meituan.android.walle:plugin:1.1.7'
    }
}

// app build.gradle
apply plugin: 'walle'

walle {
    apkOutputFolder = new File("${project.buildDir}/outputs/channels")
    apkFileNameFormat = '${appName}-${versionName}-${channel}.apk'
    channelFile = new File("${project.getProjectDir()}/channel.txt")
}

// ② 渠道列表 channel.txt
tencent
huawei
xiaomi
oppo
vivo
googleplay
```

Walle 读取渠道信息的实现如下：

::: code-tabs

@tab:active Java

```java
// ③ 读取渠道（Walle 提供）
String channel = WalleChannelReader.getChannel(context);
```

@tab Kotlin

```kotlin
// ③ 读取渠道（Walle 提供）
val channel = WalleChannelReader.getChannel(context)
```

:::

**打包命令**：

```bash
./gradlew assembleRelease
# 自动生成所有渠道包（秒级，每个渠道只需复制+写入）
```

## 4. 方案对比

各多渠道方案的对比说明如下：

| 方案 | 原理 | 速度 | 签名影响 | 适用 |
| --- | --- | --- | --- | --- |
| productFlavors | 每个渠道完整编译 | 慢（分钟级/渠道） | 无 | 渠道少（<10） |
| Walle | 写 APK Signing Block | 快（秒级/渠道） | 无（V2/V3 安全） | 渠道多 |
| 打包服务 | 后端打包 | 取决于服务 | 无 | 团队协作 |
| 动态下发 | 运行时读取配置 | - | 无 | 渠道配置灵活 |

## 5. V1/V2/V3 签名回顾

```text
V1（JAR 签名）：验证 APK 内所有文件（META-INF）
V2（APK Signature Scheme v2）：验证整个 APK（签名块）
V3：支持密钥轮换（签名证书可更新）

Walle 利用 V2/V3 的 APK Signing Block 的"padding"区：
- 位于签名校验范围之外
- 写入渠道信息不影响校验
- Android 7.0+ 默认 V2，Walle 要求 V2 签名
```

## 6. 高频面试题

**Q1：多渠道打包有哪些方案？**
A：Gradle productFlavors（每个渠道完整编译，慢）；Walle（写 V2 签名块，
秒级）；Gradle ManifestPlaceholders（meta-data 占位，需编译）；运行时
动态渠道（云端下发）。常用 Walle + productFlavors 组合。

**Q2：Walle 的原理？为什么快？**
A：APK 的 V2/V3 签名块有预留的 padding 区，Walle 把渠道信息写在这里，
不影响签名校验。打包 = 复制母包 + 写入渠道信息（秒级），无需重新编译。

**Q3：channel 信息存在哪？如何读取？**
A：存在 APK Signing Block 的 padding 区（V2/V3）。读取：WalleChannelReader
解析 APK 的 signing block，内存中读取，无需解压 APK。

**Q4：productFlavors 和 Walle 怎么选？**
A：渠道少（<10）且需要不同配置（如不同包名/权限）→ flavors；
渠道多（几十上百）且仅渠道号不同 → Walle。两者可结合（flavors 定义
配置，Walle 写渠道）。

**Q5：什么是渠道统计？如何防作弊？**
A：渠道统计基于安装包来源标记（channel），上报服务端。防作弊：设备指纹、
首次激活 IP/设备唯一性校验、渠道激活时间窗、服务端风控。

## 7. 小结

- 多渠道 = 渠道标识注入 + 读取 + 统计上报。
- 传统 flavors 慢，Walle 秒级（写签名块 padding）。
- V2/V3 签名块是 Walle 的基础。
- 面试重点：Walle 原理、方案选型、签名机制。

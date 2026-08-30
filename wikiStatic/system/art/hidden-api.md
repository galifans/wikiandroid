---
icon: art
title: 隐藏 API 限制机制
description: 隐藏 API 白名单/灰名单/黑名单、反射检测、@hide 注解、兼容方案、greenlist/greylist
---

# 隐藏 API 限制机制

> 面试高频指数：中
> Android 9.0+ 对非 SDK 接口（隐藏 API）的访问限制影响了很多反射/黑科技方案，理解机制才能安全兼容。

## 1. 什么是隐藏 API

```text
隐藏 API（Hidden API / Non-SDK interface）：
- Android SDK 中未公开的类、方法、字段
- 源码中标记 @hide 注解
- 编译时对应用不可见，但运行时仍存在

示例：
android.os.SystemProperties.get()
ActivityManager.getService()
反射调用 hide 方法曾是实现黑科技的常用手段
```

## 2. 限制机制（Android 9.0+）

### 2.1 三类名单

| 名单 | 含义 | 访问结果 |
|------|------|----------|
| whitelist（白名单） | 官方开放 | 正常 |
| greylist（灰名单） | 允许但警告 | 可用 + 日志警告 |
| blacklist（黑名单） | 禁止 | 抛 NoSuchMethodError/异常 |

```text
版本演进：
Android 9.0：首次引入，默认限制
Android 10：黑名单扩大，反射检测更严
Android 11+：名单持续调整，兼容工具需更新
```

### 2.2 触发方式

```text
限制覆盖所有访问路径：
① 直接调用（编译期已受限，SDK 中不可见）
② 反射（Class.forName + getMethod + invoke）
③ JNI 访问
④ 字节码操作

检测时机：
- 首次访问时按 类/方法/字段 查名单
- 命中黑名单 → 抛异常
- 命中灰名单 → logcat 警告（ENFORCE 模式）
```

## 3. 反射检测细节

### 3.1 反射访问示例

```java
// 反射访问隐藏 API（可能被限制）
Class<?> clazz = Class.forName("android.os.SystemProperties");
Method get = clazz.getMethod("get", String.class);
String value = (String) get.invoke(null, "ro.build.version.sdk");
```

```text
Android 10+ 反射调用隐藏 API：
- 类加载时标记（hiddenapi）
- 方法解析时检查（member）
- 黑名单 → NoSuchMethodException / SecurityException
- 例外：应用自身代码（boot classpath 外）与系统签名 App
```

### 3.2 豁免场景

```text
豁免情况：
- 系统应用（签名匹配 platform key）
- 应用声明 hiddenapi 豁免（targetSdk 匹配旧版本时部分开放）
- 部分开发调试（adb shell 下）
- OEM 定制 ROM（可关闭限制）
```

## 4. 兼容方案与风险

### 4.1 常见规避思路（不推荐生产使用）

| 方案 | 原理 | 风险 |
|------|------|------|
| 反射调用 | 老版本可行 | 新版本被黑名单拦截 |
| Unsafe/内存操作 | 绕过检查 | 高危、不稳定 |
| 修改 boot classpath | 系统级 | 需 root/系统权限 |
| 框架层 Hook | Xposed 等 | 需 root，非通用 |

### 4.2 官方替代方案

```text
面对隐藏 API 限制，正确姿势：
① 用公开 SDK API（Jetpack 封装）
② 申请系统权限/系统应用（特殊场景）
③ 使用官方扩展（如 core library desugaring）
④ 借助 framework 层 open source 实现替代
```

## 5. 与兼容性的关系

### 5.1 对 App 的影响

```text
常见受影响场景：
- 读取系统属性（SystemProperties）
- 调用 ActivityManager 隐藏方法
- 反射 View/Window 内部实现
- 热修复框架（部分依赖 hide API）

排查日志：
D AndroidRuntime: Accessing hidden method ...
W System.err: UnsatisfiedLinkError / NoSuchMethodError
```

### 5.2 检查工具

```bash
# 通过 veridex 扫描 apk 中隐藏 API 使用
./veridex --core-platform-app /path/app.apk

# 运行期查看
adb logcat | grep -i "hidden"
```

## 6. 高频面试题

**Q1：隐藏 API 是什么？为什么限制？**
A：非 SDK 接口（@hide），限制其被第三方应用访问。目的是保护兼容性（隐藏 API 可能变化）、安全与系统稳定。

**Q2：黑白灰名单分别是什么？**
A：白名单正常开放；灰名单可用但警告；黑名单禁止（抛异常）。Android 9.0 引入，10+ 收紧。

**Q3：反射能绕过隐藏 API 限制吗？**
A：不能。9.0+ 对反射访问同样检查（类加载与方法解析时），命中黑名单仍抛异常。灰名单可访问但有警告。

**Q4：为什么有的 App 用隐藏 API 没问题？**
A：可能是豁免场景（系统签名 App、targetSdk 匹配旧版部分开放、OEM 关闭限制）或仅用到灰名单接口（警告不阻塞）。

**Q5：如何避免依赖隐藏 API？**
A：用公开 SDK/Jetpack 替代；系统能力走官方 API；必要时申请系统权限或采用服务端能力，避免黑科技。

## 7. 小结

- 隐藏 API = @hide 非 SDK 接口，9.0+ 受限制。
- 白/灰/黑名单：开放/警告/禁止。
- 反射、JNI、字节码访问均在检查范围。
- 兼容方案：公开 API 替代，避免黑科技。
- 排查：veridex 扫描 + logcat hidden 日志。

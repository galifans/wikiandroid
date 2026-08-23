---
icon: source
title: 面试源码篇
---

# 📕 面试高频题：源码篇

> 源码理解是面试的分水岭，以下是最常被追问的源码主题。

## 一、Handler 消息机制

### 1. Handler 的工作原理？
- Handler 发消息进 MessageQueue，Looper 死循环取出分发（详见[源码解析](/network/handler/handler-source.md)）

### 2. 主线程 Looper 死循环为什么不 ANR？
- 队列为空时 `nativePollOnce` 阻塞休眠（epoll），不占用 CPU
- 有消息立即处理，不存在"卡死"

### 3. `postDelayed` 的延迟原理？
- 消息按 `when`（时间）排序，`next()` 计算等待时间

## 二、Binder 机制

### 4. Binder 的优势与原理？
- 一次拷贝（mmap）、内核 UID 校验（详见[机制详解](/system/binder/binder-mechanism.md)）

### 5. AIDL 的 `oneway`？
- 异步调用，客户端不阻塞等待返回

## 三、Activity 启动流程

### 6. 简述 Activity 启动流程？
```
startActivity → Instrumentation → AMS
→ Zygote fork 进程 → ActivityThread.main
→ 创建 Application/Activity → 添加窗口 → 首帧
```

### 7. Zygote 的作用？
- 系统启动时预加载框架资源与类，App 启动通过 fork 快速创建进程

## 四、系统启动

### 8. 系统启动流程？
- 内核 → init → Zygote → SystemServer → Launcher

## 五、类加载

### 9. 双亲委派机制？
- 类加载请求先委托父加载器，父加载不了才自己加载
- 热修复原理：将补丁 Dex 插入类加载器路径最前面

## 六、打包与构建

### 10. APK 构建流程？
- AAPT2 → 编译 → D8 → 资源链接 → 打包 → 签名 → 对齐（详见[打包流程](/system/apk/apk-build-process.md)）

### 11. R8 与混淆？
- 代码压缩、混淆、资源裁剪、优化

> 💡 建议配合[面试准备计划](/interview/interview-plan.md)系统复习。

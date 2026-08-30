---
icon: art
title: JNI 与 ART 交互机制
description: JNI 函数表、本地方法注册、局部/全局引用、JNI 与 GC、JavaVM/Env、JNI 性能与优化
---

# JNI 与 ART 交互机制

> 面试高频指数：高
> JNI（Java Native Interface）是 Java 与 Native 代码的桥梁，NDK 开发与系统源码都依赖它，理解其机制是性能优化的基础。

## 1. JNI 是什么

```text
JNI = Java Native Interface
Java 与 C/C++ 代码互相调用的标准接口

用途：
① 调用 native 库（加密、算法、音视频）
② 性能敏感代码（图像处理、协议解析）
③ 系统级能力（文件、硬件）
④ 复用现有 C/C++ 库
```

```java
// Java 声明 native 方法
public class NativeBridge {
    static {
        System.loadLibrary("mylib");  // libmylib.so
    }

    public native String nativeGetVersion();
}
```

## 2. 本地方法注册

### 2.1 两种注册方式

```text
方式一：命名约定（自动注册）
Java_com_example_NativeBridge_nativeGetVersion(JNIEnv*, jobject)

方式二：RegisterNatives（显式注册）
JNI_OnLoad 中调用 env->RegisterNatives()
```

```c
// RegisterNatives 方式（推荐，性能更好）
static JNINativeMethod methods[] = {
    {"nativeGetVersion", "()Ljava/lang/String;", (void*)native_impl},
};

JNIEXPORT jint JNI_OnLoad(JavaVM* vm, void* reserved) {
    JNIEnv* env;
    vm->GetEnv((void**)&env, JNI_VERSION_1_6);
    jclass clazz = env->FindClass("com/example/NativeBridge");
    env->RegisterNatives(clazz, methods, 1);
    return JNI_VERSION_1_6;
}
```

| 方式 | 优点 | 缺点 |
|------|------|------|
| 命名约定 | 简单 | 符号长、查找慢 |
| RegisterNatives | 快、灵活 | 需 JNI_OnLoad 代码 |

## 3. JNIEnv 与 JavaVM

### 3.1 概念

```text
JavaVM：进程级唯一，代表 Java 虚拟机实例
JNIEnv：线程级，代表当前线程的 JNI 环境

关系：
- 每个线程一个 JNIEnv
- 通过 JavaVM 的 GetEnv/AttachCurrentThread 获取
- JNIEnv 内含函数表（Function Table）：所有 JNI 函数
```

### 3.2 线程附加

```c
// native 线程调用 Java 方法前需 Attach
JavaVM* vm;  // 全局保存
JNIEnv* env;
vm->AttachCurrentThread(&env, nullptr);
// ... 调用 Java 方法
vm->DetachCurrentThread();
```

```text
注意：
- 主线程/Java 调用进入的 native 线程已有 Env，无需 Attach
- 自己创建的 pthread 必须 Attach 才能用 JNI
- Attach 后线程会注册到 JVM（影响 GC 线程数）
```

## 4. 引用类型管理

### 4.1 局部引用与全局引用

| 类型 | 生命周期 | 使用 |
|------|----------|------|
| 局部引用 | 当前 native 调用 | 临时使用，自动释放 |
| 全局引用 | 显式释放 | 长期持有（缓存 jclass） |
| 弱全局引用 | 可被 GC | 缓存但允许回收 |

```c
// 局部引用
jclass clazz = env->FindClass("com/example/Foo");  // 局部

// 全局引用（跨调用保存）
static jclass gClazz;
gClazz = (jclass)env->NewGlobalRef(localClazz);

// 释放
env->DeleteGlobalRef(gClazz);
```

### 4.2 引用泄漏风险

```text
常见泄漏：
- 局部引用表溢出（大量循环创建局部引用）
  → 用 DeleteLocalRef 或 PushLocalFrame/PopLocalFrame
- 全局引用不释放 → 类/对象永不回收

循环中处理：
for (int i = 0; i < n; i++) {
    jstring s = env->NewStringUTF(...);
    // 使用后释放
    env->DeleteLocalRef(s);
}
```

## 5. JNI 与 GC 交互

### 5.1 本地引用与 GC Roots

```text
JNI 引用与 GC 的关系：
- 全局引用 = GC Root（对象不会被回收）
- 局部引用 = 当前线程栈的根
- 弱全局引用 = 不阻止回收

潜在问题：
- 长期持有全局引用 → 对象泄漏
- JNI 调用期间对象移动（compacting GC）
  → JNI 保证引用在调用期间有效（handle 机制）
```

### 5.2 对象访问开销

```text
JNI 访问 Java 对象的开销：
- GetField/SetField：反射式访问（相对慢）
- GetXXXField 每次调用都有开销

优化：
- 缓存字段 ID（GetFieldID 一次，后续复用）
- 批量操作减少 JNI 边界往返
- 用 Direct Buffer / Critical 减少拷贝
```

## 6. JNI 性能优化

### 6.1 JNI 开销来源

| 开销 | 说明 |
|------|------|
| 边界往返 | Java ↔ native 切换 |
| 引用解析 | 局部/全局引用查找 |
| 字段访问 | GetFieldID 后反射访问 |
| 字符串转换 | NewStringUTF 编码转换 |
| 数据拷贝 | GetByteArrayElements 等 |

### 6.2 优化手段

```text
① 减少 JNI 调用次数（批量处理）
② 缓存 jclass/方法 ID/字段 ID
③ 用 Get/Release 直接访问数组（或 Critical）
④ 避免频繁字符串转换
⑤ 大块数据用 Direct ByteBuffer（零拷贝）
```

```c
// 缓存字段 ID 示例
static jfieldID gCountField = nullptr;

// 首次获取后缓存
if (gCountField == nullptr) {
    jclass c = env->GetObjectClass(obj);
    gCountField = env->GetFieldID(c, "count", "I");
    env->DeleteLocalRef(c);
}
int count = env->GetIntField(obj, gCountField);
```

## 7. 高频面试题

**Q1：JNIEnv 和 JavaVM 的区别？**
A：JavaVM 进程级唯一（虚拟机实例）；JNIEnv 线程级（当前线程环境，含函数表）。native 新线程需 AttachCurrentThread 获取 Env。

**Q2：RegisterNatives 和命名约定的区别？**
A：命名约定符号长、靠解析；RegisterNatives 在 JNI_OnLoad 显式注册，更快更灵活。推荐 RegisterNatives。

**Q3：JNI 局部引用和全局引用的区别？**
A：局部引用随调用自动释放；全局引用需显式释放（NewGlobalRef/DeleteGlobalRef），可跨调用保存；弱全局引用不阻止 GC。

**Q4：JNI 为什么慢？怎么优化？**
A：边界切换、引用解析、字段反射访问、数据拷贝。优化：批量调用、缓存 ID、直接数组访问、Direct Buffer 零拷贝、减少字符串转换。

**Q5：native 线程怎么调用 Java 方法？**
A：AttachCurrentThread 获取 JNIEnv → 找到类/方法 → 调用 → DetachCurrentThread。注意线程附加会注册到 JVM。

## 8. 小结

- JNI 是 Java ↔ Native 的桥梁，注册方式两种。
- JavaVM 进程级、JNIEnv 线程级，函数表机制。
- 引用管理：局部/全局/弱全局，防泄漏。
- JNI 引用是 GC Roots，注意持有周期。
- 性能：减少往返、缓存 ID、零拷贝。

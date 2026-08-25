---
icon: art
title: ART / DEX / 类加载
shortTitle: 概览
dir:
  text: ART / DEX / 类加载
  order: 5
---

# 🧠 ART / DEX / 类加载

Android 运行时与字节码机制。

## 文章列表

- [ART 运行时与 JIT/AOT](art-runtime.md)
- [ART 编译优化深入](art-compilation.md)
- [ART 运行时与 GC](art-gc.md)
- [DEX 文件格式与优化](dex-format.md)
- [类加载机制详解](classloader.md)

## 核心要点

1. **ART 取代 Dalvik**：预编译（AOT）+ 即时编译（JIT）混合
2. **编译策略演进**：全量 AOT → JIT + Profile 引导编译（dex2oat）
3. **DEX**：Android 字节码文件，`classes.dex`（多 dex 支持）
4. **类加载器**：`BootClassLoader` / `PathClassLoader` / `DexClassLoader`
5. **双亲委派**：类加载的委托机制（热修复依赖）
6. **方法数限制**：64K 方法数（multidex 解决）

---
icon: art
title: ART / DEX / 类加载
---

# 🧠 ART / DEX / 类加载

Android 运行时与字节码机制。

## 文章列表

- [ART 运行时与 JIT/AOT](art-runtime.md)
- [DEX 文件格式与优化](dex-format.md)
- [类加载机制详解](classloader.md)

## 核心要点

1. **ART 取代 Dalvik**：预编译（AOT）+ 即时编译（JIT）混合
2. **DEX**：Android 字节码文件，`classes.dex`（多 dex 支持）
3. **类加载器**：`BootClassLoader` / `PathClassLoader` / `DexClassLoader`
4. **双亲委派**：类加载的委托机制（热修复依赖）
5. **方法数限制**：64K 方法数（multidex 解决）

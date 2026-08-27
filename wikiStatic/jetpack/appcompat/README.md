---
icon: appcompat
title: AppCompat 兼容库
shortTitle: 概览
dir:
  text: AppCompat 兼容库
  order: 7
---

# AppCompat 兼容库

向后兼容的核心：AppCompatActivity、Theme.AppCompat、控件自动 Tint、DayNight。

## 文章列表

- [AppCompat 兼容原理](appcompat-principle.md) — AppCompatActivity / AppCompatDelegate / 控件兼容机制

## 核心概念

1. **AppCompatActivity**：向下兼容 ActionBar、主题、控件特性的基类
2. **AppCompatDelegate**：委托模式，兼容 DayNight / 新 API 行为
3. **控件自动 Tint**：AppCompatImageView 等自动着色
4. **Compat 工具类**：ContextCompat / ViewCompat 等统一封装

## 学习资源

- [Android Context 机制](/android/context/)
- [Jetpack Core 库](/jetpack/core/)

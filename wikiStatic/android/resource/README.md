---
icon: palette
title: 资源系统
shortTitle: 概览
dir:
  text: 资源系统
  order: 8
---

# 🎨 资源系统

Android 资源系统是"代码与资源分离"的基石：图片、字符串、颜色、布局、尺寸统一交给 AAPT 编译为 R 文件，运行时由 Resources 按设备配置（语言、屏幕、密度）动态选择最合适的资源。掌握它才能写出可适配、可国际化的应用。

## 文章列表

- [资源系统详解：R 文件、类型与加载](./resource-basics.md)
- [资源限定符与多语言适配](./resource-qualifiers.md)

## 核心要点

1. **R 文件**：编译期自动生成，每个资源一个 int ID，`R.类型.名称` 引用
2. **资源类型**：values（string/color/dimen/style）、drawable、layout、mipmap、anim、raw、xml 等
3. **资源限定符**：`values-zh`、`values-land`、`drawable-xxhdpi` 等，系统按配置最佳匹配
4. **多语言适配**：默认资源 + 各语言限定目录，缺失时回退到默认
5. **加载机制**：`getResources().getString()` → Resources → AssetManager 按 ID 查表，返回最匹配资源

## 关联阅读

- [主题与样式](/android/resource/resource-basics.md)：Style 定义与主题机制
- [启动流程优化](/android/app/app-launch-process.md)：资源加载对启动的影响
- [View 绘制流程](/ui/view/view-draw-process.md)：布局资源如何被加载为 View

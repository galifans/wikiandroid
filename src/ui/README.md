---
icon: palette
title: UI 与渲染
index: false
---

# 🎨 UI 与渲染

View 体系、渲染原理与 Jetpack Compose 现代 UI 开发。

## View 体系

| 模块 | 说明 | 入口 |
|------|------|------|
| View 绘制流程 | measure / layout / draw | [View](/ui/view/) |
| 事件分发机制 | dispatchTouchEvent 链条 | [事件分发](/ui/event/) |
| 自定义 View | 绘制与交互实战 | [自定义 View](/ui/custom-view/) |
| 动画机制 | 属性动画 / 帧动画 | [动画](/ui/animation/) |
| 布局优化 | ConstraintLayout / include / 屏幕适配 | [布局优化](/ui/layout/) |
| Window 机制 | Window / WindowManager | [Window](/ui/window/) |
| Bitmap | 图片解码与压缩 | [Bitmap](/ui/bitmap/) |

## 现代 UI

- [Jetpack Compose](/ui/compose/)：声明式 UI 开发

## 学习路径

```
View 体系基础 → 绘制流程 → 事件分发 → 自定义 View → 动画 → 性能优化
                                    ↓
                          Jetpack Compose（声明式）
```

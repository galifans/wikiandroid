---
icon: activity
title: 《Android开发艺术探索》第一章笔记
---

# 《Android开发艺术探索》第一章：Activity 要点

> 本章聚焦 Activity 生命周期细节、启动模式与 IntentFilter 匹配规则，均为面试高频考点。

## 一、生命周期细节

### onStart 与 onResume 的区别

- `onStart`：界面**可见**，但尚未处于前台，无法与用户交互
- `onResume`：界面获取焦点，**可与用户交互**

### 特殊场景下的回调差异

- 新 Activity 为**透明主题**时，旧 Activity 不会走 `onStop`（仍可见）
- Activity 切换时，旧 Activity 的 `onPause` **先于**新 Activity 的 `onCreate` 执行
- **异常回收**（如内存不足、配置变更）时 `onSaveInstanceState` 在 `onStop` **之前**回调；重建后 `onRestoreInstanceState` 在 `onStart` **之后**回调

## 二、启动模式（LaunchMode）

| 模式 | 行为 | 回调 |
|------|------|------|
| `standard` | 每次启动新建实例，压入启动者所在栈 | 常规生命周期 |
| `singleTop` | 栈顶复用；若目标 Activity 已在栈顶则不新建 | `onNewIntent`（`onCreate`/`onStart` 不再调用） |
| `singleTask` | 栈内复用；栈不存在则新建任务栈，存在则复用 | `onNewIntent` |
| `singleInstance` | 独占一个任务栈，全局唯一实例 | `onNewIntent` |

### 任务栈标识：TaskAffinity

- 用于指定 Activity 归属的任务栈名称，默认值为应用包名
- 配合 `singleTask` / `singleInstance` 使用可控制任务栈归属

## 三、IntentFilter 匹配规则

| 规则 | 要点 |
|------|------|
| `action` | Intent 中的 action 必须存在，且与过滤规则中至少一个相同（区分大小写） |
| `category` | 系统默认附加 `android.intent.category.DEFAULT`；Intent 可省略 category，但若存在则必须匹配其一 |
| `data` | 由 `mimeType` 与 `URI` 组成，规则同 action；未显式指定 URI 时默认支持 `content` 与 `file` scheme |

> 隐式启动 Activity 时，Intent 必须同时满足 action、category、data 全部规则才能匹配成功。

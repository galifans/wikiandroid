---
icon: rocket
title: 《APP研发录》第1章读书笔记
---

# 《APP研发录》第1章：项目架构规范

> 从项目结构、Activity 生命周期拆分、事件编程模型到实体化编程，建立团队统一的开发规范。

## 一、重新规划项目结构

### AndroidLab 类库（与业务无关的逻辑）

| 包 | 职责 |
|----|------|
| `activity` | 与业务无关的 Activity 基类 |
| `net` | 网络底层封装 |
| `cache` | 图片缓存与图片处理 |
| `ui` | 自定义控件 |
| `utils` | 通用工具方法 |

### 主项目包划分

| 包 | 职责 |
|----|------|
| `activity` | 按模块划分 Activity |
| `adapter` | 所有适配器 |
| `entity` | 所有实体 |
| `db` | SQLite 封装 |
| `engine` | 业务相关类 |
| `ui` | 自定义控件 |
| `utils` | 公用方法 |
| `interfaces` | 接口（`I` 开头命名） |
| `listener` | 监听器（`On` 开头命名） |

## 二、为 Activity 定义新生命周期

把 `onCreate` 拆分为三个子方法，规范统一：

1. `initVariables`：初始化变量（Intent 数据、Activity 内变量）
2. `initViews`：加载布局、初始化控件、挂事件
3. `loadData`：调用接口获取数据

## 三、统一事件编程模型

团队内部约定统一的事件编程方式，所有人按同样方式编写。

## 四、实体化编程

### 网络请求中使用实体

用 `fastJSON` / `Gson` 将 JSON 直接解析为实体，取代手工 JSONObject 取值：

```java
WeatherEntity entity = JSON.parseObject(content, WeatherEntity.class);
WeatherInfo info = entity.getWeatherInfo();
```

### 页面跳转中传递实体

- **不推荐全局变量**：App 切后台被回收后全局变量丢失，恢复前台会崩溃；若必须用，需序列化到本地以便恢复
- **推荐 Intent 传实体**：`intent.putExtra(key, entity)`，要求实体实现 `Serializable` 或 `Parcelable`

---
icon: box
title: Context 详解
---

# Context 详解

> Context 是 Android 中非常核心的抽象类，封装了对系统服务接口的调用。本章梳理 Context 的继承关系、ContextWrapper 的代理机制以及使用注意事项。

## 一、Context 是什么

Context 本身是一个抽象类，是对一系列系统服务接口的封装，包括：内部资源、包、类加载、I/O 操作、权限、主线程、IPC 和组件启动等操作的管理。

**继承关系：**

```
Context（抽象类）
 ├── ContextImpl（真正实现）
 ├── Activity（直接子类）
 ├── Service（直接子类）
 └── Application（直接子类）
```

ContextWrapper 是代理 Context 的实现，简单地将所有调用委托给另一个 Context（mBase）。

## 二、ContextWrapper 代理机制

Application、Activity、Service 通过 `attach()` 调用父类 ContextWrapper 的 `attachBaseContext()`，从而设置父类成员变量 mBase 为 ContextImpl 对象：

```java
// ContextWrapper 的核心工作都交给 mBase(ContextImpl) 完成
protected void attachBaseContext(Context newBase) {
    if (mBase != null) {
        throw new IllegalStateException("Base context already set");
    }
    mBase = newBase;
}
```

这样设计的好处是：**可以子类化 Context 修改行为而无需更改原始 Context**（这也是 ContextThemeWrapper 等实现的基础）。

## 三、Context 的几种类型对比

| 类型 | 作用域 | 获取方式 | 使用场景 |
| --- | --- | --- | --- |
| Application | 应用级 | `getApplicationContext()` | 全局单例、长生命周期对象 |
| Activity | 界面级 | `this` | 创建 UI 组件、Dialog 等需要 token 的场景 |
| Service | 服务级 | `this` | Service 内部操作 |

## 四、使用注意事项

1. **Dialog 必须使用 Activity Context：** 普通 Dialog 使用 Application Context 会报错，因为应用 token 只有 Activity 拥有。
2. **避免内存泄漏：** 长生命周期对象（如单例）持有 Activity Context 会导致 Activity 无法回收，应使用 `getApplicationContext()`。
3. **Application Context 不能启动标准 Activity：** 需要添加 `FLAG_ACTIVITY_NEW_TASK` 标志。
4. **`getBaseContext()` 返回 mBase（ContextImpl）**，一般业务中不应直接使用。

## 五、获取进程名的常用方法

```java
public String getProcessName(int pid) {
    ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
    List<ActivityManager.RunningAppProcessInfo> processInfoList = am.getRunningAppProcesses();
    if (processInfoList == null) {
        return null;
    }
    for (ActivityManager.RunningAppProcessInfo processInfo : processInfoList) {
        if (processInfo.pid == pid) {
            return processInfo.processName;
        }
    }
    return null;
}
```

> 多进程应用可在 Application.onCreate() 中判断进程名，避免多次初始化。

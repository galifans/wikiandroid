---
icon: window-restore
title: Window 与 WindowManager
---

# Window 与 WindowManager

> Window 是 Android 中视图的直接管理者，所有视图都通过 Window 呈现。本章梳理 Window 的分类、内部机制以及 Activity / Dialog / Toast 的 Window 创建过程。

## 一、Window 概念与分类

Window 是一个抽象类，具体实现是 PhoneWindow。WindowManager 是外界访问 Window 的入口，Window 的具体实现位于 WindowManagerService 中，两者的交互是一个 IPC 过程。

| Window 类型 | 说明 | 层级 |
| --- | --- | --- |
| Application Window | 对应着一个 Activity | 1~99 |
| Sub Window | 不能单独存在，只能附属在父 Window 中，如 Dialog 等 | 1000~1999 |
| System Window | 需要权限声明，如 Toast 和系统状态栏等 | 2000~2999 |

## 二、Window 的内部机制

Window 是一个抽象的概念，每一个 Window 对应着一个 View 和一个 ViewRootImpl。Window 实际是以 View 的形式存在。对 Window 的访问必须通过 WindowManager，其实现类是 WindowManagerImpl：

```java
// WindowManagerImpl.java
@Override
public void addView(View view, ViewGroup.LayoutParams params) {
    applyDefaultToken(params);
    mGlobal.addView(view, params, mContext.getDisplay(), mParentWindow);
}
```

WindowManagerImpl 没有直接实现 Window 的三大操作，而是全部交给 **WindowManagerGlobal** 处理：

- **addView：** 新建一个 ViewRootImpl，通过 `root.setView(view, wparams, panelParentView)` 完成 Window 的添加过程。
- **removeView：** 找到对应的 ViewRootImpl，调用 `root.die(immediate)` 移除。
- **updateViewLayout：** 更新布局参数并调用 `root.setLayoutParams(wparams, false)`。

在 ViewRootImpl 中最终会通过 WindowSession 完成 Window 的添加、更新、删除工作。`mWindowSession` 的类型是 IWindowSession，是一个 Binder 对象，真正的实现类是 Session，整个流程是一个 IPC 过程。

## 三、Activity 的 Window 创建过程

在 Activity 的创建过程中，最终由 ActivityThread 的 `performLaunchActivity()` 完成整个启动过程，内部通过类加载器创建 Activity 实例并调用 `attach()` 关联上下文环境变量：

```java
// Activity.java
final void attach(...) {
    ...
    mWindow = new PhoneWindow(this, window, activityConfigCallback);
    mWindow.setCallback(this);
    ...
}
```

1. 在 `attach()` 中创建 PhoneWindow 对象并设置回调接口。
2. 在 `setContentView()` 中将视图附属在 Window 上：如果没有 DecorView 就先 `installDecor()`，然后 `mLayoutInflater.inflate(layoutResID, mContentParent)`，最后回调 `onContentChanged()`。
3. 此时 DecorView 还没有被 WindowManager 正式添加。在 `handleResumeActivity()` 中调用 Activity 的 `onResume()`，接着调用 `makeVisible()` 完成 DecorView 的添加和显示：

```java
// Activity.java
void makeVisible() {
    if (!mWindowAdded) {
        ViewManager wm = getWindowManager();
        wm.addView(mDecor, getWindow().getAttributes());
        mWindowAdded = true;
    }
    mDecor.setVisibility(View.VISIBLE);
}
```

## 四、Dialog 的 Window 创建过程

Dialog 的 Window 创建过程和 Activity 类似，创建后的对象实际就是 PhoneWindow：

```java
// Dialog.java
Dialog(Context context, int themeResId, boolean createContextThemeWrapper) {
    ...
    mWindowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
    final Window w = new PhoneWindow(mContext);
    mWindow = w;
    w.setCallback(this);
    w.setWindowManager(mWindowManager, null, null);
    w.setGravity(Gravity.CENTER);
    ...
}
```

Dialog 关闭时通过 WindowManager 移除 DecorView：`mWindowManager.removeViewImmediate(mDecor)`。

> **注意：** 普通 Dialog 必须采用 Activity 的 Context，采用 Application 的 Context 会报错，这是因为应用 token 所致（应用 token 一般只有 Activity 拥有）。系统 Window 比较特殊，不需要 token。

## 五、Toast 的 Window 创建过程

Toast 属于系统 Window，由于具有定时取消功能，系统采用了 Handler。Toast 内部有两类 IPC 过程：

1. Toast 访问 NotificationManagerService（`service.enqueueToast(pkg, tn, mDuration)`）。
2. NotificationManagerService 回调 Toast 里的 TN 接口（`record.callback.show()`）。

```java
// Toast.java
public void show() {
    ...
    INotificationManager service = getService();
    TN tn = mTN;
    tn.mNextView = mNextView;
    try {
        service.enqueueToast(pkg, tn, mDuration);
    } catch (RemoteException e) {
        // Empty
    }
}
```

Toast 的视图有系统默认样式和 `setView()` 指定的自定义 View 两种，都对应 Toast 的内部成员 `mNextView`。Toast 显示时长由 `scheduleTimeoutLocked()` 通过 Handler 延时消息控制。

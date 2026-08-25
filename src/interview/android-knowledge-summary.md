---
icon: map
title: Android 知识点汇总
description: 覆盖 Activity、Fragment、Service、View、IPC、消息机制、Bitmap、屏幕适配等 19 大主题的系统回顾清单，每节附高频考点与详细文章链接
---

# 🗺️ Android 知识点汇总

> 面试高频指数：⭐⭐⭐⭐⭐
> 本文是一份**系统化的知识点回顾清单**：涵盖四大组件、View 体系、进程与 IPC、消息机制、线程异步等 19 大主题。
> 每节列出核心考点与高频追问，并链接到站内详细文章，适合面试前快速扫盲与查漏补缺。

## 一、Activity

| 知识点 | 核心内容 | 详解 |
|--------|----------|------|
| 生命周期 | `onCreate → onStart → onResume → onPause → onStop → onDestroy`，配合 `onRestart` | [生命周期](/android/activity/activity-lifecycle.md) |
| 启动顺序 | A 启动 B：A `onPause` → B `onCreate/onStart/onResume` → A `onStop`；透明主题或 Dialog 不触发 A 的 `onStop` | 同上 |
| 状态保存 | `onSaveInstanceState` 保存轻量 UI 状态，`onRestoreInstanceState` 恢复 | 同上 |
| 启动模式 | `standard` / `singleTop` / `singleTask` / `singleInstance`，可通过 Intent Flags 动态指定 | [任务栈与返回栈](/android/activity/task-stack.md) |
| 启动流程 | `performLaunchActivity`：创建 LoadedApk → 反射创建 Activity → 创建 Application → 创建 ContextImpl → `attach` → 回调 `onCreate/onStart` | [启动流程源码](/android/activity/activity-launch-process.md) / [AMS 深度解析](/system/ams-wms/ams-activity-launch.md) |

**高频追问**：`onPause` 与 `onStop` 的区别？`singleTask` 的 `onNewIntent` 何时触发？透明 Activity 为什么不回调 `onStop`？

## 二、Fragment

- **特点**：解决 Activity 间切换不流畅的问题，支持轻量切换；可从 `startActivityForResult` 收到返回结果（View 不行）。
- **事务提交时机**：只能在 Activity 保存状态前 `commit()`，之后提交会抛异常；不关心丢失时用 `commitAllowingStateLoss()`。
- **与 Activity 通信**：在 Fragment 内定义回调接口，由宿主 Activity 实现（`onAttach` 时强转绑定）。

| 考点 | 详解 |
|------|------|
| 生命周期与通信 | [Fragment 生命周期与通信](/android/fragment/fragment-basics.md) |
| 常见坑（状态丢失、重叠等） | [Fragment 踩坑指南](/android/fragment/fragment-pitfalls.md) |

## 三、Service

- **两种状态**：启动状态（后台计算）与绑定状态（组件交互），可同时存在。
- **启动流程**：`startService` → `handleCreateService`：实例化 Service → 创建 ContextImpl → `attach` → `onCreate`。
- **绑定流程**：`bindService` → `handleBindService` → `onBind` 返回 Binder → `publishService`。

### 三种返回模式（onStartCommand 返回值）

| 模式 | 行为 | 适用场景 |
|------|------|----------|
| `START_NOT_STICKY` | 被杀后不重建（除非有挂起 Intent） | 可随时重启的作业 |
| `START_STICKY` | 被杀后重建并回调 `onStartCommand`，Intent 为 null | 无限期运行的媒体播放 |
| `START_REDELIVER_INTENT` | 被杀后重建并重新传递最后 Intent | 必须立即恢复的下载任务 |

| 考点 | 详解 |
|------|------|
| 启动/绑定方式 | [Service 详解](/android/service/service-basics.md) |
| 前台服务（8.0 限制、12+ 权限） | [前台服务](/android/service/foreground-service.md) |
| AIDL 跨进程通信 | [Service AIDL](/android/service/aidl.md) |

## 四、BroadcastReceiver

- **注册方式**：静态（Manifest）与动态（代码）。
- **8.0+ 限制**：target 26 后无法在 Manifest 声明大部分隐式广播，仅保留必要广播（`ACTION_BOOT_COMPLETED`、`ACTION_TIME_SET`、`ACTION_LOCALE_CHANGED` 等）；本地广播用 `LocalBroadcastManager`。
- **注册过程**：注册/发送均与 AMS 交互（Binder 过程）。

| 考点 | 详解 |
|------|------|
| 广播基础 | [BroadcastReceiver 基础](/android/broadcast/broadcast-basics.md) |
| 静态/动态注册对比 | [注册方式对比](/android/broadcast/register-comparison.md) |

## 五、ContentProvider

- **定位**：跨进程数据共享的标准界面，内部封装数据并提供安全性机制。
- **特点**：CRUD 方法运行在 **Binder 线程池**中，需自行处理线程同步；`onCreate` 先于 `Application.onCreate` 执行。
- **与 SQL 的区别**：屏蔽存储细节、可跨 App 共享、还能增删本地文件/XML 等非数据库数据。

| 考点 | 详解 |
|------|------|
| URI / CRUD / ContentObserver | [ContentProvider 详解](/android/content-provider/content-provider-basics.md) |

## 六、数据存储

| 方式 | 说明 |
|------|------|
| SharedPreferences | 键值对存储私有原始数据 |
| 内部存储 | 设备内存中存储私有数据 |
| 外部存储 | 共享外部存储中存储公共数据 |
| SQLite | 私有数据库中存储结构化数据 |

> 详解：[存储方式对比](/android/storage/storage-comparison.md) | [SharedPreferences 深挖](/android/storage/sharedpreferences-deep.md) | [SP 与 DataStore 对比](/android/storage/sp-vs-datastore.md)

## 七、View 体系

### 7.1 绘制三大流程

`measure → layout → draw`，由 ViewRootImpl 调度；MeasureSpec 高 2 位为模式（`UNSPECIFIED / EXACTLY / AT_MOST`），低 30 位为尺寸。直接继承 View 需重写 `onMeasure` 处理 `wrap_content`。

| 考点 | 详解 |
|------|------|
| MeasureSpec 详解 | [MeasureSpec](/ui/view/measurespec.md) |
| 绘制流程（Draw 六步） | [View 绘制流程](/ui/view/view-draw-process.md) |
| View 与 ViewGroup | [View 体系](/ui/view/view-viewgroup.md) |

### 7.2 触摸事件

- **事件序列**：点击 `DOWN → UP`；滑动 `DOWN → MOVE… → UP`；`getX/getY` 相对 View 左上角，`getRawX/getRawY` 相对屏幕。
- **TouchSlop**：系统识别滑动的最小距离，用 `ViewConfiguration.get(context).getScaledTouchSlop()` 获取。
- **分发机制**：`dispatchTouchEvent → onInterceptTouchEvent → onTouchEvent`，责任链式传递；ViewGroup 默认不拦截；`onTouch` 优先于 `onTouchEvent`。
- **辅助类**：`VelocityTracker` 追踪滑动速度；`GestureDetector` 检测单击/双击/长按/滑动；`Scroller` + `computeScroll` 实现弹性滑动。

| 考点 | 详解 |
|------|------|
| 事件分发机制 | [事件分发](/ui/event/event-dispatch.md) |
| 滑动冲突解决 | [冲突解决方案](/ui/event/conflict-solution.md) |
| 手势/速度/滑动工具类 | [触摸辅助工具](/ui/custom-view/touch-helper.md) |

### 7.3 View 的滑动与自定义

- **滑动方式**：`scrollTo/scrollBy`（内容滑动）、动画、改变布局参数。
- **获取 View 宽高**（onCreate 中拿不到）：`onWindowFocusChanged`、`view.post`、`ViewTreeObserver.OnGlobalLayoutListener`。
- **自定义 View 四种方式**：继承 View 重写 `onDraw`、继承 ViewGroup 派生布局、继承特定 View、继承特定 ViewGroup。

| 考点 | 详解 |
|------|------|
| 自定义 View 入门 | [自定义 View 指南](/ui/custom-view/custom-view-guide.md) |
| 自定义 ViewGroup | [自定义 ViewGroup](/ui/custom-view/custom-viewgroup.md) |

### 7.4 RecyclerView 优化

数据处理与视图加载分离、DiffUtil 局部刷新、`setHasFixedSize(true)`、Prefetch 预取、共用 Listener 与 `RecycledViewPool`、`onViewRecycled` 回收资源。

> 详解：[RecyclerView 优化与 ListView 对比](/ui/view/recyclerview-guide.md)

## 八、进程

- **五级优先级**：前台进程 > 可见进程 > 服务进程 > 后台进程 > 空进程。
- **多进程问题**：静态成员/单例失效、线程同步失效、SP 可靠性下降、Application 多次创建（按进程名区分）。
- **进程存活**：系统按 ADJ（OOM_ADJ）值决定被杀顺序，值越小越优先存活（前台 0 → 缓存 9~16）。
- **保活方案**：1 像素 Activity、前台服务、多进程互相唤醒、JobScheduler、粘性服务等。

| 考点 | 详解 |
|------|------|
| 进程生命周期 / OOM_ADJ / 保活 | [进程与保活](/android/process/process-lifecycle.md) |

## 九、Parcelable 与 Serializable

- **Parcelable**：内存中读写、无反射、数据存 Native 内存，效率高；需实现 `writeToParcel` 与 `CREATOR`。
- **Serializable**：I/O 读写硬盘、反射开销大，效率低。
- **关键方法**：`createFromParcel` / `newArray` / `writeToParcel` / `describeContents`。

> 详解：[Parcelable 序列化](/system/binder/parcelable.md)

## 十、IPC 与 Binder

- **六种 IPC 方式**：Bundle、文件共享、AIDL、Messenger、ContentProvider、Socket。
- **Binder 优势**：C/S 架构符合系统设计；只拷贝一次数据（管道/消息队列/Socket 需两次）；自动携带 UID/GID 便于安全检查。
- **AIDL 定向 tag**：`in`（客户端→服务端）、`out`（服务端→客户端）、`inout`（双向）。
- **Messenger**：轻量级 IPC，底层封装 AIDL，串行处理 Message。

| 考点 | 详解 |
|------|------|
| IPC 方式对比 | [IPC 方式对比](/system/binder/ipc-comparison.md) |
| Binder 机制原理 | [Binder 机制](/system/binder/binder-mechanism.md) |
| AIDL 深度解析 | [AIDL 深度解析](/system/binder/aidl-deep.md) |

## 十一、Window / WindowManager

- **Window 分类**：Application Window（1~99）、Sub Window（1000~1999，如 Dialog）、System Window（2000~2999，如 Toast）。
- **内部机制**：Window 以 View 形式存在，每个 Window 对应一个 View 和 ViewRootImpl；`WindowManagerImpl` 委托给 `WindowManagerGlobal`，最终通过 `IWindowSession`（Binder）与 WMS 交互。
- **创建过程**：Activity 的 Window 在 `attach` 中创建 PhoneWindow，`makeVisible` 时 addView；Dialog 使用 Activity 的 token；Toast 属于系统 Window，内部有定时取消的 Handler 与两段 IPC。

| 考点 | 详解 |
|------|------|
| Window 机制与创建过程 | [Window 机制](/ui/window/window-mechanism.md) |
| WMS 原理 | [WindowManagerService](/system/ams-wms/wms-principle.md) |

## 十二、Bitmap

- **Config 与内存**：`ALPHA_8`（1B）、`RGB_565`（2B）、`ARGB_4444`（2B，已弃用）、`ARGB_8888`（4B，默认）；防 OOM 常选 `RGB_565`。
- **压缩**：JPEG 有损 / PNG 无损；质量压缩 + 采样压缩（`inSampleSize`）。
- **BitmapFactory.Options**：`inJustDecodeBounds` 先读宽高不分配内存、`inSampleSize` 缩放、`inPreferredConfig` 色彩模式等。
- **内存回收**：Bitmap 分为 Java 与 C（Native）两部分，`recycle()` 释放 C 部分内存（通过 JNI）。

| 考点 | 详解 |
|------|------|
| 配置 / 压缩 / Factory / 回收 | [Bitmap 详解与图片压缩](/ui/bitmap/bitmap-guide.md) |

## 十三、屏幕适配

- **单位换算**：`dpi = px / inch`，`density = dpi / 160`，`dp = px / density`；sp 随字体缩放。
- **头条适配方案**：修改 `DisplayMetrics` 的 `density / scaledDensity / densityDpi`，使设计稿宽度统一（如 360dp），并监听字体切换。
- **刘海屏适配**：Android P 用 `DisplayCutout.getSafeInsetTop()` 等获取安全区域；`layoutInDisplayCutoutMode` 三种模式（DEFAULT / NEVER / SHORT_EDGES）；P 之前需按厂商文档适配。

| 考点 | 详解 |
|------|------|
| 单位 / 头条方案 / 刘海屏 | [屏幕适配方案](/ui/layout/screen-adaptation.md) |

## 十四、Context

- **本质**：抽象类，封装系统服务接口（资源、包、类加载、I/O、权限、IPC、组件启动等）。
- **继承体系**：`ContextImpl` 是具体实现；`ContextWrapper` 是代理，将调用委托给 `mBase`（ContextImpl）；`Activity / Service / Application` 通过 `attach` → `attachBaseContext` 绑定。

> 详解：[Context 体系](/android/context/context-overview.md)

## 十五、SharedPreferences

- **存储位置**：`/data/data/<包名>/shared_prefs/*.xml`，适合轻量配置，不适合大数据。
- **三种获取方式**：`getPreferences`（Activity 类名）、`getDefaultSharedPreferences`（包名 + `_preferences`）、`getSharedPreferences(name, mode)`。
- **架构**：`SharedPreferencesImpl` 持有 mMap，`EditorImpl` 的 `put` 先写内存，`apply/commit` 时 `commitToMemory` 同步 mMap 再 `enqueueDiskWrite` 落盘（先写 `.bak` 备份）。
- **apply vs commit**：apply 异步落盘、无返回值、效率高；commit 同步落盘、有返回值。
- **注意**：不要存大 key/value、不要高频 apply、禁用 `MODE_MULTI_PROCESS`、读写分离拆分文件。

| 考点 | 详解 |
|------|------|
| 获取方式 / 架构 / apply vs commit | [SharedPreferences 深挖](/android/storage/sharedpreferences-deep.md) |

## 十六、消息机制（Handler）

- **为什么 UI 只能在主线程操作**：UI 控件非线程安全，加锁会复杂化逻辑并降低效率；`ViewRootImpl.checkThread` 会抛异常。
- **四件套**：`Message`（消息）、`MessageQueue`（单链表队列）、`Looper`（消息泵，一线程一个）、`Handler`（发送与处理）。
- **ThreadLocal**：线程内部数据存储，Looper 通过它实现「一线程一 Looper」。
- **MessageQueue**：`enqueueMessage` 按时间插入单链表，`next` 无限循环阻塞取消息；支持同步屏障与 IdleHandler。
- **Looper**：`prepare()` 创建、`loop()` 死循环分发（`msg.target.dispatchMessage`）、`quit` 直接退出 / `quitSafely` 处理完再退出。

| 考点 | 详解 |
|------|------|
| Handler 源码全解析 | [Handler 机制与源码](/network/handler/handler-source.md) |
| HandlerThread | [HandlerThread](/network/handler/handlerthread.md) |

## 十七、线程异步

- **UI 线程规则**：不要阻塞 UI 线程；不要在 UI 线程之外访问 UI 工具包。跨线程更新 UI 可用 `runOnUiThread` / `view.post` / `view.postDelayed`。
- **AsyncTask**：封装 Thread + Handler；`onPreExecute → doInBackground → onProgressUpdate → onPostExecute`；串行线程池排队（SerialExecutor）+ 并行执行（THREAD_POOL_EXECUTOR）+ InternalHandler 切主线程；一个实例只能执行一次。
- **HandlerThread**：内部创建 Looper 的线程，配合 Handler 执行串行任务。
- **IntentService**：封装 HandlerThread + Handler，任务完成后 `stopSelf(startId)` 自动停止，优先级高于普通线程。
- **线程池**：`ThreadPoolExecutor` 核心参数（核心线程数 / 最大线程数 / 超时 / 队列 / 工厂 / 拒绝策略）；四种常用线程池：Fixed / Cached / Scheduled / Single。

| 考点 | 详解 |
|------|------|
| AsyncTask 原理 | [AsyncTask 与 IntentService](/network/thread/asynctask-intentservice.md) |
| 线程池详解 | [线程池](/network/thread/thread-pool.md) |
| 并发工具 | [并发工具](/network/thread/concurrency-tools.md) |

## 十八、WebView

- **WebSettings**：JS 开关、DOM Storage、缓存策略（`LOAD_DEFAULT` / `LOAD_CACHE_ELSE_NETWORK`）、混合内容（MIXED_CONTENT_ALWAYS_ALLOW）等。
- **WebViewClient**：`shouldOverrideUrlLoading`（拦截页面）、`shouldInterceptRequest`（拦截资源）、`onPageStarted/Finished`、`onReceivedError/SslError` 等。
- **WebChromeClient**：`onProgressChanged`、`onReceivedTitle`、JS 弹窗（Alert/Confirm/Prompt）、文件选择器、权限申请等。
- **加载优化**：本地资源替代（`shouldInterceptRequest` 命中本地 assets）、预加载预缓存、JS 后置执行、复用域名连接、WebView 池化。
- **内存泄漏**：WebView 持 Activity 引用易泄漏；不要在 XML 直接声明、销毁时 `stopLoading + removeAllViews + destroy`。

| 考点 | 详解 |
|------|------|
| 配置 / 回调 / 优化 / 泄漏 | [WebView 使用与优化](/ui/view/webview-guide.md) |

## 小结

| 模块 | 一句话记忆 |
|------|-----------|
| Activity / Fragment | 生命周期 + 启动模式 + 状态保存 |
| Service / Broadcast / ContentProvider | 启动流程 + 8.0 限制 + Binder 线程池 |
| View | measure/layout/draw + 事件分发 + 自定义 |
| 进程 / IPC | 五级优先级 + OOM_ADJ + Binder 一次拷贝 |
| 消息机制 | Handler 四件套 + ThreadLocal |
| 线程异步 | AsyncTask / HandlerThread / IntentService / 线程池 |
| Bitmap / 适配 | Config 内存 + 采样压缩 + dp 体系 |

> 📖 配套阅读：[面试基础篇](/interview/basics.md) | [面试进阶篇](/interview/advanced.md) | [面试源码篇](/interview/source-code.md)

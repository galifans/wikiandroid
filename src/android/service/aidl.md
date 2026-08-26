---
icon: service
title: AIDL 跨进程通信
description: AIDL 语法、in/out/inout 方向、oneway、Binder 工作原理、以及跨进程回调的实现完整指南
---

# AIDL 跨进程通信

> 面试高频指数：极高（Binder 相关必考）
> 本文从 AIDL 使用到其背后的 Binder 机制，逐层拆解。

## 1. 什么是 AIDL

**AIDL（Android Interface Definition Language）** 是 Android 提供的跨进程接口定义语言，
用于生成 Binder IPC 的客户端/服务端代码。典型使用场景：

- 音乐播放器与播放服务（不同进程）
- 输入法与 IME 服务
- 系统服务（AMS、WMS 本身就是 AIDL 接口）
- 应用间数据访问

## 2. AIDL 语法基础

### 2.1 数据类型支持

| 类型 | 说明 |
| --- | --- |
| 基本类型 | `int`、`long`、`boolean`、`float`、`double`、`char`、`byte` |
| String / CharSequence | 直接支持 |
| List / Map | 元素须为可支持类型 |
| Parcelable | 自定义对象，需实现 Parcelable |
| 其他 AIDL 接口 | 可传递 IBinder |

### 2.2 方向限定符

| 限定符 | 含义 |
| --- | --- |
| `in` | 客户端 → 服务端（默认），服务端修改不影响客户端 |
| `out` | 服务端 → 客户端，入参值被忽略 |
| `inout` | 双向传递，代价最高（序列化两次） |

> **最佳实践**：能用 `in` 就别用 `inout`，方向限定符直接影响序列化性能。

## 3. 完整实战：跨进程计算器

### 3.1 定义 Parcelable 数据

```aidl
// Book.aidl
package com.example.ipc;
parcelable Book;
```

::: code-tabs

@tab:active Java

```java
// Book.java（实现 Parcelable）
public class Book implements Parcelable {
    private final int id;
    private final String name;

    public Book(int id, String name) {
        this.id = id;
        this.name = name;
    }

    protected Book(Parcel parcel) {
        id = parcel.readInt();
        name = parcel.readString() != null ? parcel.readString() : "";
    }

    @Override
    public void writeToParcel(Parcel parcel, int flags) {
        parcel.writeInt(id);
        parcel.writeString(name);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final Creator<Book> CREATOR = new Creator<Book>() {
        @Override
        public Book createFromParcel(Parcel parcel) {
            return new Book(parcel);
        }

        @Override
        public Book[] newArray(int size) {
            return new Book[size];
        }
    };
}
```

@tab Kotlin

```kotlin
// Book.kt（实现 Parcelable）
data class Book(
    val id: Int,
    val name: String
) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readInt(),
        parcel.readString() ?: ""
    )

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeInt(id)
        parcel.writeString(name)
    }

    override fun describeContents(): Int = 0

    companion object CREATOR : Parcelable.Creator<Book> {
        override fun createFromParcel(parcel: Parcel): Book = Book(parcel)
        override fun newArray(size: Int): Array<Book?> = arrayOfNulls(size)
    }
}
```

:::

### 3.2 定义 AIDL 接口

```aidl
// IBookManager.aidl
package com.example.ipc;
import com.example.ipc.Book;

interface IBookManager {
    List<Book> getBookList();
    // in 方向：客户端数据传入服务端
    void addBook(in Book book);

    // 注册监听器（接口作为参数）
    void registerListener(IOnBookArrivedListener listener);
    void unregisterListener(IOnBookArrivedListener listener);
}
```

```aidl
// IOnBookArrivedListener.aidl（服务端 → 客户端回调）
package com.example.ipc;
import com.example.ipc.Book;

interface IOnBookArrivedListener {
    void onBookArrived(in Book newBook);
}
```

### 3.3 服务端实现

::: code-tabs

@tab:active Java

```java
public class BookManagerService extends Service {

    private final List<Book> bookList = new ArrayList<>();
    // RemoteCallbackList 是官方推荐的监听器管理容器（自动处理 Binder 死亡）
    private final RemoteCallbackList<IOnBookArrivedListener> listenerList =
            new RemoteCallbackList<>();

    private final IBookManager.Stub binder = new IBookManager.Stub() {
        @Override
        public List<Book> getBookList() {
            return bookList;
        }

        @Override
        public void addBook(Book book) {
            bookList.add(book);
            // 通知所有客户端
            int n = listenerList.beginBroadcast();
            for (int i = 0; i < n; i++) {
                IOnBookArrivedListener listener = listenerList.getBroadcastItem(i);
                listener.onBookArrived(book);
            }
            listenerList.finishBroadcast();
        }

        @Override
        public void registerListener(IOnBookArrivedListener listener) {
            listenerList.register(listener);
        }

        @Override
        public void unregisterListener(IOnBookArrivedListener listener) {
            listenerList.unregister(listener);
        }
    };

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }
}
```

@tab Kotlin

```kotlin
class BookManagerService : Service() {

    private val bookList = mutableListOf<Book>()
    // RemoteCallbackList 是官方推荐的监听器管理容器（自动处理 Binder 死亡）
    private val listenerList = RemoteCallbackList<IOnBookArrivedListener>()

    private val binder = object : IBookManager.Stub() {
        override fun getBookList(): MutableList<Book> = bookList

        override fun addBook(book: Book) {
            bookList.add(book)
            // 通知所有客户端
            val n = listenerList.beginBroadcast()
            for (i in 0 until n) {
                val listener = listenerList.getBroadcastItem(i)
                listener.onBookArrived(book)
            }
            listenerList.finishBroadcast()
        }

        override fun registerListener(listener: IOnBookArrivedListener) {
            listenerList.register(listener)
        }

        override fun unregisterListener(listener: IOnBookArrivedListener) {
            listenerList.unregister(listener)
        }
    }

    override fun onBind(intent: Intent?): IBinder = binder
}
```

:::

> **RemoteCallbackList 为什么好**：内部用 `IBinder` 作为 key 去重，客户端进程死亡时
> 自动调用 `onCallbackDied` 清理，避免"内存泄漏 + 重复注册"两大经典问题。

### 3.4 客户端调用

::: code-tabs

@tab:active Java

```java
public class MainActivity extends AppCompatActivity {

    private IBookManager bookManager;
    private final ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            bookManager = IBookManager.Stub.asInterface(service);
            // 注册监听（Binder 是 IBinder，可直接传入）
            if (bookManager != null) {
                bookManager.registerListener(listener);
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            bookManager = null;
        }
    };

    private final IOnBookArrivedListener.Stub listener = new IOnBookArrivedListener.Stub() {
        @Override
        public void onBookArrived(Book newBook) {
            // 注意：这是 Binder 线程，不是主线程！需要切换到主线程更新 UI
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    // 更新 UI
                }
            });
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = new Intent(this, BookManagerService.class);
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
    }

    @Override
    protected void onDestroy() {
        if (bookManager != null) {
            bookManager.unregisterListener(listener);
        }
        unbindService(serviceConnection);
        super.onDestroy();
    }
}
```

@tab Kotlin

```kotlin
class MainActivity : AppCompatActivity() {

    private var bookManager: IBookManager? = null
    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            bookManager = IBookManager.Stub.asInterface(service)
            // 注册监听（Binder 是 IBinder，可直接传入）
            bookManager?.registerListener(listener)
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            bookManager = null
        }
    }

    private val listener = object : IOnBookArrivedListener.Stub() {
        override fun onBookArrived(newBook: Book) {
            // 注意：这是 Binder 线程，不是主线程！需要切换到主线程更新 UI
            runOnUiThread {
                // 更新 UI
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val intent = Intent(this, BookManagerService::class.java)
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
    }

    override fun onDestroy() {
        bookManager?.unregisterListener(listener)
        unbindService(serviceConnection)
        super.onDestroy()
    }
}
```

:::

### 3.5 跨应用调用

```xml
<!-- 服务端 Manifest -->
<service
    android:name=".BookManagerService"
    android:exported="true"
    android:process=":remote">
    <intent-filter>
        <action android:name="com.example.ipc.BOOK_SERVICE" />
    </intent-filter>
</service>
```

::: code-tabs

@tab:active Java

```java
// 客户端：隐式 Intent 绑定
Intent intent = new Intent("com.example.ipc.BOOK_SERVICE");
intent.setPackage("com.example.ipc");  // 指定包名更安全
bindService(intent, connection, Context.BIND_AUTO_CREATE);
```

@tab Kotlin

```kotlin
// 客户端：隐式 Intent 绑定
val intent = Intent("com.example.ipc.BOOK_SERVICE").apply {
    `package` = "com.example.ipc"  // 指定包名更安全
}
bindService(intent, connection, Context.BIND_AUTO_CREATE)
```

:::

### 3.6 Kotlin 现代写法：@Parcelize 替代手写 Parcelable

::: code-tabs

@tab:active Java

```java
// build.gradle.kts
// android { buildFeatures { aidl = true } }
// plugins { id("kotlin-parcelize") }

// Java 无 @Parcelize 注解，需手写 Parcelable
public class Book implements Parcelable {
    private final int id;
    private final String name;

    public Book(int id, String name) {
        this.id = id;
        this.name = name;
    }

    protected Book(Parcel parcel) {
        id = parcel.readInt();
        name = parcel.readString();
    }

    @Override
    public void writeToParcel(Parcel parcel, int flags) {
        parcel.writeInt(id);
        parcel.writeString(name);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final Creator<Book> CREATOR = new Creator<Book>() {
        @Override
        public Book createFromParcel(Parcel parcel) {
            return new Book(parcel);
        }

        @Override
        public Book[] newArray(int size) {
            return new Book[size];
        }
    };
}

// AIDL 文件不变：parcelable Book;
```

@tab Kotlin

```kotlin
// build.gradle.kts
// android { buildFeatures { aidl = true } }
// plugins { id("kotlin-parcelize") }

@Parcelize
data class Book(
    val id: Int,
    val name: String
) : Parcelable   // 自动生成 writeToParcel / CREATOR，无需手写

// AIDL 文件不变：parcelable Book;
```

:::

> 注意：`@Parcelize` 生成的 `CREATOR` 与 AIDL 生成代码兼容（AIDL 通过 `Book.CREATOR` 反序列化）。
> Kotlin 的 AIDL 文件默认放在 `src/main/aidl`，Parcelable 类在 `src/main/java`（或 `kotlin`），
> 二者包名必须一致。

### 3.7 线程安全：服务端方法并发访问

服务端 Stub 方法执行在 **Binder 线程池**，多个客户端可并发调用，必须保证线程安全：

::: code-tabs

@tab:active Java

```java
private final IBookManager.Stub binder = new IBookManager.Stub() {
    // List 非线程安全 → 加锁或使用并发容器
    private final CopyOnWriteArrayList<Book> bookList = new CopyOnWriteArrayList<>();

    @Override
    public void addBook(Book book) {
        bookList.add(book);
        int n = listenerList.beginBroadcast();
        for (int i = 0; i < n; i++) {
            listenerList.getBroadcastItem(i).onBookArrived(book);
        }
        listenerList.finishBroadcast();
    }
};
```

@tab Kotlin

```kotlin
private val binder = object : IBookManager.Stub() {
    // MutableList 非线程安全 → 加锁或使用并发容器
    private val bookList = CopyOnWriteArrayList<Book>()

    override fun addBook(book: Book) {
        bookList.add(book)
        val n = listenerList.beginBroadcast()
        for (i in 0 until n) {
            listenerList.getBroadcastItem(i).onBookArrived(book)
        }
        listenerList.finishBroadcast()
    }
}
```

:::

## 4. 深入：Binder 如何支撑 AIDL

### 4.1 一次调用发生了什么

```text
客户端进程                          内核                   服务端进程
┌─────────────┐   write 数据   ┌────────────┐   read    ┌──────────────┐
│ Proxy        │ ────────────► │ Binder 驱动 │ ─────────► │ Stub         │
│ transact()   │              │ 内存映射+拷贝 │           │ onTransact() │
└─────────────┘              └────────────┘           └──────────────┘
```

1. 客户端调用 `proxy.addBook(book)` → 数据序列化到 `Parcel`。
2. `BinderProxy.transact()` 通过 `binder_ioctl` 进入内核 Binder 驱动。
3. 内核完成**一次拷贝**（共享内存 + 进程切换），服务端读取。
4. 服务端 `Stub.onTransact()` 反序列化并分发到实现方法。

### 4.2 为什么 Binder 只拷贝一次

- 传统 IPC（管道/消息队列）需要**两次拷贝**（用户态→内核态→用户态）。
- Binder 基于 **mmap 内存映射**：客户端数据写入内核缓冲区，服务端通过映射直接读取，只需一次拷贝。
- 这是 Binder 相比 Socket/Pipe 的核心性能优势。

### 4.3 oneway 修饰符

```aidl
interface IBookManager {
    // oneway：异步调用，不等待服务端返回（调用方不阻塞）
    oneway void notifySomething();
}
```

- `oneway` 调用**不会阻塞**客户端，适合"通知类"调用。
- 普通调用是同步的，若服务端执行慢，客户端 Binder 线程会阻塞。

## 5. 常用替代方案对比

| 方案 | 特点 | 适用场景 |
| --- | --- | --- |
| AIDL | 类型安全、支持回调、官方推荐 | 跨进程复杂通信、系统服务 |
| Messenger | AIDL 封装（Handler 分发） | 简单消息传递，不支持并发方法 |
| ContentProvider | 数据共享 + 观察者 | 跨应用数据访问 |
| Socket | 任意两端通信 | 跨设备/远程 |
| Bound Service 同进程 | 直接对象调用 | 同进程解耦 |

## 6. 高频面试题

**Q1：AIDL 中 in/out/inout 的区别与性能影响？**
A：`in` 数据只从客户端流向服务端；`out` 只从服务端返回客户端（入参被清空）；`inout` 双向。
`inout` 需要两次序列化，性能最差。能用 `in` 就不用 `inout`。

**Q2：为什么 AIDL 回调不在主线程？**
A：Binder 驱动在服务端分配的是 **Binder 线程池**（binder_thread），回调执行在 Binder 线程，
不是主线程。更新 UI 需切回主线程（`runOnUiThread` / `Handler` / 协程）。

**Q3：客户端进程被杀，服务端如何感知？**
A：使用 `RemoteCallbackList` 注册监听器时，Binder 驱动会监测 Binder 对端死亡，
回调 `onCallbackDied` 自动移除；也可对 `binder.linkToDeath(DeathRecipient)` 手动监听。

**Q4：Binder 为什么比传统 IPC 快？**
A：一次拷贝（mmap 共享内存）替代传统两次拷贝；同时 Binder 传输时数据在内核与用户态间只搬运一次。
另外 Binder 协议头小、专为 IPC 优化。

**Q5：服务端方法执行在主线程吗？**
A：不是。服务端 Stub 方法默认执行在 **Binder 线程池** 的线程上，不占用主线程；
因此耗时操作在服务端无需额外开线程（但要注意线程安全，如对共享列表加锁）。

## 7. 小结

- AIDL = 接口定义 + Stub/Proxy 生成 + Binder 驱动传输。
- 方向限定符（in/out/inout）与 `oneway` 决定调用语义与性能。
- `RemoteCallbackList` 是管理跨进程监听器的官方方案。
- Binder 的核心优势：一次拷贝、类型安全、线程池分发。

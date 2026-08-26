---
icon: binder
title: AIDL 深入解析
description: AIDL 接口定义、in/out/inout 定向、oneway、Binder 代理与 Stub 原理、线程模型与实战
---

# AIDL 深入解析

> 面试高频指数：高
> AIDL 是 Binder 机制的应用层封装，理解 Stub/Proxy 结构才算真正掌握 IPC。

## 1. AIDL 是什么

```text
AIDL（Android Interface Definition Language）
Android 接口定义语言，用于跨进程通信的接口定义

本质：定义 IPC 接口的语法糖，编译器生成 Binder 通信代码
适用：多进程、跨应用通信（音乐播放、系统服务调用）
```

## 2. AIDL 文件语法

::: code-tabs

@tab:active Java

```java
// IBookManager.aidl
package com.example.aidl;

// 自定义类型需显式 import
import com.example.aidl.Book;

interface IBookManager {

    // 基本类型直接使用
    List<Book> getBookList();

    // 定向 tag：in / out / inout
    // in   ：客户端 → 服务端（默认，数据单向传入）
    // out  ：服务端 → 客户端（服务端修改后回传）
    // inout：双向
    void addBook(in Book book);
    void updateBook(inout Book book);

    // oneway：异步调用（不阻塞客户端，单向）
    oneway void notifyChanged();
}
```

@tab Kotlin

```kotlin
// IBookManager.aidl（AIDL 声明与语言无关，客户端/服务端共用同一文件）
package com.example.aidl;

// 自定义类型需显式 import
import com.example.aidl.Book;

interface IBookManager {

    // 基本类型直接使用
    List<Book> getBookList();

    // 定向 tag：in / out / inout
    // in   ：客户端 → 服务端（默认，数据单向传入）
    // out  ：服务端 → 客户端（服务端修改后回传）
    // inout：双向
    void addBook(in Book book);
    void updateBook(inout Book book);

    // oneway：异步调用（不阻塞客户端，单向）
    oneway void notifyChanged();
}
```

:::

::: code-tabs

@tab:active Java

```java
// 自定义 Parcelable 类型 Book.aidl
package com.example.aidl;
parcelable Book;

// Book.java 实现 Parcelable 接口
```

@tab Kotlin

```kotlin
// 自定义 Parcelable 类型 Book.aidl（AIDL 声明与语言无关，客户端/服务端共用同一文件）
package com.example.aidl;
parcelable Book;

// Book.java 实现 Parcelable 接口
```

:::

## 3. 服务端实现

::: code-tabs

@tab:active Java

```java
public class BookManagerService extends Service {

    private final List<Book> bookList = new ArrayList<>();

    // 内部类继承 Stub，实现接口方法
    private final IBinder binder = new IBookManager.Stub() {

        @Override
        public List<Book> getBookList() {
            return bookList;
        }

        @Override
        public void addBook(Book book) {
            bookList.add(book);
        }

        @Override
        public void updateBook(Book book) {
            // inout 参数：修改会回传给客户端
            book.price = 999;
        }

        @Override
        public void notifyChanged() {
            // oneway：异步执行
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

    // 内部类继承 Stub，实现接口方法
    private val binder = object : IBookManager.Stub() {

        override fun getBookList(): List<Book> {
            return bookList
        }

        override fun addBook(book: Book) {
            bookList.add(book)
        }

        override fun updateBook(book: Book) {
            // inout 参数：修改会回传给客户端
            book.price = 999
        }

        override fun notifyChanged() {
            // oneway：异步执行
        }
    }

    override fun onBind(intent: Intent): IBinder = binder
}
```

:::

## 4. 客户端使用

::: code-tabs

@tab:active Java

```java
public class MainActivity extends AppCompatActivity {

    private IBookManager bookManager = null;

    private final ServiceConnection connection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            // 通过 asInterface 获取代理对象
            bookManager = IBookManager.Stub.asInterface(service);
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            bookManager = null;
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = new Intent(this, BookManagerService.class);
        bindService(intent, connection, Context.BIND_AUTO_CREATE);
    }

    public void addBook() {
        if (bookManager != null) {
            bookManager.addBook(new Book("Android 进阶", 99));
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unbindService(connection);
    }
}
```

@tab Kotlin

```kotlin
class MainActivity : AppCompatActivity() {

    private var bookManager: IBookManager? = null

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            // 通过 asInterface 获取代理对象
            bookManager = IBookManager.Stub.asInterface(service)
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            bookManager = null
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val intent = Intent(this, BookManagerService::class.java)
        bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }

    fun addBook() {
        bookManager?.addBook(Book("Android 进阶", 99))
    }

    override fun onDestroy() {
        super.onDestroy()
        unbindService(connection)
    }
}
```

:::

## 5. Stub 与 Proxy 原理

::: code-tabs

@tab:active Java

```java
// AIDL 编译器生成的代码结构
public interface IBookManager extends IInterface {

    // Stub：服务端基类（Binder 实体）
    public static abstract class Stub extends Binder implements IBookManager {

        public Stub() {
            this.attachInterface(this, DESCRIPTOR);
        }

        // 客户端获取代理：在本进程直接返回 this，跨进程返回 Proxy
        public static IBookManager asInterface(IBinder obj) {
            if (obj == null) return null;
            IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
            if (iin != null && iin instanceof IBookManager) {
                return (IBookManager) iin;   // 同进程：直接返回
            }
            return new Proxy(obj);           // 跨进程：返回代理
        }

        // 服务端：Binder.onTransact 分发请求
        @Override
        public boolean onTransact(int code, Parcel data, Parcel reply, int flags) {
            switch (code) {
                case TRANSACTION_addBook:
                    data.enforceInterface(DESCRIPTOR);
                    Book book = Book.CREATOR.createFromParcel(data);
                    this.addBook(book);
                    reply.writeNoException();
                    return true;
            }
        }
    }

    // Proxy：客户端代理（包装 Binder 驱动调用）
    private static class Proxy implements IBookManager {
        private IBinder mRemote;

        @Override
        public void addBook(Book book) {
            Parcel data = Parcel.obtain();
            Parcel reply = Parcel.obtain();
            try {
                data.writeInterfaceToken(DESCRIPTOR);
                book.writeToParcel(data, 0);      // 序列化参数
                mRemote.transact(TRANSACTION_addBook, data, reply, 0);  // 跨进程调用
                reply.readException();
            } finally {
                data.recycle();
                reply.recycle();
            }
        }
    }
}
```

@tab Kotlin

```kotlin
// AIDL 编译器生成的代码结构
interface IBookManager : IInterface {

    // Stub：服务端基类（Binder 实体）
    abstract class Stub : Binder(), IBookManager {

        init {
            attachInterface(this, DESCRIPTOR)
        }

        // 客户端获取代理：在本进程直接返回 this，跨进程返回 Proxy
        companion object {
            @JvmStatic
            fun asInterface(obj: IBinder?): IBookManager? {
                if (obj == null) return null
                val iin = obj.queryLocalInterface(DESCRIPTOR)
                if (iin != null && iin is IBookManager) {
                    return iin   // 同进程：直接返回
                }
                return Proxy(obj)  // 跨进程：返回代理
            }
        }

        // 服务端：Binder.onTransact 分发请求
        override fun onTransact(code: Int, data: Parcel, reply: Parcel?, flags: Int): Boolean {
            if (code == TRANSACTION_addBook) {
                data.enforceInterface(DESCRIPTOR)
                val book = Book.CREATOR.createFromParcel(data)
                addBook(book)
                reply!!.writeNoException()
                return true
            }
            return super.onTransact(code, data, reply, flags)
        }
    }

    // Proxy：客户端代理（包装 Binder 驱动调用）
    private class Proxy(private val mRemote: IBinder) : IBookManager {

        override fun addBook(book: Book) {
            val data = Parcel.obtain()
            val reply = Parcel.obtain()
            try {
                data.writeInterfaceToken(DESCRIPTOR)
                book.writeToParcel(data, 0)      // 序列化参数
                mRemote.transact(TRANSACTION_addBook, data, reply, 0)  // 跨进程调用
                reply.readException()
            } finally {
                data.recycle()
                reply.recycle()
            }
        }
    }
}
```

:::

**核心流程**：

```text
客户端 Proxy.addBook()
  → data 写入参数（Parcel 序列化）
  → mRemote.transact()（Binder 驱动，进入内核）
  → 服务端 Stub.onTransact()
  → 反序列化参数 → 调用真实方法
  → 结果写入 reply → 回传客户端
```

## 6. 线程模型

```text
① 客户端调用默认阻塞（同步），在调用线程执行
② 服务端方法执行在 Binder 线程池（非主线程）！
③ 服务端需手动切换主线程更新 UI（Handler/runOnUiThread）
④ oneway 修饰的方法：客户端不等待返回（异步）
⑤ 跨进程回调：用 RemoteCallbackList 管理（自动处理死亡）
```

::: code-tabs

@tab:active Java

```java
// 服务端跨进程回调
private final RemoteCallbackList<IOnNewBookArrivedListener> callbacks = new RemoteCallbackList<>();

void register(IOnNewBookArrivedListener listener) {
    callbacks.register(listener);
}

// 通知所有客户端（Binder 线程池中执行）
void notifyNewBook(Book book) {
    int count = callbacks.beginBroadcast();
    for (int i = 0; i < count; i++) {
        IOnNewBookArrivedListener listener = callbacks.getBroadcastItem(i);
        if (listener != null) {
            listener.onNewBookArrived(book);
        }
    }
    callbacks.finishBroadcast();
}
```

@tab Kotlin

```kotlin
// 服务端跨进程回调
private val callbacks = RemoteCallbackList<IOnNewBookArrivedListener>()

fun register(listener: IOnNewBookArrivedListener) {
    callbacks.register(listener)
}

// 通知所有客户端（Binder 线程池中执行）
fun notifyNewBook(book: Book) {
    val count = callbacks.beginBroadcast()
    for (i in 0 until count) {
        callbacks.getBroadcastItem(i)?.onNewBookArrived(book)
    }
    callbacks.finishBroadcast()
}
```

:::

## 7. 高频面试题

**Q1：AIDL 中 in/out/inout 的区别？**
A：in 单向传入（服务端修改不回传，性能最好）；out 单向传出（参数初始值
不传入，服务端赋值后回传）；inout 双向（传+回，序列化两次，性能最差）。
对象类型建议用 in，减少开销。

**Q2：AIDL 与 Messenger 怎么选？**
A：AIDL 适合复杂接口、多方法、双向通信；Messenger 基于 Handler 封装
（串行、只传 Message），适合简单消息传递。追求性能与灵活用 AIDL。

**Q3：服务端方法执行在哪个线程？**
A：Binder 线程池（BinderThread），非主线程。所以服务端方法里操作 UI 必须
切回主线程。客户端默认同步阻塞，耗时操作放子线程。

**Q4：oneway 的作用？**
A：异步调用，客户端发出后立即返回（不等待回复），用于通知类接口。
限制：不能有返回值、不能有 out/inout 参数。底层 Binder 驱动直接返回。

**Q5：AIDL 回调导致内存泄漏怎么处理？**
A：客户端死亡时服务端需清理（linkToDeath 监听）；用 RemoteCallbackList
管理跨进程回调（自动处理 binderDied 与死循环遍历）。

## 8. 小结

- AIDL = 接口定义 + 编译器生成 Stub/Proxy。
- 定向 tag：in（传）、out（回）、inout（双向）。
- 服务端在 Binder 线程池执行，客户端同步阻塞。
- oneway 异步通知、RemoteCallbackList 管理回调。
- 面试重点：Stub/Proxy 结构、transact/onTransact、线程模型。

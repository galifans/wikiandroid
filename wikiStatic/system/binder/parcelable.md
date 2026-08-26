---
icon: database
title: Parcelable 序列化
---

# Parcelable 序列化

> 只要实现了 Parcelable 接口，一个类的对象就可以序列化并通过 Intent 和 Binder 传递。本章介绍 Parcelable 的使用、核心方法以及与 Serializable 的对比。

## 一、使用示例

::: code-tabs

@tab:active Java

```java
public class User implements Parcelable {

    private int userId;

    protected User(Parcel in) {
        userId = in.readInt();
    }

    public static final Creator<User> CREATOR = new Creator<User>() {
        @Override
        public User createFromParcel(Parcel in) {
            return new User(in);
        }

        @Override
        public User[] newArray(int size) {
            return new User[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(userId);
    }

    public int getUserId() {
        return userId;
    }
}
```

@tab Kotlin

```kotlin
class User : Parcelable {

    private var userId: Int = 0

    private constructor(parcel: Parcel) {
        userId = parcel.readInt()
    }

    override fun describeContents(): Int = 0

    override fun writeToParcel(dest: Parcel, flags: Int) {
        dest.writeInt(userId)
    }

    fun getUserId(): Int = userId

    companion object {
        @JvmField
        val CREATOR = object : Parcelable.Creator<User> {
            override fun createFromParcel(parcel: Parcel): User {
                return User(parcel)
            }

            override fun newArray(size: Int): Array<User?> {
                return arrayOfNulls(size)
            }
        }
    }
}
```

:::

## 二、核心方法说明

Parcel 内部包装了可序列化的数据，可以在 Binder 中自由传输。序列化功能由 `writeToParcel` 方法完成，最终通过 Parcel 中的一系列 write 方法完成；反序列化功能由 `CREATOR` 完成，通过 Parcel 的一系列 read 方法完成。

| 方法 | 功能 |
| --- | --- |
| `createFromParcel(Parcel in)` | 从序列化后的对象中创建原始对象 |
| `newArray(int size)` | 创建指定长度的原始对象数组 |
| `User(Parcel in)` | 从序列化后的对象中创建原始对象 |
| `writeToParcel(Parcel dest, int flags)` | 将当前对象写入序列化结构中。flags 标识有两种值：0 或 1；为 1 时表示当前对象需要作为返回值返回，不能立即释放资源，几乎所有情况都为 0 |
| `describeContents()` | 返回当前对象的内容描述。如果含有文件描述符，返回 1，否则返回 0，几乎所有情况都返回 0 |

> 序列化和反序列化的读写顺序必须一致，否则数据会错乱。

## 三、Parcelable 与 Serializable 对比

| 对比项 | Parcelable | Serializable |
| --- | --- | --- |
| 存储位置 | 直接在内存中读写 | 使用 I/O 读写存储在硬盘上 |
| 实现机制 | 自己实现封送和解封（marshalled & unmarshalled），不需要反射 | 使用反射，序列化和反序列化过程需要大量 I/O 操作 |
| 数据存储 | 数据存放在 Native 内存中 | 存储在 Java 堆中 |
| 效率 | 快很多 | 较慢 |
| 使用场景 | Android 组件间传递（Intent、Binder） | 需要持久化到磁盘或网络传输时 |

**建议：** 内存中传递数据优先使用 Parcelable（Android 平台专用、效率高）；需要持久化存储或跨平台传输时使用 Serializable。

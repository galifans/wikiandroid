---
icon: list
title: ArrayList 源码剖析
---

# ArrayList 源码剖析

> 基于数组实现的动态数组，容量自动增长，查询快、增删慢。

## 简介

- 基于**数组**实现，是一个动态数组，容量能自动增长
- **非线程安全**：多线程可用 `Collections.synchronizedList()` 包装，或使用并发包 `CopyOnWriteArrayList`
- 实现 `Serializable`（支持序列化）、`RandomAccess`（支持下标快速随机访问）、`Cloneable`（可克隆）

## 关键成员

::: code-tabs

@tab:active Java

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable {

    private transient Object[] elementData; // 保存数据的数组
    private int size;                        // 实际数据数量
}
```

@tab Kotlin

```kotlin
class ArrayList<E> : AbstractList<E>(),
        List<E>, RandomAccess, Cloneable, java.io.Serializable {

    @Transient
    private var elementData: Array<Any?>? = null // 保存数据的数组
    private var size: Int = 0                     // 实际数据数量
}
```

:::

## 构造方法

::: code-tabs

@tab:active Java

```java
public ArrayList(int initialCapacity) {
    this.elementData = new Object[initialCapacity];
}

public ArrayList() {
    this(10); // 默认容量 10
}

public ArrayList(Collection<? extends E> c) {
    elementData = c.toArray();
    size = elementData.length;
}
```

@tab Kotlin

```kotlin
constructor(initialCapacity: Int) {
    this.elementData = arrayOfNulls(initialCapacity)
}

constructor() {
    this(10) // 默认容量 10
}

constructor(c: Collection<out E>) {
    elementData = c.toArray()
    size = elementData.size
}
```

:::

## 扩容机制

当添加的数据量超过数组长度时扩容：

::: code-tabs

@tab:active Java

```java
public void ensureCapacity(int minCapacity) {
    modCount++; // fail-fast 机制
    int oldCapacity = elementData.length;
    if (minCapacity > oldCapacity) {
        // 新容量 = 旧容量 * 1.5 + 1（旧实现）
        int newCapacity = (oldCapacity * 3) / 2 + 1;
        if (newCapacity < minCapacity)
            newCapacity = minCapacity;
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
}
```

@tab Kotlin

```kotlin
fun ensureCapacity(minCapacity: Int) {
    modCount++ // fail-fast 机制
    val oldCapacity = elementData.size
    if (minCapacity > oldCapacity) {
        // 新容量 = 旧容量 * 1.5 + 1（旧实现）
        var newCapacity = (oldCapacity * 3) / 2 + 1
        if (newCapacity < minCapacity)
            newCapacity = minCapacity
        elementData = Arrays.copyOf(elementData, newCapacity)
    }
}
```

:::

- JDK 6 使用 `Arrays.copyOf()`，JDK 5 使用 `System.arraycopy()`
- `trimToSize()` 可将容量调整为实际元素个数

## 与 LinkedList、Vector 对比

| 对比项 | ArrayList | LinkedList | Vector |
|--------|-----------|------------|--------|
| 底层实现 | Object 数组 | 双向循环链表 | Object 数组 |
| 线程安全 | 否 | 否 | 是（大部分方法 synchronized） |
| 查询速度 | 快（数组下标） | 慢（需遍历） | 快 |
| 增删速度 | 慢（非末尾节点需移动） | 快（改指针） | 慢 |
| 适用场景 | 频繁查找、较少增删 | 频繁增删 | 遗留类，不推荐 |

## fail-fast 机制

`modCount` 记录修改次数。迭代器遍历时若检测到 `modCount` 变化（其他线程并发修改），立即抛出 `ConcurrentModificationException`。

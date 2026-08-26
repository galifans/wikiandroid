---
icon: chain
title: LinkedList 源码剖析
---

# LinkedList 源码剖析

> 基于双向循环链表实现，增删快、查询慢，还可作为栈、队列、双端队列使用。

## 简介

- 基于**双向循环链表**实现
- 除了当作链表，还可当作**栈、队列、双端队列**使用（实现 `Deque` 接口）
- **非线程安全**，仅适合单线程
- 实现 `Serializable`、`Cloneable`

## 关键成员

::: code-tabs

@tab:active Java

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable {

    // 表头不包含任何数据，只保存前后节点的引用
    private transient Entry<E> header = new Entry<E>(null, null, null);
    private transient int size = 0;

    public LinkedList() {
        header.next = header.previous = header; // 空链表
    }
}
```

@tab Kotlin

```kotlin
class LinkedList<E> : AbstractSequentialList<E>(),
    List<E>, Deque<E>, Cloneable, java.io.Serializable {

    // 表头不包含任何数据，只保存前后节点的引用
    @Transient
    private var header = Entry<E>(null, null, null)
    @Transient
    private var size: Int = 0

    constructor() {
        header.next = header
        header.previous = header // 空链表
    }
}
```

:::

## 基本操作

::: code-tabs

@tab:active Java

```java
public E getFirst() {
    if (size == 0) throw new NoSuchElementException();
    return header.next.element;      // 表头下一个节点
}

public E getLast() {
    if (size == 0) throw new NoSuchElementException();
    return header.previous.element;  // 表头前一个节点
}

public E removeFirst() {
    return remove(header.next);
}
```

@tab Kotlin

```kotlin
fun getFirst(): E {
    if (size == 0) throw NoSuchElementException()
    return header.next.element      // 表头下一个节点
}

fun getLast(): E {
    if (size == 0) throw NoSuchElementException()
    return header.previous.element  // 表头前一个节点
}

fun removeFirst(): E {
    return remove(header.next)
}
```

:::

由于是**双向链表**且表头 `header` 不包含数据，`getFirst` 返回 `header.next`，`getLast` 返回 `header.previous`。

## 特点

- **查询慢**：需要从表头或表尾逐个遍历
- **增删快**：只需修改前后节点的引用，无需移动元素
- 适合频繁插入、删除的场景（如队列操作）

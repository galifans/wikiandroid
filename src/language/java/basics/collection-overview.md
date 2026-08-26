---
icon: layer-group
title: 集合接口概览
---

# 集合接口概览

> 本章介绍 Java 集合框架中 Collection、List、Set、Queue、Map 等核心接口的特点与常用方法，以及 Collection 与 Collections 的区别，帮助建立集合体系的整体认知。

## 一、Collection 接口

`Collection` 是最基本的集合接口，位于 `java.util` 包中。

- 继承的接口：`Iterable`
- 子接口：`List`、`Set`、`Queue` 等
- 一个 Collection 代表一组对象（元素），有些允许重复元素，有些不允许；有些可排序，有些不可排序。
- Java SDK 不提供直接继承自 Collection 的类，提供的类都继承自 Collection 的子接口（如 List 和 Set）。

**遍历 Collection 中的元素：**

::: code-tabs

@tab:active Java

```java
Iterator it = collection.iterator(); // 获得迭代子
while (it.hasNext()) {
    Object obj = it.next(); // 得到下一个元素
}
```

@tab Kotlin

```kotlin
val it = collection.iterator() // 获得迭代子
while (it.hasNext()) {
    val obj = it.next() // 得到下一个元素
}
```

:::

**常用方法：**

| 方法 | 作用 |
| --- | --- |
| `addAll(Collection c)` | 添加，并运算 |
| `retainAll(Collection c)` | 保留，交运算 |
| `removeAll(Collection c)` | 移除，减运算 |

## 二、Collection 与 Collections 的区别

- `Collection` 是一个**接口**，是 Set、List 等容器的父接口。
- `Collections` 是一个**工具类**，提供一系列静态方法辅助容器操作，包括搜索、排序、线程安全化等。

## 三、List 接口

`List` 是有序的 Collection：

- 可以对每个元素的插入位置进行精准控制，可根据索引访问元素。
- 允许重复元素。
- 有专属迭代器 `ListIterator`。
- 继承关系：List → Collection → Iterable。

**常用方法：**

| 方法 | 作用 |
| --- | --- |
| `boolean add(E e)` | 添加到末尾 |
| `void add(int index, E e)` | 添加到指定位置 |
| `E set(int index, E e)` | 设置指定位置的元素 |
| `E get(int index)` | 获得指定位置的元素 |
| `ListIterator listIterator()` | 获取列表迭代器 |
| `int indexOf(E e)` / `lastIndexOf(E e)` | 查找元素位置 |
| `List<E> subList(int fromIndex, int toIndex)` | 获取子列表 |

**主要实现类对比：**

| 实现类 | 底层结构 | 特点 |
| --- | --- | --- |
| ArrayList | 可改变大小的数组 | 随机访问快（get/set 直接索引），插入删除慢 |
| LinkedList | 双向链表 | 插入删除快，随机访问慢；还实现了 Queue 接口 |
| Vector | 数组（强同步） | 线程安全，但性能低于 ArrayList |

## 四、Set 接口

`Set` 是不允许重复元素的集合：

- 是泛型接口，继承 Collection。
- 子接口：`NavigableSet`、`SortedSet`。
- 常见实现：`HashSet`、`LinkedHashSet`、`TreeSet`、`EnumSet` 等。

**两个注意点：**

1. Set 中元素的类必须有有效的 `equals()` 方法（配合 hashCode 使用）。
2. 对 Set 的构造方法传入含重复元素的 Collection 时，重复元素只会留下一个。

**取值方式：** Set 只能通过游标（迭代器）取值，不能像 List 一样按下标取值。

## 五、Queue 接口

`Queue` 是队列接口，继承 Collection，子接口为 `Deque`（双端队列，既可以实现队列，也可以用作栈）。

插入、提取、检查操作都有两种形式：

| 操作 | 失败时抛异常 | 失败时返回特殊值 |
| --- | --- | --- |
| 添加元素 | `add(E e)` | `offer(E e)` 返回 false |
| 获取但不移除 | `element()` | `peek()` 返回 null |
| 获取并移除 | `remove()` | `poll()` 返回 null |

已知实现类：`LinkedList`、`PriorityQueue` 等。

## 六、Map 接口

`Map` 是键值对集合，与 Collection 体系平级：

| 实现类 | 线程安全 | 是否允许 null 键/值 | 底层结构 |
| --- | --- | --- | --- |
| HashMap | 否 | 允许 | 数组 + 链表 + 红黑树 |
| Hashtable | 是（synchronized） | 不允许 | 数组 + 链表 |
| LinkedHashMap | 否 | 允许 | 哈希表 + 双向链表（保持插入顺序） |
| TreeMap | 否 | 不允许 null 键 | 红黑树（按键排序） |

## 七、List、Set、Map、Queue、Stack 的特点总结

| 接口/类 | 特点 |
| --- | --- |
| List | 可通过下标取值，值可重复（ArrayList、Vector、LinkedList） |
| Set | 只能通过游标取值，值不能重复 |
| Map | 键值对集合，键不可重复 |
| Queue | 队列，FIFO，offer/poll/peek 等操作 |
| Stack | 继承自 Vector，后进先出（LIFO），提供 push、pop、peek、empty、search 等方法 |

**线程安全小结：**

- ArrayList、LinkedList、HashMap：线程不安全。
- Vector、Hashtable：线程安全（方法使用 synchronized）。
- 多线程场景优先考虑 `java.util.concurrent` 包（如 CopyOnWriteArrayList、ConcurrentHashMap）或使用 `Collections.synchronizedXxx()` 包装。

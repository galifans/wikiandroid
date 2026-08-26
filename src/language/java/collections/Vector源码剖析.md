---
icon: history
title: Vector 源码剖析
---

# Vector 源码剖析

> Vector 是 JDK 1.0 引入的基于数组实现的动态数组，与 ArrayList 类似但加入了同步机制。本章剖析其核心实现，并与 ArrayList 对比。

## 一、Vector 简介

- 基于数组实现，是一个**动态数组**，容量能自动增长。
- 由 JDK 1.0 引入，很多实现方法都加入了同步语句（synchronized），因此是**线程安全**的（只是相对安全，某些场景仍需手动同步）。
- 实现了 RandomAccess 接口，支持快速随机访问。
- 实现了 Cloneable 接口，可以被克隆。

## 二、核心字段

::: code-tabs

@tab:active Java

```java
protected Object[] elementData;     // 保存数据的数组
protected int elementCount;         // 实际数据的数量
protected int capacityIncrement;    // 容量增长系数
```

@tab Kotlin

```kotlin
protected var elementData: Array<Any?>? = null // 保存数据的数组
protected var elementCount: Int = 0            // 实际数据的数量
protected var capacityIncrement: Int = 0       // 容量增长系数
```

:::

## 三、构造函数

::: code-tabs

@tab:active Java

```java
public Vector() {
    this(10);                       // 默认容量 10
}

public Vector(int initialCapacity) {
    this(initialCapacity, 0);       // 增长系数默认为 0
}

public Vector(int initialCapacity, int capacityIncrement) {
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
    this.elementData = new Object[initialCapacity];
    this.capacityIncrement = capacityIncrement;
}
```

@tab Kotlin

```kotlin
constructor() : this(10) {          // 默认容量 10
}

constructor(initialCapacity: Int) : this(initialCapacity, 0) { // 增长系数默认为 0
}

constructor(initialCapacity: Int, capacityIncrement: Int) {
    if (initialCapacity < 0)
        throw IllegalArgumentException("Illegal Capacity: $initialCapacity")
    this.elementData = arrayOfNulls(initialCapacity)
    this.capacityIncrement = capacityIncrement
}
```

:::

## 四、扩容机制

::: code-tabs

@tab:active Java

```java
private void ensureCapacityHelper(int minCapacity) {
    int oldCapacity = elementData.length;
    if (minCapacity > oldCapacity) {
        int newCapacity = (capacityIncrement > 0)
                ? (oldCapacity + capacityIncrement)   // 按增长系数扩容
                : (oldCapacity * 2);                  // 默认扩容为原来的 2 倍
        if (newCapacity < minCapacity) {
            newCapacity = minCapacity;
        }
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
}
```

@tab Kotlin

```kotlin
private fun ensureCapacityHelper(minCapacity: Int) {
    val oldCapacity = elementData.size
    if (minCapacity > oldCapacity) {
        var newCapacity = if (capacityIncrement > 0)
                (oldCapacity + capacityIncrement)   // 按增长系数扩容
            else
                (oldCapacity * 2)                   // 默认扩容为原来的 2 倍
        if (newCapacity < minCapacity) {
            newCapacity = minCapacity
        }
        elementData = Arrays.copyOf(elementData, newCapacity)
    }
}
```

:::

扩容规则：

- 指定了 `capacityIncrement` 时，容量增加 `capacityIncrement`。
- 未指定（默认 0）时，容量扩大为原来的 **2 倍**。
- 而 ArrayList 默认扩容为原来的 **1.5 倍**。

## 五、与 ArrayList 对比

| 对比项 | Vector | ArrayList |
| --- | --- | --- |
| 出现时间 | JDK 1.0 | JDK 1.2 |
| 底层结构 | Object 数组 | Object 数组 |
| 线程安全 | 是（方法 synchronized） | 否 |
| 默认扩容 | 2 倍 | 1.5 倍（新容量 = 旧容量 + 旧容量 >> 1） |
| 增长系数 | 可指定 capacityIncrement | 不支持 |
| 序列化 | 实现 Serializable | 实现 Serializable |
| 随机访问 | 支持（RandomAccess） | 支持（RandomAccess） |
| 使用建议 | 基本被 ArrayList 取代 | 单线程首选 |

**使用建议：**

- 单线程环境下优先使用 ArrayList，省去同步开销。
- 多线程场景更推荐 `java.util.concurrent` 包（如 CopyOnWriteArrayList）或 `Collections.synchronizedList()` 包装，而非直接使用 Vector。

---
icon: clock
title: LinkedHashMap 源码剖析
---

# LinkedHashMap 源码剖析

> HashMap 的子类，通过双向链表保留插入顺序，可用于实现 LRU 算法。

## 简介

- 是 **HashMap 的子类**，存储结构相同
- 额外加入一个**双向链表头结点**，把所有 put 进来的节点串成双向循环链表
- **保留节点插入顺序**：输出顺序与输入顺序相同
- 可用于实现 **LRU 算法**
- **非线程安全**，仅单线程使用

## 关键成员

::: code-tabs

@tab:active Java

```java
public class LinkedHashMap<K,V> extends HashMap<K,V> implements Map<K,V> {

    // 双向循环链表的头结点，不保存 key-value，只保存前后节点引用
    private transient Entry<K,V> header;

    // 排序规则：false 按插入顺序，true 按访问顺序
    private final boolean accessOrder;
}
```

@tab Kotlin

```kotlin
class LinkedHashMap<K, V> : HashMap<K, V>(), Map<K, V> {

    // 双向循环链表的头结点，不保存 key-value，只保存前后节点引用
    @Transient
    private var header: Entry<K, V>? = null

    // 排序规则：false 按插入顺序，true 按访问顺序
    private val accessOrder: Boolean
}
```

:::

## 构造方法

::: code-tabs

@tab:active Java

```java
public LinkedHashMap() {
    super();
    accessOrder = false; // 默认按插入顺序排序
}

// 可指定排序规则
public LinkedHashMap(int initialCapacity, float loadFactor, boolean accessOrder) {
    super(initialCapacity, loadFactor);
    this.accessOrder = accessOrder;
}
```

@tab Kotlin

```kotlin
constructor() : super() {
    accessOrder = false // 默认按插入顺序排序
}

// 可指定排序规则
constructor(initialCapacity: Int, loadFactor: Float, accessOrder: Boolean) : super(initialCapacity, loadFactor) {
    this.accessOrder = accessOrder
}
```

:::

`accessOrder` 为 `true` 时按**访问顺序**排序（每次访问会把节点移到链表末尾），这正是 LRU 缓存的基础。

## 实现 LRU 缓存

`accessOrder = true` 时，最近访问的节点被移到链表尾部，链表头部就是最久未使用的节点，删除头部节点即淘汰最久未使用的数据：

::: code-tabs

@tab:active Java

```java
LinkedHashMap<Key, Value> cache = new LinkedHashMap<>(16, 0.75f, true) {
    @Override
    protected boolean removeEldestEntry(Map.Entry<Key, Value> eldest) {
        return size() > MAX_CACHE_SIZE; // 超过容量时移除最久未使用的
    }
};
```

@tab Kotlin

```kotlin
val cache = object : LinkedHashMap<Key, Value>(16, 0.75f, true) {
    override fun removeEldestEntry(eldest: MutableMap.MutableEntry<Key, Value>?): Boolean {
        return size > MAX_CACHE_SIZE // 超过容量时移除最久未使用的
    }
}
```

:::

通过覆写 `removeEldestEntry()` 实现容量限制，这就是 Android 中 `LruCache` 的核心思想。

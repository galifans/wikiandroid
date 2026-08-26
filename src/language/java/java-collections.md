---
icon: java
title: Java 集合框架详解
description: List/Set/Map 体系、ArrayList vs LinkedList、HashMap 原理、ConcurrentHashMap、集合选择与源码解析
---

# Java 集合框架详解

> 面试高频指数：极高
> 集合是 Java 面试必考题，HashMap 源码几乎是每场面试的标配。

## 1. 集合框架总览

```text
Collection（单列集合）
 ├─ List（有序、可重复）
 │   ├─ ArrayList（数组实现）
 │   ├─ LinkedList（双向链表）
 │   └─ Vector（线程安全，已过时）
 ├─ Set（无序、不可重复）
 │   ├─ HashSet（哈希表，基于 HashMap）
 │   ├─ LinkedHashSet（插入序）
 │   └─ TreeSet（红黑树，有序）
 └─ Queue（队列）
     ├─ ArrayDeque（双端队列）
     └─ PriorityQueue（优先队列/堆）

Map（键值对）
 ├─ HashMap（哈希表，无序）
 ├─ LinkedHashMap（插入序/访问序）
 ├─ TreeMap（红黑树，键有序）
 ├─ Hashtable（线程安全，过时）
 └─ ConcurrentHashMap（并发安全）
```

## 2. List 详解

### 2.1 ArrayList vs LinkedList

| 维度 | ArrayList | LinkedList |
| --- | --- | --- |
| 底层 | 动态数组 | 双向链表 |
| 随机访问 get(i) | O(1) | O(n) |
| 插入/删除（中间） | O(n)（移动元素） | O(1)（改指针） |
| 尾部追加 | O(1)（均摊） | O(1) |
| 内存 | 连续、省 | 节点 + 指针，占内存 |
| 适用 | 读多写少、随机访问 | 频繁头尾操作 |

::: code-tabs

@tab:active Java

```java
// ArrayList 扩容机制
// 默认容量 10，每次扩容为 1.5 倍
// add 时：ensureCapacityInternal → grow
List<String> list = new ArrayList<>();
list.add("a");   // 容量不够时扩容

// 扩容源码要点：newCapacity = oldCapacity + (oldCapacity >> 1)
```

@tab Kotlin

```kotlin
// ArrayList 扩容机制
// 默认容量 10，每次扩容为 1.5 倍
// add 时：ensureCapacityInternal → grow
val list = ArrayList<String>()
list.add("a")   // 容量不够时扩容

// 扩容源码要点：newCapacity = oldCapacity + (oldCapacity >> 1)
```

:::

### 2.2 线程安全

::: code-tabs

@tab:active Java

```java
// 普通 ArrayList 非线程安全
// 方案：
List<String> syncList = Collections.synchronizedList(new ArrayList<>());  // 同步包装
List<String> copyList = new CopyOnWriteArrayList<>();                     // 写时复制
// CopyOnWriteArrayList：读无锁（快照），写加锁复制整个数组（适合读多写少）
```

@tab Kotlin

```kotlin
// 普通 ArrayList 非线程安全
// 方案：
val syncList = java.util.Collections.synchronizedList(ArrayList<String>())  // 同步包装
val copyList = java.util.concurrent.CopyOnWriteArrayList<String>()          // 写时复制
// CopyOnWriteArrayList：读无锁（快照），写加锁复制整个数组（适合读多写少）
```

:::

## 3. HashMap 源码详解（核心重点）

### 3.1 数据结构

```text
JDK 1.8+ 结构：
数组（Node[] table）+ 链表 + 红黑树

哈希冲突时：
- 链表长度 < 8     ：链表存储
- 链表长度 >= 8 且数组长度 >= 64 ：转为红黑树
- 树节点 < 6      ：退化为链表

默认参数：
- 初始容量 16
- 负载因子 0.75
- 扩容阈值 = 容量 × 负载因子（16 × 0.75 = 12）
```

### 3.2 put 流程

```text
① 计算 hash = (key.hashCode()) ^ (hash >>> 16)   // 扰动函数
② 索引 index = (n - 1) & hash                     // 取模优化（容量是 2 的幂）
③ 桶为空 → 直接放
④ 桶有值 → 链表插入（尾插法）/ 树插入
⑤ 相同 key → 覆盖旧值
⑥ 链表长度 >= 8 → 树化（先检查数组长度 >= 64）
⑦ 元素个数 > 阈值 → 扩容（resize，2 倍）
```

::: code-tabs

@tab:active Java

```java
// 为什么用 2 的幂：index = (n - 1) & hash 等价于 hash % n，位运算更快
// 为什么扰动：hash >>> 16 让高位参与运算，减少冲突
```

@tab Kotlin

```kotlin
// 为什么用 2 的幂：index = (n - 1) & hash 等价于 hash % n，位运算更快
// 为什么扰动：hash >>> 16 让高位参与运算，减少冲突
```

:::

### 3.3 get 流程

```text
① 计算 hash 与 index
② 桶为 null → 返回 null
③ 首节点匹配 → 返回
④ 是红黑树 → 树查找
⑤ 否则 → 链表遍历
```

### 3.4 扩容（resize）

```text
时机：size > threshold（容量 × 0.75）
动作：容量 × 2，重新计算每个元素的索引
JDK 1.8 优化：利用 (e.hash & oldCap) == 0 判断
元素位置：原索引 或 原索引 + oldCap（无需重新 hash）
```

## 4. Set 与 Map 的关系

::: code-tabs

@tab:active Java

```java
// HashSet 底层就是 HashMap（value 用固定 PRESENT 占位）
Set<String> set = new HashSet<>();

// LinkedHashMap：维护插入顺序（LRU 缓存基础）
LinkedHashMap<String, Integer> lru = new LinkedHashMap<String, Integer>(16, 0.75f, true) {
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
        return size() > 100;    // 超过 100 淘汰最久未用
    }
};
```

@tab Kotlin

```kotlin
// HashSet 底层就是 HashMap（value 用固定 PRESENT 占位）
val set = HashSet<String>()

// LinkedHashMap：维护插入顺序（LRU 缓存基础）
val lru = object : LinkedHashMap<String, Int>(16, 0.75f, true) {
    override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, Int>?): Boolean {
        return size > 100    // 超过 100 淘汰最久未用
    }
}
```

:::

## 5. ConcurrentHashMap（并发安全）

```text
JDK 1.7：分段锁（Segment，继承 ReentrantLock）
JDK 1.8+：CAS + synchronized（锁链表头节点）

1.8 特点：
- 并发度更高（锁单个桶）
- 读操作无锁（volatile 保证可见性）
- put：空桶 CAS，非空 synchronized 锁头节点
- 支持并发扩容（多线程协助）
```

## 6. 高频面试题

**Q1：HashMap 底层实现？**
A：数组 + 链表 + 红黑树。hash 扰动 + (n-1)&hash 定位；链表长度 ≥8 且数组
≥64 树化；负载因子 0.75，超过阈值扩容为 2 倍。

**Q2：为什么 HashMap 不是线程安全的？有什么问题？**
A：并发 put 可能丢数据、覆盖；1.7 扩容头插法可能形成循环链表（死循环）。
方案：HashTable（全表锁，过时）、Collections.synchronizedMap（同步包装）、
ConcurrentHashMap（推荐）。

**Q3：HashMap 和 Hashtable 的区别？**
A：Hashtable 线程安全（全表 synchronized，性能差）；不允许 null key/value；
HashMap 非线程安全、允许 null；初始容量与扩容策略不同。

**Q4：为什么负载因子是 0.75？**
A：权衡时间与空间。过高（如 1）减少扩容但冲突多（查询慢）；过低增加
扩容次数浪费空间。0.75 是泊松分布下的经验最优值。

**Q5：ConcurrentHashMap 1.8 为什么用 synchronized 而不是分段锁？**
A：锁粒度更细（锁单个桶的头节点），并发度更高；CAS + synchronized 组合
在多数场景性能优于 Segment 锁；代码更简洁，避免 Segment 的额外内存。

## 7. 集合选型速查

| 需求 | 选择 |
| --- | --- |
| 随机访问 | ArrayList |
| 频繁头尾插入 | LinkedList / ArrayDeque |
| 去重 | HashSet |
| 有序去重 | TreeSet / LinkedHashSet |
| 键值对（无序） | HashMap |
| 按序遍历 | LinkedHashMap |
| 按键排序 | TreeMap |
| 并发读多写少 | CopyOnWriteArrayList / ConcurrentHashMap |

## 8. 小结

- 三大家族：List / Set / Map，底层决定特性。
- HashMap 三件套：哈希、树化、扩容（面试核心）。
- 并发容器选 ConcurrentHashMap、CopyOnWriteArrayList。
- 选型先想"是否有序、是否去重、是否并发"。

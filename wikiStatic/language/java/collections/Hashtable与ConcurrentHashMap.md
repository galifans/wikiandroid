---
icon: shield-halved
title: Hashtable 与 ConcurrentHashMap
---

# Hashtable 与 ConcurrentHashMap

> Hashtable 是线程安全的遗留类，ConcurrentHashMap 是并发包下的高性能替代品。

## Hashtable 简介

- 与 HashMap 同为哈希表实现，每个元素是 key-value 对，内部用单链表解决冲突
- JDK 1.0 引入，**线程安全**（大部分方法 synchronized）
- 实现 `Serializable`、`Cloneable`，继承 `Dictionary`

## HashMap 与 Hashtable 的区别

HashMap 与 Hashtable 的对比说明如下：

| 对比项 | HashMap | Hashtable |
|--------|---------|-----------|
| 线程安全 | 否 | 是（方法级 synchronized） |
| null 键/值 | 允许 | **不允许** |
| 继承 | AbstractMap | Dictionary |
| 哈希算法 | 内部 hash() 位运算 | 与 HashMap 的 hash 算法和索引映射算法不同 |
| 引入时间 | JDK 1.2 | JDK 1.0 |

## 为什么需要 ConcurrentHashMap

Hashtable 的同步是**方法级**的，并发度低（整张表一把锁）。ConcurrentHashMap 采用**分段锁/细粒度锁**，提供更好的并发性能：

- 读操作基本不加锁
- 写操作只锁住部分桶（Java 8 之后是 CAS + synchronized 锁单个桶头节点）
- 支持高并发场景

## 线程安全集合的选择

不同并发场景下的集合选择建议如下：

| 场景 | 推荐 |
|------|------|
| 单线程 | HashMap / ArrayList |
| 多线程读写 Map | ConcurrentHashMap |
| 多线程读写 List | CopyOnWriteArrayList |
| 需要简单同步包装 | Collections.synchronizedXxx() |

## 注意事项

大部分线程安全类是**相对线程安全**的：单个操作安全，但组合操作（如"先检查再操作"）仍需调用端额外同步。

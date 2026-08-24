---
icon: map
title: HashMap 源码剖析
---

# HashMap 源码剖析

> 基于哈希表实现，底层是"链表数组"，高性能查找的关键在于高效的 hash 算法。

## 简介

- 基于**哈希表**实现，每个元素是 key-value 对
- 内部通过**单链表**解决哈希冲突
- 容量不足（超过阈值）时自动增长
- **非线程安全**，多线程环境用 `ConcurrentHashMap`
- 实现 `Serializable`、`Cloneable`

## 关键成员

```java
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable {

    static final int DEFAULT_INITIAL_CAPACITY = 16;  // 默认容量，须为 2 的幂
    static final int MAXIMUM_CAPACITY = 1 << 30;
    static final float DEFAULT_LOAD_FACTOR = 0.75f;  // 默认加载因子

    transient Entry[] table;   // Entry 数组，每个 Entry 是单向链表
    transient int size;        // 已用槽数量
    int threshold;             // 阈值 = 容量 × 加载因子
    final float loadFactor;
    transient volatile int modCount; // 修改次数（fail-fast）
}
```

构造时找出**大于 initialCapacity 的最小 2 的幂**作为容量，`threshold = capacity * loadFactor`。

## 高性能查找的关键

```java
// 1. hash 算法必须高效：全部基于位运算
static int hash(int h) {
    h ^= (h >>> 20) ^ (h >>> 12);
    return h ^ (h >>> 7) ^ (h >>> 4);
}

// 2. hash 值到数组索引的映射要快：按位与
static int indexFor(int h, int length) {
    return h & (length - 1);
}
```

通过 `hashCode()` + `hash()` 位运算 + `indexFor()` 按位与，直接得到数组下标，内存访问速度极快。

## 哈希冲突与 put 流程

HashMap 底层是数组，数组元素是 Entry 对象（含 key、value、next、hash）。发生冲突时，新 Entry 放在对应索引并**头插**（新 Entry 的 next 指向旧值），即"链表数组"：

```java
public V put(K key, V value) {
    if (key == null)
        return putForNullKey(value);
    int hash = hash(key.hashCode());
    int i = indexFor(hash, table.length);
    for (Entry<K, V> e = table[i]; e != null; e = e.next) {
        Object k;
        // key 已存在则替换 value 并返回旧值
        if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
            V oldValue = e.value;
            e.value = value;
            return oldValue;
        }
    }
    modCount++;
    addEntry(hash, key, value, i);
    return null;
}
```

## hashCode 的作用

1. hashCode 用于散列结构中**确定对象存储地址**，提高查找快捷性
2. 两个对象 `equals()` 相等，hashCode **一定**相同
3. 重写了 `equals()` 就应尽量重写 `hashCode()`，且两者使用的字段要一致
4. 两个对象 hashCode 相同**不一定** equals 相同——只说明它们在"同一个篮子里"（哈希冲突）

**查找流程**：先通过 hashCode 定位"桶"，再通过 equals 在桶内找到目标——先找桶、再精确匹配，大大减少 equals 调用次数。

## 解决哈希冲突的方法

- 链地址法（HashMap 采用）
- 线性探查法
- 线性补偿探测法
- 随机探测

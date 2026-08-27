---
icon: magnifying-glass
title: 查找算法
---

# 查找算法

> 查找算法是算法的基础内容。本章介绍最常见的两种查找方式：顺序查找与折半查找（二分查找），并分析各自的适用场景。

## 一、顺序查找

### 思想

依次遍历整个数组，逐个与目标值比较，找到则返回下标，遍历完未找到返回 -1。

### 代码实现

顺序查找的代码实现如下：

::: code-tabs

@tab:active Java

```java
public class Solution {
    public static int SequenceSearch(int[] sz, int key) {
        for (int i = 0; i < sz.length; i++) {
            if (sz[i] == key) {
                return i;
            }
        }
        return -1;
    }
}
```

@tab Kotlin

```kotlin
object Solution {
    @JvmStatic
    fun sequenceSearch(sz: IntArray, key: Int): Int {
        for (i in sz.indices) {
            if (sz[i] == key) {
                return i
            }
        }
        return -1
    }
}
```

:::

### 特点

- 时间复杂度：O(n)。
- 适用于**无序数组**，是唯一能处理无序数据的查找方式。
- 数据量大时效率低。

## 二、折半查找（二分查找）

### 思想

每次查找都对半分，每次比较都能排除一半的数据。**前提条件是数组必须有序**。

基本流程：

1. 初始化 low = 0，high = 数组长度 - 1。
2. 取中间位置 middle = (low + high) / 2。
3. 若 `sz[middle] == key`，查找成功返回下标。
4. 若 `sz[middle] > key`，说明目标在左半部分，high = middle - 1。
5. 若 `sz[middle] < key`，说明目标在右半部分，low = middle + 1。
6. 重复直到 low > high，查找失败返回 -1。

### 代码实现

折半查找的代码实现如下：

::: code-tabs

@tab:active Java

```java
public class Solution {
    public static int BinarySearch(int[] sz, int key) {
        int low = 0;
        int high = sz.length - 1;

        while (low <= high) {
            int middle = (low + high) / 2;
            if (sz[middle] == key) {
                return middle;
            } else if (sz[middle] > key) {
                high = middle - 1;
            } else {
                low = middle + 1;
            }
        }
        return -1;
    }
}
```

@tab Kotlin

```kotlin
object Solution {
    @JvmStatic
    fun binarySearch(sz: IntArray, key: Int): Int {
        var low = 0
        var high = sz.size - 1

        while (low <= high) {
            val middle = (low + high) / 2
            if (sz[middle] == key) {
                return middle
            } else if (sz[middle] > key) {
                high = middle - 1
            } else {
                low = middle + 1
            }
        }
        return -1
    }
}
```

:::

### 特点

- 时间复杂度：O(logn)，效率远高于顺序查找。
- 前提：数组必须有序。
- 可以递归实现，也可以迭代实现（迭代避免了递归调用栈开销）。

## 三、两种查找算法对比

顺序查找与折半查找的对比说明如下：

| 对比项 | 顺序查找 | 折半查找 |
| --- | --- | --- |
| 时间复杂度 | O(n) | O(logn) |
| 数据要求 | 无序即可 | 必须有序 |
| 空间复杂度 | O(1) | O(1)（迭代） |
| 适用场景 | 数据量小或无序 | 数据量大且有序 |

## 四、折半查找的变体与应用

- **查找旋转数组的最小数字**：将旋转数组看作两个有序子数组，用类似二分的思想缩小范围（详见剑指Offer精选题）。
- **二分插入**：插入排序中查找插入位置时可用二分查找优化。
- **二分答案**：在"最小化最大值 / 最大化最小值"类问题中，对答案进行二分。

---
icon: sort
title: 排序算法
---

# 排序算法

> 查找和排序算法是算法的入门知识，经典思想可以用于很多算法中。面试中最常考的是快速排序和归并排序，常要求现场写出代码。本章梳理冒泡、选择、插入、快速、归并、堆排序等常见排序的思想、实现、复杂度与适用场景。

## 一、排序算法总览

各排序算法的复杂度与稳定性对比如下：

| 排序算法 | 平均时间复杂度 | 最坏时间复杂度 | 空间复杂度 | 稳定性 |
| --- | --- | --- | --- | --- |
| 冒泡排序 | O(n²) | O(n²) | O(1) | 稳定 |
| 选择排序 | O(n²) | O(n²) | O(1) | 不稳定 |
| 插入排序 | O(n²) | O(n²) | O(1) | 稳定 |
| 希尔排序 | O(n^1.3) | O(n²) | O(1) | 不稳定 |
| 快速排序 | O(nlogn) | O(n²) | O(logn) | 不稳定 |
| 归并排序 | O(nlogn) | O(nlogn) | O(n) | 稳定 |
| 堆排序 | O(nlogn) | O(nlogn) | O(1) | 不稳定 |
| 基数排序 | O(d(n+r)) | O(d(n+r)) | O(n+r) | 稳定 |
| 桶排序 | O(n+k) | O(n²) | O(n+k) | 稳定 |
| 计数排序 | O(n+k) | O(n+k) | O(k) | 稳定 |

**稳定性含义：** 相等元素的相对顺序在排序后保持不变。

## 二、冒泡排序

### 思想

通过与相邻元素的比较和交换，把小的数交换到最前面，如同水泡向上升一样。

以序列 5, 3, 8, 6, 4 为例：从后向前冒泡，4 与 6 比较交换 → 5, 3, 8, 4, 6；4 与 8 交换 → 5, 3, 4, 8, 6；3 与 4 无需交换；5 与 3 交换 → 3, 5, 4, 8, 6。一次冒泡把最小数 3 排到最前面，对剩余序列依次冒泡得到有序序列。

### 代码实现

冒泡排序的代码实现如下：

::: code-tabs

@tab:active Java

```java
public static void bubbleSort(int[] arr) {
    if (arr == null || arr.length == 0) return;
    for (int i = 0; i < arr.length - 1; i++) {
        for (int j = arr.length - 1; j > i; j--) {
            if (arr[j] < arr[j - 1]) {
                swap(arr, j - 1, j);
            }
        }
    }
}

public static void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
```

@tab Kotlin

```kotlin
fun bubbleSort(arr: IntArray?) {
    if (arr == null || arr.isEmpty()) return
    for (i in 0 until arr.size - 1) {
        for (j in arr.size - 1 downTo i + 1) {
            if (arr[j] < arr[j - 1]) {
                swap(arr, j - 1, j)
            }
        }
    }
}

fun swap(arr: IntArray, i: Int, j: Int) {
    val temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}
```

:::

时间复杂度 O(n²)，稳定。

## 三、选择排序

### 思想

与冒泡排序类似，都是把最小的元素放到最前面。区别在于：冒泡通过相邻比较交换，选择排序通过**对整体的选择**——先确定最小数再交换，大大减少了交换次数，可以看成冒泡的优化。

以 5, 3, 8, 6, 4 为例：选择 3 与 5 交换 → 3, 5, 8, 6, 4，对剩余序列依次选择和交换。

### 代码实现

选择排序的代码实现如下：

::: code-tabs

@tab:active Java

```java
public static void selectSort(int[] arr) {
    if (arr == null || arr.length == 0) return;
    for (int i = 0; i < arr.length - 1; i++) { // 只需比较 n-1 次
        int minIndex = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex != i) { // 找到了更小的值，交换
            swap(arr, i, minIndex);
        }
    }
}
```

@tab Kotlin

```kotlin
fun selectSort(arr: IntArray?) {
    if (arr == null || arr.isEmpty()) return
    for (i in 0 until arr.size - 1) { // 只需比较 n-1 次
        var minIndex = i
        for (j in i + 1 until arr.size) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j
            }
        }
        if (minIndex != i) { // 找到了更小的值，交换
            swap(arr, i, minIndex)
        }
    }
}
```

:::

时间复杂度 O(n²)，不稳定。

## 四、插入排序

### 思想

不是通过交换位置，而是通过比较找到合适的位置**插入元素**来达到排序目的，如同整理扑克牌：拿到一张牌，找到合适的位置插入。

以 5, 3, 8, 6, 4 为例：3 插到 5 前面（5 后移）→ 3, 5, 8, 6, 4；8 不动；6 插在 8 前面 → 3, 5, 6, 8, 4；4 从 5 开始都后移一位插入。注意插入一个数时要保证它前面的数已经有序。

### 代码实现

插入排序的代码实现如下：

::: code-tabs

@tab:active Java

```java
public static void insertSort(int[] arr) {
    if (arr == null || arr.length == 0) return;
    for (int i = 1; i < arr.length; i++) { // 假设第一个数位置正确
        int j = i;
        int target = arr[i]; // 待插入的数
        // 后移
        while (j > 0 && target < arr[j - 1]) {
            arr[j] = arr[j - 1];
            j--;
        }
        // 插入
        arr[j] = target;
    }
}
```

@tab Kotlin

```kotlin
fun insertSort(arr: IntArray?) {
    if (arr == null || arr.isEmpty()) return
    for (i in 1 until arr.size) { // 假设第一个数位置正确
        var j = i
        val target = arr[i] // 待插入的数
        // 后移
        while (j > 0 && target < arr[j - 1]) {
            arr[j] = arr[j - 1]
            j--
        }
        // 插入
        arr[j] = target
    }
}
```

:::

时间复杂度 O(n²)，稳定。对于基本有序的序列，插入排序效率很高。

## 五、快速排序

### 思想

快速排序（划分交换排序）由东尼·霍尔提出，是实际应用中表现最好的排序算法之一。本质上是分治算法：

1. **分**：设定一个分割值（基准），将数据分为两部分（比基准小的在左，比基准大的在右）。
2. **治**：分别在两部分用递归方式继续快速排序。
3. **合**：分割部分排序直到完成。

以 5, 3, 8, 6, 4 为例，用 5 作为基准：

- i、j 两个指针分别指向两端，**j 指针先扫描**（从右向左找比基准小的），4 比 5 小停止；i 扫描（从左向右找比基准大的），8 比 5 大停止，交换 → 5, 3, 4, 6, 8。
- j 再扫描，与 i 相遇，交换 4 与基准 → 4, 3, 5, 6, 8。一次划分后左边比 5 小、右边比 5 大。
- 对左右子序列递归排序。

**为什么 j 指针先动？** 取决于基准数的位置。一般选第一个数为基准（在左边），最后相遇的数要与基准交换，相遇的数必须比基准小，所以 j 先移动才能先找到比基准小的数。

### 代码实现

快速排序的代码实现如下：

::: code-tabs

@tab:active Java

```java
public int dividerAndChange(int[] args, int start, int end) {
    int pivot = args[start]; // 基准值
    while (start < end) {
        // 从右向左找比基准小的
        while (start < end && args[end] >= pivot) end--;
        if (start < end) {
            swap(args, start, end);
            start++;
        }
        // 从左向右找比基准大的
        while (start < end && args[start] < pivot) start++;
        if (start < end) {
            swap(args, end, start);
            end--;
        }
    }
    args[start] = pivot;
    return start;
}

public void sort(int[] args, int start, int end) {
    if (end - start > 1) { // 分治元素大于 1 个才有意义
        int mid = dividerAndChange(args, start, end);
        sort(args, start, mid);      // 左部分排序
        sort(args, mid + 1, end);    // 右部分排序
    }
}
```

@tab Kotlin

```kotlin
fun dividerAndChange(args: IntArray, start: Int, end: Int): Int {
    var start = start
    var end = end
    val pivot = args[start] // 基准值
    while (start < end) {
        // 从右向左找比基准小的
        while (start < end && args[end] >= pivot) end--
        if (start < end) {
            swap(args, start, end)
            start++
        }
        // 从左向右找比基准大的
        while (start < end && args[start] < pivot) start++
        if (start < end) {
            swap(args, end, start)
            end--
        }
    }
    args[start] = pivot
    return start
}

fun sort(args: IntArray, start: Int, end: Int) {
    if (end - start > 1) { // 分治元素大于 1 个才有意义
        val mid = dividerAndChange(args, start, end)
        sort(args, start, mid)      // 左部分排序
        sort(args, mid + 1, end)    // 右部分排序
    }
}
```

:::

平均时间复杂度 O(nlogn)，最坏 O(n²)（如已有序序列），不稳定。

## 六、归并排序

### 思想

归并排序基于归并操作，由冯·诺伊曼于 1945 年提出，是分治法的典型应用，效率为 O(nlogn)，且各层分治递归可以同时进行。

1. 申请空间，大小为两个已排序序列之和，存放合并后的序列。
2. 设定两个指针，初始位置分别为两个已排序序列的起始位置。
3. 比较两个指针指向的元素，选择较小的放入合并空间，并移动指针到下一位置。
4. 重复步骤 3 直到某一指针到达序列尾。
5. 将另一序列剩下的所有元素直接复制到合并序列尾。

### 代码实现

归并排序的代码实现如下：

::: code-tabs

@tab:active Java

```java
public void mergeSort(int[] ints, int[] merge, int start, int end) {
    if (start >= end) return;
    int mid = (end + start) >> 1;
    mergeSort(ints, merge, start, mid);
    mergeSort(ints, merge, mid + 1, end);
    merge(ints, merge, start, end, mid);
}

private void merge(int[] a, int[] merge, int start, int end, int mid) {
    int i = start;
    int j = mid + 1;
    int pos = start;
    while (i <= mid || j <= end) {
        if (i > mid) {
            while (j <= end) merge[pos++] = a[j++];
            break;
        }
        if (j > end) {
            while (i <= mid) merge[pos++] = a[i++];
            break;
        }
        merge[pos++] = a[i] >= a[j] ? a[j++] : a[i++];
    }
    for (pos = start; pos <= end; pos++) {
        a[pos] = merge[pos];
    }
}
```

@tab Kotlin

```kotlin
fun mergeSort(ints: IntArray, merge: IntArray, start: Int, end: Int) {
    if (start >= end) return
    val mid = (end + start) shr 1
    mergeSort(ints, merge, start, mid)
    mergeSort(ints, merge, mid + 1, end)
    merge(ints, merge, start, end, mid)
}

private fun merge(a: IntArray, merge: IntArray, start: Int, end: Int, mid: Int) {
    var i = start
    var j = mid + 1
    var pos = start
    while (i <= mid || j <= end) {
        if (i > mid) {
            while (j <= end) merge[pos++] = a[j++]
            break
        }
        if (j > end) {
            while (i <= mid) merge[pos++] = a[i++]
            break
        }
        merge[pos++] = if (a[i] >= a[j]) a[j++] else a[i++]
    }
    for (p in start..end) {
        a[p] = merge[p]
    }
}
```

:::

时间复杂度 O(nlogn)（最坏也是 O(nlogn)），空间复杂度 O(n)，稳定。

## 七、其他常见排序

### 堆排序

利用堆（完全二叉树）这种数据结构进行排序。建堆后，将堆顶元素（最大或最小）与末尾元素交换，再调整剩余元素为新堆，重复 n-1 次完成排序。时间复杂度 O(nlogn)，不稳定，空间复杂度 O(1)。

### 希尔排序

插入排序的改进版，也称缩小增量排序。将序列按增量分组进行插入排序，增量逐渐减小至 1，最后一次是普通插入排序（此时序列已基本有序，插入效率高）。时间复杂度约 O(n^1.3)，不稳定。

### 基数排序

按位（个位、十位、百位……）依次进行分配和收集，需要借助桶（0-9 共 10 个）。适用于整数排序，时间复杂度 O(d(n+r))，d 为位数，稳定。

### 桶排序

将元素分到有限数量的桶中，每个桶内再排序，最后依次取出。时间复杂度 O(n+k)，稳定，适用于数据分布均匀的场景。

### 计数排序

统计每个值出现的次数，再按顺序输出。时间复杂度 O(n+k)，稳定，适用于取值范围较小的整数排序。

## 八、如何选择排序算法

不同场景下排序算法的选型建议如下：

| 场景 | 推荐算法 |
| --- | --- |
| 数据量小 | 插入排序（简单高效） |
| 数据基本有序 | 插入排序 |
| 数据量大、随机 | 快速排序（实际表现最好） |
| 要求稳定 | 归并排序 |
| 需要稳定的 O(nlogn) | 归并排序 |
| 数据量极大且分布均匀 | 桶排序、基数排序、计数排序 |
| 内存受限 | 堆排序（O(1) 空间） |

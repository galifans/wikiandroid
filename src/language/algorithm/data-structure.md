---
icon: database
title: 数据结构基础
---

# 数据结构基础

> 本章介绍最基础的数据结构：数组、栈与队列，包括各自的特性、Java 实现与适用场景，是学习算法与源码分析的基石。

## 一、数组

### 特点

- 连续内存空间存储，创建后长度固定。
- 支持随机访问，通过下标在 O(1) 时间内访问任意元素。
- 插入、删除元素需要移动后续元素，时间复杂度 O(n)。

### 创建方式

::: code-tabs

@tab:active Java

```java
int[] c = {2, 3, 6, 10, 99}; // 静态初始化
int[] d = new int[10];       // 动态初始化，默认值为 0
```

@tab Kotlin

```kotlin
val c = intArrayOf(2, 3, 6, 10, 99) // 静态初始化
val d = IntArray(10)                // 动态初始化，默认值为 0
```

:::

### 基本操作

**插入：** 将 index 后面的元素依次后移，再把新值插入 index 位置。

::: code-tabs

@tab:active Java

```java
public static int[] insert(int[] old, int value, int index) {
    for (int k = old.length - 1; k > index; k--) {
        old[k] = old[k - 1];
    }
    old[index] = value;
    return old;
}
```

@tab Kotlin

```kotlin
fun insert(old: IntArray, value: Int, index: Int): IntArray {
    for (k in old.size - 1 downTo index + 1) {
        old[k] = old[k - 1]
    }
    old[index] = value
    return old
}
```

:::

**删除：** 将后面的值依次前移，最后一位置 0。

::: code-tabs

@tab:active Java

```java
public static int[] delete(int[] old, int index) {
    for (int h = index; h < old.length - 1; h++) {
        old[h] = old[h + 1];
    }
    old[old.length - 1] = 0;
    return old;
}
```

@tab Kotlin

```kotlin
fun delete(old: IntArray, index: Int): IntArray {
    for (h in index until old.size - 1) {
        old[h] = old[h + 1]
    }
    old[old.size - 1] = 0
    return old
}
```

:::

### 封装一个 GeneralArray 类

::: code-tabs

@tab:active Java

```java
public class GeneralArray {
    private int[] a;
    private int size;   // 数组大小
    private int nElem;  // 数组中有多少项

    public GeneralArray(int max) {
        this.a = new int[max];
        this.size = max;
        this.nElem = 0;
    }

    public boolean find(int searchNum) {   // 查找某个值
        for (int j = 0; j < nElem; j++) {
            if (a[j] == searchNum) return true;
        }
        return false;
    }

    public boolean insert(int value) {     // 插入某个值
        if (nElem == size) {
            System.out.println("数组已满");
            return false;
        }
        a[nElem] = value;
        nElem++;
        return true;
    }

    public boolean delete(int value) {     // 删除某个值
        int j;
        for (j = 0; j < nElem; j++) {
            if (a[j] == value) break;
        }
        if (j == nElem) return false;
        for (int k = j; k < nElem - 1; k++) {
            a[k] = a[k + 1];
        }
        nElem--;
        return true;
    }

    public void display() {                // 打印整个数组
        for (int i = 0; i < nElem; i++) {
            System.out.println(a[i] + " ");
        }
    }
}
```

@tab Kotlin

```kotlin
class GeneralArray(max: Int) {
    private val a = IntArray(max)
    private val size = max   // 数组大小
    private var nElem = 0    // 数组中有多少项

    fun find(searchNum: Int): Boolean {   // 查找某个值
        for (j in 0 until nElem) {
            if (a[j] == searchNum) return true
        }
        return false
    }

    fun insert(value: Int): Boolean {     // 插入某个值
        if (nElem == size) {
            println("数组已满")
            return false
        }
        a[nElem] = value
        nElem++
        return true
    }

    fun delete(value: Int): Boolean {     // 删除某个值
        var j = 0
        while (j < nElem) {
            if (a[j] == value) break
            j++
        }
        if (j == nElem) return false
        for (k in j until nElem - 1) {
            a[k] = a[k + 1]
        }
        nElem--
        return true
    }

    fun display() {                       // 打印整个数组
        for (i in 0 until nElem) {
            println(a[i])
        }
    }
}
```

:::

## 二、栈

### 特点

- 只允许访问最后插入的数据项（栈顶），是一种**后进先出（LIFO）** 的数据结构。
- 基本操作：入栈（push）、出栈（pop），以及查看栈顶（peek）、判空、判满、获取大小等扩展操作。
- 基于数组实现的入栈、出栈时间复杂度均为 O(1)。

### 基于数组实现栈

::: code-tabs

@tab:active Java

```java
public class ArrayStack {
    private long[] a;
    private int size;  // 栈数组的大小
    private int top;   // 栈顶

    public ArrayStack(int maxSize) {
        this.size = maxSize;
        this.a = new long[size];
        this.top = -1; // 表示空栈
    }

    public void push(long value) {   // 入栈
        if (isFull()) {
            System.out.println("栈已满!");
            return;
        }
        a[++top] = value;
    }

    public long peek() {             // 返回栈顶内容，但不删除
        if (isEmpty()) return 0;
        return a[top];
    }

    public long pop() {              // 弹出栈顶内容
        if (isEmpty()) return 0;
        return a[top--];
    }

    public int size() {
        return top + 1;
    }

    public boolean isFull() {
        return (top == size - 1);
    }

    public boolean isEmpty() {
        return (top == -1);
    }
}
```

@tab Kotlin

```kotlin
class ArrayStack(maxSize: Int) {
    private val a = LongArray(maxSize)
    private val size = maxSize  // 栈数组的大小
    private var top = -1        // 栈顶

    fun push(value: Long) {    // 入栈
        if (isFull()) {
            println("栈已满!")
            return
        }
        a[++top] = value
    }

    fun peek(): Long {         // 返回栈顶内容，但不删除
        if (isEmpty()) return 0
        return a[top]
    }

    fun pop(): Long {          // 弹出栈顶内容
        if (isEmpty()) return 0
        return a[top--]
    }

    fun size(): Int {
        return top + 1
    }

    fun isFull(): Boolean {
        return (top == size - 1)
    }

    fun isEmpty(): Boolean {
        return (top == -1)
    }
}
```

:::

## 三、队列

### 特点

- 先进先出（FIFO）的数据结构，从队尾插入元素，从队头取出元素。
- 队列的实现可以基于数组（循环队列）或链表。

### Java 中的 Queue 接口

- `Queue` 是 Collection 的子接口，其子接口为 `Deque`（双端队列，可作队列也可作栈）。
- 插入、提取、检查操作都存在两种形式：失败时抛异常或返回特殊值。

| 操作 | 失败抛异常 | 失败返回特殊值 |
| --- | --- | --- |
| 添加 | `add(E e)` | `offer(E e)` 返回 false |
| 获取但不移除 | `element()` | `peek()` 返回 null |
| 获取并移除 | `remove()` | `poll()` 返回 null |

常用实现类：`LinkedList`（双向链表实现，也可作队列）、`PriorityQueue`（优先级队列）。

## 四、数据结构选择建议

| 场景 | 推荐结构 |
| --- | --- |
| 频繁随机访问、很少插入删除 | 数组 / ArrayList |
| 频繁插入删除 | 链表 / LinkedList |
| 后进先出的场景（如括号匹配、函数调用栈） | 栈 |
| 先进先出的场景（如任务调度、缓冲区） | 队列 |

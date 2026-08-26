---
icon: code
title: LeetCode 经典题
---

# LeetCode 经典题

> 本章收录 LeetCode 上的经典题目，包括解题思路与 Java 代码实现，帮助训练算法思维。

## 一、Two Sum（两数之和）

### 题目

给定一个整数数组和一个目标值，找出数组中和为目标值的两个数的下标（下标从 1 开始，index1 小于 index2）。假设每个输入恰好只有一个解。

示例：

```
输入: numbers = {2, 7, 11, 15}, target = 9
输出: index1 = 1, index2 = 2
```

### 解题思路

遍历数组，把"目标值减去当前数"作为 key、当前下标作为 value 存入 HashMap。当遍历到某个数时，如果它已经存在于 map 中，说明之前遇到过的数与它之和等于 target，直接返回两个下标。

时间复杂度 O(n)，空间复杂度 O(n)，用空间换时间。

### 代码实现

::: code-tabs

@tab:active Java

```java
import java.util.HashMap;

public class Solution {
    public int[] twoSum(int[] numbers, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < numbers.length; i++) {
            if (map.get(numbers[i]) != null) {
                int[] result = {map.get(numbers[i]) + 1, i + 1};
                return result;
            } else {
                map.put(target - numbers[i], i);
            }
        }
        return new int[]{};
    }
}
```

@tab Kotlin

```kotlin
import java.util.HashMap

class Solution {
    fun twoSum(numbers: IntArray, target: Int): IntArray {
        val map = HashMap<Int, Int>()
        for (i in numbers.indices) {
            val index = map[numbers[i]]
            if (index != null) {
                return intArrayOf(index + 1, i + 1)
            } else {
                map[target - numbers[i]] = i
            }
        }
        return intArrayOf()
    }
}
```

:::

### 要点

- HashMap 的查找是 O(1)，将暴力解法 O(n²) 降为 O(n)。
- 哈希表是解决"两数之和"类问题的核心思路。

## 二、ZigZag Conversion（Z 字形变换）

### 题目

将字符串按给定的行数以 Z 字形（锯齿形）排列，再按行从左到右读取，得到变换后的字符串。

示例：

```
输入: s = "PAYPALISHIRING", numRows = 3
Z 字形排列:
P   A   H   N
A P L S I I G
Y   I   R
按行读取: "PAHNAPLSIIGYIR"
```

### 解题思路

1. 用 numRows 个 StringBuilder 分别存储每一行的字符。
2. 遍历字符串，用一个方向标志控制当前字符放入哪一行：先从上到下（行号递增），到达底部后反向从下到上（行号递减），到达顶部再反向，如此往复。
3. 最后把所有行的内容按顺序拼接。

时间复杂度 O(n)，空间复杂度 O(n)。

### 代码实现

::: code-tabs

@tab:active Java

```java
public class Solution {
    public String convert(String s, int numRows) {
        if (numRows <= 1) return s;
        StringBuilder[] rows = new StringBuilder[numRows];
        for (int i = 0; i < numRows; i++) {
            rows[i] = new StringBuilder();
        }
        int row = 0;
        boolean goingDown = false;
        for (char c : s.toCharArray()) {
            rows[row].append(c);
            if (row == 0 || row == numRows - 1) {
                goingDown = !goingDown; // 到达边界转向
            }
            row += goingDown ? 1 : -1;
        }
        StringBuilder result = new StringBuilder();
        for (StringBuilder sb : rows) {
            result.append(sb);
        }
        return result.toString();
    }
}
```

@tab Kotlin

```kotlin
class Solution {
    fun convert(s: String, numRows: Int): String {
        if (numRows <= 1) return s
        val rows = Array(numRows) { StringBuilder() }
        var row = 0
        var goingDown = false
        for (c in s.toCharArray()) {
            rows[row].append(c)
            if (row == 0 || row == numRows - 1) {
                goingDown = !goingDown // 到达边界转向
            }
            row += if (goingDown) 1 else -1
        }
        val result = StringBuilder()
        for (sb in rows) {
            result.append(sb)
        }
        return result.toString()
    }
}
```

:::

### 要点

- 核心是模拟"之"字形走位，用 `goingDown` 标志控制方向。
- 边界条件：numRows 为 1 时直接返回原字符串。

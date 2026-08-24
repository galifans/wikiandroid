---
icon: briefcase
title: 剑指 Offer 精选题
---

# 剑指 Offer 精选题

> 本章精选《剑指 Offer》中的高频面试题，每题给出题目描述、解题思路与 Java 代码实现。

## 一、二维数组中的查找

### 题目

在一个二维数组中，每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。

### 解题思路

从**右上角**（或左下角）开始查找：

- 若目标值等于当前值，查找成功。
- 若目标值小于当前值，当前列都比它大，向左移动一列。
- 若目标值大于当前值，当前行都比它小，向下移动一行。

每次比较可以排除一行或一列，时间复杂度 O(行数 + 列数)。

### 代码实现

```java
public class Solution {
    public boolean find(int[][] array, int target) {
        if (array == null || array.length == 0) return false;
        int row = 0;              // 第一行
        int col = array[0].length - 1; // 最后一列（右上角）
        while (row < array.length && col >= 0) {
            if (array[row][col] == target) {
                return true;
            } else if (array[row][col] > target) {
                col--;  // 排除当前列
            } else {
                row++;  // 排除当前行
            }
        }
        return false;
    }
}
```

### 要点

- 不要从左上角开始，那样无法判断该往哪个方向走。
- 右上角 / 左下角的数字"一面大一面小"，可以唯一确定移动方向。

## 二、重建二叉树

### 题目

输入某二叉树的前序遍历和中序遍历的结果，重建出该二叉树（假设结果中不包含重复数字）。

示例：前序遍历 `{1, 2, 4, 7, 3, 5, 6, 8}`，中序遍历 `{4, 7, 2, 1, 5, 3, 8, 6}`。

### 解题思路

- 前序遍历的第一个结点是父结点。
- 在中序遍历中找到父结点，其左边是左子树的结点，右边是右子树的结点。
- 由此得到左、右子树的前序遍历和中序遍历，用同样的方法递归构建左右子树。

### 代码实现

```java
public class Solution {
    public BinaryTreeNode constructCore(int[] preorder, int[] inorder) {
        if (preorder == null || inorder == null) return null;
        if (preorder.length != inorder.length) return null;

        BinaryTreeNode root = new BinaryTreeNode();
        for (int i = 0; i < inorder.length; i++) {
            if (inorder[i] == preorder[0]) {
                root.value = inorder[i];
                root.leftNode = constructCore(
                    Arrays.copyOfRange(preorder, 1, i + 1),
                    Arrays.copyOfRange(inorder, 0, i));
                root.rightNode = constructCore(
                    Arrays.copyOfRange(preorder, i + 1, preorder.length),
                    Arrays.copyOfRange(inorder, i + 1, inorder.length));
            }
        }
        return root;
    }
}
```

## 三、旋转数组的最小数字

### 题目

把一个数组最开始的若干个元素搬到数组的末尾，称之为旋转。输入一个递增排序数组的一个旋转，输出旋转数组的最小元素。

示例：数组 `{3, 4, 5, 1, 2}` 是 `{1, 2, 3, 4, 5}` 的一个旋转，最小元素为 1。

### 解题思路

旋转后的数组可以划分为**两个有序子数组**，前面的子数组元素都大于等于后面的子数组元素，最小元素恰好是这两个子数组的分界线。

类似二分查找，用两个指针分别指向数组的第一个元素和最后一个元素：

1. 取中间元素，若中间元素大于等于第一个指针指向的元素，说明最小元素在右半部分，移动第一个指针到中间。
2. 否则说明最小元素在左半部分，移动第二个指针到中间。
3. 当两个指针相邻时，第二个指针指向的就是最小元素。

### 代码实现

```java
public class Solution {
    public int minNumberInRotateArray(int[] array) {
        if (array == null || array.length == 0) return 0;
        int left = 0;
        int right = array.length - 1;
        while (left < right) {
            int mid = (left + right) / 2;
            if (array[mid] > array[right]) {
                left = mid + 1;  // 最小值在右半部分
            } else {
                right = mid;     // 最小值在左半部分（含 mid）
            }
        }
        return array[left];
    }
}
```

## 四、合并两个排序的链表

### 题目

输入两个递增排序的链表，合并这两个链表并使新链表中的结点仍然按照递增排序。

### 解题思路

使用递归：比较两个链表头结点的值，较小的作为合并后的头结点，其 next 指向剩余部分合并的结果。

### 代码实现

```java
public class Solution {
    public ListNode merge(ListNode list1, ListNode list2) {
        if (list1 == null) return list2; // 空链表处理
        if (list2 == null) return list1;

        ListNode mergedHead = null;
        if (list1.val < list2.val) {
            mergedHead = list1;
            mergedHead.next = merge(list1.next, list2);
        } else {
            mergedHead = list2;
            mergedHead.next = merge(list1, list2.next);
        }
        return mergedHead;
    }
}
```

### 容易犯的错误

1. 写代码前没有把合并过程想清楚，最终链表中间断开或没有做到递增排序。
2. 鲁棒性问题：对特殊输入（如空链表）没有处理，程序崩溃。

## 五、数值的整数次方

### 题目

实现函数 `double power(double base, int exponent)`，求 base 的 exponent 次方，不得使用库函数，不考虑大数问题。

### 解题思路

简单的循环相乘只考虑了指数为正的情况。需要处理：

- **指数为 0**：任何数的 0 次方为 1。
- **指数为负数**：先对指数求绝对值计算，再取倒数。
- **底数为 0 且指数为负数**：对 0 求倒数无意义，需抛异常或做特殊处理。
- **0 的 0 次方**：数学上无意义，输出 0 或 1 都可以接受。

### 代码实现

```java
public class Solution {
    public double power(double base, int exponent) {
        double result = 0.0;
        if (equal(base, 0.0) && exponent < 0) {
            throw new RuntimeException("0 的负数次幂无意义");
        }
        if (exponent == 0) {
            return 1.0;
        }
        if (exponent < 0) {
            result = powerWithExponent(1.0 / base, -exponent);
        } else {
            result = powerWithExponent(base, exponent);
        }
        return result;
    }

    private double powerWithExponent(double base, int exponent) {
        double result = 1.0;
        for (int i = 1; i <= exponent; i++) {
            result = result * base;
        }
        return result;
    }

    // 判断两个 double 型数据是否相等（计算机表示小数有误差）
    private boolean equal(double num1, double num2) {
        return (num1 - num2 > -0.0000001) && (num1 - num2 < 0.0000001);
    }
}
```

### 要点

判断底数 base 是否等于 0 时，不能直接写 `base == 0`。计算机内表示小数（float 和 double）都有误差，判断两个数是否相等，只能判断它们之间的绝对值是否在一个很小的范围内。

## 六、打印 1 到最大的 n 位数

### 题目

输入数字 n，按顺序打印出从 1 到最大的 n 位十进制数。比如输入 3，则打印 1、2、3 一直到最大的 3 位数即 999。

### 解题思路

直接用循环乘 10 求最大值会有一个陷阱：**当 n 很大时（如 n = 100），int 甚至 long 都会溢出**。正确解法是使用**字符串或数组模拟数字加法**：

1. 用长度为 n 的数组表示数字。
2. 每次在最低位加 1，处理进位。
3. 最高位产生进位时说明已打印完所有 n 位数，停止。

### 代码实现

```java
public class Solution {
    public void printToMaxOfNDigits(int n) {
        if (n <= 0) return;
        char[] number = new char[n];
        Arrays.fill(number, '0');
        while (!increment(number)) {
            printNumber(number);
        }
    }

    // 加 1，返回 true 表示最高位溢出
    private boolean increment(char[] number) {
        boolean overflow = false;
        int carry = 0;
        for (int i = number.length - 1; i >= 0; i--) {
            int digit = number[i] - '0' + carry;
            if (i == number.length - 1) {
                digit++; // 最低位加 1
            }
            if (digit >= 10) {
                if (i == 0) {
                    overflow = true; // 最高位进位，溢出
                } else {
                    digit -= 10;
                    carry = 1;
                    number[i] = (char) ('0' + digit);
                }
            } else {
                number[i] = (char) ('0' + digit);
                break;
            }
        }
        return overflow;
    }

    private void printNumber(char[] number) {
        boolean isBeginning = true;
        for (char c : number) {
            if (isBeginning && c != '0') {
                isBeginning = false;
            }
            if (!isBeginning) {
                System.out.print(c);
            }
        }
        System.out.println();
    }
}
```

## 七、扑克牌的顺子

### 题目

从扑克牌中随机抽 5 张牌，判断是不是顺子，即这 5 张牌是不是连续的。2-10 为数字本身，A 为 1，J 为 11，Q 为 12，K 为 13，大小王可以看成任意数字。

### 解题思路

把 5 张牌看成 5 个数字组成的数组，大小王定义为 0 以便区分：

1. 把数组排序。
2. 统计数组中 0 的个数。
3. 统计排序后数组中相邻数字之间的空缺总数。
4. 若空缺总数小于等于 0 的个数，则数组连续（是顺子），否则不连续。
5. 若数组中非 0 数字重复出现（对子），则不可能是顺子。

### 代码实现

```java
import java.util.Arrays;

public class Solution {
    public boolean isContinuous(int[] number) {
        if (number == null) return false;
        Arrays.sort(number);
        int numberZero = 0;
        int numberGap = 0;
        // 计算数组中 0 的个数
        for (int i = 0; i < number.length && number[i] == 0; i++) {
            numberZero++;
        }
        // 统计数组中的间隔数目
        int small = numberZero;
        int big = small + 1;
        while (big < number.length) {
            // 两个数相等，有对子，不可能是顺子
            if (number[small] == number[big]) {
                return false;
            }
            numberGap += number[big] - number[small] - 1;
            small = big;
            big++;
        }
        return numberGap <= numberZero;
    }
}
```

## 八、圆圈中最后剩下的数字（约瑟夫环）

### 题目

0, 1, ..., n-1 这 n 个数字排成一个圆圈，从数字 0 开始每次从这个圆圈里删除第 m 个数字。求这个圆圈里剩下的最后一个数字。

### 解题思路

**解法一（模拟）：** 创建总共有 n 个结点的环形链表，每次删除第 m 个结点。每删除一个数字需要 m 步运算，共 n 个数字，时间复杂度 O(mn)，空间复杂度 O(n)。

**解法二（数学推导）：** 定义 `f(n, m)` 表示在 n 个数字中每次删除第 m 个数字最后剩下的数字。

第一个被删除的数字是 `(m-1) % n`，记为 k。删除 k 后剩下的 n-1 个数字重新排序并映射为 0 到 n-2 的序列，经过数学推导可得到递推公式：

$$
f(n, m) = \begin{cases} 0 & n = 1 \\ [f(n-1, m) + m] \% n & n > 1 \end{cases}
$$

### 代码实现

```java
public class Solution {
    public static int lastRemaining(int n, int m) {
        if (n < 1 || m < 1) {
            return -1;
        }
        int last = 0; // n = 1 时最后剩下的数字是 0
        for (int i = 2; i <= n; i++) {
            last = (last + m) % i;
        }
        return last;
    }
}
```

时间复杂度 O(n)，空间复杂度 O(1)，相比链表模拟大幅优化。

## 九、相关阅读

- 单例模式的七种实现方式详见 [设计模式 - 单例模式](../design-pattern/单例模式.md)

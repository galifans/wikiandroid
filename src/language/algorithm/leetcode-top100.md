---
icon: algorithm
title: LeetCode 高频 100 题解析
description: 面试高频算法题分类精讲、双指针/滑动窗口/二分/DP/回溯模板、复杂度分析与刷题策略
---

# 🧮 LeetCode 高频 100 题解析

> 面试高频指数：⭐⭐⭐⭐⭐
> 算法题是技术面试的敲门砖，掌握模板 + 高频题 = 事半功倍。

## 1. 刷题策略

```text
① 按专题刷（数组 → 链表 → 树 → 图 → DP → 回溯）
② 每类题掌握 1-2 个模板
③ 先暴力解，再优化（时间/空间复杂度分析）
④ 一题多解，理解不同解法的 trade-off
⑤ 定期复习（遗忘曲线）

专题优先级（按面试频率）：
哈希表 > 数组 > 链表 > 二叉树 > 字符串 > DP > 栈/队列 > 贪心 > 回溯 > 图
```

## 2. 高频题型模板

### 2.1 双指针

```kotlin
// 模板：快慢指针 / 左右指针
// 快慢指针（判断链表环、找中点）
fun hasCycle(head: ListNode?): Boolean {
    var slow = head
    var fast = head
    while (fast?.next != null) {
        slow = slow?.next
        fast = fast.next?.next
        if (slow === fast) return true
    }
    return false
}

// 左右指针（有序数组两数之和）
fun twoSum(nums: IntArray, target: Int): IntArray {
    var left = 0
    var right = nums.size - 1
    while (left < right) {
        val sum = nums[left] + nums[right]
        when {
            sum < target -> left++
            sum > target -> right--
            else -> return intArrayOf(nums[left], nums[right])
        }
    }
    return intArrayOf()
}
```

**高频题**：两数之和、三数之和、盛最多水的容器、判断回文串、环形链表。

### 2.2 滑动窗口

```kotlin
// 模板：固定/可变窗口
fun lengthOfLongestSubstring(s: String): Int {
    val set = mutableSetOf<Char>()
    var left = 0
    var maxLen = 0
    for (right in s.indices) {
        // 右指针扩张，出现重复时收缩左指针
        while (s[right] in set) {
            set.remove(s[left])
            left++
        }
        set.add(s[right])
        maxLen = maxOf(maxLen, right - left + 1)
    }
    return maxLen
}
```

**高频题**：无重复字符的最长子串、最小覆盖子串、字符串排列、滑动窗口最大值。

### 2.3 二分查找

```kotlin
// 模板：标准二分（左闭右闭）
fun binarySearch(nums: IntArray, target: Int): Int {
    var left = 0
    var right = nums.size - 1
    while (left <= right) {
        val mid = left + (right - left) / 2   // 防溢出
        when {
            nums[mid] < target -> left = mid + 1
            nums[mid] > target -> right = mid - 1
            else -> return mid
        }
    }
    return -1
}
```

**高频题**：搜索旋转排序数组、寻找峰值、x 的平方根、在排序数组中查找元素的第一个和最后一个位置。

### 2.4 二叉树遍历

```kotlin
// 模板：前/中/后序遍历（递归）
fun inorderTraversal(root: TreeNode?): List<Int> {
    val result = mutableListOf<Int>()
    fun dfs(node: TreeNode?) {
        node ?: return
        dfs(node.left)           // 左
        result.add(node.`val`)   // 中（前序：先 add；后序：后 add）
        dfs(node.right)          // 右
    }
    dfs(root)
    return result
}

// 层次遍历（BFS）
fun levelOrder(root: TreeNode?): List<List<Int>> {
    val result = mutableListOf<List<Int>>()
    val queue = ArrayDeque<TreeNode>()
    root?.let { queue.add(it) }
    while (queue.isNotEmpty()) {
        val level = mutableListOf<Int>()
        repeat(queue.size) {
            val node = queue.removeFirst()
            level.add(node.`val`)
            node.left?.let { queue.add(it) }
            node.right?.let { queue.add(it) }
        }
        result.add(level)
    }
    return result
}
```

**高频题**：二叉树的最大深度、翻转二叉树、验证二叉搜索树、二叉树的最近公共祖先、路径总和。

### 2.5 动态规划

```kotlin
// 模板：五步法
// ① 定义 dp 数组含义
// ② 确定递推公式
// ③ 初始化
// ④ 遍历顺序
// ⑤ 举例验证

// 爬楼梯：dp[i] = dp[i-1] + dp[i-2]
fun climbStairs(n: Int): Int {
    if (n <= 2) return n
    var prev = 1
    var curr = 2
    for (i in 3..n) {
        val next = prev + curr
        prev = curr
        curr = next
    }
    return curr
}

// 最长公共子序列
fun longestCommonSubsequence(text1: String, text2: String): Int {
    val m = text1.length
    val n = text2.length
    val dp = Array(m + 1) { IntArray(n + 1) }
    for (i in 1..m) {
        for (j in 1..n) {
            dp[i][j] = if (text1[i - 1] == text2[j - 1]) {
                dp[i - 1][j - 1] + 1
            } else {
                maxOf(dp[i - 1][j], dp[i][j - 1])
            }
        }
    }
    return dp[m][n]
}
```

**高频题**：爬楼梯、打家劫舍、最大子数组和、最长递增子序列、编辑距离、零钱兑换、背包问题。

### 2.6 回溯

```kotlin
// 模板：选择 → 递归 → 撤销
fun subsets(nums: IntArray): List<List<Int>> {
    val result = mutableListOf<List<Int>>()
    fun backtrack(start: Int, path: MutableList<Int>) {
        result.add(path.toList())          // 收集结果
        for (i in start until nums.size) {
            path.add(nums[i])              // 选择
            backtrack(i + 1, path)         // 递归
            path.removeAt(path.size - 1)   // 撤销
        }
    }
    backtrack(0, mutableListOf())
    return result
}
```

**高频题**：全排列、子集、组合总和、括号生成、岛屿数量（DFS）、单词搜索。

## 3. 复杂度速查

| 算法 | 时间复杂度 | 空间复杂度 |
| --- | --- | --- |
| 双指针 | O(n) | O(1) |
| 滑动窗口 | O(n) | O(k) |
| 二分查找 | O(log n) | O(1) |
| 二叉树遍历 | O(n) | O(h) |
| 快速排序 | O(n log n) | O(log n) |
| 归并排序 | O(n log n) | O(n) |
| 动态规划 | O(n²) 常见 | O(n²) / O(n) |

## 4. 高频面试题

**Q1：如何刷题效率最高？**
A：按专题 + 模板化 + 及时复习。先掌握每种数据结构的模板（遍历、查找、
DP 五步），再刷高频题巩固，最后限时模拟面试（15-20 分钟/题）。

**Q2：算法题如何分析复杂度？**
A：看循环层数（一层 O(n)、嵌套 O(n²)）、递归深度（树高度 O(h)）、
每层操作（合并 O(n) → 归并 O(n log n)）。空间复杂度看额外数据结构
与递归栈。

**Q3：什么时候用 DP 什么时候用回溯？**
A：有重叠子问题 + 最优子结构 → DP（自底向上，可递推）；需要枚举所有
解 → 回溯（自顶向下，带剪枝）。DP 求最值/计数，回溯求具体方案。

**Q4：DFS 和 BFS 怎么选？**
A：BFS 适合最短路径（层层推进）；DFS 适合连通性、路径枚举（配合回溯）。
空间上：BFS 存队列（可能大），DFS 存栈/递归（树高）。

**Q5：刷题资源推荐？**
A：LeetCode 题库（Hot 100、剑指 Offer）、CodeTop（高频公司题）、
labuladong 算法小抄（模板化讲解）、力扣精选练习计划。

## 5. 小结

- 六类模板：双指针、滑动窗口、二分、树遍历、DP、回溯。
- 先模板后刷题，一题多解。
- 复杂度分析是基本功（时间 + 空间）。
- Hot 100 + 剑指 Offer 覆盖 90% 面试算法题。

---
icon: algorithm
title: LeetCode 高频 100 题解析
description: 力扣热题 HOT 100 全收录（Java 题解）：哈希、双指针、滑动窗口、栈、链表、二叉树、图、回溯、贪心、动态规划分类精讲，含模板速查与复杂度分析
---

# LeetCode 高频 100 题解析

> 面试高频指数：极高
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

## 2. 模板速查（开刷前先读）

高频面试算法不外乎下面十类模板，每一类在 3.x 对应分类中都有若干可直接套用的题解。建议先把这张表读熟，再带着模板去刷题：

| 模板 | 适用场景 | 核心骨架 | 代表题（力扣题号） |
| --- | --- | --- | --- |
| 哈希表 | 两数之和、去重、计数、前缀和 | 遍历时查表，空间换时间 | 1、49、128、560 |
| 双指针 | 有序数组、链表环、原地分区 | 快慢指针 / 左右夹逼 | 11、15、42、283 |
| 滑动窗口 | 连续子串 / 子数组最值 | 右扩左收，维护窗口状态 | 3、76、239、438 |
| 二分查找 | 有序 / 旋转有序数组定位 | 左闭右闭，mid 防溢出 | 4、33、34、287 |
| 单调栈 | 下一个更大 / 更小元素、柱状图 | 栈存下标，遇逆序结算 | 84、85、739 |
| 链表双指针 | 找环、找中点、回文 | 快慢指针 + 反转 | 141、142、234 |
| 二叉树 DFS/BFS | 遍历、路径、序列化 | 递归三序 / 队列层序 | 94、102、104、297 |
| 回溯 | 组合、排列、子集、棋盘搜索 | 选择 → 递归 → 撤销，剪枝 | 39、46、78、79 |
| 动态规划 | 重叠子问题的最值 / 计数 | 定义 → 转移 → 初始化 → 遍历序 | 53、70、72、322 |
| 位运算 | 成对抵消、去重、汉明距离 | 异或 / 移位 | 136、461 |

> 刷题建议：每题先独立思考 15 分钟再参考答案；写完对照复杂度能否再优化；卡住的题标记进复习清单，隔天与一周后各二刷一遍。

## 3. 力扣 HOT 100 题解（Java 实现）

以下 100 题取自力扣官方题单「热题 HOT 100」，是各家大厂面试中出现频率最高的一批题目，按考点分为 14 个分类。每题按「题意 → 思路 → 代码」精简讲解：一句话说清题目在做什么，给出关键思路与复杂度，最后是可运行的 Java 实现。

**阅读约定**

- 代码按力扣环境书写：`Solution` 类与题目的方法签名一致，默认已引入 `java.util.*`；
- 链表 `ListNode`、二叉树 `TreeNode` 与力扣内置定义一致，视为已在后台提供；
- 按 Java 主语言约定，每题只提供 Java 版本代码，代码块中置灰的 Kotlin 页签属预期设计（表示仅提供 Java 写法）；
- 题号对应力扣题目编号，可直接在力扣站内搜索跳转。

**题单总览**

| 分类 | 题数 | 题号 |
| --- | --- | --- |
| 3.1 哈希 | 3 | 1、49、128 |
| 3.2 双指针 | 5 | 11、15、42、75、283 |
| 3.3 滑动窗口 | 4 | 3、76、239、438 |
| 3.4 栈与单调栈 | 7 | 20、32、84、85、155、394、739 |
| 3.5 链表 | 11 | 2、19、21、23、141、142、146、148、160、206、234 |
| 3.6 二叉树 | 17 | 94、96、98、101、102、104、105、114、124、226、236、297、337、437、538、543、617 |
| 3.7 图论 | 3 | 200、207、399 |
| 3.8 回溯 | 8 | 17、22、39、46、78、79、301、494 |
| 3.9 贪心 | 4 | 55、406、621、763 |
| 3.10 矩阵 | 2 | 48、240 |
| 3.11 普通数组 | 6 | 31、56、169、238、448、581 |
| 3.12 二分查找 | 4 | 4、33、34、287 |
| 3.13 动态规划 | 20 | 5、10、53、62、64、70、72、121、139、152、198、221、279、300、309、312、322、338、416、647 |
| 3.14 技巧 | 6 | 136、208、215、347、461、560 |

> 建议顺序：先刷「普通数组 → 哈希 → 双指针 → 滑动窗口」建立线性结构手感；再攻「链表 → 二叉树 → 栈」掌握结构类题目；最后集中啃「动态规划」与「图论」。每完成一类，回到速查表复盘模板是否内化。

### 3.1 哈希（3 题）

哈希表以 O(1) 完成查重、计数与下标映射，是空间换时间的代表。本节题目：两数之和、字母异位词分组、最长连续序列。

#### 两数之和（LeetCode 1 · 简单）

给定整数数组 `nums` 与目标值 `target`，返回和为目标值的两个数的下标（同一元素不能重复使用）。一遍遍历，用哈希表记录「值 → 下标」：对每个 `nums[i]` 检查 `target - nums[i]` 是否已在表中，命中即返回两个下标，未命中则把自己写入表。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (map.containsKey(need)) {
                return new int[]{map.get(need), i};
            }
            map.put(nums[i], i);
        }
        return new int[0]; // 题目保证有解，此行仅为编译兜底
    }
}
```

@tab Kotlin

:::

#### 字母异位词分组（LeetCode 49 · 中等）

给定字符串数组，把「字母相同、排列不同」的字符串分到同一组。互为异位词的字符串排序后完全相同，因此用「排序结果」作为哈希 key 即可完成分组。时间 O(n·k·log k)（k 为字符串平均长度），空间 O(n·k)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] ca = s.toCharArray();
            Arrays.sort(ca);
            String key = new String(ca); // 排序结果作为分组 key
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}
```

@tab Kotlin

:::

#### 最长连续序列（LeetCode 128 · 中等）

在未排序数组中找出数字连续的最长序列长度，要求 O(n)。把全部元素放入哈希集合，然后只对「不存在前驱 `num - 1`」的数向后累计长度，保证每个数只被统计一次。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) set.add(x);
        int best = 0;
        for (int x : set) {
            if (set.contains(x - 1)) continue; // 只从连续段的起点开始统计
            int len = 1;
            while (set.contains(x + len)) len++;
            best = Math.max(best, len);
        }
        return best;
    }
}
```

@tab Kotlin

:::

### 3.2 双指针（5 题）

一快一慢或一左一右，把 O(n²) 暴力优化为 O(n) 遍历。本节题目：移动零、盛最多水的容器、三数之和、接雨水、颜色分类。

#### 移动零（LeetCode 283 · 简单）

把数组中的 0 全部移到末尾，同时保持非零元素的相对顺序。慢指针之前全部是非零元素；快指针遍历，遇到非零就与慢指针处交换并前移慢指针。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int slow = 0; // slow 之前的元素均已归位为非零
        for (int fast = 0; fast < nums.length; fast++) {
            if (nums[fast] != 0) {
                int t = nums[slow];
                nums[slow] = nums[fast];
                nums[fast] = t;
                slow++;
            }
        }
    }
}
```

@tab Kotlin

:::

#### 盛最多水的容器（LeetCode 11 · 中等）

竖线数组中选两条线与 x 轴围成容器，求能盛水的最大面积。左右指针从两端向中间收拢：面积由「短板高度 × 宽度」决定，每次移动较短的一侧，宽度减小但短板可能变高。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1, ans = 0;
        while (left < right) {
            int h = Math.min(height[left], height[right]);
            ans = Math.max(ans, h * (right - left));
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return ans;
    }
}
```

@tab Kotlin

:::

#### 三数之和（LeetCode 15 · 中等）

找出数组中所有和为 0 且不重复的三元组。先排序，固定第一个数，再对剩余区间用左右指针夹逼找两数之和，靠「跳过相同值」保证结果不重复。时间 O(n²)，空间 O(log n)（排序栈开销）。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue; // 第一个数去重
            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return res;
    }
}
```

@tab Kotlin

:::

#### 接雨水（LeetCode 42 · 困难）

求柱状图能接住的雨水总量。每个位置可接水量 = min（左侧最高，右侧最高）- 自身高度。左右双指针各维护已见最高值，哪边矮就先结算哪边，因为那一侧的水位已确定。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, ans = 0;
        while (left < right) {
            leftMax = Math.max(leftMax, height[left]);
            rightMax = Math.max(rightMax, height[right]);
            if (leftMax < rightMax) {
                ans += leftMax - height[left]; // 左侧水位已确定
                left++;
            } else {
                ans += rightMax - height[right]; // 右侧水位已确定
                right--;
            }
        }
        return ans;
    }
}
```

@tab Kotlin

:::

#### 颜色分类（LeetCode 75 · 中等）

原地对只含 0、1、2 的数组排序（荷兰国旗问题）。三指针：`p0` 负责把 0 换到左边，`p2` 负责把 2 换到右边，中间指针 `i` 顺序扫描。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public void sortColors(int[] nums) {
        int p0 = 0, p2 = nums.length - 1, i = 0;
        while (i <= p2) {
            if (nums[i] == 0) {
                swap(nums, i, p0);
                p0++;
                i++;
            } else if (nums[i] == 2) {
                swap(nums, i, p2);
                p2--; // 换回的可能仍是 2，因此 i 不自增
            } else {
                i++;
            }
        }
    }

    private void swap(int[] nums, int a, int b) {
        int t = nums[a];
        nums[a] = nums[b];
        nums[b] = t;
    }
}
```

@tab Kotlin

:::

### 3.3 滑动窗口（4 题）

窗口问题统一套路：右指针扩张直到满足条件，再收缩左指针寻找最优。本节题目：无重复字符的最长子串、最小覆盖子串、滑动窗口最大值、找到字符串中所有字母异位词。

#### 无重复字符的最长子串（LeetCode 3 · 中等）

给定字符串，求不含重复字符的最长子串长度。滑动窗口 + 哈希集合：右指针扩张，遇到重复字符就移动左指针直到窗口内无重复，过程中维护最大长度。时间 O(n)，空间 O(字符集大小)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> set = new HashSet<>();
        int left = 0, ans = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            while (set.contains(c)) {
                set.remove(s.charAt(left));
                left++;
            }
            set.add(c);
            ans = Math.max(ans, right - left + 1);
        }
        return ans;
    }
}
```

@tab Kotlin

:::

#### 最小覆盖子串（LeetCode 76 · 困难）

在 `s` 中找到包含 `t` 全部字符（含数量）的最短子串。滑动窗口 + 欠账计数：`missing` 记录还缺几个字符，右指针扩张使 `missing` 归零，再收缩左指针找最短的可行窗口。时间 O(n)，空间 O(字符集大小)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public String minWindow(String s, String t) {
        Map<Character, Integer> need = new HashMap<>();
        for (char c : t.toCharArray()) {
            need.put(c, need.getOrDefault(c, 0) + 1);
        }
        int missing = t.length(); // 窗口还缺少的字符个数
        int start = 0, minLen = Integer.MAX_VALUE;
        int left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (need.containsKey(c)) {
                if (need.get(c) > 0) missing--;
                need.put(c, need.get(c) - 1);
            }
            while (missing == 0) { // 窗口已覆盖 t，尝试收缩左边界
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    start = left;
                }
                char lc = s.charAt(left);
                if (need.containsKey(lc)) {
                    if (need.get(lc) == 0) missing++;
                    need.put(lc, need.get(lc) + 1);
                }
                left++;
            }
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
    }
}
```

@tab Kotlin

:::

#### 滑动窗口最大值（LeetCode 239 · 困难）

求每个长度为 k 的滑动窗口中的最大值。维护单调递减的双端队列（存下标）：入队前弹出所有比新元素小的队尾；队头始终是窗口最大值，下标过期（`<= i - k`）时出队。时间 O(n)，空间 O(k)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] res = new int[n - k + 1];
        Deque<Integer> deque = new ArrayDeque<>(); // 存下标，值单调递减
        for (int i = 0; i < n; i++) {
            while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);
            if (deque.peekFirst() <= i - k) deque.pollFirst(); // 移出窗口
            if (i >= k - 1) res[i - k + 1] = nums[deque.peekFirst()];
        }
        return res;
    }
}
```

@tab Kotlin

:::

#### 找到字符串中所有字母异位词（LeetCode 438 · 中等）

返回 `p` 的所有字母异位词在 `s` 中出现的起始下标。固定长度 k 的滑动窗口配合 26 字母计数数组，每次滑动只增删窗口两端各一个字符的计数，与 `p` 的计数相等即为命中。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> res = new ArrayList<>();
        if (s.length() < p.length()) return res;
        int[] pc = new int[26];
        int[] sc = new int[26];
        for (char c : p.toCharArray()) pc[c - 'a']++;
        int k = p.length();
        for (int i = 0; i < s.length(); i++) {
            sc[s.charAt(i) - 'a']++;
            if (i >= k) sc[s.charAt(i - k) - 'a']--; // 窗口移出旧字符
            if (Arrays.equals(sc, pc)) res.add(i - k + 1);
        }
        return res;
    }
}
```

@tab Kotlin

:::

### 3.4 栈与单调栈（7 题）

栈擅长处理「最近相关性」；单调栈用于高效求解下一个更大 / 更小元素。本节题目：有效的括号、最长有效括号、柱状图中最大的矩形、最大矩形、最小栈、字符串解码、每日温度。

#### 有效的括号（LeetCode 20 · 简单）

判断括号字符串是否有效：左括号必须用同类型右括号闭合，且顺序正确。遇到左括号入栈，遇到右括号与栈顶比对，不匹配或栈为空即为无效。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == ']' && top != '[') return false;
                if (c == '}' && top != '{') return false;
            }
        }
        return stack.isEmpty();
    }
}
```

@tab Kotlin

:::

#### 最长有效括号（LeetCode 32 · 困难）

给定只含 `(` 与 `)` 的字符串，求最长有效括号子串的长度。用 `dp[i]` 表示以 `s[i]` 结尾的最长有效长度：`s[i] == ')'` 时，若前一个是 `(` 则 `dp[i] = dp[i-2] + 2`；若 `s[i-1]` 也是 `)` 且能向前找到匹配的 `(`，则把中间已匹配段与之前的有效段拼接。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int longestValidParentheses(String s) {
        int n = s.length(), ans = 0;
        int[] dp = new int[n];
        for (int i = 1; i < n; i++) {
            if (s.charAt(i) == ')') {
                if (s.charAt(i - 1) == '(') {
                    dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;
                } else if (i - dp[i - 1] > 0
                        && s.charAt(i - dp[i - 1] - 1) == '(') {
                    dp[i] = dp[i - 1] + 2
                            + (i - dp[i - 1] >= 2 ? dp[i - dp[i - 1] - 2] : 0);
                }
                ans = Math.max(ans, dp[i]);
            }
        }
        return ans;
    }
}
```

@tab Kotlin

:::

#### 柱状图中最大的矩形（LeetCode 84 · 困难）

求柱状图中能勾勒出的最大矩形面积。用单调递增栈存下标：遇到比栈顶矮的柱子就弹出栈顶并结算——以它为高，左右边界分别是栈内下一个元素与当前柱子，宽度即两者之间。末尾补高度 0 的哨兵强制全部结算。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length, ans = 0;
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i <= n; i++) {
            int h = (i == n) ? 0 : heights[i]; // 末尾哨兵
            while (!stack.isEmpty() && heights[stack.peek()] > h) {
                int top = stack.pop();
                int left = stack.isEmpty() ? -1 : stack.peek();
                ans = Math.max(ans, heights[top] * (i - left - 1));
            }
            stack.push(i);
        }
        return ans;
    }
}
```

@tab Kotlin

:::

#### 最大矩形（LeetCode 85 · 困难）

二进制矩阵中找到只含 1 的最大矩形面积。逐行把矩阵看成柱状图：`heights[j]` 表示第 `j` 列从当前行向上连续的 1 的个数，对每一行调用 84 题的单调栈解法。时间 O(m·n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int maximalRectangle(char[][] matrix) {
        if (matrix.length == 0 || matrix[0].length == 0) return 0;
        int m = matrix.length, n = matrix[0].length, ans = 0;
        int[] heights = new int[n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                heights[j] = matrix[i][j] == '1' ? heights[j] + 1 : 0;
            }
            ans = Math.max(ans, largestRect(heights));
        }
        return ans;
    }

    private int largestRect(int[] heights) {
        int n = heights.length, ans = 0;
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i <= n; i++) {
            int h = (i == n) ? 0 : heights[i];
            while (!stack.isEmpty() && heights[stack.peek()] > h) {
                int top = stack.pop();
                int left = stack.isEmpty() ? -1 : stack.peek();
                ans = Math.max(ans, heights[top] * (i - left - 1));
            }
            stack.push(i);
        }
        return ans;
    }
}
```

@tab Kotlin

:::

#### 最小栈（LeetCode 155 · 中等）

设计一个栈，支持在常数时间内获取栈中最小元素。用辅助栈与主栈同步：入栈时把「当前元素与辅助栈顶的较小者」压入辅助栈，这样两栈栈顶始终一一对应。时间 O(1)（各操作），空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class MinStack {
    private Deque<Integer> stack = new ArrayDeque<>();
    private Deque<Integer> minStack = new ArrayDeque<>();

    public void push(int val) {
        stack.push(val);
        minStack.push(minStack.isEmpty() ? val : Math.min(minStack.peek(), val));
    }

    public void pop() {
        stack.pop();
        minStack.pop();
    }

    public int top() {
        return stack.peek();
    }

    public int getMin() {
        return minStack.peek();
    }
}
```

@tab Kotlin

:::

#### 字符串解码（LeetCode 394 · 中等）

按规则解码字符串，如 `3[a2[c]]` 解码为 `accaccacc`。用两个栈：数字栈存重复次数，字符串栈存进入当前层之前的已拼结果；遇到 `]` 弹出并重复拼接。时间 O(输出长度)，空间 O(输出长度)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public String decodeString(String s) {
        Deque<Integer> numStack = new ArrayDeque<>();
        Deque<StringBuilder> strStack = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder();
        int k = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) {
                k = k * 10 + (c - '0');
            } else if (c == '[') {
                numStack.push(k);
                k = 0;
                strStack.push(cur);
                cur = new StringBuilder();
            } else if (c == ']') {
                int repeat = numStack.pop();
                StringBuilder prev = strStack.pop();
                for (int i = 0; i < repeat; i++) prev.append(cur);
                cur = prev;
            } else {
                cur.append(c);
            }
        }
        return cur.toString();
    }
}
```

@tab Kotlin

:::

#### 每日温度（LeetCode 739 · 中等）

给定每日温度，返回要等多少天才会出现更高温度。维护单调递减栈存下标：遍历时若当前温度高于栈顶温度，即可结算栈顶的「等待天数」。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] ans = new int[n];
        Deque<Integer> stack = new ArrayDeque<>(); // 存下标，温度递减
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty()
                    && temperatures[i] > temperatures[stack.peek()]) {
                int idx = stack.pop();
                ans[idx] = i - idx;
            }
            stack.push(i);
        }
        return ans;
    }
}
```

@tab Kotlin

:::

### 3.5 链表（11 题）

链表通用技巧：哑节点 `dummy` 统一边界、快慢指针找环与中点、迭代 / 递归反转。本节题目：两数相加、删除链表的倒数第 N 个结点、合并两个有序链表、合并 K 个升序链表、环形链表、环形链表 II、LRU 缓存、排序链表、相交链表、反转链表、回文链表。

#### 两数相加（LeetCode 2 · 中等）

两个非空链表表示两个非负整数（逆序存储），求和并返回同样形式的链表。从头同步遍历两链表，维护进位 `carry`，用哑节点串联结果。时间 O(max(m, n))，空间 O(1)（不计输出）。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0), p = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int sum = carry;
            if (l1 != null) {
                sum += l1.val;
                l1 = l1.next;
            }
            if (l2 != null) {
                sum += l2.val;
                l2 = l2.next;
            }
            p.next = new ListNode(sum % 10);
            p = p.next;
            carry = sum / 10;
        }
        return dummy.next;
    }
}
```

@tab Kotlin

:::

#### 删除链表的倒数第 N 个结点（LeetCode 19 · 中等）

删除链表倒数第 N 个结点。快指针先走 N 步，随后快慢指针同步前进；快指针到末尾时，慢指针恰好停在待删结点的前驱。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head);
        ListNode fast = head;
        for (int i = 0; i < n; i++) fast = fast.next;
        ListNode slow = dummy;
        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }
        slow.next = slow.next.next; // 跳过待删结点
        return dummy.next;
    }
}
```

@tab Kotlin

:::

#### 合并两个有序链表（LeetCode 21 · 简单）

合并两个升序链表为一个新升序链表。哑节点 + 双指针：每次把较小结点接到结果链上，最后把剩余部分整体接上。时间 O(n + m)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0), p = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                p.next = l1;
                l1 = l1.next;
            } else {
                p.next = l2;
                l2 = l2.next;
            }
            p = p.next;
        }
        p.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }
}
```

@tab Kotlin

:::

#### 合并 K 个升序链表（LeetCode 23 · 困难）

合并 K 个升序链表。把所有链表头放入小顶堆，每次弹出最小结点接到结果链上，并把它的后继入堆，重复直到堆空。时间 O(n log k)，空间 O(k)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> heap = new PriorityQueue<>(
                (a, b) -> a.val - b.val);
        for (ListNode head : lists) {
            if (head != null) heap.offer(head);
        }
        ListNode dummy = new ListNode(0), p = dummy;
        while (!heap.isEmpty()) {
            ListNode node = heap.poll();
            p.next = node;
            p = p.next;
            if (node.next != null) heap.offer(node.next);
        }
        return dummy.next;
    }
}
```

@tab Kotlin

:::

#### 环形链表（LeetCode 141 · 简单）

判断链表中是否有环。快指针每次走两步、慢指针走一步，若有环二者必相遇。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}
```

@tab Kotlin

:::

#### 环形链表 II（LeetCode 142 · 中等）

返回链表开始入环的第一个结点。先按 141 让快慢指针在环内相遇；此后把一个指针放回头部，两个指针同步走一步，再次相遇处即环入口（头到入口的距离等于相遇点到入口的距离）。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
public class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        boolean hasCycle = false;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                hasCycle = true;
                break;
            }
        }
        if (!hasCycle) return null;
        ListNode p = head;
        while (p != slow) {
            p = p.next;
            slow = slow.next;
        }
        return p;
    }
}
```

@tab Kotlin

:::

#### LRU 缓存（LeetCode 146 · 中等）

实现 LRU 缓存：`get` 与 `put` 都要求 O(1)，容量满时淘汰最久未使用的 key。原理是「哈希表定位 + 双向链表维护访问顺序」。Java 可继承 `LinkedHashMap` 并重写 `removeEldestEntry` 快速实现；面试推荐手写 HashMap + 双向链表。时间 O(1)，空间 O(capacity)。实现如下：

::: code-tabs

@tab:active Java

```java
class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true); // accessOrder = true 按访问排序
        this.capacity = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        super.put(key, value);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity; // 超过容量时淘汰最久未使用
    }
}
```

@tab Kotlin

:::

#### 排序链表（LeetCode 148 · 中等）

在 O(n log n) 时间、O(1) 额外空间内排序链表。用归并排序：快慢指针找到中点切分成两半，递归排序后合并。时间 O(n log n)，空间 O(log n)（递归栈）。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public ListNode sortList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode mid = slow.next;
        slow.next = null; // 断开成两半
        return merge(sortList(head), sortList(mid));
    }

    private ListNode merge(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), p = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) {
                p.next = a;
                a = a.next;
            } else {
                p.next = b;
                b = b.next;
            }
            p = p.next;
        }
        p.next = (a != null) ? a : b;
        return dummy.next;
    }
}
```

@tab Kotlin

:::

#### 相交链表（LeetCode 160 · 简单）

找到两个单链表相交的起始结点。两指针分别从两个头出发，走完本链表后换到对方链表继续走：若相交会在交点相遇，不相交则同时到达 null。时间 O(n + m)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
public class Solution {
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        ListNode pA = headA, pB = headB;
        while (pA != pB) {
            pA = (pA == null) ? headB : pA.next;
            pB = (pB == null) ? headA : pB.next;
        }
        return pA; // 不相交时二者同到 null
    }
}
```

@tab Kotlin

:::

#### 反转链表（LeetCode 206 · 简单）

反转单链表。迭代法：`prev` 记录已反转部分，逐个把当前结点的 next 指向前驱。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next; // 先保存后继
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        return prev;
    }
}
```

@tab Kotlin

:::

#### 回文链表（LeetCode 234 · 简单）

判断链表是否为回文。快慢指针找到中点，反转后半段链表，再逐一比对前半段与反转后的后半段。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode second = reverse(slow); // 反转后半段
        ListNode first = head;
        while (second != null) {
            if (first.val != second.val) return false;
            first = first.next;
            second = second.next;
        }
        return true;
    }

    private ListNode reverse(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        return prev;
    }
}
```

@tab Kotlin

:::

### 3.6 二叉树（17 题）

二叉树题几乎都是 DFS（递归）与 BFS（层序）两种套路；递归时想清楚「返回值 / 全局变量 / 参数传递」三件事即可。本节题目：二叉树的中序遍历、不同的二叉搜索树、验证二叉搜索树、对称二叉树、二叉树的层序遍历、二叉树的最大深度、从前序与中序遍历序列构造二叉树、二叉树展开为链表、二叉树中的最大路径和、翻转二叉树、二叉树的最近公共祖先、二叉树的序列化与反序列化、打家劫舍 III、路径总和 III、把二叉搜索树转换为累加树、二叉树的直径、合并二叉树。

#### 二叉树的中序遍历（LeetCode 94 · 简单）

返回二叉树的中序遍历结果。递归版最直观：左 → 根 → 右；迭代版用栈模拟。时间 O(n)，空间 O(h)（h 为树高）。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode cur = root;
        while (cur != null || !stack.isEmpty()) {
            while (cur != null) { // 一路向左
                stack.push(cur);
                cur = cur.left;
            }
            cur = stack.pop();
            res.add(cur.val);
            cur = cur.right;
        }
        return res;
    }
}
```

@tab Kotlin

:::

#### 不同的二叉搜索树（LeetCode 96 · 中等）

给定 n，求由 1 到 n 组成的二叉搜索树有多少种（卡特兰数）。`dp[i]` 表示 i 个结点能构成的 BST 数量：枚举根节点 j，左子树 j 个结点、右子树 i-1-j 个结点，累乘求和。时间 O(n²)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int numTrees(int n) {
        int[] dp = new int[n + 1];
        dp[0] = 1; // 空树也算一种
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                dp[i] += dp[j] * dp[i - 1 - j]; // 左子树 j 个，右子树 i-1-j 个
            }
        }
        return dp[n];
    }
}
```

@tab Kotlin

:::

#### 验证二叉搜索树（LeetCode 98 · 中等）

判断二叉树是否是有效的二叉搜索树。BST 中序遍历严格递增，因此用中序遍历检查相邻结点是否递增即可。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    private long prev = Long.MIN_VALUE;

    public boolean isValidBST(TreeNode root) {
        return dfs(root);
    }

    private boolean dfs(TreeNode node) {
        if (node == null) return true;
        if (!dfs(node.left)) return false;
        if (node.val <= prev) return false; // 中序必须严格递增
        prev = node.val;
        return dfs(node.right);
    }
}
```

@tab Kotlin

:::

#### 对称二叉树（LeetCode 101 · 简单）

判断二叉树是否沿中轴对称。递归比较镜像位置：`left.left` 对应 `right.right`，`left.right` 对应 `right.left`。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean isSymmetric(TreeNode root) {
        return isMirror(root.left, root.right);
    }

    private boolean isMirror(TreeNode a, TreeNode b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.val == b.val
                && isMirror(a.left, b.right)
                && isMirror(a.right, b.left);
    }
}
```

@tab Kotlin

:::

#### 二叉树的层序遍历（LeetCode 102 · 中等）

按层返回结点值。BFS 配合队列：每轮先取当前队列长度，一次性处理完一整层。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            res.add(level);
        }
        return res;
    }
}
```

@tab Kotlin

:::

#### 二叉树的最大深度（LeetCode 104 · 简单）

求二叉树最大深度。递归：`1 + max(左子树深度, 右子树深度)`。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}
```

@tab Kotlin

:::

#### 从前序与中序遍历序列构造二叉树（LeetCode 105 · 中等）

根据前序与中序遍历重建二叉树。前序第一个是根，在中序中定位根即可分出左右子树区间，递归构建；用哈希表记录中序值 → 下标以 O(1) 定位。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    private Map<Integer, Integer> inIndex = new HashMap<>();
    private int pre = 0;

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) {
            inIndex.put(inorder[i], i);
        }
        return build(preorder, 0, inorder.length - 1);
    }

    private TreeNode build(int[] preorder, int left, int right) {
        if (left > right) return null;
        int val = preorder[pre++]; // 前序逐个取根
        TreeNode node = new TreeNode(val);
        int mid = inIndex.get(val);
        node.left = build(preorder, left, mid - 1);
        node.right = build(preorder, mid + 1, right);
        return node;
    }
}
```

@tab Kotlin

:::

#### 二叉树展开为链表（LeetCode 114 · 中等）

把二叉树按先序遍历顺序原地展开为右链（左子树置空）。对每个结点：若左子树存在，找到左子树的最右结点，把当前右子树接到它后面，再把左子树整体移到右侧。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public void flatten(TreeNode root) {
        TreeNode cur = root;
        while (cur != null) {
            if (cur.left != null) {
                TreeNode pre = cur.left;
                while (pre.right != null) pre = pre.right; // 左子树最右结点
                pre.right = cur.right; // 右子树接到最右结点之后
                cur.right = cur.left;  // 左子树移到右侧
                cur.left = null;
            }
            cur = cur.right;
        }
    }
}
```

@tab Kotlin

:::

#### 二叉树中的最大路径和（LeetCode 124 · 困难）

求二叉树中任意结点到另一结点的最大路径和（路径至少一个结点，可不经过根）。递归返回「从该结点向下走能得到的最大单边和」；同时用全局变量更新「穿过该结点的完整路径和」候选。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    private int best = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        dfs(root);
        return best;
    }

    private int dfs(TreeNode node) {
        if (node == null) return 0;
        int left = Math.max(0, dfs(node.left));  // 负数分支不选
        int right = Math.max(0, dfs(node.right));
        best = Math.max(best, node.val + left + right); // 穿过当前结点的完整路径
        return node.val + Math.max(left, right); // 向上最多只能贡献单边
    }
}
```

@tab Kotlin

:::

#### 翻转二叉树（LeetCode 226 · 简单）

翻转二叉树（镜像）。递归交换每个结点的左右子树。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }
}
```

@tab Kotlin

:::

#### 二叉树的最近公共祖先（LeetCode 236 · 中等）

找到 p、q 的最近公共祖先。递归：若当前结点为 null 或等于 p/q 则返回自身；左右子树都非空说明当前结点即 LCA。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root; // 分居两侧
        return left != null ? left : right;
    }
}
```

@tab Kotlin

:::

#### 二叉树的序列化与反序列化（LeetCode 297 · 困难）

设计算法把二叉树序列化为字符串并可反序列化还原。用先序遍历：空结点记为 `#`，值用逗号分隔；反序列化时用队列逐个重建。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
public class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        ser(root, sb);
        return sb.toString();
    }

    private void ser(TreeNode node, StringBuilder sb) {
        if (node == null) {
            sb.append("#,");
            return;
        }
        sb.append(node.val).append(',');
        ser(node.left, sb);
        ser(node.right, sb);
    }

    public TreeNode deserialize(String data) {
        Deque<String> queue = new ArrayDeque<>(
                Arrays.asList(data.split(",")));
        return des(queue);
    }

    private TreeNode des(Deque<String> queue) {
        String s = queue.poll();
        if (s.equals("#")) return null;
        TreeNode node = new TreeNode(Integer.parseInt(s));
        node.left = des(queue);
        node.right = des(queue);
        return node;
    }
}
```

@tab Kotlin

:::

#### 打家劫舍 III（LeetCode 337 · 中等）

树形 DP：二叉树中偷不相邻结点（父子不能同时偷）的最大金额。递归返回两个值：偷当前结点的收益、不偷当前结点的收益；父结点据此组合。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int rob(TreeNode root) {
        int[] res = dfs(root); // {偷当前结点, 不偷当前结点}
        return Math.max(res[0], res[1]);
    }

    private int[] dfs(TreeNode node) {
        if (node == null) return new int[]{0, 0};
        int[] left = dfs(node.left);
        int[] right = dfs(node.right);
        int rob = node.val + left[1] + right[1];          // 偷：孩子只能不偷
        int notRob = Math.max(left[0], left[1])
                + Math.max(right[0], right[1]);           // 不偷：孩子随便
        return new int[]{rob, notRob};
    }
}
```

@tab Kotlin

:::

#### 路径总和 III（LeetCode 437 · 中等）

求二叉树中和等于 targetSum 的路径数量（路径从任意结点向下，不必经过根）。用「前缀和 + 哈希计数」：DFS 时记录根到当前结点的前缀和，查询 `cur - target` 出现次数即为以当前结点结尾的合法路径数，回溯时删除本层计数。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    private int ans = 0;

    public int pathSum(TreeNode root, int targetSum) {
        Map<Long, Integer> count = new HashMap<>();
        count.put(0L, 1); // 前缀和为 0 出现一次
        dfs(root, 0L, targetSum, count);
        return ans;
    }

    private void dfs(TreeNode node, long cur, int target,
                     Map<Long, Integer> count) {
        if (node == null) return;
        cur += node.val;
        ans += count.getOrDefault(cur - target, 0);
        count.put(cur, count.getOrDefault(cur, 0) + 1);
        dfs(node.left, cur, target, count);
        dfs(node.right, cur, target, count);
        count.put(cur, count.get(cur) - 1); // 回溯：撤销本层前缀和
    }
}
```

@tab Kotlin

:::

#### 把二叉搜索树转换为累加树（LeetCode 538 · 中等）

把 BST 每个结点的值改成「大于等于它的所有结点值之和」。BST 中序遍历递增，反过来「右 → 根 → 左」遍历递减，用累加变量边遍历边加即可。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    private int sum = 0;

    public TreeNode convertBST(TreeNode root) {
        dfs(root);
        return root;
    }

    private void dfs(TreeNode node) {
        if (node == null) return;
        dfs(node.right);          // 先访问最大的
        sum += node.val;
        node.val = sum;           // 累加值即新值
        dfs(node.left);
    }
}
```

@tab Kotlin

:::

#### 二叉树的直径（LeetCode 543 · 简单）

求任意两结点间最长路径的边数。直径必然经过某个结点，等于其左子树深度 + 右子树深度；DFS 计算深度时同步更新全局最大值。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    private int diameter = 0;

    public int diameterOfBinaryTree(TreeNode root) {
        depth(root);
        return diameter;
    }

    private int depth(TreeNode node) {
        if (node == null) return 0;
        int left = depth(node.left);
        int right = depth(node.right);
        diameter = Math.max(diameter, left + right); // 穿过当前结点
        return 1 + Math.max(left, right);
    }
}
```

@tab Kotlin

:::

#### 合并二叉树（LeetCode 617 · 简单）

两棵二叉树对应位置相加合并（结点为 null 视为 0）。递归：一方为 null 直接返回另一方，否则新建结点存两值之和并递归合并左右子树。时间 O(n)，空间 O(h)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public TreeNode mergeTrees(TreeNode root1, TreeNode root2) {
        if (root1 == null) return root2;
        if (root2 == null) return root1;
        TreeNode node = new TreeNode(root1.val + root2.val);
        node.left = mergeTrees(root1.left, root2.left);
        node.right = mergeTrees(root1.right, root2.right);
        return node;
    }
}
```

@tab Kotlin

:::

### 3.7 图论（3 题）

图论高频集中在遍历（DFS/BFS）与拓扑排序两类。本节题目：岛屿数量、课程表、除法求值。

#### 岛屿数量（LeetCode 200 · 中等）

二维网格中 `1` 表示陆地，求岛屿数量。DFS 染色法：每遇到一个未访问的陆地，岛屿数加一，并把与之相连的所有陆地在递归中标记为已访问。时间 O(m·n)，空间 O(m·n)（最坏递归深度）。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int numIslands(char[][] grid) {
        int m = grid.length, n = grid[0].length, ans = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == '1') {
                    ans++;
                    dfs(grid, i, j); // 淹没整座岛
                }
            }
        }
        return ans;
    }

    private void dfs(char[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length
                || j < 0 || j >= grid[0].length
                || grid[i][j] != '1') {
            return;
        }
        grid[i][j] = '0'; // 标记已访问
        dfs(grid, i + 1, j);
        dfs(grid, i - 1, j);
        dfs(grid, i, j + 1);
        dfs(grid, i, j - 1);
    }
}
```

@tab Kotlin

:::

#### 课程表（LeetCode 207 · 中等）

给定课程数与先修关系，判断能否完成全部课程，即判断有向图是否有环。拓扑排序（Kahn）：统计入度，入度为 0 的课程先入队，逐个出队并把后继课程入度减一；能处理的课程数等于总数则无环。时间 O(V + E)，空间 O(V + E)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        int[] indegree = new int[numCourses];
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] edge : prerequisites) {
            adj.get(edge[1]).add(edge[0]); // edge[1] → edge[0]
            indegree[edge[0]]++;
        }
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) queue.offer(i);
        }
        int done = 0;
        while (!queue.isEmpty()) {
            int u = queue.poll();
            done++;
            for (int v : adj.get(u)) {
                if (--indegree[v] == 0) queue.offer(v);
            }
        }
        return done == numCourses; // 有环则 done 小于总数
    }
}
```

@tab Kotlin

:::

#### 除法求值（LeetCode 399 · 中等）

已知若干 `a / b = value` 的关系，回答形如 `x / y` 的查询。把每个变量看成图的结点，除法看成带权有向边，查询即 DFS 求两点间的路径乘积；建无向图时反向边权取倒数。时间 O(查询数 × 边数)，空间 O(V + E)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public double[] calcEquation(List<List<String>> equations,
                                 double[] values,
                                 List<List<String>> queries) {
        Map<String, Map<String, Double>> graph = new HashMap<>();
        for (int i = 0; i < equations.size(); i++) {
            String a = equations.get(i).get(0);
            String b = equations.get(i).get(1);
            graph.computeIfAbsent(a, k -> new HashMap<>()).put(b, values[i]);
            graph.computeIfAbsent(b, k -> new HashMap<>()).put(a, 1.0 / values[i]);
        }
        double[] res = new double[queries.size()];
        for (int i = 0; i < queries.size(); i++) {
            String x = queries.get(i).get(0);
            String y = queries.get(i).get(1);
            if (!graph.containsKey(x) || !graph.containsKey(y)) {
                res[i] = -1.0;
            } else {
                res[i] = dfs(x, y, graph, new HashSet<>());
            }
        }
        return res;
    }

    private double dfs(String x, String y,
                       Map<String, Map<String, Double>> graph,
                       Set<String> seen) {
        if (x.equals(y)) return 1.0;
        seen.add(x);
        for (Map.Entry<String, Double> edge : graph.get(x).entrySet()) {
            if (!seen.contains(edge.getKey())) {
                double rest = dfs(edge.getKey(), y, graph, seen);
                if (rest > 0) return edge.getValue() * rest; // 路径乘积
            }
        }
        return -1.0; // 不可达
    }
}
```

@tab Kotlin

:::

### 3.8 回溯（8 题）

回溯 = DFS + 状态回滚，模板统一为「选择 → 递归 → 撤销」。本节题目：电话号码的字母组合、括号生成、组合总和、全排列、子集、单词搜索、删除无效的括号、目标和。

#### 电话号码的字母组合（LeetCode 17 · 中等）

数字串映射到九宫格字母，返回所有可能的字母组合。回溯：每层固定一个数字，枚举其对应字母并进入下一层。时间 O(3^m · 4^n)，空间 O(m + n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    private static final String[] MAP = {
            "", "", "abc", "def", "ghi", "jkl",
            "mno", "pqrs", "tuv", "wxyz"};

    public List<String> letterCombinations(String digits) {
        List<String> res = new ArrayList<>();
        if (digits.isEmpty()) return res;
        backtrack(digits, 0, new StringBuilder(), res);
        return res;
    }

    private void backtrack(String digits, int idx, StringBuilder path,
                           List<String> res) {
        if (idx == digits.length()) {
            res.add(path.toString());
            return;
        }
        String letters = MAP[digits.charAt(idx) - '0'];
        for (char c : letters.toCharArray()) {
            path.append(c);
            backtrack(digits, idx + 1, path, res);
            path.deleteCharAt(path.length() - 1); // 撤销
        }
    }
}
```

@tab Kotlin

:::

#### 括号生成（LeetCode 22 · 中等）

生成 n 对括号的所有合法组合。回溯时维护左右括号剩余数量，保证任意前缀左括号不少于右括号。时间 O(4^n / sqrt(n))（卡特兰数），空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> res = new ArrayList<>();
        backtrack(n, n, new StringBuilder(), res);
        return res;
    }

    private void backtrack(int left, int right, StringBuilder path,
                           List<String> res) {
        if (left == 0 && right == 0) {
            res.add(path.toString());
            return;
        }
        if (left > 0) {
            path.append('(');
            backtrack(left - 1, right, path, res);
            path.deleteCharAt(path.length() - 1);
        }
        if (right > left) { // 右括号不能超过左括号
            path.append(')');
            backtrack(left, right - 1, path, res);
            path.deleteCharAt(path.length() - 1);
        }
    }
}
```

@tab Kotlin

:::

#### 组合总和（LeetCode 39 · 中等）

无重复候选数组（可无限次选取）中找和为目标值的所有组合。回溯 + 剪枝：先排序，每层从 start 开始取数并向下递归，超过目标直接剪枝。时间 O(n^(target/min)) 量级，空间 O(target/min)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] nums, int remain, int start,
                           List<Integer> path, List<List<Integer>> res) {
        if (remain == 0) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < nums.length; i++) {
            if (nums[i] > remain) continue; // 剪枝
            path.add(nums[i]);
            backtrack(nums, remain - nums[i], i, path, res); // i 可重复选
            path.remove(path.size() - 1);
        }
    }
}
```

@tab Kotlin

:::

#### 全排列（LeetCode 46 · 中等）

不含重复数字的数组，返回所有全排列。回溯 + 访问标记：每层从没用过的数中选一个填入当前位置。时间 O(n · n!)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, new boolean[nums.length],
                new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] nums, boolean[] used, List<Integer> path,
                           List<List<Integer>> res) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, used, path, res);
            path.remove(path.size() - 1);
            used[i] = false; // 撤销标记
        }
    }
}
```

@tab Kotlin

:::

#### 子集（LeetCode 78 · 中等）

返回数组的全部子集（不重复）。回溯：每个元素「选或不选」，用 start 控制只向后取数；每层进入时先把当前路径记入结果。时间 O(n · 2^n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] nums, int start, List<Integer> path,
                           List<List<Integer>> res) {
        res.add(new ArrayList<>(path)); // 每个路径都是一个子集
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1, path, res);
            path.remove(path.size() - 1);
        }
    }
}
```

@tab Kotlin

:::

#### 单词搜索（LeetCode 79 · 中等）

在字符网格中判断是否存在路径能拼出给定单词（不能重复经过同一格）。DFS 从每个格子出发向四个方向搜索，匹配失败立即回溯，并把当前格临时标记防重复使用。时间 O(m·n·4^k)（k 为单词长度），空间 O(k)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean exist(char[][] board, String word) {
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (dfs(board, word, i, j, 0)) return true;
            }
        }
        return false;
    }

    private boolean dfs(char[][] board, String word, int i, int j, int k) {
        if (k == word.length()) return true;
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length
                || board[i][j] != word.charAt(k)) {
            return false;
        }
        char temp = board[i][j];
        board[i][j] = '#'; // 临时占用，防止重复经过
        boolean found = dfs(board, word, i + 1, j, k + 1)
                || dfs(board, word, i - 1, j, k + 1)
                || dfs(board, word, i, j + 1, k + 1)
                || dfs(board, word, i, j - 1, k + 1);
        board[i][j] = temp; // 回溯恢复
        return found;
    }
}
```

@tab Kotlin

:::

#### 删除无效的括号（LeetCode 301 · 困难）

删除最少数量的括号使字符串有效，返回所有可能结果。BFS 按层删除：每层尝试删掉一个括号生成新串（连续相同括号只删一次去重），第一次出现合法串的层即答案层。时间 O(2^n) 量级，空间 O(2^n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<String> removeInvalidParentheses(String s) {
        List<String> res = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();
        queue.offer(s);
        visited.add(s);
        boolean found = false;
        while (!queue.isEmpty() && !found) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                String cur = queue.poll();
                if (isValid(cur)) {
                    res.add(cur);
                    found = true;
                    continue;
                }
                for (int j = 0; j < cur.length(); j++) {
                    char c = cur.charAt(j);
                    if (c != '(' && c != ')') continue;
                    if (j > 0 && cur.charAt(j) == cur.charAt(j - 1)) continue; // 去重
                    String next = cur.substring(0, j) + cur.substring(j + 1);
                    if (visited.add(next)) queue.offer(next);
                }
            }
        }
        return res;
    }

    private boolean isValid(String s) {
        int balance = 0;
        for (char c : s.toCharArray()) {
            if (c == '(') balance++;
            else if (c == ')') {
                balance--;
                if (balance < 0) return false;
            }
        }
        return balance == 0;
    }
}
```

@tab Kotlin

:::

#### 目标和（LeetCode 494 · 中等）

给每个数字前添加正负号，使表达式结果等于 target，求方案数。转化为 01 背包（子集划分），或用「哈希计数」递推：每轮把加 x 与减 x 的两种结果累加。时间 O(n · sum)，空间 O(sum)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        Map<Integer, Integer> dp = new HashMap<>();
        dp.put(0, 1); // 初始：和为 0 有 1 种方式
        for (int x : nums) {
            Map<Integer, Integer> next = new HashMap<>();
            for (Map.Entry<Integer, Integer> e : dp.entrySet()) {
                next.put(e.getKey() + x,
                        next.getOrDefault(e.getKey() + x, 0) + e.getValue());
                next.put(e.getKey() - x,
                        next.getOrDefault(e.getKey() - x, 0) + e.getValue());
            }
            dp = next;
        }
        return dp.getOrDefault(target, 0);
    }
}
```

@tab Kotlin

:::

### 3.9 贪心（4 题）

贪心 = 每步取局部最优，需要先证明局部最优能推出全局最优。本节题目：跳跃游戏、根据身高重建队列、任务调度器、划分字母区间。

#### 跳跃游戏（LeetCode 55 · 中等）

判断能否从下标 0 跳到最后一个位置。贪心维护「最远可到达位置」：遍历时不断用 `i + nums[i]` 更新它，若某时刻 `i` 超过最远可达则失败。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean canJump(int[] nums) {
        int farthest = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > farthest) return false; // 到不了当前位置
            farthest = Math.max(farthest, i + nums[i]);
            if (farthest >= nums.length - 1) return true;
        }
        return true;
    }
}
```

@tab Kotlin

:::

#### 根据身高重建队列（LeetCode 406 · 中等）

给定每个人 `[h, k]`（h 身高，k 为前面不低于自己的人数），重建队列。先按身高降序、k 升序排序，然后按 k 逐个插入：高个子已就位，矮个子插入第 k 个位置不影响前面的高个子。时间 O(n²)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int[][] reconstructQueue(int[][] people) {
        Arrays.sort(people, (a, b) ->
                a[0] != b[0] ? b[0] - a[0] : a[1] - b[1]); // 身高降序，k 升序
        List<int[]> res = new ArrayList<>();
        for (int[] p : people) {
            res.add(p[1], p); // 按 k 插入
        }
        return res.toArray(new int[res.size()][]);
    }
}
```

@tab Kotlin

:::

#### 任务调度器（LeetCode 621 · 中等）

相同任务之间至少间隔 n 个单位时间，求完成所有任务的最短时间。找出出现次数最多的任务（设 max 次、共 maxCount 个），最紧凑的排法是把它先排满：总时间 = (max - 1) · (n + 1) + maxCount，若任务种类更多则取任务总数。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] count = new int[26];
        for (char c : tasks) count[c - 'A']++;
        int max = 0, maxCount = 0;
        for (int c : count) max = Math.max(max, c);
        for (int c : count) if (c == max) maxCount++;
        return Math.max(tasks.length, (max - 1) * (n + 1) + maxCount);
    }
}
```

@tab Kotlin

:::

#### 划分字母区间（LeetCode 763 · 中等）

把字符串划分为尽量多的片段，使每个字母只出现在一个片段中。先记录每个字母最后一次出现的下标，再扫描：维护当前片段的右边界（= 区间内字母最后出现位置的最大值），扫到右边界即切分。时间 O(n)，空间 O(1)（固定字母表）。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<Integer> partitionLabels(String s) {
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) {
            last[s.charAt(i) - 'a'] = i; // 每个字母最后一次出现的位置
        }
        List<Integer> res = new ArrayList<>();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, last[s.charAt(i) - 'a']);
            if (i == end) { // 当前片段闭合
                res.add(end - start + 1);
                start = i + 1;
            }
        }
        return res;
    }
}
```

@tab Kotlin

:::

### 3.10 矩阵（2 题）

矩阵题先找「有序性」再设计遍历方向，往往能避免暴力枚举。本节题目：旋转图像、搜索二维矩阵 II。

#### 旋转图像（LeetCode 48 · 中等）

原地顺时针旋转 n×n 矩阵 90 度。先沿主对角线转置，再逐行左右反转，两步即可完成顺时针旋转。时间 O(n²)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) { // 转置
                int t = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = t;
            }
        }
        for (int i = 0; i < n; i++) { // 每行左右反转
            for (int j = 0; j < n / 2; j++) {
                int t = matrix[i][j];
                matrix[i][j] = matrix[i][n - 1 - j];
                matrix[i][n - 1 - j] = t;
            }
        }
    }
}
```

@tab Kotlin

:::

#### 搜索二维矩阵 II（LeetCode 240 · 中等）

行列均升序的矩阵中搜索目标值。从右上角出发：当前值大于 target 则左移一列，小于则下移一行，像走楼梯一样排除整行整列。时间 O(m + n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int i = 0, j = n - 1; // 右上角出发
        while (i < m && j >= 0) {
            if (matrix[i][j] == target) return true;
            if (matrix[i][j] > target) {
                j--; // 整列都更大
            } else {
                i++; // 整行都更小
            }
        }
        return false;
    }
}
```

@tab Kotlin

:::

### 3.11 普通数组（6 题）

数组类高频题往往用排序、前缀积、摩尔投票等技巧把复杂度压到线性。本节题目：下一个排列、合并区间、多数元素、除自身以外数组的乘积、找到所有数组中消失的数字、最短无序连续子数组。

#### 下一个排列（LeetCode 31 · 中等）

求比当前排列大的最小排列（不存在则重排为最小排列）。从右向左找第一个升序对 `(i, i+1)`；再从右找到第一个大于 `nums[i]` 的数交换，最后把 `i+1` 之后的部分反转。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public void nextPermutation(int[] nums) {
        int n = nums.length, i = n - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--; // 找第一个升序对
        if (i >= 0) {
            int j = n - 1;
            while (nums[j] <= nums[i]) j--; // 找略大于 nums[i] 的数
            swap(nums, i, j);
        }
        reverse(nums, i + 1, n - 1); // 后面降序转升序
    }

    private void swap(int[] nums, int a, int b) {
        int t = nums[a];
        nums[a] = nums[b];
        nums[b] = t;
    }

    private void reverse(int[] nums, int l, int r) {
        while (l < r) swap(nums, l++, r--);
    }
}
```

@tab Kotlin

:::

#### 合并区间（LeetCode 56 · 中等）

合并所有重叠区间。按区间起点排序后遍历：当前区间与已合并的最后一个区间重叠则扩展右边界，否则作为新区间加入。时间 O(n log n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]); // 按起点排序
        List<int[]> res = new ArrayList<>();
        for (int[] interval : intervals) {
            if (res.isEmpty() || res.get(res.size() - 1)[1] < interval[0]) {
                res.add(interval); // 不重叠，直接加入
            } else {
                // 重叠：扩展右边界
                res.get(res.size() - 1)[1] =
                        Math.max(res.get(res.size() - 1)[1], interval[1]);
            }
        }
        return res.toArray(new int[res.size()][]);
    }
}
```

@tab Kotlin

:::

#### 多数元素（LeetCode 169 · 简单）

数组中出现次数大于 n/2 的元素。摩尔投票：候选人计数，遇到相同加一、不同减一，减到 0 就更换候选人，最终留下的必然是多数元素。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int majorityElement(int[] nums) {
        int candidate = nums[0], count = 1;
        for (int i = 1; i < nums.length; i++) {
            if (count == 0) {
                candidate = nums[i];
                count = 1;
            } else if (nums[i] == candidate) {
                count++;
            } else {
                count--;
            }
        }
        return candidate;
    }
}
```

@tab Kotlin

:::

#### 除自身以外数组的乘积（LeetCode 238 · 中等）

返回每个位置除自身以外全部元素的乘积，要求 O(n) 且不使用除法。两遍遍历：第一遍从左到右记录前缀积，第二遍从右到左乘上后缀积，直接在输出数组上累积。时间 O(n)，空间 O(1)（不计输出）。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        res[0] = 1;
        for (int i = 1; i < n; i++) {
            res[i] = res[i - 1] * nums[i - 1]; // 前缀积
        }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] *= suffix; // 乘上后缀积
            suffix *= nums[i];
        }
        return res;
    }
}
```

@tab Kotlin

:::

#### 找到所有数组中消失的数字（LeetCode 448 · 简单）

1 到 n 的数组，部分数字缺失，找出缺失的数字，要求不使用额外空间。利用下标作哈希：遍历时把 `nums[i]` 对应下标位置的值标记为负数，最后仍为正的位置即缺失数字。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public List<Integer> findDisappearedNumbers(int[] nums) {
        for (int x : nums) {
            int idx = Math.abs(x) - 1;
            if (nums[idx] > 0) nums[idx] = -nums[idx]; // 标记出现过
        }
        List<Integer> res = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] > 0) res.add(i + 1); // 仍为正 = 从未出现
        }
        return res;
    }
}
```

@tab Kotlin

:::

#### 最短无序连续子数组（LeetCode 581 · 中等）

找最短的连续子数组，排序它就能使整个数组升序。从左到右找「最后一个小于左侧最大值」的位置作为右边界；从右到左找「最后一个大于右侧最小值」的位置作为左边界。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int findUnsortedSubarray(int[] nums) {
        int n = nums.length;
        int max = Integer.MIN_VALUE, right = -2;
        for (int i = 0; i < n; i++) {
            max = Math.max(max, nums[i]);
            if (nums[i] < max) right = i; // 乱序的右边界
        }
        int min = Integer.MAX_VALUE, left = -1;
        for (int i = n - 1; i >= 0; i--) {
            min = Math.min(min, nums[i]);
            if (nums[i] > min) left = i; // 乱序的左边界
        }
        return right - left + 1; // 已排序时为 0
    }
}
```

@tab Kotlin

:::

### 3.12 二分查找（4 题）

二分的关键是找到「单调性」并正确收缩边界，mid 用 `left + (right - left) / 2` 防溢出。本节题目：寻找两个正序数组的中位数、搜索旋转排序数组、在排序数组中查找元素的第一个和最后一个位置、寻找重复数。

#### 寻找两个正序数组的中位数（LeetCode 4 · 困难）

O(log(min(m, n))) 求两个有序数组的中位数。对较短的数组二分切分点 i，由总长度推出另一个数组的切分 j；满足左半最大值不大于右半最小值即找到正确切分。时间 O(log(min(m, n)))，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1); // 始终二分较短数组
        }
        int m = nums1.length, n = nums2.length;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = lo + (hi - lo) / 2;
            int j = (m + n + 1) / 2 - i;
            int left1 = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int right1 = (i == m) ? Integer.MAX_VALUE : nums1[i];
            int left2 = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int right2 = (j == n) ? Integer.MAX_VALUE : nums2[j];
            if (left1 <= right2 && left2 <= right1) {
                if ((m + n) % 2 == 0) {
                    return (Math.max(left1, left2)
                            + Math.min(right1, right2)) / 2.0;
                }
                return Math.max(left1, left2);
            } else if (left1 > right2) {
                hi = i - 1;
            } else {
                lo = i + 1;
            }
        }
        return 0.0;
    }
}
```

@tab Kotlin

:::

#### 搜索旋转排序数组（LeetCode 33 · 中等）

升序数组在某个点旋转后，搜索目标值下标。二分时先判断 mid 落在左半有序区还是右半有序区，再按 target 是否在该有序区间内收缩边界。时间 O(log n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) { // 左半有序
                if (target >= nums[lo] && target < nums[mid]) {
                    hi = mid - 1;
                } else {
                    lo = mid + 1;
                }
            } else { // 右半有序
                if (target > nums[mid] && target <= nums[hi]) {
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
        }
        return -1;
    }
}
```

@tab Kotlin

:::

#### 在排序数组中查找元素的第一个和最后一个位置（LeetCode 34 · 中等）

返回 target 在升序数组中的首尾下标。两次二分：分别找「第一个 ≥ target」与「第一个 > target」的位置，注意边界判定。时间 O(log n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int[] searchRange(int[] nums, int target) {
        int first = lowerBound(nums, target);
        if (first == nums.length || nums[first] != target) {
            return new int[]{-1, -1}; // 不存在
        }
        int last = lowerBound(nums, target + 1) - 1;
        return new int[]{first, last};
    }

    // 第一个 >= target 的下标
    private int lowerBound(int[] nums, int target) {
        int lo = 0, hi = nums.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }
}
```

@tab Kotlin

:::

#### 寻找重复数（LeetCode 287 · 中等）

n+1 个数的数组元素范围是 1 到 n，找出唯一重复的数（不修改数组）。把值看成「链表 next 指针」，重复数即环入口，用 Floyd 快慢指针求解；也可用「值域二分」。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int findDuplicate(int[] nums) {
        int slow = nums[0], fast = nums[0];
        do { // 第一次相遇
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        fast = nums[0];
        while (slow != fast) { // 找环入口 = 重复数
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
}
```

@tab Kotlin

:::

### 3.13 动态规划（20 题）

DP 五步法：定义状态 → 写转移方程 → 初始化 → 确定遍历顺序 → 举例验证。做不出时先想「最后一步怎么来的」。本节题目：最长回文子串、正则表达式匹配、最大子数组和、不同路径、最小路径和、爬楼梯、编辑距离、买卖股票的最佳时机、单词拆分、乘积最大子数组、打家劫舍、最大正方形、完全平方数、最长递增子序列、最佳买卖股票时机含冷冻期、戳气球、零钱兑换、比特位计数、分割等和子集、回文子串。

#### 最长回文子串（LeetCode 5 · 中等）

求字符串中的最长回文子串。中心扩展法：每个位置（及相邻两字符之间）作为回文中心向两侧扩展，记录最长者。时间 O(n²)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public String longestPalindrome(String s) {
        int start = 0, maxLen = 0;
        for (int i = 0; i < s.length(); i++) {
            int odd = expand(s, i, i);       // 奇数长度中心
            int even = expand(s, i, i + 1);  // 偶数长度中心
            int len = Math.max(odd, even);
            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2;
            }
        }
        return s.substring(start, start + maxLen);
    }

    private int expand(String s, int left, int right) {
        while (left >= 0 && right < s.length()
                && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return right - left - 1; // 扩展后的回文长度
    }
}
```

@tab Kotlin

:::

#### 正则表达式匹配（LeetCode 10 · 困难）

实现支持 `.` 与 `*` 的正则匹配。`dp[i][j]` 表示 `s` 前 i 个字符能否匹配 `p` 前 j 个：遇到 `*` 可让前一字符重复 0 次（跳过两个字符）或多次（前提字符相等）。时间 O(m·n)，空间 O(m·n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean isMatch(String s, String p) {
        int m = s.length(), n = p.length();
        boolean[][] dp = new boolean[m + 1][n + 1];
        dp[0][0] = true;
        for (int j = 2; j <= n; j++) { // 处理 a* 等可匹配空串
            if (p.charAt(j - 1) == '*') dp[0][j] = dp[0][j - 2];
        }
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                char sc = s.charAt(i - 1), pc = p.charAt(j - 1);
                if (pc == '*' && j >= 2) {
                    char prev = p.charAt(j - 2);
                    dp[i][j] = dp[i][j - 2] // * 匹配 0 次
                            || (dp[i - 1][j]
                                && (prev == sc || prev == '.'));
                } else {
                    dp[i][j] = dp[i - 1][j - 1]
                            && (sc == pc || pc == '.');
                }
            }
        }
        return dp[m][n];
    }
}
```

@tab Kotlin

:::

#### 最大子数组和（LeetCode 53 · 中等）

求和最大的连续子数组。Kadane 算法：`dp[i]` 为以 i 结尾的最大和，转移只有两种选择——接上 `nums[i]` 或从 `nums[i]` 重新开始，取较大者。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int cur = 0, best = Integer.MIN_VALUE;
        for (int x : nums) {
            cur = Math.max(x, cur + x); // 重新开始 or 延续
            best = Math.max(best, cur);
        }
        return best;
    }
}
```

@tab Kotlin

:::

#### 不同路径（LeetCode 62 · 中等）

机器人从左上角到右下角，只能向右 / 向下，求不同路径数。`dp[i][j] = dp[i-1][j] + dp[i][j-1]`，第一行与第一列都只有一条路，可滚动数组压到一维。时间 O(m·n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int uniquePaths(int m, int n) {
        int[] dp = new int[n];
        Arrays.fill(dp, 1);
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[j] += dp[j - 1]; // 上方 + 左方
            }
        }
        return dp[n - 1];
    }
}
```

@tab Kotlin

:::

#### 最小路径和（LeetCode 64 · 中等）

求左上到右下路径上的数字总和最小值。`dp[i][j] = grid[i][j] + min(上, 左)`，原地修改即可。时间 O(m·n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int minPathSum(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 && j == 0) continue;
                if (i == 0) {
                    grid[i][j] += grid[i][j - 1]; // 只能从左来
                } else if (j == 0) {
                    grid[i][j] += grid[i - 1][j]; // 只能从上来
                } else {
                    grid[i][j] += Math.min(grid[i - 1][j], grid[i][j - 1]);
                }
            }
        }
        return grid[m - 1][n - 1];
    }
}
```

@tab Kotlin

:::

#### 爬楼梯（LeetCode 70 · 简单）

每次爬 1 或 2 阶，到楼顶有多少种方法。斐波那契：`dp[i] = dp[i-1] + dp[i-2]`，只需两个变量滚动。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev = 1, cur = 2;
        for (int i = 3; i <= n; i++) {
            int next = prev + cur;
            prev = cur;
            cur = next;
        }
        return cur;
    }
}
```

@tab Kotlin

:::

#### 编辑距离（LeetCode 72 · 困难）

把 word1 变成 word2 的最小操作数（增 / 删 / 改）。`dp[i][j]` 表示 word1 前 i 个字符编辑成 word2 前 j 个字符的最小代价：字符相等则继承左上，否则取增删改三者最小加一。时间 O(m·n)，空间 O(m·n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i; // 删除
        for (int j = 0; j <= n; j++) dp[0][j] = j; // 插入
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], // 改
                            Math.min(dp[i - 1][j], dp[i][j - 1])); // 删 / 增
                }
            }
        }
        return dp[m][n];
    }
}
```

@tab Kotlin

:::

#### 买卖股票的最佳时机（LeetCode 121 · 简单）

只能买卖一次，求最大利润。一遍遍历：记录历史最低价，每天计算「当天价 - 历史最低」并更新答案。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE, ans = 0;
        for (int price : prices) {
            minPrice = Math.min(minPrice, price); // 之前的最低价
            ans = Math.max(ans, price - minPrice);
        }
        return ans;
    }
}
```

@tab Kotlin

:::

#### 单词拆分（LeetCode 139 · 中等）

判断字符串能否由字典中的单词拼接而成。`dp[i]` 表示前 i 个字符可拆分：枚举最后一个单词的起点 j，若 `dp[j]` 为真且 `s[j..i)` 在字典中则 `dp[i]` 为真。时间 O(n²)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        int n = s.length();
        boolean[] dp = new boolean[n + 1];
        dp[0] = true;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && dict.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[n];
    }
}
```

@tab Kotlin

:::

#### 乘积最大子数组（LeetCode 152 · 中等）

求乘积最大的连续子数组。负负得正，因此同时维护「以 i 结尾的最大乘积」与「最小乘积」，乘上当前数后交叉更新。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int maxProduct(int[] nums) {
        int maxP = nums[0], minP = nums[0], ans = nums[0];
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] < 0) { // 负数会翻转大小关系
                int t = maxP;
                maxP = minP;
                minP = t;
            }
            maxP = Math.max(nums[i], maxP * nums[i]);
            minP = Math.min(nums[i], minP * nums[i]);
            ans = Math.max(ans, maxP);
        }
        return ans;
    }
}
```

@tab Kotlin

:::

#### 打家劫舍（LeetCode 198 · 中等）

相邻房屋不能同时偷，求能偷到的最大金额。`dp[i]` 表示前 i 间能偷的最大值：`max(不偷当前, 偷当前 + dp[i-2])`，滚动两个变量即可。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int rob(int[] nums) {
        int prev = 0, cur = 0; // prev = dp[i-2], cur = dp[i-1]
        for (int x : nums) {
            int next = Math.max(cur, prev + x); // 不偷 or 偷
            prev = cur;
            cur = next;
        }
        return cur;
    }
}
```

@tab Kotlin

:::

#### 最大正方形（LeetCode 221 · 中等）

二进制矩阵中找到只含 1 的最大正方形面积。`dp[i][j]` 表示以该格为右下角的最大正方形边长，等于左、上、左上三者最小 + 1（前提自身为 1）。时间 O(m·n)，空间 O(n)（可滚动）。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int maximalSquare(char[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        int[][] dp = new int[m + 1][n + 1];
        int maxSide = 0;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (matrix[i - 1][j - 1] == '1') {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1],
                            Math.min(dp[i - 1][j], dp[i][j - 1]));
                    maxSide = Math.max(maxSide, dp[i][j]);
                }
            }
        }
        return maxSide * maxSide;
    }
}
```

@tab Kotlin

:::

#### 完全平方数（LeetCode 279 · 中等）

求 n 最少可由几个完全平方数相加得到。完全背包：`dp[i]` 初始为 i（全 1），枚举平方数 `j*j` 更新 `dp[i] = min(dp[i], dp[i - j*j] + 1)`。时间 O(n·sqrt(n))，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int numSquares(int n) {
        int[] dp = new int[n + 1];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j * j <= i; j++) {
                dp[i] = Math.min(dp[i], dp[i - j * j] + 1);
            }
        }
        return dp[n];
    }
}
```

@tab Kotlin

:::

#### 最长递增子序列（LeetCode 300 · 中等）

求数组的最长严格递增子序列长度（不要求连续）。`dp[i]` 为以 i 结尾的 LIS 长度：枚举前面的 j，`nums[j] < nums[i]` 时 `dp[i] = max(dp[i], dp[j]+1)`。更优可用贪心 + 二分到 O(n log n)。时间 O(n²)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int lengthOfLIS(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n];
        Arrays.fill(dp, 1);
        int ans = 1;
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            ans = Math.max(ans, dp[i]);
        }
        return ans;
    }
}
```

@tab Kotlin

:::

#### 最佳买卖股票时机含冷冻期（LeetCode 309 · 中等）

卖出后第二天进入冷冻期，求最大利润。用三个状态滚动：持有 `hold`、刚卖出 `sold`、冷冻 / 观望 `rest`，每天按状态机转移。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if (n < 2) return 0;
        int hold = -prices[0], sold = 0, rest = 0;
        for (int i = 1; i < n; i++) {
            int preSold = sold;
            sold = hold + prices[i];       // 今天卖出
            hold = Math.max(hold, rest - prices[i]); // 今天买入
            rest = Math.max(rest, preSold); // 观望或冷冻
        }
        return Math.max(sold, rest);
    }
}
```

@tab Kotlin

:::

#### 戳气球（LeetCode 312 · 困难）

戳破所有气球得分 = 每次 `nums[left] * nums[i] * nums[right]`，求最大得分。区间 DP：在数组两端补 1，`dp[l][r]` 表示戳破 (l, r) 开区间内所有气球的最大得分，枚举区间内最后戳破的气球 k。时间 O(n³)，空间 O(n²)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] a = new int[n + 2];
        a[0] = a[n + 1] = 1; // 边界补 1
        for (int i = 0; i < n; i++) a[i + 1] = nums[i];
        int[][] dp = new int[n + 2][n + 2];
        for (int len = 1; len <= n; len++) {
            for (int l = 1; l + len - 1 <= n; l++) {
                int r = l + len - 1;
                for (int k = l; k <= r; k++) {
                    dp[l][r] = Math.max(dp[l][r],
                            dp[l][k - 1] + dp[k + 1][r]
                                    + a[l - 1] * a[k] * a[r + 1]);
                }
            }
        }
        return dp[1][n];
    }
}
```

@tab Kotlin

:::

#### 零钱兑换（LeetCode 322 · 中等）

凑成 amount 的最少硬币数（无限硬币可用）。完全背包：`dp[i]` 为凑 i 元的最少硬币数，`dp[i] = min(dp[i], dp[i - coin] + 1)`。时间 O(n·amount)，空间 O(amount)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1); // 用大数表示不可达
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}
```

@tab Kotlin

:::

#### 比特位计数（LeetCode 338 · 简单）

返回 0 到 n 每个数二进制中 1 的个数。利用关系 `count[i] = count[i >> 1] + (i & 1)`。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int[] countBits(int n) {
        int[] res = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            res[i] = res[i >> 1] + (i & 1); // 去掉最低位 + 最低位本身
        }
        return res;
    }
}
```

@tab Kotlin

:::

#### 分割等和子集（LeetCode 416 · 中等）

判断数组能否分成两个和相等的子集，即能否选出和为 sum/2 的子集（01 背包）。`dp[j]` 表示能否凑出和 j，倒序遍历防止重复使用元素。时间 O(n·sum)，空间 O(sum)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 != 0) return false; // 总数为奇数必不可能
        int target = sum / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;
        for (int x : nums) {
            for (int j = target; j >= x; j--) { // 倒序 = 每个数只能用一次
                dp[j] = dp[j] || dp[j - x];
            }
        }
        return dp[target];
    }
}
```

@tab Kotlin

:::

#### 回文子串（LeetCode 647 · 中等）

求字符串中回文子串的总个数。中心扩展：每个字符和相邻间隙各作为一个中心向外扩展计数，奇偶两类中心共 2n-1 个。时间 O(n²)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int countSubstrings(String s) {
        int ans = 0;
        for (int i = 0; i < s.length(); i++) {
            ans += expand(s, i, i);       // 奇数长度中心
            ans += expand(s, i, i + 1);   // 偶数长度中心
        }
        return ans;
    }

    private int expand(String s, int left, int right) {
        int count = 0;
        while (left >= 0 && right < s.length()
                && s.charAt(left) == s.charAt(right)) {
            count++;
            left--;
            right++;
        }
        return count;
    }
}
```

@tab Kotlin

:::

### 3.14 技巧（6 题）

位运算、前缀和、堆与哈希等技巧题，解法精炼但不易想到，建议背下套路。本节题目：只出现一次的数字、实现 Trie（前缀树）、数组中的第 K 个最大元素、前 K 个高频元素、汉明距离、和为 K 的子数组。

#### 只出现一次的数字（LeetCode 136 · 简单）

非空数组中只有一个数出现一次，其余都出现两次，找出它。异或性质：相同数异或为 0，0 异或任何数为本身，全部异或一遍即可。时间 O(n)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int singleNumber(int[] nums) {
        int ans = 0;
        for (int x : nums) ans ^= x; // 成对出现会抵消
        return ans;
    }
}
```

@tab Kotlin

:::

#### 实现 Trie（前缀树）（LeetCode 208 · 中等）

实现 Trie 的 `insert`、`search`、`startsWith`。每个结点是一个长度为 26 的子结点数组加一个结束标记，按字符逐层走。时间 O(单词长度)（各操作），空间 O(结点数 × 26)。实现如下：

::: code-tabs

@tab:active Java

```java
class Trie {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd;
    }

    private final TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode p = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (p.children[idx] == null) p.children[idx] = new TrieNode();
            p = p.children[idx];
        }
        p.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode p = find(word);
        return p != null && p.isEnd;
    }

    public boolean startsWith(String prefix) {
        return find(prefix) != null;
    }

    private TrieNode find(String s) {
        TrieNode p = root;
        for (char c : s.toCharArray()) {
            p = p.children[c - 'a'];
            if (p == null) return null;
        }
        return p;
    }
}
```

@tab Kotlin

:::

#### 数组中的第 K 个最大元素（LeetCode 215 · 中等）

求未排序数组中第 K 大的元素。维护大小为 K 的小顶堆，堆顶即答案；也可用快速选择达到平均 O(n)。时间 O(n log k)，空间 O(k)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(); // 小顶堆
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) heap.poll(); // 只保留最大的 k 个
        }
        return heap.peek();
    }
}
```

@tab Kotlin

:::

#### 前 K 个高频元素（LeetCode 347 · 中等）

返回数组中出现频率前 K 高的元素。先哈希计数，再用「桶排序」：频率为下标的桶里放对应元素，从高到低取即可。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : nums) freq.put(x, freq.getOrDefault(x, 0) + 1);
        List<Integer>[] bucket = new List[nums.length + 1];
        for (Map.Entry<Integer, Integer> e : freq.entrySet()) {
            int f = e.getValue();
            if (bucket[f] == null) bucket[f] = new ArrayList<>();
            bucket[f].add(e.getKey());
        }
        int[] res = new int[k];
        int idx = 0;
        for (int f = bucket.length - 1; f >= 0 && idx < k; f--) {
            if (bucket[f] == null) continue;
            for (int x : bucket[f]) {
                res[idx++] = x;
                if (idx == k) break;
            }
        }
        return res;
    }
}
```

@tab Kotlin

:::

#### 汉明距离（LeetCode 461 · 简单）

求两个整数二进制位不同的个数。先异或得到不同位集合，再逐位统计 1 的个数（或用 `Integer.bitCount`）。时间 O(1)，空间 O(1)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int hammingDistance(int x, int y) {
        int z = x ^ y, count = 0;
        while (z != 0) {
            count += z & 1;
            z >>>= 1; // 无符号右移
        }
        return count;
    }
}
```

@tab Kotlin

:::

#### 和为 K 的子数组（LeetCode 560 · 中等）

求数组中和为 k 的连续子数组个数。前缀和 + 哈希计数：`pre[j] - pre[i] == k` 等价于「前缀和 pre[j] 减去 k 在之前出现过几次」，一遍遍历累计即可。时间 O(n)，空间 O(n)。实现如下：

::: code-tabs

@tab:active Java

```java
class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        count.put(0, 1); // 前缀和为 0 出现 1 次
        int sum = 0, ans = 0;
        for (int x : nums) {
            sum += x;
            ans += count.getOrDefault(sum - k, 0); // 之前有多少个前缀和 = sum - k
            count.put(sum, count.getOrDefault(sum, 0) + 1);
        }
        return ans;
    }
}
```

@tab Kotlin

:::













## 4. 复杂度速查

各经典算法的复杂度对比说明如下：

| 算法 | 时间复杂度 | 空间复杂度 |
| --- | --- | --- |
| 双指针 | O(n) | O(1) |
| 滑动窗口 | O(n) | O(k) |
| 二分查找 | O(log n) | O(1) |
| 二叉树遍历 | O(n) | O(h) |
| 快速排序 | O(n log n) | O(log n) |
| 归并排序 | O(n log n) | O(n) |
| 动态规划 | O(n²) 常见 | O(n²) / O(n) |

## 5. 高频面试题

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

## 6. 小结

- 本文全量覆盖力扣「热题 HOT 100」100 题（Java 题解），按 14 类考点分组。
- 开刷前先过一遍 §2 模板速查表，刷题时带着模板去套、去改。
- 复杂度分析是基本功（时间 + 空间），每题都要能说清。
- Hot 100 + 剑指 Offer 覆盖 90% 面试算法题。

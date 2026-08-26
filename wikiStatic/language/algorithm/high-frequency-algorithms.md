---
icon: medal
title: 高频面试算法题精选
---

# 高频面试算法题精选

> 本章精选面试中最高频的算法题，按数据结构与算法思想分类，覆盖二叉树、链表、栈、二分、哈希表、堆、动态规划、位运算等核心题型，每题给出解题思路与 Java 实现。

## 一、二叉树

### 1. 层次遍历

使用队列逐层访问，每层先记录当前队列大小，再一次性取出该层所有节点。

::: code-tabs

@tab:active Java

```java
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
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
        result.add(level);
    }
    return result;
}
```

@tab Kotlin

```kotlin
fun levelOrder(root: TreeNode?): List<List<Int>> {
    val result = mutableListOf<List<Int>>()
    if (root == null) return result
    val queue = ArrayDeque<TreeNode>()
    queue.add(root)
    while (queue.isNotEmpty()) {
        val size = queue.size
        val level = mutableListOf<Int>()
        for (i in 0 until size) {
            val node = queue.removeFirst()
            level.add(node.`val`)
            if (node.left != null) queue.add(node.left)
            if (node.right != null) queue.add(node.right)
        }
        result.add(level)
    }
    return result
}
```

:::

### 2. 左右翻转（镜像）

递归交换每个节点的左右子树。

::: code-tabs

@tab:active Java

```java
public TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    TreeNode left = invertTree(root.left);
    TreeNode right = invertTree(root.right);
    root.left = right;
    root.right = left;
    return root;
}
```

@tab Kotlin

```kotlin
fun invertTree(root: TreeNode?): TreeNode? {
    if (root == null) return null
    val left = invertTree(root.left)
    val right = invertTree(root.right)
    root.left = right
    root.right = left
    return root
}
```

:::

### 3. 最大深度 / 最小深度

- 最大深度：`max(left, right) + 1`，递归即可。
- 最小深度：根到最近叶子节点的距离，需注意单边为空时取另一边的深度。

::: code-tabs

@tab:active Java

```java
public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
}
```

@tab Kotlin

```kotlin
fun maxDepth(root: TreeNode?): Int {
    if (root == null) return 0
    return maxOf(maxDepth(root.left), maxDepth(root.right)) + 1
}
```

:::

### 4. 平衡二叉树判断

任意节点的左右子树高度差不超过 1。自底向上计算高度，同时判断是否平衡。

::: code-tabs

@tab:active Java

```java
public boolean isBalanced(TreeNode root) {
    return depth(root) != -1;
}

private int depth(TreeNode root) {
    if (root == null) return 0;
    int left = depth(root.left);
    int right = depth(root.right);
    if (left == -1 || right == -1 || Math.abs(left - right) > 1) {
        return -1; // 用 -1 标记不平衡
    }
    return Math.max(left, right) + 1;
}
```

@tab Kotlin

```kotlin
fun isBalanced(root: TreeNode?): Boolean {
    return depth(root) != -1
}

private fun depth(root: TreeNode?): Int {
    if (root == null) return 0
    val left = depth(root.left)
    val right = depth(root.right)
    if (left == -1 || right == -1 || Math.abs(left - right) > 1) {
        return -1 // 用 -1 标记不平衡
    }
    return maxOf(left, right) + 1
}
```

:::

## 二、链表

### 1. 翻转链表

迭代法：三个指针 prev、curr、next 逐个翻转。

::: code-tabs

@tab:active Java

```java
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
```

@tab Kotlin

```kotlin
fun reverseList(head: ListNode?): ListNode? {
    var prev: ListNode? = null
    var curr = head
    while (curr != null) {
        val next = curr.next
        curr.next = prev
        prev = curr
        curr = next
    }
    return prev
}
```

:::

### 2. 中间元素

快慢指针：快指针每次走两步，慢指针每次走一步，快指针到达末尾时慢指针正好在中间。

### 3. 判断是否为循环链表

快慢指针：若存在环，快慢指针终将相遇。

::: code-tabs

@tab:active Java

```java
public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}
```

@tab Kotlin

```kotlin
fun hasCycle(head: ListNode?): Boolean {
    var slow = head
    var fast = head
    while (fast != null && fast.next != null) {
        slow = slow?.next
        fast = fast.next?.next
        if (slow === fast) return true
    }
    return false
}
```

:::

### 4. 删除倒数第 N 个节点

快指针先走 N 步，然后快慢指针同步前进，快指针到末尾时慢指针指向倒数第 N 个节点的前驱。

### 5. 两个链表是否相交

先分别求出两个链表长度，长的先走差值步，再同步前进比较节点是否相同。

## 三、栈 / 队列

### 1. 有效括号

遍历字符串，遇到左括号入栈，遇到右括号弹出栈顶匹配，最终栈为空则合法。

::: code-tabs

@tab:active Java

```java
public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if ((c == ')' && top != '(')
                    || (c == ']' && top != '[')
                    || (c == '}' && top != '{')) {
                return false;
            }
        }
    }
    return stack.isEmpty();
}
```

@tab Kotlin

```kotlin
fun isValid(s: String): Boolean {
    val stack = Stack<Char>()
    for (c in s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c)
        } else {
            if (stack.isEmpty()) return false
            val top = stack.pop()
            if ((c == ')' && top != '(')
                || (c == ']' && top != '[')
                || (c == '}' && top != '{')) {
                return false
            }
        }
    }
    return stack.isEmpty()
}
```

:::

### 2. 逆波兰表达式求值

遇到数字入栈，遇到运算符弹出两个操作数计算后结果入栈。

## 四、二分

### X 的平方根

在 [0, x] 区间二分查找，找到最大的平方不超过 x 的整数。

::: code-tabs

@tab:active Java

```java
public int mySqrt(int x) {
    long left = 0, right = x;
    while (left <= right) {
        long mid = (left + right) / 2;
        if (mid * mid <= x) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return (int) right;
}
```

@tab Kotlin

```kotlin
fun mySqrt(x: Int): Int {
    var left = 0L
    var right = x.toLong()
    while (left <= right) {
        val mid = (left + right) / 2
        if (mid * mid <= x) {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return right.toInt()
}
```

:::

## 五、哈希表

### 1. 连续数组

求含有相同数量 0 和 1 的最长连续子数组。把 0 视为 -1，问题转化为"和为 0 的最长子数组"，用哈希表记录每个前缀和首次出现的位置。

### 2. 最长无重复字符的子串

滑动窗口 + 哈希表记录字符最近出现位置，窗口左边界移动到重复字符之后。

::: code-tabs

@tab:active Java

```java
public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> map = new HashMap<>();
    int max = 0, left = 0;
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (map.containsKey(c)) {
            left = Math.max(left, map.get(c) + 1);
        }
        map.put(c, i);
        max = Math.max(max, i - left + 1);
    }
    return max;
}
```

@tab Kotlin

```kotlin
fun lengthOfLongestSubstring(s: String): Int {
    val map = HashMap<Char, Int>()
    var max = 0
    var left = 0
    for (i in s.indices) {
        val c = s[i]
        if (map.containsKey(c)) {
            left = maxOf(left, map[c]!! + 1)
        }
        map[c] = i
        max = maxOf(max, i - left + 1)
    }
    return max
}
```

:::

## 六、堆 / 优先队列

### 前 K 大的数

维护一个大小为 K 的最小堆（PriorityQueue），堆顶是当前 K 个数中最小的；遍历完整个数组后，堆中即为前 K 大的数。

::: code-tabs

@tab:active Java

```java
public int[] topK(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>(k);
    for (int num : nums) {
        if (minHeap.size() < k) {
            minHeap.offer(num);
        } else if (num > minHeap.peek()) {
            minHeap.poll();
            minHeap.offer(num);
        }
    }
    int[] result = new int[k];
    for (int i = 0; i < k; i++) {
        result[i] = minHeap.poll();
    }
    return result;
}
```

@tab Kotlin

```kotlin
fun topK(nums: IntArray, k: Int): IntArray {
    val minHeap = PriorityQueue<Int>(k)
    for (num in nums) {
        if (minHeap.size < k) {
            minHeap.offer(num)
        } else if (num > minHeap.peek()) {
            minHeap.poll()
            minHeap.offer(num)
        }
    }
    val result = IntArray(k)
    for (i in 0 until k) {
        result[i] = minHeap.poll()
    }
    return result
}
```

:::

时间复杂度 O(nlogk)，比全排序 O(nlogn) 更优。

## 七、二叉搜索树

### 1. 验证二叉搜索树

中序遍历二叉搜索树应得到递增序列；或递归时给每个节点传递 (min, max) 区间约束。

::: code-tabs

@tab:active Java

```java
public boolean isValidBST(TreeNode root) {
    return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private boolean valid(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return valid(node.left, min, node.val) && valid(node.right, node.val, max);
}
```

@tab Kotlin

```kotlin
fun isValidBST(root: TreeNode?): Boolean {
    return valid(root, Long.MIN_VALUE, Long.MAX_VALUE)
}

private fun valid(node: TreeNode?, min: Long, max: Long): Boolean {
    if (node == null) return true
    if (node.`val` <= min || node.`val` >= max) return false
    return valid(node.left, min, node.`val`.toLong()) &&
            valid(node.right, node.`val`.toLong(), max)
}
```

:::

### 2. 第 K 小的元素

中序遍历计数，数到第 K 个即答案。

## 八、数组 / 双指针

### 1. 加一

从最低位开始加 1 并处理进位，若最高位进位则数组扩容。

### 2. 删除排序数组中的重复数字

快慢指针：快指针遍历，慢指针记录不重复元素的位置，遇到不同元素时写入。

::: code-tabs

@tab:active Java

```java
public int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;
    int slow = 0;
    for (int fast = 1; fast < nums.length; fast++) {
        if (nums[fast] != nums[slow]) {
            nums[++slow] = nums[fast];
        }
    }
    return slow + 1;
}
```

@tab Kotlin

```kotlin
fun removeDuplicates(nums: IntArray): Int {
    if (nums.isEmpty()) return 0
    var slow = 0
    for (fast in 1 until nums.size) {
        if (nums[fast] != nums[slow]) {
            nums[++slow] = nums[fast]
        }
    }
    return slow + 1
}
```

:::

### 3. 合并排序数组

从后往前合并（从尾部开始比较填充），避免移动元素。

## 九、贪心

### 1. 买卖股票的最佳时机

只允许一次交易：遍历时记录历史最低价，同时计算当前价卖出收益并取最大。

::: code-tabs

@tab:active Java

```java
public int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE;
    int maxProfit = 0;
    for (int price : prices) {
        if (price < minPrice) {
            minPrice = price;
        } else {
            maxProfit = Math.max(maxProfit, price - minPrice);
        }
    }
    return maxProfit;
}
```

@tab Kotlin

```kotlin
fun maxProfit(prices: IntArray): Int {
    var minPrice = Int.MAX_VALUE
    var maxProfit = 0
    for (price in prices) {
        if (price < minPrice) {
            minPrice = price
        } else {
            maxProfit = maxOf(maxProfit, price - minPrice)
        }
    }
    return maxProfit
}
```

:::

### 2. 买卖股票的最佳时机 II

允许多次交易：只要第二天价格高于今天，就累积利润（把每次上涨都赚到）。

### 3. 最大子数组

经典 Kadane 算法：`current = max(nums[i], current + nums[i])`，同时记录全局最大值。

::: code-tabs

@tab:active Java

```java
public int maxSubArray(int[] nums) {
    int current = nums[0];
    int max = nums[0];
    for (int i = 1; i < nums.length; i++) {
        current = Math.max(nums[i], current + nums[i]);
        max = Math.max(max, current);
    }
    return max;
}
```

@tab Kotlin

```kotlin
fun maxSubArray(nums: IntArray): Int {
    var current = nums[0]
    var max = nums[0]
    for (i in 1 until nums.size) {
        current = maxOf(nums[i], current + nums[i])
        max = maxOf(max, current)
    }
    return max
}
```

:::

### 4. 主元素（众数）

摩尔投票法：候选元素计数，遇到相同 +1，不同 -1，计数为 0 时更换候选。

## 十、字符串处理

### 1. 生成括号

回溯法：分别记录已放左括号和右括号数量，左括号数小于 n 时放左括号，右括号数小于左括号数时放右括号。

### 2. 翻转字符串中的单词

先整体反转，再逐个单词反转；或按空格 split 后逆序拼接。

### 3. 最长公共前缀

取第一个字符串为前缀，逐一与后续字符串比较并缩短。

### 4. 回文数

反转一半数字与另一半比较；注意负数和末位为 0 的数直接返回 false。

## 十一、动态规划

### 1. 爬楼梯

$f(n) = f(n-1) + f(n-2)$，用滚动变量优化空间。

### 2. 打劫房屋

不能偷相邻房屋：$dp[i] = \max(dp[i-1], dp[i-2] + nums[i])$。

### 3. 编辑距离

`dp[i][j]` 表示把 word1 前 i 个字符转换为 word2 前 j 个字符的最少操作数：

- 相等：`dp[i][j] = dp[i-1][j-1]`
- 不等：`dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])`（删除、插入、替换）

::: code-tabs

@tab:active Java

```java
public int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j],
                        Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
            }
        }
    }
    return dp[m][n];
}
```

@tab Kotlin

```kotlin
fun minDistance(word1: String, word2: String): Int {
    val m = word1.length
    val n = word2.length
    val dp = Array(m + 1) { IntArray(n + 1) }
    for (i in 0..m) dp[i][0] = i
    for (j in 0..n) dp[0][j] = j
    for (i in 1..m) {
        for (j in 1..n) {
            if (word1[i - 1] == word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]
            } else {
                dp[i][j] = 1 + minOf(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
            }
        }
    }
    return dp[m][n]
}
```

:::

## 十二、矩阵

### 1. 螺旋矩阵

维护上下左右四个边界，按右、下、左、上顺序遍历，每次遍历后收缩对应边界。

### 2. 旋转图像（顺时针 90 度）

先沿主对角线对称翻转，再左右翻转。

## 十三、位运算

### 1. 落单的数

数组中只有一个数出现一次，其余出现两次：全部异或，成对的数抵消，剩下的就是落单的数。

::: code-tabs

@tab:active Java

```java
public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}
```

@tab Kotlin

```kotlin
fun singleNumber(nums: IntArray): Int {
    var result = 0
    for (num in nums) {
        result = result xor num
    }
    return result
}
```

:::

### 2. 格雷编码

$G(n) = n \oplus (n >> 1)$。

## 十四、其他

### 1. 反转整数

逐位取模累加，注意溢出判断（超过 Integer.MAX_VALUE / MIN_VALUE 返回 0）。

### 2. LRU 缓存策略

使用 **LinkedHashMap**（访问顺序模式）或"HashMap + 双向链表"实现：get 时把节点移到链表头部，put 时若容量已满删除尾部节点。

::: code-tabs

@tab:active Java

```java
class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true); // 开启访问顺序
        this.capacity = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity;
    }
}
```

@tab Kotlin

```kotlin
class LRUCache(capacity: Int) : LinkedHashMap<Int, Int>(capacity, 0.75f, true) {
    private val capacity = capacity

    fun get(key: Int): Int {
        return getOrDefault(key, -1)
    }

    override fun removeEldestEntry(eldest: MutableMap.MutableEntry<Int, Int>?): Boolean {
        return size > capacity
    }
}
```

:::

## 十五、刷题建议

1. 按**专题**刷题，而非随机刷题（先掌握每种数据结构的经典题型）。
2. 每道题思考**时间复杂度**与**空间复杂度**。
3. 一题多解，比较不同解法的优劣（如两数之和的暴力法与哈希法）。
4. 定期复习，对高频题做到"信手拈来"。

---
icon: code-branch
title: 二叉树遍历
---

# 二叉树遍历

> 二叉树的先序、中序、后序遍历是面试高频考点。本章给出递归与非递归（栈模拟）两种实现，并梳理三种遍历的核心顺序。

## 一、遍历顺序

| 遍历方式 | 顺序 | 口诀 |
| --- | --- | --- |
| 先序遍历 | 根 → 左 → 右 | 根左右 |
| 中序遍历 | 左 → 根 → 右 | 左根右 |
| 后序遍历 | 左 → 右 → 根 | 左右根 |

## 二、节点定义

::: code-tabs

@tab:active Java

```java
public class Node {
    public int value;
    public Node left;
    public Node right;

    public Node(int data) {
        this.value = data;
    }
}
```

@tab Kotlin

```kotlin
class Node(var value: Int) {
    var left: Node? = null
    var right: Node? = null
}
```

:::

## 三、递归实现

递归实现简单清晰，三种遍历的区别仅在于打印节点的时机。

::: code-tabs

@tab:active Java

```java
// 先序遍历
public void preOrderRecur(Node head) {
    if (head == null) return;
    System.out.println(head.value);
    preOrderRecur(head.left);
    preOrderRecur(head.right);
}

// 中序遍历
public void inOrderRecur(Node head) {
    if (head == null) return;
    inOrderRecur(head.left);
    System.out.println(head.value);
    inOrderRecur(head.right);
}

// 后序遍历
public void posOrderRecur(Node head) {
    if (head == null) return;
    posOrderRecur(head.left);
    posOrderRecur(head.right);
    System.out.println(head.value);
}
```

@tab Kotlin

```kotlin
// 先序遍历
fun preOrderRecur(head: Node?) {
    if (head == null) return
    println(head.value)
    preOrderRecur(head.left)
    preOrderRecur(head.right)
}

// 中序遍历
fun inOrderRecur(head: Node?) {
    if (head == null) return
    inOrderRecur(head.left)
    println(head.value)
    inOrderRecur(head.right)
}

// 后序遍历
fun posOrderRecur(head: Node?) {
    if (head == null) return
    posOrderRecur(head.left)
    posOrderRecur(head.right)
    println(head.value)
}
```

:::

## 四、非递归实现（借助栈）

递归本质上是函数调用栈，因此可以用显式栈模拟实现，避免递归深度过大导致的栈溢出。

### 先序（非递归）

思路：先压根节点，弹出后打印，再先压右孩子、后压左孩子（保证左孩子先出栈）。

::: code-tabs

@tab:active Java

```java
public void preOrderUnRecur(Node head) {
    if (head == null) return;
    Stack<Node> stack = new Stack<>();
    stack.push(head);
    while (!stack.isEmpty()) {
        head = stack.pop();
        System.out.println(head.value);
        if (head.right != null) stack.push(head.right);
        if (head.left != null) stack.push(head.left);
    }
}
```

@tab Kotlin

```kotlin
fun preOrderUnRecur(head: Node?) {
    if (head == null) return
    val stack = Stack<Node>()
    stack.push(head)
    while (!stack.isEmpty()) {
        val node = stack.pop()
        println(node.value)
        if (node.right != null) stack.push(node.right)
        if (node.left != null) stack.push(node.left)
    }
}
```

:::

### 中序（非递归）

思路：一直把左孩子压栈，直到为空，弹出打印，再转向右子树。

::: code-tabs

@tab:active Java

```java
public void inOrderUnRecur(Node head) {
    if (head == null) return;
    Stack<Node> stack = new Stack<>();
    while (!stack.isEmpty() || head != null) {
        if (head != null) {
            stack.push(head);
            head = head.left;       // 一路向左
        } else {
            head = stack.pop();
            System.out.println(head.value);
            head = head.right;      // 转向右子树
        }
    }
}
```

@tab Kotlin

```kotlin
fun inOrderUnRecur(head: Node?) {
    if (head == null) return
    val stack = Stack<Node>()
    var cur = head
    while (!stack.isEmpty() || cur != null) {
        if (cur != null) {
            stack.push(cur)
            cur = cur.left       // 一路向左
        } else {
            cur = stack.pop()
            println(cur.value)
            cur = cur.right      // 转向右子树
        }
    }
}
```

:::

### 后序（非递归）

思路：后序为"左右根"，可以用两个栈实现 —— 先按"根右左"的顺序压入第一个栈，再依次弹出到第二个栈，最后弹出即为"左右根"。

::: code-tabs

@tab:active Java

```java
public void posOrderUnRecur(Node head) {
    if (head == null) return;
    Stack<Node> s1 = new Stack<>();
    Stack<Node> s2 = new Stack<>();
    s1.push(head);
    while (!s1.isEmpty()) {
        head = s1.pop();
        s2.push(head);              // 根先入 s2，最后出
        if (head.left != null) s1.push(head.left);
        if (head.right != null) s1.push(head.right);
    }
    while (!s2.isEmpty()) {
        System.out.println(s2.pop().value);
    }
}
```

@tab Kotlin

```kotlin
fun posOrderUnRecur(head: Node?) {
    if (head == null) return
    val s1 = Stack<Node>()
    val s2 = Stack<Node>()
    s1.push(head)
    while (!s1.isEmpty()) {
        val node = s1.pop()
        s2.push(node)              // 根先入 s2，最后出
        if (node.left != null) s1.push(node.left)
        if (node.right != null) s1.push(node.right)
    }
    while (!s2.isEmpty()) {
        println(s2.pop().value)
    }
}
```

:::

## 五、递归与非递归对比

| 对比项 | 递归实现 | 非递归实现 |
| --- | --- | --- |
| 代码简洁度 | 简洁易读 | 较复杂 |
| 空间复杂度 | 递归调用栈，最坏 O(n) | 显式栈，O(n) |
| 风险 | 深度过大可能栈溢出 | 无递归栈溢出风险 |
| 适用场景 | 理解遍历逻辑、树深度小 | 生产环境、树深度大 |

## 六、遍历的应用

- **先序遍历**：二叉树序列化、打印树结构。
- **中序遍历**：二叉搜索树（BST）中序遍历得到递增序列。
- **后序遍历**：计算树的高度、释放树节点（先释放孩子再释放根）。

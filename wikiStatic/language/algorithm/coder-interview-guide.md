---
icon: book-open
title: 程序员代码面试指南精选题
---

# 程序员代码面试指南精选题

> 本章精选《程序员代码面试指南》（左程云）中的经典题目，重点训练栈与队列的灵活运用。

## 一、设计一个有 getMin 功能的栈

### 题目

实现一个特殊的栈，在实现栈的基本功能的基础上，实现返回栈中最小元素的操作。

要求：

1. pop、push、getMin 操作的时间复杂度都是 O(1)。
2. 设计的栈类型可以使用现成的栈结构。

### 解题思路

使用**两个栈**：`stackData` 存放数据，`stackMin` 存放最小值（栈顶始终是当前最小值）。

- **push：** stackData 正常入栈；若 stackMin 为空或新值小于等于 stackMin 栈顶，则同时压入 stackMin。
- **pop：** stackData 弹出；若弹出的值等于 stackMin 栈顶，则 stackMin 也弹出（同步）。
- **getMin：** 返回 stackMin 的栈顶元素。

### 代码实现

```java
import java.util.Stack;

public class GetMinStack {

    public static class MyStack {
        private Stack<Integer> stackData;
        private Stack<Integer> stackMin;

        public MyStack() {
            stackData = new Stack<>();
            stackMin = new Stack<>();
        }

        public void push(Integer value) {
            if (stackMin.isEmpty() || value <= getmin()) {
                stackMin.push(value);
            }
            stackData.push(value);
        }

        public Integer pop() {
            Integer num = stackData.pop();
            if (num.equals(getmin())) {
                stackMin.pop(); // 同步弹出最小值
            }
            return num;
        }

        public Integer getmin() {
            return stackMin.peek();
        }
    }
}
```

### 要点

- 空间换时间：用额外栈记录历史最小值，使 getMin 达到 O(1)。
- 弹出时要判断是否同步弹出 stackMin，保证栈顶始终是最小值。

## 二、由两个栈组成的队列

### 题目

编写一个类，用两个栈实现队列，支持队列的基本操作（add、poll、peek）。

### 解题思路

用 `stack1` 负责入队，`stack2` 负责出队：

- **add：** 直接压入 stack1。
- **poll / peek：** 若 stack2 不为空，直接从 stack2 弹出/查看；若 stack2 为空，则先把 stack1 中的元素**一次性全部**倒入 stack2，再从 stack2 弹出/查看。

两个关键约束：

1. stack1 要一次性全部压入 stack2（否则顺序会乱）。
2. stack2 不为空时，stack1 绝不能向 stack2 压入数据（否则顺序会乱）。

### 代码实现

```java
import java.util.Stack;

public class TwoStacksQueue {

    public static class MyQueue {
        private Stack<Integer> stack1;
        private Stack<Integer> stack2;

        public MyQueue() {
            stack1 = new Stack<>();
            stack2 = new Stack<>();
        }

        // add 只负责往 stack1 添加数据
        public void add(Integer newNum) {
            stack1.push(newNum);
        }

        public Integer poll() {
            if (stack1.isEmpty() && stack2.isEmpty()) {
                throw new RuntimeException("Queue is Empty");
            } else if (stack2.isEmpty()) {
                while (!stack1.isEmpty()) {
                    stack2.push(stack1.pop());
                }
            }
            return stack2.pop();
        }

        public Integer peek() {
            if (stack1.isEmpty() && stack2.isEmpty()) {
                throw new RuntimeException("Queue is Empty");
            } else if (stack2.isEmpty()) {
                while (!stack1.isEmpty()) {
                    stack2.push(stack1.pop());
                }
            }
            return stack2.peek();
        }
    }

    public static void main(String[] args) {
        MyQueue queue = new MyQueue();
        queue.add(1);
        queue.add(2);
        queue.add(3);
        System.out.println(queue.poll()); // 1
        System.out.println(queue.poll()); // 2
        System.out.println(queue.poll()); // 3
    }
}
```

### 要点

- 栈是 LIFO，队列是 FIFO，两栈颠倒两次即恢复 FIFO 顺序。
- 只有 stack2 为空时才允许一次性倒数据，保证顺序不乱。

## 三、仅用递归函数和栈操作逆序一个栈

### 题目

一个栈依次压入了 1、2、3、4、5，那么从栈顶到栈底分别为 5、4、3、2、1。将这个栈转置后，从栈顶到栈底为 1、2、3、4、5，即实现栈中元素的逆序，但**只能用递归函数**，不能用其他数据结构。

### 解题思路

设计两个递归函数：

1. **getAndRemoveLastElement：** 递归弹出栈底元素并返回，其余元素原顺序压回。
2. **reverse：** 先取出栈底元素，递归逆序剩余元素，最后把栈底元素压回栈顶，实现整体逆序。

### 代码实现

```java
import java.util.Stack;

public class ReverseStack {

    public static void reverse(Stack<Integer> stack) {
        if (stack.isEmpty()) {
            return;
        }
        int i = getAndRemoveLastElement(stack);
        reverse(stack);
        stack.push(i);
    }

    // 删除栈底元素并返回该元素
    public static int getAndRemoveLastElement(Stack<Integer> stack) {
        int result = stack.pop();
        if (stack.isEmpty()) {
            return result;
        } else {
            int last = getAndRemoveLastElement(stack);
            stack.push(result);
            return last;
        }
    }

    public static void main(String[] args) {
        Stack<Integer> test = new Stack<>();
        test.push(1);
        test.push(2);
        test.push(3);
        test.push(4);
        test.push(5);
        reverse(test);
        while (!test.isEmpty()) {
            System.out.println(test.pop()); // 1 2 3 4 5
        }
    }
}
```

### 要点

- 递归的调用栈本身就是一种"数据结构"，所以没有违反"不能用其他数据结构"的限制。
- 核心思路：每次取栈底元素 → 递归逆序剩余 → 栈底元素最后压入（变为栈顶）。

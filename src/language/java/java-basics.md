---
icon: java
title: Java 核心回顾
---

# 面向 Android 的 Java 核心回顾

> 虽然 Kotlin 已成为主流，但理解 Java 依然是阅读源码、理解 JVM 行为的基础。

## 一、面向对象三大特性

- **封装**：隐藏内部实现，通过访问修饰符（`private`/`protected`/`public`）控制访问
- **继承**：`extends` 实现代码复用，注意单继承限制
- **多态**：父类引用指向子类对象，运行时动态绑定

## 二、String 与常量池

```java
String s1 = "abc";          // 字符串常量池
String s2 = new String("abc"); // 堆中新建对象
s1 == s2;                   // false
s1.equals(s2);              // true
```

**面试重点**：`String` 不可变、`StringBuilder` 可变、字符串拼接的底层原理。

## 三、集合框架

| 接口 | 实现类 | 特点 |
|------|--------|------|
| `List` | `ArrayList` | 数组实现，查询快，插入慢 |
| `List` | `LinkedList` | 双向链表，插入快，查询慢 |
| `Set` | `HashSet` | 基于 HashMap，无序去重 |
| `Map` | `HashMap` | 数组+链表+红黑树，`key` 允许 null |
| `Map` | `LinkedHashMap` | 保持插入顺序（LruCache 的基础） |

## 四、反射与注解

```java
Class<?> clazz = Class.forName("com.example.User");
Object obj = clazz.getDeclaredConstructor().newInstance();
Method method = clazz.getMethod("setName", String.class);
method.invoke(obj, "Android");
```

反射是 **Retrofit、Glide、EventBus** 等框架的底层基石。

## 五、JVM 内存模型（简版）

- **堆（Heap）**：对象实例，GC 主要区域
- **虚拟机栈**：方法调用帧，局部变量
- **方法区/元空间**：类信息、常量、静态变量
- **程序计数器**：当前线程执行字节码的行号

## 六、Android 中的 Java 高频考点

1. `HashMap` 扩容机制与并发问题（1.7 头插法、1.8 尾插法）
2. `ArrayList` 与 `LinkedList` 的对比与选择
3. `==` 与 `equals`、`hashCode` 的约定关系
4. 内部类与静态内部类、内存泄漏场景
5. `synchronized` 与 `volatile` 的区别

## 七、类与类之间的关系

| 关系 | 含义 | Java 体现 | 图示 |
|------|------|-----------|------|
| 泛化 | 继承 | `extends` | 虚线三角箭头 |
| 实现 | 接口实现 | `implements` | 实线三角箭头 |
| 关联 | 类间联接（可双向/单向） | 实例变量 | 实线箭头 |
| 聚合 | 整体与个体的强关联 | 实例变量（逻辑判断） | 实线 + 空心菱形 |
| 合成 | 比聚合更强，整体负责部分生命周期 | 实例变量 | 实线 + 实心菱形 |
| 依赖 | 单向，临时使用 | 局部变量、方法参数、静态调用 | 虚线箭头 |

> 关联与聚合在 Java 语法上无法区分，需考察逻辑关系；不确定时按关联处理。

## 八、对象的存储位置与基本类型

### 存储位置

| 存储区 | 特点 |
|--------|------|
| 寄存器 | 处理器内部，最快但大小有限，无法直接控制 |
| 堆栈 | RAM 中，速度仅次于寄存器；Java 中只存对象引用 |
| 堆 | RAM 中的通用内存池，存放所有 Java 对象 |
| 常量存储 | 常量值直接放在程序代码内部，永不改变 |
| 非 RAM 存储 | 存活于程序之外，如持久化对象 |

### 基本类型数值自动提升规则

| 场景 | 结果类型 |
|------|----------|
| 操作数含 `double` | `double` |
| 操作数含 `float` | `float` |
| 操作数含 `long` | `long` |
| 其余（byte/short/int/char） | `int` |

高精度计算：`BigInteger`（任意精度整数）、`BigDecimal`（任意精度定点数，适合货币计算）。

### static 关键字

- static 字段：所有对象**共享一份空间**；非 static 字段每个对象各有一份
- static 方法：无需创建对象即可调用（`main()` 入口即依赖此特性）

> 📖 进阶阅读：[Java 集合框架详解](java-collections.md) | [线程池与并发](/network/thread/) | [JVM 内存区域与内存溢出](jvm/JVM内存区域与内存溢出.md)

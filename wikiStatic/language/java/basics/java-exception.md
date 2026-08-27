---
icon: bug
title: Java 异常体系
---

# Java 异常体系

> 本章梳理 Java 异常体系的整体结构、异常与错误的区别，以及 try-catch-finally 的执行细节和内存溢出（OOM / SOF）的常见场景。

## 一、异常体系结构

Java 中所有错误与异常的根类是 `Throwable`，其包含两个子类：

```
Throwable
├── Error（错误，程序无法处理）
└── Exception（异常，程序可以处理）
    ├── RuntimeException（运行时异常，编译器不检查）
    └── 其他受检查异常（Checked Exception）
```

各类异常与错误的说明如下：

| 类别 | 定义 | 编译器检查 | 示例 | 处理方式 |
| --- | --- | --- | --- | --- |
| 运行时异常 | RuntimeException 及其子类 | 不检查，可编译通过 | ArithmeticException（除零）、IndexOutOfBoundsException（数组越界）、ConcurrentModificationException | 修改代码避免，也可 throws / try-catch |
| 受检查异常 | Exception 中除运行时异常外的子类 | 必须 throws 或 try-catch，否则无法编译 | CloneNotSupportedException、IOException | throws 声明或 try-catch 捕获 |
| 错误 | Error 及其子类 | 不检查 | VirtualMachineError（含 OOM） | 程序本身无法修复 |

**选择原则（《Effective Java》建议）：** 对于可恢复的条件使用受检查异常，对于程序错误使用运行时异常。按照 Java 惯例，不应实现任何新的 Error 子类。

## 二、Error 与 Exception 的区别

- **Error：** 表示系统级的错误，是恢复困难甚至不可能恢复的严重问题，如内存溢出。程序不必处理，也不可能指望程序处理。
- **Exception：** 表示需要捕获或由程序处理的异常，是一种设计或实现问题，程序运行正常时不会发生。

## 三、try-catch-finally 的执行细节

### try 里有 return，finally 还执行吗？

会执行。finally 代码块在方法返回调用者之前执行。

Java 允许在 finally 中改变返回值，但这是不好的做法：如果存在 finally 代码块，try 中的 return 不会立即返回，而是先记录下返回值，待 finally 代码块执行完毕后再向调用者返回。若在 finally 中修改返回值，会对程序造成很大困扰（C# 从语法层面禁止了这种行为）。

### try、finally 都有 return 时

如果 try 里有 return，finally 里也有 return，**finally 中的 return 会覆盖 try 中的返回值**，最终返回的是 finally 中的值。

## 四、OOM 与 SOF 的常见场景

除程序计数器外，虚拟机内存的其他运行时区域都可能发生 OutOfMemoryError（OOM）。

### 1. Java 堆溢出

- 异常信息：`java.lang.OutOfMemoryError: Java heap space`
- 原因：不断创建对象，且保证 GC Roots 到对象之间有可达路径，避免垃圾回收，对象数量达到最大堆容量后溢出。
- 排查：先用内存映像分析工具（如 Eclipse MAT）分析 dump 出的堆转储快照，确认内存中的对象是否必要，分清是内存泄漏还是内存溢出。
  - 内存泄漏：查看泄漏对象到 GC Roots 的引用链，找到无法回收的原因。
  - 内存溢出：检查虚拟机参数（-Xmx 与 -Xms）设置是否适当。

### 2. 虚拟机栈和本地方法栈溢出

- 线程请求的栈深度大于虚拟机允许的最大深度 → `StackOverflowError`（SOF），典型如无限递归。
- 虚拟机扩展栈时无法申请到足够内存 → `OutOfMemoryError`。
- 注意：栈大小越大，可分配的线程数越少。

### 3. 运行时常量池溢出

- 异常信息：`java.lang.OutOfMemoryError: PermGen space`
- 典型操作：大量调用 `String.intern()` 添加字符串到常量池。
- 常量池分配在方法区，可通过 -XX:PermSize 和 -XX:MaxPermSize 限制大小。

### 4. 方法区溢出

- 异常信息：`java.lang.OutOfMemoryError: PermGen space`
- 方法区存放类的相关信息（类名、修饰符、常量池、字段与方法描述等）。
- 类被 GC 回收的判定条件很苛刻，在经常动态生成大量 Class 的应用中（如热部署、反射生成代理类）要特别注意。

## 五、异常处理的最佳实践

1. 不要捕获 `Error`，也不要捕获 `RuntimeException` 后假装无事发生。
2. 优先使用受检查异常表达可恢复的条件，运行时异常表达程序错误。
3. finally 中不要修改返回值，也不要在 finally 中抛出可能覆盖原始异常的异常。
4. 捕获异常时要记录完整堆栈（`printStackTrace()` 或日志），便于定位问题。

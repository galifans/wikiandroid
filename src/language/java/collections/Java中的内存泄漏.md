---
icon: droplet
title: Java 中的内存泄漏
---

# Java 中的内存泄漏

> 长生命周期对象持有短生命周期对象的引用，导致后者无法被 GC 回收。

## Java 内存回收机制

- 对象通过 `new` 或反射在**堆**中创建
- 所有对象由 JVM 通过**垃圾回收机制**（GC）回收
- GC 使用**有向图**方式管理内存，实时监控对象是否可达，不可达则回收，同时消除引用循环问题
- 判断对象可回收的两个标准：赋予 `null` 值后不再调用；赋予新值重新分配内存

## 什么是内存泄漏

内存泄漏指**无用对象（不再使用的对象）持续占有内存**，内存得不到及时释放，造成内存空间浪费。严重时会提示 **Out of Memory**。

## 根本原因

> **长生命周期的对象持有短生命周期对象的引用**，短生命周期对象已不再需要，却因被长生命周期对象引用而无法被回收。

## 常见泄漏场景

### 1. 静态集合类引起泄漏

静态变量的生命周期与应用程序一致，它们引用的所有对象都无法释放：

```java
static Vector v = new Vector(10);
for (int i = 1; i < 100; i++) {
    Object o = new Object();
    v.add(o);
    o = null; // 只释放引用本身没用，Vector 仍引用该对象
}
```

**解决**：从集合中删除对象，或把集合对象本身置为 null。

### 2. 集合元素属性被修改后 remove() 失效

对象加入 HashSet 后若修改了影响 hashCode 的属性，remove() 将无法找到它：

```java
Set<Person> set = new HashSet<>();
set.add(p1);
set.add(p3);

p3.setAge(2);   // 修改 p3 的年龄，hashCode 改变
set.remove(p3); // remove 不掉 → 内存泄漏
set.add(p3);    // 反而添加成功，出现两个"重复"元素
```

**解决**：加入集合后不要修改影响 hashCode/equals 的属性。

### 3. 监听器未注销

注册了监听器（如 `addListener`）但忘记在销毁时注销，长生命周期的监听器持有短生命周期对象引用。

### 4. 非静态内部类持有外部类引用

非静态内部类隐式持有外部类的引用，若内部类对象生命周期长于外部类（如被静态集合持有），外部类无法被回收。

## Android 中的常见泄漏

- **Handler 持有 Activity**：Handler 作为非静态内部类持有 Activity，若任务未执行完 Activity 已销毁
- **Context 泄漏**：长生命周期对象持有 Activity Context（应用 Application Context）
- **单例持有 Activity 引用**
- **资源未关闭**：Cursor、Stream、Bitmap 未回收

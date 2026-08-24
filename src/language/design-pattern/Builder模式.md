---
icon: bricks
title: Builder 建造者模式
---

# Builder 建造者模式

> 将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。

## 定义与使用场景

**定义**：将一个复杂对象的构建与它的表示分离，同样的构建过程可以创建不同的表示。

**使用场景**：

1. 相同方法、不同执行顺序产生不同事件结果
2. 多个部件可装配到同一对象，但产生的结果不同
3. 产品类非常复杂，或调用顺序不同产生不同效能

## Android 中的实现：AlertDialog.Builder

```java
AlertDialog.Builder builder = new AlertDialog.Builder(context);
builder.setIcon(R.drawable.icon);
builder.setTitle("Title");
builder.setMessage("Message");
builder.setPositiveButton("确定", listener);
builder.setNegativeButton("取消", listener);
builder.create().show();
```

`AlertDialog.Builder` 内部通过 `AlertController.AlertParams` 暂存参数，`create()` 时统一应用到新构建的 `AlertDialog`。

## 优点与缺点

**优点**：

- 良好的封装性，客户端无需知道产品内部组成细节
- 建造者独立，易于扩展
- 对象创建过程中使用的其他对象不易直接获取时尤其适用

**缺点**：

- 产生多余的 Builder 与 Director 对象，消耗内存
- 对象的构建过程暴露

---
icon: code
title: C++ 核心知识点
---

# C++ 核心知识点

> C++ 是音视频、底层框架开发的基础语言。本章汇总数据类型、指针引用、面向对象、类型转换、智能指针等核心知识点。

## 一、头文件与数据类型

### 头文件能包含什么

**.h 文件可以包含：** 类成员数据的声明（不能赋值）、类静态数据成员的定义、成员函数的声明、非类成员函数的声明、常数定义（如 `const int a = 5;`）、静态函数的定义、类的内联函数定义。

**.h 文件不能包含：** 所有非静态变量（非类数据成员）的声明；不要将默认命名空间声明（`using namespace std;`）放在头文件，应放在 .cpp 中。

### 基本数据类型

各基本数据类型占用的空间大小如下：

| 类型 | 占用空间 |
| --- | --- |
| char | 1 字节 |
| short int | 2 字节 |
| int | 4 字节 |
| long int | 8 字节 |
| float | 4 字节 |
| double | 8 字节 |
| long double | 16 字节 |
| wchar_t | 2 或 4 字节 |

### typedef 与常量

```cpp
typedef type newname;   // 为已有类型取新名字

#define LENGTH 10        // 预处理宏
const int WIDTH = 5;     // const 关键字
```

### 类型限定符

各类型限定符的含义如下：

| 限定符 | 含义 |
| --- | --- |
| const | 对象在程序执行期间不能被修改 |
| volatile | 告诉编译器不要优化该变量，程序直接从内存读取（变量可能被外部改变） |
| restrict | 由 restrict 修饰的指针是唯一访问它所指向对象的方式（C99 新增） |

### 存储类

各存储类的含义如下：

| 存储类 | 含义 |
| --- | --- |
| auto | 根据初始化表达式自动推断变量类型 |
| register | 定义存储在寄存器中的局部变量，不能对其应用一元 `&` 运算符 |
| static | 类数据成员：所有对象共享一个副本；全局变量：作用域限制在声明它的文件内 |
| extern | 全局变量的引用，对所有程序文件可见 |
| thread_local | 仅可在创建它的线程上访问，每个线程有自己的副本 |

## 二、引用与指针

引用与指针的对比说明如下：

| 对比项 | 引用 | 指针 |
| --- | --- | --- |
| 空值 | 不存在空引用，必须连接到合法内存 | 可以为空（nullptr） |
| 重定向 | 初始化后不能再指向其他对象 | 可随时指向其他对象 |
| 初始化 | 必须在创建时初始化 | 可以在任何时间初始化 |
| 本质 | 对象的别名 | 存储对象地址的变量 |

## 三、面向对象

### struct vs class

唯一定义区别是默认访问权限：**struct 默认 public，class 默认 private。**

### 成员函数与析构函数

```cpp
double Box::getVolume(void) {      // 外部使用 :: 定义成员函数
    return length * breadth * height;
}

class Line {
public:
    ~Line();   // 析构函数声明
private:
    double length;
};

Line::~Line(void) {                // 删除对象时执行
    cout << "Object is being deleted" << endl;
}
```

### 拷贝构造函数

使用同一类中之前创建的对象初始化新对象：

```cpp
class Line {
public:
    Line(int len);              // 简单构造函数
    Line(const Line &obj);      // 拷贝构造函数
private:
    int *ptr;
};

Line::Line(const Line &obj) {
    cout << "调用拷贝构造函数并为指针 ptr 分配内存" << endl;
    ptr = new int;
    *ptr = *obj.ptr;  // 拷贝值（深拷贝）
}
```

### 友元函数

友元函数定义在类外部，但有权访问类的所有 private 和 protected 成员：

```cpp
class Box {
private:
    double width;
public:
    friend void printWidth(Box box);   // 声明友元
};

// printWidth() 不是任何类的成员函数
void printWidth(Box box) {
    cout << "Width of box : " << box.width << endl;  // 可直接访问私有成员
}
```

### inline 内联函数

编译时编译器会把函数代码副本放置在每个调用该函数的地方。对内联函数做任何修改，都需要重新编译所有客户端。

### 继承类型

```cpp
class Rectangle : public Shape { ... };
```

三种继承类型的访问控制说明如下：

| 继承类型 | 说明 |
| --- | --- |
| public | 基类公有成员仍是派生类公有成员，保护成员仍是保护成员，私有成员不能被派生类直接访问 |
| protected | 基类的公有和保护成员成为派生类的保护成员 |
| private | 基类的公有和保护成员成为派生类的私有成员 |

### 运算符重载

```cpp
Box operator+(const Box& b) {
    Box box;
    box.length = this->length + b.length;
    box.breadth = this->breadth + b.breadth;
    return box;
}
```

## 四、动态内存、命名空间、预处理器

### 动态内存

```cpp
double* pvalue = new double;   // new 在堆上分配
delete pvalue;                  // delete 释放
```

### 命名空间

```cpp
namespace namespace_name { /* 代码声明 */ }
name::code;                    // 调用时加命名空间前缀
using namespace std;           // 之后可省略前缀
```

### 预处理器

- **#include：** 预编译时把所写文件内容一字不改地包含到当前文件。系统头文件用尖括号（在系统目录查找），用户自定义文件用双引号（先用户目录后系统目录）。
- **#define：** 创建符号常量（宏）：`#define PI 3.14159`。
- **条件编译：** `#ifdef DEBUG ... #endif`。

## 五、强制类型转换

四种强制类型转换的用途与特点对比如下：

| 转换 | 用途 | 特点 |
| --- | --- | --- |
| const_cast | 去除对象的 const 或 volatile 属性 | 仅去除属性，不做类型安全保证 |
| static_cast | 基本类型转换、类层次中上下行转换 | 只在编译时检查，无运行时检查；下行转换不安全 |
| dynamic_cast | 基类指针/引用安全转换为派生类 | 运行时检查；要求类型含虚函数；失败时指针返回 0，引用抛 bad_cast 异常 |
| reinterpret_cast | 无关类型的底层位模式重新解释 | 最危险，转换后应回到原始类型才安全 |

## 六、智能指针

三种智能指针的特点与性能对比如下：

| 智能指针 | 特点 | 性能 |
| --- | --- | --- |
| unique_ptr | 独占所有权，不支持复制和赋值，用 std::move 转移所有权 | 与裸指针大小一样，无额外消耗，性能最优 |
| shared_ptr | 共享所有权，内部引用计数；复制 +1，离开作用域 -1，为 0 时 delete | 内存占用是裸指针的两倍（裸指针 + 引用计数） |
| weak_ptr | 共享但不拥有对象，最后一个拥有者失去所有权时自动成空 | 用于解决 shared_ptr 循环引用 |

```cpp
auto w = std::make_unique<Widget>();
auto w2 = std::move(w);   // w2 获得所有权，w 变为 nullptr

auto s = std::make_shared<Widget>();  // 引用计数管理
```

## 七、内存空间

各内存区域的说明如下：

| 区域 | 说明 |
| --- | --- |
| 堆 | 操作系统维护的动态分配内存，malloc 分配，free 释放 |
| 栈 | 编译器自动分配释放，存放函数参数值、局部变量 |
| 自由存储区 | C++ 中通过 new 与 delete 动态分配和释放对象的抽象概念 |
| 全局区（静态区） | 全局变量和静态变量分配在此 |
| 常量存储区 | 存储常量字符串，程序结束后由系统释放 |

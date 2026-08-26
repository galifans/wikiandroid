# Java/Kotlin 代码块切换 — 转换规范（供转换批次使用）

## 目标

站点内每一个 ```java 或 ```kotlin 围栏代码块，都必须转换为 `::: code-tabs` 容器，
同时包含 **Java 与 Kotlin 两个版本**，默认激活 Java，切换按钮位于代码块右上角（由全局 CSS 处理）。

## 目标语法（必须严格遵守）

```
::: code-tabs

@tab:active Java

```java
// Java 版本代码
```

@tab Kotlin

```kotlin
// Kotlin 版本代码
```

:::
```

要点：
- `@tab:active Java` 是第一个 tab，且必须是 Java（`@tab` 与 `:active` 之间**无空格**）
- `@tab Kotlin` 是第二个 tab
- 容器标记 `::: code-tabs`、`@tab ...`、代码围栏、`:::` 全部顶格（列 0），
  容器行与代码围栏之间必须留**一个空行**
- Java/Kotlin 两个版本必须表达**同一个示例**，代码语义等价、忠实互译

## 转换规则

1. 原块是 Java → 补写 Kotlin 版本；原块是 Kotlin → 补写 Java 版本。
2. 代码内注释同样翻译为对应语言习惯（中文注释保持中文）。
3. 其余一切内容（正文、mermaid、text、xml、bash、cpp、c、groovy、gradle、aidl、
   proguard、properties、yaml、json、cmake 等）**一律不动**。
4. C/C++（```cpp / ```c）代码块**保持不变**（JNI/NDK/ART 场景必须使用 C/C++）。
5. 若代码块位于 `::: tip / warning / danger / info / details` 等容器内部，
   则将 `::: code-tabs` 嵌套在**同一容器内部**（容器标记仍保持原缩进层级）。
6. 不要改动标题、正文段落、表格、列表，也不要增删与本次转换无关的内容。
7. 不要把 `@tab` 写成 `@tab java`（小写、带空格）——必须精确为 `@tab:active Java` 与 `@tab Kotlin`。
8. 转换后文件中不应再出现**游离的** ```java / ```kotlin 围栏（每个都必须被 code-tabs 包裹）。

## 验证方式

对每个文件完成转换后自查：搜索 ```java 与 ```kotlin，确认每一个都处于
`::: code-tabs ... @tab:active Java ... @tab Kotlin ... :::` 结构内部。

## 参考范例（已完成的真实文件）

`src/android/context/context-overview.md` —— 其中"五、getSystemService 原理"小节
已按上述格式完成转换，可直接参考其精确格式（包括空行与标记写法）。

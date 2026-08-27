---
icon: art
title: 类加载机制详解
description: 类加载器体系、双亲委派模型、热修复原理、DexClassLoader vs PathClassLoader、类加载与安全
---

# 类加载机制详解

> 面试高频指数：高
> 类加载机制是热修复/插件化的技术基石，也是高级面试的常客。

## 1. 类加载的时机

```text
JVM/ART 类加载时机（用到才加载，非预加载）：
① 创建实例：new / 反射 newInstance
② 访问静态字段/静态方法
③ 反射调用（Class.forName）
④ 初始化子类（父类先加载）
⑤ 启动类（main / Application）
```

## 2. Android 类加载器体系

```text
BootClassLoader（启动类加载器）
 └─ 加载 Android 框架类（android.*）
     └─ PathClassLoader（路径类加载器）
         └─ 加载应用 dex（classes.dex）
             └─ DexClassLoader（动态加载 dex）
                 └─ 加载插件/热修复 dex
```

各加载器的职责对比说明如下：

| 类加载器 | 作用 | 特点 |
| --- | --- | --- |
| BootClassLoader | 加载系统框架类 | 最高优先级 |
| PathClassLoader | 加载已安装 App 的 dex | 默认应用类加载器 |
| DexClassLoader | 加载外部 dex（SD 卡/下载） | 热修复、插件化 |
| InMemoryDexClassLoader | 内存 dex | 启动优化 |

获取类加载器的示例代码如下：

::: code-tabs

@tab:active Java

```java
// 获取类加载器
ClassLoader loader = getClass().getClassLoader();           // PathClassLoader
ClassLoader systemLoader = ClassLoader.getSystemClassLoader();
```

@tab Kotlin

```kotlin
// 获取类加载器
val loader = javaClass.classLoader           // PathClassLoader
val systemLoader = ClassLoader.getSystemClassLoader()
```

:::

## 3. 双亲委派模型

```text
加载流程：
① 当前类加载器收到加载请求
② 先委托父加载器加载（递归）
③ 父加载器加载不到 → 自己加载

目的：
- 避免重复加载（框架类只加载一次）
- 安全：防止自定义类覆盖系统类（如 String）
```

双亲委派的核心实现如下：

::: code-tabs

@tab:active Java

```java
// 双亲委派的核心逻辑
class MyClassLoader extends ClassLoader {

    MyClassLoader(ClassLoader parent) {
        super(parent);
    }

    @Override
    public Class<?> loadClass(String name) throws ClassNotFoundException {
        // 先让父加载器尝试
        try {
            return getParent().loadClass(name);
        } catch (ClassNotFoundException e) {
            // 父加载不到，自己加载
            return findClass(name);
        }
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        // 从 dex 中查找并加载
        return super.findClass(name);
    }
}
```

@tab Kotlin

```kotlin
// 双亲委派的核心逻辑
class MyClassLoader : ClassLoader(parent) {

    override fun loadClass(name: String): Class<*> {
        // 先让父加载器尝试
        return try {
            parent!!.loadClass(name)
        } catch (e: ClassNotFoundException) {
            // 父加载不到，自己加载
            findClass(name)
        }
    }

    override fun findClass(name: String): Class<*> {
        // 从 dex 中查找并加载
        return super.findClass(name)
    }
}
```

:::

## 4. 热修复原理（类加载方案）

```text
核心思路：
利用"同名类不重复加载 + 类加载顺序"

实现：
① 把修复好的类打进补丁 dex
② 把补丁 dex 插入到 PathClassLoader 的 dex 数组【最前面】
③ 下次加载同名类时，先找到补丁类 → 完成替换

关键：元素组 dex 顺序（补丁在前）
```

热修复类加载方案的核心实现如下：

::: code-tabs

@tab:active Java

```java
// 热修复框架的简化实现（如 Tinker 思路）
void injectPatch(String patchedDexPath) {
    PathClassLoader pathClassLoader = (PathClassLoader) getApplicationClassLoader();

    // 反射获取 DexPathList 与 dexElements
    Field pathListField = PathClassLoader.class.getDeclaredField("pathList");
    pathListField.setAccessible(true);
    Object pathList = pathListField.get(pathClassLoader);

    // 把补丁 dex 转成 Element[]
    Object[] newElements = createDexElements(patchedDexPath);

    // 合并：补丁元素 + 原元素（补丁在前！）
    Field dexElementsField = pathList.getClass().getDeclaredField("dexElements");
    dexElementsField.setAccessible(true);
    Object[] originalElements = (Object[]) dexElementsField.get(pathList);
    Object[] merged = new Object[newElements.length + originalElements.length];
    System.arraycopy(newElements, 0, merged, 0, newElements.length);
    System.arraycopy(originalElements, 0, merged, newElements.length, originalElements.length);
    dexElementsField.set(pathList, merged);
}
```

@tab Kotlin

```kotlin
// 热修复框架的简化实现（如 Tinker 思路）
fun injectPatch(patchedDexPath: String) {
    val pathClassLoader = applicationClassLoader as PathClassLoader

    // 反射获取 DexPathList 与 dexElements
    val pathListField = PathClassLoader::class.java.getDeclaredField("pathList")
    pathListField.isAccessible = true
    val pathList = pathListField.get(pathClassLoader)

    // 把补丁 dex 转成 Element[]
    val newElements = createDexElements(patchedDexPath)

    // 合并：补丁元素 + 原元素（补丁在前！）
    val dexElementsField = pathList.javaClass.getDeclaredField("dexElements")
    dexElementsField.isAccessible = true
    val originalElements = dexElementsField.get(pathList) as Array<Any>
    dexElementsField.set(pathList, newElements + originalElements)
}
```

:::

**局限**：只能修复方法实现，无法新增/删除方法（结构变化需重启）。

## 5. 插件化与类加载

```text
插件化：动态加载未安装的模块（dex + 资源 + 组件）

关键技术：
① 插件 dex：DexClassLoader 加载
② 插件资源：AssetManager.addAssetPath 合并
③ 插件 Activity：Hook Instrumentation/占坑
④ 类冲突：插件与宿主类隔离（独立 ClassLoader）

方案：360 RePlugin、滴滴 VirtualAPK（已停更）、腾讯 Shadow
```

## 6. 高频面试题

**Q1：什么是双亲委派模型？**
A：类加载请求先委托给父加载器（递归向上），父加载不到才自己加载。
好处：避免重复加载、保证核心类安全（防篡改系统类）。

**Q2：PathClassLoader 和 DexClassLoader 的区别？**
A：PathClassLoader 加载已安装 App 的 dex（默认）；DexClassLoader 可加载
外部 dex 文件（SD 卡、下载目录），支持自定义路径。热修复/插件化用后者。

**Q3：热修复的原理是什么？**
A：类加载方案：把补丁 dex 插入类加载器 dex 数组最前面，同名类优先加载
补丁类。局限：只能改方法实现，不能新增方法/字段（结构变化）。

**Q4：热修复和插件化的区别？**
A：热修复：修复 bug，替换已加载的类（补丁包）；插件化：动态加载独立
模块（功能），需解决组件注册、资源合并、类隔离等问题，复杂度高。

**Q5：如何避免类加载导致的启动崩溃？**
A：主 dex 保留启动所需类（multidex keep 规则）；避免启动时反射加载
未分包类；R8 混淆后注意 keep 反射调用的类；插件化注意类隔离。

## 7. 小结

- 类加载器三级：Boot → Path → Dex。
- 双亲委派：先父后己，防重复防篡改。
- 热修复 = 补丁 dex 插队（类加载顺序）。
- 插件化 = 动态加载模块（dex + 资源 + 组件）。
- 面试重点：双亲委派、热修复原理、类加载器区别。

---
icon: magnet
title: Hook 技术详解
---

# Hook 技术详解

> Hook 技术通过反射等机制替换系统对象的行为，是热修复、插件化、无埋点统计等技术的基础。本章以替换 View 点击事件为例讲解 Hook 的基本流程。

## 一、Hook 的基本流程

1. **确定要 Hook 的对象**（根据需求）。
2. **寻找要 Hook 对象的持有者**，拿到要 Hook 的对象。
3. **定义"要 Hook 的对象"的代理类**，并创建该类的对象。
4. **用上一步创建的对象替换掉要 Hook 的对象。**

## 二、使用示例：替换 View 的点击事件

::: code-tabs

@tab:active Java

```java
public static void hook(Context context, final View view) {
    try {
        // 1. 反射执行 View 的 getListenerInfo() 方法，拿到 mListenerInfo 对象（点击事件的持有者）
        Method method = View.class.getDeclaredMethod("getListenerInfo");
        method.setAccessible(true);  // getListenerInfo() 不是 public，需要设置访问权限
        Object mListenerInfo = method.invoke(view);

        // 2. 从 ListenerInfo 中拿到当前的点击事件对象
        Class<?> listenerInfoClz = Class.forName("android.view.View$ListenerInfo");
        Field field = listenerInfoClz.getDeclaredField("mOnClickListener");
        final View.OnClickListener onClickListenerInstance =
                (View.OnClickListener) field.get(mListenerInfo);

        // 3. 创建自己的点击事件代理类（方式2：动态代理）
        Object proxyOnClickListener = Proxy.newProxyInstance(
                context.getClass().getClassLoader(),
                new Class[]{View.OnClickListener.class},
                new InvocationHandler() {
                    @Override
                    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                        Log.d("Hook", "点击事件被 hook 到了");  // 加入自己的逻辑
                        return method.invoke(onClickListenerInstance, args); // 执行原逻辑
                    }
                });

        // 4. 用代理类替换持有者中的原点击事件
        field.set(mListenerInfo, proxyOnClickListener);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

@tab Kotlin

```kotlin
fun hook(context: Context, view: View) {
    try {
        // 1. 反射执行 View 的 getListenerInfo() 方法，拿到 mListenerInfo 对象（点击事件的持有者）
        val method = View::class.java.getDeclaredMethod("getListenerInfo")
        method.isAccessible = true  // getListenerInfo() 不是 public，需要设置访问权限
        val mListenerInfo = method.invoke(view)

        // 2. 从 ListenerInfo 中拿到当前的点击事件对象
        val listenerInfoClz = Class.forName("android.view.View\$ListenerInfo")
        val field = listenerInfoClz.getDeclaredField("mOnClickListener")
        val onClickListenerInstance =
            field.get(mListenerInfo) as View.OnClickListener

        // 3. 创建自己的点击事件代理类（方式2：动态代理）
        val proxyOnClickListener = Proxy.newProxyInstance(
            context.javaClass.classLoader,
            arrayOf(View.OnClickListener::class.java),
            InvocationHandler { proxy, method, args ->
                Log.d("Hook", "点击事件被 hook 到了")  // 加入自己的逻辑
                method.invoke(onClickListenerInstance, *args!!) // 执行原逻辑
            })

        // 4. 用代理类替换持有者中的原点击事件
        field.set(mListenerInfo, proxyOnClickListener)
    } catch (e: Exception) {
        e.printStackTrace()
    }
}
```

:::

**两种代理方式：**

- **自定义代理类：** 实现 View.OnClickListener 接口，内部持有原监听器。
- **动态代理：** `Proxy.newProxyInstance(类加载器, 接口数组, InvocationHandler)`，无需为每个接口写代理类。

## 三、Hook 的两种思路

| 思路 | 原理 | 典型应用 |
| --- | --- | --- |
| Hook 对象（实例） | 替换某个实例对象，如替换 View 的 mOnClickListener | 无埋点统计、广告替换 |
| Hook 类（静态） | 替换静态字段或方法，如替换 ActivityThread 的 sCurrentActivityThread | 插件化、热修复 |

## 四、Hook 的应用场景

- **热修复：** Hook ClassLoader 实现代码替换（如 AndFix、Tinker 原理之一）。
- **插件化：** Hook Instrumentation 或 ActivityThread 实现未安装 APK 的启动。
- **无埋点统计：** Hook View 的点击事件统一采集。
- **系统能力扩展：** Hook PMS/WMS 等系统服务。

## 五、注意事项

1. 反射调用非 public 方法需要 `setAccessible(true)`，Android 9.0 后对隐藏 API 有限制（hidden API policy），Hook 系统 API 需要适配。
2. 动态代理要求目标必须实现接口；代理类只能代理接口方法。
3. Hook 属于"黑科技"，要谨慎使用：兼容性差、可能被系统更新破坏、有被检测风险。

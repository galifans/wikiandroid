---
icon: paper-plane
title: EventBus 源码分析
---

# EventBus 源码分析

> EventBus 是 Android 流行的发布/订阅事件总线框架。本章从自定义注解、注册订阅者、发送事件三个环节剖析其核心源码。

## 一、自定义注解

EventBus 通过 `@Subscribe` 注解标记订阅方法：

::: code-tabs

@tab:active Java

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface Subscribe {
    // 线程模式
    ThreadMode threadMode() default ThreadMode.POSTING;

    // 是否为粘性事件
    boolean sticky() default false;

    // 事件优先级
    int priority() default 0;
}
```

@tab Kotlin

```kotlin
@Documented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FUNCTION)
annotation class Subscribe(
    // 线程模式
    val threadMode: ThreadMode = ThreadMode.POSTING,

    // 是否为粘性事件
    val sticky: Boolean = false,

    // 事件优先级
    val priority: Int = 0
)
```

:::

订阅方法示例：

::: code-tabs

@tab:active Java

```java
@Subscribe(threadMode = ThreadMode.MAIN, priority = 1, sticky = true)
public void onEventMainThreadP1(IntTestEvent event) {
    handleEvent(1, event);
}
```

@tab Kotlin

```kotlin
@Subscribe(threadMode = ThreadMode.MAIN, priority = 1, sticky = true)
fun onEventMainThreadP1(event: IntTestEvent) {
    handleEvent(1, event)
}
```

:::

## 二、注册订阅者

`EventBus.getDefault().register(object)` 的流程：

::: code-tabs

@tab:active Java

```java
public void register(Object subscriber) {
    Class<?> subscriberClass = subscriber.getClass();
    List<SubscriberMethod> subscriberMethods =
            subscriberMethodFinder.findSubscriberMethods(subscriberClass);
    synchronized (this) {
        for (SubscriberMethod subscriberMethod : subscriberMethods) {
            subscribe(subscriber, subscriberMethod);
        }
    }
}
```

@tab Kotlin

```kotlin
fun register(subscriber: Any) {
    val subscriberClass = subscriber.javaClass
    val subscriberMethods =
        subscriberMethodFinder.findSubscriberMethods(subscriberClass)
    synchronized(this) {
        for (subscriberMethod in subscriberMethods) {
            subscribe(subscriber, subscriberMethod)
        }
    }
}
```

:::

**核心：通过反射查找订阅者类里的订阅事件，并添加到 METHOD_CACHE 缓存：**

::: code-tabs

@tab:active Java

```java
List<SubscriberMethod> findSubscriberMethods(Class<?> subscriberClass) {
    List<SubscriberMethod> subscriberMethods = METHOD_CACHE.get(subscriberClass);
    if (subscriberMethods != null) {
        return subscriberMethods;
    }
    if (ignoreGeneratedIndex) {
        subscriberMethods = findUsingReflection(subscriberClass);
    } else {
        subscriberMethods = findUsingInfo(subscriberClass);
    }
    if (subscriberMethods.isEmpty()) {
        throw new EventBusException("Subscriber " + subscriberClass
                + " and its super classes have no public methods with the @Subscribe annotation");
    } else {
        METHOD_CACHE.put(subscriberClass, subscriberMethods);
        return subscriberMethods;
    }
}
```

@tab Kotlin

```kotlin
fun findSubscriberMethods(subscriberClass: Class<*>): List<SubscriberMethod> {
    METHOD_CACHE[subscriberClass]?.let { return it }
    val subscriberMethods = if (ignoreGeneratedIndex) {
        findUsingReflection(subscriberClass)
    } else {
        findUsingInfo(subscriberClass)
    }
    if (subscriberMethods.isEmpty()) {
        throw EventBusException(
            "Subscriber $subscriberClass and its super classes have no " +
                "public methods with the @Subscribe annotation")
    } else {
        METHOD_CACHE[subscriberClass] = subscriberMethods
        return subscriberMethods
    }
}
```

:::

**反射查找逻辑要点：**

- 使用 `getDeclaredMethods()`（比 `getMethods()` 快，尤其订阅类是 Activity 这种大对象时）。
- 方法必须是 `public` 且非 static、非 abstract。
- 参数必须是 1 个（事件类型）。
- 必须带有 `@Subscribe` 注解。

## 三、发送事件

`EventBus.getDefault().post(object)` 的流程：

1. **根据事件类型获取对应的订阅者列表**（subscriptionsByEventType 是 `Map<Class<?>, CopyOnWriteArrayList<Subscription>>`）：

::: code-tabs

@tab:active Java

```java
private boolean postSingleEventForEventType(Object event,
        PostingThreadState postingState, Class<?> eventClass) {
    CopyOnWriteArrayList<Subscription> subscriptions;
    synchronized (this) {
        subscriptions = subscriptionsByEventType.get(eventClass);
    }
    if (subscriptions != null && !subscriptions.isEmpty()) {
        for (Subscription subscription : subscriptions) {
            postingState.event = event;
            postingState.subscription = subscription;
            boolean aborted = false;
            try {
                postToSubscription(subscription, event, postingState.isMainThread);
                aborted = postingState.canceled;
            } finally {
                postingState.event = null;
                postingState.subscription = null;
                postingState.canceled = false;
            }
            if (aborted) {
                break;
            }
        }
        return true;
    }
    return false;
}
```

@tab Kotlin

```kotlin
private fun postSingleEventForEventType(
    event: Any,
    postingState: PostingThreadState,
    eventClass: Class<*>
): Boolean {
    val subscriptions: CopyOnWriteArrayList<Subscription>?
    synchronized(this) {
        subscriptions = subscriptionsByEventType[eventClass]
    }
    if (subscriptions != null && subscriptions.isNotEmpty()) {
        for (subscription in subscriptions) {
            postingState.event = event
            postingState.subscription = subscription
            var aborted = false
            try {
                postToSubscription(subscription, event, postingState.isMainThread)
                aborted = postingState.canceled
            } finally {
                postingState.event = null
                postingState.subscription = null
                postingState.canceled = false
            }
            if (aborted) {
                break
            }
        }
        return true
    }
    return false
}
```

:::

2. **根据注册时获得的 Method 对象反射调用订阅方法：**

::: code-tabs

@tab:active Java

```java
void invokeSubscriber(Subscription subscription, Object event) {
    try {
        subscription.subscriberMethod.method.invoke(subscription.subscriber, event);
    } catch (InvocationTargetException e) {
        handleSubscriberException(subscription, event, e.getCause());
    } catch (IllegalAccessException e) {
        throw new IllegalStateException("Unexpected exception", e);
    }
}
```

@tab Kotlin

```kotlin
fun invokeSubscriber(subscription: Subscription, event: Any) {
    try {
        subscription.subscriberMethod.method.invoke(subscription.subscriber, event)
    } catch (e: InvocationTargetException) {
        handleSubscriberException(subscription, event, e.cause)
    } catch (e: IllegalAccessException) {
        throw IllegalStateException("Unexpected exception", e)
    }
}
```

:::

## 四、线程模式

各线程模式的触发时机说明如下：

| 模式 | 说明 |
| --- | --- |
| POSTING | 默认，在发送事件的线程直接调用 |
| MAIN | 在主线程调用，用于更新 UI |
| MAIN_ORDERED | 在主线程排队调用 |
| BACKGROUND | 后台线程调用，若发送线程不是主线程则直接调用 |
| ASYNC | 总是新建线程调用，适合耗时任务 |

## 五、总结

- **注册：** 反射扫描 @Subscribe 方法 → 缓存到 METHOD_CACHE → 按事件类型存入 subscriptionsByEventType。
- **发送：** 按事件类型查订阅者列表 → 根据线程模式切换到对应线程 → 反射调用订阅方法。
- **优化点：** 使用 ConcurrentHashMap 缓存方法列表避免重复反射；CopyOnWriteArrayList 保证并发安全。

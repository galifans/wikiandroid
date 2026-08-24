---
icon: shield-halved
title: ProGuard 代码混淆
---

# ProGuard 代码混淆

> ProGuard 是 Java/Android 的代码混淆与优化工具，具有压缩、优化、混淆三大功能。

## 一、三大功能

| 功能 | 说明 |
| --- | --- |
| 压缩（Shrink） | 检测并删除没有使用的类、字段、方法、特性 |
| 优化（Optimize） | 分析和优化 Java 字节码 |
| 混淆（Obfuscate） | 使用简短无意义的名称对类、字段、方法重命名 |

## 二、保留规则关键字

| 关键字 | 描述 |
| --- | --- |
| `keep` | 保留类和类中的成员，防止被混淆或移除 |
| `keepnames` | 保留类和类中的成员，防止被混淆，成员没被引用会被移除 |
| `keepclassmembers` | 只保留类中的成员，防止被混淆或移除 |
| `keepclassmembernames` | 只保留类中的成员，防止被混淆，成员没被引用会被移除 |
| `keepclasseswithmembers` | 保留类和类中的成员，保留指明的成员 |
| `keepclasseswithmembernames` | 保留类和类中的成员，保留指明的成员，成员没被引用会被移除 |

## 三、通配符

| 通配符 | 描述 |
| --- | --- |
| `<field>` | 匹配类中的所有字段 |
| `<method>` | 匹配类中的所有方法 |
| `<init>` | 匹配类中的所有构造函数 |
| `*` | 匹配任意长度字符，不包含包名分隔符 `.` |
| `**` | 匹配任意长度字符，包含包名分隔符 `.` |
| `***` | 匹配任意参数类型 |

## 四、公共混淆模板

```proguard
# 保留四大组件、Application 等不被混淆（子类可能被外部调用）
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# 保留 R 下面的资源
-keep class **.R$* { *; }

# 保留本地 native 方法不被混淆
-keepclasseswithmembernames class * {
    native <methods>;
}

# 保留 layout 中 onClick 对应的方法
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}

# 保留枚举类不被混淆
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# 保留自定义控件（继承自 View）
-keep public class * extends android.view.View {
    *** get*();
    void set*(***);
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# 保留 Parcelable 序列化类
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# 保留 Serializable 序列化类
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# 保留回调函数 onXXEvent、**On*Listener
-keepclassmembers class * {
    void *(**On*Event);
    void *(**On*Listener);
}

# WebView JS 接口
-keepattributes JavascriptInterface
-keep class android.webkit.JavascriptInterface { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# @Keep 注解
-keep,allowobfuscation @interface android.support.annotation.Keep
-keep @android.support.annotation.Keep class *
-keepclassmembers class * {
    @android.support.annotation.Keep *;
}
```

## 五、常用自定义规则

```proguard
# 不混淆某个类
-keep public class com.example.Test { *; }

# 不混淆某个包下所有类
-keep class com.example.test.** { *; }

# 不混淆某个类的子类
-keep public class * com.example.Test { *; }

# 不混淆类名中包含 model 的类及其成员
-keep public class **.*model*.** {*;}

# 不混淆某个接口的实现
-keep class * implements com.example.TestInterface { *; }

# 不混淆某个类的构造方法
-keepclassmembers class com.example.Test {
  public <init>();
}

# 不混淆某个类的特定方法
-keepclassmembers class com.example.Test {
  public void test(java.lang.String);
}
```

## 六、aar 中增加独立混淆配置

```gradle
android {
    defaultConfig {
        consumerProguardFile 'proguard-rules.pro'
    }
}
```

## 七、检查混淆与追踪异常

开启 Proguard 后，每次构建会输出映射文件（mapping.txt），包含类名到混淆后类名的映射关系。线上异常堆栈需通过 mapping 文件反混淆（Retrace 工具）才能定位原始代码位置。

**常用混淆选项：**

| 配置 | 说明 |
| --- | --- |
| `-dontobfuscate` | 不混淆（仅压缩优化） |
| `-optimizationpasses 5` | 指定优化次数 |
| `-printmapping mapping.txt` | 输出混淆映射文件 |
| `-applymapping filename` | 复用已有的 map 文件 |
| `-obfuscationdictionary filename` | 指定混淆名字典 |

::: tip 注意
开启混淆后必须保留 mapping 文件，否则无法还原线上崩溃堆栈。
:::

---
icon: puzzle
title: JNI 与 NDK 开发
---

# JNI 与 NDK 开发

> NDK（Native Development Kit）是一组可以在 Android 应用中编写 C/C++ 代码的工具，可使用自己的源代码构建，也可利用现有的预构建库。

## 一、使用 NDK 的目的

- 从设备获取更好的性能，用于计算密集型应用（游戏、物理模拟等）；
- 复用自己或其他开发者的 C/C++ 库，便于跨平台；
- NDK 集成了 OpenSL、Vulkan 等 API 规范，实现 Java 层无法做到的功能（如提升音频性能）；
- 增加反编译难度。

## 二、JNI 数据类型

### 基本数据类型

| Java 类型 | Native 类型 | 符号属性 | 字长 |
| --- | --- | --- | --- |
| boolean | jboolean | 无符号 | 8 位 |
| byte | jbyte | 无符号 | 8 位 |
| char | jchar | 无符号 | 16 位 |
| short | jshort | 有符号 | 16 位 |
| int | jint | 有符号 | 32 位 |
| long | jlong | 有符号 | 64 位 |
| float | jfloat | 有符号 | 32 位 |
| double | jdouble | 有符号 | 64 位 |

### 引用数据类型

| Java 引用类型 | Native 类型 | Java 引用类型 | Native 类型 |
| --- | --- | --- | --- |
| All objects | jobject | char[] | jcharArray |
| java.lang.Class | jclass | short[] | jshortArray |
| java.lang.String | jstring | int[] | jintArray |
| Object[] | jobjectArray | long[] | jlongArray |
| boolean[] | jbooleanArray | float[] | jfloatArray |
| byte[] | jbyteArray | double[] | jdoubleArray |
| java.lang.Throwable | jthrowable | | |

## 三、String 字符串操作

| JNI 函数 | 描述 |
| --- | --- |
| GetStringChars / ReleaseStringChars | 获得/释放指向 Unicode 编码字符串的指针 |
| GetStringUTFChars / ReleaseStringUTFChars | 获得/释放指向 UTF-8 编码字符串的指针 |
| GetStringLength | 返回 Unicode 编码字符串的长度 |
| GetStringUTFLength | 返回 UTF-8 编码字符串的长度 |
| NewString | 将 Unicode 编码的 C/C++ 字符串转换为 Java 字符串 |
| NewStringUTF | 将 UTF-8 编码的 C/C++ 字符串转换为 Java 字符串 |
| GetStringCritical / ReleaseStringCritical | 获得/释放指向字符串内容的指针 |
| GetStringRegion | 获取/设置 Unicode 编码字符串指定范围的内容 |
| GetStringUTFRegion | 获取/设置 UTF-8 编码字符串指定范围的内容 |

## 四、JNI 访问 Java 对象

::: code-tabs

@tab:active Java

```java
public class MyJob {
    public static String JOB_STRING = "my_job";
    private int jobId;

    public MyJob(int jobId) { this.jobId = jobId; }
    public int getJobId() { return jobId; }
}
```

@tab Kotlin

```kotlin
class MyJob(private val jobId: Int) {

    companion object {
        @JvmField
        var JOB_STRING = "my_job"
    }

    fun getJobId(): Int = jobId
}
```

:::

```cpp
#include <jni.h>

extern "C"
JNIEXPORT jint JNICALL
Java_com_example_myjniproject_MainActivity_getJobId(JNIEnv *env, jobject thiz, jobject job) {

    // 根据实例获取 class 对象
    jclass jobClz = env->GetObjectClass(job);
    // 或根据类名获取
    jclass jobClz = env->FindClass("com/example/myjniproject/MyJob");

    // 获取属性 id
    jfieldID fieldId = env->GetFieldID(jobClz, "jobId", "I");
    // 获取静态属性 id
    jfieldID sFieldId = env->GetStaticFieldID(jobClz, "JOB_STRING", "Ljava/lang/String;");

    // 获取方法 id
    jmethodID methodId = env->GetMethodID(jobClz, "getJobId", "()I");
    // 获取构造方法 id
    jmethodID initMethodId = env->GetMethodID(jobClz, "<init>", "(I)V");

    // 根据属性 id 获取属性值
    jint id = env->GetIntField(job, fieldId);
    // 根据方法 id 调用方法
    jint id2 = env->CallIntMethod(job, methodId);

    // 创建新对象
    jobject newJob = env->NewObject(jobClz, initMethodId, 10);

    return id;
}
```

## 五、NDK 基础开发流程

### 1. Java 中声明 native 方法

::: code-tabs

@tab:active Java

```java
public class MainActivity extends AppCompatActivity {

    static {
        System.loadLibrary("native-lib");
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d("MainActivity", stringFromJNI());
    }

    private native String stringFromJNI();
}
```

@tab Kotlin

```kotlin
class MainActivity : AppCompatActivity() {

    companion object {
        init {
            System.loadLibrary("native-lib")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        Log.d("MainActivity", stringFromJNI())
    }

    private external fun stringFromJNI(): String
}
```

:::

### 2. 编写 C++ 实现

```cpp
#include <jni.h>

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_myjniproject_MainActivity_stringFromJNI(
        JNIEnv *env,
        jobject /* this */) {
    std::string hello = "Hello from C++";
    return env->NewStringUTF(hello.c_str());
}
```

**命名规则与要点：**

- 函数名格式：`Java_包名_类名_方法名`；
- `extern "C"`：指定采用 C 语言的命名风格编译，否则 C 与 C++ 风格不同导致链接时找不到函数；
- `JNIEnv*`：指向 JNI 环境的指针，通过它访问 JNI 接口方法；
- `jobject`：表示 Java 对象中的 this；
- `JNIEXPORT` 和 `JNICALL`：JNI 定义的宏，可在 jni.h 中查到。

### 3. System.loadLibrary 加载流程

`System.load()` → `Runtime.load0()` → 调用 native 方法 `nativeLoad` → 实现中调用 `dvmLoadNativeCode`：

1. 如果 so 已加载过（findSharedLibEntry 命中），直接返回；
2. 未加载则 `dlopen(pathName, RTLD_LAZY)` 把 .so mmap 到进程空间；
3. 创建 `SharedLib` entry 加入列表；
4. `dlsym(handle, "JNI_OnLoad")` 查找并调用 so 的 `JNI_OnLoad` 方法，检查返回的 JNI 版本号（1.2/1.4/1.6）。

## 六、CMake 构建 NDK 项目

在 `app/build.gradle` 中配置：

```groovy
android {
    defaultConfig {
        externalNativeBuild {
            cmake {
                cppFlags ""
            }
        }
        ndk {
            abiFilters 'arm64-v8a', 'armeabi-v7a'
        }
    }
    externalNativeBuild {
        cmake {
            path "CMakeLists.txt"
        }
    }
}
```

`CMakeLists.txt`：

```cmake
# 定义 CMake 最低版本
cmake_minimum_required(VERSION 3.4.1)

# add_library() 添加库：native-lib 为库名，SHARED 表示动态库
add_library(native-lib SHARED src/main/cpp/native-lib.cpp)

# find_library 定位 NDK 库（log）
find_library(log-lib log)

# 将预构建库关联到自己的原生库
target_link_libraries(native-lib ${log-lib})
```

## 七、常用 NDK 原生 API

| API 级别 | 关键原生 API | 头文件 |
| --- | --- | --- |
| 3 | Java 原生接口 | `#include <jni.h>` |
| 3 | Android 日志记录 | `#include <android/log.h>` |
| 5 | OpenGL ES 2.0 | `#include <GLES2/gl2.h>` |
| 8 | Android 位图 API | `#include <android/bitmap.h>` |
| 9 | OpenSL ES | `#include <SLES/OpenSLES.h>` |
| 9 | 原生应用 API | `#include <android/native_activity.h>` |
| 18 | OpenGL ES 3.0 | `#include <GLES3/gl3.h>` |
| 21 | 原生媒体 API | `#include <media/NdkMediaCodec.h>` |
| 24 | 原生相机 API | `#include <camera/NdkCameraDevice.h>` |

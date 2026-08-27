---
icon: image
title: Bitmap 详解与图片压缩
---

# Bitmap 详解与图片压缩

> Bitmap 是 Android 中最占内存的资源之一。本章梳理 Bitmap 的配置信息、常用操作、BitmapFactory 的使用以及内存回收机制。

## 一、配置信息与压缩方式

Bitmap 中有两个内部枚举类：`Config` 用来设置颜色配置信息，`CompressFormat` 用来设置压缩方式。

### Config 颜色配置

不同 Config 决定每像素占多少字节，直接决定内存占用：

| Config | 单位像素所占字节数 | 说明 |
| --- | --- | --- |
| ALPHA_8 | 1 | 颜色信息只由透明度组成，占 8 位 |
| ARGB_4444 | 2 | 颜色信息由 rgba 四部分组成，每部分占 4 位，共 16 位 |
| ARGB_8888 | 4 | 颜色信息由 rgba 四部分组成，每部分占 8 位，共 32 位。默认配置，最占空间 |
| RGB_565 | 2 | 颜色信息由 rgb 组成，R 占 5 位、G 占 6 位、B 占 5 位，共 16 位 |
| RGBA_F16 | 8 | Android 8.0 新增，更丰富的色彩表现（HDR） |
| HARDWARE | 特殊 | Android 8.0 新增，Bitmap 直接存储在 graphic memory |

> 性能优化或防 OOM 时通常使用 `RGB_565`：ALPHA_8 只有透明度无意义，ARGB_4444 显示不清楚，ARGB_8888 占用内存最多。

### 图片占用内存大小计算

$$内存大小 = 宽 \times 高 \times 单位像素字节数$$

> 例如一张 400×500 的 PNG 图片，若解码为 ARGB_8888（4 字节/像素），占用内存为：400 × 500 × 4 = 800KB。注意 PNG 文件本身的大小（压缩后）与解码后的内存占用无关，内存占用取决于解码时选择的 Config。

### CompressFormat 压缩方式

压缩格式决定保存文件的体积与质量：

| 格式 | 说明 |
| --- | --- |
| JPEG | 有损压缩，压缩后可保存为 .jpg 或 .jpeg |
| PNG | 无损压缩，支持透明 |
| WEBP | 谷歌推出的格式，同等质量下体积更小（有损和无损两种） |

## 二、常用操作

### 裁剪、缩放、旋转、移动

用 Matrix 组合变换，一次 createBitmap 完成所有操作：

::: code-tabs

@tab:active Java

```java
Matrix matrix = new Matrix();
matrix.postScale(0.8f, 0.9f);   // 缩放
matrix.postRotate(-45);          // 旋转，参数为正则向右旋
matrix.postTranslate(100, 80);   // 平移，在上一次修改的基础上再次修改
Bitmap bitmap = Bitmap.createBitmap(source, 0, 0,
        source.getWidth(), source.getHeight(), matrix, true);
```

@tab Kotlin

```kotlin
val matrix = Matrix()
matrix.postScale(0.8f, 0.9f)   // 缩放
matrix.postRotate(-45)          // 旋转，参数为正则向右旋
matrix.postTranslate(100, 80)   // 平移，在上一次修改的基础上再次修改
val bitmap = Bitmap.createBitmap(source, 0, 0,
        source.width, source.height, matrix, true)
```

:::

### Bitmap 与 Drawable 转换

Drawable 先画到 Bitmap 的 Canvas 上，反向则直接包装：

::: code-tabs

@tab:active Java

```java
// Drawable -> Bitmap
public static Bitmap drawableToBitmap(Drawable drawable) {
    Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(),
            drawable.getIntrinsicHeight(),
            drawable.getOpacity() != PixelFormat.OPAQUE
                    ? Bitmap.Config.ARGB_8888 : Bitmap.Config.RGB_565);
    Canvas canvas = new Canvas(bitmap);
    drawable.setBounds(0, 0, drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight());
    drawable.draw(canvas);
    return bitmap;
}

// Bitmap -> Drawable
public static Drawable bitmapToDrawable(Resources resources, Bitmap bm) {
    return new BitmapDrawable(resources, bm);
}
```

@tab Kotlin

```kotlin
// Drawable -> Bitmap
fun drawableToBitmap(drawable: Drawable): Bitmap {
    val bitmap = Bitmap.createBitmap(
            drawable.intrinsicWidth,
            drawable.intrinsicHeight,
            if (drawable.opacity != PixelFormat.OPAQUE)
                Bitmap.Config.ARGB_8888 else Bitmap.Config.RGB_565)
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, drawable.intrinsicWidth, drawable.intrinsicHeight)
    drawable.draw(canvas)
    return bitmap
}

// Bitmap -> Drawable
fun bitmapToDrawable(resources: Resources, bm: Bitmap): Drawable {
    return BitmapDrawable(resources, bm)
}
```

:::

### 保存与释放

compress 输出到文件，用完务必 recycle 释放原生内存：

::: code-tabs

@tab:active Java

```java
Bitmap bitmap = BitmapFactory.decodeResource(getResources(), R.drawable.test);
File file = new File(getFilesDir(), "test.jpg");
try {
    FileOutputStream outputStream = new FileOutputStream(file);
    bitmap.compress(Bitmap.CompressFormat.JPEG, 90, outputStream);
    outputStream.flush();
    outputStream.close();
} catch (IOException e) {
    e.printStackTrace();
}
// 释放 bitmap 的资源，这是一个不可逆转的操作
bitmap.recycle();
```

@tab Kotlin

```kotlin
val bitmap = BitmapFactory.decodeResource(resources, R.drawable.test)
val file = File(filesDir, "test.jpg")
try {
    val outputStream = FileOutputStream(file)
    bitmap.compress(Bitmap.CompressFormat.JPEG, 90, outputStream)
    outputStream.flush()
    outputStream.close()
} catch (e: IOException) {
    e.printStackTrace()
}
// 释放 bitmap 的资源，这是一个不可逆转的操作
bitmap.recycle()
```

:::

## 三、BitmapFactory 与 Options

### 常用 Option 字段

Options 控制解码行为，几个字段各有用处：

| 字段 | 说明 |
| --- | --- |
| `inJustDecodeBounds` | 设为 true 不获取图片、不分配内存，但会返回图片宽高信息 |
| `inSampleSize` | 图片缩放的倍数 |
| `outWidth` / `outHeight` | 获取图片的宽高值 |
| `inPreferredConfig` | 色彩模式，默认 ARGB_8888；对透明度无要求时用 RGB_565（1 像素 2 字节） |
| `inScaled` | 为 true 时进行图片压缩，从 inDensity 到 inTargetDensity |
| `inDither` | 为 true 时解码器尝试抖动解码 |
| `inMutable` | 配置 Bitmap 是否可以更改 |
| `inPurgeable` | 内存不足时存储 Pixel 的内存空间是否可被回收 |

### 采样压缩（防 OOM 核心）

两步解码法：先只量尺寸，再按目标尺寸算采样倍数真正解码：

::: code-tabs

@tab:active Java

```java
public Bitmap decodeSampledBitmap(String filePath, int reqWidth, int reqHeight) {
    BitmapFactory.Options options = new BitmapFactory.Options();
    options.inJustDecodeBounds = true; // 只测量宽高，不分配内存
    BitmapFactory.decodeFile(filePath, options);

    int inSampleSize = 1;
    if (options.outHeight > reqHeight || options.outWidth > reqWidth) {
        inSampleSize = options.outWidth > options.outHeight
                ? Math.round((float) options.outHeight / reqHeight)
                : Math.round((float) options.outWidth / reqWidth);
    }

    options.inJustDecodeBounds = false;
    options.inSampleSize = inSampleSize;
    return BitmapFactory.decodeFile(filePath, options);
}
```

@tab Kotlin

```kotlin
fun decodeSampledBitmap(filePath: String, reqWidth: Int, reqHeight: Int): Bitmap {
    val options = BitmapFactory.Options()
    options.inJustDecodeBounds = true // 只测量宽高，不分配内存
    BitmapFactory.decodeFile(filePath, options)

    var inSampleSize = 1
    if (options.outHeight > reqHeight || options.outWidth > reqWidth) {
        inSampleSize = if (options.outWidth > options.outHeight)
            Math.round(options.outHeight.toFloat() / reqHeight)
        else Math.round(options.outWidth.toFloat() / reqWidth)
    }

    options.inJustDecodeBounds = false
    options.inSampleSize = inSampleSize
    return BitmapFactory.decodeFile(filePath, options)
}
```

:::

## 四、内存回收

::: code-tabs

@tab:active Java

```java
if (bitmap != null && !bitmap.isRecycled()) {
    bitmap.recycle(); // 回收并且置为 null
    bitmap = null;
}
```

@tab Kotlin

```kotlin
if (bitmap != null && !bitmap.isRecycled) {
    bitmap.recycle() // 回收并且置为 null
    bitmap = null
}
```

:::

Bitmap 类的构造方法都是私有的，只能通过 BitmapFactory 的静态方法实例化。生成 Bitmap 最终都是通过 JNI 调用实现的，所以 Bitmap 包含两部分内存：

- **Java 部分：** Bitmap 对象本身，系统 GC 会自动回收。
- **C 部分（Native 内存）：** 虚拟机不能直接回收，必须调用 `recycle()` 方法释放。

> 从 Bitmap 源码可以看到 `recycle()` 方法内部确实调用了 JNI 方法。Android 3.0 之后 Bitmap 的像素数据转移到堆内存（Java 侧管理），但 `recycle()` 仍是释放内存的推荐方式之一。

## 五、图片三级缓存

为了减少网络交互、避免浪费流量，采用"内存 → 本地 → 网络"三级缓存策略：

| 级别 | 加载顺序 | 特点 |
| --- | --- | --- |
| 内存缓存 | 优先访问 | 速度最快 |
| 本地缓存（SD 卡） | 次优先 | 速度快，不耗流量 |
| 网络加载 | 最后 | 慢、费流量，仅首次访问新内容时使用 |

**原理：** 首次加载 App 时通过网络获取图片，保存至本地 SD 卡和内存中；之后运行优先访问内存缓存，若内存中没有则加载本地缓存，只有初次访问新内容时才走网络。

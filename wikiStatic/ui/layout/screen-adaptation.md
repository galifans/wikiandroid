---
icon: mobile-screen
title: 屏幕适配方案
---

# 屏幕适配方案

> Android 设备屏幕尺寸和密度各异，屏幕适配是开发的基础功课。本章介绍 dp / sp 等单位换算、头条适配方案以及刘海屏适配。

## 一、常用单位

| 单位 | 全称 | 说明 |
| --- | --- | --- |
| dpi | dot per inch | 每英寸像素数 |
| dp | 密度无关像素 | 基于屏幕物理密度的抽象单元，相对于 160 dpi 屏幕：1 dp = 160 dpi 屏幕上的 1 px |
| sp | 与比例无关的像素 | 与 dp 类似，但会随用户字体大小偏好缩放，建议用于字体大小 |

**换算公式：**

```
dpi = px / inch
density = dpi / 160
dp = px / density
```

## 二、头条适配方案

核心思路：**修改系统的 Density 值，让设计稿宽度（如 360dp）在所有设备上保持一致**，从而所有 dp 单位自动适配。

```java
private static float sNoncompatDensity;
private static float sNoncompatScaledDensity;

private static void setCustomDensity(Activity activity, Application application) {
    final DisplayMetrics appDisplayMetrics =
            application.getResources().getDisplayMetrics();
    if (sNoncompatDensity == 0) {
        sNoncompatDensity = appDisplayMetrics.density;
        sNoncompatScaledDensity = appDisplayMetrics.scaledDensity;
        // 监听字体切换
        application.registerComponentCallbacks(new ComponentCallbacks() {
            @Override
            public void onConfigurationChanged(Configuration newConfig) {
                if (newConfig != null && newConfig.fontScale > 0) {
                    sNoncompatScaledDensity =
                            application.getResources().getDisplayMetrics().scaledDensity;
                }
            }

            @Override
            public void onLowMemory() {
            }
        });
    }

    // 适配后的 dpi 统一为 360
    final float targetDensity = appDisplayMetrics.widthPixels / 360f;
    final float targetScaledDensity =
            targetDensity * (sNoncompatScaledDensity / sNoncompatDensity);
    final int targetDensityDpi = (int) (160 * targetDensity);

    appDisplayMetrics.density = targetDensity;
    appDisplayMetrics.scaledDensity = targetScaledDensity;
    appDisplayMetrics.densityDpi = targetDensityDpi;

    final DisplayMetrics activityDisplayMetrics =
            activity.getResources().getDisplayMetrics();
    activityDisplayMetrics.density = targetDensity;
    activityDisplayMetrics.scaledDensity = targetScaledDensity;
    activityDisplayMetrics.densityDpi = targetDensityDpi;
}
```

**优缺点：** 侵入性小（几行代码全局生效），所有 dp 单位自动按宽度缩放；但设计稿宽高比与设备不一致时可能出现拉伸问题。

## 三、刘海屏适配

### Android P（9.0）及以上

通过 `DisplayCutout` 类确定非功能区域（凹口）的位置和形状，使用 `getDisplayCutout()` 获取：

| DisplayCutout 方法 | 说明 |
| --- | --- |
| `getBoundingRects()` | 返回 Rects 列表，每个都是显示屏上非功能区域的边界矩形 |
| `getSafeInsetLeft()` | 安全区域距屏幕左边的距离（px） |
| `getSafeInsetRight()` | 安全区域距屏幕右边的距离（px） |
| `getSafeInsetTop()` | 安全区域距屏幕顶部的距离（px） |
| `getSafeInsetBottom()` | 安全区域距屏幕底部的距离（px） |

`WindowManager.LayoutParams` 新增属性 `layoutInDisplayCutoutMode`：

| 模式 | 说明 |
| --- | --- |
| `LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT` | 只有当 DisplayCutout 完全包含在系统栏中时才允许窗口延伸到凹口区域，否则不与凹口区域重叠 |
| `LAYOUT_IN_DISPLAY_CUTOUT_MODE_NEVER` | 窗口决不允许与凹口区域重叠 |
| `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES` | 窗口始终允许延伸到屏幕短边上的凹口区域 |

### Android P 之前

不同厂商的刘海屏适配方案不尽相同（华为、小米、OPPO、vivo 各有 API），需分别查阅各家开发者文档适配。

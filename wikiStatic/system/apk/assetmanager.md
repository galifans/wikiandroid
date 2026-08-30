---
icon: apk
title: AssetManager 资源加载机制
description: AssetManager 结构、Resources 加载流程、资源查找、配置限定符匹配、资源缓存、App 资源与系统资源
---

# AssetManager 资源加载机制

> 面试高频指数：高
> 资源加载是 App 启动与页面渲染的高频路径，AssetManager 决定资源查找效率，也是热修复/换肤技术的关键点。

## 1. AssetManager 与 Resources

```text
Resources：面向开发者的资源访问 API
AssetManager：底层资源管理器（native 实现）

Resources.getXxx() → AssetManager.getXxx() → native 查找
```

```java
// 日常使用
String name = getResources().getString(R.string.app_name);
Drawable icon = getResources().getDrawable(R.drawable.icon);
```

| 类 | 职责 |
|----|------|
| Resources | 高层 API（字符串/图片/布局/颜色） |
| AssetManager | 底层资源索引与查找（native） |
| ResourcesImpl | 资源实现（配置、主题） |

## 2. AssetManager 结构

### 2.1 资源表挂载

```text
AssetManager 维护多个资源包（package）：
① 系统资源（framework-res.apk，包 ID 0x01）
② 应用资源（app.apk，包 ID 0x7f）
③ 动态添加的资源（热修复/换肤：addAssetPath）

每个包对应一份 resources.arsc + 资源文件
```

### 2.2 native 结构

```text
native 层关键结构：
AssetManager（Java 持有 mObject 指向 native 对象）
  └── AssetPath：资源包路径集合
      └── ApkAssets：单个 apk 资源（arsc + 资源文件映射）
          └── ResTable：解析后的资源表
```

## 3. 资源查找流程

### 3.1 查找链路

```text
Resources.getString(R.string.app_name)
→ AssetManager.getResourceEntryName/Value
→ native：ResTable 按资源 ID 查找
→ 配置匹配（density/language/night）
→ 返回资源值（字符串/文件路径/引用）
```

### 3.2 配置限定符匹配

```text
同一资源 ID 可能有多个配置版本：

res/
  drawable/icon.png        （默认）
  drawable-hdpi/icon.png   （hdpi）
  drawable-xxhdpi/icon.png （xxhdpi）
  drawable-night/icon.png  （夜间）

匹配规则（从精确到宽松）：
density → language → night → 默认
匹配失败逐级回退到默认配置
```

### 3.3 资源引用链

```text
资源值可以是引用（reference）：

<string name="app_name">@string/name_override</string>
<color name="primary">@color/blue</color>
<style name="AppTheme" parent="@style/Theme.Material">

查找时递归解析引用（最多若干层，防循环）
```

## 4. 资源缓存

### 4.1 缓存层次

| 层次 | 内容 | 说明 |
|------|------|------|
| TypedArray 缓存 | 样式属性 | 单次解析缓存 |
| 资源表缓存 | arsc 解析结果 | native 内存缓存 |
| 文件描述符缓存 | apk 内文件 | 减少重复打开 |
| 磁盘缓存 | 编译/合成文件 | 系统级 |

### 4.2 性能优化点

```text
资源加载性能关注：
- 高频路径：布局 inflate 时解析属性（TypedArray）
- 大图：解码（BitmapFactory）与采样
- 字符串池：arsc 全局字符串池索引

优化：
- 减少 getIdentifier（按名字查找慢，走哈希/线性）
- 复用 TypedArray / 缓存解析结果
- 布局扁平化减少属性解析次数
```

## 5. AssetManager 与热修复/换肤

### 5.1 热修复资源

```text
资源热修复原理：
- 通过反射向 AssetManager 添加资源包路径
  （addAssetPath 旧版 / ApkAssets 新版）
- 新包资源 ID 覆盖旧包 → 加载补丁资源

Android 9.0+ AssetManager 重构后，
直接反射 addAssetPath 受限，需适配新 API
（AssetManager.addAssetPathAsSharedLibrary 等）。
```

### 5.2 换肤实现

```text
换肤（换资源）方案：
① 资源包模式：独立皮肤 apk，运行时 addAssetPath
② 主题模式：Compose/View 主题切换
③ 动态属性：自定义 View 根据资源动态取值

资源包模式的坑：资源 ID 冲突、配置匹配、内存占用
```

## 6. 多语言与多密度

### 6.1 语言资源加载

```text
语言切换：
Resources.updateConfiguration(Configuration)
→ AssetManager 重新按配置匹配
→ 对应 language 限定符的资源生效

系统语言变化 → 应用重建（Activity recreate）
```

### 6.2 密度资源

```text
density 匹配：
- 设备 density（mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi）
- 查找最接近的密度资源
- 无匹配时按比例缩放（可能失真/放大）

优化：提供主流密度（xxhdpi 为主）
```

## 7. 高频面试题

**Q1：AssetManager 和 Resources 的关系？**
A：Resources 是高层 API，AssetManager 是底层资源管理器（native）。Resources.getXxx → AssetManager → native 资源表查找。AssetManager 还负责挂载 apk 资源包。

**Q2：资源查找时配置怎么匹配？**
A：按限定符从精确到宽松：density → language → night → 默认；无精确匹配回退默认配置。同一 ID 可对应多份资源文件。

**Q3：getIdentifier 为什么慢？**
A：按字符串名字动态查找资源 ID，native 侧做哈希/遍历匹配，且绕过了编译期静态引用优化。高频路径应使用静态 R.xxx 引用。

**Q4：资源热修复的原理？**
A：向 AssetManager 动态添加资源包路径（addAssetPath/ApkAssets），用补丁包覆盖原资源。Android 9.0+ 重构后需适配新 API。

**Q5：语言切换时资源如何更新？**
A：updateConfiguration 更新 Configuration，AssetManager 重新按配置匹配资源；系统语言变化触发 Activity recreate 重建界面。

## 8. 小结

- AssetManager 是 native 资源管理器，负责挂载 apk 与查找。
- 查找链路：Resources → AssetManager → ResTable（arsc）。
- 配置匹配：density/language/night 限定符逐级回退。
- 资源缓存与静态引用是性能关键。
- 热修复/换肤本质是动态挂载资源包。

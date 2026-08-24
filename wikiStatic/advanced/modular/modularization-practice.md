---
icon: module
title: 组件化架构实践
description: 模块化拆分、组件与模块区别、路由通信、编译模式切换、资源隔离、依赖版本统一
---

# 🧩 组件化架构实践

> 面试高频指数：⭐⭐⭐⭐
> 中大型项目必备的工程架构，也是高级面试的高频话题。

## 1. 为什么需要组件化

```text
单体应用的问题：
- 编译慢（改一行全量编译）
- 耦合严重（模块间互相依赖）
- 团队协作冲突（同一仓库同一模块）
- 测试成本高（回归范围大）

组件化的收益：
- 独立编译（单模块开发调试）
- 按模块团队分工
- 业务复用（多 App 共享组件）
- 按需集成（动态特性模块）
```

## 2. 概念区分

| 概念 | 说明 | 粒度 |
| --- | --- | --- |
| 模块（Module） | Gradle 工程单元 | 编译单元 |
| 组件（Component） | 独立业务功能（登录/首页） | 业务单元 |
| 插件化 | 动态加载（运行时） | 运行单元 |
| 组件化 | 编译期解耦（静态） | 编译单元 |

## 3. 工程结构

```text
project/
├── app（壳工程：组装 + 启动）
├── business/
│   ├── home（首页组件）
│   ├── user（用户组件）
│   └── order（订单组件）
├── core/
│   ├── network（网络库）
│   ├── ui（基础 UI 组件）
│   ├── common（公共工具）
│   └── router（路由库）
└── buildSrc / gradle（版本管理）
```

## 4. 编译模式切换

```groovy
// gradle.properties
// 控制单模块调试：true 独立运行 / false 集成运行
isModuleHome=true
isModuleUser=true

// 业务组件 build.gradle
if (project.hasProperty('isModuleHome') && isModuleHome.toBoolean()) {
    // 独立运行：Application 入口
    apply plugin: 'com.android.application'
    // 使用独立 AndroidManifest（含 Application/Launcher Activity）
    sourceSets.main.manifest.srcFile 'src/main/module/AndroidManifest.xml'
} else {
    // 集成运行：Library
    apply plugin: 'com.android.library'
}
```

```xml
<!-- 独立运行时的 Manifest（含入口） -->
<manifest>
    <application android:name=".HomeApplication">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## 5. 组件间通信：路由

```kotlin
// 路由表（Router）
@Router(path = "/user/profile")
class UserProfileActivity : AppCompatActivity()

// 跳转（跨组件调用，编译期无依赖）
Router.getInstance().build("/user/profile")
    .withString("userId", "123")
    .navigation(this)

// 服务调用（组件间方法调用）
interface UserService {
    fun isLogin(): Boolean
}

@Router(path = "/user/service")
class UserServiceImpl : UserService {
    override fun isLogin(): Boolean = SessionManager.isLogin
}

// 其他组件通过路由获取服务
val userService = Router.getInstance()
    .getService(UserService::class.java) as? UserService
```

**常用框架**：ARouter（阿里）、自研路由（注解 + 编译期生成路由表）。

## 6. 资源与依赖隔离

```groovy
// 资源前缀防止冲突
android {
    resourcePrefix "home_"
    // 强制 home 模块资源都以 home_ 开头
}

// 版本统一（Version Catalog，推荐）
// gradle/libs.versions.toml
[versions]
kotlin = "2.0.0"
retrofit = "2.9.0"

[libraries]
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
```

## 7. 组件化常见问题

```text
① 重复依赖：统一版本管理（Version Catalog），依赖冲突用 resolutionStrategy
② 资源冲突：resourcePrefix 前缀命名
③ 单例/全局数据：放 core 层，组件通过接口访问
④ 组件间跳转：统一走路由，禁止直接依赖
⑤ 混淆：组件发布 aar 需配置 keep 规则
⑥ 多 Application：独立模式各自 Application，集成模式用壳工程
```

## 8. 高频面试题

**Q1：组件化和模块化的区别？**
A：模块化是 Gradle 工程拆分（编译单元）；组件化强调业务解耦（路由通信、
独立调试、资源隔离）。组件化是模块化的进阶。

**Q2：组件间如何通信？**
A：页面跳转用路由（ARouter/自研）；方法调用用服务接口（路由注册实现类）；
数据共享走 core 层（公共仓库/单例）。禁止直接依赖组件。

**Q3：怎么实现单组件独立调试？**
A：gradle.properties 开关（isModule=true），组件切换 application/library
插件，独立 Manifest（含 Application 和 Launcher Activity），壳工程集成时
用 library 模式。

**Q4：ARouter 的原理？**
A：注解处理器（APT）编译期扫描 @Router 注解，生成路由表类（分组存储
path → Activity/Service 映射），运行时加载路由表，通过 Intent/反射跳转。

**Q5：组件化有哪些坑？**
A：依赖冲突（统一版本）；资源冲突（前缀）；Application 初始化顺序
（组件 Application 生命周期）；aar 混淆；组件间隐性耦合（通过接口/路由
泄漏实现细节）。

## 9. 小结

- 组件化 = 业务解耦 + 独立编译 + 路由通信。
- 编译模式切换（isModule）实现单组件调试。
- 路由 + 服务接口 + core 层 = 组件间通信三板斧。
- 面试重点：结构设计、路由原理、独立调试、常见坑。

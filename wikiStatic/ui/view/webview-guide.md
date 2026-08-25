---
icon: globe
title: WebView 使用与优化
---

# WebView 使用与优化

> WebView 用于在应用中加载网页。本章梳理 WebView 基本使用、WebSettings 配置、WebViewClient / WebChromeClient 回调以及加载优化和内存泄漏处理。

## 一、基本使用

```java
webView.getUrl();              // 获取当前页面的 URL
webView.getOriginalUrl();      // 获取原始 URL（重定向后可能与当前 url 不同）
webView.getTitle();            // 获取当前页面的标题
webView.getFavicon();          // 获取当前页面的 favicon
webView.getProgress();         // 获取当前页面的加载进度
webView.setNetworkAvailable(true); // 通知 WebView 内核网络状态
```

## 二、WebSettings 常用配置

### 存储

```java
settings.setDomStorageEnabled(true);  // 启用 HTML5 DOM storage API
settings.setDatabaseEnabled(true);    // 启用 Web SQL Database API（已不推荐）
settings.setAppCacheEnabled(true);    // 启用 Application Caches API（已废弃）
settings.setAppCachePath(context.getCacheDir().getAbsolutePath());
```

### JavaScript 与窗口

```java
settings.setJavaScriptEnabled(true);        // 是否支持 JavaScript，默认 false
settings.setSupportMultipleWindows(false);  // 是否支持多窗口
settings.setJavaScriptCanOpenWindowsAutomatically(false); // 是否允许 JS(window.open) 开窗
```

### 资源访问与加载

```java
settings.setAllowContentAccess(true);   // 是否可访问 Content Provider 资源
settings.setAllowFileAccess(true);      // 是否可访问本地文件
settings.setAllowFileAccessFromFileURLs(false);   // file url 的 JS 能否读取本地文件
settings.setAllowUniversalAccessFromFileURLs(false); // file url 的 JS 能否读取全部资源
settings.setLoadsImagesAutomatically(true); // 是否自动加载图片
settings.setBlockNetworkImage(false);       // 禁止加载网络图片
settings.setBlockNetworkLoads(false);       // 禁止加载所有网络资源
```

### 缩放与文本

```java
settings.setSupportZoom(true);
settings.setBuiltInZoomControls(false);
settings.setDisplayZoomControls(true);
settings.setDefaultTextEncodingName("UTF-8");
settings.setTextZoom(100);
```

### 版本相关

```java
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
    settings.setMediaPlaybackRequiresUserGesture(true);
}
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
    // 5.0+ 允许加载 http 和 https 混合页面（5.0 以下默认允许，5.0+ 默认禁止）
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
}
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
    settings.setOffscreenPreRaster(false);
}
```

### 缓存策略

```java
if (isNetworkConnected(context)) {
    // 根据 cache-control 决定是否从网络取数据
    settings.setCacheMode(WebSettings.LOAD_DEFAULT);
} else {
    // 没网时优先加载缓存（即使已过期）
    settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
}
```

## 三、WebViewClient 核心回调

| 回调 | 说明 |
| --- | --- |
| `shouldOverrideUrlLoading` | 拦截页面加载，返回 true 表示宿主 App 拦截处理该 url；API24 废弃不处理 POST 请求 |
| `shouldInterceptRequest` | 拦截资源请求并返回响应数据（非 UI 线程），返回 null 则 WebView 继续加载 |
| `onPageStarted` | 页面开始加载 |
| `onPageFinished` | 页面完成加载 |
| `onReceivedError` | 加载资源出错（API23 起新增重载，所有资源加载错误都会调用） |
| `onReceivedHttpError` | 收到 HTTP 错误（状态码大于等于 400） |
| `onReceivedSslError` | SSL 错误，默认行为是取消请求 |
| `onScaleChanged` | 页面缩放系数变化 |

## 四、WebChromeClient 核心回调

| 回调 | 说明 |
| --- | --- |
| `onProgressChanged` | 接收当前页面加载进度 |
| `onReceivedTitle` | 接收页面标题 |
| `onJsAlert` / `onJsConfirm` / `onJsPrompt` | 处理 JS 弹窗 |
| `getDefaultVideoPoster` | 视频未播放时的海报图 |

## 五、加载优化

1. **开启硬件加速：** 提高渲染速度。
2. **优化 JS 调用时机：** 减少 JS 注入次数，`onPageFinished` 后再注入。
3. **缓存策略：** 设置合理的 CacheMode，配合 Service Worker 缓存。
4. **懒加载：** 页面不可见时暂停加载（`onStop` 时 `webView.pauseTimers()`）。
5. **预加载：** 提前初始化 WebView 并加载首屏。
6. **本地资源替代：** 将常用静态资源放入 `assets`，重写 `shouldInterceptRequest` 拦截 URL，命中本地配置时直接返回本地资源，减少网络请求：

```java
mWebView.setWebViewClient(new WebViewClient() {
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        // 命中本地资源配置则用本地资源替代，否则走网络
        if (mDataHelper.hasLocalResource(url)) {
            WebResourceResponse response =
                mDataHelper.getReplacedWebResourceResponse(getApplicationContext(), url);
            if (response != null) {
                return response;
            }
        }
        return super.shouldInterceptRequest(view, url);
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        if (mDataHelper.hasLocalResource(url)) {
            WebResourceResponse response =
                mDataHelper.getReplacedWebResourceResponse(getApplicationContext(), url);
            if (response != null) {
                return response;
            }
        }
        return super.shouldInterceptRequest(view, request);
    }
});
```

> 其他思路：WebView 初始化慢可**预创建实例**等待复用；后端响应慢可让服务器**分块输出**；
> DNS/连接慢可**复用客户端域名连接**；JS 执行慢可将框架代码**提前拆分执行**、脚本后置不阻塞解析。

## 六、内存泄漏处理

WebView 持有 Activity 引用容易造成内存泄漏，处理方式：

1. **不要在布局 XML 中直接声明 WebView**，改为在代码中创建并添加到容器。
2. **Activity 销毁时释放：**

```java
@Override
protected void onDestroy() {
    if (webView != null) {
        webView.stopLoading();
        webView.loadUrl("about:blank");
        webView.removeAllViews();
        webView.destroy();
    }
    super.onDestroy();
}
```

3. **将 WebView 放入独立进程：** 通过 `android:process` 属性，进程被杀时回收全部内存。

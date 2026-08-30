import { defineClientConfig } from "vuepress/client";
import type { Router } from "vue-router";
import CodeTabs from "./components/CodeTabs.ts";

export default defineClientConfig({
  enhance({ app, router }) {
    // 覆盖 @vuepress/plugin-markdown-tab 注册的 CodeTabs 组件：
    // 支持"仅 Kotlin"代码块（Java tab 内容为空）→ Java 按钮灰化禁用、默认激活 Kotlin
    app.component("CodeTabs", CodeTabs);

    // 禁用浏览器原生滚动恢复，统一由 scrollBehavior 处理（savedPosition 分支负责恢复）
    if (typeof history !== "undefined") history.scrollRestoration = "manual";

    // 禁用 CSS 平滑滚动（theme-hope 在 html 上设置了 scroll-behavior: smooth）：
    // 平滑滚动动画一旦被中途的 hash 同步导航取消就会"卡在半路"（滚动回弹感），
    // 且动画期间滚动位置不连续。禁用后所有滚动（跳转/回顶/用户拖动）瞬时完成，
    // 由 scrollBehavior 精确控制，无可取消的动画窗口。
    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.textContent = "html, body { scroll-behavior: auto !important; }";
      document.head.appendChild(style);
    }

    // 用户主动点击带 hash 链接（搜索结果 / 目录 TOC / 侧边栏锚点）的标志。
    // 捕获阶段注册，先于 vue-router 的链接处理执行；scrollBehavior 消费该标志。
    // 用于区分"用户主动导航"与"theme-hope scrollspy 的 hash 同步导航"：
    // scrollspy 会在用户滚动后用 router.replace 改写 hash，若它也触发滚动逻辑，
    // 就会把正在阅读的用户"吸回"目标（滚动回弹），并与用户点击导航产生并发竞争。
    let userAnchorClick = false;
    if (typeof window !== "undefined") {
      window.addEventListener(
        "click",
        (event) => {
          const anchor = (event.target as HTMLElement | null)?.closest?.(
            'a[href*="#"]'
          ) as HTMLAnchorElement | null;
          if (anchor) userAnchorClick = true;
        },
        true
      );
    }

    // 浏览器后退/前进标志：back/forward 触发 popstate 后进入 vue-router 导航。
    // 用于 scrollBehavior 区分"用户点击链接"（userAnchorClick）与"浏览器
    // 前进/后退"——后者 savedPosition 可能为 null（manual scrollRestoration），
    // 此时若不干预，浏览器的原生 hash 定位 + scrollspy 改写会把页面带偏。
    let isPopState = false;
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", () => {
        isPopState = true;
      });
    }

    // 导航序号：多次导航的 scrollBehavior 并发时，只允许最新一次执行滚动，
    // 防止旧的（等待布局稳定耗时较长）导航在之后覆盖新的滚动结果。
    let scrollSeq = 0;

    // ---- 带 hash 跳转的统一滚动逻辑 ----
    // 等待渲染稳定 → 滚动到固定导航栏下方 → 修正 URL hash（防 scrollspy 改写）。
    // 返回是否执行了滚动。
    const performHashScroll = async (
      targetId: string,
      targetHash: string,
      force: boolean,
      mySeq: number,
      router: Router
    ): Promise<boolean> => {
      // 等待目标元素出现且 offsetTop 连续 5 次（约 250ms）稳定 → 异步内容渲染完毕
      const deadline = Date.now() + 5000;
      let lastTop: number | null = null;
      let stableCount = 0;
      while (Date.now() < deadline) {
        const el = document.getElementById(targetId);
        if (el) {
          const top = el.offsetTop;
          if (top === lastTop) {
            stableCount += 1;
            if (stableCount >= 5) break;
          } else {
            stableCount = 0;
            lastTop = top;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // 等待期间出现了更新的导航 → 放弃本次滚动
      if (mySeq !== scrollSeq) return false;

      const target = document.getElementById(targetId);
      if (!target) return false;

      // 目标已在视口顶部附近且非强制 → 已就位，无需滚动。
      // 初始加载时浏览器原生 hash 定位未考虑固定导航栏（目标被 navbar 遮住），
      // 需强制滚动到导航栏下方，故 force 时跳过该守卫。
      if (Math.abs(target.getBoundingClientRect().top) < 80 && !force) {
        return false;
      }

      // 等待导航栏渲染完成（初始加载时 Vue 可能尚未挂载导航栏）
      let navbar = document.querySelector(".vp-navbar");
      const navDeadline = Date.now() + 3000;
      while (!navbar && Date.now() < navDeadline) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        navbar = document.querySelector(".vp-navbar");
      }

      // 等待期间出现了更新的导航 → 放弃本次滚动
      if (mySeq !== scrollSeq) return false;

      const navBottom = navbar ? navbar.getBoundingClientRect().bottom : 60;

      // 滚动到固定导航栏下方，保证标题完全可见。
      // behavior:"instant" 覆盖 CSS smooth，滚动瞬时完成、无可取消的动画窗口。
      const scrollTop =
        target.getBoundingClientRect().top + window.scrollY - navBottom - 6;
      window.scrollTo({ top: scrollTop, behavior: "instant" });

      // 滚动后把 hash 修正回目标：theme-hope scrollspy 的 active 判定偏移仅
      // 5px（与导航栏高度不匹配），滚动到位后它会把 hash 改成相邻标题。
      // 轮询等待"目标到达导航栏下方"（滚动完成）→ 延迟 800ms（等 scrollspy
      // 先完成同步）→ 把 hash 改回目标；用户若已滚走则放弃。
      // 注意：不能用 router.replace({hash})——vue-router 对含中文/# 的 hash
      // 对象解析异常，会把整条 path 重新编码导致 404；用原生
      // history.replaceState 只改 URL，不经 vue-router。
      let hashFixed = false;
      const fixTimer = setInterval(() => {
        if (mySeq !== scrollSeq) {
          clearInterval(fixTimer);
          return;
        }
        const current = document.getElementById(targetId);
        if (!current) return;
        const rectTop = current.getBoundingClientRect().top;
        const nb =
          document.querySelector(".vp-navbar")?.getBoundingClientRect()
            .bottom ?? 0;
        if (rectTop >= nb - 40 && rectTop < nb + 300) {
          clearInterval(fixTimer);
          setTimeout(() => {
            if (hashFixed) return;
            hashFixed = true;
            const now = document.getElementById(targetId);
            if (!now) return;
            const rt = now.getBoundingClientRect().top;
            const nbb =
              document.querySelector(".vp-navbar")?.getBoundingClientRect()
                .bottom ?? 0;
            // 目标仍在视口顶部区域（用户未滚走）→ 修正 hash
            if (rt >= nbb - 30 && rt < nbb + 300) {
              const rawHash = targetHash.startsWith("#")
                ? targetHash
                : "#" + targetHash;
              history.replaceState(
                history.state,
                "",
                location.pathname + location.search + rawHash
              );
            }
          }, 800);
        }
      }, 100);
      setTimeout(() => clearInterval(fixTimer), 8000);

      return true;
    };

    // 修复锚点跳转不准 + 滚动回弹：
    // 1) 跳转不准：默认 scrollBehavior 在异步内容（mermaid 图、异步 chunk 等）
    //    渲染完成前就计算滚动位置，内容渲染后页面高度变化导致目标标题下移；
    //    且目标标题须滚到固定导航栏下方才可见（theme-hope scrollspy 用 offsetTop
    //    判定 active，偏移仅 5px，与导航栏高度不匹配）。
    //    → 用户导航时，等待目标元素 offsetTop 连续稳定（异步渲染完毕）后，
    //      滚动到导航栏下方，并把 hash 修正回目标。
    // 2) 滚动回弹：theme-hope scrollspy 在用户滚动后用 router.replace 同步 hash
    //    （其内部会临时禁用 scrollBehavior，故不会触发滚动）；这里再加一层守卫：
    //    仅"用户点击带 hash 链接"或"初始加载（直接打开带 hash 的 URL）"时
    //    滚动；scrollspy 同步等其余场景一律不滚动，用户可自由滚动阅读。
    //    注意：不能用 window.scrollY<5 判断初始加载——浏览器原生 hash 定位
    //    会把页面先滚到目标（scrollY 已 >0），导致该判断为假而跳过滚动。
    router.options.scrollBehavior = async (to, _from, savedPosition) => {
      // SSR 构建阶段没有 DOM
      if (typeof document === "undefined") return savedPosition;

      // 浏览器前进/后退：无 hash 时恢复原滚动位置。
      // 带 hash 时不恢复 savedPosition——离开时的 hash 可能已被 scrollspy
      // 改写（位置与 URL hash 不一致），直接恢复位置会与 URL 不匹配，
      // 触发 hashchange → 浏览器原生定位新 hash 的链式漂移。
      // 统一走 performHashScroll：滚到 hash 目标并修正 hash（切断链式）。
      if (savedPosition && !to.hash) return savedPosition;

      const mySeq = ++scrollSeq;

      if (to.hash) {
        // 初始加载判断：vue-router 的 START_LOCATION matched 为空
        const isInitialLoad = _from.matched.length === 0;
        // 后退/前进：popstate 已触发（savedPosition 为 null 时浏览器不提供
        // 位置恢复，需退化为滚动到 hash 目标并修正 hash）
        const pop = isPopState;
        isPopState = false;
        const shouldScroll = userAnchorClick || isInitialLoad || pop;
        userAnchorClick = false;
        if (!shouldScroll) return undefined;

        let targetId: string;
        try {
          targetId = decodeURIComponent(to.hash.slice(1));
        } catch {
          targetId = to.hash.slice(1);
        }

        // back/forward 与初始加载一样强制滚动（绕过 <80px 守卫），
        // 确保滚动到位并修正 hash
        await performHashScroll(
          targetId,
          to.hash,
          isInitialLoad || pop,
          mySeq,
          router
        );
        return undefined;
      }

      // 无 hash 导航：回到顶部
      return { top: 0 };
    };

    // 初始加载带 hash 的兜底：vue-router 首次导航不一定调用 scrollBehavior，
    // 且 VuePress 的 app 异步 chunk 可能在 load 事件之后才执行（load 监听
    // 会错过），故用轮询自检：一旦发现目标标题被导航栏遮挡（浏览器原生
    // hash 定位未考虑固定导航栏），就强制滚动到导航栏下方。
    if (typeof window !== "undefined" && location.hash) {
      let initialTargetId: string;
      try {
        initialTargetId = decodeURIComponent(location.hash.slice(1));
      } catch {
        initialTargetId = location.hash.slice(1);
      }
      const initialTargetHash = location.hash;
      const checkTimer = setInterval(() => {
        const el = document.getElementById(initialTargetId);
        if (!el) return;
        const nav = document.querySelector(".vp-navbar");
        if (!nav) return;
        // 目标与导航栏都就绪：强制滚动一次到位并修正 hash。
        // performHashScroll 内部幂等——已就位时重复滚动无副作用；
        // 关键是用 force=true 绕过 <80px 守卫，并借其 hash 修正逻辑
        // 把被 scrollspy 改写过的 hash（如相邻标题）改回目标。初始
        // 加载时用户尚未交互，强制滚动是期望行为。
        clearInterval(checkTimer);
        setTimeout(() => {
          performHashScroll(
            initialTargetId,
            initialTargetHash,
            true,
            scrollSeq,
            router
          );
        }, 50);
      }, 300);
      // 兜底超时（10s）停止，避免长期空转
      setTimeout(() => clearInterval(checkTimer), 10000);
    }
  },
});

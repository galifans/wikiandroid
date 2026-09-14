/**
 * 全站总访问量统计（前端上报 + 页脚展示）
 *
 * 与 Pages Functions（仓库根目录 functions/pv/[[path]].js）配合，同源调用：
 *   - 同一会话首次进入某页：POST /pv/hit  body { path } → 自增并返回 { total }
 *   - 同一会话再次进入：    GET  /pv/total            → 只读返回 { total }
 *   - 结果写入页脚占位元素 #wiki-site-pv
 *
 * 说明：服务端仍按页面路径分条记录（便于日后查看单页数据），
 * 但页脚**只展示全站总量**（= D1 中 SUM(count)），不展示单页数字。
 *
 * 关键点：
 *   - theme-hope 每次路由变化都用 innerHTML 重建 .vp-footer，占位元素会被重置，
 *     故用 MutationObserver 监听 DOM 变化并回填缓存值；
 *   - 仅在生产构建中调用（见 client.ts），避免本地 dev 污染线上计数；
 *   - 与站点同源（/pv/*），无需 CORS；接口不可用时静默失败，页脚保留占位符。
 */
import type { Router } from "vue-router";

export interface PageviewOptions {
    /** 统计接口基础路径（与站点同源），默认 /pv */
    endpoint?: string;
    /** 全站总访问量占位元素选择器 */
    totalSelector?: string;
}

interface PageviewData {
    total: number;
}

/** sessionStorage 键前缀（同一会话内同一路径只计一次） */
const SESSION_PREFIX = "wikiandroid:pv:";

/** 规范化路径：去掉 query / hash，确保以 / 开头（与服务端保持一致） */
const normalizePath = (raw: string): string => {
    const path = (raw || "/").split("#")[0].split("?")[0];
    return path.startsWith("/") ? path : `/${path}`;
};

const hasCounted = (path: string): boolean => {
    try {
        return sessionStorage.getItem(SESSION_PREFIX + path) === "1";
    } catch {
        // 隐私模式等场景下 sessionStorage 不可用：退化为每次都计数
        return false;
    }
};

const markCounted = (path: string): void => {
    try {
        sessionStorage.setItem(SESSION_PREFIX + path, "1");
    } catch {
        /* 忽略写入失败 */
    }
};

/** 千分位显示，如 12345 → 12,345 */
const format = (value: number): string => value.toLocaleString("en-US");

export const setupPageview = (
    router: Router,
    options: PageviewOptions
): void => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // 默认同源 /pv（Pages Functions）；去掉结尾斜杠后拼接 /hit 与 /total
    const base = (options.endpoint ?? "/pv").replace(/\/+$/, "");

    const totalSelector = options.totalSelector ?? "#wiki-site-pv";

    let data: PageviewData | null = null;
    let activePath = "";
    let rafId = 0;

    /** 把缓存的总量写入页脚占位元素（占位元素不存在则跳过） */
    const apply = (): void => {
        if (!data) return;

        const totalEl = document.querySelector(totalSelector);
        if (!totalEl) return;

        const text = format(data.total);
        if (totalEl.textContent !== text) totalEl.textContent = text;
    };

    /** rAF 节流：页脚重建等 DOM 变动可能非常频繁 */
    const scheduleApply = (): void => {
        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
            rafId = 0;
            apply();
        });
    };

    const report = async (): Promise<void> => {
        const path = normalizePath(location.pathname);

        // 同一路径且已有数据（如仅 hash 变化）→ 直接回填，不重复请求
        if (path === activePath && data) {
            scheduleApply();
            return;
        }

        activePath = path;
        const counted = hasCounted(path);

        try {
            const response = counted
                ? await fetch(`${base}/total`)
                : await fetch(`${base}/hit`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ path }),
                  });

            if (!response.ok) return;

            const payload = (await response.json()) as Partial<PageviewData>;

            // 等待期间又发生了新的导航 → 丢弃本次结果（新导航会再取一次）
            if (path !== activePath) return;

            data = { total: Number(payload.total) || 0 };

            if (!counted) markCounted(path);
            scheduleApply();
        } catch {
            // 网络异常（如统计服务未配置）静默失败，页脚保留占位符 “–”
        }
    };

    // 页脚每次路由变化都被主题重建为原始 HTML → 监听变化回填数值
    if (document.body) {
        const observer = new MutationObserver(scheduleApply);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    router.afterEach(() => {
        void report();
    });

    void report();
};

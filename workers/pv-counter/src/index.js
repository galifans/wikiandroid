/**
 * WikiAndroid 访问量统计 Worker（Cloudflare Workers + D1）
 *
 * 端点：
 *   POST /hit              body: { "path": "/android/..." } → 自增并返回 { page, total }
 *   GET  /stats?path=xxx   → 只读返回 { page, total }
 *   GET  /total            → 只读返回 { total }
 *   OPTIONS *              → CORS 预检
 *
 * 存储：D1 表 pageviews(path TEXT PRIMARY KEY, count INTEGER, updated_at INTEGER)
 * 全站总量 = SUM(count)，无需单独维护计数器 —— D1 的 UPSERT 自增天然原子，
 * 避免 KV 读-改-写在高并发下丢计数的问题。
 *
 * 部署见同目录 README.md。
 */

/** 允许跨域的前端来源（站点域名 / 备用域名） */
const ALLOWED_ORIGINS = new Set([
  "https://wikiandroid.com",
  "https://www.wikiandroid.com",
  "https://wikiandroid.pages.dev",
]);

/** 本地开发（vuepress dev / preview）允许的来源 */
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

/** 单条 path 最大长度，防超长垃圾写入 */
const MAX_PATH_LENGTH = 512;

const isAllowedOrigin = (origin) =>
  Boolean(origin) && (ALLOWED_ORIGINS.has(origin) || LOCALHOST_ORIGIN.test(origin));

const corsHeaders = (origin) => {
  const headers = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (isAllowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
};

const json = (data, origin, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(origin),
    },
  });

/** 规范化路径：仅保留 pathname、强制以 / 开头、限长，非法返回 null */
const normalizePath = (raw) => {
  if (typeof raw !== "string") return null;
  const path = raw.split("#")[0].split("?")[0].trim();
  if (!path.startsWith("/")) return null;
  if (path.length > MAX_PATH_LENGTH) return null;
  return path;
};

/** 从查询参数或 JSON body 读取 path */
const readPath = async (request) => {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("path");
  if (fromQuery) return normalizePath(fromQuery);
  if (request.method === "POST") {
    try {
      const body = await request.json();
      return normalizePath(body?.path);
    } catch {
      return null;
    }
  }
  return null;
};

/** 单条语句：某页计数 +1（UPSERT，原子） */
const hitStatement = (db, path, now) =>
  db
    .prepare(
      `INSERT INTO pageviews (path, count, updated_at) VALUES (?1, 1, ?2)
       ON CONFLICT(path) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at`
    )
    .bind(path, now);

const PAGE_COUNT_STATEMENT = (db, path) =>
  db.prepare("SELECT count FROM pageviews WHERE path = ?1").bind(path);

const TOTAL_STATEMENT = (db) =>
  db.prepare("SELECT COALESCE(SUM(count), 0) AS total FROM pageviews");

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
};

/** 自增某页计数并返回 { page, total }（batch 在同一事务内，读到的即最新值） */
const hit = async (db, path) => {
  const [page, total] = await db.batch([
    hitStatement(db, path, Date.now()),
    PAGE_COUNT_STATEMENT(db, path),
    TOTAL_STATEMENT(db),
  ]);
  return {
    page: toNumber(page?.results?.[0]?.count),
    total: toNumber(total?.results?.[0]?.total),
  };
};

/** 只读查询某页计数与全站总量 */
const stats = async (db, path) => {
  const [page, total] = await db.batch([
    PAGE_COUNT_STATEMENT(db, path),
    TOTAL_STATEMENT(db),
  ]);
  return {
    page: toNumber(page?.results?.[0]?.count),
    total: toNumber(total?.results?.[0]?.total),
  };
};

/** 只读查询全站总量 */
const readTotal = async (db) => {
  const row = await TOTAL_STATEMENT(db).first();
  return toNumber(row?.total);
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // 未绑定 D1 时明确报错，便于前端 / 部署阶段快速发现配置问题
    if (!env.DB) {
      return json({ error: "D1 binding `DB` is missing" }, origin, 500);
    }

    try {
      if (pathname === "/hit" && request.method === "POST") {
        const path = await readPath(request);
        if (!path) return json({ error: "invalid path" }, origin, 400);
        return json(await hit(env.DB, path), origin);
      }

      if (pathname === "/stats" && request.method === "GET") {
        const path = await readPath(request);
        if (!path) return json({ error: "invalid path" }, origin, 400);
        return json(await stats(env.DB, path), origin);
      }

      if (pathname === "/total" && request.method === "GET") {
        return json({ total: await readTotal(env.DB) }, origin);
      }

      return json({ error: "not found" }, origin, 404);
    } catch (error) {
      return json({ error: "internal error", message: String(error) }, origin, 500);
    }
  },
};

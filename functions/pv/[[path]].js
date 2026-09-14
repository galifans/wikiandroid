/**
 * WikiAndroid 全站总访问量统计（Cloudflare Pages Functions + D1）
 *
 * 与站点同源部署：放在仓库根目录的 functions/ 下，随 Pages 构建一起发布
 * （git push 即生效），无需单独部署 Worker，也不需要跨域配置。
 *
 * 路由（functions/pv/[[path]].js → /pv/*）：
 *   POST /pv/hit             body: { "path": "/android/..." } → 自增并返回 { total }
 *   GET  /pv/total           → 只读返回 { total }
 *   OPTIONS *                → 204（同源无需预检，保留兜底）
 *
 * 存储：D1 表 pageviews(path TEXT PRIMARY KEY, count INTEGER, updated_at INTEGER)
 * 全站总量 = SUM(count)，无需单独维护计数器 —— D1 的 UPSERT 自增天然原子，
 * 避免 KV 读-改-写在高并发下丢计数的问题。
 * 页脚只展示全站总量，但仍**按页面路径分条记录**，便于日后查看单页数据。
 *
 * 前置条件：在 Pages 项目 Settings → Bindings 添加 D1 database binding，
 * 变量名必须是 `DB`。部署与建表步骤见仓库根目录 architecture.md 第 5.1 节。
 *
 * 注意：src/.vuepress/public/_routes.json 把 Functions 调用限定在 /pv/*，
 * 其余静态页面不会触发 Functions 调用（保持静态请求不计费）。
 */

/** 单条 path 最大长度，防超长垃圾写入 */
const MAX_PATH_LENGTH = 512;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // 计数结果必须实时，禁止任何层级缓存
      "Cache-Control": "no-store",
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
  const fromQuery = new URL(request.url).searchParams.get("path");
  if (fromQuery) return normalizePath(fromQuery);
  if (request.method === "POST") {
    try {
      return normalizePath((await request.json())?.path);
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

const TOTAL_STATEMENT = (db) =>
  db.prepare("SELECT COALESCE(SUM(count), 0) AS total FROM pageviews");

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
};

/** 自增某页计数并返回最新全站总量（batch 在同一事务内，读到的即自增后的值） */
const hit = async (db, path) => {
  const [, total] = await db.batch([
    hitStatement(db, path, Date.now()),
    TOTAL_STATEMENT(db),
  ]);
  return { total: toNumber(total?.results?.[0]?.total) };
};

/** 只读查询全站总量 */
const readTotal = async (db) => toNumber((await TOTAL_STATEMENT(db).first())?.total);

export const onRequest = async ({ request, env, params }) => {
  const action = Array.isArray(params.path) ? params.path[0] : params.path;

  if (request.method === "OPTIONS") return new Response(null, { status: 204 });

  // 未绑定 D1 时明确报错，便于部署后快速发现配置问题
  // TODO(临时诊断，定位后删除)：把运行时可见的绑定名一并返回，用于排查
  // Pages Settings → Bindings 是否真正挂到了当前部署上。
  if (!env.DB) {
    return json(
      { error: "D1 binding `DB` is missing", bindings: Object.keys(env) },
      500
    );
  }

  try {
    if (action === "hit" && request.method === "POST") {
      const path = await readPath(request);
      if (!path) return json({ error: "invalid path" }, 400);
      return json(await hit(env.DB, path));
    }

    if (action === "total" && request.method === "GET") {
      return json({ total: await readTotal(env.DB) });
    }

    return json({ error: "not found" }, 404);
  } catch (error) {
    return json({ error: error?.message ?? "internal error" }, 500);
  }
};

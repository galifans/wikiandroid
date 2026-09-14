# WikiAndroid 访问量统计服务（Cloudflare Worker + D1）

为 wikiandroid.com 提供「全站总浏览量 + 每个子页面浏览量」统计。

- 前端展示：页脚（`总浏览量 xxx | 本页浏览 xxx | GitHub | MIT License`）
- 前端逻辑：`src/.vuepress/utils/pageview.ts`（由 `src/.vuepress/client.ts` 调用）
- 数据存储：Cloudflare D1（SQLite），免费额度足够个人站点使用

## 接口

| 方法 | 路径 | 说明 | 返回 |
| --- | --- | --- | --- |
| `POST` | `/hit` | JSON body `{ "path": "/android/..." }`，该页计数 +1 | `{ "page": 12, "total": 3456 }` |
| `GET` | `/stats?path=/android/...` | 只读查询（不计数） | `{ "page": 12, "total": 3456 }` |
| `GET` | `/total` | 只读查询全站总量 | `{ "total": 3456 }` |

同一会话（`sessionStorage`）内重复进入同一页只计一次，避免刷新刷量。

## 部署步骤

前置：Node.js + Cloudflare 账号（站点已在该账号下）。

```bash
# 1. 安装 wrangler（或在 Cloudflare 控制台操作，二选一）
npm i -g wrangler
wrangler login

# 2. 进入本目录
cd workers/pv-counter

# 3. 创建 D1 数据库（记录输出里的 database_id）
wrangler d1 create wikiandroid-pv

# 4. 把 database_id 填入 wrangler.toml 的 [[d1_databases]]

# 5. 建表（远程库）
wrangler d1 execute wikiandroid-pv --remote --file=./schema.sql

# 6. 部署 Worker
wrangler deploy
```

部署后会得到一个 `https://wikiandroid-pv.<你的子域>.workers.dev` 地址。

### 绑定自定义域名（推荐）

在 Cloudflare 控制台 → Workers & Pages → `wikiandroid-pv` → Settings → Domains & Routes，
添加 Custom Domain `pv.wikiandroid.com`（该域名需已托管在 Cloudflare）。

### 前端配置

把 Worker 地址填入 `src/.vuepress/client.ts` 的 `PAGEVIEW_ENDPOINT` 常量：

```ts
const PAGEVIEW_ENDPOINT = "https://pv.wikiandroid.com";
```

> 若使用 `*.workers.dev` 地址，记得把该地址也加进 `src/index.js` 的 `ALLOWED_ORIGINS`。
> 本地开发（`npm run dev`）不上报，不会污染线上数据。

## 验证

```bash
curl -X POST https://pv.wikiandroid.com/hit \
  -H "Content-Type: application/json" \
  -H "Origin: https://wikiandroid.com" \
  -d '{"path":"/test/"}'
curl "https://pv.wikiandroid.com/total"
```

## 说明与注意事项

- **全站总量** = `SUM(count)`，由 D1 的 `INSERT ... ON CONFLICT DO UPDATE count = count + 1` 原子自增，
  不依赖单独的计数器，避免并发丢数。
- **机器人流量**：当前对爬虫、预渲染访问同样计数。如需排除，可在 Worker 内检测
  `User-Agent`（含 `bot`/`spider`/`crawler`/`preview`）后跳过 `/hit`。
- **隐私**：不采集 IP、UA 或用户标识，仅记录路径计数，无个人信息。
- **重置某页**：`wrangler d1 execute wikiandroid-pv --remote --command "DELETE FROM pageviews WHERE path='/xxx/'"`。

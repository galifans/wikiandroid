-- WikiAndroid 访问量计数表
-- 每个页面路径一行，count 为该页累计浏览量；全站总量 = SUM(count)

CREATE TABLE IF NOT EXISTS pageviews (
    path       TEXT    PRIMARY KEY,
    count      INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0
);

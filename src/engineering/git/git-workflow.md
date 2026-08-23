---
icon: git
title: Git 工作流实践
description: Git Flow/GitHub Flow/Trunk Based 对比、分支模型、提交规范、PR 协作与 Code Review
---

# 🔀 Git 工作流实践

> 面试高频指数：⭐⭐⭐
> 规范的工作流决定团队协作效率，也是工程素养的体现。

## 1. 常见工作流对比

| 工作流 | 分支模型 | 适用 | 特点 |
| --- | --- | --- | --- |
| Git Flow | 多分支（feature/develop/release/hotfix） | 版本化发布（App） | 规范但复杂 |
| GitHub Flow | 单主分支 + feature 分支 + PR | 持续部署（Web） | 简单快速 |
| Trunk Based | 主干开发 + 短分支 | 高频率集成 | 最简单，要求高 |

### Git Flow（Android 常用）

```text
分支结构：
main（生产）         ← 只接受 release 合并
  └─ develop（开发主分支）
       ├─ feature/xxx（新功能）
       ├─ release/x.y（发布准备：修 bug、冻结功能）
       └─ hotfix/x.y.z（线上紧急修复，直接改 main）

流程：
feature 分支开发 → 合并 develop
→ release 分支（测试 + 修复）
→ 合并 main（打 tag） + 合并 develop
→ hotfix 从 main 切出，修复后合并 main + develop
```

## 2. 提交规范（Conventional Commits）

```text
格式：type(scope): description

常用 type：
feat    新功能
fix     修复 bug
docs    文档
style   格式（不影响逻辑）
refactor 重构（不改功能）
test    测试
chore   构建/工具

示例：
feat(login): 新增验证码登录
fix(home): 修复列表崩溃问题
docs(readme): 更新安装说明
```

## 3. 合并策略选择

| 策略 | 效果 | 适用 |
| --- | --- | --- |
| Merge Commit | 保留完整历史（含合并节点） | 需要完整时间线 |
| Squash Merge | 压缩为单条提交 | feature 分支（推荐） |
| Rebase Merge | 线性历史（重放提交） | 追求干净历史 |

```text
推荐组合（GitHub 默认风格）：
- feature 分支提交随意（wip 无妨）
- 合并用 Squash（一条清晰提交进主分支）
- 特殊情况用 Rebase（保持线性）
```

## 4. 团队协作流程（PR 模式）

```text
① 从 develop 拉 feature 分支
② 本地开发 + 提交（小步提交）
③ push 到远端 → 创建 Pull Request
④ Code Review（评审人检查）
   - 逻辑正确性、代码风格、测试覆盖
⑤ CI 自动检查（测试 + lint 必须过）
⑥ 通过后合并（Squash）
⑦ 删除已合并分支

PR 模板：背景 / 改动内容 / 测试说明 / 影响范围
```

## 5. 常用技巧

```bash
# 拉取最新并变基到本地分支
git pull --rebase

# 修改最近一次提交信息
git commit --amend

# 合并多个提交（交互式变基）
git rebase -i HEAD~3

# 临时保存工作区
git stash
git stash pop

# 挑取特定提交到当前分支
git cherry-pick <commit-hash>

# 撤销（区分场景）
git reset --soft HEAD~1   # 撤销提交，保留改动
git reset --hard HEAD~1   # 彻底丢弃（慎用）
git revert <commit-hash>  # 生成反向提交（已 push 用）
```

## 6. 高频面试题

**Q1：Git Flow 和 GitHub Flow 的区别？**
A：Git Flow 分支多（develop/release/hotfix），适合版本化发布（App，
需要发版节奏与 hotfix）；GitHub Flow 单主分支 + PR，适合持续部署
（Web）。Android 常用 Git Flow 或简化版。

**Q2：如何写提交信息？**
A：Conventional Commits：`type(scope): description`。
优点：自动生成 changelog、语义化版本、git log 可读性、可搜索。

**Q3：Squash 和 Rebase 的区别？**
A：Squash 把多个提交合并成一个（保留单个结果）；Rebase 重放提交
到目标分支（线性历史）。合并 feature 常用 Squash；保持历史线性
用 Rebase。

**Q4：如何解决冲突？**
A：git pull --rebase 后手动解决冲突文件 → git add → git rebase
--continue；或合并（merge）解决。原则：冲突范围小、及时解决、
解决后充分测试。

**Q5：线上紧急 bug 怎么处理？**
A：Git Flow：从 main 切 hotfix 分支 → 修复 → 合并 main（打补丁
版本 tag）+ 合并 develop。热修复发版（补丁版本号）优先于正常迭代。

## 7. 小结

- Git Flow 适合 Android 版本化发布（feature/develop/release/hotfix）。
- 提交规范：type(scope): desc（changelog 自动化基础）。
- 合并：feature 用 Squash，追求线性用 Rebase。
- PR + Code Review + CI 是团队质量保障核心。
- 面试重点：分支模型、提交规范、合并策略、冲突解决。

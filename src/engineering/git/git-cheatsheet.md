---
icon: git
title: Git 常用命令速查
description: Git 高频命令分类速查：基础、分支、合并、回滚、远程、stash、进阶技巧
---

# 🔀 Git 常用命令速查

> 面试高频指数：⭐⭐⭐
> 覆盖日常开发 90% 场景的 Git 命令清单。

## 1. 基础操作

```bash
# 初始化与克隆
git init                          # 初始化仓库
git clone <url>                   # 克隆远程仓库
git clone -b <branch> <url>       # 克隆指定分支

# 状态与查看
git status                        # 工作区状态
git log --oneline                 # 简洁提交历史
git log --graph --all             # 图形化历史
git diff                          # 工作区改动（未暂存）
git diff --cached                 # 已暂存改动

# 暂存与提交
git add <file>                    # 添加文件到暂存区
git add .                         # 添加所有改动
git commit -m "feat: 描述"        # 提交
git commit --amend                # 修改上次提交
git commit --amend --no-edit      # 不修改信息重提交
```

## 2. 分支操作

```bash
git branch                        # 查看本地分支
git branch -a                     # 查看所有分支（含远程）
git branch <name>                 # 创建分支
git branch -d <name>              # 删除分支（已合并）
git branch -D <name>              # 强制删除分支
git checkout <branch>             # 切换分支
git checkout -b <name>            # 创建并切换
git switch <branch>               # 切换（新语法）
git switch -c <name>              # 创建并切换（新语法）
git branch -m <old> <new>         # 重命名分支
```

## 3. 合并与变基

```bash
# 合并
git merge <branch>                # 合并分支到当前
git merge --no-ff <branch>        # 禁用快进合并（保留合并节点）

# 变基
git rebase <branch>               # 变基到目标分支
git rebase -i HEAD~3              # 交互式变基（合并/修改提交）
git rebase --continue             # 解决冲突后继续
git rebase --abort                # 放弃变基

# 冲突解决流程
# 1. 编辑冲突文件
# 2. git add <file>
# 3. git rebase --continue / git commit（merge 场景）

# 挑取提交
git cherry-pick <commit>          # 应用其他分支的提交
```

## 4. 撤销与回滚

```bash
# 工作区（未暂存）
git checkout -- <file>            # 丢弃工作区改动
git restore <file>                # 同上（新语法）

# 暂存区
git reset HEAD <file>             # 取消暂存
git restore --staged <file>       # 同上（新语法）

# 提交级别
git reset --soft HEAD~1           # 撤销提交，保留改动到暂存区
git reset --mixed HEAD~1          # 撤销提交，保留改动到工作区
git reset --hard HEAD~1           # 撤销提交并丢弃改动（慎用！）
git revert <commit>               # 生成反向提交（已推送用这个）

# 找回误删的提交
git reflog                        # 查看所有操作记录
git reset --hard <hash>           # 回到指定提交
```

## 5. 远程与协作

```bash
git remote -v                     # 查看远程仓库
git remote add origin <url>       # 添加远程
git fetch                         # 拉取远程信息（不合并）
git pull                          # 拉取并合并（= fetch + merge）
git pull --rebase                 # 拉取并变基（推荐）
git push                          # 推送
git push -u origin <branch>       # 推送并设置上游
git push origin --delete <branch> # 删除远程分支
git push --tags                   # 推送标签

# 标签
git tag v1.0.0                    # 打标签
git tag -a v1.0.0 -m "版本说明"   # 附注标签
git tag                           # 查看标签
```

## 6. Stash 与临时保存

```bash
git stash                         # 暂存当前改动
git stash list                    # 查看 stash 列表
git stash pop                     # 恢复最近 stash 并删除
git stash apply                   # 恢复但不删除
git stash drop                    # 删除 stash
git stash show stash@{0}          # 查看 stash 内容
```

## 7. 高级技巧

```bash
# 搜索与定位
git log --all --grep="关键字"     # 按提交信息搜索
git log -p <file>                 # 查看文件变更历史
git blame <file>                  # 每行代码的提交者
git log -S "字符串"               # 按代码内容搜索

# 文件操作
git rm --cached <file>            # 从版本控制移除（保留文件）
git mv <old> <new>                # 移动/重命名文件

# 子模块
git submodule add <url> <path>    # 添加子模块

# 清理
git clean -n                      # 预览未跟踪文件
git clean -fd                     # 删除未跟踪文件（慎用）
```

## 8. 高频面试题

**Q1：reset 和 revert 的区别？**
A：reset 移动 HEAD（回退历史），revert 生成反向提交（新增提交）。
已推送的提交用 revert（不重写公共历史）；本地未推送可用 reset。

**Q2：merge 和 rebase 的区别？**
A：merge 保留分支历史（有合并节点，历史可追溯）；rebase 重放提交
（线性历史，干净）。rebase 会改写提交 hash，不要对已推送共享分支
使用。

**Q3：pull 和 fetch 的区别？**
A：fetch 只下载远程更新（不动本地）；pull 下载并合并（fetch + merge
或 + rebase）。推荐 pull --rebase 保持线性。

**Q4：如何找回误删的分支/提交？**
A：`git reflog` 查看操作记录，找到目标提交 hash，`git branch <name>`
`<hash>` 或 `git reset --hard <hash>` 恢复。reflog 保留约 90 天。

**Q5：git stash 的使用场景？**
A：切分支前暂存未完成工作；拉代码冲突时暂存；临时切换任务。
stash 后工作区干净，可随时 pop 恢复。

## 9. 小结

- 基础三连：add → commit → push。
- 撤销三件套：checkout（工作区）/ reset（本地历史）/ revert（已推送）。
- 合并：merge 保历史，rebase 线性化，Squash 合并 feature。
- 应急：reflog 找回、stash 临时保存、cherry-pick 挑提交。
- 面试重点：reset/revert 区别、merge/rebase 选择、冲突解决。

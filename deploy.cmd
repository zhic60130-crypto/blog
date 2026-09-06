@echo off
REM 一键部署：本地提交 → 推送 Gitea → 服务器拉取构建上线
cd /d "%~dp0"
git add -A site
set /p MSG=提交说明（回车默认“文章更新”）:
if "%MSG%"=="" set MSG=文章更新
git commit -m "%MSG%"
git push gitea master
ssh -o BatchMode=yes ubuntu@42.194.232.215 "cd ~/blog && git pull && cd site && pnpm build 2>&1 | tail -1 && sudo rsync -a --delete dist/ /var/www/blog/ && echo 部署完成"
pause

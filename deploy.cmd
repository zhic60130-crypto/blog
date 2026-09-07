@echo off
chcp 65001 >nul
cd /d "%~dp0"
REM 一键发布：拉取线上后台的改动 -> 本地提交 -> 推送 GitHub -> 自动构建上线
echo 拉取线上后台的改动...
git pull gitea master --rebase
git add -A site
set /p MSG=提交说明（回车默认“文章更新”）:
if "%MSG%"=="" set MSG=文章更新
git commit -m "%MSG%"
git push github master:main
git push gitea master
echo.
echo  已推送，GitHub Actions 正在自动构建（1-2 分钟后 https://kenkai.me 生效）
echo  构建进度可在 GitHub 仓库的 Actions 页查看。
pause

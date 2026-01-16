@echo off
REM Tauri 开发环境启动脚本
REM 解决 Git link.exe 与 MSVC link.exe 冲突问题

echo 正在配置 Visual Studio 环境...

REM 查找 Visual Studio 2022 Build Tools
set VS_PATH=C:\Program Files\Microsoft Visual Studio\2022\BuildTools\Common7\Tools
set VS_COMMUNITY_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools

if exist "%VS_PATH%\VsDevCmd.bat" (
    call "%VS_PATH%\VsDevCmd.bat"
    echo 已加载 Build Tools 环境
) else if exist "%VS_COMMUNITY_PATH%\VsDevCmd.bat" (
    call "%VS_COMMUNITY_PATH%\VsDevCmd.bat"
    echo 已加载 Community 环境
) else (
    echo 错误: 未找到 Visual Studio 2022 安装
    echo 请确保已安装 Visual Studio Build Tools 或 Community 版本
    pause
    exit /b 1
)

echo.
echo 正在启动 Tauri 开发服务器...
echo.

cd /d "%~dp0"
pnpm tauri dev

pause

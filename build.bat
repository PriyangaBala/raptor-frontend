@echo off
set "PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs;%PATH%"
cd /d "%~dp0"
echo Using Node:
node -v
echo Using npm:
call npm -v
echo Building frontend...
call npm run build
echo Build completed successfully!



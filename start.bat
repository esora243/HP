@echo off
REM 簡易ローカルサーバー起動スクリプト (Windows)

set PORT=8000
if not "%1"=="" set PORT=%1

echo.
echo  PDF Editor を http://localhost:%PORT% で起動します...
echo  停止するには Ctrl+C を押してください
echo.

where python >nul 2>nul
if %ERRORLEVEL% == 0 (
  python -m http.server %PORT%
  goto :eof
)

where npx >nul 2>nul
if %ERRORLEVEL% == 0 (
  npx serve -l %PORT% .
  goto :eof
)

echo Python または Node.js が見つかりません
echo index.html を直接ブラウザで開いてみてください
pause

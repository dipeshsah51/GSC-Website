@echo off
title GSC Web - Production Packaging Tool
color 0A
echo ======================================================================
echo   Genting Services ^& Contracting W.L.L. (Doha, Qatar)
echo   Production Build ^& Packaging for gscqa.loveslife.biz
echo ======================================================================
echo.
echo [1/3] Building React Frontend with Vite...
cd /d "%~dp0frontend"
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Assembling htdocs and Production API...
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "if (Test-Path 'htdocs') { Remove-Item -Recurse -Force 'htdocs' }; " ^
  "New-Item -ItemType Directory -Path 'htdocs/api/data' -Force | Out-Null; " ^
  "Copy-Item -Recurse -Force 'frontend/dist/*' 'htdocs/'; " ^
  "Copy-Item -Force 'server-php/root.htaccess' 'htdocs/.htaccess'; " ^
  "Copy-Item -Force 'server-php/config.php' 'htdocs/api/config.php'; " ^
  "Copy-Item -Force 'server-php/db.php' 'htdocs/api/db.php'; " ^
  "Copy-Item -Force 'server-php/jwt.php' 'htdocs/api/jwt.php'; " ^
  "Copy-Item -Force 'server-php/index.php' 'htdocs/api/index.php'; " ^
  "Copy-Item -Force 'server-php/setup.php' 'htdocs/api/setup.php'; " ^
  "Copy-Item -Force 'server-php/.htaccess' 'htdocs/api/.htaccess'; " ^
  "Copy-Item -Force 'server-php/database.sql' 'htdocs/api/database.sql';"

echo.
echo [3/3] Creating gsc-deployment-htdocs.zip archive...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "if (Test-Path 'gsc-deployment-htdocs.zip') { Remove-Item -Force 'gsc-deployment-htdocs.zip' }; " ^
  "Compress-Archive -Path 'htdocs/*','htdocs/.htaccess' -DestinationPath 'gsc-deployment-htdocs.zip' -Force;"

echo.
echo ======================================================================
echo   SUCCESS! Deployment archive created: gsc-deployment-htdocs.zip
echo   ------------------------------------------------------------------
echo   Upload this zip file to your 'htdocs/' directory on filemanager.ai
echo   and click 'Extract'.
echo ======================================================================
echo.
pause

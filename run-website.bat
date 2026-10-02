@echo off
title GSC Website Launcher
color 0B
echo ======================================================================
echo   Genting Services ^& Contracting W.L.L. (Doha, Qatar) - Web System
echo ======================================================================
echo.
echo [1/2] Starting Backend Server on http://localhost:5000 ...
start "GSC-Backend-Port-5000" cmd /k "cd /d "%~dp0backend" && npm.cmd start"

echo [2/2] Starting Frontend Website on http://localhost:5173 ...
start "GSC-Frontend-Port-5173" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo ======================================================================
echo   SUCCESS! Both Frontend and Backend are now running.
echo   ------------------------------------------------------------------
echo   * Public Website : http://localhost:5173/
echo   * Admin Portal   : http://localhost:5173/admin
echo   * API Health     : http://localhost:5000/api/health
echo ======================================================================
echo.
echo (Press any key to close this launcher window. The servers will keep running.)
pause >nul

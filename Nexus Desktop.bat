@echo off
title Nexus Formulador Master - ENTERPRISE
color 0b
cd /d "%~dp0"

echo ==========================================
echo    NEXUS FORMULADOR MASTER - DESKTOP
echo ==========================================
echo.
echo [1/3] Limpiando procesos en puerto 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a 2>nul
timeout /t 1 >nul

echo [2/3] Iniciando Nexus Desktop Bridge (Puerto 3000)...
start /b cmd /c "node NexusServer.js"
timeout /t 3 >nul

echo [2/2] Lanzando Ventana Standalone sin cache...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000?v=%RANDOM%

echo.
echo ------------------------------------------
echo SISTEMA OPERATIVO Y CONECTADO.
echo Si ves la interfaz en blanco, pulsa Ctrl+R o Ctrl+F5 en la ventana.
echo ------------------------------------------
pause

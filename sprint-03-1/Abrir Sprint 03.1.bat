@echo off
rem Sprint 03.1: arranca el servidor local de la aplicacion integrada y abre Situacion y Medidas en el navegador.
rem Para pararlo, cierra la ventana "Servidor Sprint 03.1".
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo No se encuentra Python. Instalalo desde https://www.python.org/ y vuelve a abrir este fichero.
  pause
  exit /b 1
)
start "Servidor Sprint 03.1 (cierra esta ventana para pararlo)" /min python servidor.py
ping -n 3 127.0.0.1 >nul
start "" "http://localhost:4179/"
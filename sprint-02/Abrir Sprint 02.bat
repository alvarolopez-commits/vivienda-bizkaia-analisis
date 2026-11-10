@echo off
rem Sprint 02: arranca el servidor local del Living Atlas y abre el prototipo en el navegador.
rem Para pararlo, cierra la ventana "Servidor Sprint 02".
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo No se encuentra Python. Instalalo desde https://www.python.org/ y vuelve a abrir este fichero.
  pause
  exit /b 1
)
start "Servidor Sprint 02 (cierra esta ventana para pararlo)" /min python servidor.py
ping -n 3 127.0.0.1 >nul
start "" "http://localhost:4177/atlas/"
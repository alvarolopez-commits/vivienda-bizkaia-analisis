@echo off
rem Abre el prototipo de Situacion: arranca un servidor local en esta carpeta y abre el navegador.
rem Para pararlo, cierra la ventana "Servidor prototipo".
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo No se encuentra Python. Instalalo desde https://www.python.org/ y vuelve a abrir este fichero.
  pause
  exit /b 1
)
start "Servidor prototipo (cierra esta ventana para pararlo)" /min python -m http.server 4173 --bind 127.0.0.1
ping -n 3 127.0.0.1 >nul
start "" "http://localhost:4173/"

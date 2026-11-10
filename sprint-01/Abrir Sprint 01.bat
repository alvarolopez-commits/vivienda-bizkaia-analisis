@echo off
rem Sprint 01: arranca un servidor local en esta carpeta y abre la pagina para comparar las opciones A y B.
rem Para pararlo, cierra la ventana "Servidor Sprint 01".
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo No se encuentra Python. Instalalo desde https://www.python.org/ y vuelve a abrir este fichero.
  pause
  exit /b 1
)
start "Servidor Sprint 01 (cierra esta ventana para pararlo)" /min python -m http.server 4176 --bind 127.0.0.1
ping -n 3 127.0.0.1 >nul
start "" "http://localhost:4176/"

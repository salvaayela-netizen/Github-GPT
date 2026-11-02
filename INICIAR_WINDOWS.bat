@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo No se ha encontrado Node.js.
  echo Instala la version LTS desde https://nodejs.org/ y vuelve a intentarlo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias. Esto solo se hace la primera vez...
  call npm install
  if errorlevel 1 (
    echo No se pudieron instalar las dependencias.
    pause
    exit /b 1
  )
)

echo Abriendo Brujula en el navegador...
call npm run dev -- --open
pause

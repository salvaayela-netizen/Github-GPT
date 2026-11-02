#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "No se ha encontrado Node.js. Instala la versión LTS desde https://nodejs.org/"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Instalando dependencias. Esto solo se hace la primera vez..."
  npm install
fi

npm run dev -- --open

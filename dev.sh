#!/bin/bash

set -e

EXTENSION_UUID="one-extension@pedrolucaslco"

# Instala a extensão
echo "=== Instalando extensão ==="
"$(dirname "$0")/install.sh"

echo ""
echo "=== Iniciando GNOME Shell aninhado (Wayland) ==="
echo ""
echo "Para sair: Ctrl+C ou feche a janela"
echo ""

# Roda GNOME Shell aninhado com sessão D-Bus isolada
dbus-run-session -- gnome-shell --devkit &
GNOME_PID=$!

echo "GNOME Shell aninhado rodando (PID: $GNOME_PID)"
echo "Para parar: kill $GNOME_PID"

wait $GNOME_PID 2>/dev/null || true
echo "GNOME Shell fechado."

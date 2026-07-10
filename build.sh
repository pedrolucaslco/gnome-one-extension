#!/bin/bash

set -e

EXTENSION_UUID="one-extension@pedrolucaslco"
DEST_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Copiando arquivos para $DEST_DIR..."
mkdir -p "$DEST_DIR/lib"
mkdir -p "$DEST_DIR/schemas"

cp "$SCRIPT_DIR/extension.js" "$DEST_DIR/"
cp "$SCRIPT_DIR/prefs.js" "$DEST_DIR/"
cp "$SCRIPT_DIR/metadata.json" "$DEST_DIR/"
cp "$SCRIPT_DIR/lib/keybindingManager.js" "$DEST_DIR/lib/"
cp "$SCRIPT_DIR/lib/windowCentering.js" "$DEST_DIR/lib/"
cp "$SCRIPT_DIR/lib/indicator.js" "$DEST_DIR/lib/"
cp "$SCRIPT_DIR/schemas/org.gnome.shell.extensions.one-extension.gschema.xml" "$DEST_DIR/schemas/"

echo "Compilando schemas..."
glib-compile-schemas "$DEST_DIR/schemas/"

echo "Extensão instalada!"

if [ "$1" = "--restart" ]; then
    echo "Reiniciando GNOME Shell..."
    killall -3 gnome-shell 2>/dev/null || true
    echo "GNOME Shell reiniciado."
else
    echo "Para reiniciar, execute: $0 --restart"
    echo "Ou ative/desative a extensão pelo Extensions app."
fi

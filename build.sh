#!/bin/bash

set -e

# ─── Cores ───────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
RESET='\033[0m'

ok()   { echo -e "${GREEN}✓${RESET} $1"; }
warn() { echo -e "${YELLOW}⚠${RESET} $1"; }
fail() { echo -e "${RED}✗${RESET} $1"; exit 1; }

# ─── Configuração ────────────────────────────────────────────────────
EXTENSION_UUID="one-extension@pedrolucaslco"
DEST_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
EXTENSIONS_DIR="$HOME/.local/share/gnome-shell/extensions"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

SCHEMA_FILE="schemas/org.gnome.shell.extensions.one-extension.gschema.xml"

CRITICAL_FILES=(
    "extension.js"
    "prefs.js"
    "metadata.json"
    "stylesheet.css"
    "$SCHEMA_FILE"
)

# ─── Parse de flags ──────────────────────────────────────────────────
FLAG_CLEAN=false

for arg in "$@"; do
    case "$arg" in
        --clean)     FLAG_CLEAN=true ;;
        --uninstall)
            echo "Desinstalando extensão..."
            if [ -d "$DEST_DIR" ]; then
                gnome-extensions disable "$EXTENSION_UUID" 2>/dev/null || true
                rm -rf "$DEST_DIR"
                ok "Extensão removida: $DEST_DIR"
            else
                warn "Extensão não estava instalada."
            fi
            exit 0
            ;;
        --status)
            echo -e "${BOLD}Extensão:${RESET} $EXTENSION_UUID"
            if [ -d "$DEST_DIR" ] && [ -f "$DEST_DIR/metadata.json" ]; then
                ok "Instalada em: $DEST_DIR"
                if command -v gnome-extensions &>/dev/null; then
                    STATE=$(gnome-extensions show "$EXTENSION_UUID" 2>/dev/null | grep -oP '(Estado|State):\s*\K\w+')
                    if [ "$STATE" = "ENABLED" ] || [ "$STATE" = "ACTIVE" ]; then
                        ok "Estado: habilitada"
                    else
                        warn "Estado: $STATE"
                    fi
                fi
            else
                fail "Não instalada"
            fi
            exit 0
            ;;
        --help|-h)
            echo "Uso: $0 [opções]"
            echo ""
            echo "Opções:"
            echo "  --clean      Limpa o diretório antes de instalar"
            echo "  --uninstall  Remove a extensão completamente"
            echo "  --status     Mostra estado da extensão"
            echo "  --help       Mostra esta ajuda"
            exit 0
            ;;
        *)
            fail "Flag desconhecida: $arg (use --help)"
            ;;
    esac
done

# ─── 1. Limpar diretórios órfãos ────────────────────────────────────
ORPHANS_REMOVED=0
if [ -d "$EXTENSIONS_DIR" ]; then
    for dir in "$EXTENSIONS_DIR"/*/; do
        [ ! -d "$dir" ] && continue
        if [ ! -f "$dir/metadata.json" ]; then
            warn "Removendo diretório órfão: $dir"
            rm -rf "$dir"
            ORPHANS_REMOVED=$((ORPHANS_REMOVED + 1))
        fi
    done
fi
if [ "$ORPHANS_REMOVED" -gt 0 ]; then
    ok "$ORPHANS_REMOVED diretório(s) órfão(s) removido(s)"
fi

# ─── 2. Validar arquivos de origem ───────────────────────────────────
for file in "${CRITICAL_FILES[@]}"; do
    [ -f "$SCRIPT_DIR/$file" ] || fail "Arquivo faltando na origem: $file"
done
ok "Arquivos de origem validados"

# ─── 3. Validar metadata.json ────────────────────────────────────────
if command -v jq &>/dev/null; then
    META_UUID=$(jq -r '.uuid' "$SCRIPT_DIR/metadata.json" 2>/dev/null)
    if [ "$META_UUID" != "$EXTENSION_UUID" ]; then
        fail "UUID no metadata.json ($META_UUID) não bate com EXTENSION_UUID ($EXTENSION_UUID)"
    fi
    ok "metadata.json válido (uuid: $META_UUID)"
else
    warn "jq não instalado — pulando validação do metadata.json"
fi

# ─── 4. Limpeza total (se --clean) ───────────────────────────────────
if [ "$FLAG_CLEAN" = true ] && [ -d "$DEST_DIR" ]; then
    warn "Limpando diretório de destino..."
    rm -rf "$DEST_DIR"
    ok "Diretório limpo: $DEST_DIR"
fi

# ─── 5. Desabilitar extensão antes de reinstalar ─────────────────────
if [ -d "$DEST_DIR" ] && command -v gnome-extensions &>/dev/null; then
    STATE=$(gnome-extensions show "$EXTENSION_UUID" 2>/dev/null | grep -oP '(Estado|State):\s*\K\w+')
    if [ "$STATE" = "ENABLED" ] || [ "$STATE" = "ACTIVE" ]; then
        gnome-extensions disable "$EXTENSION_UUID" 2>/dev/null || true
        warn "Extensão desabilitada para reinstalação"
    fi
fi

# ─── 6. Criar diretórios de destino ──────────────────────────────────
echo "Copiando arquivos para $DEST_DIR..."
mkdir -p "$DEST_DIR/lib"
mkdir -p "$DEST_DIR/lib/icons"
mkdir -p "$DEST_DIR/schemas"

# ─── 7. Copiar arquivos ─────────────────────────────────────────────
cp "$SCRIPT_DIR/extension.js" "$DEST_DIR/"
cp "$SCRIPT_DIR/prefs.js" "$DEST_DIR/"
cp "$SCRIPT_DIR/metadata.json" "$DEST_DIR/"
cp "$SCRIPT_DIR/stylesheet.css" "$DEST_DIR/"
cp -r "$SCRIPT_DIR/lib/"* "$DEST_DIR/lib/"
cp "$SCRIPT_DIR/$SCHEMA_FILE" "$DEST_DIR/schemas/"

ok "Arquivos copiados"

# ─── 8. Validar arquivos no destino ──────────────────────────────────
for file in "${CRITICAL_FILES[@]}"; do
    [ -f "$DEST_DIR/$file" ] || fail "Arquivo faltando no destino: $file"
done
ok "Arquivos no destino validados"

# ─── 9. Compilar schemas ─────────────────────────────────────────────
echo "Compilando schemas..."
if glib-compile-schemas "$DEST_DIR/schemas/"; then
    ok "Schemas compilados"
else
    fail "Falha ao compilar schemas"
fi

# ─── 10. Habilitar extensão ──────────────────────────────────────────
if command -v gnome-extensions &>/dev/null; then
    gnome-extensions enable "$EXTENSION_UUID" 2>/dev/null || true
    ok "Extensão habilitada"
fi

# ─── 11. Resumo ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}Extensão instalada com sucesso!${RESET}"
echo ""
echo "Ative/desative pelo Extensions app."

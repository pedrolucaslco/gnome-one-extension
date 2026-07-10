#!/bin/bash

set -e

# Verifica se gh está instalado
if ! command -v gh &>/dev/null; then
    echo "❌ GitHub CLI (gh) não encontrado."
    echo "Instale com:"
    echo "  sudo dnf install gh        # Fedora"
    echo "  sudo apt install gh        # Ubuntu/Debian"
    echo ""
    echo "Depois autentique com:"
    echo "  gh auth login"
    exit 1
fi

# Verifica se gh está autenticado
if ! gh auth status &>/dev/null 2>&1; then
    echo "❌ GitHub CLI não autenticado."
    echo "Execute: gh auth login"
    exit 1
fi

# Verifica se há alterações pendentes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Existem alterações não commitadas."
    echo "Faça commit antes de criar a release."
    exit 1
fi

# Verifica se há commits para push
if [ "$(git rev-list origin/main..HEAD --count 2>/dev/null)" = "0" ]; then
    echo "⚠️  Nenhum commit novo para push."
fi

# Lê a última tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
echo "📦 Última tag: $LAST_TAG"

# Extrai notes do CHANGELOG.md para a versão atual
VERSION="${LAST_TAG#v}"
NOTES=""

if [ -f CHANGELOG.md ]; then
    # Extrai a seção da versão atual do CHANGELOG
    NOTES=$(awk "/^## \[${VERSION}\]/{found=1; next} /^## \[/{if(found) exit} found{print}" CHANGELOG.md)
fi

# Se não encontrou notes, usa mensagem padrão
if [ -z "$NOTES" ]; then
    NOTES="Release ${LAST_TAG}"
fi

echo "📝 Notes extraídos do CHANGELOG.md"
echo ""
echo "========================================"
echo "Release: $LAST_TAG"
echo "========================================"
echo "$NOTES"
echo "========================================"
echo ""

# Push commits e tags
echo "🚀 Pushing para origin..."
git push origin main --tags

# Cria a release
echo "📦 Criando release $LAST_TAG..."
gh release create "$LAST_TAG" \
    --title "$LAST_TAG" \
    --notes "$NOTES"

echo ""
echo "✅ Release $LAST_TAG criada com sucesso!"
echo "🔗 https://github.com/pedrolucaslco/gnome-one-extension/releases/tag/$LAST_TAG"

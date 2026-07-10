# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-07-10

### Adicionado

- **Window Centering**: centraliza e redimensiona a janela focada com atalho de teclado
  - Atalho configurável (padrão: `Alt+Shift+A`)
  - Redimensionamento por porcentagem da resolução (largura e altura)
  - Suporte a múltiplos monitores
  - Opção de forçar resize em janelas maximizadas
  - Toggles para mudar posição e/ou tamanho individualmente
- **Ícone na top bar**: menu de atalho com opção para abrir configurações
- **Janela de preferências**: interface Adw/Gtk para configurar todas as opções
- **Build script**: `./build.sh` para instalação rápida e `./dev.sh` para desenvolvimento
- Suporte a GNOME Shell 45, 46, 47, 48 e 50

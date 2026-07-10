# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.2.0] - 2025-07-10

### Adicionado

- **Stopwatch**: cronômetro integrado no menu do painel
  - Start / Pause / Resume / Reset
  - Registro de voltas com tempo individual e total
  - Formato HH:MM:SS.cc (centésimos)
  - Ativação/desativação nas preferências

## [1.1.0] - 2025-07-10

### Adicionado

- **Rounded Corners**: aplica bordas arredondadas em todas as janelas
  - Ativação/desativação por toggle nas preferências
  - Raio de borda configurável (1-100 pixels)
  - Skip automático para janelas maximizadas
  - Skip para apps libadwaita e libhandy (configurável)
- Aba "Rounded Corners" na janela de preferências

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

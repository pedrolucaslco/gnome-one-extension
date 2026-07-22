# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

> **Nota sobre versionamento:** tudo antes da `1.0.0` abaixo foi reclassificado como beta (tags `-beta` no
> git) — eram versões de desenvolvimento/iteração. A `1.0.0` é a primeira release estável oficial da
> extensão, e o versionamento segue a partir dela.

## [1.0.0] - 2026-07-21

Primeira release estável.

### Adicionado

- Configuração de posição do indicador na top bar (1-20), com reposicionamento ao vivo via preferências
- Ícone dedicado de RAM e contador de RAM na top bar, ao lado do ícone principal
- Ícone e contador do stopwatch na top bar, visíveis apenas enquanto o cronômetro está rodando
- Página `Gnome HIG.md` com a documentação completa das GNOME Human Interface Guidelines, usada como
  referência de design para o restante do projeto

### Modificado

- **Fusão de indicadores**: o indicador de RAM separado na top bar foi removido; CPU/RAM/Disk e a lista de
  processos agora vivem todos em um único popup, no único ícone da extensão
- Anéis do System Monitor usam a cor de destaque (accent color) do tema do GNOME em vez de verde/amarelo/
  vermelho fixos por limiar
- Botões icon-only (stopwatch, refresh, kill de processo) reaproveitam a classe nativa `.icon-button` do
  Shell em vez de estilos customizados com cores fixas, para acompanhar o tema ativo
- Notificação de RAM alta centralizada no `SystemMonitor` (elimina um segundo timer de leitura redundante)
- `build.sh` renomeado para `install.sh`, README reescrito em inglês como landing page do projeto
- Ícone da aba "System Monitor" nas preferências corrigido (usava um nome de ícone inexistente no tema
  Adwaita)

### Removido

- `lib/utils/button.js` (componente `Button`/`ButtonBox` não utilizado)
- `lib/utils/colors.js` (lógica de cor por limiar, substituída pela accent color do tema)
- `CREDITS.md` (consolidado na seção "Créditos" do README)

### Pausado

- Lista de processos por app ao clicar no anel de RAM: temporariamente desabilitada (código mantido, só o
  gatilho de clique foi removido)

---

## Versões anteriores (beta)

As entradas abaixo correspondem às tags `vX.Y.Z-beta` no git — histórico de desenvolvimento anterior à
primeira release estável.

## [1.7.0-beta] - 2026-07-15

### Adicionado

- **RAM Indicator**: indicador de uso de RAM na top bar
  - Exibe porcentagem de RAM na barra de panels
  - Menu popup com lista de processos agrupados por aplicação
  - Botão para matar processos com confirmação
  - Notificação opcional quando RAM excede limiar configurável
  - Intervalo de atualização compartilhado com System Monitor

### Removido

- **Rounded Corners**: módulo removido para simplificar a extensão

### Melhorado

- Extraída função compartilhada `readMemInfo()` para eliminar duplicação de leitura de `/proc/meminfo`
- Removido código morto (`getWindowsByApp`)
- Corrigida indentação inconsistente em `windowTracker.js` e `processListView.js`

## [1.3.0-beta] - 2025-07-10

### Adicionado

- **System Monitor**: indicadores de CPU, RAM e Disco no menu do painel
  - Anéis circulares com cores dinâmicas (verde/amarelo/vermelho)
  - Leitura de CPU via `/proc/stat`
  - Leitura de RAM via `/proc/meminfo` (fallback) ou GTop
  - Leitura de Disco via GTop (fallback: Gio)
  - Intervalo de atualização configurável

## [1.2.0-beta] - 2025-07-10

### Adicionado

- **Stopwatch**: cronômetro integrado no menu do painel
  - Start / Pause / Resume / Reset
  - Registro de voltas com tempo individual e total
  - Formato HH:MM:SS.cc (centésimos)
  - Ativação/desativação nas preferências

## [1.1.0-beta] - 2025-07-10

### Adicionado

- **Rounded Corners**: aplica bordas arredondadas em todas as janelas
  - Ativação/desativação por toggle nas preferências
  - Raio de borda configurável (1-100 pixels)
  - Skip automático para janelas maximizadas
  - Skip para apps libadwaita e libhandy (configurável)
- Aba "Rounded Corners" na janela de preferências

## [1.0.0-beta] - 2025-07-10

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

# One Extension - Guia de Desenvolvimento

## Visão do Produto

Extensão GNOME all-in-one inspirada no [OneMenu](https://coffeebreak.software/one-menu/).
Múltiplas ferramentas integradas em uma única extensão modular.

## Módulos

| Versão | Módulo | Status |
|--------|--------|--------|
| v1.0.0 | Window Centering | ✅ Implementado |
| v1.2.0 | Stopwatch | ✅ Implementado |
| v1.3.0 | System Monitor | ✅ Implementado |
| v1.7.0 | RAM Indicator | ✅ Implementado |
| — | Pomodoro | ✅ Implementado |
| — | Containers (Docker/Podman) | ✅ Implementado |
| — | Clipboard History | 🔜 Planejado |
| — | Tiling Manager | 🔜 Planejado |

## Convenções de Commit

Sempre em **lowercase**, com prefixo convencional:

- `feat:` — nova funcionalidade ou módulo
- `fix:` — correção de bug
- `chore:` — manutenção, docs, refatoração
- `refactor:` — refatoração de código sem mudar comportamento
- `style:` — formatação, espacos, etc.

Exemplos:
```
feat: add clipboard history module
fix: window centering on multi-monitor setup
chore: update README with install instructions
```

## Fluxo de Commits

Cada commit deve ser gerado dinamicamente pela IA, seguindo estas regras:

### Message (conventional commit)

Formato: `tipo: descrição curta em lowercase`

Exemplos:
- `feat: add clipboard history`
- `fix: window centering on multi-monitor`
- `chore: update build script`

### Description (impacto ao usuário)

2-3 bullets curtos explicando o que mudou para o usuário:

```
- Histórico de clipboard com busca por texto
- Cola itens antigos com um único clique
- Remove necessidade de extensões separadas
```

### Regras

1. Message: sempre `tipo: descrição curta` em lowercase
2. Description: 2-3 bullets curtos, impacto ao usuário
3. Tipos permitidos: `feat`, `fix`, `chore`, `refactor`, `style`
4. Versionamento automático baseado na última tag:

| Tipo | Bump | Exemplo |
|------|------|---------|
| `feat` | minor | v1.0.0 → v1.1.0 |
| `fix` | patch | v1.0.0 → v1.0.1 |
| `chore` | patch | v1.0.0 → v1.0.1 |
| `refactor` | patch | v1.0.0 → v1.0.1 |
| `style` | patch | v1.0.0 → v1.0.1 |
| BREAKING CHANGE | major | v1.0.0 → v2.0.0 |

5. Após o commit, criar tag anotada com a versão

## Versionamento

Semântico: `MAJOR.MINOR.PATCH`

- **MAJOR** — mudanca incompativel na API/config
- **MINOR** — nova funcionalidade retrocompativel
- **PATCH** — correcao de bug

Tags criadas **automaticamente** a cada commit via fluxo de commits.
Historico de versoes mantido no CHANGELOG.md.

> **Marco `1.0.0`:** o commit `release: official v1` foi definido como a primeira release estavel da
> extensao. Todas as tags anteriores (`v1.0.0` ate `v1.7.3`) foram renomeadas para `-beta` (ex:
> `v1.7.3-beta`), e uma nova tag `v1.0.0` foi criada apontando para esse commit. O versionamento semantico
> segue normalmente a partir da `1.0.0` — nao ha mais reset previsto.

## Estrutura Modular

```
lib/
├── keybindingManager.js   # Gerenciamento compartilhado de atalhos
├── windowCentering.js     # Modulo: centralizacao de janelas
├── stopwatch.js           # Modulo: cronometro
├── pomodoro.js            # Modulo: pomodoro (foco/pausa/pausa longa)
├── pomodoroLog.js         # Persistencia do log de pomodoros (JSON em disco)
├── systemMonitor.js       # Modulo: monitor de sistema (CPU/RAM/Disk)
├── processes.js           # Leitura de processos /proc
├── memInfo.js             # Utilitario: leitura compartilhada de /proc/meminfo
├── windowTracker.js       # Mapeamento de janelas por PID
├── containers.js          # Utilitario: listagem/acoes docker+podman (async, via Gio.Subprocess)
├── indicator.js           # Painel principal (PanelMenu.Button)
├── icons/                 # Icones SVG customizados
├── utils/
│   ├── button.js          # Componente Button/ButtonBox
│   ├── circularIndicator.js # Widget de indicador circular
│   └── pubsub.js          # Sistema de eventos PubSub
└── views/
    ├── stopwatchView.js   # View do cronometro
    ├── pomodoroView.js    # View do pomodoro
    ├── processListView.js # Lista de processos
    └── containersView.js  # Lista de containers docker/podman com acoes
```

## Modulo Containers (Docker/Podman)

`lib/containers.js` segue o mesmo padrao de `lib/processes.js`: funcoes utilitarias sem classe/estado,
sem `enable()`/`disable()` proprio. `ContainersView` (`lib/views/containersView.js`) e' auto-contida — tem
seu proprio timer de refresh (`containers-refresh-interval`), igual `ProcessListView`, entao nao ha um
modulo com PubSub por tras. `extension.js` so alterna a visibilidade via `indicator.setupContainers()` /
`teardownContainers()` quando `containers-enabled` muda.

Acoes de start/stop/restart chamam `docker`/`podman` via `Gio.Subprocess` assincrono. Log e shell abrem um
terminal externo detectado no sistema (`ptyxis` > `gnome-terminal` > `konsole` > `xterm`, o que existir)
rodando `<runtime> logs -f` / `<runtime> exec -it <id> bash` — a extensao roda no processo do Shell, que
nao tem um emulador de terminal proprio pra hospedar um PTY interativo.

Cada modulo:
- Um arquivo em `lib/nomeModulo.js`
- Uma classe com `constructor(settings)` e metodos `enable()`/`disable()`
- `export default` da classe

## Ordem dos Blocos no Painel (reordenavel)

A ordem visual dos blocos opcionais (stopwatch, pomodoro, system-monitor, containers) no menu do
`Indicator` **nao e' fixa no codigo** — vem da chave `panel-blocks-order` (`as`) no schema, configuravel na
aba "Layout" das Preferencias (switch liga/desliga + setas cima/baixo por bloco, sem drag-and-drop — o HIG
exige controles por botao para acessibilidade via teclado/leitor de tela).

`indicator.js#_applyBlockOrder()` le essa chave e reposiciona os itens do menu via `PopupMenuBase.
moveMenuItem()` (API nativa do `popupMenu.js`), reagindo a `changed::panel-blocks-order` em tempo real —
nao precisa reiniciar a Shell. `_getBlockItems(key)` mapeia cada chave de bloco pro(s) item(ns) de menu
correspondente(s) — System Monitor sao dois slots (`_monitorSlot` + `_processSlot`) que sempre se movem
juntos, adjacentes.

## Restrições Importantes

### Panel Indicator — NÃO MEXER na estrutura do BoxLayout

`lib/indicator.js` usa um `St.BoxLayout` (`_panelBox`) como filho único do `PanelMenu.Button`, contendo o ícone e o label do stopwatch.

**NUNCA** adicionar filhos diretos ao `PanelMenu.Button` via `this.add_child()`. Sempre adicionar widgets dentro do `_panelBox`.

Motivo: `PanelMenu.Button` estende `St.Button`, que espera um único filho. Múltiplos filhos diretos quebram o layout do painel.

```js
// CORRETO — sempre adicionar ao box
this._panelBox.add_child(novoWidget);

// ERRADO — não fazer isso
this.add_child(novoWidget);
```

**Perguntar ao usuário antes de alterar essa estrutura.**

## Como Adicionar um Novo Modulo

1. Criar `lib/nomeModulo.js` com a classe do modulo
2. Adicionar keys necessarias no `schemas/*.gschema.xml`
3. Compilar schemas: `glib-compile-schemas schemas/`
4. Importar e instanciar em `extension.js` (enable/disable)
5. Adicionar UI de configuracao em `prefs.js`
5b. Se o bloco aparece no menu do painel: registrar sua chave em `indicator.js#_getBlockItems()` +
    `allKeys`/default de `panel-blocks-order` no schema, e adicionar uma entrada em `_layoutBlocks` na aba
    "Layout" do `prefs.js` — senao o bloco nao aparece na tela de reordenacao.
6. Incrementar `version` no `metadata.json`
7. Documentar no `README.md`
8. Criar commit com `feat: add [nome] module`

## Comandos Uteis

```bash
# Compilar schemas
glib-compile-schemas schemas/

# Instalar localmente
gnome-extensions install one-extension@pedrolucaslco

# Ativar
gnome-extensions enable one-extension@pedrolucaslco

# Desativar
gnome-extensions disable one-extension@pedrolucaslco

# Reiniciar GNOME Shell (X11)
killall -3 gnome-shell

# Reiniciar GNOME Shell (Wayland) - relogar

# Ver logs
journalctl -f -o cat /usr/bin/gnome-shell
```

## Referencias

- [OneMenu](https://coffeebreak.software/one-menu/) — inspiracao do produto
- [window-centering](https://github.com/niam0t/window-centering) — codigo base do modulo Window Centering (GPL-2.0)
- [GNOME Extension Guidelines](https://gjs.guide/extensions/)
- [EGO Review Guidelines](https://gjs.guide/extensions/review-guidelines/)

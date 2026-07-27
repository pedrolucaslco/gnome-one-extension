# Plano de Implementação — Módulo Pomodoro

> Documento de trabalho. Marcar cada item com `[x]` conforme for concluído. Ver `AGENTS.md` para o
> checklist genérico de "novo módulo" e `CLAUDE.md` para as restrições estruturais do `Indicator`.

## Objetivo

Adicionar um módulo Pomodoro, seguindo o mesmo padrão do Stopwatch (`lib/stopwatch.js` +
`lib/views/stopwatchView.js`): um bloco fixo no popup do painel, **abaixo do bloco do stopwatch**,
com contagem regressiva, controles, atalho direto para a aba de configuração do Pomodoro nas
Preferências, e um log persistente dos pomodoros concluídos que sobrevive a reinícios da extensão e
do Shell.

## Decisões de arquitetura

1. **Máquina de estados própria.** `pomodoro.js` define seu próprio `State` (`RUNNING/PAUSED/RESET`)
   e um novo enum `Phase` (`FOCUS/SHORT_BREAK/LONG_BREAK`) — não reaproveita o `State` do
   `stopwatch.js` para manter os módulos desacoplados (contrato do módulo em `CLAUDE.md`).
2. **Contagem regressiva com checkpoint, igual ao stopwatch.** Persiste `remaining-ms` +
   `running-since` (epoch ms) em vez de só o estado, para sobreviver a um reload do Shell com o
   mínimo de deriva — mesmo truque do `stopwatch.js` (`_save`/`_restore`).
3. **Sem auto-start entre fases.** Ao concluir uma fase, a próxima fase é armazenada em `RESET`
   (pronta, com o tempo cheio, botão "Start") em vez de iniciar sozinha. Evita surpresa (HIG "Be
   Considerate") e mantém o botão único Start/Pause/Resume idêntico ao do stopwatch.
4. **"Skip" em vez de "Reset".** O stopwatch usa Reset (só habilitado pausado); o Pomodoro usa Skip
   (avança para a próxima fase), habilitado sempre que o estado não for `RESET` (nada pra pular
   ainda). Skip **nunca** loga a sessão como concluída e **não** incrementa o contador de ciclos —
   só conta pra estatística/long break uma fase de foco que terminou naturalmente.
5. **Ciclos até o long break são configuráveis.** Embora o usuário só tenha pedido tempo de foco/
   pausa/pausa longa, o número de ciclos é indissociável do conceito de "long break" — sem ele o
   long break nunca dispara. Adicionada 1 chave a mais (`pomodoro-cycles-before-long-break`,
   default 4) em vez de fixar um valor mágico no código.
6. **Log em arquivo JSON, não em GSettings.** GSettings/dconf é uma "database" pensada pra poucos
   valores pequenos, não pra uma lista que cresce indefinidamente. O log fica em
   `~/.local/share/one-extension/pomodoro-log.json` (via `GLib.get_user_data_dir()`), capado às
   últimas 500 entradas (mais antigas são descartadas). Cada entrada: `{ completedAt, durationMs }`.
7. **`lib/pomodoroLog.js` é puro Gio/GLib, sem `St`/`Clutter`/`Main`.** Isso permite importar o
   mesmo arquivo tanto do lado do shell (`extension.js`/`pomodoro.js`) quanto do processo separado
   das Preferências (`prefs.js`) — necessário pra a aba "Histórico" listar o log sem duplicar
   parsing/serialização.
8. **Atalho "engrenagem" → aba de config via GSettings como canal de IPC.** `extension.js` e
   `prefs.js` rodam em processos diferentes (ver `CLAUDE.md`); não há API direta pra
   `openPreferences()` abrir numa página específica. Solução: uma chave transiente
   `prefs-open-page` (string, default `''`, não exposta na UI). O botão de engrenagem no bloco do
   Pomodoro faz `settings.set_string('prefs-open-page', 'pomodoro')` e chama
   `extension.openPreferences()`; `prefs.js`, depois de montar todas as páginas, lê essa chave, se
   for `'pomodoro'` chama `window.set_visible_page(pomodoroPage)` e zera a chave de volta.
9. **Ícone customizado.** Não existe símbolo "tomate" nativo no tema Adwaita. Seguindo o precedente
   de `lib/icons/{memory,cpu,drive-harddisk}-symbolic.svg`, criar `lib/icons/tomato-symbolic.svg`
   (16×16, monocromático, `currentColor`, estilo "symbolic" do HIG) reutilizado no ícone do painel e
   no ícone da página de Preferências (via `Gtk.IconTheme.add_search_path`, já configurado em
   `prefs.js`).
10. **Confirmação só para limpar o histórico.** Skip/pause são reversíveis e de baixo custo (HIG:
    ações reversíveis não precisam de confirmação). Já "Clear history" apaga dados permanentemente —
    aí sim vale um `Adw.AlertDialog` de confirmação antes de truncar o arquivo.

## Novas chaves de schema (`schemas/org.gnome.shell.extensions.one-extension.gschema.xml`)

Configuração do usuário:
- `pomodoro-enabled` (b, default `true`)
- `pomodoro-focus-minutes` (i, default `25`, range 1–180)
- `pomodoro-short-break-minutes` (i, default `5`, range 1–60)
- `pomodoro-long-break-minutes` (i, default `15`, range 1–60)
- `pomodoro-cycles-before-long-break` (i, default `4`, range 2–8)

Estado persistido (sobrevive a reload, mesmo padrão do stopwatch):
- `pomodoro-state` (i, default `2` = RESET)
- `pomodoro-phase` (i, default `0` = FOCUS)
- `pomodoro-remaining-ms` (x, default `0`)
- `pomodoro-running-since` (x, default `0`)
- `pomodoro-cycle-count` (i, default `0`)

IPC extension↔prefs:
- `prefs-open-page` (s, default `''`)

## Arquivos novos

- `lib/pomodoro.js` — módulo de lógica (mirror de `stopwatch.js`)
- `lib/pomodoroLog.js` — persistência do log em JSON (mirror leve de `memInfo.js`/`processes.js`
  quanto ao estilo de I/O síncrono via `Gio.File`)
- `lib/views/pomodoroView.js` — view do bloco no popup (mirror de `stopwatchView.js`)
- `lib/icons/tomato-symbolic.svg` — ícone customizado

## Arquivos alterados

- `schemas/org.gnome.shell.extensions.one-extension.gschema.xml` — chaves acima + recompilar
- `extension.js` — import + `_startPomodoro`/`_stopPomodoro` + listener `changed::pomodoro-enabled`
- `lib/indicator.js` — `_pomodoroSlot` (logo abaixo de `_stopwatchSlot`, mesmo grupo, antes do
  primeiro separador), ícone+label no `_panelBox`, `setupPomodoro()`/`teardownPomodoro()`
- `prefs.js` — página "Pomodoro" (switch + spin rows de duração/ciclos) e grupo/página "Histórico"
  (lista + botão "Clear History" com confirmação); leitura de `prefs-open-page`
- `stylesheet.css` — classes `.pomodoro-*` (reaproveitando a linguagem visual do `.stopwatch-*`)
- `AGENTS.md` — linha na tabela de módulos + entrada na árvore de `lib/`
- `README.md` — seção "🍅 Pomodoro"
- `metadata.json` — bump de `version`/`version-name` (feat → minor)

## Checklist de implementação

### 1. Schema e fundação
- [x] Adicionar as 10 chaves novas no `.gschema.xml`
- [x] `glib-compile-schemas schemas/`

### 2. Lógica (`lib/pomodoro.js`)
- [x] `State` (`RUNNING/PAUSED/RESET`) e `Phase` (`FOCUS/SHORT_BREAK/LONG_BREAK`) exportados
- [x] Construtor lê durações/ciclos do `settings`, restaura estado persistido (`_restore`), corrige
      `remaining` se o tempo já tiver zerado enquanto o Shell estava fechado (completa a fase
      pendente de forma síncrona nesse caso)
- [x] `start()/pause()/resume()/skip()` com as mesmas guardas de estado do stopwatch
- [x] Tick (`GLib.timeout_add`, ~1000ms) decrementando `remaining`, publish `tic` a cada tick,
      publish `phase_change` ao trocar de fase
- [x] `_completePhase()`: se fase concluída era `FOCUS`, grava no `PomodoroLog` e incrementa
      `cycle-count`; decide próxima fase (`SHORT_BREAK` vs `LONG_BREAK` baseado no ciclo); reseta
      `cycle-count` após um long break
- [x] `skip()`: mesma transição de fase, mas sem gravar log e sem incrementar `cycle-count`
- [x] `_save()/_restore()` (checkpoint), `disable()` chamando `_save()` uma última vez

### 3. Log (`lib/pomodoroLog.js`)
- [x] Resolve caminho via `GLib.get_user_data_dir()` + `one-extension/pomodoro-log.json`, cria o
      diretório se não existir
- [x] `record({ completedAt, durationMs })` — lê, adiciona, corta pra 500 entradas mais recentes,
      escreve (sync, arquivo pequeno)
- [x] `getAll()`, `getTodayCount()`, `getTotalCount()`, `clear()`
- [x] Tratar arquivo ausente/corrompido como log vazio (sem crashar o Shell)

### 4. View (`lib/views/pomodoroView.js`)
- [x] Header: label de fase atual (Focus/Short Break/Long Break) + botão de engrenagem
      (`emblem-system-symbolic`, icon-only) que aciona o callback de "abrir preferências"
- [x] Dígitos MM:SS (sem centésimos — não fazem sentido numa contagem em minutos)
- [x] Dots de progresso do ciclo (ex.: `●●○○` pros 4 ciclos até o long break)
- [x] Controles: pill secundário "Skip" + pill primário "Start/Pause/Resume"
- [x] Caption com resumo do log (“N hoje · M no total”), lido do `PomodoroLog`
- [x] `_listen()`/`destroy()` iguais em espírito ao `StopwatchView`

### 5. Indicator (`lib/indicator.js`)
- [x] `_panelPomodoroIcon` (ícone `tomato-symbolic` custom) + `_panelPomodoroTimer` label,
      adicionados ao `_panelBox` (nunca `add_child` direto no botão — ver restrição do
      `AGENTS.md`)
- [x] `_pomodoroSlot` inserido logo após `_stopwatchSlot`, antes do primeiro separador
- [x] `setupPomodoro(pomodoro)`/`teardownPomodoro()` (mirror de `setupStopwatch`/
      `teardownStopwatch`), incluindo restaurar o texto do painel se já houver estado ao habilitar
- [x] Passar callback de "abrir preferências no Pomodoro" pra `PomodoroView` (seta
      `prefs-open-page` e chama `this._extension.openPreferences()`)

### 6. Extension (`extension.js`)
- [x] Import `Pomodoro`
- [x] `_startPomodoro()`/`_stopPomodoro()` idempotentes, chamadas em `enable()`/`disable()`
- [x] Listener `changed::pomodoro-enabled`

### 7. Preferências (`prefs.js`)
- [x] Página "Pomodoro": switch "Enable pomodoro" + spin rows (foco/pausa curta/pausa longa/ciclos)
- [x] Grupo/página "Histórico": lista das últimas sessões (data/hora + duração), resumo
      (hoje/total), botão "Clear History" com `Adw.AlertDialog` de confirmação
- [x] Ler `prefs-open-page` no fim de `fillPreferencesWindow`, chamar `window.set_visible_page(...)`
      e zerar a chave

### 8. Estilo (`stylesheet.css`)
- [x] Classes `.pomodoro-title`/`.pomodoro-phase-label`, `.pomodoro-time-digits`/`-sep`,
      `.pomodoro-controls`, `.pomodoro-button(-primary|-secondary)`, `.pomodoro-settings-button`,
      `.pomodoro-progress-dot(-filled)`, `.pomodoro-caption`

### 9. Ícone
- [x] `lib/icons/tomato-symbolic.svg` (16×16, `currentColor`, estilo dos ícones existentes)

### 10. Docs e versionamento
- [x] `AGENTS.md`: linha na tabela de módulos + árvore de `lib/`
- [x] `README.md`: seção "🍅 Pomodoro"
- [x] `metadata.json`: bump de versão (feat → minor)

### 11. Validação manual

> Feito neste ambiente: `node --check` em todos os arquivos novos/alterados, `glib-compile-schemas
> --strict` no schema, e um boot real do `./dev.sh` (Shell aninhado) com o log inteiro revisado —
> nenhuma JS exception vinda do nosso código (só warnings pré-existentes de outras extensões/GJS,
> não relacionados). **Não foi possível** interagir com a UI (clicar Start/Skip/engrenagem) neste
> ambiente por falta de ferramenta de screenshot/input pro Shell aninhado — os itens abaixo ficam
> pendentes de confirmação visual pelo usuário.

- [ ] `./dev.sh` — testar ciclo completo foco→pausa curta→foco→...→pausa longa
- [ ] Testar skip em cada estado, confirmar que não loga nem incrementa ciclo
- [ ] Fechar/reabrir shell aninhado (ou `./install.sh` + reload real) com pomodoro rodando,
      confirmar que o tempo restante é reconstituído corretamente
- [ ] Testar clique na engrenagem abrindo direto na aba Pomodoro das Preferências
- [ ] Testar "Clear History" (com confirmação) e verificar que o arquivo JSON é truncado
- [x] `journalctl`/log do `./dev.sh` sem exceptions do nosso código durante o boot

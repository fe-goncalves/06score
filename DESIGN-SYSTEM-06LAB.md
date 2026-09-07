# 06.lab — Design System

**Versão:** 1.0 (handoff visual)  
**Escopo:** interface administrativa do 06.lab — hubs de entidade, partidas, competições, listas organizacionais e fluxos de pós-jogo.  
**Stack de referência:** Next.js (App Router), CSS Modules, tokens em `globals.css`, camada hub em `entity-hub.module.css`.

Este documento descreve o sistema visual construído na refatoração **Liquid Glass + Inter** com **Space Mono** reservado a dados numéricos, placares e rótulos técnicos. Pode ser reutilizado em outros projetos desde que os tokens e a hierarquia tipográfica sejam preservados.

---

## 1. Princípios de design

### 1.1 Liquid Glass (vidro líquido)

Superfícies interativas não são caixas sólidas opacas: são **painéis semitransparentes** com:

- `backdrop-filter: blur(8px–12px)`
- borda dupla perceptível: lateral `border-color` + **highlight superior** (`border-top-color` mais claro)
- sombras **inset** (luz no topo, sombra na base) + sombra externa suave
- fundo escuro semitransparente no dark (`rgba(0,0,0,0.42)`) ou branco translúcido no light

O efeito comunica profundidade sem competir com o conteúdo. Cards “flutuam” sobre o `--color-background`, não o encobrem.

### 1.2 Tipografia como hierarquia funcional

| Papel | Fonte | Uso |
|-------|-------|-----|
| **UI / corpo / labels** | **Inter** (`--hub-font-sans`, `--font-sans`) | Nomes de atletas, campos de formulário, subtítulos, botões secundários, timeline |
| **Dados / placar / tabs principais** | **Space Mono** (`--hub-font-mono`, `--font-mono`) | Placares, minutos, ordem de cobrança, abas do header, botão primário, badges numéricos |
| **Display legado** | Fjalla One (`--font-display`) | Uso residual; **não** é o padrão da refatoração atual |

**Regra de ouro:** se o usuário precisa **ler um número ou comparar valores** (placar, minuto, kick order, contadores de aba), use Space Mono. Se precisa **ler texto humano** (nome, label, hint), use Inter.

### 1.3 Densidade informacional

- Labels em **UPPERCASE**, `letter-spacing` amplo (0.06em–0.12em), tamanho 10–11px.
- **Sem subtítulos redundantes** quando o label já contextualiza (ex.: campos da aba Informação).
- Padding vertical **reduzido** em listas e field rows (10–14px).
- Informação secundária em `--hub-body-subtle` / `--color-text-hint`, nunca competindo com primário.

### 1.4 Cor de marca vs. cor de entidade

- **UI do produto** (chrome, CTAs, foco, abas ativas): sempre `--color-brand` (#BFF205 dark / #9BC004 light). Ver `src/lib/lab-theme.ts`.
- **Cor de equipe** (`primary_color`): apenas em hovers contextuais (radial na lista de equipes), logos e destaques esportivos — **nunca** substituir o brand em botões, switches ou bordas de foco globais.

### 1.5 Motion

- Easing padrão hub: `cubic-bezier(0.22, 1, 0.36, 1)` (`--hub-ease-out`).
- Transições curtas: **0.12s–0.22s** (hover, bordas); indicadores de tab/switch: **0.22s–0.28s**.
- Header colapsável da partida usa `--header-collapse` (0→1) com interpolação linear em `calc()` para morph contínuo.
- Respeitar `prefers-reduced-motion` onde aplicável.

---

## 2. Fundação: tokens globais

Definidos em `src/app/globals.css` para `html` / `html[data-theme="dark"]` (padrão) e `html[data-theme="light"]`.

### 2.1 Superfícies base

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--color-background` | `#0D0D0D` | `#F4F4F2` | Fundo da aplicação |
| `--color-surface` | `#141414` | `#FAFAF8` | Header, barras |
| `--color-border` | `#1F1F1F` | `#C8C8C4` | Divisores estruturais |
| `--color-modal-bg` | `#0e0e0e` | `#FFFFFF` | Painéis modais |

### 2.2 Texto

| Token | Descrição |
|-------|-----------|
| `--color-text-primary` | Títulos, valores de campo, nomes |
| `--color-text-secondary` | Meta, datas, equipe adversária |
| `--color-text-muted` | Separadores, dois-pontos de placar |
| `--color-text-hint` / `--hub-label` | Labels uppercase de campo |
| `--color-text-ghost` | “VS”, elementos decorativos fracos |
| `--color-text-accent` | Texto sobre fundos brand |

### 2.3 Marca e semântica

| Token | Uso |
|-------|-----|
| `--color-brand` | CTA, placar ativo, aba ativa, sucesso esportivo |
| `--color-on-brand` | Texto sobre botão brand |
| `--color-danger` | Exclusão, erro, cobrança perdida |
| `--color-warning` | Alertas, cartões amarelos |
| `--color-success` | Confirmação (alias brand em muitos contextos) |

Famílias derivadas: `--color-brand-muted-bg`, `--color-brand-border`, `--color-brand-glow`, `--color-danger-muted-bg`, `--color-danger-goal-bg`, etc. — usar para estados hover/fundo sem saturar.

### 2.4 Opacidades de lista (dark)

| Token | Valor dark | Comportamento |
|-------|------------|---------------|
| `--list-row-opacity` | 0.45 | Linha em repouso |
| `--list-row-opacity-inactive` | 0.30 | Entidade inativa |
| Hover | → 1.0 | Revelação total no hover |

No **light**, `--list-row-opacity: 1` — texto sempre legível; hierarquia via peso/cor, não fade.

### 2.5 Gradientes

```css
--gradient-brand: linear-gradient(135deg, #BFF205 0%, #D7F205 100%);
--gradient-section-line: linear-gradient(to right, rgba(191, 242, 5, 0.3), transparent);
--hub-header-glow: radial-gradient(ellipse 80% 60% at 20% 0%, rgba(191, 242, 5, 0.12) 0%, transparent 65%);
```

---

## 3. Camada Hub (`entity-hub`)

Escopo: qualquer página que use `.entityHub` em `entity-hub.module.css`. Tokens **redefinidos** dentro de `.entityHub` e sobrescritos em `:global(html[data-theme="light"]) .entityHub`.

### 3.1 Tokens hub exclusivos

| Token | Função |
|-------|--------|
| `--hub-font-sans` | Inter |
| `--hub-font-mono` | Space Mono |
| `--hub-input-bg` | Fundo de inputs, cards glass, batch bar |
| `--hub-input-bg-hover` | Hover em status bar / campos clicáveis |
| `--hub-glass-bg` | Superfície glass genérica |
| `--hub-glass-bg-elevated` | Fallback de logo, chips elevados |
| `--hub-glass-border` | Borda lateral |
| `--hub-glass-border-top` | Highlight superior (vidro) |
| `--hub-glass-border-focus` | Foco / hover ativo (brand) |
| `--hub-glass-shadow` | Sombra painel grande |
| `--hub-glass-shadow-input` | Sombra inset + externa leve (campos/cards) |
| `--hub-row-divider` | Divisor interno em field rows |
| `--hub-tab-inactive` | Cor de aba inativa |
| `--hub-label` | Labels de formulário |
| `--hub-body-muted` / `--hub-body-subtle` | Texto secundário |

### 3.2 Receita CSS — Glass Card

Padrão replicado em `partida-info`, `partida-posjogo`, `partida-midia`, `partida-formacoes`:

```css
.glassCard {
  border-radius: 14px;
  overflow: hidden; /* ou visible se dropdown interno */
  background: var(--hub-input-bg);
  border: 1px solid var(--hub-glass-border);
  border-top-color: var(--hub-glass-border-top);
  box-shadow: var(--hub-glass-shadow-input);
  backdrop-filter: blur(12px);
}
```

**Border-radius:** 14px (cards), 12px (switches, event cards), 10px (botões primários, batch bar), 9px (indicador interno do switch).

### 3.3 Layout de página hub

```
.entityHub.page
├── .header
│   ├── .headerGlow        → radial brand
│   ├── .headerSurface     → surface + blur
│   └── .headerInner
│       ├── .heroRow (opcional)
│       └── .tabBar | HubAnimatedTabBar | HubGlassSwitch
├── .stripe                → linha gradiente inferior
└── .content
```

**List pages** adicionam: `.hubListPage` + `.hubListContent` + `.hubListFilters` + `.hubListBare`.

---

## 4. Tipografia — escala detalhada

### 4.1 Labels de campo

```css
font-family: var(--hub-font-sans);
font-size: 10px;
font-weight: 700;
letter-spacing: 0.06em;
text-transform: uppercase;
color: var(--hub-label);
```

Opcional `(opcional)` com `.fieldLabelOptional`: peso 600, sem uppercase, opacity 0.45.

### 4.2 Valores de campo

```css
font-family: var(--hub-font-sans);
font-size: 14px;
font-weight: 500;
color: var(--color-text-primary);
```

### 4.3 Abas principais (tab bar)

```css
font-family: var(--hub-font-mono);
font-size: 11px;
font-weight: 600;
letter-spacing: 0.12em;
/* inativa: --hub-tab-inactive; ativa: --color-brand + border-bottom 2px */
```

### 4.4 HubGlassSwitch / sub-abas

```css
font-family: var(--font-sans); /* Inter */
font-size: 10px;
font-weight: 600;
letter-spacing: 0.06em;
text-transform: uppercase;
/* inativa: --hub-body-muted; ativa: --color-brand */
```

### 4.5 Placar — header da partida

| Elemento | Fonte | Tamanho (desktop, expandido) |
|----------|-------|------------------------------|
| Nome da equipe | Inter | 22px, weight 700, uppercase |
| Gol / score | Space Mono | 72px → colapsa com `--hc` |
| Separador `:` | Space Mono | 32px, `--color-text-muted` |
| Meta (data, status) | Space Mono | 11px, weight 700 |

Colapso: `--header-collapse` de 0 a 1 reduz font-size, logo, padding e esconde breadcrumb/competição.

### 4.6 Placar — listas de jogos (`MatchScoreDisplay`)

| Elemento | Fonte | Estilo |
|----------|-------|--------|
| Gols | Space Mono | 24px (hub), `--color-brand` |
| Separador `:` | Space Mono | cor muted |
| Disputa (pênaltis) | Space Mono | **13px**, substitui `:` — ex. `4×3` |
| Perdedor | Space Mono | **opacity 0.38** (`.matchRowScoreValLoser`) |

### 4.7 Timeline pós-jogo

| Elemento | Fonte | Estilo |
|----------|-------|--------|
| Cabeçalho equipe | Inter | 11px, 700, uppercase, `--hub-label` |
| “VS” / ordem | Inter / Space Mono | VS: ghost; minuto/ordem: **Space Mono branco** |
| Nome do atleta | Inter | 13px, 600 |
| Linha secundária | Inter | 11px, `--hub-body-subtle` |
| Placar inline no gol | Space Mono | brand, dentro do nome |

---

## 5. Componentes

### 5.1 Botão primário — `.saveBtn`

- Fundo: `--color-brand`; texto: `--color-on-brand`
- Fonte: Space Mono, 11px, 700, uppercase, `letter-spacing: 0.1em`
- Padding: `10px 24px`; radius: 10px
- Sombra: `0 4px 16px var(--color-brand-shadow)`
- Hover: `translateY(-2px) scale(1.02)` + glow forte
- Ícone Lucide: 14px, `strokeWidth={2.5}` alinhado ao texto

Usar para: Salvar, Nova partida, Nova equipe, Baixar súmulas.

### 5.2 Botão inline — `.hubInlineBtn`

Ação secundária na toolbar (Selecionar, Editar). Borda glass, fundo transparente, Inter/Space Mono conforme contexto.

### 5.3 HubGlassSwitch

**Arquivo:** `hub-glass-switch.tsx` + classes `.hubGlassSwitch*`

- Container glass com padding 4px
- Indicador deslizante: `--color-brand-selected-bg`, borda brand, glow
- Opções uppercase Inter 10px
- Variante `draggable`: scroll horizontal em listas longas de fases (competição hub)
- `data-switch-value` para medição do indicador

**Quando usar:** filtros de fase, sub-abas (PARTIDAS / CONFRONTOS), sub-abas de Informação (DADOS / ARBITRAGEM / SÚMULA).

### 5.4 HubAnimatedTabBar

- Indicador inferior 2px brand (não pill)
- Mesma tipografia de `.tab` mono
- Usado em headers de entidade com abas horizontais

### 5.5 LabSwitch (`variant="glass"`)

- Track/thumb em `.hubToggleSwitch*`
- Label Inter; estado on em brand
- Usar para toggles de visibilidade (formações, filtros booleanos)

### 5.6 LabCheckbox

- Botão `role="checkbox"` customizado
- Accent configurável; padrão `#BFF205`
- Usado em batch selection (aprovações, súmulas, lista de jogos)

### 5.7 LabPicker / LabSelect

- Props `menuSans` + `triggerSans` → Inter no trigger e menu
- Sem `menuSans` → legado Space Mono
- **Padrão atual:** sempre `menuSans` + `triggerSans` em hubs refatorados
- Trigger glass: fundo `--hub-input-bg`, borda hub

### 5.8 HubIsoDatePicker (`dialogOnly`)

- Modal de data sem inline calendar na row
- Acionado por field row clicável na aba Informação

### 5.9 Batch bar — `.hubBatchBar`

Barra horizontal para seleção múltipla:

```css
padding: 10px 12px;
border-radius: 10px;
border: 1px solid var(--hub-glass-border);
background: var(--hub-input-bg);
```

Contém `LabCheckbox` + `.hubBatchBarMeta` + `.hubBatchBarActions` (botões à direita).

### 5.10 Field row (formulário denso)

Grid em `.glassCard`:

```
.fieldRow          → 2 colunas, border-bottom divider
.fieldRowSingle    → 1 coluna
.fieldLabel        → uppercase Inter 10px
.fieldControl      → valor + chevron/ação
.fieldBorderLeft   → separador vertical entre colunas
```

Sem card background **por campo** — um único glassCard envolve o grupo.

### 5.11 Modais

```css
.modalScrim    → rgba scrim, z-index escalonado
.modalPanel    → glass + radius 16px+, max-width por variante (sm/md)
.modalHeader   → título Inter + close
.modalTitle    → uppercase mono ou sans conforme contexto
```

Radio options: `.radioOption` + `.radioCircle` — glass, borda focus brand.

### 5.12 Listas de pessoas / equipes

```
.hubListBare + .athleteListStack
  .athleteListRow (+ .competitionListRow para equipes)
    .athleteListRowInner
      .athleteListRowLink → avatar/logo + detalhes
      .hubListRowEnd → ações (editar)
```

- Nickname/título: `.athleteListNickname` — mono, bold, uppercase curto
- Nome completo: `.athleteListFullName` — Inter, menor
- Logo 36px: `.hubListTeamLogoMain` com fallback sigla

### 5.13 Match row (lista de jogos)

```
.matchRowWrap
  [.matchRowSelectWrap + checkbox slot]
  .matchRow (link)
    .matchRowDate     → data mono + hora/status sub
    .matchRowDivider  → 1px × 24px
    .matchRowCenter   → equipe | logo | placar | logo | equipe
```

Nomes de equipe na lista: **Inter** uppercase (`.matchRowTeamNameSans`), não mono.

---

## 6. Padrões de domínio

### 6.1 Hub da partida (`partida-client`)

**Módulos CSS dedicados** (não misturar com entity-hub genérico):

| Módulo | Aba / área |
|--------|------------|
| `partida-header.module.css` | Header sticky colapsável, placar hero |
| `partida-info.module.css` | Informação, arbitragem, súmula PDF |
| `partida-midia.module.css` | Mídia, MOTM |
| `partida-formacoes.module.css` | Campo tático, visibilidade |
| `partida-posjogo.module.css` | Pós-jogo, timeline, shootout |

**Header:** Inter nos nomes; Space Mono nos gols; scroll drive `--header-collapse`.

**Informação:** sub-abas `HubGlassSwitch`; salvamento de arbitragem **somente** no footer com `confirm()`; picker glass para funções de árbitro.

**Pós-jogo:** ver seção 7.

### 6.2 Hub de competição

- Lista de jogos usa `MatchRow` + `MatchScoreDisplay`
- Filtro de fase: `HubGlassSwitch` draggable
- Modo **Selecionar** por fase → batch bar → ZIP de súmulas
- Seção label: `.hubSectionLabel` uppercase mono

### 6.3 Listas organizacionais

Páginas: `/atletas`, `/equipes`, `/sumulas`, `/aprovacoes`, etc.

Estrutura comum:

```tsx
<div className={`${styles.entityHub} ${styles.page} ${styles.hubListPage} ${styles.personListHub}`}>
  <div className={`${styles.header} ${styles.orgHubHeaderTabsOnly}`}>...</div>
  <div className={`${styles.content} ${styles.hubListContent}`}>...</div>
</div>
```

### 6.4 Página de súmulas (`/sumulas`)

- Mesmo shell de lista organizacional
- Filtros: `LabPicker` + `LabSelect` em cascata (competição → edição → fase)
- Lista reutiliza `.matchList` / `.matchRow*`
- Export ZIP via `baixarSumulasZip()`

---

## 7. Timeline e eventos (pós-jogo)

### 7.1 Princípio visual

- **Sem** container glass atrás da lista inteira — fundo transparente
- Cada ação é um **event card** que só ganha glass no hover
- Layout em **3 colunas**: Equipe A | centro | Equipe B

### 7.2 Ordem do conteúdo

| Lado | Ordem no card |
|------|----------------|
| Equipe A (coluna esquerda) | `atleta/placar → ícone →` minuto no centro |
| Equipe B (coluna direita) | `minuto ← ícone → atleta/placar` |

### 7.3 Event card

```css
.eventCard {
  flex-direction: row;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
}
.eventCard:hover {
  padding: 8px 14px;
  gap: 8px;
  background: var(--hub-input-bg);
  border-color: var(--hub-glass-border);
  backdrop-filter: blur(12px);
}
```

**Exclusão no hover:** expansão **lateral** (não vertical). Toolbar com `max-width: 0 → 24px`; Equipe A expande à esquerda; Equipe B à direita (`order: 2` no toolbar).

### 7.4 Ícones de ação

- Container: `.actionIconBox` — 22×22px
- SVG: 20×20px (`TIMELINE_ICON_SIZE = 20`)
- Shootout: `.kickDot` dentro do mesmo box (goal = brand, miss = danger)

### 7.5 Cabeçalho da timeline

```
EQUIPE A          VS          EQUIPE B
     (Inter 11px uppercase, --hub-label)
```

Shootout: centro mostra **placar da disputa** (Space Mono 22px) em vez de “VS”.

### 7.6 Divisor de período

```
──────  2º T  ──────
```

Linha `--hub-glass-border`; badge `.periodBadge` brand uppercase.

---

## 8. Placar e estados de jogo

### 8.1 Estados

| Status | Exibição |
|--------|----------|
| `scheduled` | `–` em `--hub-body-subtle` |
| `finished` | gols reais em brand |
| Com vencedor | gol do perdedor opacity 0.38 |
| Com pênaltis/shootout | `pen_a × pen_b` no centro, 13px, no lugar de `:` |
| Empate sem shootout | ambos os gols plenos |

### 8.2 Lógica compartilhada

`src/lib/match-display.ts` + componente `MatchScoreDisplay`:

- `getMatchWinner()` — regulamento ou disputa
- `matchHasPenaltyShootout()` — `finish_type` + `pen_a`/`pen_b`

---

## 9. Ícones

- Biblioteca: **Lucide React**
- Tamanhos padrão: 14–16px (toolbar), 20px (timeline), `strokeWidth` 1.8–2.5
- Cor: herda do texto ou `--color-text-secondary`; brand/danger em estados semânticos
- Evitar emoji como ícone funcional

---

## 10. Temas dark / light

Alternância via `html[data-theme="light"]` (ThemeProvider).

| Aspecto | Dark | Light |
|---------|------|-------|
| Glass bg | preto 42% | branco 78% |
| Labels | `--color-text-hint` | `#0a0a0a` |
| List row opacity | 0.45 repouso | 1.0 sempre |
| Brand | `#BFF205` | `#9BC004` |
| Sombras glass | mais profundas | inset claros, sombra suave |

**Implementação:** sempre que definir cor hub, duplicar bloco em `:global(html[data-theme="light"]) .entityHub { ... }`.

---

## 11. Arquitetura de arquivos

```
src/app/globals.css              → tokens globais + temas
src/app/(lab)/components/
  entity-hub.module.css          → sistema hub (7000+ linhas, fonte da verdade)
  hub-glass-switch.tsx           → HubGlassSwitch, HubAnimatedTabBar
  lab-*.tsx                      → checkbox, picker, select, switch
  match-score-display.tsx        → placar em listas
src/lib/lab-theme.ts             → brand fixo vs cor de entidade
src/lib/match-display.ts         → lógica de vencedor/placar
src/app/(lab)/partidas/[matchId]/
  partida-*.module.css           → escopo por aba da partida
```

### 11.1 Quando criar CSS module novo

Crie `*-*.module.css` dedicado quando:

- a tela tem layout único (partida, bracket, classificação)
- o escopo não deve inflar `entity-hub.module.css`

Mantenha **tokens hub** (`var(--hub-*)`) — não hardcode rgba solto.

### 11.2 Checklist para nova tela hub

1. Root: `className={styles.entityHub}` (herda tokens)
2. Header com glow + surface + tabs glass
3. Conteúdo em `.content` com max-width se formulário (`720px` info, `960px` pós-jogo)
4. Labels Inter uppercase 10px
5. Números em Space Mono
6. CTA `.saveBtn` único por contexto de salvamento
7. Tema light testado

---

## 12. Acessibilidade mínima

- Contraste: brand sobre `#0D0D0D` e texto primary sobre background validados no dark
- Focus visible: usar `--hub-glass-border-focus` em elementos interativos glass
- `role="tablist"` / `role="tab"` / `aria-selected` nos switches
- `role="checkbox"` / `aria-checked` no LabCheckbox
- Links de linha inteira: botão de exclusão com `aria-label="Remover"`
- Modais: scrim clicável fecha; `stopPropagation` no painel

---

## 13. Anti-patterns (não fazer)

| Evitar | Preferir |
|--------|----------|
| Space Mono em parágrafos longos | Inter |
| Inter em placares e minutos | Space Mono |
| Card glass por item em listas longas | hover card ou lista bare |
| Subtítulo abaixo de cada label | só o label uppercase |
| Cor da equipe em botão Salvar | `--color-brand` |
| `LabSelect` mono em hubs novos | `menuSans` + `triggerSans` |
| Exclusão sobreposta ao conteúdo | expansão lateral do card |
| Container glass atrás da timeline inteira | fundo transparente |
| Múltiplos botões “Salvar” dispersos | footer único + confirmação quando destrutivo |

---

## 14. Referência rápida de spacing

| Contexto | Padding / gap |
|----------|----------------|
| Field interno | 10px 14px |
| Glass card externo | 14–16px |
| Tab switch option | 10px 14px |
| Match row vertical | 3px entre linhas |
| Timeline row | 3px 0 |
| Header inner | 24px 36px 0 (desktop hub) |
| Content hub | 24–32px lateral |
| Gap logos ↔ placar | 12px |

---

## 15. Referência de componentes React

| Componente | Import |
|------------|--------|
| `HubGlassSwitch` | `@/app/(lab)/components/hub-glass-switch` |
| `HubAnimatedTabBar` | idem |
| `LabSwitch` | `@/app/(lab)/components/lab-switch` |
| `LabCheckbox` | `@/app/(lab)/components/lab-checkbox` |
| `LabPicker` | `@/app/(lab)/components/lab-picker` |
| `LabSelect` | `@/app/(lab)/components/lab-select` |
| `HubIsoDatePicker` | `@/app/(lab)/components/hub-iso-date-picker` |
| `MatchScoreDisplay` | `@/app/(lab)/components/match-score-display` |
| `toast` | `@/app/(lab)/components/toast` |

---

## 16. Glossário

| Termo | Significado neste DS |
|-------|---------------------|
| **Liquid Glass** | Superfície blur + borda highlight + sombra inset |
| **Hub** | Shell de página com header, abas e tokens `--hub-*` |
| **Field row** | Linha label+valor dentro de glass card |
| **Batch bar** | Toolbar de seleção múltipla |
| **Event card** | Item da timeline pós-jogo com hover glass |
| **Bare list** | Lista sem painel envolvente |
| **Chrome** | UI do produto (não conteúdo esportivo) |

---

## 17. Evolução futura sugerida

- Extrair tokens hub para `hub-tokens.css` importável
- Storybook com `HubGlassSwitch`, `MatchScoreDisplay`, field rows
- Documentar animação `--header-collapse` com diagrama de estados
- Unificar `partida-*` tokens em um `partida-tokens.css` compartilhado

---

*Documento gerado para handoff do sprint visual 06.lab — partidas, competições, organização e pós-jogo. Para alterações de token, sincronizar `globals.css`, `entity-hub.module.css` e este arquivo.*


















==================================================================


Handoff — Bracket Views (06 LAB → 06 SCORE)
Documento de referência para replicar a visualização de chaves eliminatórias criada no hub de competições do 06 LAB, na aba CLASSIFICAÇÃO, para o site público 06 SCORE.

1. Onde vive e quando aparece
No competicao-hub.tsx, a aba CLASSIFICAÇÃO renderiza conteúdo diferente conforme o phase_type da fase selecionada:

phase_type	Visualização
group_stage
Tabelas por grupo
round_robin
Tabela única de pontos corridos
knockout
BracketView — chave linear (esquerda → direita)
conference
BracketView — chave espelhada (Oeste ← Grande Final → Leste)
Para mata-mata e conferência, o componente raiz é BracketView, que escolhe entre KnockoutBracket e ConferenceBracket.

Arquivos principais:

Lógica + componentes: src/app/(lab)/competicoes/[id]/competicao-hub.tsx (bloco BracketView, ~linha 4773 em diante)
Estilos dedicados: src/app/(lab)/competicoes/[id]/bracket-hub.module.css
2. Modelo de dados
Entidades usadas
Fase (phases) — define o tipo (knockout | conference) e as rodadas filhas.

Rodada (rounds) — por fase:

name / custom_label — rótulo exibido na coluna (ex.: "Oitavas de Final", "Grande Final")
display_order — ordem entre rodadas
legs — confronto em múltiplos jogos (ida/volta)
aggregate_score — se legs, usa placar agregado (gols somados) em vez de vitórias na série
Confronto (matchups) — unidade visual do card:

phase_id, round_id, round_label
team_a_id, team_b_id + joins teams_a / teams_b (nome, sigla, logo)
display_order — posição dentro da rodada; define o encaixe na árvore (par 1+2 → próximo, par 3+4 → próximo, etc.)
is_completed
Partida (matches) — jogos do confronto:

matchup_id, score_a, score_b, status, match_date, team_a_id
Pênaltis: tabela match_penalty_shootout (result = 'goal' por chute); agregados em pen_a / pen_b por partida
Regra de encaixe na árvore
Os conectores SVG assumem uma árvore binária padrão:

Rodada N:   [0] [1] [2] [3] [4] [5] ...
                 ↓     ↓     ↓
Rodada N+1:    [0]   [1]   [2] ...
Confrontos ordenados por display_order dentro de cada rodada.
Índices 2i e 2i+1 da rodada anterior alimentam o confronto i da rodada seguinte.
Disputa de Terceiro Lugar é coluna separada, fora do fluxo principal (sem conector para a final).
3. Duas layouts
3.1 Knockout (phase_type === "knockout")
Colunas em sequência esquerda → direita: primeira rodada → … → semifinal → final.
Disputa de Terceiro Lugar aparece como última coluna (se existir na fase).
Conectores SVG desenhados em LTR (direction: "ltr").
Hover no time (knockout only): destaca o caminho do time na chave (ver §5).
Ordem canônica das rodadas (fallback se display_order não resolver):

Décimas de Final → Oitavas → Quartas → Semifinal → Final → Disputa de Terceiro Lugar
3.2 Conference (phase_type === "conference")
Layout estilo NBA/playoffs:

[Oeste] | Oitavas Oeste | Quartas Oeste | ... | [GRANDE FINAL] | ... Quartas Leste | Oitavas Leste | [Leste]
Confrontos de cada rodada são divididos ao meio por display_order:
primeira metade → conferência Oeste
segunda metade → conferência Leste
Coluna central: Grande Final (detectada por regex em round_label: grande final, gf, grand final).
Dois conjuntos de conectores SVG:
Oeste: LTR (cresce em direção ao centro)
Leste: RTL (espelhado)
Tags verticais "Oeste" (azul) e "Leste" (rosa).
Sem highlight de caminho por hover (apenas knockout).
4. Algoritmo de layout vertical (slots)
Constantes fixas (devem permanecer sincronizadas entre JS e CSS):

BRACKET_CARD_HEIGHT = 94px
BRACKET_SLOT_GAP    = 36px  (--bracket-slot-gap no CSS)
BRACKET_SLOT_PAD    = 12px
A primeira rodada define a altura total da árvore:

treeHeight = n × (cardHeight + pad) + (n - 1) × gap
Cada rodada subsequente dobra o espaço por slot (metade dos confrontos, cada um centralizado no par anterior):

slotHeight(roundIndex) = (treeHeight - gaps) / confrontosNessaRodada
Exceção: coluna "Disputa de Terceiro Lugar" usa altura fixa de um slot.

Isso garante alinhamento vertical entre pares e destinos, independente do número de rodadas.

5. Conectores SVG
Arquitetura
Canvas: div.bracketCanvas (position: relative)
SVG absoluto (bracketSvg) cobrindo o canvas; cards em z-index superior
Cada coluna: data-bracket-round="{label}" ou data-bracket-round="west:{label}"
Cada slot: data-matchup-id="{uuid}"
Cada card: data-bracket-card
Desenho (drawBracketConnectors)
Para cada par de colunas adjacentes, calcula forkX no meio do gap horizontal.
Para cada destino na coluna seguinte:
Busca âncoras nos cards (getBracketCardAnchor) — borda direita (saída) ou esquerda (entrada).
Dois pais → drawBracketForkPair (linhas horizontais + vertical entre eles + tronco até o filho).
Um pai → drawBracketSingleLink.
ResizeObserver + requestAnimationFrame redesenham após layout, resize ou reorder.
Highlight de caminho (knockout)
Cada path SVG carrega data-path-keys (ex.: stub:{matchupId}, spine:{srcA:srcB:dst}, entry:{dstId}).

No hover de um time (BracketTeamRow → onTeamHover):

computeTeamPathKeys percorre a árvore verificando se o time avançou em cada rodada.
Paths com keys ativas recebem .bracketPathActive (opacidade do stroke sobe de 0.22 → 1).
Cor dos conectores: currentColor com color: var(--color-brand) no SVG.

6. Card de confronto (BracketMatchupCard)
Cada card mostra duas linhas (BracketTeamRow):

Logo (ou iniciais) + nome (short_name → abbreviation → full_name, ou "A definir")
Placar à direita (mono, 18px); vencedor em brand, perdedor atenuado
Pênaltis: (N) antes do placar quando aplicável
Lógica de resultado (computeMatchupResult)
Depende das flags da rodada:

Cenário	Exibição no card
Jogo único (legs = false)
Placar do jogo; pen do jogo se houver
Ida/volta + agregado (legs + aggregate_score)
Soma de gols; pen do último jogo se empate
Ida/volta + vitórias (legs, sem agregado)
Contagem de vitórias (ex.: 2–1 na série)
Vencedor:

Jogo único: maior placar, ou pen se empate
Agregado: maior soma de gols, ou pen no último jogo
Série: mais vitórias individuais
Card é clicável apenas se há partidas cadastradas e não está em modo reorder → abre BracketSeriesModal.

7. Modal de série (BracketSeriesModal)
Cabeçalho com chips dos dois times
Resumo opcional: "Placar agregado" ou "Vitórias na série"
Lista de jogos (ida, volta, …) com placar, status e barra de pênaltis
Link para abrir a partida no hub (router.push)
No 06 SCORE, o equivalente seria link para página pública da partida ou modal somente leitura.

8. Modo reorder (somente LAB / admin)
Botão "Reordenar confrontos" na toolbar da aba CLASSIFICAÇÃO:

Drag-and-drop dentro da mesma rodada (e, em conference, dentro do mesmo lado Oeste/Leste)
Persiste via atualizarOrdemConfrontos([{ id, display_order }]})
Optimistic update com rollback em erro
Conectores redesenham após reorder
Para o 06 SCORE: omitir reorder; é funcionalidade de backoffice.

9. Carregamento de dados (BracketView)
Recebe matchups e phaseRounds já filtrados por fase (do server/parent).
Client-side: busca matches por matchup_id + match_penalty_shootout por match_id.
Enriquece cada matchup com matches[] e calcula pen_a/pen_b.
Estado loading → skeleton "Carregando chaveamento…".
Sugestão para 06 SCORE
Expor um endpoint/RPC público que retorne, por edição + fase:

{
  phase: { id, phase_type, label },
  rounds: [{ id, label, display_order, legs, aggregate_score }],
  matchups: [{
    id, round_label, display_order,
    team_a, team_b,
    matches: [{ id, score_a, score_b, status, match_date, pen_a, pen_b }]
  }]
}
Preferível agregar pênaltis no backend para evitar N+1 no cliente público.

10. Design system (tokens usados)
O bracket segue o padrão Liquid Glass do hub:

Token / classe	Uso
--bracket-col-width: 210px
Largura fixa de coluna
--bracket-col-gap: 56px
Espaço entre colunas (onde ficam os conectores)
--bracket-panel-bg
Fundo do card (glass elevado)
--color-brand
Títulos de rodada, vencedor, conectores, hover
--color-warning
Título "Disputa de Terceiro Lugar"
#60a5fa / #f472b6
Oeste / Leste (conference)
bracketCanvasWrap
overflow-x: auto — chaves largas rolam horizontalmente
Cards: borda glass, sombra, hover com color-mix brand. Tipografia: sans para nomes, mono para placares e rótulos uppercase.

11. Checklist para portar ao 06 SCORE
Componentes a extrair (recomendado)
Separar do competicao-hub.tsx (~1.300 linhas de bracket) para um pacote compartilhado ou pasta src/components/bracket/:

BracketView
├── KnockoutBracket
├── ConferenceBracket
├── BracketMatchupCard / BracketTeamRow
├── BracketSeriesModal (ou variante pública)
├── drawBracketConnectors + helpers de layout
└── computeMatchupResult + helpers de placar
Comportamentos públicos vs admin
Feature	LAB	06 SCORE
Visualização da chave
✅
✅
Placares + vencedor
✅
✅
Hover highlight caminho
✅
✅ (diferencial UX)
Modal detalhe da série
✅
✅ (link para partida)
Drag reorder
✅
❌
Scroll horizontal
✅
✅
Edge cases a tratar
Confronto com apenas um time definido (TBD / bye) — conector single-link
Rodadas com labels customizados — canonicalRoundLabel faz match por id, nome exato ou case-insensitive
Fase sem confrontos — empty state
Grande Final ausente em conference — coluna "A definir"
Imagens grandes / muitas rodadas — scroll horizontal já previsto
Performance no site público
SSR ou RSC para dados iniciais; hidratar interatividade (hover SVG, modal)
Evitar createClient + fetch por card; um único fetch por fase
ResizeObserver no SVG é leve; redesenho só em resize/reorder
12. Fluxo resumido (diagrama)
CLASSIFICAÇÃO → seleciona fase
       │
       ├─ group_stage / round_robin → tabelas
       │
       └─ knockout / conference
              │
              ▼
         BracketView (fetch matches + pens)
              │
              ├─ knockout → colunas LTR + highlight hover
              │
              └─ conference → Oeste LTR │ Final │ Leste RTL
                     │
                     ▼
              SVG conectores (ResizeObserver)
                     │
                     ▼
              BracketMatchupCard (placar)
                     │
                     click → BracketSeriesModal
13. Dependências
react-image-crop — não usado no bracket
Nenhuma lib de bracket externa — layout e SVG são custom
Supabase client no LAB; no SCORE, equivalente via API pública
CSS Modules (bracket-hub.module.css) — portar tokens para o tema do SCORE

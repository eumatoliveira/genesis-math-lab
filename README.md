# GENESIS — Laboratório Autônomo de Descoberta Matemática Orientada por Visualização

**Metodologia:** *Visual-First Scientific Discovery* · **Arquitetura:** 17 Agentes Especializados + Motor 3D GPU (Three.js/GLSL) + Backend Python (`FastAPI`, `SymPy`, `mpmath`, `NumPy`, `ReportLab`, `SQLite`, `NetworkX`)

> **Separação Epistemológica Obrigatória:** Este laboratório separa explicitamente inspiração filosófica/ética (Gênesis, Jesus/Logos, Hermes Trismegisto, Nosso Lar), intuição científica de grandes mestres (Tesla, Einstein, Da Vinci, Oppenheimer, Newton, Faraday, Maxwell, Ramanujan, Turing, von Neumann, Feynman, Poincaré, Mandelbrot, Noether, Shannon, Wolfram), analogias físicas exploratórias ("Campo Wi-Fi"), evidências experimentais finitas e demonstrações matemáticas formais. Simulações visuais **não** substituem provas formais nem declaram conjecturas em aberto como resolvidas.

---

## Os 14 Blocos DevOS do Projeto

- **[0] Normalização:** Transformar a busca bruta computacional em investigação científica *Visual-First*: representar graficamente primeiro, observar padrões/anomalias, sintetizar hipóteses simbólicas e validá-las de forma adversarial.
- **[1] Discovery:** Cobrir problemas do Milênio, Teoria dos Números (incluindo Collatz, Goldbach, Cuboide Perfeito, Quadrado Mágico de Quadrados), Álgebra, Geometria/Topologia (Sofá de Gerver / Baek 2024, Kakeya 3D / Wang & Zahl 2025), EDPs, Computação/IA, Combinatória/Grafos, Lógica (CH/ZFC, Busy Beaver BB(5) Coq 2024), Probabilidade (Bourgain Slicing 2024), Física Matemática e os 23 Problemas de Hilbert.
- **[2] Decisão Crítica:** Arquitetura híbrida desacoplada (Python 17 agentes + React 19 / Three.js) com fallback local resiliente e separação entre agentes geradores e auditores (Red Team).
- **[3] MVP & Escala Completa:** Catálogo operacional com 113 problemas interativos, 5 monografias open-access arXiv baixadas com verificação SHA-256, 34+ referências multilíngues ao vivo e dossiês de 9 arquivos (`.md` + `.pdf`) por problema.
- **[4] Blueprint Arquitetural:** Consulte [docs/adr/](docs/adr/) e [docs/ARCHITECTURE.en.md](docs/ARCHITECTURE.en.md).
- **[5] Requisitos Não-Funcionais (PC Doméstico):** Otimizado para hardware doméstico auditado (`Intel Core i5-10400`, `32 GB RAM`, `NVIDIA RTX 3050`), com limite configurável de RAM (`12–16 GB`), CPU (`50–70%`), orçamento de busca ≤ `5.5 ms/frame` e amostragem adaptativa `18×18` (~81% de economia sobre força bruta).
- **[6] TDD & Verificação:** Suíte `pytest` no backend (controles negativos Fermat $F_5$ e Euler $k=5$, Collatz $27 \rightarrow 111/9232$, `mpmath` 25 dígitos para $\zeta(s)$) e `vitest` + `tsc` no frontend.
- **[7] Execução Modular:** 17 agentes (`AGENT 00` a `AGENT 16`) persistindo checkpoints em `research/checkpoints/` e proveniência SHA-256 em `research/genesis_knowledge.db`.
- **[8] Quality Gates:** Checagem anti-circularidade pelo Red Team (`AGENT 13`), proibição de `sorry`/`admit` em esqueletos Lean 4 (`AGENT 11`) e auditoria visual automatizada em navegador real.
- **[9] Infraestrutura Local:** Execução 100% local (`127.0.0.1:8000` + `127.0.0.1:5173`), sem dependência obrigatória de APIs pagas, cloud ou supercomputadores.
- **[10] Observabilidade:** Telemetria em tempo real via `psutil`, GPU NVIDIA, logs JSONL em `research/experiments/events.jsonl` e FPS/latência no painel.
- **[11] Performance & Economia Adaptativa:** Refinamento seletivo somente onde $|∇f|$ supera percentil 88 e redução automática de resolução por perfil (`eco`, `balanced`, `ultra`).
- **[12] Documentação Bilíngue & Relatórios:** Documentação em PT-BR e EN, matriz curricular e exportação de `.md` e `.pdf` com captura WebGL 3D.
- **[13] Operação & Reprodutibilidade:** Versionamento Git, seeds determinísticas e script `backend/scripts/bootstrap_research.py`.

---

## Como Executar Localmente

### 1. Backend Científico (Python 3.14)
```powershell
cd backend
python -m pytest -v
python scripts/bootstrap_research.py
python -m uvicorn genesis.api:app --host 127.0.0.1 --port 8000
```

### 2. Frontend 3D Interativo (React 19 + Three.js + Tailwind v4)
```powershell
cd frontend
npm install
npx tsc --noEmit
npm run test:run
npm run build
npm run dev -- --host 127.0.0.1 --port 5173
```

Acesse `http://127.0.0.1:5173`.

---

## Estrutura de Resultados (`research/`)
- `research/genesis_knowledge.db` — Banco SQLite com experimentos, hipóteses, contraexemplos, referências e grafo NetworkX.
- `research/references/books/` — Monografias matemáticas open-access verificadas via SHA-256.
- `research/problems/<id>/` — Dossiê de 9 arquivos por problema (`research-summary.md`, `mathematical-formulation.md`, `literature-review.md`, `experimental-results.md`, `hypotheses.md`, `counterexamples.md`, `formal-verification.md`, `reproducibility.md`, `research-report.pdf`).
- `research/rejected-approaches/` — Hipóteses descartadas pelo Scientific Red Team.

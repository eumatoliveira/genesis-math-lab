# Matriz de Cobertura Curricular — GENESIS

Avaliação sistemática das competências de computação e engenharia aplicadas neste projeto:

| Curso / Área | Competências Cobertas no GENESIS | Evidências no Repositório |
|---|---|---|
| **Análise e Desenvolvimento de Sistemas (ADS)** | Arquitetura em camadas (Adapters/Engines/UI), APIs REST/WebSocket (`FastAPI`), persistência relacional (`SQLite`), TypeScript estrito, testes automatizados (`pytest` + `vitest`). | `backend/genesis/api.py`, `frontend/src/adapters/` |
| **Ciência da Computação (CC)** | Teoria da Complexidade (`P vs NP`, `BQP`, `ETH/SETH`), Máquina de Turing (`Busy Beaver`), Métodos Numéricos (`Stable Fluids`, `RK4`), FFT/Regressão Simbólica, Grafos (`NetworkX`), Teoria dos Números e Verificação Formal (`Lean 4` esqueletos). | `backend/genesis/plugins/`, `frontend/src/engines/` |
| **Sistemas de Informação (SI)** | Governança de dados e proveniência (SHA-256), grafos de conhecimento organizacional, busca bibliográfica multilíngue (`arXiv`, `OpenAlex`, `OEIS`) e geração automatizada de relatórios gerenciais/científicos (PDF/MD). | `backend/genesis/storage/knowledge_base.py`, `reporting_agent.py` |
| **Engenharia de Software (ES)** | ADRs documentadas (`docs/adr/`), separação gerador vs Red Team adversarial, controles positivos e negativos em suítes de teste, observabilidade (`psutil`, FPS, logs JSONL), ErrorBoundary e auditoria end-to-end no navegador. | `docs/adr/`, `backend/tests/`, `frontend/src/test/` |
| **Gestão de TI (GTI)** | Governança computacional em hardware doméstico (tetos de RAM 12–16 GB, CPU 50–70%, perfis Eco/Balanced/Ultra, backpressure térmico/disco) e rastreabilidade auditável de custos computacionais (economia adaptativa ~81%). | `backend/genesis/agents/hardware_agent.py`, `config.py` |

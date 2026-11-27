# ADR-002: Separação dos 17 Agentes Especializados e Governança por Red Team Adversarial

## Status
Aceito (2026-11-27)

## Contexto
Sistemas autônomos de descoberta matemática sofrem risco crítico de *viés de confirmação* e *autoaprovação circular*: o mesmo módulo que gera uma hipótese a partir de uma visualização ou ajuste estatístico não pode ser o módulo que a valida ou promove a resultado formal.

## Decisão
Estruturar a pipeline **GENESIS** em **17 agentes independentes** (`AGENT 00` a `AGENT 16`) com responsabilidades, entradas, saídas e critérios de rejeição estritamente segregados:
- **Geração e Exploração**: `01 Research`, `02 Decomposition`, `03 Visual Discovery`, `04 Computational Physics`, `05 Simulation`, `06 Pattern Recognition`, `07 Symbolic Discovery`, `08 Evolutionary`, `09 Quantum-Inspired`.
- **Adversarial, Formalização e Auditoria Independente**: `10 Counterexample Hunter` (busca destrutiva com aritmética exata), `11 Formal Theorem Prover` (proibição explícita de `sorry`/`admit`/axiomas ocultos), `13 Scientific Red Team` (revisão independente capaz de rejeitar hipóteses circulares ou sobreajustadas para `research/rejected-approaches/`).
- **Infraestrutura e Síntese**: `00 Master Orchestrator`, `12 Hardware Optimization`, `14 Knowledge & Memory`, `15 Scientific Reporting`, `16 Scientific UI/UX`.

## Consequências
- Hipóteses candidatas nunca podem alterar seus próprios critérios de validação.
- Resultados negativos e refutações são persistidos como conhecimento útil para impedir que o orquestrador repita estratégias improdutivas.

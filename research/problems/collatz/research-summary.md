# Conjectura de Collatz (Problema 3n + 1) — Resumo Científico (collatz)

**Área:** Teoria dos Números / Sistemas Dinâmicos Discretos  
**Situação Científica Atual:** Em aberto (Terence Tao 2019 provou que quase todas as órbitas atingem valores quase limitados)  
**Classificação Epistemológica (GENESIS 9 Níveis):** `Conjectura`  
**Classificação Física:** `Analogia Exploratória`

> **Aviso de Governança:** Resultados experimentais e visuais não constituem demonstração matemática formal.

## Lente Filosófica e Metodológica (Separada da Evidência Científica)
- **Inspiração Filosófica & Ética:** Gênesis (ordem emergindo da aparente desordem) e Hermes (Princípio do Ritmo e Polaridade par/ímpar).
- **Referências Científicas Históricas:** Ramanujan (observação de séries/padrões), Poincaré (órbitas dinâmicas) e Wolfram (regras simples com comportamento emergente).
- **Analogia Conceitual:** Fluxo discreto com expansão 3n+1 compensada por contração binária n/2.
- **Nota:** Inspiração filosófica e analogias conceituais NÃO constituem evidência experimental nem demonstração formal.

## Descoberta Orientada por Visualização
- **Projeção Ativa:** `cartesian_3d` (`Projeção ortogonal direta (x, valor_observado, z)`)
- **Regimes Detectados (Agente 06):** Dinâmica sensível / divergência local elevada
- **Pista Visual:** Padrão logarítmico de descida com estrias horizontais correspondentes a classes de congruência mod 6 e mod 16.
- **Economia por Amostragem Adaptativa:** `81.7%` menos avaliações (949 vs 5184 em força bruta).

## Próximos Experimentos Sugeridos
1. Refinar localmente os hotspots visuais detectados (`z_score > 1.5`) sem aumentar desperdício em regiões uniformes.
2. Submeter novas hipóteses simbólicas aprovadas pelo Red Team a verificadores formais externos (Lean 4 / Z3).

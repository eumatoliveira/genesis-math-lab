# Existência e Suavidade de Navier–Stokes (Problema do Milênio) — Resumo Científico (navier-stokes)

**Área:** Equações Diferenciais Parciais / Dinâmica dos Fluidos  
**Situação Científica Atual:** Em aberto em 3D (soluções suaves globais provadas em 2D; soluções fracas de Leray-Hopf existem em 3D)  
**Classificação Epistemológica (GENESIS 9 Níveis):** `Conjectura`  
**Classificação Física:** `Equivalência Demonstrada`

> **Aviso de Governança:** Resultados experimentais e visuais não constituem demonstração matemática formal.

## Lente Filosófica e Metodológica (Separada da Evidência Científica)
- **Inspiração Filosófica & Ética:** Leonardo da Vinci (estudos clássicos de vórtices da água) e Gênesis (águas primordiais ordenadas).
- **Referências Científicas Históricas:** Da Vinci, Navier, Stokes, Kolmogorov e Feynman (turbulência multiescala).
- **Analogia Conceitual:** Equilíbrio dinâmico entre transporte não linear caótico e difusão viscosa suavizadora.
- **Nota:** Inspiração filosófica e analogias conceituais NÃO constituem evidência experimental nem demonstração formal.

## Descoberta Orientada por Visualização
- **Projeção Ativa:** `cartesian_3d` (`Projeção ortogonal direta (x, valor_observado, z)`)
- **Regimes Detectados (Agente 06):** Comportamento aperiódico / multiescala sem dominância linear
- **Pista Visual:** Células de vorticidade contra-rotativas e decaimento exponencial da enstrofia sob difusão viscosa.
- **Economia por Amostragem Adaptativa:** `81.7%` menos avaliações (949 vs 5184 em força bruta).

## Próximos Experimentos Sugeridos
1. Refinar localmente os hotspots visuais detectados (`z_score > 1.5`) sem aumentar desperdício em regiões uniformes.
2. Submeter novas hipóteses simbólicas aprovadas pelo Red Team a verificadores formais externos (Lean 4 / Z3).

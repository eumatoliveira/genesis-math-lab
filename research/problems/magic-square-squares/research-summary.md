# Quadrado Mágico de Quadrados 3×3 — Resumo Científico (magic-square-squares)

**Área:** Teoria dos Números / Combinatória Aritmética  
**Situação Científica Atual:** Em aberto (Quadrado de Parker atinge 7/8 linhas com entradas repetidas; caso distinto permanece aberto)  
**Classificação Epistemológica (GENESIS 9 Níveis):** `Conjectura`  
**Classificação Física:** `Hipótese Não Validada`

> **Aviso de Governança:** Resultados experimentais e visuais não constituem demonstração matemática formal.

## Lente Filosófica e Metodológica (Separada da Evidência Científica)
- **Inspiração Filosófica & Ética:** Da Vinci e tradições geométricas clássicas (equilíbrio numérico em todas as direções).
- **Referências Científicas Históricas:** Lucas e Euler (parametrização de progressões quadráticas).
- **Analogia Conceitual:** Equilíbrio de momentos em uma matriz bidimensional de energias quadráticas.
- **Nota:** Inspiração filosófica e analogias conceituais NÃO constituem evidência experimental nem demonstração formal.

## Descoberta Orientada por Visualização
- **Projeção Ativa:** `stereographic_4d` (`(x, y, z, w) -> (x/(2-w), y/(2-w), z/(2-w)) com w = tanh(||p||/4)`)
- **Regimes Detectados (Agente 06):** Alta simetria espacial detectada, Dinâmica sensível / divergência local elevada
- **Pista Visual:** Superfície de restrições de Lucas mostrando onde 7 de 8 equações lineares colapsam em resíduo nulo e a 8ª diagonal diverge.
- **Economia por Amostragem Adaptativa:** `81.6%` menos avaliações (954 vs 5184 em força bruta).

## Próximos Experimentos Sugeridos
1. Refinar localmente os hotspots visuais detectados (`z_score > 1.5`) sem aumentar desperdício em regiões uniformes.
2. Submeter novas hipóteses simbólicas aprovadas pelo Red Team a verificadores formais externos (Lean 4 / Z3).

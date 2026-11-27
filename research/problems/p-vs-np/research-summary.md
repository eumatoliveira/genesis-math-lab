# P versus NP (Problema do Milênio) — Resumo Científico (p-vs-np)

**Área:** Ciência da Computação Teórica / Complexidade  
**Situação Científica Atual:** Em aberto (barreiras conhecidas: relativização, provas naturais e algebrização)  
**Classificação Epistemológica (GENESIS 9 Níveis):** `Conjectura`  
**Classificação Física:** `Modelo Aproximado`

> **Aviso de Governança:** Resultados experimentais e visuais não constituem demonstração matemática formal.

## Lente Filosófica e Metodológica (Separada da Evidência Científica)
- **Inspiração Filosófica & Ética:** Hermes (Dualidade entre descobrir e verificar — Polaridade) e Gênesis (sabedoria vs esforço bruto).
- **Referências Científicas Históricas:** Turing, von Neumann, Shannon (entropia da informação e limites da computabilidade).
- **Analogia Conceitual:** Buscar uma chave criptográfica em paisagem exponencial versus validar a fechadura.
- **Nota:** Inspiração filosófica e analogias conceituais NÃO constituem evidência experimental nem demonstração formal.

## Descoberta Orientada por Visualização
- **Projeção Ativa:** `stereographic_4d` (`(x, y, z, w) -> (x/(2-w), y/(2-w), z/(2-w)) com w = tanh(||p||/4)`)
- **Regimes Detectados (Agente 06):** Alta simetria espacial detectada
- **Pista Visual:** Crista abrupta de complexidade e queda sigmoidal da satisfatibilidade centrada em α ≈ 4.26.
- **Economia por Amostragem Adaptativa:** `81.6%` menos avaliações (954 vs 5184 em força bruta).

## Próximos Experimentos Sugeridos
1. Refinar localmente os hotspots visuais detectados (`z_score > 1.5`) sem aumentar desperdício em regiões uniformes.
2. Submeter novas hipóteses simbólicas aprovadas pelo Red Team a verificadores formais externos (Lean 4 / Z3).

# Resultados Experimentais — exp_9b9b4fde8b402d6f

- **Estratégia:** `adaptive` | **Seed:** `45`
- **Duração:** `21.26 ms` | **RAM Processo/Host:** `273.1 MB`
- **Resumo:** Quadrado Mágico de Quadrados 3×3: avaliadas 300 configurações; referência histórica de Parker atinge 7/8 somas (mas com entradas repetidas). Máximo com 9 quadrados distintos nesta amostra: 1/8 linhas.

## Métricas Observadas
```json
{
  "trials_evaluated": 300,
  "parker_square_matching_lines": 7,
  "distinct_3x3_best_matching_lines": 1,
  "parker_magic_target": 3051,
  "exact_distinct_magic_square_found": false,
  "parker_sum_variance": 121968.0
}
```

## Amostragem Adaptativa vs. Força Bruta (Seção 9)
```json
{
  "coarse_grid": "18x18",
  "target_effective_grid": "72x72",
  "brute_force_evaluations": 5184,
  "adaptive_evaluations": 954,
  "hotspot_area_fraction": 0.122,
  "compute_saved_percent": 81.6,
  "note": "Amostragem adaptativa concentra resolução apenas onde gradiente/anomalia visual supera percentil 88."
}
```

## Benchmark Quântico-Inspirado vs. Clássico (Agente 09)
```json
{
  "method": "Simulated Quantum Annealing (4 réplicas de Trotter com campo transverso Γ decrescente)",
  "classical_baseline": "Metropolis-Hastings clássico em hardware convencional",
  "landscape_global_min_observed": 1.3863,
  "classical_best_found": 1.3863,
  "quantum_inspired_best_found": 1.3863,
  "classical_ms": 0.54,
  "quantum_inspired_ms": 2.253,
  "quantum_inspired_improved_valley": true,
  "honest_caveat": "Executa em CPU clássica simulando tunelamento de barreiras estreitas; NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** Ângulos conformes locais; Conectividade topológica fora do polo de projeção
- **Descartadas:** Distâncias métricas euclidianas globais; Volume absoluto em alta dimensão

## Limitações Explícitas
- Problema aberto: não se sabe se existe quadrado mágico 3×3 formado por 9 quadrados inteiros positivos distintos.

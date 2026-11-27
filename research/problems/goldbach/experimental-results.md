# Resultados Experimentais — exp_fbec34401eac9b7a

- **Estratégia:** `adaptive` | **Seed:** `43`
- **Duração:** `8.78 ms` | **RAM Processo/Host:** `272.6 MB`
- **Resumo:** Cometa de Goldbach até 2n=4000: zero contraexemplos; múltiplos de 6 apresentam 1.94x mais decomposições que classes vizinhas. Para n=100: 6 pares.

## Métricas Observadas
```json
{
  "max_even_tested": 4000,
  "sampled_even_targets": 286,
  "zero_decomposition_counterexamples": 0,
  "anchor_even": 100,
  "anchor_pair_count": 6,
  "anchor_sample_pair": [
    3,
    97
  ],
  "lowest_non_trivial_even": 18,
  "lowest_pair_count": 2,
  "mod6_zero_vs_other_ratio": 1.9404
}
```

## Amostragem Adaptativa vs. Força Bruta (Seção 9)
```json
{
  "coarse_grid": "18x18",
  "target_effective_grid": "72x72",
  "brute_force_evaluations": 5184,
  "adaptive_evaluations": 956,
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
  "landscape_global_min_observed": 1.6094,
  "classical_best_found": 3.8067,
  "quantum_inspired_best_found": 2.1972,
  "classical_ms": 0.559,
  "quantum_inspired_ms": 2.154,
  "quantum_inspired_improved_valley": true,
  "honest_caveat": "Executa em CPU clássica simulando tunelamento de barreiras estreitas; NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** Ângulos conformes locais; Conectividade topológica fora do polo de projeção
- **Descartadas:** Distâncias métricas euclidianas globais; Volume absoluto em alta dimensão

## Limitações Explícitas
- Goldbach Forte permanece em aberto (verificada computacionalmente por Oliveira e Silva até 4×10^18).
- Goldbach Fraca foi demonstrada por Harald Helfgott (2013).

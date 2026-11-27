# Resultados Experimentais — exp_a8f299e497da212f

- **Estratégia:** `adaptive` | **Seed:** `47`
- **Duração:** `4653.69 ms` | **RAM Processo/Host:** `273.9 MB`
- **Resumo:** Transição de fase 3-SAT (n=24 variáveis): pico de custo computacional observado em α=5.071 (próximo ao limiar crítico ~4.26), separando regimes fáceis sub-restritos de super-restritos.

## Métricas Observadas
```json
{
  "num_vars": 24,
  "peak_difficulty_alpha": 5.071,
  "theoretical_3sat_threshold": 4.26,
  "max_mean_flips": 320.0,
  "sat_at_alpha_2": 1.0,
  "sat_at_alpha_6": 0.0
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
  "landscape_global_min_observed": 0.0,
  "classical_best_found": 0.0,
  "quantum_inspired_best_found": 0.0,
  "classical_ms": 0.559,
  "quantum_inspired_ms": 2.122,
  "quantum_inspired_improved_valley": true,
  "honest_caveat": "Executa em CPU clássica simulando tunelamento de barreiras estreitas; NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** Ângulos conformes locais; Conectividade topológica fora do polo de projeção
- **Descartadas:** Distâncias métricas euclidianas globais; Volume absoluto em alta dimensão

## Limitações Explícitas
- Benchmarks finitos em instâncias 3-SAT aleatórias NÃO demonstram separação assintótica entre P e NP.
- Heurísticas estocásticas (WalkSAT) são incompletas e não garantem certificação de insatisfatibilidade.

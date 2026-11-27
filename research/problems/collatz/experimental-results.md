# Resultados Experimentais — exp_9877fa98e341b0ff

- **Estratégia:** `adaptive` | **Seed:** `42`
- **Duração:** `22.28 ms` | **RAM Processo/Host:** `264.8 MB`
- **Resumo:** Semente âncora n=27: 111 passos até 1, pico=9232. Coorte de 184 inteiros convergiu para 1; razão média passos/ln(n)=9.685.

## Métricas Observadas
```json
{
  "anchor_start_n": 27,
  "anchor_steps": 111,
  "anchor_max_value": 9232,
  "anchor_reached_one": true,
  "tested_count": 184,
  "mean_steps_per_log_n": 9.6854,
  "max_steps_in_cohort": 293,
  "reverse_tree_edges": 8,
  "cycles_other_than_4_2_1_found": 0
}
```

## Amostragem Adaptativa vs. Força Bruta (Seção 9)
```json
{
  "coarse_grid": "18x18",
  "target_effective_grid": "72x72",
  "brute_force_evaluations": 5184,
  "adaptive_evaluations": 949,
  "hotspot_area_fraction": 0.121,
  "compute_saved_percent": 81.7,
  "note": "Amostragem adaptativa concentra resolução apenas onde gradiente/anomalia visual supera percentil 88."
}
```

## Benchmark Quântico-Inspirado vs. Clássico (Agente 09)
```json
{
  "method": "Simulated Quantum Annealing (4 réplicas de Trotter com campo transverso Γ decrescente)",
  "classical_baseline": "Metropolis-Hastings clássico em hardware convencional",
  "landscape_global_min_observed": 1.1389,
  "classical_best_found": 1.8017,
  "quantum_inspired_best_found": 1.1389,
  "classical_ms": 0.573,
  "quantum_inspired_ms": 2.31,
  "quantum_inspired_improved_valley": true,
  "honest_caveat": "Executa em CPU clássica simulando tunelamento de barreiras estreitas; NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** Coordenadas locais da malha experimental; Gradientes verticais de amplitude/erro
- **Descartadas:** Dimensões paramétricas além de 3 graus de liberdade simultâneos

## Limitações Explícitas
- Verificação computacional finita não demonstra a Conjectura de Collatz para todo n em N.
- Órbitas longas podem exigir precisão arbitrária caso atinjam valores astronômicos.

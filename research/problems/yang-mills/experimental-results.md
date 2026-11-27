# Resultados Experimentais — exp_1632be19b1c10808

- **Estratégia:** `adaptive` | **Seed:** `49`
- **Duração:** `5.11 ms` | **RAM Processo/Host:** `274.5 MB`
- **Resumo:** Rede de calibre 13×13 (β=2.2): plaqueta média=0.3799; decaimento de área de Wilson W(2,2)=-0.0665; estimador discreto de gap=0.6775.

## Métricas Observadas
```json
{
  "lattice": "13x13 U(1) proxy",
  "coupling_beta": 2.2,
  "final_mean_plaquette": 0.37992,
  "wilson_loop_2x2": -0.06653,
  "effective_mass_gap_proxy": 0.6775
}
```

## Amostragem Adaptativa vs. Força Bruta (Seção 9)
```json
{
  "coarse_grid": "18x18",
  "target_effective_grid": "72x72",
  "brute_force_evaluations": 5184,
  "adaptive_evaluations": 968,
  "hotspot_area_fraction": 0.124,
  "compute_saved_percent": 81.3,
  "note": "Amostragem adaptativa concentra resolução apenas onde gradiente/anomalia visual supera percentil 88."
}
```

## Benchmark Quântico-Inspirado vs. Clássico (Agente 09)
```json
{
  "method": "Simulated Quantum Annealing (4 réplicas de Trotter com campo transverso Γ decrescente)",
  "classical_baseline": "Metropolis-Hastings clássico em hardware convencional",
  "landscape_global_min_observed": -0.9993,
  "classical_best_found": -0.9974,
  "quantum_inspired_best_found": -0.9993,
  "classical_ms": 0.565,
  "quantum_inspired_ms": 2.301,
  "quantum_inspired_improved_valley": true,
  "honest_caveat": "Executa em CPU clássica simulando tunelamento de barreiras estreitas; NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** Ângulos conformes locais; Conectividade topológica fora do polo de projeção
- **Descartadas:** Distâncias métricas euclidianas globais; Volume absoluto em alta dimensão

## Limitações Explícitas
- Modelo de rede discreta U(1) 2D é aproximação exploratória pedagógica/computacional — NÃO equivale à teoria quântica de campos contínua SU(N) em 4D.
- O limite do contínuo (espaçamento a -> 0) exige renormalização não-perturbativa rigorosa.

# Resultados Experimentais — exp_457d3f44b1c10828

- **Estratégia:** `adaptive` | **Seed:** `44`
- **Duração:** `1.68 ms` | **RAM Processo/Host:** `272.8 MB`
- **Resumo:** 8 tijolos de Euler válidos gerados com aritmética exata; nenhum cuboide perfeito encontrado (menor erro relativo da diagonal espacial=1.185e-06 em [11753, 10296, 16800]).

## Métricas Observadas
```json
{
  "euler_bricks_verified": 8,
  "perfect_cuboids_found": 0,
  "best_brick_edges": [
    11753,
    10296,
    16800
  ],
  "best_relative_error": 1.1854539668894538e-06,
  "classic_minimal_brick": [
    44,
    117,
    240
  ]
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
  "landscape_global_min_observed": 0.0,
  "classical_best_found": 3.0445,
  "quantum_inspired_best_found": 2.7726,
  "classical_ms": 0.551,
  "quantum_inspired_ms": 2.351,
  "quantum_inspired_improved_valley": true,
  "honest_caveat": "Executa em CPU clássica simulando tunelamento de barreiras estreitas; NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** Coordenadas locais da malha experimental; Gradientes verticais de amplitude/erro
- **Descartadas:** Dimensões paramétricas além de 3 graus de liberdade simultâneos

## Limitações Explícitas
- A existência de um cuboide perfeito permanece problema em aberto na teoria dos números diofantina.
- Buscas exaustivas na literatura já descartaram todas as caixas com menor aresta ou diagonal até bilhões.

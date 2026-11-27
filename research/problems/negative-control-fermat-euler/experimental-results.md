# Resultados Experimentais — exp_90617a8b2019db81

- **Estratégia:** `adaptive` | **Seed:** `50`
- **Duração:** `2.75 ms` | **RAM Processo/Host:** `274.7 MB`
- **Resumo:** Controles científicos verificados: Fermat F₅ = 641 × 6700417 (refutado exato=True); Lander-Parkin-Selfridge 27⁵+84⁵+110⁵+133⁵ = 144⁵ = 61917364224 (refutado exato=True); Fluxo de curvatura suavizou variância de 0.0711 para 0.0402.

## Métricas Observadas
```json
{
  "fermat_F5": 4294967297,
  "fermat_F5_factors": [
    641,
    6700417
  ],
  "fermat_F5_refuted": true,
  "euler_5th_power_lhs": 61917364224,
  "euler_5th_power_rhs": 61917364224,
  "euler_5th_power_refuted": true,
  "poincare_ricci_variance_initial": 0.071064,
  "poincare_ricci_variance_final": 0.040176
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
  "landscape_global_min_observed": 0.0003,
  "classical_best_found": 0.0064,
  "quantum_inspired_best_found": 0.0003,
  "classical_ms": 0.556,
  "quantum_inspired_ms": 2.181,
  "quantum_inspired_improved_valley": true,
  "honest_caveat": "Executa em CPU clássica simulando tunelamento de barreiras estreitas; NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** Coordenadas locais da malha experimental; Gradientes verticais de amplitude/erro
- **Descartadas:** Dimensões paramétricas além de 3 graus de liberdade simultâneos

## Limitações Explícitas
- Controles positivos/negativos calibram o detector de falhas e contraexemplos do laboratório GENESIS.

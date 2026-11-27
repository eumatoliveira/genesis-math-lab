# Resultados Experimentais — exp_14c7fce355a89816

- **Estratégia:** `adaptive` | **Seed:** `46`
- **Duração:** `366.54 ms` | **RAM Processo/Host:** `273.5 MB`
- **Resumo:** mpmath (25 dígitos) na faixa crítica σ=0.5: |ζ(0.5 + 14.134725i)| = 1.59e-24; 8 trocas de sinal de Hardy Z(t) localizadas em [10.0, 45.0].

## Métricas Observadas
```json
{
  "sigma": 0.5,
  "precision_digits": 25,
  "first_zero_modulus_at_14_1347": 1.5890286946225195e-24,
  "detected_sign_change_zeros_count": 8,
  "detected_zeros_approx": [
    14.2925,
    20.8962,
    24.8585,
    30.1415,
    32.783,
    37.4057,
    40.7075,
    43.3491
  ],
  "all_verified_zeros_on_critical_line": true
}
```

## Amostragem Adaptativa vs. Força Bruta (Seção 9)
```json
{
  "coarse_grid": "18x18",
  "target_effective_grid": "72x72",
  "brute_force_evaluations": 5184,
  "adaptive_evaluations": 946,
  "hotspot_area_fraction": 0.12,
  "compute_saved_percent": 81.8,
  "note": "Amostragem adaptativa concentra resolução apenas onde gradiente/anomalia visual supera percentil 88."
}
```

## Benchmark Quântico-Inspirado vs. Clássico (Agente 09)
```json
{
  "method": "Simulated Quantum Annealing (4 réplicas de Trotter com campo transverso Γ decrescente)",
  "classical_baseline": "Metropolis-Hastings clássico em hardware convencional",
  "landscape_global_min_observed": 0.2306,
  "classical_best_found": 0.2881,
  "quantum_inspired_best_found": 0.2309,
  "classical_ms": 0.561,
  "quantum_inspired_ms": 2.242,
  "quantum_inspired_improved_valley": true,
  "honest_caveat": "Executa em CPU clássica simulando tunelamento de barreiras estreitas; NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** Coordenadas locais da malha experimental; Gradientes verticais de amplitude/erro
- **Descartadas:** Dimensões paramétricas além de 3 graus de liberdade simultâneos

## Limitações Explícitas
- Localizar zeros finitos na linha crítica não demonstra que todos os infinitos zeros não triviais têm Re(s)=1/2.
- Hipótese de Riemann permanece Problema do Milênio em aberto.

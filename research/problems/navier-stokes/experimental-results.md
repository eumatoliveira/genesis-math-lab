# Resultados Experimentais — exp_ffed21a4dda3e7b2

- **Estratégia:** `adaptive` | **Seed:** `48`
- **Duração:** `35.53 ms` | **RAM Processo/Host:** `274.4 MB`
- **Resumo:** Fluido viscoso 2D (27×27, ν=0.0025, 35 passos): energia cinética decaiu de 0.2645 para 0.2507; vorticidade máxima=3.554; CFL=0.229.

## Métricas Observadas
```json
{
  "grid_size": "27x27",
  "viscosity": 0.0025,
  "steps": 35,
  "final_kinetic_energy": 0.250651,
  "peak_vorticity": 3.554,
  "cfl_number": 0.2293,
  "numerical_stability_ok": true,
  "classification": "Estável (sem artefato CFL)"
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
  "landscape_global_min_observed": -3.1179,
  "classical_best_found": -3.1179,
  "quantum_inspired_best_found": -3.1179,
  "classical_ms": 0.57,
  "quantum_inspired_ms": 2.239,
  "quantum_inspired_improved_valley": true,
  "honest_caveat": "Executa em CPU clássica simulando tunelamento de barreiras estreitas; NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** Coordenadas locais da malha experimental; Gradientes verticais de amplitude/erro
- **Descartadas:** Dimensões paramétricas além de 3 graus de liberdade simultâneos

## Limitações Explícitas
- Simulação discreta 2D em diferenças finitas não resolve o problema de existência e suavidade em 3D (R³).
- Instabilidades numéricas por passo dt elevado (CFL > 1) são artefatos de discretização, não blow-up matemático real.

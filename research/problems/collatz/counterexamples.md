# Contraexemplos e Auditoria Red Team — Conjectura de Collatz (Problema 3n + 1)

## Contraexemplos (Agente 10)
- **cex_214c0d2d42d4** (Aritmética exata=True): Afirmação `Passos de parada <= 3 * log2(n) para todo n` -> Falha `n=27 exige 111 passos (pico 9232), excedendo cota simplista 3*log2(27) ≈ 14.26` | Testemunha: `{"n": 27, "3_log2_n": 14.26}`
- **cex_777123d8894c** (Aritmética exata=True): Afirmação `Hipótese simbólica '-0.0587*x + 0.495*x/log(x + 1) + 0.5438*log(x) + 0.2891*sin(x/2) + 1.2699 + 1.3428*exp(-2*x/25)' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (19.382639) diverge >2.5x do treino (0.379194)` | Testemunha: `{"in_sample_mse": 0.379194, "out_of_sample_mse": 19.382639}`
- **cex_17911a5cd273** (Aritmética exata=True): Afirmação `Hipótese simbólica '0.1886*x - 0.851*x/log(x + 1) + 1.2307*log(x) + 0.2925*sin(x/2) + 3.2364 + 0.8921*exp(-2*x/25)' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (25.337688) diverge >2.5x do treino (0.353734)` | Testemunha: `{"in_sample_mse": 0.353734, "out_of_sample_mse": 25.337688}`
- **cex_6ac4a141644a** (Aritmética exata=True): Afirmação `Hipótese simbólica '(0.9104) * (-0.0587*x + 0.495*x/log(x + 1) + 0.5438*log(x) + 0.2891*sin(x/2) + 1.2699 + 1.3428*exp(-2*x/25))' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (14.107227) diverge >2.5x do treino (0.704862)` | Testemunha: `{"in_sample_mse": 0.704862, "out_of_sample_mse": 14.107227}`
- **cex_8f620328904f** (Aritmética exata=True): Afirmação `Hipótese simbólica '(1.0562) * (-0.0587*x + 0.495*x/log(x + 1) + 0.5438*log(x) + 0.2891*sin(x/2) + 1.2699 + 1.3428*exp(-2*x/25))' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (23.276803) diverge >2.5x do treino (0.496766)` | Testemunha: `{"in_sample_mse": 0.496766, "out_of_sample_mse": 23.276803}`
- **cex_71e3095ffca3** (Aritmética exata=True): Afirmação `Hipótese simbólica '(1.0014) * (-0.0587*x + 0.495*x/log(x + 1) + 0.5438*log(x) + 0.2891*sin(x/2) + 1.2699 + 1.3428*exp(-2*x/25))' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (19.473141) diverge >2.5x do treino (0.379112)` | Testemunha: `{"in_sample_mse": 0.379112, "out_of_sample_mse": 19.473141}`

## Revisão Red Team (Agente 13)
```json
{
  "auditor": "agent_13",
  "total_reviewed": 5,
  "approved_for_testing": 0,
  "rejected": 5,
  "rejection_reasons": [
    "hyp_75e4e85b2d1d4c: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).",
    "hyp_572716680efcf8: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).",
    "hyp_a05e468cf2fadf: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).",
    "hyp_f8eb5737e6802a: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).",
    "hyp_5f708dae6bc09b: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10)."
  ],
  "counterexamples_confirmed": 6,
  "circularity_check": "Passed — agentes geradores (07/08) segregados dos auditores (10/11/13)."
}
```

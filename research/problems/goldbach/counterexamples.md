# Contraexemplos e Auditoria Red Team — Conjectura Forte de Goldbach

## Contraexemplos (Agente 10)
- **cex_0f96ffab6058** (Aritmética exata=True): Afirmação `Hipótese simbólica '1.088*x/log(x + 1) + 1.3624*log(x) + 0.0503*sin(x/2) - 0.1745 - 1.1834*exp(-2*x/25)' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (644.144597) diverge >2.5x do treino (209.211023)` | Testemunha: `{"in_sample_mse": 209.211023, "out_of_sample_mse": 644.144597}`
- **cex_ebee22f34a7a** (Aritmética exata=True): Afirmação `Hipótese simbólica '0.0421*x + 1.1264*x/log(x + 1) + 0.7165*log(x) + 0.0532*sin(x/2) + 2.016 - 3.4448*exp(-2*x/25)' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (560.045001) diverge >2.5x do treino (184.426884)` | Testemunha: `{"in_sample_mse": 184.426884, "out_of_sample_mse": 560.045001}`
- **cex_e8a19c1c81c2** (Aritmética exata=True): Afirmação `Hipótese simbólica '(0.955) * (0.0421*x + 1.1264*x/log(x + 1) + 0.7165*log(x) + 0.0532*sin(x/2) + 2.016 - 3.4448*exp(-2*x/25))' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (560.700668) diverge >2.5x do treino (187.092275)` | Testemunha: `{"in_sample_mse": 187.092275, "out_of_sample_mse": 560.700668}`
- **cex_501c00a7d780** (Aritmética exata=True): Afirmação `Hipótese simbólica '(0.9753) * (0.0421*x + 1.1264*x/log(x + 1) + 0.7165*log(x) + 0.0532*sin(x/2) + 2.016 - 3.4448*exp(-2*x/25))' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (558.19958) diverge >2.5x do treino (185.231745)` | Testemunha: `{"in_sample_mse": 185.231745, "out_of_sample_mse": 558.19958}`
- **cex_1e58126107b8** (Aritmética exata=True): Afirmação `Hipótese simbólica '(0.9942) * (0.0421*x + 1.1264*x/log(x + 1) + 0.7165*log(x) + 0.0532*sin(x/2) + 2.016 - 3.4448*exp(-2*x/25))' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (559.127771) diverge >2.5x do treino (184.4726)` | Testemunha: `{"in_sample_mse": 184.4726, "out_of_sample_mse": 559.127771}`

## Revisão Red Team (Agente 13)
```json
{
  "auditor": "agent_13",
  "total_reviewed": 5,
  "approved_for_testing": 0,
  "rejected": 5,
  "rejection_reasons": [
    "hyp_8055c56e881ede: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).",
    "hyp_fb96319ab79888: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).",
    "hyp_0da97a84fdd2e5: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).",
    "hyp_49aca1d3cf001e: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).",
    "hyp_8e21ade86fc1be: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10)."
  ],
  "counterexamples_confirmed": 5,
  "circularity_check": "Passed — agentes geradores (07/08) segregados dos auditores (10/11/13)."
}
```

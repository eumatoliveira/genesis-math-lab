# Contraexemplos e Auditoria Red Team — Hipótese de Riemann (Problema do Milênio)

## Contraexemplos (Agente 10)
- **cex_b420071f59a8** (Aritmética exata=True): Afirmação `Hipótese simbólica '(0.8747) * (0.1525*x + 2.5837*x/log(x + 1) - 0.3608*log(x) + 2.9362 + 3.4077*exp(-2*x/25))' generaliza fora da amostra` -> Falha `Erro fora-da-amostra (27.3283) diverge >2.5x do treino (8.578022)` | Testemunha: `{"in_sample_mse": 8.578022, "out_of_sample_mse": 27.3283}`

## Revisão Red Team (Agente 13)
```json
{
  "auditor": "agent_13",
  "total_reviewed": 5,
  "approved_for_testing": 4,
  "rejected": 1,
  "rejection_reasons": [
    "hyp_c55511c709aa79: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10)."
  ],
  "counterexamples_confirmed": 1,
  "circularity_check": "Passed — agentes geradores (07/08) segregados dos auditores (10/11/13)."
}
```

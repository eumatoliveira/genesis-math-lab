# Contraexemplos e Auditoria Red Team — Problema do Cuboide Perfeito

## Contraexemplos (Agente 10)
- **cex_euler_brick_44_117_240** (Aritmética exata=True): Afirmação `Todo tijolo de Euler primitivo é cuboide perfeito` -> Falha `Diagonal espacial^2 = 73225 não é quadrado perfeito (resíduo=216)` | Testemunha: `{"edges": [44, 117, 240], "space_diag_sq": 73225}`

## Revisão Red Team (Agente 13)
```json
{
  "auditor": "agent_13",
  "total_reviewed": 5,
  "approved_for_testing": 4,
  "rejected": 1,
  "rejection_reasons": [
    "hyp_6de18831e91036: Refutada por contraexemplo exato do Counterexample Hunter (Agente 10)."
  ],
  "counterexamples_confirmed": 1,
  "circularity_check": "Passed — agentes geradores (07/08) segregados dos auditores (10/11/13)."
}
```

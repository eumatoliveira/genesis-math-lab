# Contraexemplos e Auditoria Red Team — Controles Negativos & Positivos (Fermat F₅ / Soma de Potências de Euler / Ricci)

## Contraexemplos (Agente 10)
- **cex_fermat_F5** (Aritmética exata=True): Afirmação `F_n = 2^(2^n) + 1 é primo para todo n >= 0` -> Falha `F_5 = 4294967297 = 641 × 6700417 (composto, refutado por Euler 1732)` | Testemunha: `{"n": 5, "F5": 4294967297}`
- **cex_euler_k5** (Aritmética exata=True): Afirmação `São necessárias ao menos 5 quintas potências para somar uma quinta potência` -> Falha `27^5 + 84^5 + 110^5 + 133^5 = 144^5 = 61917364224 (Lander-Parkin-Selfridge 1966)` | Testemunha: `{"a": 27, "b": 84, "c": 110, "d": 133, "e": 144}`

## Revisão Red Team (Agente 13)
```json
{
  "auditor": "agent_13",
  "total_reviewed": 5,
  "approved_for_testing": 5,
  "rejected": 0,
  "rejection_reasons": [],
  "counterexamples_confirmed": 2,
  "circularity_check": "Passed — agentes geradores (07/08) segregados dos auditores (10/11/13)."
}
```

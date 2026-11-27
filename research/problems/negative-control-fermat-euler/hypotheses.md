# Hipóteses Simbólicas e Evolutivas — Controles Negativos & Positivos (Fermat F₅ / Soma de Potências de Euler / Ricci)

### `hyp_9ef9d4579068d4` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.0209*x/log(x + 1)`
- **Descrição:** Modelo esparso (1 termos, λ=1.0) para 'ricci_curvature_variance_decay' avaliado em split fora-da-amostra (14 treino / 6 teste).
- **MSE Treino / Fora-da-Amostra:** `0.001177` / `0.006893` | **Complexidade:** `1.002`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_851cccbaad2be7` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.0235*x/log(x + 1) + 0.0221 + 0.0219*exp(-2*x/25)`
- **Descrição:** Modelo esparso (3 termos, λ=0.05) para 'ricci_curvature_variance_decay' avaliado em split fora-da-amostra (14 treino / 6 teste).
- **MSE Treino / Fora-da-Amostra:** `0.004258` / `0.015869` | **Complexidade:** `3.007`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_fc160b8137be47` (Geração 1 | agent_08)
- **Expressão SymPy:** `(0.8412) * (0.0209*x/log(x + 1))`
- **Descrição:** Descendente de hyp_9ef9d4579068d4 (geração 1) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.000761` / `0.003986` | **Complexidade:** `1.202`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_28575e4ceff800` (Geração 2 | agent_08)
- **Expressão SymPy:** `(0.9546) * (0.0209*x/log(x + 1))`
- **Descrição:** Descendente de hyp_9ef9d4579068d4 (geração 2) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.001029` / `0.005982` | **Complexidade:** `1.202`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_7e0d71229baf88` (Geração 3 | agent_08)
- **Expressão SymPy:** `(0.9699) * (0.0209*x/log(x + 1))`
- **Descrição:** Descendente de hyp_9ef9d4579068d4 (geração 3) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.001076` / `0.00628` | **Complexidade:** `1.202`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

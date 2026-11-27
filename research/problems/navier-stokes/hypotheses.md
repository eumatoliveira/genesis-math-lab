# Hipóteses Simbólicas e Evolutivas — Existência e Suavidade de Navier–Stokes (Problema do Milênio)

### `hyp_4237dc7adc4dd8` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.078*x/log(x + 1) + 0.0692 + 0.0677*exp(-2*x/25)`
- **Descrição:** Modelo esparso (3 termos, λ=1.0) para 'kinetic_energy' avaliado em split fora-da-amostra (24 treino / 11 teste).
- **MSE Treino / Fora-da-Amostra:** `0.058917` / `0.258069` | **Complexidade:** `3.021`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_6d8e74fc72dbac` (Geração 0 | agent_07)
- **Expressão SymPy:** `-0.0163*x + 0.0794*x/log(x + 1) - 0.014*log(x) + 0.0825 + 0.0891*exp(-2*x/25)`
- **Descrição:** Modelo esparso (5 termos, λ=0.05) para 'kinetic_energy' avaliado em split fora-da-amostra (24 treino / 11 teste).
- **MSE Treino / Fora-da-Amostra:** `1e-06` / `1.7e-05` | **Complexidade:** `5.028`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_8714a09eea67d8` (Geração 1 | agent_08)
- **Expressão SymPy:** `(1.1338) * (-0.0163*x + 0.0794*x/log(x + 1) - 0.014*log(x) + 0.0825 + 0.0891*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_6d8e74fc72dbac (geração 1) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.001215` / `0.000883` | **Complexidade:** `5.228`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_fa604fe8c974b2` (Geração 2 | agent_08)
- **Expressão SymPy:** `(0.9964) * (-0.0163*x + 0.0794*x/log(x + 1) - 0.014*log(x) + 0.0825 + 0.0891*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_6d8e74fc72dbac (geração 2) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-0.5167).
- **MSE Treino / Fora-da-Amostra:** `2e-06` / `2.4e-05` | **Complexidade:** `5.228`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_3035b5d6323439` (Geração 3 | agent_08)
- **Expressão SymPy:** `(0.9805) * (-0.0163*x + 0.0794*x/log(x + 1) - 0.014*log(x) + 0.0825 + 0.0891*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_6d8e74fc72dbac (geração 3) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `2.2e-05` / `7.4e-05` | **Complexidade:** `5.228`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

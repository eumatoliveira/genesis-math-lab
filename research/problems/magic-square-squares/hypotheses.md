# Hipóteses Simbólicas e Evolutivas — Quadrado Mágico de Quadrados 3×3

### `hyp_319ab76bbfc084` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.1222*log(x) + 0.1293 + 0.1786*exp(-2*x/25)`
- **Descrição:** Modelo esparso (3 termos, λ=1.0) para 'normalized_line_std' avaliado em split fora-da-amostra (90 treino / 38 teste).
- **MSE Treino / Fora-da-Amostra:** `0.047254` / `0.099908` | **Complexidade:** `3.043`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_9138c30263f07b` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.0354*x - 0.2102*x/log(x + 1) + 0.3118*log(x) - 0.0232*sin(x/2) + 0.0794 + 0.3693*exp(-2*x/25)`
- **Descrição:** Modelo esparso (6 termos, λ=0.05) para 'normalized_line_std' avaliado em split fora-da-amostra (90 treino / 38 teste).
- **MSE Treino / Fora-da-Amostra:** `0.015372` / `0.031803` | **Complexidade:** `6.103`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_3f0ffa1cfd4409` (Geração 1 | agent_08)
- **Expressão SymPy:** `(0.9588) * (0.1222*log(x) + 0.1293 + 0.1786*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_319ab76bbfc084 (geração 1) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.039483` / `0.084325` | **Complexidade:** `3.243`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_ad8a0c2d246789` (Geração 2 | agent_08)
- **Expressão SymPy:** `(0.998) * (0.1222*log(x) + 0.1293 + 0.1786*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_319ab76bbfc084 (geração 2) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.046854` / `0.099121` | **Complexidade:** `3.243`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_2fb47ca306a289` (Geração 3 | agent_08)
- **Expressão SymPy:** `(0.99) * (0.1222*log(x) + 0.1293 + 0.1786*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_319ab76bbfc084 (geração 3) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.045262` / `0.095977` | **Complexidade:** `3.243`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

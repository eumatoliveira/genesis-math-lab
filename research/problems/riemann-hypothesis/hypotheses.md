# Hipóteses Simbólicas e Evolutivas — Hipótese de Riemann (Problema do Milênio)

### `hyp_12038c76b3a738` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.0899*x + 2.6917*x/log(x + 1) + 0.0761*log(x) + 0.0936*sin(x/2) + 2.4823 + 2.5791*exp(-2*x/25)`
- **Descrição:** Modelo esparso (6 termos, λ=1.0) para 't_values' avaliado em split fora-da-amostra (38 treino / 16 teste).
- **MSE Treino / Fora-da-Amostra:** `0.083213` / `0.438296` | **Complexidade:** `6.801`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_266bed9a90dfa8` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.1525*x + 2.5837*x/log(x + 1) - 0.3608*log(x) + 2.9362 + 3.4077*exp(-2*x/25)`
- **Descrição:** Modelo esparso (5 termos, λ=0.05) para 't_values' avaliado em split fora-da-amostra (38 treino / 16 teste).
- **MSE Treino / Fora-da-Amostra:** `0.000612` / `0.05768` | **Complexidade:** `5.944`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_c55511c709aa79` (Geração 1 | agent_08)
- **Expressão SymPy:** `(0.8747) * (0.1525*x + 2.5837*x/log(x + 1) - 0.3608*log(x) + 2.9362 + 3.4077*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_266bed9a90dfa8 (geração 1) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=0.7420).
- **MSE Treino / Fora-da-Amostra:** `8.578022` / `27.3283` | **Complexidade:** `6.144`
- **Status:** `Hipótese` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_8f5ccfb60c60c0` (Geração 2 | agent_08)
- **Expressão SymPy:** `(1.0271) * (0.1525*x + 2.5837*x/log(x + 1) - 0.3608*log(x) + 2.9362 + 3.4077*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_266bed9a90dfa8 (geração 2) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=0.9930).
- **MSE Treino / Fora-da-Amostra:** `0.398892` / `0.743925` | **Complexidade:** `6.144`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_e8c628ef037672` (Geração 3 | agent_08)
- **Expressão SymPy:** `(1.0019) * (0.1525*x + 2.5837*x/log(x + 1) - 0.3608*log(x) + 2.9362 + 3.4077*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_266bed9a90dfa8 (geração 3) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=0.9997).
- **MSE Treino / Fora-da-Amostra:** `0.002475` / `0.029563` | **Complexidade:** `6.144`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

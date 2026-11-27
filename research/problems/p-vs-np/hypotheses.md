# Hipóteses Simbólicas e Evolutivas — P versus NP (Problema do Milênio)

### `hyp_4b957231f5da8f` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.2907*x + 0.3643*x/log(x + 1) + 0.1023*sin(x/2) + 0.2418 + 0.2208*exp(-2*x/25)`
- **Descrição:** Modelo esparso (5 termos, λ=1.0) para 'alpha_ratios' avaliado em split fora-da-amostra (10 treino / 5 teste).
- **MSE Treino / Fora-da-Amostra:** `0.006066` / `0.02253` | **Complexidade:** `5.122`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_76a537020d9d38` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.2682*x + 0.4245*x/log(x + 1) - 0.0752*log(x) + 0.0187*sin(x/2) + 0.3172 + 0.3016*exp(-2*x/25)`
- **Descrição:** Modelo esparso (6 termos, λ=0.05) para 'alpha_ratios' avaliado em split fora-da-amostra (10 treino / 5 teste).
- **MSE Treino / Fora-da-Amostra:** `4.3e-05` / `0.000804` | **Complexidade:** `6.141`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_129331a8fbd303` (Geração 1 | agent_08)
- **Expressão SymPy:** `(1.0151) * (0.2907*x + 0.3643*x/log(x + 1) + 0.1023*sin(x/2) + 0.2418 + 0.2208*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_4b957231f5da8f (geração 1) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=0.9773).
- **MSE Treino / Fora-da-Amostra:** `0.003711` / `0.054145` | **Complexidade:** `5.322`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_2aaa8c107876aa` (Geração 2 | agent_08)
- **Expressão SymPy:** `(0.9676) * (0.2907*x + 0.3643*x/log(x + 1) + 0.1023*sin(x/2) + 0.2418 + 0.2208*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_4b957231f5da8f (geração 2) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=0.9962).
- **MSE Treino / Fora-da-Amostra:** `0.027095` / `0.008938` | **Complexidade:** `5.322`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_faceb647400d71` (Geração 3 | agent_08)
- **Expressão SymPy:** `(1.0623) * (0.2907*x + 0.3643*x/log(x + 1) + 0.1023*sin(x/2) + 0.2418 + 0.2208*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_4b957231f5da8f (geração 3) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=0.8922).
- **MSE Treino / Fora-da-Amostra:** `0.026883` / `0.25666` | **Complexidade:** `5.322`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

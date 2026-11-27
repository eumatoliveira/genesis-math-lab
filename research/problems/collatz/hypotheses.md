# Hipóteses Simbólicas e Evolutivas — Conjectura de Collatz (Problema 3n + 1)

### `hyp_75e4e85b2d1d4c` (Geração 0 | agent_07)
- **Expressão SymPy:** `-0.0587*x + 0.495*x/log(x + 1) + 0.5438*log(x) + 0.2891*sin(x/2) + 1.2699 + 1.3428*exp(-2*x/25)`
- **Descrição:** Modelo esparso (6 termos, λ=1.0) para 'orbit_sequence' avaliado em split fora-da-amostra (78 treino / 34 teste).
- **MSE Treino / Fora-da-Amostra:** `0.379194` / `19.382639` | **Complexidade:** `6.4`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_572716680efcf8` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.1886*x - 0.851*x/log(x + 1) + 1.2307*log(x) + 0.2925*sin(x/2) + 3.2364 + 0.8921*exp(-2*x/25)`
- **Descrição:** Modelo esparso (6 termos, λ=0.05) para 'orbit_sequence' avaliado em split fora-da-amostra (78 treino / 34 teste).
- **MSE Treino / Fora-da-Amostra:** `0.353734` / `25.337688` | **Complexidade:** `6.669`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_a05e468cf2fadf` (Geração 1 | agent_08)
- **Expressão SymPy:** `(0.9104) * (-0.0587*x + 0.495*x/log(x + 1) + 0.5438*log(x) + 0.2891*sin(x/2) + 1.2699 + 1.3428*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_75e4e85b2d1d4c (geração 1) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.704862` / `14.107227` | **Complexidade:** `6.6`
- **Status:** `Hipótese` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_f8eb5737e6802a` (Geração 2 | agent_08)
- **Expressão SymPy:** `(1.0562) * (-0.0587*x + 0.495*x/log(x + 1) + 0.5438*log(x) + 0.2891*sin(x/2) + 1.2699 + 1.3428*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_75e4e85b2d1d4c (geração 2) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.496766` / `23.276803` | **Complexidade:** `6.6`
- **Status:** `Hipótese` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_5f708dae6bc09b` (Geração 3 | agent_08)
- **Expressão SymPy:** `(1.0014) * (-0.0587*x + 0.495*x/log(x + 1) + 0.5438*log(x) + 0.2891*sin(x/2) + 1.2699 + 1.3428*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_75e4e85b2d1d4c (geração 3) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-1.0000).
- **MSE Treino / Fora-da-Amostra:** `0.379112` / `19.473141` | **Complexidade:** `6.6`
- **Status:** `Hipótese` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

# Hipóteses Simbólicas e Evolutivas — Conjectura Forte de Goldbach

### `hyp_8055c56e881ede` (Geração 0 | agent_07)
- **Expressão SymPy:** `1.088*x/log(x + 1) + 1.3624*log(x) + 0.0503*sin(x/2) - 0.1745 - 1.1834*exp(-2*x/25)`
- **Descrição:** Modelo esparso (5 termos, λ=1.0) para 'goldbach_comet_counts' avaliado em split fora-da-amostra (200 treino / 86 teste).
- **MSE Treino / Fora-da-Amostra:** `209.211023` / `644.144597` | **Complexidade:** `5.386`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_fb96319ab79888` (Geração 0 | agent_07)
- **Expressão SymPy:** `0.0421*x + 1.1264*x/log(x + 1) + 0.7165*log(x) + 0.0532*sin(x/2) + 2.016 - 3.4448*exp(-2*x/25)`
- **Descrição:** Modelo esparso (6 termos, λ=0.05) para 'goldbach_comet_counts' avaliado em split fora-da-amostra (200 treino / 86 teste).
- **MSE Treino / Fora-da-Amostra:** `184.426884` / `560.045001` | **Complexidade:** `6.74`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_0da97a84fdd2e5` (Geração 1 | agent_08)
- **Expressão SymPy:** `(0.955) * (0.0421*x + 1.1264*x/log(x + 1) + 0.7165*log(x) + 0.0532*sin(x/2) + 2.016 - 3.4448*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_fb96319ab79888 (geração 1) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=0.1625).
- **MSE Treino / Fora-da-Amostra:** `187.092275` / `560.700668` | **Complexidade:** `6.94`
- **Status:** `Hipótese` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_49aca1d3cf001e` (Geração 2 | agent_08)
- **Expressão SymPy:** `(0.9753) * (0.0421*x + 1.1264*x/log(x + 1) + 0.7165*log(x) + 0.0532*sin(x/2) + 2.016 - 3.4448*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_fb96319ab79888 (geração 2) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=0.1662).
- **MSE Treino / Fora-da-Amostra:** `185.231745` / `558.19958` | **Complexidade:** `6.94`
- **Status:** `Hipótese` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_8e21ade86fc1be` (Geração 3 | agent_08)
- **Expressão SymPy:** `(0.9942) * (0.0421*x + 1.1264*x/log(x + 1) + 0.7165*log(x) + 0.0532*sin(x/2) + 2.016 - 3.4448*exp(-2*x/25))`
- **Descrição:** Descendente de hyp_fb96319ab79888 (geração 3) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=0.1648).
- **MSE Treino / Fora-da-Amostra:** `184.4726` / `559.127771` | **Complexidade:** `6.94`
- **Status:** `Hipótese` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

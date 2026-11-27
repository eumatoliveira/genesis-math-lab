# Hipóteses Simbólicas e Evolutivas — Problema do Cuboide Perfeito

### `hyp_6de18831e91036` (Geração 0 | agent_07)
- **Expressão SymPy:** `-0.0007*sin(x/2)`
- **Descrição:** Modelo esparso (1 termos, λ=1.0) para 'relative_space_residuals' avaliado em split fora-da-amostra (7 treino / 3 teste).
- **MSE Treino / Fora-da-Amostra:** `1e-06` / `5e-06` | **Complexidade:** `1.0`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `rejected` (Refutada por contraexemplo exato do Counterexample Hunter (Agente 10).)

### `hyp_e7430b8f254e8f` (Geração 0 | agent_07)
- **Expressão SymPy:** `-0.0016*sin(x/2)`
- **Descrição:** Modelo esparso (1 termos, λ=0.05) para 'relative_space_residuals' avaliado em split fora-da-amostra (7 treino / 3 teste).
- **MSE Treino / Fora-da-Amostra:** `2e-06` / `2e-06` | **Complexidade:** `1.0`
- **Status:** `Padrão Empírico` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_017e419c5d9cce` (Geração 1 | agent_08)
- **Expressão SymPy:** `(0.8861) * (-0.0016*sin(x/2))`
- **Descrição:** Descendente de hyp_e7430b8f254e8f (geração 1) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-0.3972).
- **MSE Treino / Fora-da-Amostra:** `2e-06` / `3e-06` | **Complexidade:** `1.2`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_a433c27d5a440e` (Geração 2 | agent_08)
- **Expressão SymPy:** `(1.0077) * (-0.0016*sin(x/2))`
- **Descrição:** Descendente de hyp_e7430b8f254e8f (geração 2) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-0.1260).
- **MSE Treino / Fora-da-Amostra:** `2e-06` / `2e-06` | **Complexidade:** `1.2`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

### `hyp_8880a194eb35e2` (Geração 3 | agent_08)
- **Expressão SymPy:** `(0.9438) * (-0.0016*sin(x/2))`
- **Descrição:** Descendente de hyp_e7430b8f254e8f (geração 3) preservando critério imutável de erro fora-da-amostra normalizado (R² relativo=-0.2648).
- **MSE Treino / Fora-da-Amostra:** `2e-06` / `3e-06` | **Complexidade:** `1.2`
- **Status:** `Hipótese` | **Veredito Red Team:** `approved_for_testing` (Aprovada apenas como hipótese empírica testável (NÃO é prova matemática).)

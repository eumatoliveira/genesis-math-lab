# Verificação Formal — Conjectura Forte de Goldbach

- **Status Epistemológico Atribuído:** `Conjectura`
- **Lean 4 Instalado Localmente:** `False`
- **Z3 Instalado Localmente:** `False`
- **Contém `sorry`/`admit` falso?** `False`
- **Lema Auxiliar Finito (SymPy):** Identidade de Euler para poliedro convexo cubo (8 - 12 + 6 = 2) verificada via SymPy (`proved=True`)

> Um lema auxiliar finito demonstrado via SymPy NÃO resolve a conjectura aberta geral. Nenhuma afirmação é marcada como 'Demonstração Formalmente Verificada' sem compilação integral em Lean 4/Mathlib.

```lean
-- GENESIS Agent 11: Formal Statement Skeleton (Lean 4)
-- Status: OPEN CONJECTURE (Strong Goldbach — definition only)
def IsPrime (p : Nat) : Prop := p ≥ 2 ∧ ∀ d : Nat, d ∣ p → d = 1 ∨ d = p

def StrongGoldbachConjecture : Prop :=
  ∀ n : Nat, n ≥ 4 → n % 2 = 0 → ∃ p q : Nat, IsPrime p ∧ IsPrime q ∧ p + q = n

```

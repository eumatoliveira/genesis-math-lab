# Verificação Formal — Conjectura de Collatz (Problema 3n + 1)

- **Status Epistemológico Atribuído:** `Conjectura`
- **Lean 4 Instalado Localmente:** `False`
- **Z3 Instalado Localmente:** `False`
- **Contém `sorry`/`admit` falso?** `False`
- **Lema Auxiliar Finito (SymPy):** Para todo ímpar 2k+1: 3(2k+1)+1 = 6*k + 4 = 2*(3*k + 2) (sempre par -> divisão imediata por 2) (`proved=True`)

> Um lema auxiliar finito demonstrado via SymPy NÃO resolve a conjectura aberta geral. Nenhuma afirmação é marcada como 'Demonstração Formalmente Verificada' sem compilação integral em Lean 4/Mathlib.

```lean
-- GENESIS Agent 11: Formal Statement Skeleton (Lean 4 / Mathlib convention)
-- Status: OPEN CONJECTURE (formal statement only; zero placeholder proof tactics)
def collatzStep (n : Nat) : Nat :=
  if n % 2 = 0 then n / 2 else 3 * n + 1

def collatzIter : Nat -> Nat -> Nat
  | 0, n => n
  | k + 1, n => collatzIter k (collatzStep n)

def CollatzConjecture : Prop :=
  ∀ n : Nat, n ≥ 1 → ∃ k : Nat, collatzIter k n = 1

```

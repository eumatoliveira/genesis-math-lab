-- GENESIS Agent 11: Formal Statement Skeleton (Lean 4 / Mathlib convention)
-- Status: OPEN CONJECTURE (formal statement only; zero placeholder proof tactics)
def collatzStep (n : Nat) : Nat :=
  if n % 2 = 0 then n / 2 else 3 * n + 1

def collatzIter : Nat -> Nat -> Nat
  | 0, n => n
  | k + 1, n => collatzIter k (collatzStep n)

def CollatzConjecture : Prop :=
  ∀ n : Nat, n ≥ 1 → ∃ k : Nat, collatzIter k n = 1

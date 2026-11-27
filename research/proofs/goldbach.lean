-- GENESIS Agent 11: Formal Statement Skeleton (Lean 4)
-- Status: OPEN CONJECTURE (Strong Goldbach — definition only)
def IsPrime (p : Nat) : Prop := p ≥ 2 ∧ ∀ d : Nat, d ∣ p → d = 1 ∨ d = p

def StrongGoldbachConjecture : Prop :=
  ∀ n : Nat, n ≥ 4 → n % 2 = 0 → ∃ p q : Nat, IsPrime p ∧ IsPrime q ∧ p + q = n

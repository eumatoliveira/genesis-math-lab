-- GENESIS Agent 11: Formal Statement Skeleton (Lean 4)
-- Status: OPEN PROBLEM (Perfect Cuboid — definition only)
def IsSquare (m : Nat) : Prop := ∃ r : Nat, r * r = m

def PerfectCuboidExists : Prop :=
  ∃ a b c : Nat, a > 0 ∧ b > 0 ∧ c > 0 ∧
    IsSquare (a*a + b*b) ∧ IsSquare (a*a + c*c) ∧
    IsSquare (b*b + c*c) ∧ IsSquare (a*a + b*b + c*c)

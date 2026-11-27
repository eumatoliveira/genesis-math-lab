# Verificação Formal — Problema do Cuboide Perfeito

- **Status Epistemológico Atribuído:** `Conjectura`
- **Lean 4 Instalado Localmente:** `False`
- **Z3 Instalado Localmente:** `False`
- **Contém `sorry`/`admit` falso?** `False`
- **Lema Auxiliar Finito (SymPy):** Identidade algébrica de Saunderson verificada simbolicamente para 2 diagonais de face (a²+c² e b²+c²) (`proved=True`)

> Um lema auxiliar finito demonstrado via SymPy NÃO resolve a conjectura aberta geral. Nenhuma afirmação é marcada como 'Demonstração Formalmente Verificada' sem compilação integral em Lean 4/Mathlib.

```lean
-- GENESIS Agent 11: Formal Statement Skeleton (Lean 4)
-- Status: OPEN PROBLEM (Perfect Cuboid — definition only)
def IsSquare (m : Nat) : Prop := ∃ r : Nat, r * r = m

def PerfectCuboidExists : Prop :=
  ∃ a b c : Nat, a > 0 ∧ b > 0 ∧ c > 0 ∧
    IsSquare (a*a + b*b) ∧ IsSquare (a*a + c*c) ∧
    IsSquare (b*b + c*c) ∧ IsSquare (a*a + b*b + c*c)

```

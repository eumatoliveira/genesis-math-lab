-- GENESIS Agent 11: Verified Counterexample Arithmetic Witnesses (Lean 4)
-- Status: VERIFIED NEGATIVE CONTROLS (exact decidable counterexamples; zero sorry/admit)
theorem fermat_F5_composite : 2^32 + 1 = 641 * 6700417 := by decide

theorem euler_k5_counterexample : 27^5 + 84^5 + 110^5 + 133^5 = 144^5 := by decide

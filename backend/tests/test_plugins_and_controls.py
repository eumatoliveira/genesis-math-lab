"""Tests for mathematical plugins, arbitrary precision, and positive/negative controls."""

from __future__ import annotations

import math

from genesis.plugins.collatz import collatz_orbit
from genesis.plugins.controls import ControlsPlugin
from genesis.plugins.goldbach import goldbach_pairs, sieve_primes
from genesis.plugins.navier_stokes import NavierStokesPlugin, YangMillsPlugin
from genesis.plugins.p_vs_np import PvsNPPlugin
from genesis.plugins.perfect_cuboid import check_cuboid_exact
from genesis.plugins.riemann import RiemannPlugin


def test_collatz_exact_seed_27() -> None:
    orb = collatz_orbit(27)
    assert orb["steps"] == 111
    assert orb["max_value"] == 9232
    assert orb["final_value"] == 1
    assert orb["reached_one"] is True
    assert orb["sequence"][:6] == [27, 82, 41, 124, 62, 31]


def test_goldbach_sieve_and_pairs() -> None:
    primes = sieve_primes(500)
    pset = set(int(p) for p in primes)
    for even_n in range(4, 202, 2):
        pairs = goldbach_pairs(even_n, pset, primes)
        assert len(pairs) >= 1
        assert all(p + q == even_n for p, q in pairs)


def test_perfect_cuboid_euler_brick_exact() -> None:
    res = check_cuboid_exact(44, 117, 240)
    assert res["valid_euler_brick"] is True
    assert res["is_perfect_cuboid"] is False
    assert res["space_diag_sq"] == 44**2 + 117**2 + 240**2
    assert res["space_residual"] > 0


def test_riemann_mpmath_critical_zero() -> None:
    out = RiemannPlugin().run(seed=42, params={"sigma": 0.5, "t_min": 12.0, "t_max": 32.0}, resolution=16)
    assert out.metrics["first_zero_modulus_at_14_1347"] < 1e-18
    assert out.metrics["detected_sign_change_zeros_count"] >= 3


def test_navier_stokes_and_yang_mills_finite() -> None:
    ns_out = NavierStokesPlugin().run(seed=42, params={"steps": 25}, resolution=20)
    assert ns_out.metrics["numerical_stability_ok"] is True
    assert all(math.isfinite(e) for e in ns_out.raw_series["kinetic_energy"])
    assert ns_out.raw_series["kinetic_energy"][-1] <= ns_out.raw_series["kinetic_energy"][0]

    ym_out = YangMillsPlugin().run(seed=42, params={"sweeps": 16}, resolution=24)
    assert len(ym_out.raw_series["wilson_loop_r1_to_r4"]) == 4
    assert all(math.isfinite(x) for x in ym_out.raw_series["mean_plaquette_convergence"])


def test_p_vs_np_3sat_phase_transition() -> None:
    out = PvsNPPlugin().run(seed=42, params={"num_vars": 18}, resolution=16)
    assert out.metrics["sat_at_alpha_2"] >= out.metrics["sat_at_alpha_6"]


def test_negative_and_positive_controls() -> None:
    out = ControlsPlugin().run(seed=42, params={}, resolution=16)
    assert out.metrics["fermat_F5_refuted"] is True
    assert out.metrics["fermat_F5_factors"] == [641, 6700417]
    assert out.metrics["euler_5th_power_refuted"] is True
    assert out.metrics["poincare_ricci_variance_final"] < out.metrics["poincare_ricci_variance_initial"]

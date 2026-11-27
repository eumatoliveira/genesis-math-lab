"""Unified plugin registry exposing all real mathematical experiment plugins."""

from genesis.plugins.controls import (
    ControlsPlugin,
    GenericHarmonicExplorerPlugin,
    get_plugin,
    list_priority_plugin_ids,
)
from genesis.plugins.collatz import CollatzPlugin, build_reverse_collatz_tree, collatz_orbit
from genesis.plugins.goldbach import GoldbachPlugin, goldbach_pairs, sieve_primes
from genesis.plugins.magic_square import MagicSquarePlugin
from genesis.plugins.navier_stokes import NavierStokesPlugin, YangMillsPlugin
from genesis.plugins.p_vs_np import PvsNPPlugin
from genesis.plugins.perfect_cuboid import PerfectCuboidPlugin, check_cuboid_exact
from genesis.plugins.riemann import KNOWN_RIEMANN_ZEROS_T, RiemannPlugin

__all__ = [
    "CollatzPlugin",
    "GoldbachPlugin",
    "PerfectCuboidPlugin",
    "MagicSquarePlugin",
    "RiemannPlugin",
    "PvsNPPlugin",
    "NavierStokesPlugin",
    "YangMillsPlugin",
    "ControlsPlugin",
    "GenericHarmonicExplorerPlugin",
    "get_plugin",
    "list_priority_plugin_ids",
    "collatz_orbit",
    "build_reverse_collatz_tree",
    "sieve_primes",
    "goldbach_pairs",
    "check_cuboid_exact",
    "KNOWN_RIEMANN_ZEROS_T",
]

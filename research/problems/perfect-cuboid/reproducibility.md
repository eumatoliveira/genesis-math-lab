# Manifesto de Reprodutibilidade e Proveniência — exp_457d3f44b1c10828

- **SHA-256 Hash:** `e6ce1b0b19a3caeac2d970073a4aa5de33508302a4c767ad2e5a68731edf4741`
- **Git Commit:** `workspace-init`
- **Timestamp (UTC):** `2026-11-27T15:28:32.401416+00:00`
- **Seed Determinística:** `44`
- **Precisão Numérica:** Python arbitrary int + float64 (mpmath 25 dps quando aplicável)
- **Hardware Utilizado:** `Intel64 Family 6 Model 165 Stepping 3, GenuineIntel` (12 threads), `31.87 GB` RAM, GPU `NVIDIA GeForce RTX 3050`
- **Dependências:** `{"numpy": "2.4.3", "sympy": "1.14.0", "mpmath": "1.3.0", "networkx": "3.6.1", "pydantic": "2.12.5", "reportlab": "4.4.10"}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('perfect-cuboid').run(seed=44, params={}).metrics)"
```

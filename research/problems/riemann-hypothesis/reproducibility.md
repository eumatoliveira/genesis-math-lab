# Manifesto de Reprodutibilidade e Proveniência — exp_14c7fce355a89816

- **SHA-256 Hash:** `cdf7d76ec4db11d3243e7dab3c54726f342fd7995f5c3b29211c4763e3b955fa`
- **Git Commit:** `workspace-init`
- **Timestamp (UTC):** `2026-11-27T15:28:33.919795+00:00`
- **Seed Determinística:** `46`
- **Precisão Numérica:** Python arbitrary int + float64 (mpmath 25 dps quando aplicável)
- **Hardware Utilizado:** `Intel64 Family 6 Model 165 Stepping 3, GenuineIntel` (12 threads), `31.87 GB` RAM, GPU `NVIDIA GeForce RTX 3050`
- **Dependências:** `{"numpy": "2.4.3", "sympy": "1.14.0", "mpmath": "1.3.0", "networkx": "3.6.1", "pydantic": "2.12.5", "reportlab": "4.4.10"}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('riemann-hypothesis').run(seed=46, params={}).metrics)"
```

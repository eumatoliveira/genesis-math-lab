# Manifesto de Reprodutibilidade e Proveniência — exp_ffed21a4dda3e7b2

- **SHA-256 Hash:** `267939ffd7b41c6569b18d1714a334b7bdb2ba9ffa574d974d813af490814e2a`
- **Git Commit:** `workspace-init`
- **Timestamp (UTC):** `2026-11-27T15:28:39.775801+00:00`
- **Seed Determinística:** `48`
- **Precisão Numérica:** Python arbitrary int + float64 (mpmath 25 dps quando aplicável)
- **Hardware Utilizado:** `Intel64 Family 6 Model 165 Stepping 3, GenuineIntel` (12 threads), `31.87 GB` RAM, GPU `NVIDIA GeForce RTX 3050`
- **Dependências:** `{"numpy": "2.4.3", "sympy": "1.14.0", "mpmath": "1.3.0", "networkx": "3.6.1", "pydantic": "2.12.5", "reportlab": "4.4.10"}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('navier-stokes').run(seed=48, params={}).metrics)"
```

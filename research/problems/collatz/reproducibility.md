# Manifesto de Reprodutibilidade e Proveniência — exp_9877fa98e341b0ff

- **SHA-256 Hash:** `0f2850a88ef1ce18296e7f49ed20353634fdfbe1b64d83c313d893b3a19de630`
- **Git Commit:** `workspace-init`
- **Timestamp (UTC):** `2026-11-27T15:28:30.332531+00:00`
- **Seed Determinística:** `42`
- **Precisão Numérica:** Python arbitrary int + float64 (mpmath 25 dps quando aplicável)
- **Hardware Utilizado:** `Intel64 Family 6 Model 165 Stepping 3, GenuineIntel` (12 threads), `31.87 GB` RAM, GPU `NVIDIA GeForce RTX 3050`
- **Dependências:** `{"numpy": "2.4.3", "sympy": "1.14.0", "mpmath": "1.3.0", "networkx": "3.6.1", "pydantic": "2.12.5", "reportlab": "4.4.10"}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('collatz').run(seed=42, params={}).metrics)"
```

# Manifesto de Reprodutibilidade e Proveniência — exp_9b9b4fde8b402d6f

- **SHA-256 Hash:** `2c584733a61d32d81a6ce1eba725f29b202e06f31acf4b3213eb99a0175138a3`
- **Git Commit:** `workspace-init`
- **Timestamp (UTC):** `2026-11-27T15:28:33.018703+00:00`
- **Seed Determinística:** `45`
- **Precisão Numérica:** Python arbitrary int + float64 (mpmath 25 dps quando aplicável)
- **Hardware Utilizado:** `Intel64 Family 6 Model 165 Stepping 3, GenuineIntel` (12 threads), `31.87 GB` RAM, GPU `NVIDIA GeForce RTX 3050`
- **Dependências:** `{"numpy": "2.4.3", "sympy": "1.14.0", "mpmath": "1.3.0", "networkx": "3.6.1", "pydantic": "2.12.5", "reportlab": "4.4.10"}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('magic-square-squares').run(seed=45, params={}).metrics)"
```

# Manifesto de Reprodutibilidade e Proveniência — exp_1632be19b1c10808

- **SHA-256 Hash:** `3fbddd96ab029aafb17d79c88c8eed6bdb564e242f4089614599ae1a1411880c`
- **Git Commit:** `workspace-init`
- **Timestamp (UTC):** `2026-11-27T15:28:40.325575+00:00`
- **Seed Determinística:** `49`
- **Precisão Numérica:** Python arbitrary int + float64 (mpmath 25 dps quando aplicável)
- **Hardware Utilizado:** `Intel64 Family 6 Model 165 Stepping 3, GenuineIntel` (12 threads), `31.87 GB` RAM, GPU `NVIDIA GeForce RTX 3050`
- **Dependências:** `{"numpy": "2.4.3", "sympy": "1.14.0", "mpmath": "1.3.0", "networkx": "3.6.1", "pydantic": "2.12.5", "reportlab": "4.4.10"}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('yang-mills').run(seed=49, params={}).metrics)"
```

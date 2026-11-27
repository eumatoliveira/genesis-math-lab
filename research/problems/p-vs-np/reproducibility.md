# Manifesto de Reprodutibilidade e Proveniência — exp_a8f299e497da212f

- **SHA-256 Hash:** `3b23171637dbeea2e80e12b080c40d61b6e9b8b92dadef969c690aa7039f7476`
- **Git Commit:** `workspace-init`
- **Timestamp (UTC):** `2026-11-27T15:28:39.216021+00:00`
- **Seed Determinística:** `47`
- **Precisão Numérica:** Python arbitrary int + float64 (mpmath 25 dps quando aplicável)
- **Hardware Utilizado:** `Intel64 Family 6 Model 165 Stepping 3, GenuineIntel` (12 threads), `31.87 GB` RAM, GPU `NVIDIA GeForce RTX 3050`
- **Dependências:** `{"numpy": "2.4.3", "sympy": "1.14.0", "mpmath": "1.3.0", "networkx": "3.6.1", "pydantic": "2.12.5", "reportlab": "4.4.10"}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('p-vs-np').run(seed=47, params={}).metrics)"
```

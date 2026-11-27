# Manifesto de Reprodutibilidade e Proveniência — exp_fbec34401eac9b7a

- **SHA-256 Hash:** `893aa45c23a1a35bd90cf3cea93ad5230aa3fd8bfa49e36ad0591450bad945fb`
- **Git Commit:** `workspace-init`
- **Timestamp (UTC):** `2026-11-27T15:28:31.432769+00:00`
- **Seed Determinística:** `43`
- **Precisão Numérica:** Python arbitrary int + float64 (mpmath 25 dps quando aplicável)
- **Hardware Utilizado:** `Intel64 Family 6 Model 165 Stepping 3, GenuineIntel` (12 threads), `31.87 GB` RAM, GPU `NVIDIA GeForce RTX 3050`
- **Dependências:** `{"numpy": "2.4.3", "sympy": "1.14.0", "mpmath": "1.3.0", "networkx": "3.6.1", "pydantic": "2.12.5", "reportlab": "4.4.10"}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('goldbach').run(seed=43, params={}).metrics)"
```

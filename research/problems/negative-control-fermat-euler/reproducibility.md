# Manifesto de Reprodutibilidade e Proveniência — exp_90617a8b2019db81

- **SHA-256 Hash:** `0e17def0a091986720682ccd17c3968ab7bcfde584fd10828952e5dc494df304`
- **Git Commit:** `workspace-init`
- **Timestamp (UTC):** `2026-11-27T15:28:40.881872+00:00`
- **Seed Determinística:** `50`
- **Precisão Numérica:** Python arbitrary int + float64 (mpmath 25 dps quando aplicável)
- **Hardware Utilizado:** `Intel64 Family 6 Model 165 Stepping 3, GenuineIntel` (12 threads), `31.87 GB` RAM, GPU `NVIDIA GeForce RTX 3050`
- **Dependências:** `{"numpy": "2.4.3", "sympy": "1.14.0", "mpmath": "1.3.0", "networkx": "3.6.1", "pydantic": "2.12.5", "reportlab": "4.4.10"}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('negative-control-fermat-euler').run(seed=50, params={}).metrics)"
```

# ADR-001: Arquitetura Híbrida Python (17 Agentes Científicos) + React/Three.js (Laboratório 3D GPU)

## Status
Aceito (2026-11-27)

## Contexto
O laboratório **GENESIS** requer duas capacidades distintas que raramente coexistem bem em uma única runtime:
1. **Computação científica precisa, verificação simbólica e persistência**: aritmética exata de inteiros arbitrários (Collatz, Cuboide Perfeito, contraexemplos de Fermat/Euler), precisão arbitrária (`mpmath`), manipulação simbólica (`SymPy`), grafos (`NetworkX`), geração vetorial de PDFs científicos (`ReportLab`), monitoramento de hardware local (`psutil`) e persistência reproduzível (`SQLite` + `JSONL` + hashes SHA-256).
2. **Visualização tridimensional em tempo real e UI reativa de baixa latência**: renderização WebGL/GLSL acelerada pela GPU (RTX 3050 local) com grids luminosos, campos físicos exploratórios ("modo Wi-Fi"), amostragem adaptativa 3D, osciloscópios 2D sincronizados e inspeção visual antes da formulação algorítmica (*Visual-First Scientific Discovery*).

## Decisão
Adotar uma arquitetura híbrida desacoplada por API REST + WebSocket (`FastAPI` + `Uvicorn` em `127.0.0.1:8000` e `Vite` + `React 19` + `Three.js` / `@react-three/fiber` em `127.0.0.1:5173`), com engines determinísticos espelhados no frontend TypeScript para responsividade imediata a 60 FPS mesmo durante desconexão ou modo offline, sincronizados com os experimentos persistentes e auditorias dos 17 agentes no backend Python.

## Consequências
- **Positivas**: Separação clara entre cálculo intensivo/persistência (Python) e renderização GPU interativa (WebGL/GLSL); possibilidade de rodar experimentos reais com `mpmath`/`SymPy` sem travar a thread de renderização do navegador; exportação dupla de relatórios (`.md` + `.pdf` via ReportLab no backend e `jsPDF` com snapshot 3D WebGL no frontend).
- **Negativas / Mitigações**: Duas runtimes para iniciar localmente; mitigado por scripts claros de inicialização, proxy `/api` e `/ws` no `vite.config.ts` e fallback local resiliente no frontend quando offline.

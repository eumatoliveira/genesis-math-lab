# ADR-003: Perfis de Hardware Doméstico, Backpressure e Amostragem Adaptativa vs. Força Bruta

## Status
Aceito (2026-11-27)

## Contexto
Hardware alvo auditado localmente: Intel Core i5-10400 (6 núcleos / 12 threads), 32 GB de RAM (~31,87 GB disponíveis) e NVIDIA GeForce RTX 3050, com ~20,6 GB livres em disco. Executar força bruta indiscriminada ou manter buffers GPU ilimitados saturaria memória, CPU e tempo útil.

## Decisão
1. **Orçamento explícito de recursos (`AGENT 12`)**: Monitoramento real via `psutil` com tetos configuráveis (RAM do laboratório limitada a 12–16 GB, CPU alvo 50–70%, teto de armazenamento experimental e checkpoints em `research/checkpoints/`).
2. **Desacoplamento cálculo × renderização**: Loops experimentais executam em lotes limitados por orçamento temporal, nunca renderizando todos os estados intermediários — apenas estados-chave, anomalias e regiões de interesse.
3. **Amostragem Adaptativa (`AGENT 05`)**: Substituir varreduras uniformes por amostragem grosseira inicial (`18 × 18`) guiada por detecção visual/espectral de anomalias, refinando seletivamente apenas sub-regiões de alto ganho de informação.
4. **Modos operacionais**: `manual`, `interactive`, `eco`, `balanced`, `high_performance` e `continuous` (sempre limitado e pausável).

## Consequências
- Mantém 30–60 FPS estáveis na interface 3D em computador doméstico convencional enquanto executa milhares de testes numéricos reproduzíveis em segundo plano.

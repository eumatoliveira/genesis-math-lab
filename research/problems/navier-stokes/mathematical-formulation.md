# Formulação Matemática — Existência e Suavidade de Navier–Stokes (Problema do Milênio)

## Enunciado Original
Dadas condições iniciais suaves e de energia finita em R³ (ou T³), existem sempre soluções suaves globalmente definidas para as equações de Navier-Stokes incompressíveis?

## Quantificadores e Variáveis
- **Quantificadores:** `∀ u_0 suave, ∃ u suave global ∈ C^∞(R³ × [0, ∞))`
- **Variáveis:** `{"u(x,t)": "Campo vetorial de velocidade 3D", "p(x,t)": "Pressão escalar", "ν": "Viscosidade cinemática"}`
- **Domínios:** `{"x": "R³ ou T³", "t": "[0, ∞)"}`
- **Restrições:** Incompressibilidade ∇·u = 0; ∂_t u + (u·∇)u = -∇p + ν Δu

## Hipóteses, Conclusão e Invariantes
- **Hipóteses:** u_0 ∈ C^∞(R³), ∇·u_0 = 0, energia inicial finita, viscosidade ν > 0
- **Conclusão:** u(x,t), p(x,t) suaves para todo t >= 0 e com energia limitada
- **Invariantes Conhecidos:** Conservação de massa; balanço de energia cinética dissipada por enstrofia
- **Formulações Equivalentes:** Critério de Beale-Kato-Majda: regularidade controlada pela integral da vorticidade máxima
- **Critério de Refutação:** Construir condição inicial suave com blow-up rigorosamente demonstrado em tempo finito

## Correspondência Física (Agente 04)
- **Categoria:** `Equivalência Demonstrada`
- **Justificativa:** Modelo contínuo clássico validado da mecânica dos fluidos incompressíveis (com ressalvas no limite molecular/discreto).
- **Coerência de Interferência (Analogia Wi-Fi):** `0.6962`

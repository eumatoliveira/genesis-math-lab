# Formulação Matemática — P versus NP (Problema do Milênio)

## Enunciado Original
Todo problema de decisão cuja solução pode ser verificada em tempo polinomial também pode ser resolvido em tempo polinomial?

## Quantificadores e Variáveis
- **Quantificadores:** `P = NP ⇔ ∃ algoritmo polinomial para SAT / 3-SAT`
- **Variáveis:** `{"n": "Tamanho da entrada", "T(n)": "Tempo de execução de Máquina de Turing determinística"}`
- **Domínios:** `{"L": "Classes de linguagens binárias {0,1}*"}`
- **Restrições:** Assintótica n -> ∞ (limites finitos NÃO resolvem o problema)

## Hipóteses, Conclusão e Invariantes
- **Hipóteses:** Linguagem L ∈ NP (verificador polinomial determinístico)
- **Conclusão:** P = NP ou P ≠ NP
- **Invariantes Conhecidos:** Teorema de Cook-Levin (NP-completude de SAT); Transição de fase 3-SAT perto de α ≈ 4.26
- **Formulações Equivalentes:** 3-SAT ∈ P; Circuitos booleanos polinomiais para problemas NP-completos
- **Critério de Refutação:** Separar formalmente NP de P por limite inferior não-relativizante e não-natural, ou exibir solver polinomial provado

## Correspondência Física (Agente 04)
- **Categoria:** `Modelo Aproximado`
- **Justificativa:** Transição de fase de vidros de spin em 3-SAT é modelo físico-estatístico bem estudado (não prova P vs NP).
- **Coerência de Interferência (Analogia Wi-Fi):** `0.8869`

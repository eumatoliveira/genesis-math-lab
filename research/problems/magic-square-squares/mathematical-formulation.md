# Formulação Matemática — Quadrado Mágico de Quadrados 3×3

## Enunciado Original
Existe um quadrado mágico 3×3 composto por nove quadrados perfeitos inteiros positivos distintos?

## Quantificadores e Variáveis
- **Quantificadores:** `∃ x_11..x_33 distintos em Z_{>0}: todas as 8 somas iguais`
- **Variáveis:** `{"x_ij": "Inteiros positivos distintos", "M": "Soma mágica comum"}`
- **Domínios:** `{"x_ij": "Z_{>0}"}`
- **Restrições:** |set(x_ij)| = 9 e soma constante nas 8 direções

## Hipóteses, Conclusão e Invariantes
- **Hipóteses:** Matriz 3×3 de inteiros x_ij^2 com todos os 9 valores distintos
- **Conclusão:** Todas as 3 linhas, 3 colunas e 2 diagonais somam a mesma constante mágica M = 3 c^2
- **Invariantes Conhecidos:** O elemento central é c^2 e M = 3c^2; pares simétricos satisfazem a^2 + b^2 = 2c^2
- **Formulações Equivalentes:** Três progressões aritméticas acopladas de 3 quadrados (parametrização de Lucas)
- **Critério de Refutação:** Demonstração de inconsistência diofantina ou exibição de solução exata com 9 quadrados distintos

## Correspondência Física (Agente 04)
- **Categoria:** `Hipótese Não Validada`
- **Justificativa:** Problema puramente aritmético-combinatório sem manifestação física direta assumida.
- **Coerência de Interferência (Analogia Wi-Fi):** `0.8424`

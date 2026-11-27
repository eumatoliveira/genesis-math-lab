# Formulação Matemática — Problema do Cuboide Perfeito

## Enunciado Original
Existe um paralelepípedo retângulo com arestas a, b, c inteiras cujas três diagonais das faces e a diagonal espacial sejam todas inteiras?

## Quantificadores e Variáveis
- **Quantificadores:** `∃ a,b,c,d1,d2,d3,g ∈ Z_{>0}: sistema satisfeito`
- **Variáveis:** `{"a, b, c": "Arestas inteiras", "d1, d2, d3": "Diagonais das faces", "g": "Diagonal espacial"}`
- **Domínios:** `{"a,b,c,d1,d2,d3,g": "Z_{>0}"}`
- **Restrições:** Sistema acoplado de 4 equações quadráticas diofantinas simultâneas

## Hipóteses, Conclusão e Invariantes
- **Hipóteses:** a, b, c ∈ Z_{>0}
- **Conclusão:** a^2+b^2=d1^2, a^2+c^2=d2^2, b^2+c^2=d3^2 e a^2+b^2+c^2=g^2 com d1,d2,d3,g ∈ Z_{>0}
- **Invariantes Conhecidos:** Famílias de Saunderson geram infinitos tijolos de Euler (3 faces inteiras), mas violam g inteiro nos casos conhecidos
- **Formulações Equivalentes:** Pontos racionais em superfícies algébricas de tipo geral associadas a tijolos de Euler
- **Critério de Refutação:** Para refutar existência: prova de obstrução (ex. Brauer-Manin ou descida infinita). Para resolver afirmativamente: exibir (a,b,c) exato.

## Correspondência Física (Agente 04)
- **Categoria:** `Analogia Exploratória`
- **Justificativa:** Geometria métrica euclidiana 3D; analogia de rede cristalina racional.
- **Coerência de Interferência (Analogia Wi-Fi):** `0.518`

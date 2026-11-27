# Formulação Matemática — Conjectura de Collatz (Problema 3n + 1)

## Enunciado Original
Para todo inteiro positivo n, a iteração f(n)=n/2 (se par) e f(n)=3n+1 (se ímpar) eventualmente atinge 1.

## Quantificadores e Variáveis
- **Quantificadores:** `∀ n ∈ Z_{>=1}, ∃ k ∈ Z_{>=0}: T^k(n) = 1`
- **Variáveis:** `{"n": "Inteiro positivo inicial", "k": "Número de iterações (tempo de parada total)"}`
- **Domínios:** `{"n": "Z_{>=1}", "k": "Z_{>=0}"}`
- **Restrições:** Aritmética inteira exata (sem arredondamento em ponto flutuante)

## Hipóteses, Conclusão e Invariantes
- **Hipóteses:** n pertence ao conjunto dos inteiros positivos N = {1, 2, 3, ...}
- **Conclusão:** Existe k >= 0 tal que f^(k)(n) = 1
- **Invariantes Conhecidos:** Paridade mod 2 dita a ramificação; classes mod 2^k determinam sequências finitas de divisão
- **Formulações Equivalentes:** Ausência de ciclos não triviais além de 4 -> 2 -> 1 e ausência de órbitas divergentes ao infinito; Árvore reversa de Collatz contém todos os inteiros positivos conectados à raiz 1
- **Critério de Refutação:** Encontrar n >= 1 cuja órbita entre em ciclo não contendo 1 ou provar existência de órbita divergente

## Correspondência Física (Agente 04)
- **Categoria:** `Analogia Exploratória`
- **Justificativa:** Analogia com sistemas dinâmicos dissipativos discretos; sem equivalência física direta comprovada.
- **Coerência de Interferência (Analogia Wi-Fi):** `0.47`

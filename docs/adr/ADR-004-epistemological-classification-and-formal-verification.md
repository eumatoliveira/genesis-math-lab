# ADR-004: Classificação Epistemológica Rigorosa e Separação entre Inspiração, Física e Prova Formal

## Status
Aceito (2026-11-27)

## Contexto
O projeto integra referências filosóficas e éticas (Gênesis, Jesus/Logos, Hermes Trismegisto, Nosso Lar), intuição visual de grandes cientistas (Tesla, Einstein, Da Vinci, Oppenheimer, Ramanujan, Newton, Faraday, Maxwell, Feynman, Poincaré, Mandelbrot, Noether, Turing, von Neumann, Shannon, Wolfram), experimentos computacionais e conjecturas matemáticas em aberto.

## Decisão
Impor separação estrutural e tipada em todos os modelos de dados, interface e relatórios PDF/Markdown:
1. **5 Camadas Explícitas**: Inspiração Filosófica & Ética | Analogia Conceitual | Hipótese Científica | Evidência Experimental | Demonstração Matemática.
2. **Taxonomia Formal de 9 Níveis (`EpistemologicalStatus`)**:
   - `Observação`, `Padrão Empírico`, `Hipótese`, `Conjectura`, `Resultado Parcial`, `Lema Demonstrado`, `Contraexemplo Verificado`, `Demonstração Candidata`, `Demonstração Formalmente Verificada`.
3. **Taxonomia Física de 4 Níveis (`PhysicsClassification`)**:
   - `Equivalência Demonstrada`, `Modelo Aproximado`, `Analogia Exploratória`, `Hipótese Não Validada`.
4. **Proibições Invioláveis**: Nunca exibir "% fictícia de proximidade da solução"; nunca declarar conjectura em aberto como resolvida por evidência finita; nunca emitir `sorry`/`admit` em código Lean 4 fingindo validação. Controles negativos conhecidos (Fermat $F_5$ composto e $27^5+84^5+110^5+133^5=144^5$) validam continuamente a capacidade de refutação.

## Consequências
- Garante rigor científico auditável ao mesmo tempo que preserva a riqueza filosófica e interdisciplinar pedida para o laboratório.

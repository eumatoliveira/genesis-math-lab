import type { CategoryId, PillarId } from './types'

export interface PillarMeta {
  id: PillarId
  name: string
  subtitle: string
  color: string
  essence: string
  methodologyRole: string
}

export const PILLARS: Record<PillarId, PillarMeta> = {
  genesis: {
    id: 'genesis',
    name: 'Gênesis — Ordem & Luz',
    subtitle: 'Fiat Lux • Estrutura a partir do caos',
    color: '#f5b942',
    essence: 'Simboliza a transição da indeterminação ("sem forma e vazia") para leis ordenadas, medidas, periodicidade e harmonia matemática.',
    methodologyRole: 'Inspiração filosófica para buscar ordem estrutural e simetrias antes do cálculo exaustivo.',
  },
  jesus: {
    id: 'jesus',
    name: 'Jesus — Logos & Ética',
    subtitle: 'Verdade inteligível • Conhecimento a serviço do bem',
    color: '#38e8ff',
    essence: 'Logos como razão luminosa e ética científica: clareza honesta diante do desconhecido, humildade epistêmica e transparência.',
    methodologyRole: 'Proíbe alucinações, porcentagens fictícias de sucesso ou declarações falsas de prova concluída.',
  },
  hermes: {
    id: 'hermes',
    name: 'Hermes Trismegisto',
    subtitle: 'Os 7 Princípios Herméticos (Analogia Conceitual)',
    color: '#a78bfa',
    essence: 'Mentalismo, Correspondência, Vibração, Polaridade, Ritmo, Causa/Efeito e Gênero/Complementaridade aplicados como taxonomia metafórica.',
    methodologyRole: 'Inspira mapeamentos de correspondência entre espaços distintos (dualidades, transformadas de Fourier, paridade).',
  },
  tesla: {
    id: 'tesla',
    name: 'Nikola Tesla',
    subtitle: 'Visualização Mental • Campos Invisíveis (Tipo Wi-Fi)',
    color: '#22d3ee',
    essence: 'Tesla concebia máquinas inteiras mentalmente em 3D antes de escrevê-las e revelava campos eletromagnéticos invisíveis por ressonância.',
    methodologyRole: 'Base para o shader "Campo Físico (Modo Wi-Fi)" que torna visíveis restrições, ondas e interferências antes invisíveis.',
  },
  einstein: {
    id: 'einstein',
    name: 'Albert Einstein',
    subtitle: 'Gedankenexperiment • Simetrias & Curvatura',
    color: '#60a5fa',
    essence: 'Experimentos mentais visuais de geometria do espaço-tempo, invariância de referenciais e unificação conceitual.',
    methodologyRole: 'Orienta projeções geométricas e verificação por contraexemplo único (um único fato derruba mil hipóteses).',
  },
  davinci: {
    id: 'davinci',
    name: 'Leonardo da Vinci',
    subtitle: 'Saper Vedere • Vórtices, Proporção Áurea & Poliedros',
    color: '#fbbf24',
    essence: 'Observação anatômica e hidráulica direta ("saber ver"): desenhar vórtices e proporções para extrair leis físicas e geométricas.',
    methodologyRole: 'Inspira os laboratórios de fluidos Navier-Stokes, poliedros, razão áurea φ e visualização multidisciplinar.',
  },
  'nosso-lar': {
    id: 'nosso-lar',
    name: 'Nosso Lar',
    subtitle: 'Arquitetura Concêntrica • Serviço pelo Conhecimento',
    color: '#34d399',
    essence: 'Referência cultural/ética à geometria urbana concêntrica harmônica e à ciência cooperativa voltada ao bem comum.',
    methodologyRole: 'Inspira a arquitetura colaborativa entre os 17 agentes e os anéis áureos do grid coordenado.',
  },
  'oppenheimer-neural': {
    id: 'oppenheimer-neural',
    name: 'Oppenheimer & Redes Neurais',
    subtitle: 'Visual-First • Amostragem Adaptativa Inteligente',
    color: '#f472b6',
    essence: 'Ver o comportamento do gráfico antes do algoritmo — como representações latentes neurais que economizam ordens de grandeza de cálculo.',
    methodologyRole: 'Funda o pipeline: Visualização -> Padrão -> Regressão Simbólica -> Red Team -> Prova Formal.',
  },
}

export const CATEGORY_LABELS: Record<CategoryId, { label: string; short: string; countTarget?: number }> = {
  'sacred-showcase': { label: '0. Síntese Visual & Controles', short: 'Síntese' },
  millennium: { label: '1. Problemas do Milênio', short: 'Milênio' },
  'number-theory': { label: '2. Teoria dos Números', short: 'Números' },
  'algebra-geometry': { label: '3. Álgebra & Geom. Algébrica', short: 'Álgebra' },
  'geometry-topology': { label: '4. Geometria & Topologia', short: 'Geometria' },
  'analysis-pde': { label: '5. Análise & Eq. Diferenciais', short: 'Análise' },
  'cs-ai': { label: '6. Computação & IA', short: 'Comp/IA' },
  'combinatorics-graphs': { label: '7. Combinatória & Grafos', short: 'Grafos' },
  'logic-foundations': { label: '8. Lógica & Fundamentos', short: 'Lógica' },
  'probability-stats': { label: '9. Probabilidade & Estatística', short: 'Prob.' },
  'math-physics': { label: '10. Física Matemática', short: 'Física' },
  hilbert: { label: '11. Problemas de Hilbert', short: 'Hilbert' },
}

export const METHODOLOGY_SCIENTISTS: Array<{ name: string; contribution: string }> = [
  { name: 'Nikola Tesla', contribution: 'Visualização mental tridimensional completa e ressonância de campos eletromagnéticos.' },
  { name: 'Albert Einstein', contribution: 'Experimentos mentais (Gedankenexperiment), covariância e geometria do espaço-tempo.' },
  { name: 'Leonardo da Vinci', contribution: 'Saper Vedere: observação visual de vórtices, proporção áurea φ e poliedros antes da equação.' },
  { name: 'J. Robert Oppenheimer', contribution: 'Abstração visual de interação física antes do formalismo perturbativo.' },
  { name: 'Isaac Newton', contribution: 'Extração de leis matemáticas universais a partir de órbitas observáveis.' },
  { name: 'Michael Faraday & James C. Maxwell', contribution: 'Linhas de força visíveis traduzidas para equações diferenciais de campo.' },
  { name: 'Srinivasa Ramanujan', contribution: 'Intuição direta de padrões aritméticos, identidades e conjecturas profundas.' },
  { name: 'Alan Turing & John von Neumann', contribution: 'Computabilidade, Máquinas de Turing (Busy Beaver) e simulação numérica.' },
  { name: 'Richard Feynman', contribution: 'Diagramas visuais para interações complexas e integrais de caminho.' },
  { name: 'Henri Poincaré & Benoît Mandelbrot', contribution: 'Sistemas dinâmicos, topologia, caos e auto-semelhança fractal multiescala.' },
  { name: 'Emmy Noether', contribution: 'Teorema conectando simetrias contínuas a leis exatas de conservação.' },
  { name: 'Claude Shannon & Stephen Wolfram', contribution: 'Entropia da informação (Gilmer/Frankl) e emergência computacional em regras simples.' },
]

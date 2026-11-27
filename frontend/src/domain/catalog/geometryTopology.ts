import type { ProblemSpec } from '../types'

function geo(id: string, code: string, title: string, status: ProblemSpec['status'], statusDetail: string, formulaLatex: string, description: string, variant: string, extraParams?: ProblemSpec['parameters'], defaults?: Record<string, number>): ProblemSpec {
  return {
    id,
    code,
    title,
    category: 'geometry-topology',
    area: 'Geometria & Topologia',
    status,
    statusDetail,
    formalTier: status === 'Resolvido' ? 'Demonstração Candidata' : 'Conjectura',
    physicsTier: 'Analogia Exploratória',
    physicsRationale: 'Geometria métrica, variedades diferenciáveis e invariantes topológicos.',
    pillar: 'davinci',
    hermeticPrinciple: 'Forma & Correspondência espacial invariante',
    engine: 'geometry',
    variant,
    formulaLatex,
    description,
    philosophicalNote: 'Da Vinci & Poincaré: raciocinar diretamente sobre superfícies, curvas e deformações contínuas.',
    scientificBridge: 'Projeção 3D e detecção visual de cruzamentos, áreas ótimas e dimensões fractais.',
    defaultParams: defaults ?? { phase: 0.5, density: 1.5 },
    parameters: extraParams ?? [
      { key: 'phase', label: 'Ângulo / Fase', min: 0.0, max: 3.14, step: 0.05, defaultValue: 0.5 },
      { key: 'density', label: 'Resolução Geométrica', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.5 },
    ],
    openSourceHint: 'stevejtrettel/threejs-demos + arXiv Math.MG/GT',
  }
}

export const GEOMETRY_TOPOLOGY_PROBLEMS: ProblemSpec[] = [
  geo('smooth-poincare-4d', 'GEO-01', 'Conjectura Suave de Poincaré em Dimensão 4', 'Em aberto', 'Única dimensão onde a versão diferenciável (suave) permanece aberta!', 'S⁴ suave exótica existe?', 'Projeção estereográfica 4D→3D de uma 3-esfera com torções diferenciais.', 'poincare-4d'),
  geo('inscribed-square', 'GEO-02', 'Problema do Quadrado Inscrito (Toeplitz)', 'Em aberto', 'Provado para curvas suaves/retangulares (Greene-Lobb 2020 para retângulos); caso contínuo geral de Jordan segue aberto.', 'Toda curva de Jordan contém 4 vértices de um quadrado?', 'Anima uma curva fechada de Jordan com varredura adaptativa procurando diagonais iguais e perpendiculares.', 'inscribed-square'),
  geo(
    'moving-sofa',
    'GEO-03',
    'Problema do Sofá Móvel (Gerver / Jineon Baek 2024)',
    'Resolvido',
    'Em nov/2024 Jineon Baek (arXiv:2411.19826) demonstrou a otimalidade do sofá de 18 arcos de Gerver (área ≈ 2.21953), com formalização em Lean 4 avançando em 2026.',
    'A_max = 2.219531669... (Sofá de 18 segmentos de Gerver)',
    'Anima em tempo real o sofá ótimo de Gerver manobrando sem colisão em um corredor em ângulo reto de largura 1.',
    'moving-sofa',
    [
      { key: 'progress', label: 'Avanço no Corredor', min: 0.0, max: 1.0, step: 0.02, defaultValue: 0.5 },
      { key: 'corridorWidth', label: 'Largura Corredor', min: 0.8, max: 1.2, step: 0.05, defaultValue: 1.0 },
    ],
    { progress: 0.5, corridorWidth: 1.0 },
  ),
  geo('hadwiger-nelson', 'GEO-04', 'Problema de Hadwiger–Nelson', 'Em aberto', 'Cota conhecida: 5 ≤ χ(R²) ≤ 7 desde Aubrey de Grey (2018, grafo de 1581 vértices).', '5 ≤ χ(R²) ≤ 7 (distância unitária)', 'Renderiza o fuso de Moser e projeções de grafos unitários coloridos destacando conflitos monocromáticos.', 'hadwiger-nelson'),
  geo('mahler-conjecture', 'GEO-05', 'Conjectura de Mahler (Corpos Convexos)', 'Em aberto', 'Provada em dimensão ≤ 3 (Iriyeh & Shibata 2020); aberta em d ≥ 4.', 'Vol(K)·Vol(K°) ≥ 4^d / d!', 'Exibe corpo convexo K junto ao seu polar dual K° e calcula o produto de volumes em 3D.', 'mahler'),
  geo('falconer-conjecture', 'GEO-06', 'Conjectura de Falconer', 'Em aberto', 'Avanços recentes em dimensão d=2 (Guth-Iosevich-Ou-Wang); limiar exato dim_H(E) > d/2 segue em aberto.', 'dim_H(E) > d/2 ⇒ dim_H(Δ(E)) = 1', 'Conjunto fractal tipo Cantor e histograma do conjunto de distâncias Δ(E).', 'falconer'),
  geo('kakeya-conjecture', 'GEO-07', 'Conjectura de Kakeya (3D Provada 2025!)', 'Parcial / Refutado', 'Em fev/2025 Hong Wang e Joshua Zahl provaram a Conjectura de Kakeya em R³! Dimensões d ≥ 4 seguem em aberto.', 'dim_H(K) = dim_M(K) = n (Provado em n=3 por Wang & Zahl 2025)', 'Renderiza feixes densos de segmentos unitários rotacionando por todas as direções no espaço 3D.', 'kakeya'),
  geo('novikov-conjecture', 'GEO-08', 'Conjectura de Novikov', 'Em aberto', 'Provada para amplas classes de grupos; caso geral para grupos discretos permanece aberto.', 'Invariância homotópica de assinaturas superiores', 'Superfície com classes características invariantes sob deformação.', 'novikov'),
  geo('baum-connes', 'GEO-09', 'Conjectura de Baum–Connes', 'Em aberto', 'Provada para grupos amenos; existem contraexemplos com coeficientes, caso puro segue aberto.', 'μ: K_*(BG) → K_*(C*_r(G)) isomorfismo?', 'Mapeamento espectral de álgebras de operadores sobre rede hiperbólica.', 'baum-connes'),
  geo('borel-conjecture', 'GEO-10', 'Conjectura de Borel (Rigidez Topológica)', 'Em aberto', 'Equivalência homotópica de variedades asféricas implica homeomorfismo.', 'M ≃ N (asféricas) ⇒ M ≅ N', 'Deformação de toro plano verificando rigidez topológica.', 'borel'),
  geo('hilbert-smith', 'GEO-11', 'Conjectura de Hilbert–Smith', 'Em aberto', 'Grupos p-ádicos Z_p não agem fielmente sobre variedades conectadas? Provada até dim=3 (Pardon 2013).', 'Z_p não age fielmente em M^n (aberta para n ≥ 4)', 'Órbita p-ádica projetada sobre esfera S³.', 'hilbert-smith'),
]

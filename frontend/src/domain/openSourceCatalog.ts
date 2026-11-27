export interface OpenSourceTechItem {
  name: string
  ecosystem: string
  role: string
  url: string
  usedInGenesis: string
}

export interface CatalogDirectoryItem {
  name: string
  scope: string
  url: string
}

export interface HilbertOverviewItem {
  number: number
  title: string
  status: string
  summary: string
}

export const OPEN_SOURCE_STACK: OpenSourceTechItem[] = [
  { name: 'Three.js & React Three Fiber', ecosystem: 'TypeScript / WebGL / GLSL', role: 'Motor de cena 3D interativa, câmeras orbitais, shaders e grids luminosos no navegador', url: 'https://threejs.org/', usedInGenesis: 'Em uso ativo (Viewport 3D)' },
  { name: 'PavelDoGreat / WebGL-Fluid-Simulation', ecosystem: 'WebGL / GLSL (Jos Stam)', role: 'Referência open source de Navier-Stokes em tempo real na GPU', url: 'https://github.com/PavelDoGreat/WebGL-Fluid-Simulation', usedInGenesis: 'Inspiração para o solver de fluidos' },
  { name: 'stevejtrettel / threejs-demos', ecosystem: 'TypeScript / Three.js', role: '140+ simulações open source de geometria diferencial, relatividade e dinâmica', url: 'https://github.com/stevejtrettel/threejs-demos', usedInGenesis: 'Referência geométrica 3D' },
  { name: 'SymPy, mpmath & NumPy', ecosystem: 'Python 3.14 (Backend)', role: 'Manipulação simbólica exata, ζ(s) com 25+ dígitos e cálculo vetorial rápido', url: 'https://www.sympy.org/', usedInGenesis: 'Em uso ativo (Backend Agentes 05-11)' },
  { name: 'Lean 4 & Mathlib4', ecosystem: 'Lean FRO (Verificação Formal)', role: 'Assistente de provas formais verificado por kernel lógico sem sorry/admit', url: 'https://github.com/leanprover-community/mathlib4', usedInGenesis: 'Esqueletos gerados pelo Agente 11' },
  { name: 'Google DeepMind Formal Conjectures', ecosystem: 'Lean 4 / AI Math', role: 'Corpus aberto de conjecturas formalizadas para verificação automatizada', url: 'https://github.com/google-deepmind/formal-conjectures', usedInGenesis: 'Padrão de formalização' },
  { name: 'PySR & PySINDy', ecosystem: 'Python / Julia Symbolic Regression', role: 'Descoberta simbólica de equações e sistemas dinâmicos a partir de dados', url: 'https://github.com/MilesCranmer/PySR', usedInGenesis: 'Metodologia do Agente 07' },
  { name: 'GUDHI & Ripser', ecosystem: 'C++ / Python TDA', role: 'Homologia persistente e análise topológica de dados', url: 'https://gudhi.inria.fr/', usedInGenesis: 'Referência topológica' },
  { name: 'DEAP & Optuna', ecosystem: 'Python Evolutionary / HPO', role: 'Algoritmos evolutivos e otimização bayesiana de parâmetros', url: 'https://github.com/DEAP/deap', usedInGenesis: 'Metodologia do Agente 08' },
  { name: 'Quimb & Taichi', ecosystem: 'Python / GPU Parallel', role: 'Redes tensoriais, estados quânticos em hardware clássico e partículas na GPU', url: 'https://github.com/jcmgray/quimb', usedInGenesis: 'Referência dos Agentes 05 & 09' },
  { name: 'Manim Community', ecosystem: 'Python (3Blue1Brown)', role: 'Animações matemáticas didáticas programáticas em alta definição', url: 'https://www.manim.community/', usedInGenesis: 'Referência de animação matemática' },
  { name: 'Makie (GLMakie) & PyVista', ecosystem: 'Julia / Python VTK', role: 'Visualização científica multidimensional e malhas 3D de alta performance', url: 'https://makie.org/', usedInGenesis: 'Referência científica' },
]

export const PUBLIC_RESEARCH_CATALOGS: CatalogDirectoryItem[] = [
  { name: 'Clay Mathematics Institute', scope: 'Problemas do Milênio ($1M cada; Poincaré resolvido)', url: 'https://www.claymath.org/millennium-problems' },
  { name: 'Erdős Problems', scope: 'Centenas de problemas de Paul Erdős + formalizações Lean 4', url: 'https://www.erdosproblems.com/' },
  { name: 'Open Problem Garden', scope: 'Wiki aberta de problemas em aberto em todas as áreas', url: 'https://www.openproblemgarden.org/' },
  { name: 'arXiv Mathematics & API', scope: 'Preprints de fronteira integrados ao Agente 01', url: 'https://arxiv.org/archive/math' },
  { name: 'OpenAlex', scope: 'Índice científico aberto multilíngue integrado ao Agente 01', url: 'https://openalex.org/' },
  { name: 'OEIS (Online Encyclopedia of Integer Sequences)', scope: 'Sequências inteiras integradas ao Agente 01 (A006577, A002375, etc.)', url: 'https://oeis.org/' },
  { name: 'LMFDB', scope: 'Base de funções-L, formas modulares e curvas elípticas (BSD)', url: 'https://www.lmfdb.org/' },
  { name: 'zbMATH Open & AMS', scope: 'Revisões matemáticas revisadas por pares', url: 'https://zbmath.org/' },
  { name: 'MathOverflow', scope: 'Discussões técnicas de pesquisadores profissionais', url: 'https://mathoverflow.net/' },
  { name: 'Project Gutenberg (Domínio Público)', scope: 'Obras clássicas de Euclides, Poincaré, Russell e história matemática', url: 'https://www.gutenberg.org/' },
]

export const HILBERT_23_PROBLEMS: HilbertOverviewItem[] = [
  { number: 1, title: 'Hipótese do Contínuo', status: 'Independente de ZFC', summary: 'Indecidível em ZFC (Gödel 1940, Cohen 1963).' },
  { number: 2, title: 'Consistência dos Axiomas da Aritmética', status: 'Parcial / Limites (Gödel)', summary: 'Incompletude impede prova interna na própria teoria.' },
  { number: 3, title: 'Equidecomposição de Poliedros', status: 'Resolvido (Negativo)', summary: 'Dehn (1900) provou impossibilidade usando invariante de Dehn.' },
  { number: 4, title: 'Geometrias onde retas são geodésicas', status: 'Vago / Amplo', summary: 'Múltiplas soluções estudadas em geometria métrica e Finsler.' },
  { number: 5, title: 'Grupos de Lie sem diferenciabilidade prévia', status: 'Resolvido', summary: 'Gleason, Montgomery e Zippin (1952).' },
  { number: 6, title: 'Axiomatização da Física', status: 'Em aberto / Contínuo', summary: 'Relatividade e Mecânica Quântica ainda carecem de unificação rigorosa.' },
  { number: 7, title: 'Irracionalidade e transcendência de a^b', status: 'Resolvido', summary: 'Teorema de Gelfond-Schneider (1934).' },
  { number: 8, title: 'Hipótese de Riemann & Primos (Goldbach/Gêmeos)', status: 'Em aberto', summary: 'Zeros de ζ(s) na linha crítica Re(s)=1/2 permanecem abertos.' },
  { number: 9, title: 'Leis de reciprocidade mais gerais', status: 'Parcialmente Resolvido', summary: 'Caso abeliano por Artin; não-abeliano ligado ao Programa de Langlands.' },
  { number: 10, title: 'Solubilidade de equações diofantinas', status: 'Resolvido (Negativo)', summary: 'Teorema MRDP (Matiyasevich 1970): indecidível em geral.' },
  { number: 11, title: 'Formas quadráticas em corpos numéricos', status: 'Parcialmente Resolvido', summary: 'Princípio de Hasse-Minkowski sobre Q e avanços modernos.' },
  { number: 12, title: 'Extensão de Kronecker-Weber', status: 'Em aberto (Geral)', summary: 'Construção explícita de extensões abelianas de corpos arbitrários.' },
  { number: 13, title: 'Soluções de equações de 7º grau por 2 variáveis', status: 'Parcial / Dividido', summary: 'Contínuo resolvido (Kolmogorov-Arnold); caso algébrico aberto.' },
  { number: 14, title: 'Geração finita de anéis de invariantes', status: 'Resolvido (Negativo)', summary: 'Contraexemplo construído por Masayoshi Nagata (1958).' },
  { number: 15, title: 'Fundamentação rigorosa do cálculo enumerativo de Schubert', status: 'Resolvido', summary: 'Formalizado via geometria algébrica moderna.' },
  { number: 16, title: 'Topologia de curvas algébricas & ciclos-limite', status: 'Em aberto', summary: 'Segunda parte (número H(n) de ciclos-limite de EDOs polinomiais) aberta.' },
  { number: 17, title: 'Representação de funções racionais positivas como quadrados', status: 'Resolvido', summary: 'Emil Artin (1927).' },
  { number: 18, title: 'Empacotamento de esferas & grupos cristalográficos', status: 'Resolvido', summary: 'Kepler resolvido por Thomas Hales (Flyspeck em HOL Light/Isabelle).' },
  { number: 19, title: 'Analiticidade de soluções de problemas variacionais regulares', status: 'Resolvido', summary: 'Ennio De Giorgi e John Nash.' },
  { number: 20, title: 'Problema geral de valores de contorno', status: 'Resolvido', summary: 'Teoria moderna de EDPs e espaços de Sobolev.' },
  { number: 21, title: 'Existência de EDOs lineares com grupo de monodromia dado', status: 'Resolvido (Negativo em parte)', summary: 'Bolibrukh mostrou contraexemplos ao enunciado clássico estrito.' },
  { number: 22, title: 'Uniformização de relações analíticas por funções automorfas', status: 'Resolvido', summary: 'Teorema da Uniformização de Koebe-Poincaré.' },
  { number: 23, title: 'Desenvolvimento dos métodos do cálculo variacional', status: 'Em aberto / Programa', summary: 'Contínuo desenvolvimento em otimização infinita-dimensional e geodésicas.' },
]

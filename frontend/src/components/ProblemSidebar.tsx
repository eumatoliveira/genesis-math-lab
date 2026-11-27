import { BookMarked, Compass, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CATEGORY_LABELS, PILLARS } from '../domain/pillars'
import type { CategoryId, PillarId, ProblemSpec } from '../domain/types'

interface Props {
  problems: ProblemSpec[]
  selectedId: string
  onSelect: (problem: ProblemSpec) => void
  openMobile: boolean
  onCloseMobile: () => void
  hideDesktop?: boolean
}

const STATUS_STYLE: Record<ProblemSpec['status'], string> = {
  'Em aberto': 'border-sky-200 bg-sky-50 text-[#0067B8]',
  Resolvido: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Parcial / Refutado': 'border-amber-200 bg-amber-50 text-amber-800',
  'Independente de ZFC': 'border-violet-200 bg-violet-50 text-violet-700',
  Controverso: 'border-rose-200 bg-rose-50 text-rose-700',
  'Área de Pesquisa': 'border-cyan-200 bg-cyan-50 text-cyan-800',
  'Controle Científico': 'border-amber-300 bg-amber-50 text-amber-900',
}

export function ProblemSidebar({ problems, selectedId, onSelect, openMobile, onCloseMobile, hideDesktop = false }: Props) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all' | 'study-path'>('all')
  const [activePillar, setActivePillar] = useState<PillarId | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = problems.filter((p) => {
      if (activeCategory === 'study-path') {
        if (!p.studyOrder) return false
      } else if (activeCategory !== 'all' && p.category !== activeCategory) {
        return false
      }
      if (activePillar !== 'all' && p.pillar !== activePillar) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    })
    if (activeCategory === 'study-path') {
      return [...base].sort((a, b) => (a.studyOrder ?? 99) - (b.studyOrder ?? 99))
    }
    return base
  }, [problems, query, activeCategory, activePillar])

  const content = (
    <div className="flex h-full flex-col bg-[#F8F9FA]">
      <div className="border-b border-[#E3E8EF] bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1A73E8]">
            <Compass className="h-3.5 w-3.5" />
            <span>Catálogo Científico ({filtered.length}/{problems.length})</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded p-1 text-[#444746] hover:text-[#1F1F1F] lg:hidden"
            aria-label="Fechar catálogo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-2.5">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#5F6368]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar Riemann, Collatz, Cuboide..."
            className="w-full rounded-lg border border-[#DADCE0] bg-[#F8F9FA] py-1.5 pl-8 pr-3 text-xs text-[#1F1F1F] placeholder:text-[#5F6368] focus:border-[#1A73E8] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <select
            aria-label="Filtrar categoria"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as CategoryId | 'all' | 'study-path')}
            className="rounded-md border border-[#DADCE0] bg-white px-2 py-1 text-[11px] text-[#1F1F1F] focus:border-[#1A73E8] focus:outline-none"
          >
            <option value="all">Todas Categorias ({problems.length})</option>
            <option value="study-path">Trilha Estudo (1→10)</option>
            {(Object.keys(CATEGORY_LABELS) as CategoryId[]).map((cid) => (
              <option key={cid} value={cid}>
                {CATEGORY_LABELS[cid].label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar pilar metodológico"
            value={activePillar}
            onChange={(e) => setActivePillar(e.target.value as PillarId | 'all')}
            className="rounded-md border border-[#DADCE0] bg-white px-2 py-1 text-[11px] text-[#1F1F1F] focus:border-[#1A73E8] focus:outline-none"
          >
            <option value="all">Todos Pilares / Gênios</option>
            {(Object.keys(PILLARS) as PillarId[]).map((pid) => (
              <option key={pid} value={pid}>
                {PILLARS[pid].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
        {filtered.map((prob) => {
          const active = prob.id === selectedId
          const pillarMeta = PILLARS[prob.pillar]
          return (
            <button
              key={prob.id}
              type="button"
              onClick={() => {
                onSelect(prob)
                onCloseMobile()
              }}
              className={`w-full rounded-xl border p-2.5 text-left transition ${
                active
                  ? 'border-[#1A73E8] bg-[#E8F0FE]/70 shadow-2xs ring-1 ring-[#1A73E8]/30'
                  : 'border-[#E3E8EF] bg-white hover:border-[#C2D7F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] font-bold text-[#0067B8]">
                  {prob.code}
                  {prob.studyOrder ? ` • #${prob.studyOrder}` : ''}
                </span>
                <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_STYLE[prob.status]}`}>
                  {prob.status}
                </span>
              </div>
              <div className="mt-1 text-xs font-semibold text-[#1F1F1F]">{prob.title}</div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-[#444746]">
                <span className="truncate">{prob.area}</span>
                <span className="ml-1 shrink-0 font-medium" style={{ color: pillarMeta.color }}>
                  ● {pillarMeta.name.split('—')[0].trim()}
                </span>
              </div>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-[#E3E8EF] bg-white p-4 text-center text-xs text-[#444746]">
            <BookMarked className="mx-auto mb-2 h-5 w-5 text-[#5F6368]" />
            Nenhum problema encontrado para &ldquo;{query}&rdquo;.
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {!hideDesktop && (
        <aside className="hidden h-[calc(100vh-58px)] w-72 shrink-0 border-r border-[#E3E8EF] lg:block xl:w-80">
          {content}
        </aside>
      )}
      {openMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-80 max-w-[85vw] border-r border-[#DADCE0] bg-[#F8F9FA] shadow-2xl">{content}</div>
          <div className="flex-1 bg-black/45 backdrop-blur-xs" onClick={onCloseMobile} />
        </div>
      )}
    </>
  )
}

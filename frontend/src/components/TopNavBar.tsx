import { useEffect, useState } from 'react'
import {
  BookOpen,
  Download,
  FileText,
  Home,
  Menu,
  Sparkles,
} from 'lucide-react'
import type { HardwareProfile, LabViewId } from '../domain/types'

interface Props {
  activeView: LabViewId
  onChangeView: (view: LabViewId) => void
  language: 'pt' | 'en'
  onToggleLanguage: () => void
  hardwareProfile: HardwareProfile
  onChangeProfile: (profile: HardwareProfile) => void
  backendOnline: boolean
  problemCount: number
  onToggleSidebar: () => void
  onExportMarkdown: () => void
  onExportPdf: () => void
}

const NAV_TABS: Array<{ id: LabViewId; label: string; icon: typeof Sparkles }> = [
  { id: 'research-home', label: 'Início & Artigos', icon: Home },
  { id: 'command-center', label: 'Lab 3D & Padrões', icon: Sparkles },
  { id: 'reports-sources', label: 'Relatórios & Fontes', icon: BookOpen },
]

export function TopNavBar({
  activeView,
  onChangeView,
  language,
  onToggleLanguage,
  backendOnline,
  onToggleSidebar,
  onExportMarkdown,
  onExportPdf,
}: Props) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
      setScrollProgress(progress)
    }

    updateScrollProgress()
    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    window.addEventListener('resize', updateScrollProgress, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateScrollProgress)
      window.removeEventListener('resize', updateScrollProgress)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-[#E3E8EF] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-2 px-3 py-2.5 lg:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Abrir catálogo de problemas"
            className="rounded-lg border border-[#DADCE0] bg-[#F8F9FA] p-2 text-[#1A73E8] hover:bg-[#E8F0FE] lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onChangeView('research-home')}
            className="flex items-center gap-2 text-left"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#09203F] to-[#1A73E8] font-serif-editorial text-lg font-bold text-white shadow-2xs">
              π
            </span>
            <div className="min-w-0">
              <span className="font-display text-base font-bold tracking-tight text-[#1F1F1F]">genesis</span>
            </div>
          </button>
        </div>

        <nav
          className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto py-0.5"
          aria-label="Áreas do laboratório"
        >
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeView === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeView(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-[#E8F0FE] font-semibold text-[#1A73E8] ring-1 ring-[#1A73E8]/35'
                    : 'text-[#444746] hover:bg-[#F1F3F4] hover:text-[#1F1F1F]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] xl:flex ${
              backendOnline
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {backendOnline ? 'Python 17-Agentes Online' : 'Modo Local TS Resiliente'}
          </div>

          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label="Alternar idioma PT/EN"
            className="rounded-full border border-[#DADCE0] bg-[#F8F9FA] px-2.5 py-1 font-mono text-[11px] font-bold text-[#0067B8] hover:border-[#1A73E8]"
          >
            {language === 'pt' ? 'PT-BR | EN' : 'EN | PT-BR'}
          </button>

          <button
            type="button"
            onClick={onExportMarkdown}
            className="flex items-center gap-1 rounded-full border border-[#DADCE0] bg-white px-3 py-1.5 text-xs font-medium text-[#1F1F1F] hover:border-[#1A73E8] hover:text-[#1A73E8]"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">.MD</span>
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            className="flex items-center gap-1 rounded-full bg-[#0067B8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00569C]"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">.PDF</span>
          </button>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="h-[3px] w-full bg-[#E3E8EF]/60"
      >
        <div
          className="h-full bg-gradient-to-r from-[#09203F] to-[#1A73E8] transition-[width] duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </header>
  )
}

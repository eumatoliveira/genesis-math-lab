import { Camera, Columns2, Eye, Layers, Pause, Play, Radio, RotateCcw, Sliders } from 'lucide-react'
import type { ProblemSpec, ProjectionMode } from '../domain/types'
import type { CameraPreset } from '../visualizers/ObservatoryCanvas3D'

interface Props {
  problem: ProblemSpec
  params: Record<string, number>
  onChangeParam: (key: string, value: number) => void
  onResetParams: () => void
  playing: boolean
  onTogglePlay: () => void
  speed: number
  onChangeSpeed: (s: number) => void
  wifiEnabled: boolean
  onToggleWifi: () => void
  adaptiveOverlay: boolean
  onToggleAdaptive: () => void
  showSurface: boolean
  onToggleSurface: () => void
  showWireframe: boolean
  onToggleWireframe: () => void
  showParticles: boolean
  onToggleParticles: () => void
  compareSplit: boolean
  onToggleCompare: () => void
  projection: ProjectionMode
  onChangeProjection: (proj: ProjectionMode) => void
  cameraPreset: CameraPreset
  onChangeCameraPreset: (preset: CameraPreset) => void
  cameraAngle: number
  onChangeCameraAngle: (deg: number) => void
}

const PROJECTION_NOTES: Record<ProjectionMode, string> = {
  cartesian_3d: 'Preserva coordenadas ortogonais locais; descarta dimensões > 3.',
  polar_spherical: 'Preserva periodicidade radial e angular; distorce escalas lineares.',
  phase_space: 'Preserva dinâmica acoplada posição×momento; não-isométrica.',
  stereographic_4d: 'Preserva ângulos conformes de S³→R³; distorce distâncias globais.',
}

export function ControlDeck({
  problem,
  params,
  onChangeParam,
  onResetParams,
  playing,
  onTogglePlay,
  speed,
  onChangeSpeed,
  wifiEnabled,
  onToggleWifi,
  adaptiveOverlay,
  onToggleAdaptive,
  showSurface,
  onToggleSurface,
  showWireframe,
  onToggleWireframe,
  showParticles,
  onToggleParticles,
  compareSplit,
  onToggleCompare,
  projection,
  onChangeProjection,
  cameraPreset,
  onChangeCameraPreset,
  cameraAngle,
  onChangeCameraAngle,
}: Props) {
  return (
    <div className="min-w-0 space-y-3 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0067B8]">
          <Sliders className="h-3.5 w-3.5" />
          <span>Controles Visuais & Projeção ND</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex items-center gap-1 rounded-full bg-[#1A73E8] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1557B0]"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{playing ? 'Pausar' : 'Animar'}</span>
          </button>
          <button
            type="button"
            onClick={onResetParams}
            className="flex items-center gap-1 rounded-full border border-[#DADCE0] bg-[#F8F9FA] px-3 py-1 text-xs font-medium text-[#1F1F1F] hover:border-[#1A73E8]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Redefinir</span>
          </button>
        </div>
      </div>

      {/* Problem Parameters */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {problem.parameters.map((spec) => {
          const val = params[spec.key] ?? spec.defaultValue
          return (
            <label key={spec.key} className="block min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-[#1F1F1F]">{spec.label}</span>
                <span className="font-mono font-bold text-[#0067B8]">
                  {Number(val).toFixed(spec.step < 1 ? 3 : 0)}
                </span>
              </div>
              <input
                type="range"
                min={spec.min}
                max={spec.max}
                step={spec.step}
                value={val}
                onChange={(e) => onChangeParam(spec.key, Number(e.target.value))}
                className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#1A73E8]"
              />
            </label>
          )
        })}

        <label className="block min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#1F1F1F]">Rotação Câmera</span>
            <span className="font-mono font-bold text-[#1A73E8]">{cameraAngle}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={cameraAngle}
            onChange={(e) => onChangeCameraAngle(Number(e.target.value))}
            className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#1A73E8]"
          />
        </label>

        <label className="block min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#1F1F1F]">Velocidade Timeline</span>
            <span className="font-mono font-bold text-emerald-700">{speed.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={2.5}
            step={0.1}
            value={speed}
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
            className="mt-1.5 h-1.5 w-full cursor-pointer accent-emerald-600"
          />
        </label>
      </div>

      {/* Physical Field (Wi-Fi), Adaptive Sampling & Multidimensional Projection */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#E3E8EF] pt-2.5 text-[11px]">
        <button
          type="button"
          onClick={onToggleWifi}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition ${
            wifiEnabled
              ? 'border-[#1A73E8]/40 bg-[#E8F0FE] text-[#1A73E8]'
              : 'border-[#DADCE0] bg-[#F8F9FA] text-[#444746]'
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Campo Físico (Modo Wi-Fi): {wifiEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleAdaptive}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition ${
            adaptiveOverlay
              ? 'border-amber-300 bg-amber-50 text-amber-800'
              : 'border-[#DADCE0] bg-[#F8F9FA] text-[#444746]'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Hotspots Adaptativos 18×18: {adaptiveOverlay ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleWireframe}
          className={`flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium ${
            showWireframe ? 'border-[#0067B8]/40 bg-[#EBF3FA] text-[#0067B8]' : 'border-[#DADCE0] text-[#444746]'
          }`}
        >
          <Layers className="h-3 w-3" /> Wireframe
        </button>

        <button
          type="button"
          onClick={onToggleSurface}
          className={`rounded-full border px-2.5 py-1 font-medium ${
            showSurface ? 'border-[#0067B8]/40 bg-[#EBF3FA] text-[#0067B8]' : 'border-[#DADCE0] text-[#444746]'
          }`}
        >
          Superfície
        </button>

        <button
          type="button"
          onClick={onToggleParticles}
          className={`rounded-full border px-2.5 py-1 font-medium ${
            showParticles ? 'border-[#0067B8]/40 bg-[#EBF3FA] text-[#0067B8]' : 'border-[#DADCE0] text-[#444746]'
          }`}
        >
          Partículas
        </button>

        <button
          type="button"
          onClick={onToggleCompare}
          className={`flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium ${
            compareSplit ? 'border-violet-300 bg-violet-50 text-violet-800' : 'border-[#DADCE0] text-[#444746]'
          }`}
        >
          <Columns2 className="h-3 w-3" /> Comparar A/B
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="font-medium text-[#444746]">Projeção ND:</span>
          <select
            aria-label="Projeção Multidimensional"
            value={projection}
            onChange={(e) => onChangeProjection(e.target.value as ProjectionMode)}
            className="rounded-lg border border-[#DADCE0] bg-[#F8F9FA] px-2 py-1 text-[#1F1F1F] focus:border-[#1A73E8] focus:outline-none"
          >
            <option value="cartesian_3d">Cartesiana 3D</option>
            <option value="polar_spherical">Polar / Esférica</option>
            <option value="phase_space">Espaço de Fase</option>
            <option value="stereographic_4d">Estereográfica 4D→3D</option>
          </select>
          <span className="text-[#444746]">{PROJECTION_NOTES[projection]}</span>
        </div>

        <div className="flex items-center gap-1">
          <Camera className="h-3.5 w-3.5 text-[#5F6368]" />
          {(['orbit-35', 'top-down', 'side-section'] as CameraPreset[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeCameraPreset(c)}
              className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ${
                cameraPreset === c ? 'bg-[#1A73E8] text-white' : 'bg-[#F1F3F4] text-[#444746] hover:text-[#1F1F1F]'
              }`}
            >
              {c === 'orbit-35' ? '35°' : c === 'top-down' ? 'Topo' : 'Perfil'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

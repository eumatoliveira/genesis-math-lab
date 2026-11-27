import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { HardwareProfile, SimulationFrame } from '../domain/types'
import { LuminousGridShader } from './LuminousGridShader'
import { SimulationMeshRenderer } from './SimulationMeshRenderer'
import { WifiFieldOverlay } from './WifiFieldOverlay'

export type CameraPreset = 'orbit-35' | 'top-down' | 'side-section'

function CameraRig({ preset, rotationDeg }: { preset: CameraPreset; rotationDeg: number }) {
  const { camera } = useThree()
  useEffect(() => {
    const rad = (rotationDeg * Math.PI) / 180
    if (preset === 'top-down') {
      camera.position.set(0.01, 11.5, 0.01)
    } else if (preset === 'side-section') {
      camera.position.set(Math.sin(rad) * 9.5, 2.2, Math.cos(rad) * 9.5)
    } else {
      camera.position.set(Math.sin(rad) * 9.2, 5.4, Math.cos(rad) * 9.2)
    }
    camera.lookAt(0, 0, 0)
  }, [preset, rotationDeg, camera])
  return null
}

interface Props {
  frame: SimulationFrame
  profile: HardwareProfile
  wifiEnabled: boolean
  adaptiveOverlay: boolean
  showSurface: boolean
  showWireframe: boolean
  showParticles: boolean
  cameraPreset: CameraPreset
  cameraAngleDeg: number
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

export function ObservatoryCanvas3D({
  frame,
  profile,
  wifiEnabled,
  adaptiveOverlay,
  showSurface,
  showWireframe,
  showParticles,
  cameraPreset,
  cameraAngleDeg,
  onCanvasReady,
}: Props) {
  const dpr: [number, number] = profile === 'eco' ? [1, 1] : profile === 'ultra' ? [1, 2] : [1, 1.5]

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-cyan-500/20 bg-[#050814]">
      <Canvas
        dpr={dpr}
        camera={{ position: [5.2, 5.4, 7.6], fov: 46, near: 0.1, far: 100 }}
        gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          onCanvasReady?.(gl.domElement)
        }}
      >
        <color attach="background" args={['#050814']} />
        <fog attach="fog" args={['#050814', 14, 30]} />
        <ambientLight intensity={0.62} />
        <directionalLight position={[6, 10, 6]} intensity={1.35} color="#fff7ed" />
        <pointLight position={[-6, 4, -5]} intensity={1.0} color="#38e8ff" />

        <CameraRig preset={cameraPreset} rotationDeg={cameraAngleDeg} />
        <LuminousGridShader coherence={frame.fieldCoupling.coherence} />
        <WifiFieldOverlay enabled={wifiEnabled} adaptiveEnabled={adaptiveOverlay} frame={frame} />
        <SimulationMeshRenderer
          frame={frame}
          showSurface={showSurface}
          showWireframe={showWireframe}
          showParticles={showParticles}
        />
        <OrbitControls enableDamping dampingFactor={0.07} minDistance={3.2} maxDistance={20} />
      </Canvas>
    </div>
  )
}

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SimulationFrame } from '../domain/types'

const wifiVertex = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const wifiFragment = /* glsl */ `
  uniform float uTime;
  uniform float uFreq;
  uniform float uAmp;
  uniform float uCoherence;
  uniform vec3 uFocal;
  varying vec3 vWorldPos;

  void main() {
    float r = length(vWorldPos.xz - uFocal.xz);
    float wave = sin(r * uFreq * 2.2 - uTime * 2.8);
    float crests = smoothstep(0.68, 0.99, wave);
    float shell = smoothstep(0.09, 0.0, abs(fract(r * 0.65 - uTime * 0.45) - 0.5));
    float env = exp(-r * 0.22) * clamp(uAmp * 0.65, 0.2, 1.2);

    vec3 cyan = vec3(0.22, 0.91, 1.0);
    vec3 gold = vec3(0.96, 0.74, 0.28);
    vec3 col = mix(cyan, gold, uCoherence * 0.65);

    float alpha = clamp((crests * 0.24 + shell * 0.34) * env, 0.0, 0.58);
    gl_FragColor = vec4(col, alpha);
  }
`

interface Props {
  enabled: boolean
  adaptiveEnabled: boolean
  frame: SimulationFrame
}

export function WifiFieldOverlay({ enabled, adaptiveEnabled, frame }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => {
      const fp = frame.fieldCoupling.focalPoints[0] ?? [0, 0, 0]
      return {
        uTime: { value: 0 },
        uFreq: { value: Number.isFinite(frame.fieldCoupling.frequency) ? frame.fieldCoupling.frequency : 1.5 },
        uAmp: { value: Number.isFinite(frame.fieldCoupling.amplitude) ? frame.fieldCoupling.amplitude : 1.0 },
        uCoherence: { value: Number.isFinite(frame.fieldCoupling.coherence) ? frame.fieldCoupling.coherence : 0.5 },
        uFocal: {
          value: new THREE.Vector3(
            Number.isFinite(fp[0]) ? fp[0] : 0,
            Number.isFinite(fp[1]) ? fp[1] : 0,
            Number.isFinite(fp[2]) ? fp[2] : 0,
          ),
        },
      }
    },
    [],
  )

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime()
      matRef.current.uniforms.uFreq.value = Number.isFinite(frame.fieldCoupling.frequency) ? frame.fieldCoupling.frequency : 1.5
      matRef.current.uniforms.uAmp.value = Number.isFinite(frame.fieldCoupling.amplitude) ? frame.fieldCoupling.amplitude : 1.0
      matRef.current.uniforms.uCoherence.value = Number.isFinite(frame.fieldCoupling.coherence) ? frame.fieldCoupling.coherence : 0.5
      const fp = frame.fieldCoupling.focalPoints[0] ?? [0, 0, 0]
      matRef.current.uniforms.uFocal.value.set(
        Number.isFinite(fp[0]) ? fp[0] : 0,
        Number.isFinite(fp[1]) ? fp[1] : 0,
        Number.isFinite(fp[2]) ? fp[2] : 0,
      )
    }
  })

  const rawFocal = frame.fieldCoupling.focalPoints[0] ?? [0, 0, 0]
  const safeFocal: [number, number, number] = [
    Number.isFinite(rawFocal[0]) ? rawFocal[0] : 0,
    Number.isFinite(rawFocal[1]) ? rawFocal[1] : 0,
    Number.isFinite(rawFocal[2]) ? rawFocal[2] : 0,
  ]

  return (
    <group>
      {enabled && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
            <planeGeometry args={[18, 18, 1, 1]} />
            <shaderMaterial
              ref={matRef}
              vertexShader={wifiVertex}
              fragmentShader={wifiFragment}
              uniforms={uniforms}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={safeFocal} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.45, 0.025, 12, 64]} />
            <meshBasicMaterial color="#38e8ff" transparent opacity={0.38} />
          </mesh>
        </>
      )}

      {adaptiveEnabled &&
        frame.adaptiveHotspots?.map((spot, idx) => {
          const sx = Number.isFinite(spot.x) ? spot.x : 0
          const sz = Number.isFinite(spot.z) ? spot.z : 0
          const si = Number.isFinite(spot.intensity) ? Math.max(0.1, Math.min(1.5, spot.intensity)) : 0.5
          return (
            <group key={idx} position={[sx, 0.2, sz]}>
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.04, 0.16, 1.4 * si + 0.5, 12]} />
                <meshBasicMaterial color="#f5b942" transparent opacity={0.55} />
              </mesh>
            </group>
          )
        })}
    </group>
  )
}

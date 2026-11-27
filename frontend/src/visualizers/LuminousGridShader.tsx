import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uCoherence;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vec2 coord = vWorldPos.xz;
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / max(fwidth(coord), vec2(1e-4));
    float line = min(grid.x, grid.y);
    float minorGrid = 1.0 - min(line, 1.0);

    vec2 majorCoord = coord * 0.25;
    vec2 majorG = abs(fract(majorCoord - 0.5) - 0.5) / max(fwidth(majorCoord), vec2(1e-4));
    float majorLine = 1.0 - min(min(majorG.x, majorG.y), 1.0);

    float dist = length(coord);
    float fade = exp(-dist * 0.14);

    // Golden ratio concentric sacred/Nosso Lar rings
    float ringWave = smoothstep(0.06, 0.0, abs(fract(dist * 0.45) - 0.5)) * 0.45;
    float pulse = 0.72 + 0.28 * sin(dist * 1.4 - uTime * 1.8);

    vec3 cyan = vec3(0.18, 0.88, 0.98);
    vec3 gold = vec3(0.96, 0.72, 0.26);

    vec3 col = cyan * (minorGrid * 0.22 + majorLine * 0.52) * pulse;
    col += gold * ringWave * (0.55 + 0.45 * uCoherence);

    float alpha = clamp((minorGrid * 0.28 + majorLine * 0.58 + ringWave * 0.6) * fade, 0.0, 0.85);
    gl_FragColor = vec4(col, alpha);
  }
`

export function LuminousGridShader({ coherence }: { coherence: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCoherence: { value: Number.isFinite(coherence) ? coherence : 0.5 },
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime()
      matRef.current.uniforms.uCoherence.value = Number.isFinite(coherence) ? coherence : 0.5
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.65, 0]}>
      <planeGeometry args={[26, 26, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

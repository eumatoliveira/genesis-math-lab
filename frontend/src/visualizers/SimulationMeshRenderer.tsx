import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { SimulationFrame } from '../domain/types'

interface Props {
  frame: SimulationFrame
  showSurface: boolean
  showWireframe: boolean
  showParticles: boolean
}

function ensureFiniteFloat32(arr: Float32Array, bound = 100, minBound = -bound): Float32Array {
  for (let i = 0; i < arr.length; i++) {
    if (!Number.isFinite(arr[i]) || arr[i] < minBound || arr[i] > bound) {
      const clean = new Float32Array(arr.length)
      for (let j = 0; j < arr.length; j++) {
        const v = arr[j]
        clean[j] = Number.isFinite(v) ? Math.max(minBound, Math.min(bound, v)) : 0
      }
      return clean
    }
  }
  return arr
}

function sanitizeTuple(pos: [number, number, number], bound = 100): [number, number, number] {
  const s = (v: number) => (Number.isFinite(v) ? Math.max(-bound, Math.min(bound, v)) : 0)
  return [s(pos[0]), s(pos[1]), s(pos[2])]
}

function buildGridIndices(cols: number, rows: number): Uint16Array | Uint32Array {
  const indices: number[] = []
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = r * cols + c
      const b = a + 1
      const d = a + cols
      const e = d + 1
      indices.push(a, d, b, b, d, e)
    }
  }
  return cols * rows > 65535 ? new Uint32Array(indices) : new Uint16Array(indices)
}

export function SimulationMeshRenderer({ frame, showSurface, showWireframe, showParticles }: Props) {
  const surfaceGeometry = useMemo(() => {
    if (!frame.surface) return null
    const cols = Math.trunc(frame.surface.cols)
    const rows = Math.trunc(frame.surface.rows)
    const { positions, colors } = frame.surface
    const vertFloats = cols * rows * 3
    if (cols < 2 || rows < 2 || positions.length < vertFloats || colors.length < vertFloats) {
      return null
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(ensureFiniteFloat32(positions.subarray(0, vertFloats)), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(ensureFiniteFloat32(colors.subarray(0, vertFloats), 1, 0), 3))
    const idx = buildGridIndices(cols, rows)
    geo.setIndex(new THREE.BufferAttribute(idx, 1))
    geo.computeVertexNormals()
    return geo
  }, [frame.surface])

  useEffect(() => {
    return () => {
      surfaceGeometry?.dispose()
    }
  }, [surfaceGeometry])

  const particleGeometry = useMemo(() => {
    if (!frame.particles || frame.particles.count <= 0) return null
    const usableFloats = Math.floor(Math.min(frame.particles.positions.length, frame.particles.colors.length) / 3) * 3
    if (usableFloats < 3) return null
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(ensureFiniteFloat32(frame.particles.positions.subarray(0, usableFloats)), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(ensureFiniteFloat32(frame.particles.colors.subarray(0, usableFloats), 1, 0), 3))
    return geo
  }, [frame.particles])

  useEffect(() => {
    return () => {
      particleGeometry?.dispose()
    }
  }, [particleGeometry])

  const lineObjects = useMemo(() => {
    if (!frame.curves) return []
    return frame.curves
      .filter((c) => c.points.length >= 6)
      .map((c) => {
        const usableFloats = Math.floor(c.points.length / 3) * 3
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(ensureFiniteFloat32(c.points.subarray(0, usableFloats)), 3))
        const rawOpacity = c.opacity ?? 0.9
        const mat = new THREE.LineBasicMaterial({
          color: c.color,
          transparent: true,
          opacity: Number.isFinite(rawOpacity) ? Math.max(0, Math.min(1, rawOpacity)) : 0.9,
        })
        return new THREE.Line(geo, mat)
      })
  }, [frame.curves])

  useEffect(() => {
    return () => {
      for (const line of lineObjects) {
        line.geometry.dispose()
        ;(line.material as THREE.Material).dispose()
      }
    }
  }, [lineObjects])

  return (
    <group>
      {surfaceGeometry && showSurface && (
        <mesh geometry={surfaceGeometry}>
          <meshStandardMaterial
            vertexColors
            side={THREE.DoubleSide}
            transparent
            opacity={frame.surface?.solidOpacity ?? 0.72}
            roughness={0.35}
            metalness={0.22}
          />
        </mesh>
      )}

      {surfaceGeometry && showWireframe && (
        <mesh geometry={surfaceGeometry} position={[0, 0.004, 0]}>
          <meshBasicMaterial
            color="#38e8ff"
            wireframe
            transparent
            opacity={frame.surface?.wireframeOpacity ?? 0.45}
          />
        </mesh>
      )}

      {particleGeometry && showParticles && (
        <points geometry={particleGeometry}>
          <pointsMaterial size={0.14} vertexColors transparent opacity={0.92} sizeAttenuation />
        </points>
      )}

      {lineObjects.map((lineObj, idx) => (
        <primitive key={idx} object={lineObj} dispose={null} />
      ))}

      {frame.markers?.map((m, idx) => (
        <mesh key={idx} position={sanitizeTuple(m.position)}>
          <sphereGeometry args={[Number.isFinite(m.radius) && m.radius > 0 ? m.radius : 0.14, 16, 16]} />
          <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={m.pulse ? 1.4 : 0.75} />
        </mesh>
      ))}
    </group>
  )
}

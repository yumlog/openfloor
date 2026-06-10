import { Fragment, memo, Suspense, useMemo, useRef } from 'react'
import { motion, type MotionValue } from 'motion/react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  useGLTF,
} from '@react-three/drei'
import * as THREE from 'three'

interface CentralCrystalProps {
  /** 기본(slide-0) 박스 변의 px 길이; App이 프레임에 맞춰 스케일. */
  size: number
  scale: MotionValue<number>
  x: MotionValue<number>
  y: MotionValue<number>
  opacity: MotionValue<number>
  /** 저사양(모바일): 샘플/해상도/후처리를 낮춘다. */
  lowSpec: boolean
  /** 화면에 보일 때만 렌더(frameloop). 안 보이면 정지해 성능을 아낀다. */
  visible: boolean
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

/* 프레넬 림: 시선과 면이 스칠수록 밝아지는 가산 발광 셸. */
const fresnelVertex = `
  varying vec3 vNormal; varying vec3 vView;
  void main(){ vec4 wp=modelMatrix*vec4(position,1.0);
    vNormal=normalize(mat3(modelMatrix)*normal); vView=normalize(cameraPosition-wp.xyz);
    gl_Position=projectionMatrix*viewMatrix*wp; }`

const fresnelFragment = `
  varying vec3 vNormal; varying vec3 vView; uniform vec3 uColor; uniform float uPower; uniform float uIntensity;
  void main(){ float f=pow(1.0-clamp(dot(normalize(vNormal),normalize(vView)),0.0,1.0),uPower);
    gl_FragColor=vec4(uColor*f*uIntensity,f); }`

function CrystalModel({ lowSpec }: { lowSpec: boolean }) {
  const { scene } = useGLTF('/crystal.glb')
  const size = useThree((s) => s.size)
  // 외곽 그룹: 부유(y) + 미세 기울임(x/z) + 반응형 스케일.
  const groupRef = useRef<THREE.Group>(null)
  // 내부 그룹: y축 자동 회전(원점 정렬된 지오메트리를 중심으로 돈다).
  const spinRef = useRef<THREE.Group>(null)

  // 멀티 메시 대응: scene을 순회해 모든 mesh geometry를 모은다.
  const geometries = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh && mesh.geometry) {
        // 매끈한 셰이딩을 위해 부드러운 노멀이 필요 — 없으면 계산.
        if (!mesh.geometry.getAttribute('normal'))
          mesh.geometry.computeVertexNormals()
        geos.push(mesh.geometry)
      }
    })
    return geos
  }, [scene])

  // 모든 지오메트리의 합 바운딩박스로 중심(원점 정렬 오프셋)과 정규화 스케일을 구한다.
  const { offset, baseScale } = useMemo(() => {
    const box = new THREE.Box3()
    geometries.forEach((g) => {
      g.computeBoundingBox()
      if (g.boundingBox) box.union(g.boundingBox)
    })
    const center = new THREE.Vector3()
    const dim = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(dim)
    const maxDim = Math.max(dim.x, dim.y, dim.z) || 1
    // 알 수 없는 GLB 크기를 일정한 화면 크기로 정규화한다.
    return { offset: center, baseScale: 3.4 / maxDim }
  }, [geometries])

  // 반응형 스케일: 좁은 화면에서 비례 축소(floor 0.6, ceil 1.1).
  const responsiveScale = baseScale * clamp(size.width / 1440, 0.6, 1.1)

  // 저사양은 samples/resolution만 낮춘다.
  const crystalProps = useMemo(
    () => ({
      // 가장 큰 성능 레버: 투과 버퍼 샘플/해상도. 일렁임/색수차를 줄였으니
      // 적은 샘플로도 매끈하다.
      samples: lowSpec ? 2 : 2,
      resolution: lowSpec ? 256 : 384,
      transmission: 1,
      thickness: 0.5,
      ior: 1.5,
      roughness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      // 모서리 색 노이즈(자글) 제거.
      chromaticAberration: 0,
      anisotropy: 0.1,
      // 굴절 일렁임/노이즈 전부 끔 → 매끈한 유리.
      distortion: 0,
      distortionScale: 0,
      temporalDistortion: 0,
      // 회전 시 어른거리는 색막 제거 → 깨끗한 유리.
      iridescence: 0,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 400] as [number, number],
      color: '#ffffff',
      // 은은한 쿨 틴트(크리스탈 느낌) — 불투명 아님.
      attenuationColor: '#cfeeff',
      attenuationDistance: 12,
      // 페이지(#171717)에서 한 단계만 밝은 쿨다크 → 몸통이 살짝 밝아져 하얗게
      // 보이되 여전히 반투명/비치는 느낌 유지(하얘짐 메인 다이얼). 더 하얗게는
      // 한 단계씩만 ↑(#2f3641 → #3a4250 …); 너무 밝히면 다시 불투명해진다.
      background: new THREE.Color('#575D64'),
    }),
    [lowSpec]
  )

  const fresnelUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#ffffff') },
      // uPower를 낮추면 글로우가 가장자리→면 안쪽까지 넓게 퍼져 전체가 하얗게 빛난다.
      uPower: { value: 1.6 },
      uIntensity: { value: 1.4 },
    }),
    []
  )

  // 자동 모션만: 부유 + 회전(레이캐스트/호버/파편 없음).
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.12
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.12
      groupRef.current.rotation.z = Math.cos(t * 0.23) * 0.08
    }
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.12
  })

  return (
    <group ref={groupRef} scale={responsiveScale}>
      <group ref={spinRef}>
        <group position={[-offset.x, -offset.y, -offset.z]}>
          {geometries.map((geo, i) => (
            <Fragment key={i}>
              {/* 본체: 유리 투과 질감. */}
              <mesh geometry={geo}>
                <MeshTransmissionMaterial {...crystalProps} />
              </mesh>
              {/* 림: 살짝 부풀린 프레넬 가산 셸. */}
              <mesh geometry={geo} scale={1.015}>
                <shaderMaterial
                  vertexShader={fresnelVertex}
                  fragmentShader={fresnelFragment}
                  uniforms={fresnelUniforms}
                  transparent
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  toneMapped={false}
                />
              </mesh>
            </Fragment>
          ))}
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/crystal.glb')

/**
 * Canvas 내부 씬(조명 + 환경 + 크리스탈). React.memo로 감싸 frameloop/visible
 * 토글로 Canvas가 리렌더돼도 씬이 재실행·환경맵 재베이크되지 않게 한다 —
 * 재개 시 로딩 스파이크를 막는 핵심.
 */
const Scene = memo(function Scene({ lowSpec }: { lowSpec: boolean }) {
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#dcefff" />
      <Environment environmentIntensity={3.0} resolution={lowSpec ? 128 : 256}>
        <Lightformer
          intensity={5}
          color="#cfeaff"
          position={[0, 3, 4]}
          scale={[6, 6, 1]}
        />
        <Lightformer
          intensity={2.5}
          color="#3a7bd5"
          position={[-4, -1, 3]}
          scale={[5, 5, 1]}
        />
        <Lightformer
          intensity={4}
          color="#ffffff"
          position={[4, 1, -2]}
          scale={[3, 3, 1]}
        />
        <Lightformer
          intensity={2}
          color="#1a3a7a"
          position={[0, -4, 2]}
          scale={[8, 4, 1]}
        />
        <Lightformer
          intensity={20}
          color="#ffffff"
          position={[2, 3, 3]}
          scale={[0.4, 0.4, 1]}
        />
        <Lightformer
          intensity={15}
          color="#dff1ff"
          position={[-3, 2, 2]}
          scale={[0.35, 0.35, 1]}
        />
        <Lightformer
          intensity={17}
          color="#ffffff"
          position={[3, -2, 3]}
          scale={[0.35, 0.35, 1]}
        />
        <Lightformer
          intensity={14}
          color="#bfe6ff"
          position={[-2, -2, 3]}
          scale={[0.3, 0.3, 1]}
        />
        {/* 추가 작은 점광 — 회전하며 표면에 글린트가 여러 번 잡히게. */}
        <Lightformer
          intensity={20}
          color="#ffffff"
          position={[-1, 4, 2]}
          scale={[0.32, 0.32, 1]}
        />
        <Lightformer
          intensity={18}
          color="#dff1ff"
          position={[1, -3, 4]}
          scale={[0.3, 0.3, 1]}
        />
        <Lightformer
          intensity={22}
          color="#ffffff"
          position={[4, -1, 2]}
          scale={[0.35, 0.35, 1]}
        />
        <Lightformer
          intensity={16}
          color="#dff1ff"
          position={[-4, 3, -1]}
          scale={[0.3, 0.3, 1]}
        />
        {/* 더 흩뿌린 작은 점광 — 회전 시 글린트 빈도 ↑. */}
        <Lightformer
          intensity={21}
          color="#ffffff"
          position={[0, -4, 3]}
          scale={[0.3, 0.3, 1]}
        />
        <Lightformer
          intensity={18}
          color="#ffffff"
          position={[-3, -3, 2]}
          scale={[0.3, 0.3, 1]}
        />
        <Lightformer
          intensity={19}
          color="#ffffff"
          position={[3, 4, -2]}
          scale={[0.3, 0.3, 1]}
        />
      </Environment>
      <Suspense fallback={null}>
        <CrystalModel lowSpec={lowSpec} />
      </Suspense>
    </>
  )
})

/**
 * hero -> about 중심 크리스탈. 바깥 래퍼/스크롤 안무(scale/x/y/opacity)는 예전
 * CentralVideo 구조 그대로 — <video> 자리에 알파 Canvas를 둔다(블렌드 모드 없음).
 *
 * `visible`이 false면 frameloop를 멈춰(렌더 정지) 화면 밖에서 GPU를 아낀다.
 */
export function CentralCrystal({
  size,
  scale,
  x,
  y,
  opacity,
  lowSpec,
  visible,
}: CentralCrystalProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div style={{ opacity, width: size, height: size }}>
        <motion.div className="h-full w-full" style={{ scale, x, y }}>
          <Canvas
            className="h-full w-full"
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 0, 6], fov: 35 }}
            dpr={lowSpec ? [1, 1] : [1, 1.25]}
            frameloop={visible ? 'always' : 'never'}
            onCreated={({ gl }) => {
              // 노출을 살짝만 올린다 — 몸통을 채우지 않고 반사/하이라이트만 밝게.
              gl.toneMappingExposure = 1.4
            }}
          >
            <Scene lowSpec={lowSpec} />
          </Canvas>
        </motion.div>
      </motion.div>
    </div>
  )
}

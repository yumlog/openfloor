import { Fragment, memo, Suspense, useEffect, useMemo, useRef } from 'react'
import { motion, type MotionValue } from 'motion/react'
import { Canvas, useFrame } from '@react-three/fiber'
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

const MAX_TILT = 0.22 // 최대 기울기(rad ≈ 12.6°). "살짝".
const TILT_SMOOTH = 4 // 커서를 따라오는 부드러움(클수록 빠르게 붙음).

function CrystalModel({ lowSpec }: { lowSpec: boolean }) {
  const { scene } = useGLTF('/models/crystal.glb')
  // 외곽 그룹: 부유(y) + 정규화 스케일.
  const groupRef = useRef<THREE.Group>(null)
  // 내부 그룹: 커서 방향 틸트(X·Y, 원점 정렬된 지오메트리를 중심으로 기운다).
  const spinRef = useRef<THREE.Group>(null)

  // 정규화 커서(-1..1, 뷰포트 중심 기준). 캔버스가 pointer-events-none이라
  // R3F state.pointer 대신 window에서 직접 추적한다.
  const pointerRef = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

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
    // 알 수 없는 GLB 크기를 일정한 화면 크기로 정규화한다(크기 다이얼).
    return { offset: center, baseScale: 2.7 / maxDim }
  }, [geometries])

  // 박스(videoSize)만으로 크기가 정해지도록 캔버스 폭 기반 추가 축소는 제거.
  const responsiveScale = baseScale

  // 저사양은 samples/resolution만 낮춘다.
  const crystalProps = useMemo(
    () => ({
      // 가장 큰 성능 레버: 투과 버퍼 샘플/해상도. 굴절/색수차가 있으니 매끈하게
      // 보이려면 약간 ↑.
      samples: lowSpec ? 2 : 3,
      resolution: lowSpec ? 256 : 512,
      transmission: 1,
      thickness: 0.5,
      ior: 1.5,
      roughness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      // 모서리 미세 무지개 — 가벼움.
      chromaticAberration: 0.05,
      anisotropy: 0,
      // 굴절 일렁임은 가장 무거운 노이즈 — 끈 채 유지.
      distortion: 0,
      distortionScale: 0.4,
      temporalDistortion: 0,
      // 회전 시 은은한 색막 시머 — 가벼움.
      iridescence: 0.5,
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

  // 자동 회전 제거 → 부유(y) + 커서 방향 살짝 틸트(X·Y).
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.12 // 부유 유지
    }
    if (spinRef.current) {
      const p = pointerRef.current
      const targetY = p.x * MAX_TILT
      const targetX = -p.y * MAX_TILT // 커서 상하 → X축 틸트(반전이면 부호 제거)
      const k = 1 - Math.exp(-TILT_SMOOTH * delta) // 프레임레이트 독립 댐핑
      spinRef.current.rotation.y = THREE.MathUtils.lerp(
        spinRef.current.rotation.y,
        targetY,
        k
      )
      spinRef.current.rotation.x = THREE.MathUtils.lerp(
        spinRef.current.rotation.x,
        targetX,
        k
      )
    }
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

useGLTF.preload('/models/crystal.glb')

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
        <motion.div
          className="h-full w-full mix-blend-plus-lighter"
          style={{ scale, x, y }}
        >
          <Canvas
            className="h-full w-full"
            resize={{ offsetSize: true }}
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 0, 6], fov: 35 }}
            dpr={[1, 1]}
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

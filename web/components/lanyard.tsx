/* eslint-disable react/no-unknown-property */
"use client"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Canvas, extend, useFrame, type ThreeElement, type ThreeEvent } from "@react-three/fiber"
import { useGLTF, useTexture, Environment, Html, Lightformer } from "@react-three/drei"
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from "@react-three/rapier"
import { MeshLineGeometry, MeshLineMaterial } from "meshline"
import * as THREE from "three"

// Assets served from public/ (Next.js) instead of Vite-style imports
const cardGLB = "/lanyard/card.glb"
const lanyard = "/lanyard/lanyard.svg"

extend({ MeshLineGeometry, MeshLineMaterial })

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>
  }
}

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 }
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 }

interface LanyardProps {
  position?: [number, number, number]
  gravity?: [number, number, number]
  fov?: number
  transparent?: boolean
  frontImage?: string | null
  backImage?: string | null
  imageFit?: "cover" | "contain"
  lanyardImage?: string | null
  lanyardWidth?: number
  /** 명찰 앞면의 이름/회사명 텍스트를 실시간으로 덮어쓴다 (빈 값이면 원본 이미지 그대로) */
  badgeName?: string
  badgeCompany?: string
  /** 캔버스 컨테이너가 pointer-events-none일 때, 이 id의 요소에서 포인터 이벤트를 받아 카드 드래그를 처리한다 */
  eventSourceId?: string
  /** 카드 바로 아래에 붙일 HTML 컨트롤 */
  cardControls?: ReactNode
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 1,
  badgeName = "",
  badgeCompany = "",
  eventSourceId,
  cardControls,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== "undefined" && window.innerWidth < 768)
  const [eventSource, setEventSource] = useState<HTMLElement | undefined>(undefined)

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (eventSourceId) setEventSource(document.getElementById(eventSourceId) ?? undefined)
  }, [eventSourceId])

  return (
    <div className="relative z-0 flex h-full w-full origin-center transform scale-100 items-center justify-center">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        eventSource={eventSource}
        eventPrefix="client"
        onCreated={({ gl, camera }) => {
          // R3F가 카메라를 원점으로 lookAt시켜 x 오프셋이 상쇄되는 것을 방지 — 정면을 보게 고정
          camera.rotation.set(0, 0, 0)
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            badgeName={badgeName}
            badgeCompany={badgeCompany}
            cardControls={cardControls}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  )
}

interface BandProps {
  maxSpeed?: number
  minSpeed?: number
  isMobile?: boolean
  frontImage?: string | null
  backImage?: string | null
  imageFit?: "cover" | "contain"
  lanyardImage?: string | null
  lanyardWidth?: number
  badgeName?: string
  badgeCompany?: string
  cardControls?: ReactNode
}

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 1,
  badgeName = "",
  badgeCompany = "",
  cardControls,
}: BandProps) {
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!)
  const fixed = useRef<RapierRigidBody>(null!)
  const j1 = useRef<LanyardRigidBody>(null!)
  const j2 = useRef<LanyardRigidBody>(null!)
  const j3 = useRef<RapierRigidBody>(null!)
  const card = useRef<RapierRigidBody>(null!)

  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()

  const segmentProps: RigidBodyProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  }

  const getLerped = (body: LanyardRigidBody): THREE.Vector3 => {
    if (!body.lerped) {
      body.lerped = new THREE.Vector3().copy(body.translation())
    }

    return body.lerped
  }

  const { nodes, materials } = useGLTF(cardGLB) as any
  const cardBounds = useMemo(() => {
    const geometry = nodes.card.geometry as THREE.BufferGeometry
    geometry.computeBoundingBox()
    return geometry.boundingBox?.clone() ?? new THREE.Box3(new THREE.Vector3(-0.5, -0.5, 0), new THREE.Vector3(0.5, 0.5, 0))
  }, [nodes.card.geometry])
  const texture = useTexture(lanyardImage || lanyard)
  // useTexture accepts an array, so only the images actually supplied are
  // loaded. An empty array would suspend forever, so fall back to the band
  // texture (already cached) when no custom face image is given.
  const faceUrls = useMemo(() => [frontImage, backImage].filter(Boolean) as string[], [frontImage, backImage])
  const faceTextures = useTexture(faceUrls.length > 0 ? faceUrls : [lanyardImage || lanyard])
  const frontTex = frontImage ? faceTextures[0] : null
  const backTex = backImage ? faceTextures[frontImage ? 1 : 0] : null

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture
    if (!frontImage && !backImage) return baseMap

    const baseImg = baseMap.image as any
    const W = baseImg.width
    const H = baseImg.height
    const canvas = document.createElement("canvas")
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext("2d")
    if (!ctx) return baseMap
    // Keep the original baked atlas for the card edges and any untouched face.
    ctx.drawImage(baseImg, 0, 0, W, H)

    const drawFitted = (img: any, rect: typeof FRONT_UV_RECT) => {
      const rx = rect.x * W
      const ry = rect.y * H
      const rw = rect.w * W
      const rh = rect.h * H
      const pick = imageFit === "contain" ? Math.min : Math.max
      const scale = pick(rw / img.width, rh / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      const dx = rx + (rw - dw) / 2
      const dy = ry + (rh - dh) / 2
      ctx.save()
      ctx.beginPath()
      ctx.rect(rx, ry, rw, rh)
      ctx.clip()
      ctx.drawImage(img, dx, dy, dw, dh)
      ctx.restore()
      return { dx, dy, dw, dh }
    }

    let frontArea: { dx: number; dy: number; dw: number; dh: number } | null = null
    if (frontTex?.image) frontArea = drawFitted(frontTex.image, FRONT_UV_RECT)
    if (backTex?.image) drawFitted(backTex.image, BACK_UV_RECT)

    // 명찰 앞면 이름/회사명 실시간 덮어쓰기 — 원본 텍스트 영역을 흰색으로 가리고 새 텍스트를 그린다.
    // 아래 수치는 badge-front.png(1200x1800)에서 픽셀 측정한 값:
    //   이름 "홍 길 동" bbox: 중심 (0.4925, 0.7728), 글자 높이 0.0722H, 3글자 전체 폭 0.4717W
    //   회사명 bbox: 중심 (0.4917, 0.9139), 높이 0.0300H
    if (frontArea && (badgeName || badgeCompany)) {
      const { dx, dy, dw, dh } = frontArea
      const fontStack = 'Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif'

      // targetH(픽셀)에 글리프 실측 높이가 정확히 맞도록 폰트 크기를 보정한다.
      const fitSize = (text: string, weight: number, targetH: number) => {
        let size = targetH * 1.35
        ctx.font = `${weight} ${size}px ${fontStack}`
        const m = ctx.measureText(text)
        const gh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
        if (gh > 0) size *= targetH / gh
        return size
      }
      // 글리프 bbox의 세로 중심이 cy에 오도록 그린다.
      const drawCentered = (text: string, weight: number, size: number, cx: number, cy: number, gap = 0) => {
        ctx.font = `${weight} ${size}px ${fontStack}`
        ctx.textAlign = "left"
        ctx.textBaseline = "alphabetic"
        const m = ctx.measureText(text)
        const yOff = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2
        const chars = gap > 0 ? text.split("") : [text]
        const widths = chars.map(c => ctx.measureText(c).width)
        const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1)
        let x = cx - total / 2
        chars.forEach((c, i) => {
          ctx.fillText(c, x, cy + yOff)
          x += widths[i] + gap
        })
      }

      ctx.save()
      if (badgeName) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(dx, dy + dh * 0.72, dw, dh * 0.105)
        ctx.fillStyle = "#111111"
        const clean = badgeName.trim()
        const size = fitSize(clean.replace(/\s+/g, ""), 700, dh * 0.0722)
        ctx.font = `700 ${size}px ${fontStack}`
        // 자간: 원본 3글자 전체 폭(0.4717W)에 맞춘 글자 사이 간격을 글자 수와 무관하게 재사용
        const isKorean = /^[가-힣]+$/.test(clean)
        let gap = 0
        if (isKorean && clean.length >= 2 && clean.length <= 4) {
          const adv = ctx.measureText(clean).width / clean.length
          gap = Math.max(0, (dw * 0.4717 - 3 * adv) / 2)
        }
        drawCentered(isKorean ? clean : clean, 700, size, dx + dw * 0.4925, dy + dh * 0.7728, gap)
      }
      if (badgeCompany) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(dx, dy + dh * 0.888, dw, dh * 0.056)
        ctx.fillStyle = "#111111"
        const clean = badgeCompany.trim()
        const size = fitSize(clean, 400, dh * 0.03)
        drawCentered(clean, 400, size, dx + dw * 0.4917, dy + dh * 0.9139)
      }
      ctx.restore()
    }

    const composite = new THREE.CanvasTexture(canvas)
    composite.colorSpace = THREE.SRGBColorSpace
    composite.flipY = baseMap.flipY
    composite.anisotropy = 16
    composite.needsUpdate = true
    return composite
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map, badgeName, badgeCompany])
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]),
  )
  const [dragged, drag] = useState<false | THREE.Vector3>(false)
  const [hovered, hover] = useState(false)

  const bandResolution = useMemo(
    () => new THREE.Vector2(...(isMobile ? [1000, 2000] : [1000, 1000])),
    [isMobile],
  )

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab"
      return () => {
        document.body.style.cursor = "auto"
      }
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== "boolean") {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      })
    }
    if (fixed.current) {
      ;[j1, j2].forEach(ref => {
        const lerped = getLerped(ref.current)
        const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(ref.current.translation())))
        lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
      })
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(getLerped(j2.current))
      curve.points[2].copy(getLerped(j1.current))
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32))
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true)
    }
  })

  curve.curveType = "chordal"
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              ;(e.target as Element).releasePointerCapture(e.pointerId)
              drag(false)
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              ;(e.target as Element).setPointerCapture(e.pointerId)
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
            {cardControls && (
              <Html
                center
                occlude={false}
                position={[
                  (cardBounds.min.x + cardBounds.max.x) / 2,
                  cardBounds.min.y - 0.34,
                  cardBounds.max.z + 0.08,
                ]}
                wrapperClass="pointer-events-auto"
                zIndexRange={[30, 0]}
              >
                <div className="pointer-events-auto w-72">{cardControls}</div>
              </Html>
            )}
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[{ resolution: bandResolution }]}
          color="white"
          depthTest={false}
          resolution={bandResolution}
          useMap={1}
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  )
}

useGLTF.preload(cardGLB)

"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface SphericalPosition {
  theta: number
  phi: number
  radius: number
}

export interface WorldPosition extends Position3D {
  scale: number
  zIndex: number
  isVisible: boolean
  fadeOpacity: number
  originalIndex: number
}

export interface ImageData {
  id: string
  src: string
  alt: string
  title?: string
  description?: string
}

export interface SphereImageGridProps {
  images?: ImageData[]
  containerSize?: number
  sphereRadius?: number
  centerOffsetX?: number
  centerOffsetY?: number
  dragSensitivity?: number
  momentumDecay?: number
  maxRotationSpeed?: number
  baseImageScale?: number
  hoverScale?: number
  perspective?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
  className?: string
}

interface RotationState {
  x: number
  y: number
  z: number
}

interface VelocityState {
  x: number
  y: number
}

interface MousePosition {
  x: number
  y: number
}

const SPHERE_MATH = {
  degreesToRadians: (degrees: number): number => degrees * (Math.PI / 180),

  sphericalToCartesian: (radius: number, theta: number, phi: number): Position3D => ({
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  }),

  calculateDistance: (pos: Position3D, center: Position3D = { x: 0, y: 0, z: 0 }): number => {
    const dx = pos.x - center.x
    const dy = pos.y - center.y
    const dz = pos.z - center.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  },

  normalizeAngle: (angle: number): number => {
    while (angle > 180) angle -= 360
    while (angle < -180) angle += 360
    return angle
  },
}

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const SphereImageGrid: React.FC<SphereImageGridProps> = ({
  images = [],
  containerSize = 400,
  sphereRadius = 200,
  centerOffsetX = 0,
  centerOffsetY = 0,
  dragSensitivity = 0.5,
  momentumDecay = 0.95,
  maxRotationSpeed = 5,
  baseImageScale = 0.12,
  hoverScale = 1.2,
  perspective = 1000,
  autoRotate = false,
  autoRotateSpeed = 0.3,
  className = "",
}) => {
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [rotation, setRotation] = useState<RotationState>({ x: 15, y: 15, z: 0 })
  const [velocity, setVelocity] = useState<VelocityState>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [imagePositions, setImagePositions] = useState<SphericalPosition[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const lastMousePos = useRef<MousePosition>({ x: 0, y: 0 })
  const animationFrame = useRef<number | null>(null)

  const actualSphereRadius = sphereRadius || containerSize * 0.5
  const baseImageSize = containerSize * baseImageScale
  const centerX = containerSize / 2 + centerOffsetX
  const centerY = containerSize / 2 + centerOffsetY

  const generateSpherePositions = useCallback((): SphericalPosition[] => {
    const positions: SphericalPosition[] = []
    const imageCount = images.length
    const isDenseSphere = imageCount > 120
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const angleIncrement = (2 * Math.PI) / goldenRatio

    for (let i = 0; i < imageCount; i++) {
      const denseJitter = isDenseSphere ? (seededRandom(i + 11) - 0.5) / imageCount : 0
      const t = imageCount > 1 ? Math.min(1, Math.max(0, i / (imageCount - 1) + denseJitter)) : 0.5
      const inclination = Math.acos(1 - 2 * t)
      const azimuth = angleIncrement * i

      let phi = inclination * (180 / Math.PI)
      let theta = (azimuth * (180 / Math.PI)) % 360

      if (isDenseSphere) {
        theta = (theta + (seededRandom(i + 37) - 0.5) * 96) % 360
        phi = Math.max(4, Math.min(176, phi + (seededRandom(i + 73) - 0.5) * 16))
      } else {
        const poleBonus = Math.pow(Math.abs(phi - 90) / 90, 0.6) * 35
        if (phi < 90) {
          phi = Math.max(5, phi - poleBonus)
        } else {
          phi = Math.min(175, phi + poleBonus)
        }

        phi = 15 + (phi / 180) * 150

        const randomOffset = (Math.random() - 0.5) * 20
        theta = (theta + randomOffset) % 360
        phi = Math.max(0, Math.min(180, phi + (Math.random() - 0.5) * 10))
      }

      positions.push({
        theta,
        phi,
        radius: isDenseSphere ? actualSphereRadius * (0.72 + seededRandom(i + 109) * 0.36) : actualSphereRadius,
      })
    }

    return positions
  }, [images.length, actualSphereRadius])

  const calculateWorldPositions = useCallback((): WorldPosition[] => {
    const isDenseSphere = imagePositions.length > 120

    const positions = imagePositions.map((pos, index) => {
      const thetaRad = SPHERE_MATH.degreesToRadians(pos.theta)
      const phiRad = SPHERE_MATH.degreesToRadians(pos.phi)
      const rotXRad = SPHERE_MATH.degreesToRadians(rotation.x)
      const rotYRad = SPHERE_MATH.degreesToRadians(rotation.y)

      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad)
      let y = pos.radius * Math.cos(phiRad)
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad)

      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad)
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad)
      x = x1
      z = z1

      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad)
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad)
      y = y2
      z = z2

      const worldPos: Position3D = { x, y, z }
      const fadeZoneStart = -10
      const fadeZoneEnd = -30
      const isVisible = worldPos.z > fadeZoneEnd

      let fadeOpacity = 1
      if (worldPos.z <= fadeZoneStart) {
        fadeOpacity = Math.max(0, (worldPos.z - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd))
      }

      const isPoleImage = pos.phi < 30 || pos.phi > 150
      const distanceFromCenter = Math.sqrt(worldPos.x * worldPos.x + worldPos.y * worldPos.y)
      const maxDistance = actualSphereRadius
      const distanceRatio = Math.min(distanceFromCenter / maxDistance, 1)
      const distancePenalty = isPoleImage ? 0.4 : isDenseSphere ? 0.95 : 0.7
      const centerScale = Math.max(isDenseSphere ? 0.18 : 0.3, 1 - distanceRatio * distancePenalty)
      const depthScale = (worldPos.z + actualSphereRadius) / (2 * actualSphereRadius)
      const depthSize = isDenseSphere ? 0.28 + depthScale * 0.95 : Math.max(0.5, 0.8 + depthScale * 0.3)
      const organicSize = isDenseSphere ? 0.82 + (index % 11) * 0.025 : 1
      const scale = centerScale * depthSize * organicSize

      if (isDenseSphere) {
        fadeOpacity *= Math.max(0.36, 0.48 + depthScale * 0.52)
      }

      return {
        ...worldPos,
        scale,
        zIndex: Math.round(1000 + worldPos.z),
        isVisible,
        fadeOpacity,
        originalIndex: index,
      }
    })

    if (positions.length > 120) {
      return positions
    }

    const adjustedPositions = [...positions]

    for (let i = 0; i < adjustedPositions.length; i++) {
      const pos = adjustedPositions[i]
      if (!pos.isVisible) continue

      let adjustedScale = pos.scale
      const imageSize = baseImageSize * adjustedScale

      for (let j = 0; j < adjustedPositions.length; j++) {
        if (i === j) continue

        const other = adjustedPositions[j]
        if (!other.isVisible) continue

        const otherSize = baseImageSize * other.scale
        const dx = pos.x - other.x
        const dy = pos.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = (imageSize + otherSize) / 2 + 25

        if (distance < minDistance && distance > 0) {
          const overlap = minDistance - distance
          const reductionFactor = Math.max(0.4, 1 - (overlap / minDistance) * 0.6)
          adjustedScale = Math.min(adjustedScale, adjustedScale * reductionFactor)
        }
      }

      adjustedPositions[i] = {
        ...pos,
        scale: Math.max(0.25, adjustedScale),
      }
    }

    return adjustedPositions
  }, [imagePositions, rotation, actualSphereRadius, baseImageSize])

  const clampRotationSpeed = useCallback(
    (speed: number): number => Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, speed)),
    [maxRotationSpeed]
  )

  const updateMomentum = useCallback(() => {
    if (isDragging) return

    setVelocity(prev => {
      const newVelocity = {
        x: prev.x * momentumDecay,
        y: prev.y * momentumDecay,
      }

      if (!autoRotate && Math.abs(newVelocity.x) < 0.01 && Math.abs(newVelocity.y) < 0.01) {
        return { x: 0, y: 0 }
      }

      return newVelocity
    })

    setRotation(prev => {
      let newY = prev.y

      if (autoRotate) {
        newY += autoRotateSpeed
      }

      newY += clampRotationSpeed(velocity.y)

      return {
        x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(velocity.x)),
        y: SPHERE_MATH.normalizeAngle(newY),
        z: prev.z,
      }
    })
  }, [isDragging, momentumDecay, velocity, clampRotationSpeed, autoRotate, autoRotateSpeed])

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setIsDragging(true)
    setVelocity({ x: 0, y: 0 })
    lastMousePos.current = { x: event.clientX, y: event.clientY }
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return

      const deltaX = event.clientX - lastMousePos.current.x
      const deltaY = event.clientY - lastMousePos.current.y

      const rotationDelta = {
        x: -deltaY * dragSensitivity,
        y: deltaX * dragSensitivity,
      }

      setRotation(prev => ({
        x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
        y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
        z: prev.z,
      }))

      setVelocity({
        x: clampRotationSpeed(rotationDelta.x),
        y: clampRotationSpeed(rotationDelta.y),
      })

      lastMousePos.current = { x: event.clientX, y: event.clientY }
    },
    [isDragging, dragSensitivity, clampRotationSpeed]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
    const touch = event.touches[0]
    setIsDragging(true)
    setVelocity({ x: 0, y: 0 })
    lastMousePos.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!isDragging) return
      event.preventDefault()

      const touch = event.touches[0]
      const deltaX = touch.clientX - lastMousePos.current.x
      const deltaY = touch.clientY - lastMousePos.current.y

      const rotationDelta = {
        x: -deltaY * dragSensitivity,
        y: deltaX * dragSensitivity,
      }

      setRotation(prev => ({
        x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
        y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
        z: prev.z,
      }))

      setVelocity({
        x: clampRotationSpeed(rotationDelta.x),
        y: clampRotationSpeed(rotationDelta.y),
      })

      lastMousePos.current = { x: touch.clientX, y: touch.clientY }
    },
    [isDragging, dragSensitivity, clampRotationSpeed]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setImagePositions(generateSpherePositions())
  }, [generateSpherePositions])

  useEffect(() => {
    const animate = () => {
      updateMomentum()
      animationFrame.current = requestAnimationFrame(animate)
    }

    if (isMounted) {
      animationFrame.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [isMounted, updateMomentum])

  useEffect(() => {
    if (!isMounted) return
    if (!containerRef.current) return

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMounted, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const worldPositions = calculateWorldPositions()
  const isDenseSphere = images.length > 120

  const renderImageNode = useCallback(
    (image: ImageData, index: number) => {
      const position = worldPositions[index]

      if (!position || !position.isVisible) return null

      const imageSize = baseImageSize * position.scale
      const isHovered = hoveredIndex === index
      const finalScale = isHovered ? Math.min(hoverScale, hoverScale / position.scale) : 1

      return (
        <div
          key={image.id}
          className="absolute cursor-pointer select-none transition-transform duration-200 ease-out will-change-transform"
          style={{
            width: `${imageSize}px`,
            height: `${imageSize}px`,
            left: `${centerX + position.x}px`,
            top: `${centerY + position.y}px`,
            opacity: position.fadeOpacity,
            transform: `translate(-50%, -50%) scale(${finalScale})`,
            zIndex: position.zIndex,
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setSelectedImage(image)}
        >
          <div
            className={`relative h-full w-full overflow-hidden rounded-full ${
              isDenseSphere ? "border border-cyan-100/45 shadow-[0_0_8px_rgba(34,211,238,0.22)]" : "border-2 border-cyan-100/65 shadow-[0_0_16px_rgba(34,211,238,0.38),0_10px_28px_rgba(0,0,0,0.22)]"
            }`}
          >
            <span
              className={`pointer-events-none absolute inset-0 rounded-full ${
                isDenseSphere ? "ring-1 ring-white/25" : "ring-1 ring-white/45 shadow-[inset_0_0_14px_rgba(255,255,255,0.24)]"
              }`}
            />
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover"
              draggable={false}
              loading={index < 3 ? "eager" : "lazy"}
            />
          </div>
        </div>
      )
    },
    [worldPositions, baseImageSize, centerX, centerY, hoveredIndex, hoverScale, isDenseSphere]
  )

  const renderSpotlightModal = () => {
    if (!selectedImage || typeof document === "undefined") return null

    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4"
        onClick={() => setSelectedImage(null)}
        style={{
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        <div
          className="w-full max-w-md overflow-hidden rounded-xl bg-white text-zinc-950"
          onClick={event => event.stopPropagation()}
          style={{
            animation: "scaleIn 0.3s ease-out",
          }}
        >
          <div className="relative aspect-square">
            <img src={selectedImage.src} alt={selectedImage.alt} className="h-full w-full object-cover" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70"
            >
              <X size={16} />
            </button>
          </div>

          {(selectedImage.title || selectedImage.description) && (
            <div className="p-6">
              {selectedImage.title && <h3 className="mb-2 text-xl font-bold">{selectedImage.title}</h3>}
              {selectedImage.description && <p className="text-gray-600">{selectedImage.description}</p>}
            </div>
          )}
        </div>
      </div>,
      document.body
    )
  }

  if (!isMounted) {
    return (
      <div
        className="flex animate-pulse items-center justify-center rounded-lg bg-gray-100"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!images.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="text-center text-gray-400">
          <p>No images provided</p>
          <p className="text-sm">Add images to the images prop</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`relative select-none cursor-grab active:cursor-grabbing ${className}`}
        style={{
          width: containerSize,
          height: containerSize,
          perspective: `${perspective}px`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="relative h-full w-full" style={{ zIndex: 10 }}>
          {images.map((image, index) => renderImageNode(image, index))}
        </div>
      </div>

      {renderSpotlightModal()}
    </>
  )
}

export default SphereImageGrid

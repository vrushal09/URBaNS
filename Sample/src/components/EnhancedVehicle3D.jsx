import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VehicleModelFactory } from './VehicleModels'

// Enhanced Vehicle Component with realistic animations and physics
const EnhancedVehicle3D = ({ 
  position, 
  rotation, 
  type, 
  speed, 
  color, 
  isBraking = false,
  turnSignal = null // 'left', 'right', or null
}) => {
  const groupRef = useRef()
  const wheelRefs = useRef([])
  const headlightRefs = useRef([])
  const taillightRefs = useRef([])
  const turnSignalRefs = useRef([])
  
  const [vehicleModel, setVehicleModel] = useState(null)
  
  // Vehicle specifications for different types
  const vehicleSpecs = useMemo(() => {
    const specs = {
      car: {
        mass: 1500, // kg
        maxSpeed: 180, // km/h
        acceleration: 8, // m/s²
        brakeForce: 12, // m/s²
        wheelCount: 4,
        turnRadius: 5.5, // meters
        suspensionStiffness: 0.3
      },
      truck: {
        mass: 15000,
        maxSpeed: 90,
        acceleration: 3,
        brakeForce: 8,
        wheelCount: 8,
        turnRadius: 12,
        suspensionStiffness: 0.1
      },
      bus: {
        mass: 12000,
        maxSpeed: 80,
        acceleration: 2.5,
        brakeForce: 6,
        wheelCount: 6,
        turnRadius: 15,
        suspensionStiffness: 0.15
      },
      motorcycle: {
        mass: 200,
        maxSpeed: 200,
        acceleration: 15,
        brakeForce: 20,
        wheelCount: 2,
        turnRadius: 3,
        suspensionStiffness: 0.8
      }
    }
    return specs[type] || specs.car
  }, [type])

  // Initialize vehicle model
  useEffect(() => {
    try {
      const model = VehicleModelFactory.getVehicleModel(type)
      if (model) {
        if (color) {
          // Apply custom color to main body
          model.traverse(child => {
            if (child.isMesh && child.material && child.geometry.type === 'BoxGeometry') {
              child.material = child.material.clone()
              try {
                child.material.color.setHex(parseInt(color.replace('#', '0x')))
              } catch {
                child.material.color.set(color)
              }
            }
          })
        }
        setVehicleModel(model)
      }
    } catch (error) {
      console.warn('Error creating vehicle model:', error)
      // Create a simple fallback model
      const fallbackModel = new THREE.Group()
      const geometry = new THREE.BoxGeometry(4, 1.5, 1.8)
      const material = new THREE.MeshLambertMaterial({ color: color || '#4444ff' })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      fallbackModel.add(mesh)
      setVehicleModel(fallbackModel)
    }
  }, [type, color])

  // Simplified animation frame loop to prevent freezing
  useFrame((state, delta) => {
    if (!groupRef.current || !vehicleModel) return

    try {
      const currentTime = state.clock.elapsedTime
      const speedInMS = Math.max(0, (speed * 1000) / 3600) // Convert km/h to m/s
      
      // Simple wheel rotation based on speed
      if (wheelRefs.current.length > 0) {
        const wheelRotationSpeed = speedInMS / 0.4 // 0.4m wheel radius
        wheelRefs.current.forEach(wheel => {
          if (wheel && wheel.rotation) {
            wheel.rotation.x += wheelRotationSpeed * delta
          }
        })
      }

      // Simple suspension animation
      const suspensionOffset = Math.sin(currentTime * 4) * 0.02
      groupRef.current.position.y = position[1] + suspensionOffset

      // Update position
      groupRef.current.position.x = position[0]
      groupRef.current.position.z = position[2]
      
      // Simple lighting effects
      if (headlightRefs.current.length > 0) {
        headlightRefs.current.forEach(light => {
          if (light && light.material && light.material.emissive) {
            light.material.emissive.setScalar(0.3)
          }
        })
      }

    } catch (error) {
      console.warn('Animation error:', error)
    }
  })

  // Simplified model preparation
  const optimizedModel = useMemo(() => {
    if (!vehicleModel) return null

    try {
      const model = vehicleModel.clone()
      
      // Clear previous references
      wheelRefs.current = []
      headlightRefs.current = []
      taillightRefs.current = []
      turnSignalRefs.current = []

      // Simple traversal to collect wheel and light references
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Identify wheels (cylinders positioned low)
          if (child.geometry && child.geometry.type === 'CylinderGeometry' && 
              child.position.y < 1) {
            wheelRefs.current.push(child)
          }
          
          // Identify lights based on material color
          if (child.material && child.material.color) {
            const color = child.material.color.getHex()
            if (color === 0xffffaa || color === 0xffff88) {
              headlightRefs.current.push(child)
            }
          }
        }
      })

      return model
    } catch (error) {
      console.warn('Error optimizing model:', error)
      return vehicleModel
    }
  }, [vehicleModel])

  // Level of Detail (LOD) based on distance from camera
  const shouldShowDetails = useMemo(() => {
    const cameraDistance = Math.sqrt(
      position[0] * position[0] + 
      position[1] * position[1] + 
      position[2] * position[2]
    )
    return cameraDistance < 100 // Show details within 100 units
  }, [position])

  if (!optimizedModel) return null

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
      scale={shouldShowDetails ? [1, 1, 1] : [0.8, 0.8, 0.8]} // Slight LOD scaling
    >
      <primitive object={optimizedModel} />
      
      {/* Speed indicator - only show when close */}
      {shouldShowDetails && (
        <mesh position={[0, 4, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Performance indicators */}
      {speed > vehicleSpecs.maxSpeed * 0.9 && (
        <mesh position={[0, 3.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  )
}

export default EnhancedVehicle3D
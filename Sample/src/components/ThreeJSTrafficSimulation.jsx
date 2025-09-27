import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text, Box, Cylinder, Plane } from '@react-three/drei'
import * as THREE from 'three'

// Vehicle component with realistic 3D models and physics
const Vehicle3D = ({ position, rotation, type, speed, color }) => {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle vehicle movement animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 10) * 0.02
      
      // Exhaust effect for high speeds
      if (speed > 60) {
        meshRef.current.material.emissive.setHex(
          Math.sin(state.clock.elapsedTime * 5) > 0.8 ? 0x444444 : 0x000000
        )
      }
    }
  })

  const vehicleGeometry = useMemo(() => {
    switch (type) {
      case 'truck':
        return new THREE.BoxGeometry(3, 2.5, 8)
      case 'bus':
        return new THREE.BoxGeometry(2.5, 3, 12)
      case 'motorcycle':
        return new THREE.BoxGeometry(1, 1.5, 2.5)
      default: // car
        return new THREE.BoxGeometry(2, 1.8, 4.5)
    }
  }, [type])

  const vehicleColor = useMemo(() => {
    if (color) return color
    const colors = ['#ff4444', '#4444ff', '#44ff44', '#ffff44', '#ff44ff', '#44ffff', '#ffffff', '#888888']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [color])

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main vehicle body */}
      <mesh ref={meshRef} geometry={vehicleGeometry} castShadow>
        <meshLambertMaterial color={vehicleColor} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[0, 0, vehicleGeometry.parameters.depth / 2]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshBasicMaterial color="#ffffaa" />
      </mesh>
      <mesh position={[0.8, 0, vehicleGeometry.parameters.depth / 2]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshBasicMaterial color="#ffffaa" />
      </mesh>
      <mesh position={[-0.8, 0, vehicleGeometry.parameters.depth / 2]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshBasicMaterial color="#ffffaa" />
      </mesh>

      {/* Wheels */}
      {type === 'truck' || type === 'bus' ? (
        // Multiple axles for trucks/buses
        <>
          <Cylinder args={[0.6, 0.6, 0.3]} position={[1.2, -1, 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshLambertMaterial color="#333333" />
          </Cylinder>
          <Cylinder args={[0.6, 0.6, 0.3]} position={[-1.2, -1, 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshLambertMaterial color="#333333" />
          </Cylinder>
          <Cylinder args={[0.6, 0.6, 0.3]} position={[1.2, -1, -2]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshLambertMaterial color="#333333" />
          </Cylinder>
          <Cylinder args={[0.6, 0.6, 0.3]} position={[-1.2, -1, -2]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshLambertMaterial color="#333333" />
          </Cylinder>
        </>
      ) : (
        // Standard 4 wheels
        <>
          <Cylinder args={[0.5, 0.5, 0.3]} position={[1, -0.8, 1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshLambertMaterial color="#333333" />
          </Cylinder>
          <Cylinder args={[0.5, 0.5, 0.3]} position={[-1, -0.8, 1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshLambertMaterial color="#333333" />
          </Cylinder>
          <Cylinder args={[0.5, 0.5, 0.3]} position={[1, -0.8, -1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshLambertMaterial color="#333333" />
          </Cylinder>
          <Cylinder args={[0.5, 0.5, 0.3]} position={[-1, -0.8, -1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshLambertMaterial color="#333333" />
          </Cylinder>
        </>
      )}

      {/* Speed indicator */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`${Math.round(speed)} km/h`}
      </Text>
    </group>
  )
}

// Road segment with traffic
const RoadSegmentWithTraffic = ({ segment, index, position, vehicles }) => {
  const elevation = segment.elevation || 0
  const lanes = segment.lanes || 4
  const roadWidth = lanes * 3.5
  const segmentLength = 100

  const getRoadColor = () => {
    if (segment.type === 'overpass' || segment.hasBridge) return '#6366f1'
    if (segment.type === 'tunnel') return '#374151'
    return '#4a5568'
  }

  return (
    <group position={[position[0], elevation, position[2]]}>
      {/* Main Road Surface */}
      <Box
        args={[segmentLength, 1, roadWidth]}
        position={[0, 0.5, 0]}
        castShadow
        receiveShadow
      >
        <meshLambertMaterial color={getRoadColor()} />
      </Box>

      {/* Lane Markings */}
      {Array.from({ length: lanes - 1 }, (_, i) => (
        <Box
          key={`lane-${i}`}
          args={[segmentLength, 0.1, 0.2]}
          position={[0, 1.1, (i + 1) * (roadWidth / lanes) - roadWidth / 2]}
        >
          <meshBasicMaterial color="white" />
        </Box>
      ))}

      {/* Center Median */}
      {segment.hasMedian && (
        <Box
          args={[segmentLength, 1.5, 0.5]}
          position={[0, 1.25, 0]}
        >
          <meshLambertMaterial color="#10b981" />
        </Box>
      )}

      {/* Bridge Support Structures */}
      {(segment.type === 'overpass' || segment.hasBridge) && elevation > 0 && (
        <>
          {[
            [-segmentLength * 0.3, -roadWidth * 0.3],
            [segmentLength * 0.3, -roadWidth * 0.3],
            [-segmentLength * 0.3, roadWidth * 0.3],
            [segmentLength * 0.3, roadWidth * 0.3]
          ].map(([x, z], i) => (
            <Cylinder
              key={`pillar-${i}`}
              args={[2, 2, elevation]}
              position={[x, -elevation / 2, z]}
              castShadow
            >
              <meshLambertMaterial color="#9ca3af" />
            </Cylinder>
          ))}
        </>
      )}

      {/* Traffic Vehicles */}
      {vehicles
        .filter(vehicle => vehicle.segmentIndex === index)
        .map((vehicle, vehicleIndex) => {
          const laneOffset = (vehicle.lane - lanes / 2) * (roadWidth / lanes)
          const vehiclePosition = [
            position[0] + vehicle.position - segmentLength / 2,
            elevation + 2,
            position[2] + laneOffset
          ]
          
          return (
            <Vehicle3D
              key={`vehicle-${index}-${vehicleIndex}`}
              position={vehiclePosition}
              rotation={vehicle.rotation || 0}
              type={vehicle.type}
              speed={vehicle.speed}
              lane={vehicle.lane}
              color={vehicle.color}
            />
          )
        })}

      {/* Traffic Lights for city streets */}
      {segment.hasTrafficLights && (
        <>
          <group position={[segmentLength / 2, 6, roadWidth / 2 + 2]}>
            <Cylinder args={[0.2, 0.2, 8]} castShadow>
              <meshLambertMaterial color="#666666" />
            </Cylinder>
            <Box args={[1, 3, 0.5]} position={[0, 2, 0]}>
              <meshLambertMaterial color="#333333" />
            </Box>
            {/* Traffic light colors */}
            <mesh position={[0, 3, 0.3]}>
              <sphereGeometry args={[0.3]} />
              <meshBasicMaterial color="#ff4444" />
            </mesh>
            <mesh position={[0, 2.5, 0.3]}>
              <sphereGeometry args={[0.3]} />
              <meshBasicMaterial color="#ffff44" />
            </mesh>
            <mesh position={[0, 2, 0.3]}>
              <sphereGeometry args={[0.3]} />
              <meshBasicMaterial color="#44ff44" />
            </mesh>
          </group>
        </>
      )}
    </group>
  )
}

const ThreeJSTrafficSimulation = ({ roadData, isRunning, onVehicleData }) => {
  const [vehicles, setVehicles] = useState([])
  const [simulationTime, setSimulationTime] = useState(0)
  const [trafficDensity, setTrafficDensity] = useState(0.5)
  const animationRef = useRef()
  const cameraPosition = useMemo(() => [0, 60, 100], [])

  useEffect(() => {
    // Advanced traffic simulation with realistic behavior
    const updateTrafficSimulation = () => {
      if (!isRunning || !roadData?.segments) return

      setSimulationTime(prev => prev + 0.1)
      
      setVehicles(prevVehicles => {
        let newVehicles = [...prevVehicles]
        
        // Add new vehicles based on traffic density
        if (Math.random() < trafficDensity * 0.02) {
          const randomSegment = Math.floor(Math.random() * roadData.segments.length)
          const segment = roadData.segments[randomSegment]
          const lanes = segment.lanes || 4
          const randomLane = Math.floor(Math.random() * lanes)
          
          const vehicleTypes = ['car', 'truck', 'bus', 'motorcycle']
          const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
          
          const baseSpeed = segment.speed || 60
          const speedVariation = (Math.random() - 0.5) * 20
          const actualSpeed = Math.max(20, Math.min(120, baseSpeed + speedVariation))
          
          newVehicles.push({
            id: `vehicle-${Date.now()}-${Math.random()}`,
            segmentIndex: randomSegment,
            position: -45, // Start from beginning of segment
            lane: randomLane,
            speed: actualSpeed,
            type: randomType,
            targetSpeed: actualSpeed,
            acceleration: 0,
            rotation: 0,
            color: null
          })
        }
        
        // Update existing vehicles with IDM (Intelligent Driver Model)
        newVehicles = newVehicles.map(vehicle => {
          const segment = roadData.segments[vehicle.segmentIndex]
          const speedLimit = segment.speed || 60
          
          // Find vehicle ahead in same lane
          const vehicleAhead = newVehicles.find(v => 
            v.segmentIndex === vehicle.segmentIndex && 
            v.lane === vehicle.lane && 
            v.position > vehicle.position &&
            v.id !== vehicle.id
          )
          
          let acceleration = 0
          const maxAcceleration = 2.0 // m/s²
          const comfortableDeceleration = 3.0 // m/s²
          const minGap = 8.0 // meters
          const desiredTimeHeadway = 1.5 // seconds
          
          // IDM acceleration calculation
          const speedRatio = vehicle.speed / speedLimit
          const freeRoadAcceleration = maxAcceleration * (1 - Math.pow(speedRatio, 4))
          
          if (vehicleAhead) {
            const gap = vehicleAhead.position - vehicle.position
            const deltaSpeed = vehicle.speed - vehicleAhead.speed
            const desiredGap = minGap + vehicle.speed * desiredTimeHeadway + 
              (vehicle.speed * deltaSpeed) / (2 * Math.sqrt(maxAcceleration * comfortableDeceleration))
            
            const gapRatio = desiredGap / gap
            acceleration = freeRoadAcceleration - maxAcceleration * Math.pow(gapRatio, 2)
          } else {
            acceleration = freeRoadAcceleration
          }
          
          // Apply elevation effects
          const elevation = segment.elevation || 0
          if (elevation > 0) {
            acceleration -= 0.5 // Slight deceleration on inclines
          }
          
          // Update speed and position
          const newSpeed = Math.max(5, Math.min(speedLimit * 1.2, vehicle.speed + acceleration * 0.1))
          const newPosition = vehicle.position + (newSpeed * 0.1 * 2.78) // Convert km/h to position units
          
          // Handle segment transitions
          if (newPosition > 45) {
            if (vehicle.segmentIndex < roadData.segments.length - 1) {
              return {
                ...vehicle,
                segmentIndex: vehicle.segmentIndex + 1,
                position: -45,
                speed: newSpeed
              }
            } else {
              return null // Remove vehicle at end
            }
          }
          
          return {
            ...vehicle,
            position: newPosition,
            speed: newSpeed,
            acceleration
          }
        }).filter(Boolean) // Remove null vehicles
        
        // Limit total vehicles for performance
        if (newVehicles.length > 50) {
          newVehicles = newVehicles.slice(-50)
        }
        
        // Report traffic data
        if (onVehicleData) {
          const trafficStats = {
            totalVehicles: newVehicles.length,
            averageSpeed: newVehicles.reduce((sum, v) => sum + v.speed, 0) / newVehicles.length || 0,
            vehiclesByType: newVehicles.reduce((acc, v) => {
              acc[v.type] = (acc[v.type] || 0) + 1
              return acc
            }, {}),
            congestionLevel: newVehicles.filter(v => v.speed < 30).length / newVehicles.length
          }
          onVehicleData(trafficStats)
        }
        
        return newVehicles
      })
    }

    if (isRunning) {
      animationRef.current = setInterval(updateTrafficSimulation, 100)
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [isRunning, roadData, trafficDensity, onVehicleData])

  if (!roadData || !roadData.segments) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        No road data available for simulation
      </div>
    )
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Simulation Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(42, 42, 42, 0.95)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '220px',
        color: 'var(--text-primary)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: 'var(--accent-blue)' }}>Traffic Controls</h3>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Traffic Density
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={trafficDensity}
            onChange={(e) => setTrafficDensity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '12px' }}>{Math.round(trafficDensity * 100)}%</span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div>Active Vehicles: <span style={{ color: 'var(--text-primary)' }}>{vehicles.length}</span></div>
          <div>Simulation Time: <span style={{ color: 'var(--text-primary)' }}>{Math.round(simulationTime)}s</span></div>
          <div>Status: <span style={{ color: isRunning ? '#10b981' : '#ef4444' }}>
            {isRunning ? 'Running' : 'Paused'}
          </span></div>
        </div>
      </div>

      {/* Traffic Statistics */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'rgba(42, 42, 42, 0.95)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '200px',
        color: 'var(--text-primary)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: 'var(--accent-blue)' }}>Live Traffic Stats</h3>
        
        <div style={{ fontSize: '12px', display: 'grid', gap: '6px' }}>
          <div>
            Avg Speed: <span style={{ color: 'var(--text-primary)' }}>
              {Math.round(vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length || 0)} km/h
            </span>
          </div>
          <div>
            Cars: <span style={{ color: '#4ade80' }}>
              {vehicles.filter(v => v.type === 'car').length}
            </span>
          </div>
          <div>
            Trucks: <span style={{ color: '#f97316' }}>
              {vehicles.filter(v => v.type === 'truck').length}
            </span>
          </div>
          <div>
            Buses: <span style={{ color: '#8b5cf6' }}>
              {vehicles.filter(v => v.type === 'bus').length}
            </span>
          </div>
          <div>
            Motorcycles: <span style={{ color: '#06b6d4' }}>
              {vehicles.filter(v => v.type === 'motorcycle').length}
            </span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        shadows
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
      >
        {/* Enhanced Lighting for Day/Night Cycle */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[100, 80, 50]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={400}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
        />
        
        {/* Street lighting simulation */}
        {roadData.segments.map((_, index) => (
          <pointLight
            key={`street-light-${index}`}
            position={[(index - roadData.segments.length / 2) * 100, 15, 20]}
            intensity={0.4}
            distance={50}
            color="#fbbf24"
            castShadow
          />
        ))}

        {/* Ground */}
        <Plane
          args={[2000, 2000]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -5, 0]}
          receiveShadow
        >
          <meshLambertMaterial color="#1f2937" />
        </Plane>

        {/* Enhanced Grid */}
        <Grid
          args={[2000, 200]}
          position={[0, -4.9, 0]}
          cellColor="#374151"
          sectionColor="#0ea5e9"
          sectionThickness={2}
          cellThickness={1}
          infiniteGrid={false}
          fadeDistance={800}
          fadeStrength={1}
        />

        {/* Road Segments with Traffic */}
        {roadData.segments.map((segment, index) => {
          const segmentLength = 100
          const xPosition = (index - roadData.segments.length / 2) * segmentLength
          
          return (
            <RoadSegmentWithTraffic
              key={index}
              segment={segment}
              index={index}
              position={[xPosition, 0, 0]}
              vehicles={vehicles}
            />
          )
        })}

        {/* Environment Objects */}
        {roadData.segments.map((_, index) => (
          <group key={`env-${index}`}>
            {/* Buildings/Trees alongside road */}
            <Box
              args={[8, 25, 8]}
              position={[(index - roadData.segments.length / 2) * 100 + 40, 12.5, 50]}
              castShadow
            >
              <meshLambertMaterial color="#4b5563" />
            </Box>
            <Box
              args={[6, 15, 6]}
              position={[(index - roadData.segments.length / 2) * 100 - 30, 7.5, -40]}
              castShadow
            >
              <meshLambertMaterial color="#6b7280" />
            </Box>
          </group>
        ))}

        {/* Navigation Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={40}
          maxDistance={300}
          maxPolarAngle={Math.PI * 0.45}
          minPolarAngle={Math.PI * 0.05}
          target={[0, 5, 0]}
        />
      </Canvas>

      {/* Simulation Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'rgba(42, 42, 42, 0.9)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-secondary)',
        fontSize: '12px'
      }}>
        <div>
          <span style={{ color: 'var(--accent-blue)' }}>🚗 Real-time 3D Traffic Simulation</span> • 
          Physics: <span style={{ color: 'var(--text-primary)' }}>IDM (Intelligent Driver Model)</span>
        </div>
        <div>
          🎮 <strong>Controls:</strong> Left-click + drag to rotate • Right-click + drag to pan • Scroll to zoom
        </div>
      </div>
    </div>
  )
}

export default ThreeJSTrafficSimulation
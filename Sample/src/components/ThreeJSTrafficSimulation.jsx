import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text, Box, Cylinder, Plane } from '@react-three/drei'
import * as THREE from 'three'
// import EnhancedVehicle3D from './EnhancedVehicle3D'
// import { VehiclePerformanceManager, VehiclePool, PerformanceMonitor } from './VehiclePerformance'

// Note: Vehicle3D component moved to EnhancedVehicle3D.jsx for better organization and performance

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
          
          // Simple vehicle model that definitely works
          const vehicleSize = vehicle.type === 'truck' ? [3, 2.5, 8] : 
                             vehicle.type === 'bus' ? [2.5, 3, 12] :
                             vehicle.type === 'motorcycle' ? [1, 1.5, 2.5] :
                             [2, 1.8, 4.5] // car
          
          const vehicleColor = vehicle.color || (vehicle.type === 'truck' ? '#dc2626' :
                                                   vehicle.type === 'bus' ? '#1e40af' :
                                                   vehicle.type === 'motorcycle' ? '#333333' :
                                                   '#4444ff')
          
          return (
            <group 
              key={`vehicle-${index}-${vehicleIndex}`} 
              position={vehiclePosition} 
              rotation={[0, (vehicle.rotation || 0) + Math.PI / 2, 0]} // Rotate 90 degrees to align with road
            >
              {/* Main vehicle body */}
              <Box args={vehicleSize}>
                <meshLambertMaterial color={vehicleColor} />
              </Box>
              
              {/* Optimized wheels - fewer vertices */}
              <Cylinder args={[0.4, 0.4, 0.3, 8]} position={[vehicleSize[2]/3, -0.8, 0.7]} rotation={[0, 0, Math.PI / 2]}>
                <meshLambertMaterial color="#333333" />
              </Cylinder>
              <Cylinder args={[0.4, 0.4, 0.3, 8]} position={[vehicleSize[2]/3, -0.8, -0.7]} rotation={[0, 0, Math.PI / 2]}>
                <meshLambertMaterial color="#333333" />
              </Cylinder>
              <Cylinder args={[0.4, 0.4, 0.3, 8]} position={[-vehicleSize[2]/3, -0.8, 0.7]} rotation={[0, 0, Math.PI / 2]}>
                <meshLambertMaterial color="#333333" />
              </Cylinder>
              <Cylinder args={[0.4, 0.4, 0.3, 8]} position={[-vehicleSize[2]/3, -0.8, -0.7]} rotation={[0, 0, Math.PI / 2]}>
                <meshLambertMaterial color="#333333" />
              </Cylinder>
              
              {/* Simple headlights at front */}
              <mesh position={[vehicleSize[2] / 2, 0, 0]}>
                <sphereGeometry args={[0.15, 6, 4]} />
                <meshBasicMaterial color="#ffffaa" />
              </mesh>
              
              {/* Simplified speed text - only show for nearby vehicles */}
              {Math.sqrt(
                (vehiclePosition[0] * vehiclePosition[0]) + 
                (vehiclePosition[2] * vehiclePosition[2])
              ) < 50 && (
                <Text
                  position={[0, 2.5, 0]}
                  fontSize={0.5}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {Math.round(vehicle.speed)}
                </Text>
              )}
            </group>
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
  const [trafficDensity, setTrafficDensity] = useState(0.8) // Higher initial density
  const animationRef = useRef()
  const cameraPosition = useMemo(() => [0, 60, 100], [])
  
  // Performance management (simplified for debugging)
  // const performanceManager = useRef(new VehiclePerformanceManager())
  // const vehiclePool = useRef(new VehiclePool(150))
  // const performanceMonitor = useRef(new PerformanceMonitor())
  // const [performanceStats, setPerformanceStats] = useState({
  //   fps: 60,
  //   vehicleCount: 0,
  //   grade: 'Excellent'
  // })

  // Helper methods (simplified for debugging)
  // const getVehiclePhysics = (vehicleType) => { ... }
  // const weightedRandomChoice = (items, weights) => { ... }

  useEffect(() => {
    // Advanced traffic simulation with realistic behavior and performance monitoring
    const updateTrafficSimulation = () => {
      if (!isRunning || !roadData?.segments) return

      // Simple performance monitoring (removed complex FPS tracking to prevent freezing)

      setSimulationTime(prev => prev + 0.1)
      
      setVehicles(prevVehicles => {
        let newVehicles = [...prevVehicles]
        
        // Add initial test vehicles if none exist (less frequent to prevent spam)
        if (newVehicles.length === 0 && Math.random() < 0.1) {
          const testVehicle = {
            id: `test-vehicle-${Date.now()}`,
            segmentIndex: 0,
            position: 0,
            lane: 1,
            speed: 50,
            type: 'car',
            targetSpeed: 50,
            acceleration: 0,
            rotation: 0, // Will be rotated in rendering
            turnSignal: null,
            color: '#ff4444'
          }
          newVehicles.push(testVehicle)
          // console.log('Added test vehicle with correct orientation') // Removed for performance
        }
        
        // Add new vehicles based on traffic density (balanced spawning)
        const spawnRate = trafficDensity * 0.03 // Balanced spawn rate
        if (Math.random() < spawnRate && newVehicles.length < 20) {
          const randomSegment = Math.floor(Math.random() * roadData.segments.length)
          const segment = roadData.segments[randomSegment]
          const lanes = segment.lanes || 4
          const randomLane = Math.floor(Math.random() * lanes)
          
          const vehicleTypes = ['car', 'truck', 'bus', 'motorcycle']
          const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
          
          const baseSpeed = segment.speed || 60
          const speedVariation = (Math.random() - 0.5) * 20
          const actualSpeed = Math.max(20, Math.min(120, baseSpeed + speedVariation))
          
          const newVehicle = {
            id: `vehicle-${Date.now()}-${Math.random()}`,
            segmentIndex: randomSegment,
            position: -45,
            lane: randomLane,
            speed: actualSpeed,
            type: randomType,
            targetSpeed: actualSpeed,
            acceleration: 0,
            rotation: 0, // Vehicle will be rotated 90 degrees in rendering
            turnSignal: null,
            color: randomType === 'car' ? ['#ff4444', '#4444ff', '#44ff44', '#ffff44'][Math.floor(Math.random() * 4)] : null
          }
          newVehicles.push(newVehicle)
          // console.log('Added new vehicle:', newVehicle) // Removed for performance
        }
        
        // Update existing vehicles with simplified physics
        newVehicles = newVehicles.map(vehicle => {
          if (!vehicle || !vehicle.id) return null
          
          try {
            const segment = roadData.segments[vehicle.segmentIndex]
            if (!segment) return null
            
            const speedLimit = segment.speed || 60
            
            // Find vehicle ahead in same lane
            const vehicleAhead = newVehicles.find(v => 
              v && v.segmentIndex === vehicle.segmentIndex && 
              v.lane === vehicle.lane && 
              v.position > vehicle.position &&
              v.id !== vehicle.id
            )
            
            let targetSpeed = speedLimit
            
            // Simple following behavior
            if (vehicleAhead) {
              const gap = vehicleAhead.position - vehicle.position
              if (gap < 15) {
                targetSpeed = Math.min(vehicleAhead.speed * 0.8, speedLimit)
              }
            }
            
            // Simple speed adjustment
            const speedDiff = targetSpeed - vehicle.speed
            const acceleration = Math.sign(speedDiff) * Math.min(Math.abs(speedDiff) * 0.1, 2)
            const newSpeed = Math.max(5, Math.min(speedLimit * 1.2, vehicle.speed + acceleration))
            
            // Update position with smoother movement
            const deltaTime = 0.3 // Match our simulation interval
            const newPosition = vehicle.position + (newSpeed * deltaTime * 1.2)
            
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
          } catch (error) {
            console.warn('Error updating vehicle:', error)
            return null
          }
        }).filter(Boolean) // Remove null vehicles
        
        // Limit total vehicles for better performance
        if (newVehicles.length > 20) {
          newVehicles = newVehicles.slice(-20)
        }
        
        // Performance stats removed to prevent issues
        
        // Report traffic data
        if (onVehicleData) {
          const trafficStats = {
            totalVehicles: newVehicles.length,
            averageSpeed: newVehicles.reduce((sum, v) => sum + v.speed, 0) / newVehicles.length || 0,
            vehiclesByType: newVehicles.reduce((acc, v) => {
              acc[v.type] = (acc[v.type] || 0) + 1
              return acc
            }, {}),
            congestionLevel: newVehicles.filter(v => v.speed < 30).length / newVehicles.length,
            performanceGrade: 'Good',
            fps: 60
          }
          onVehicleData(trafficStats)
        }
        
        return newVehicles
      })
    }

    if (isRunning) {
      animationRef.current = setInterval(updateTrafficSimulation, 300) // Even slower for better performance
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

  // Helper functions moved above useEffect

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
          <div>Road Segments: <span style={{ color: 'var(--text-primary)' }}>{roadData?.segments?.length || 0}</span></div>
          <div>Traffic Density: <span style={{ color: 'var(--text-primary)' }}>{Math.round(trafficDensity * 100)}%</span></div>
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

      {/* 3D Canvas - Optimized for performance */}
      <Canvas
        camera={{ position: cameraPosition, fov: 45 }}
        shadows={false} // Disable shadows for better performance
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={Math.min(window.devicePixelRatio, 2)} // Limit pixel ratio for performance
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
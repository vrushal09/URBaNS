import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text, Box, Cylinder, Plane } from '@react-three/drei'
import * as THREE from 'three'

const RoadSegment3D = ({ segment, index, position, isSelected, onClick }) => {
  const meshRef = useRef()
  const elevation = segment.elevation || 0
  const lanes = segment.lanes || 4
  const roadWidth = lanes * 3.5 // 3.5 meters per lane
  const segmentLength = 100 // meters
  
  // Colors based on road type
  const getRoadColor = () => {
    if (segment.type === 'overpass' || segment.hasBridge) return '#6366f1'
    if (segment.type === 'tunnel') return '#374151'
    return '#4a5568'
  }

  // Animate selection highlight
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.material.emissive.setHex(
        Math.sin(state.clock.elapsedTime * 3) > 0 ? 0x0084ff : 0x000000
      )
    }
  })

  const roadGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(segmentLength, 1, roadWidth)
    return geometry
  }, [segmentLength, roadWidth])

  return (
    <group position={[position[0], elevation, position[2]]}>
      {/* Main Road Surface */}
      <mesh
        ref={meshRef}
        geometry={roadGeometry}
        position={[0, 0.5, 0]}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <meshLambertMaterial 
          color={getRoadColor()} 
          transparent={segment.type === 'tunnel'}
          opacity={segment.type === 'tunnel' ? 0.7 : 1.0}
        />
      </mesh>

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

      {/* Center Median for highways */}
      {segment.hasMedian && (
        <Box
          args={[segmentLength, 1.5, 0.5]}
          position={[0, 1.25, 0]}
        >
          <meshLambertMaterial color="#10b981" />
        </Box>
      )}

      {/* Bridge Pillars for overpasses */}
      {(segment.type === 'overpass' || segment.hasBridge) && elevation > 0 && (
        <>
          <Cylinder
            args={[2, 2, elevation]}
            position={[-segmentLength * 0.3, -elevation / 2, -roadWidth * 0.3]}
            castShadow
          >
            <meshLambertMaterial color="#9ca3af" />
          </Cylinder>
          <Cylinder
            args={[2, 2, elevation]}
            position={[segmentLength * 0.3, -elevation / 2, -roadWidth * 0.3]}
            castShadow
          >
            <meshLambertMaterial color="#9ca3af" />
          </Cylinder>
          <Cylinder
            args={[2, 2, elevation]}
            position={[-segmentLength * 0.3, -elevation / 2, roadWidth * 0.3]}
            castShadow
          >
            <meshLambertMaterial color="#9ca3af" />
          </Cylinder>
          <Cylinder
            args={[2, 2, elevation]}
            position={[segmentLength * 0.3, -elevation / 2, roadWidth * 0.3]}
            castShadow
          >
            <meshLambertMaterial color="#9ca3af" />
          </Cylinder>
        </>
      )}

      {/* Tunnel Entrance */}
      {segment.type === 'tunnel' && (
        <group>
          <Box
            args={[10, 15, roadWidth + 5]}
            position={[-segmentLength / 2, 7.5, 0]}
          >
            <meshLambertMaterial color="#1f2937" />
          </Box>
          <Box
            args={[10, 15, roadWidth + 5]}
            position={[segmentLength / 2, 7.5, 0]}
          >
            <meshLambertMaterial color="#1f2937" />
          </Box>
          
          {/* Tunnel Lights */}
          {Array.from({ length: 8 }, (_, i) => (
            <pointLight
              key={`tunnel-light-${i}`}
              position={[(i - 4) * 12, 8, 0]}
              intensity={0.5}
              distance={30}
              color="#fbbf24"
              castShadow
            />
          ))}
        </group>
      )}

      {/* Segment Label */}
      <Text
        position={[0, elevation + 8, roadWidth / 2 + 5]}
        fontSize={3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        castShadow
      >
        {`S${index + 1}: ${lanes}L, ${segment.speed || 60}km/h, ${elevation}m`}
      </Text>

      {/* Technical Annotations for Selected Segment */}
      {isSelected && (
        <group position={[segmentLength / 2 + 20, elevation + 10, 0]}>
          <Plane args={[30, 25]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#2a2a2a" transparent opacity={0.9} />
          </Plane>
          <Text
            position={[0, 8, 0.1]}
            fontSize={2}
            color="#0084ff"
            anchorX="center"
          >
            {`Segment ${index + 1} Details`}
          </Text>
          <Text
            position={[0, 4, 0.1]}
            fontSize={1.5}
            color="#f0f0f0"
            anchorX="center"
          >
            {`Type: ${segment.type || 'Standard'}\nLanes: ${lanes}\nSpeed: ${segment.speed || 60} km/h\nElevation: ${elevation}m\nLength: ${segment.length || '1.2km'}`}
          </Text>
        </group>
      )}
    </group>
  )
}

const ThreeJSRoadVisualization = ({ roadData, selectedSegment, onSegmentSelect }) => {
  const cameraPosition = useMemo(() => [0, 100, 150], [])
  
  if (!roadData || !roadData.segments) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        No road data available
      </div>
    )
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Canvas
        camera={{ position: cameraPosition, fov: 60 }}
        shadows
        style={{ background: 'linear-gradient(to bottom, #1a202c, #2d3748)' }}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[100, 100, 50]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={300}
          shadow-camera-left={-150}
          shadow-camera-right={150}
          shadow-camera-top={150}
          shadow-camera-bottom={-150}
        />
        <pointLight position={[0, 50, 0]} intensity={0.3} />

        {/* Ground Plane */}
        <Plane
          args={[1000, 1000]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2, 0]}
          receiveShadow
        >
          <meshLambertMaterial color="#2d3748" />
        </Plane>

        {/* Grid Helper */}
        <Grid
          args={[1000, 100]}
          position={[0, -1.9, 0]}
          cellColor="#4a5568"
          sectionColor="#0084ff"
          sectionThickness={2}
          cellThickness={1}
          infiniteGrid={false}
          fadeDistance={500}
          fadeStrength={1}
        />

        {/* Road Segments */}
        {roadData.segments.map((segment, index) => {
          const segmentLength = 100
          const xPosition = (index - roadData.segments.length / 2) * segmentLength
          
          return (
            <RoadSegment3D
              key={index}
              segment={segment}
              index={index}
              position={[xPosition, 0, 0]}
              isSelected={selectedSegment === index}
              onClick={() => onSegmentSelect?.(index)}
            />
          )
        })}

        {/* Navigation Reference Points */}
        <Text
          position={[0, 80, -100]}
          fontSize={8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {roadData.name || 'Road Design'}
        </Text>

        {/* Coordinate System Helpers */}
        <axesHelper args={[50]} />

        {/* Interactive Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={50}
          maxDistance={500}
          maxPolarAngle={Math.PI * 0.45}
          minPolarAngle={Math.PI * 0.1}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* 3D Navigation Help */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(42, 42, 42, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: '12px',
        maxWidth: '200px'
      }}>
        <h4 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>3D Navigation</h4>
        <div>🖱️ <strong>Left Click + Drag:</strong> Rotate view</div>
        <div>🖱️ <strong>Right Click + Drag:</strong> Pan view</div>
        <div>🖱️ <strong>Scroll:</strong> Zoom in/out</div>
        <div>🖱️ <strong>Click Road:</strong> Select segment</div>
      </div>

      {/* Performance Stats */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(42, 42, 42, 0.9)',
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: '11px'
      }}>
        <div>Mode: <span style={{ color: 'var(--accent-blue)' }}>3D Enhanced</span></div>
        <div>Segments: <span style={{ color: 'var(--text-primary)' }}>{roadData.segments.length}</span></div>
        <div>Selected: <span style={{ color: selectedSegment !== null ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
          {selectedSegment !== null ? `Segment ${selectedSegment + 1}` : 'None'}
        </span></div>
      </div>
    </div>
  )
}

export default ThreeJSRoadVisualization
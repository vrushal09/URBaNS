import React, { useRef, useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, Grid, Text, Box, Cylinder, Plane } from '@react-three/drei'
import * as THREE from 'three'

const EditableRoadSegment = ({ segment, index, position, isSelected, onSegmentChange, transformMode }) => {
  const meshRef = useRef()
  const groupRef = useRef()
  const elevation = segment.elevation || 0
  const lanes = segment.lanes || 4
  const roadWidth = lanes * 3.5 // 3.5 meters per lane
  const segmentLength = 100 // meters
  
  // Handle transform changes
  const handleTransform = () => {
    if (groupRef.current && onSegmentChange) {
      const newPosition = groupRef.current.position
      const newElevation = Math.max(0, Math.min(100, Math.round(newPosition.y)))
      
      if (newElevation !== elevation) {
        onSegmentChange(index, { ...segment, elevation: newElevation })
      }
    }
  }

  const roadColor = useMemo(() => {
    if (segment.type === 'overpass' || segment.hasBridge) return '#6366f1'
    if (segment.type === 'tunnel') return '#374151'
    return isSelected ? '#0084ff' : '#4a5568'
  }, [segment.type, segment.hasBridge, isSelected])

  const roadMaterial = useMemo(() => new THREE.MeshLambertMaterial({ 
    color: roadColor,
    transparent: segment.type === 'tunnel',
    opacity: segment.type === 'tunnel' ? 0.7 : 1.0
  }), [roadColor, segment.type])

  return (
    <group ref={groupRef} position={[position[0], elevation, position[2]]}>
      {/* Transform Controls for Selected Segment */}
      {isSelected && transformMode && (
        <TransformControls
          object={groupRef}
          mode={transformMode}
          translationSnap={5}
          rotationSnap={Math.PI / 12}
          scaleSnap={0.1}
          onObjectChange={handleTransform}
          showX={transformMode === 'translate'}
          showY={true}
          showZ={transformMode === 'translate'}
        />
      )}

      {/* Main Road Surface */}
      <Box
        ref={meshRef}
        args={[segmentLength, 1, roadWidth]}
        position={[0, 0.5, 0]}
        castShadow
        receiveShadow
        material={roadMaterial}
      />

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

      {/* Bridge Support Structures */}
      {(segment.type === 'overpass' || segment.hasBridge) && elevation > 0 && (
        <group>
          {/* Pillars */}
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
          
          {/* Bridge Deck Support Beams */}
          <Box
            args={[segmentLength * 1.1, 2, 1]}
            position={[0, -1, -roadWidth * 0.4]}
          >
            <meshLambertMaterial color="#6366f1" />
          </Box>
          <Box
            args={[segmentLength * 1.1, 2, 1]}
            position={[0, -1, roadWidth * 0.4]}
          >
            <meshLambertMaterial color="#6366f1" />
          </Box>
        </group>
      )}

      {/* Tunnel Structure */}
      {segment.type === 'tunnel' && (
        <group>
          {/* Tunnel Entrances */}
          <Box
            args={[8, 12, roadWidth + 4]}
            position={[-segmentLength / 2, 6, 0]}
          >
            <meshLambertMaterial color="#1f2937" />
          </Box>
          <Box
            args={[8, 12, roadWidth + 4]}
            position={[segmentLength / 2, 6, 0]}
          >
            <meshLambertMaterial color="#1f2937" />
          </Box>
          
          {/* Overhead Tunnel Structure */}
          <Box
            args={[segmentLength, 3, roadWidth + 6]}
            position={[0, 8, 0]}
          >
            <meshLambertMaterial color="#374151" />
          </Box>
        </group>
      )}

      {/* Segment Information Panel */}
      <group position={[0, elevation + 15, roadWidth / 2 + 8]}>
        <Plane args={[25, 12]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#2a2a2a" transparent opacity={0.8} />
        </Plane>
        <Text
          position={[0, 3, 0.1]}
          fontSize={1.5}
          color={isSelected ? "#0084ff" : "#ffffff"}
          anchorX="center"
        >
          {`Segment ${index + 1}`}
        </Text>
        <Text
          position={[0, 0, 0.1]}
          fontSize={1}
          color="#f0f0f0"
          anchorX="center"
        >
          {`${lanes}L • ${segment.speed || 60}km/h • ${elevation}m`}
        </Text>
        <Text
          position={[0, -2, 0.1]}
          fontSize={0.8}
          color="#a0a0a0"
          anchorX="center"
        >
          {segment.type || 'Standard Road'}
        </Text>
      </group>

      {/* Elevation Grid Lines for Reference */}
      {isSelected && elevation > 0 && (
        <group>
          {Array.from({ length: Math.floor(elevation / 5) }, (_, i) => (
            <Box
              key={`elevation-line-${i}`}
              args={[segmentLength * 1.2, 0.1, roadWidth * 1.2]}
              position={[0, -i * 5 - 2.5, 0]}
              material={new THREE.MeshBasicMaterial({ 
                color: '#0084ff', 
                transparent: true, 
                opacity: 0.2 
              })}
            />
          ))}
        </group>
      )}
    </group>
  )
}

const ThreeJSRoadEditor = ({ roadData, onRoadModify, selectedSegment, onSegmentSelect }) => {
  const [transformMode, setTransformMode] = useState('translate')
  const [modifiedRoad, setModifiedRoad] = useState(roadData)
  const cameraPosition = useMemo(() => [0, 80, 120], [])

  const handleSegmentChange = (index, newSegment) => {
    const newRoad = { ...modifiedRoad }
    newRoad.segments[index] = newSegment
    setModifiedRoad(newRoad)
    onRoadModify?.(newRoad)
  }

  const tools = [
    { id: 'select', name: 'Select', icon: '🎯', mode: null },
    { id: 'move', name: 'Move', icon: '↔️', mode: 'translate' },
    { id: 'rotate', name: 'Rotate', icon: '🔄', mode: 'rotate' },
    { id: 'scale', name: 'Scale', icon: '⚡', mode: 'scale' }
  ]

  if (!modifiedRoad || !modifiedRoad.segments) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        No road data available for editing
      </div>
    )
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Tool Palette */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setTransformMode(tool.mode)}
            style={{
              padding: '12px',
              background: transformMode === tool.mode ? 'var(--accent-blue)' : 'rgba(42, 42, 42, 0.9)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: transformMode === tool.mode ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '16px',
              minWidth: '48px',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            title={tool.name}
            onMouseEnter={(e) => {
              if (transformMode !== tool.mode) {
                e.currentTarget.style.background = 'rgba(60, 60, 60, 0.9)'
              }
            }}
            onMouseLeave={(e) => {
              if (transformMode !== tool.mode) {
                e.currentTarget.style.background = 'rgba(42, 42, 42, 0.9)'
              }
            }}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Segment Properties Panel */}
      {selectedSegment !== null && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(42, 42, 42, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          minWidth: '280px',
          color: 'var(--text-primary)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)' }}>
            Segment {selectedSegment + 1} Properties
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Lanes
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={modifiedRoad.segments[selectedSegment]?.lanes || 4}
                onChange={(e) => {
                  const newSegment = { 
                    ...modifiedRoad.segments[selectedSegment], 
                    lanes: parseInt(e.target.value) 
                  }
                  handleSegmentChange(selectedSegment, newSegment)
                }}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '14px' }}>{modifiedRoad.segments[selectedSegment]?.lanes || 4} lanes</span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Speed Limit (km/h)
              </label>
              <input
                type="range"
                min="30"
                max="120"
                step="10"
                value={modifiedRoad.segments[selectedSegment]?.speed || 60}
                onChange={(e) => {
                  const newSegment = { 
                    ...modifiedRoad.segments[selectedSegment], 
                    speed: parseInt(e.target.value) 
                  }
                  handleSegmentChange(selectedSegment, newSegment)
                }}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '14px' }}>{modifiedRoad.segments[selectedSegment]?.speed || 60} km/h</span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Elevation (m)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={modifiedRoad.segments[selectedSegment]?.elevation || 0}
                onChange={(e) => {
                  const newSegment = { 
                    ...modifiedRoad.segments[selectedSegment], 
                    elevation: parseInt(e.target.value) 
                  }
                  handleSegmentChange(selectedSegment, newSegment)
                }}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '14px' }}>{modifiedRoad.segments[selectedSegment]?.elevation || 0} m</span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Road Type
              </label>
              <select
                value={modifiedRoad.segments[selectedSegment]?.type || 'standard'}
                onChange={(e) => {
                  const newSegment = { 
                    ...modifiedRoad.segments[selectedSegment], 
                    type: e.target.value,
                    hasBridge: e.target.value === 'overpass'
                  }
                  handleSegmentChange(selectedSegment, newSegment)
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="standard">Standard Road</option>
                <option value="overpass">Overpass/Bridge</option>
                <option value="tunnel">Tunnel</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={modifiedRoad.segments[selectedSegment]?.hasMedian || false}
                  onChange={(e) => {
                    const newSegment = { 
                      ...modifiedRoad.segments[selectedSegment], 
                      hasMedian: e.target.checked 
                    }
                    handleSegmentChange(selectedSegment, newSegment)
                  }}
                />
                Center Median
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        shadows
        style={{ background: 'linear-gradient(to bottom, #1a202c, #2d3748)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[100, 100, 50]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={300}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
        />
        <pointLight position={[0, 50, 0]} intensity={0.3} />

        {/* Ground */}
        <Plane
          args={[1000, 1000]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -5, 0]}
          receiveShadow
        >
          <meshLambertMaterial color="#2d3748" />
        </Plane>

        {/* Construction Grid */}
        <Grid
          args={[1000, 100]}
          position={[0, -4.9, 0]}
          cellColor="#4a5568"
          sectionColor="#0084ff"
          sectionThickness={2}
          cellThickness={1}
          infiniteGrid={false}
          fadeDistance={400}
          fadeStrength={1}
        />

        {/* Road Segments */}
        {modifiedRoad.segments.map((segment, index) => {
          const segmentLength = 100
          const xPosition = (index - modifiedRoad.segments.length / 2) * segmentLength
          
          return (
            <EditableRoadSegment
              key={index}
              segment={segment}
              index={index}
              position={[xPosition, 0, 0]}
              isSelected={selectedSegment === index}
              onSegmentChange={handleSegmentChange}
              transformMode={selectedSegment === index ? transformMode : null}
            />
          )
        })}

        {/* Click handler for segment selection */}
        <mesh
          position={[0, -10, 0]}
          onClick={(e) => {
            e.stopPropagation()
            const segmentLength = 100
            const clickX = e.point.x
            const segmentIndex = Math.floor((clickX + modifiedRoad.segments.length * segmentLength / 2) / segmentLength)
            
            if (segmentIndex >= 0 && segmentIndex < modifiedRoad.segments.length) {
              onSegmentSelect?.(segmentIndex)
            }
          }}
        >
          <boxGeometry args={[1000, 1, 1000]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Construction Helpers */}
        <axesHelper args={[30]} />

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={50}
          maxDistance={400}
          maxPolarAngle={Math.PI * 0.48}
          minPolarAngle={Math.PI * 0.1}
          target={[0, 20, 0]}
        />
      </Canvas>

      {/* Status Bar */}
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
        fontSize: '13px'
      }}>
        <div>
          <span style={{ color: 'var(--text-primary)' }}>3D Editor</span> • 
          Tool: <span style={{ color: 'var(--accent-blue)' }}>{tools.find(t => t.mode === transformMode)?.name || 'Select'}</span>
        </div>
        <div>
          Selected: <span style={{ color: selectedSegment !== null ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
            {selectedSegment !== null ? `Segment ${selectedSegment + 1}` : 'None'}
          </span>
        </div>
        <div>
          Segments: <span style={{ color: 'var(--text-primary)' }}>{modifiedRoad.segments.length}</span> • 
          Mode: <span style={{ color: 'var(--accent-blue)' }}>Professional 3D</span>
        </div>
      </div>
    </div>
  )
}

export default ThreeJSRoadEditor
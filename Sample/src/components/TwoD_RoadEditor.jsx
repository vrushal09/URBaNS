import React, { useRef, useEffect, useState, useCallback } from 'react'

const TwoD_RoadEditor = ({ roadData, onRoadModify, selectedSegment, onSegmentSelect }) => {
  const canvasRef = useRef(null)
  const [modifiedRoad, setModifiedRoad] = useState(roadData)
  const [selectedTool, setSelectedTool] = useState('select')
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState(25)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

  // Available editing tools
  const tools = [
    { id: 'select', name: 'Select', icon: '🎯', tooltip: 'Select and inspect segments' },
    { id: 'lanes', name: 'Lanes', icon: '🛣️', tooltip: 'Modify lane count' },
    { id: 'speed', name: 'Speed', icon: '🚗', tooltip: 'Adjust speed limit' },
    { id: 'elevation', name: 'Elevation', icon: '⛰️', tooltip: 'Change elevation' },
    { id: 'type', name: 'Type', icon: '🏗️', tooltip: 'Road type (bridge/tunnel)' },
    { id: 'median', name: 'Median', icon: '🚧', tooltip: 'Add/remove center median' },
    { id: 'traffic', name: 'Traffic', icon: '🚦', tooltip: 'Traffic lights and signals' },
    { id: 'bus', name: 'Bus Lane', icon: '🚌', tooltip: 'Bus lane configuration' }
  ]

  // Drawing functions
  const drawGrid = useCallback((ctx, width, height) => {
    if (!showGrid) return
    
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    
    const scaledGridSize = gridSize * zoom
    const startX = (-panOffset.x % scaledGridSize)
    const startY = (-panOffset.y % scaledGridSize)
    
    // Vertical lines
    for (let x = startX; x < width; x += scaledGridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    // Horizontal lines
    for (let y = startY; y < height; y += scaledGridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    ctx.setLineDash([])
  }, [showGrid, gridSize, zoom, panOffset])

  const drawRoadSegment = useCallback((ctx, segment, index, isSelected) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const segmentWidth = 150 * zoom
    const segmentHeight = 80 * zoom
    const startX = (200 + index * 160) * zoom + panOffset.x
    const startY = (300 - (segment.elevation || 0) * 2) * zoom + panOffset.y
    
    // Road surface
    const gradient = ctx.createLinearGradient(startX, startY, startX, startY + segmentHeight)
    
    if (segment.type === 'overpass' || segment.hasBridge) {
      gradient.addColorStop(0, '#6366f1')
      gradient.addColorStop(1, '#4f46e5')
    } else if (segment.type === 'tunnel') {
      gradient.addColorStop(0, '#374151')
      gradient.addColorStop(1, '#1f2937')
    } else {
      gradient.addColorStop(0, '#4a5568')
      gradient.addColorStop(1, '#2d3748')
    }
    
    ctx.fillStyle = gradient
    ctx.fillRect(startX, startY, segmentWidth, segmentHeight)
    
    // Selection highlight
    if (isSelected) {
      ctx.strokeStyle = '#0084ff'
      ctx.lineWidth = 3 * zoom
      ctx.strokeRect(startX - 2, startY - 2, segmentWidth + 4, segmentHeight + 4)
      
      // Selection glow
      ctx.shadowColor = '#0084ff'
      ctx.shadowBlur = 10 * zoom
      ctx.strokeRect(startX - 2, startY - 2, segmentWidth + 4, segmentHeight + 4)
      ctx.shadowBlur = 0
    }
    
    // Lane markings
    const laneCount = segment.lanes || 4
    const laneWidth = segmentHeight / laneCount
    
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2 * zoom
    
    for (let i = 1; i < laneCount; i++) {
      const laneY = startY + (i * laneWidth)
      ctx.setLineDash([8 * zoom, 6 * zoom])
      ctx.beginPath()
      ctx.moveTo(startX, laneY)
      ctx.lineTo(startX + segmentWidth, laneY)
      ctx.stroke()
    }
    ctx.setLineDash([])
    
    // Center median
    if (segment.hasMedian) {
      const medianY = startY + segmentHeight / 2
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 4 * zoom
      ctx.beginPath()
      ctx.moveTo(startX, medianY)
      ctx.lineTo(startX + segmentWidth, medianY)
      ctx.stroke()
    }
    
    // Bus lanes
    if (segment.hasBusLane) {
      ctx.fillStyle = 'rgba(255, 193, 7, 0.3)'
      const busLaneHeight = laneWidth
      const busLaneY = segment.busLaneType === 'center' ? 
        startY + (segmentHeight - busLaneHeight) / 2 : 
        startY + segmentHeight - busLaneHeight
      
      ctx.fillRect(startX, busLaneY, segmentWidth, busLaneHeight)
      
      // Bus lane markings
      ctx.fillStyle = '#ffc107'
      ctx.font = `${12 * zoom}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText('BUS', startX + segmentWidth / 2, busLaneY + busLaneHeight / 2 + 4 * zoom)
    }
    
    // Traffic lights
    if (segment.hasTrafficLights) {
      ctx.fillStyle = '#ff4444'
      ctx.fillRect(startX + segmentWidth - 15 * zoom, startY - 20 * zoom, 10 * zoom, 10 * zoom)
      ctx.fillStyle = '#ffff44'
      ctx.fillRect(startX + segmentWidth - 15 * zoom, startY - 10 * zoom, 10 * zoom, 10 * zoom)
      ctx.fillStyle = '#44ff44'
      ctx.fillRect(startX + segmentWidth - 15 * zoom, startY, 10 * zoom, 10 * zoom)
    }
    
    // Segment labels
    ctx.fillStyle = 'white'
    ctx.font = `bold ${14 * zoom}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(
      `S${index + 1}`, 
      startX + segmentWidth / 2, 
      startY + segmentHeight / 2
    )
    
    // Segment info
    ctx.font = `${10 * zoom}px Arial`
    ctx.fillText(
      `${segment.lanes}L • ${segment.speed}km/h • ${segment.elevation || 0}m`,
      startX + segmentWidth / 2,
      startY + segmentHeight / 2 + 15 * zoom
    )
    
    // Bridge/tunnel indicators
    if (segment.type === 'overpass' || segment.hasBridge) {
      // Bridge pillars
      ctx.fillStyle = '#9ca3af'
      ctx.fillRect(startX - 10 * zoom, startY + segmentHeight, 8 * zoom, 30 * zoom)
      ctx.fillRect(startX + segmentWidth + 2 * zoom, startY + segmentHeight, 8 * zoom, 30 * zoom)
    } else if (segment.type === 'tunnel') {
      // Tunnel entrances
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(startX - 15 * zoom, startY - 10 * zoom, 15 * zoom, segmentHeight + 20 * zoom)
      ctx.fillRect(startX + segmentWidth, startY - 10 * zoom, 15 * zoom, segmentHeight + 20 * zoom)
    }
    
    // Elevation indicators
    if (segment.elevation && segment.elevation !== 0) {
      ctx.fillStyle = segment.elevation > 0 ? '#10b981' : '#ef4444'
      ctx.fillRect(startX + segmentWidth + 10 * zoom, startY - 15 * zoom, 30 * zoom, 15 * zoom)
      ctx.fillStyle = 'white'
      ctx.font = `${10 * zoom}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText(
        `${segment.elevation > 0 ? '+' : ''}${segment.elevation}m`,
        startX + segmentWidth + 25 * zoom,
        startY - 5 * zoom
      )
    }
    
  }, [zoom, panOffset])

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !modifiedRoad) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Background
    ctx.fillStyle = '#1a202c'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Grid
    drawGrid(ctx, canvas.width, canvas.height)
    
    // Road segments
    modifiedRoad.segments.forEach((segment, index) => {
      drawRoadSegment(ctx, segment, index, selectedSegment === index)
    })
    
    // Tool cursor
    if (selectedTool !== 'select') {
      canvas.style.cursor = 'crosshair'
    } else {
      canvas.style.cursor = 'pointer'
    }
    
  }, [modifiedRoad, selectedSegment, drawGrid, drawRoadSegment, selectedTool])

  // Handle canvas interactions
  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const applyTool = (segmentIndex, tool) => {
      const newRoad = { ...modifiedRoad }
      const segment = { ...newRoad.segments[segmentIndex] }
      
      switch (tool) {
        case 'lanes':
          segment.lanes = Math.min(8, (segment.lanes || 4) + 1)
          break
        case 'speed':
          segment.speed = Math.min(120, (segment.speed || 60) + 10)
          break
        case 'elevation':
          segment.elevation = Math.min(50, (segment.elevation || 0) + 5)
          break
        case 'type':
          if (!segment.type || segment.type === 'standard') {
            segment.type = 'overpass'
            segment.hasBridge = true
          } else if (segment.type === 'overpass') {
            segment.type = 'tunnel'
            segment.hasBridge = false
          } else {
            segment.type = 'standard'
            segment.hasBridge = false
          }
          break
        case 'median':
          segment.hasMedian = !segment.hasMedian
          break
        case 'traffic':
          segment.hasTrafficLights = !segment.hasTrafficLights
          break
        case 'bus':
          segment.hasBusLane = !segment.hasBusLane
          segment.busLaneType = 'center'
          break
      }
      
      newRoad.segments[segmentIndex] = segment
      setModifiedRoad(newRoad)
      onRoadModify?.(newRoad)
    }
    
    // Find clicked segment
    modifiedRoad.segments.forEach((segment, index) => {
      const segmentWidth = 150 * zoom
      const segmentHeight = 80 * zoom
      const startX = (200 + index * 160) * zoom + panOffset.x
      const startY = (300 - (segment.elevation || 0) * 2) * zoom + panOffset.y
      
      if (x >= startX && x <= startX + segmentWidth && 
          y >= startY && y <= startY + segmentHeight) {
        onSegmentSelect?.(index)
        
        // Apply tool action
        if (selectedTool !== 'select') {
          applyTool(index, selectedTool)
        }
      }
    })
  }, [modifiedRoad, zoom, panOffset, selectedTool, onSegmentSelect, onRoadModify, setModifiedRoad])

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((event) => {
    event.preventDefault()
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.min(3, Math.max(0.3, prev * zoomFactor)))
  }, [])

  // Handle mouse drag for panning
  const handleMouseDown = useCallback((event) => {
    if (event.button === 1 || event.ctrlKey) { // Middle mouse or Ctrl+drag for panning
      setIsDragging(true)
      setDragStart({ x: event.clientX - panOffset.x, y: event.clientY - panOffset.y })
    }
  }, [panOffset])

  const handleMouseMove = useCallback((event) => {
    if (isDragging) {
      setPanOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    setModifiedRoad(roadData)
  }, [roadData])

  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      canvas.addEventListener('mousedown', handleMouseDown)
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        canvas.removeEventListener('wheel', handleWheel)
        canvas.removeEventListener('mousedown', handleMouseDown)
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp])

  if (!modifiedRoad || !modifiedRoad.segments) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No road data available</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Tool Palette */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        background: 'rgba(42, 42, 42, 0.95)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ 
          gridColumn: '1 / -1', 
          margin: '0 0 12px 0', 
          color: 'var(--accent-blue)',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          2D Editing Tools
        </h3>
        
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            title={tool.tooltip}
            style={{
              padding: '10px',
              background: selectedTool === tool.id ? 'var(--accent-blue)' : 'rgba(60, 60, 60, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: selectedTool === tool.id ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              minWidth: '60px'
            }}
            onMouseEnter={(e) => {
              if (selectedTool !== tool.id) {
                e.currentTarget.style.background = 'rgba(80, 80, 80, 0.9)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTool !== tool.id) {
                e.currentTarget.style.background = 'rgba(60, 60, 60, 0.8)'
              }
            }}
          >
            <span>{tool.icon}</span>
            <span style={{ fontSize: '10px' }}>{tool.name}</span>
          </button>
        ))}
      </div>

      {/* View Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'rgba(42, 42, 42, 0.95)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '200px'
      }}>
        <h3 style={{ margin: '0', color: 'var(--accent-blue)', fontSize: '14px' }}>View Controls</h3>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <input
            type="range"
            min="0.3"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Grid Size: {gridSize}px
          </label>
          <select 
            value={gridSize} 
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '4px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)'
            }}
          >
            <option value={10}>10px</option>
            <option value={25}>25px</option>
            <option value={50}>50px</option>
          </select>
        </div>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Show Grid
        </label>
        
        <button
          onClick={() => {
            setZoom(1)
            setPanOffset({ x: 0, y: 0 })
          }}
          style={{
            padding: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Reset View
        </button>
      </div>

      {/* Segment Properties Panel */}
      {selectedSegment !== null && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(42, 42, 42, 0.95)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          minWidth: '250px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'var(--accent-blue)' }}>
            Segment {selectedSegment + 1} Properties
          </h3>
          
          {modifiedRoad.segments[selectedSegment] && (
            <div style={{ display: 'grid', gap: '12px', fontSize: '12px' }}>
              <div>
                <strong>Lanes:</strong> {modifiedRoad.segments[selectedSegment].lanes || 4}
              </div>
              <div>
                <strong>Speed Limit:</strong> {modifiedRoad.segments[selectedSegment].speed || 60} km/h
              </div>
              <div>
                <strong>Elevation:</strong> {modifiedRoad.segments[selectedSegment].elevation || 0} m
              </div>
              <div>
                <strong>Type:</strong> {modifiedRoad.segments[selectedSegment].type || 'Standard'}
              </div>
              <div>
                <strong>Median:</strong> {modifiedRoad.segments[selectedSegment].hasMedian ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Traffic Lights:</strong> {modifiedRoad.segments[selectedSegment].hasTrafficLights ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Bus Lane:</strong> {modifiedRoad.segments[selectedSegment].hasBusLane ? 'Yes' : 'No'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={700}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: '100%',
          background: '#1a202c',
          cursor: selectedTool === 'select' ? 'pointer' : 'crosshair'
        }}
      />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(42, 42, 42, 0.9)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        maxWidth: '300px'
      }}>
        <div style={{ color: 'var(--accent-blue)', marginBottom: '8px', fontWeight: 'bold' }}>
          2D Editor Controls:
        </div>
        <div>🖱️ <strong>Left Click:</strong> Select segment or apply tool</div>
        <div>🖱️ <strong>Ctrl + Drag:</strong> Pan view</div>
        <div>🖱️ <strong>Mouse Wheel:</strong> Zoom in/out</div>
        <div>🔧 <strong>Tools:</strong> Click tool then click segment to modify</div>
      </div>
    </div>
  )
}

export default TwoD_RoadEditor
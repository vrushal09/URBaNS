import React, { useState, useRef, useEffect, useCallback } from 'react'

const Enhanced3DRoadEditor = ({ roadData, onRoadModify }) => {
  const canvasRef = useRef(null)
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [modifiedRoad, setModifiedRoad] = useState(roadData)
  const [showGrid, setShowGrid] = useState(true)
  const [showWireframe, setShowWireframe] = useState(false)
  const [_history, _setHistory] = useState([roadData])
  const [_historyIndex, _setHistoryIndex] = useState(0)
  const [selectedTool, setSelectedTool] = useState('select')
  const [elevationMode, setElevationMode] = useState(false)
  const [viewAngle, setViewAngle] = useState({ x: 25, y: 0, z: 0 })
  const [lighting] = useState({ 
    direction: [-1, -1, -2], 
    intensity: 0.8,
    ambientIntensity: 0.3 
  })
  const [dragState, setDragState] = useState(null)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(25)

  const tools = [
    { id: 'select', name: 'Select', icon: '↖️', tooltip: 'Select and move segments' },
    { id: 'elevation', name: 'Elevation', icon: '📐', tooltip: 'Adjust segment elevation' },
    { id: 'bridge', name: 'Bridge', icon: '🌉', tooltip: 'Create bridge/overpass' },
    { id: 'tunnel', name: 'Tunnel', icon: '🕳️', tooltip: 'Create tunnel/underpass' },
    { id: 'divider', name: 'Divider', icon: '🚧', tooltip: 'Add median dividers' },
    { id: 'lanes', name: 'Lanes', icon: '🛣️', tooltip: 'Modify lane configuration' },
    { id: 'traffic', name: 'Traffic', icon: '🚦', tooltip: 'Add traffic elements' },
    { id: 'measure', name: 'Measure', icon: '📏', tooltip: 'Measure distances' }
  ]

  useEffect(() => {
    setModifiedRoad(roadData)
    _setHistory([roadData])
    _setHistoryIndex(0)
  }, [roadData])

  // 2.5D transformation utilities
  const transform2_5D = useCallback((x, y, z = 0) => {
    const rad = Math.PI / 180
    const cosX = Math.cos(viewAngle.x * rad)
    
    // Isometric projection
    const isoX = (x - z) * Math.cos(30 * rad)
    const isoY = (x + z) * Math.sin(30 * rad) - y * cosX
    
    return { x: isoX, y: isoY }
  }, [viewAngle])

  const calculateShadow = useCallback((x, y, z) => {
    const shadowOffset = z * 0.6
    return {
      x: x + lighting.direction[0] * shadowOffset,
      y: y + lighting.direction[1] * shadowOffset,
      opacity: Math.max(0.15, 0.7 - z * 0.08)
    }
  }, [lighting.direction])

  // const snapToGridPoint = useCallback((x, y) => {
  //   if (!snapToGrid) return { x, y }
  //   return {
  //     x: Math.round(x / gridSize) * gridSize,
  //     y: Math.round(y / gridSize) * gridSize
  //   }
  // }, [snapToGrid, gridSize])

  const drawProfessionalGrid = useCallback((ctx) => {
    if (!showGrid) return

    const canvas = ctx.canvas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.setLineDash([1, 4])

    // Major grid lines
    for (let x = 0; x <= canvas.width; x += gridSize * 4) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y <= canvas.height; y += gridSize * 4) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Minor grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }, [showGrid, gridSize])

  const drawBridgeStructure = useCallback((ctx, startX, baseY, segmentWidth, z) => {
    // Bridge pillars with enhanced 3D effect
    const pillarPositions = [
      startX + segmentWidth * 0.25,
      startX + segmentWidth * 0.75
    ]
    
    pillarPositions.forEach(pillarX => {
      const pillarTop = transform2_5D(pillarX, baseY + 50, z)
      const pillarBottom = transform2_5D(pillarX, baseY + 50, 0)
      
      // Pillar 3D effect
      const pillarGradient = ctx.createLinearGradient(
        pillarBottom.x - 12, pillarBottom.y,
        pillarBottom.x + 12, pillarBottom.y
      )
      pillarGradient.addColorStop(0, '#9ca3af')
      pillarGradient.addColorStop(0.5, '#6b7280')
      pillarGradient.addColorStop(1, '#4b5563')
      
      ctx.fillStyle = pillarGradient
      ctx.fillRect(pillarTop.x - 10, pillarTop.y, 20, pillarBottom.y - pillarTop.y)
      
      // Pillar highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.fillRect(pillarTop.x - 10, pillarTop.y, 6, pillarBottom.y - pillarTop.y)
      
      // Pillar shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(pillarTop.x + 8, pillarTop.y, 4, pillarBottom.y - pillarTop.y)
    })
    
    // Bridge deck with structural details
    const deckTop = transform2_5D(startX, baseY, z - 5)
    
    const deckGradient = ctx.createLinearGradient(
      deckTop.x, deckTop.y,
      deckTop.x, deckTop.y + 15
    )
    deckGradient.addColorStop(0, '#8b5cf6')
    deckGradient.addColorStop(1, '#7c3aed')
    
    ctx.fillStyle = deckGradient
    ctx.fillRect(deckTop.x, deckTop.y, segmentWidth * 0.86, 15)
    
    // Structural beams
    for (let beam = 0; beam < 5; beam++) {
      const beamX = startX + (beam * segmentWidth / 4)
      const beamPos = transform2_5D(beamX, baseY + 50, z - 3)
      
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(beamPos.x - 2, beamPos.y, 4, 8)
    }
  }, [transform2_5D])

  const drawTunnelStructure = useCallback((ctx, startX, baseY, segmentWidth, z) => {
    // Tunnel entrance with perspective
    const entranceLeft = transform2_5D(startX, baseY - 10, z)
    const entranceRight = transform2_5D(startX + segmentWidth, baseY - 10, z)
    
    // Tunnel arch
    const archGradient = ctx.createLinearGradient(
      entranceLeft.x, entranceLeft.y,
      entranceLeft.x, entranceLeft.y + 30
    )
    archGradient.addColorStop(0, '#374151')
    archGradient.addColorStop(1, '#1f2937')
    
    ctx.fillStyle = archGradient
    ctx.beginPath()
    ctx.arc((entranceLeft.x + entranceRight.x) / 2, entranceLeft.y + 15, segmentWidth * 0.4, 0, Math.PI)
    ctx.fill()
    
    // Tunnel lighting
    const lightSpacing = segmentWidth / 6
    for (let i = 0; i < 6; i++) {
      const lightX = startX + (i * lightSpacing) + lightSpacing/2
      const lightPos = transform2_5D(lightX, baseY + 20, z + 8)
      
      // Light fixture
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(lightPos.x, lightPos.y, 3, 0, 2 * Math.PI)
      ctx.fill()
      
      // Light glow
      const glowGradient = ctx.createRadialGradient(
        lightPos.x, lightPos.y, 0,
        lightPos.x, lightPos.y, 15
      )
      glowGradient.addColorStop(0, 'rgba(251, 191, 36, 0.4)')
      glowGradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
      
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(lightPos.x, lightPos.y, 15, 0, 2 * Math.PI)
      ctx.fill()
    }
  }, [transform2_5D])

  const drawTechnicalAnnotations = useCallback((ctx, segment, startX, baseY, segmentWidth, z, index) => {
    // Technical specification panel
    const panelX = startX + segmentWidth + 20
    const panelY = baseY - 60
    const panelWidth = 180
    const panelHeight = 140
    
    // Panel background
    ctx.fillStyle = 'rgba(42, 42, 42, 0.95)'
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight)
    
    ctx.strokeStyle = '#0084ff'
    ctx.lineWidth = 1
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)
    
    // Panel title
    ctx.fillStyle = '#0084ff'
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Segment ${index + 1} Properties`, panelX + 10, panelY + 18)
    
    // Technical specifications
    ctx.fillStyle = '#f0f0f0'
    ctx.font = '11px Inter, monospace'
    
    const specs = [
      `Type: ${segment.type || 'Standard'}`,
      `Lanes: ${segment.lanes || 4}`,
      `Speed: ${segment.speed || 60} km/h`,
      `Elevation: ${z}m`,
      `Width: ${segmentWidth.toFixed(1)}px`,
      `Length: ${segment.length || '1.2km'}`,
      `Material: ${segment.type === 'overpass' ? 'Concrete' : 'Asphalt'}`,
      `Grade: ${Math.abs(z) > 0 ? `${(z/10).toFixed(1)}%` : '0%'}`
    ]
    
    specs.forEach((spec, i) => {
      ctx.fillText(spec, panelX + 10, panelY + 40 + (i * 14))
    })
    
    // Connection line to segment
    ctx.strokeStyle = 'rgba(0, 132, 255, 0.5)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(panelX, panelY + panelHeight/2)
    ctx.lineTo(startX + segmentWidth/2, baseY + 50)
    ctx.stroke()
    ctx.setLineDash([])
  }, [])

  const drawEnhancedRoadSegment = useCallback((ctx, segment, index, isSelected = false) => {
    const segmentWidth = 800 / modifiedRoad.segments.length
    const startX = 200 + (index * segmentWidth)
    const baseY = 250
    const elevation = segment.elevation || 0
    const z = elevation

    // Transform corner points
    const corners = [
      transform2_5D(startX, baseY, z),
      transform2_5D(startX + segmentWidth, baseY, z),
      transform2_5D(startX + segmentWidth, baseY + 100, z),
      transform2_5D(startX, baseY + 100, z)
    ]

    // Draw shadow if elevated
    if (z > 0) {
      const shadowCorners = corners.map(corner => 
        calculateShadow(corner.x, corner.y, z)
      )
      
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowCorners[0].opacity})`
      ctx.beginPath()
      ctx.moveTo(shadowCorners[0].x, shadowCorners[0].y)
      shadowCorners.slice(1).forEach(corner => 
        ctx.lineTo(corner.x, corner.y)
      )
      ctx.closePath()
      ctx.fill()
    }

    // Road surface with advanced materials
    const surfaceGradient = ctx.createLinearGradient(
      corners[0].x, corners[0].y,
      corners[2].x, corners[2].y
    )

    let surfaceColors = ['#4a5568', '#2d3748', '#1a202c']
    if (segment.type === 'overpass' || segment.hasBridge) {
      surfaceColors = ['#6366f1', '#4f46e5', '#4338ca']
    } else if (segment.type === 'tunnel') {
      surfaceColors = ['#374151', '#1f2937', '#111827']
    }

    surfaceColors.forEach((color, index) => {
      surfaceGradient.addColorStop(index / (surfaceColors.length - 1), color)
    })

    ctx.fillStyle = surfaceGradient
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    corners.slice(1).forEach(corner => ctx.lineTo(corner.x, corner.y))
    ctx.closePath()
    ctx.fill()

    // Wireframe overlay if enabled
    if (showWireframe) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Selection highlight
    if (isSelected) {
      ctx.strokeStyle = '#0084ff'
      ctx.lineWidth = 3
      ctx.setLineDash([])
      ctx.stroke()
      
      // Selection glow
      ctx.shadowColor = '#0084ff'
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // Enhanced lane dividers with perspective
    const laneCount = segment.lanes || 4
    for (let lane = 1; lane < laneCount; lane++) {
      const laneY = baseY + (lane * 100 / laneCount)
      const laneStart = transform2_5D(startX, laneY, z)
      const laneEnd = transform2_5D(startX + segmentWidth, laneY, z)
      
      const isMedian = segment.hasMedian && lane === Math.floor(laneCount / 2)
      
      ctx.strokeStyle = isMedian ? '#10b981' : 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = isMedian ? 4 : 2
      ctx.setLineDash(isMedian ? [] : [8, 8])
      
      if (isMedian) {
        // Enhanced median with 3D effect
        const medianGradient = ctx.createLinearGradient(
          laneStart.x, laneStart.y - 5,
          laneStart.x, laneStart.y + 5
        )
        medianGradient.addColorStop(0, '#34d399')
        medianGradient.addColorStop(1, '#10b981')
        
        ctx.fillStyle = medianGradient
        ctx.fillRect(laneStart.x, laneStart.y - 3, laneEnd.x - laneStart.x, 6)
      }
      
      ctx.beginPath()
      ctx.moveTo(laneStart.x, laneStart.y)
      ctx.lineTo(laneEnd.x, laneEnd.y)
      ctx.stroke()
    }

    // Enhanced 3D structures
    if (segment.type === 'overpass' || segment.hasBridge) {
      drawBridgeStructure(ctx, startX, baseY, segmentWidth, z, index)
    } else if (segment.type === 'tunnel') {
      drawTunnelStructure(ctx, startX, baseY, segmentWidth, z, index)
    }

    // Elevation indicators
    if (z !== 0) {
      const indicatorPos = transform2_5D(startX + segmentWidth/2, baseY - 30, z)
      
      // Elevation label background
      ctx.fillStyle = 'rgba(42, 42, 42, 0.9)'
      ctx.fillRect(indicatorPos.x - 25, indicatorPos.y - 15, 50, 20)
      
      ctx.strokeStyle = z > 0 ? '#10b981' : '#ef4444'
      ctx.lineWidth = 1
      ctx.strokeRect(indicatorPos.x - 25, indicatorPos.y - 15, 50, 20)
      
      // Elevation text
      ctx.fillStyle = '#f0f0f0'
      ctx.font = 'bold 11px Inter, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${z > 0 ? '+' : ''}${z}m`, indicatorPos.x, indicatorPos.y - 2)
    }

    // Technical annotations for selected segment
    if (isSelected) {
      drawTechnicalAnnotations(ctx, segment, startX, baseY, segmentWidth, z, index)
    }

  }, [modifiedRoad, transform2_5D, calculateShadow, showWireframe, drawBridgeStructure, drawTunnelStructure, drawTechnicalAnnotations])

  const clearCanvas = useCallback((ctx) => {
    // Professional dark background with subtle gradient
    const bgGradient = ctx.createRadialGradient(
      500, 300, 0,
      500, 300, 800
    )
    bgGradient.addColorStop(0, '#2a2a2a')
    bgGradient.addColorStop(1, '#1a1a1a')
    
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, 1000, 600)
  }, [])

  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Hit detection for segments
    modifiedRoad.segments.forEach((segment, index) => {
      const segmentWidth = 800 / modifiedRoad.segments.length
      const startX = 200 + (index * segmentWidth)
      const baseY = 250
      
      if (clickX >= startX && clickX <= startX + segmentWidth && 
          y >= baseY && y <= baseY + 100) {
        setSelectedSegment(index)
        
        if (selectedTool === 'elevation') {
          setElevationMode(true)
        }
      }
    })
  }, [modifiedRoad, selectedTool])

  const handleMouseMove = useCallback((event) => {
    if (!dragState) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const _x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    if (elevationMode && selectedSegment !== null) {
      const deltaY = dragState.startY - y
      const newElevation = Math.round(deltaY / 5) * 5 // Snap to 5m increments
      
      const newRoad = { ...modifiedRoad }
      newRoad.segments[selectedSegment] = {
        ...newRoad.segments[selectedSegment],
        elevation: Math.max(-50, Math.min(100, newElevation))
      }
      
      setModifiedRoad(newRoad)
      onRoadModify?.(newRoad)
    }
  }, [dragState, elevationMode, selectedSegment, modifiedRoad, onRoadModify])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !modifiedRoad) return

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    clearCanvas(ctx)
    drawProfessionalGrid(ctx)

    // Sort segments by elevation for proper rendering
    const segmentIndices = [...Array(modifiedRoad.segments.length).keys()]
    segmentIndices.sort((a, b) => 
      (modifiedRoad.segments[a].elevation || 0) - (modifiedRoad.segments[b].elevation || 0)
    )

    // Render segments in elevation order
    segmentIndices.forEach(index => {
      drawEnhancedRoadSegment(
        ctx, 
        modifiedRoad.segments[index], 
        index, 
        selectedSegment === index
      )
    })

  }, [modifiedRoad, selectedSegment, showGrid, showWireframe, viewAngle, 
      clearCanvas, drawProfessionalGrid, drawEnhancedRoadSegment])

  return (
    <div className="enhanced-3d-road-editor">
      {/* Tool Panel */}
      <div className="editor-toolbar">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
            onClick={() => setSelectedTool(tool.id)}
            data-tooltip={tool.tooltip}
            title={tool.tooltip}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Viewport Controls */}
      <div className="viewport-controls">
        <div className="control-group">
          <label>View Angle:</label>
          <input
            type="range"
            min="0"
            max="45"
            value={viewAngle.x}
            onChange={(e) => setViewAngle(prev => ({ ...prev, x: parseInt(e.target.value) }))}
          />
          <span>{viewAngle.x}°</span>
        </div>
        
        <div className="control-group">
          <label>Grid Size:</label>
          <select value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))}>
            <option value={10}>10px</option>
            <option value={25}>25px</option>
            <option value={50}>50px</option>
          </select>
        </div>
        
        <div className="control-toggles">
          <label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Grid
          </label>
          <label>
            <input
              type="checkbox"
              checked={showWireframe}
              onChange={(e) => setShowWireframe(e.target.checked)}
            />
            Wireframe
          </label>
          <label>
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
            />
            Snap to Grid
          </label>
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        className="viewport-canvas"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          setDragState({
            startX: e.clientX - rect.left,
            startY: e.clientY - rect.top
          })
        }}
        onMouseUp={() => {
          setDragState(null)
          setElevationMode(false)
        }}
        style={{
          cursor: selectedTool === 'elevation' ? 'ns-resize' : 
                 selectedTool === 'select' ? 'pointer' : 'crosshair'
        }}
      />

      {/* Status Bar */}
      <div className="editor-status-bar">
        <span>Tool: {tools.find(t => t.id === selectedTool)?.name}</span>
        <span>Selected: {selectedSegment !== null ? `Segment ${selectedSegment + 1}` : 'None'}</span>
        <span>Grid: {gridSize}px</span>
        <span>View: {viewAngle.x}°</span>
      </div>
    </div>
  )
}

export default Enhanced3DRoadEditor
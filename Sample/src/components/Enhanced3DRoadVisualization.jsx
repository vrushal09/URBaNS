import React, { useRef, useEffect, useState, useCallback } from 'react'

const Enhanced3DRoadVisualization = ({ roadData }) => {
  const canvasRef = useRef(null)
  const [viewAngle, setViewAngle] = useState({ x: 15, y: 0, z: 0 }) // Isometric-like angle
  const [lighting, setLighting] = useState({ direction: [-1, -1, -2], intensity: 0.8 })
  const [shadowQuality, setShadowQuality] = useState('high')

  // 2.5D transformation utilities
  const transform2_5D = useCallback((x, y, z = 0, angle = viewAngle) => {
    // Isometric projection with depth
    const rad = Math.PI / 180
    const cosX = Math.cos(angle.x * rad)
    
    // Apply isometric transformation
    const isoX = (x - z) * Math.cos(30 * rad)
    const isoY = (x + z) * Math.sin(30 * rad) - y * cosX
    
    return { x: isoX, y: isoY }
  }, [viewAngle])

  const calculateShadow = useCallback((x, y, z, lightDir) => {
    // Calculate shadow position based on light direction
    const shadowOffset = z * 0.5 // Shadow projection based on height
    return {
      x: x + lightDir[0] * shadowOffset,
      y: y + lightDir[1] * shadowOffset,
      opacity: Math.max(0.1, 0.6 - z * 0.1)
    }
  }, [])

  const drawGradient = useCallback((ctx, x1, y1, x2, y2, colors) => {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color)
    })
    return gradient
  }, [])

  const draw3DRoadSegment = useCallback((ctx, segment, index, totalSegments) => {
    const segmentWidth = 800 / totalSegments
    const startX = 200 + (index * segmentWidth)
    const baseY = 300
    const elevation = segment.elevation || 0
    const isOverpass = segment.type === 'overpass' || segment.hasBridge
    
    // Calculate 3D positions
    const z = isOverpass ? 40 + elevation : elevation
    const corners = [
      transform2_5D(startX, baseY, z),
      transform2_5D(startX + segmentWidth, baseY, z),
      transform2_5D(startX + segmentWidth, baseY + 120, z),
      transform2_5D(startX, baseY + 120, z)
    ]
    
    // Draw shadow first (if elevated)
    if (z > 0) {
      const shadowCorners = corners.map(corner => 
        calculateShadow(corner.x, corner.y, z, lighting.direction)
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
    
    // Draw road surface with depth
    const surfaceGradient = drawGradient(ctx, 
      corners[0].x, corners[0].y, 
      corners[2].x, corners[2].y, 
      isOverpass ? 
        ['#4a5568', '#2d3748', '#1a202c'] : 
        ['#374151', '#1f2937', '#111827']
    )
    
    ctx.fillStyle = surfaceGradient
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    corners.slice(1).forEach(corner => ctx.lineTo(corner.x, corner.y))
    ctx.closePath()
    ctx.fill()
    
    // Draw road edges with lighting
    const lightIntensity = Math.max(0.3, lighting.intensity)
    const edgeColor = `rgba(251, 191, 36, ${lightIntensity})`
    
    ctx.strokeStyle = edgeColor
    ctx.lineWidth = 3
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    corners.forEach(corner => ctx.lineTo(corner.x, corner.y))
    ctx.closePath()
    ctx.stroke()
    
    // Draw lane dividers with perspective
    const laneCount = segment.lanes || 4
    for (let lane = 1; lane < laneCount; lane++) {
      const laneY = baseY + (lane * 120 / laneCount)
      const laneStart = transform2_5D(startX, laneY, z)
      const laneEnd = transform2_5D(startX + segmentWidth, laneY, z)
      
      ctx.strokeStyle = segment.hasMedian && lane === Math.floor(laneCount / 2) ? 
        '#10b981' : 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = segment.hasMedian && lane === Math.floor(laneCount / 2) ? 4 : 2
      ctx.setLineDash(segment.hasMedian && lane === Math.floor(laneCount / 2) ? [] : [10, 10])
      
      ctx.beginPath()
      ctx.moveTo(laneStart.x, laneStart.y)
      ctx.lineTo(laneEnd.x, laneEnd.y)
      ctx.stroke()
    }
    
    // Draw bridge/overpass structure
    if (isOverpass) {
      // Bridge pillars with perspective
      const pillarPositions = [
        startX + segmentWidth * 0.2,
        startX + segmentWidth * 0.8
      ]
      
      pillarPositions.forEach(pillarX => {
        const pillarTop = transform2_5D(pillarX, baseY + 60, z)
        const pillarBottom = transform2_5D(pillarX, baseY + 60, 0)
        
        // Pillar gradient for 3D effect
        const pillarGradient = drawGradient(ctx,
          pillarBottom.x - 10, pillarBottom.y,
          pillarBottom.x + 10, pillarBottom.y,
          ['#6b7280', '#4b5563', '#374151']
        )
        
        ctx.fillStyle = pillarGradient
        ctx.fillRect(pillarTop.x - 8, pillarTop.y, 16, pillarBottom.y - pillarTop.y)
        
        // Pillar highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.fillRect(pillarTop.x - 8, pillarTop.y, 4, pillarBottom.y - pillarTop.y)
      })
      
      // Bridge structure details
      const structureGradient = drawGradient(ctx,
        corners[0].x, corners[0].y - 10,
        corners[0].x, corners[0].y,
        ['#8b5cf6', '#7c3aed', '#6d28d9']
      )
      
      ctx.fillStyle = structureGradient
      ctx.fillRect(corners[0].x, corners[0].y - 10, segmentWidth * 0.8, 10)
    }
    
    // Add traffic elements with 3D positioning
    if (segment.hasTrafficLights) {
      const lightPos = transform2_5D(startX + segmentWidth - 30, baseY - 20, z + 15)
      
      // Traffic light pole
      ctx.fillStyle = '#374151'
      ctx.fillRect(lightPos.x - 2, lightPos.y, 4, 25)
      
      // Traffic light box with perspective
      const lightBoxGradient = drawGradient(ctx,
        lightPos.x - 8, lightPos.y,
        lightPos.x + 8, lightPos.y,
        ['#1f2937', '#111827']
      )
      
      ctx.fillStyle = lightBoxGradient
      ctx.fillRect(lightPos.x - 8, lightPos.y, 16, 12)
      
      // Light (green for flow visualization)
      ctx.fillStyle = '#10b981'
      ctx.beginPath()
      ctx.arc(lightPos.x, lightPos.y + 6, 4, 0, 2 * Math.PI)
      ctx.fill()
      
      // Light glow effect
      const glowGradient = ctx.createRadialGradient(
        lightPos.x, lightPos.y + 6, 0,
        lightPos.x, lightPos.y + 6, 12
      )
      glowGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)')
      glowGradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
      
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(lightPos.x, lightPos.y + 6, 12, 0, 2 * Math.PI)
      ctx.fill()
    }
    
    // Speed limit signs with 3D effect
    const signPos = transform2_5D(startX + 20, baseY - 30, z + 10)
    
    // Sign post
    ctx.fillStyle = '#6b7280'
    ctx.fillRect(signPos.x - 1, signPos.y, 2, 20)
    
    // Sign background with perspective
    const signGradient = drawGradient(ctx,
      signPos.x - 15, signPos.y,
      signPos.x + 15, signPos.y,
      ['#ef4444', '#dc2626', '#b91c1c']
    )
    
    ctx.fillStyle = signGradient
    ctx.fillRect(signPos.x - 15, signPos.y, 30, 20)
    
    // Sign border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(signPos.x - 15, signPos.y, 30, 20)
    
    // Speed text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(segment.speed || '60', signPos.x, signPos.y + 14)
    
    // Add environmental elements for realism
    if (segment.hasMedian && segment.medianType === 'trees') {
      const treeCount = Math.floor(segmentWidth / 60)
      for (let i = 0; i < treeCount; i++) {
        const treeX = startX + 40 + (i * 60)
        const treePos = transform2_5D(treeX, baseY + 60, z + 15)
        
        // Tree crown with gradient
        const treeGradient = drawGradient(ctx,
          treePos.x, treePos.y - 10,
          treePos.x, treePos.y + 10,
          ['#22c55e', '#16a34a', '#15803d']
        )
        
        ctx.fillStyle = treeGradient
        ctx.beginPath()
        ctx.arc(treePos.x, treePos.y, 8, 0, 2 * Math.PI)
        ctx.fill()
        
        // Tree trunk
        const trunkPos = transform2_5D(treeX, baseY + 60, z + 5)
        ctx.fillStyle = '#92400e'
        ctx.fillRect(trunkPos.x - 1, trunkPos.y, 2, 10)
      }
    }
    
  }, [transform2_5D, calculateShadow, drawGradient, lighting])

  const clearCanvas = useCallback((ctx) => {
    // Professional gradient background
    const bgGradient = ctx.createRadialGradient(
      600, 300, 0,
      600, 300, 800
    )
    bgGradient.addColorStop(0, '#2a2a2a')
    bgGradient.addColorStop(1, '#1a1a1a')
    
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, 1200, 600)
    
    // Add subtle grid for professional look
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    
    for (let x = 0; x <= 1200; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 600)
      ctx.stroke()
    }
    
    for (let y = 0; y <= 600; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1200, y)
      ctx.stroke()
    }
    
    ctx.setLineDash([])
  }, [])

  const drawViewportInfo = useCallback((ctx) => {
    // Professional viewport info overlay
    ctx.fillStyle = 'rgba(42, 42, 42, 0.9)'
    ctx.fillRect(10, 10, 280, 80)
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(10, 10, 280, 80)
    
    ctx.fillStyle = '#f0f0f0'
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'left'
    
    ctx.fillText(`View Angle: X:${viewAngle.x}° Y:${viewAngle.y}° Z:${viewAngle.z}°`, 20, 30)
    ctx.fillText(`Light Direction: [${lighting.direction.join(', ')}]`, 20, 45)
    ctx.fillText(`Shadow Quality: ${shadowQuality}`, 20, 60)
    ctx.fillText(`Projection: Isometric 2.5D`, 20, 75)
  }, [viewAngle, lighting, shadowQuality])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !roadData) return

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    clearCanvas(ctx)

    // Sort segments by elevation for proper rendering order
    const sortedSegments = [...roadData.segments].sort((a, b) => 
      (a.elevation || 0) - (b.elevation || 0)
    )

    // Draw segments from bottom to top (painter's algorithm)
    sortedSegments.forEach((segment, index) => {
      draw3DRoadSegment(ctx, segment, index, roadData.segments.length)
    })

    drawViewportInfo(ctx)

  }, [roadData, viewAngle, lighting, shadowQuality, clearCanvas, draw3DRoadSegment, drawViewportInfo])

  return (
    <div className="enhanced-3d-road-container">
      <div className="viewport-controls">
        <div className="control-group">
          <label>View Angle X:</label>
          <input
            type="range"
            min="-45"
            max="45"
            value={viewAngle.x}
            onChange={(e) => setViewAngle(prev => ({ ...prev, x: parseInt(e.target.value) }))}
          />
          <span>{viewAngle.x}°</span>
        </div>
        
        <div className="control-group">
          <label>Light Intensity:</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={lighting.intensity}
            onChange={(e) => setLighting(prev => ({ ...prev, intensity: parseFloat(e.target.value) }))}
          />
          <span>{lighting.intensity}</span>
        </div>
        
        <div className="control-group">
          <label>Shadow Quality:</label>
          <select 
            value={shadowQuality}
            onChange={(e) => setShadowQuality(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="viewport-canvas"
        style={{
          background: 'radial-gradient(circle at center, #2a2a2a 0%, #1a1a1a 100%)',
          border: '1px solid #404040'
        }}
      />
    </div>
  )
}

export default Enhanced3DRoadVisualization
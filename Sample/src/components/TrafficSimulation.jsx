import React, { useRef, useEffect, useState, useCallback } from 'react'

const TrafficSimulation = ({ roadData, originalRoad, isRunning, compareMode }) => {
  const canvasRef = useRef(null)
  const [vehicles, setVehicles] = useState([])
  const [originalVehicles, setOriginalVehicles] = useState([])
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [simulationTime, setSimulationTime] = useState(0)
  const animationRef = useRef(null)

  const generateVehicles = useCallback((roadConfig, count = 50) => {
    if (!roadConfig) return []
    
    const newVehicles = []
    for (let i = 0; i < count; i++) {
      const segment = roadConfig.segments[Math.floor(Math.random() * roadConfig.segments.length)]
      const lane = Math.floor(Math.random() * segment.lanes)
      const laneY = compareMode 
        ? (200 + (lane * 30) + Math.random() * 15)  // Smaller lanes in compare mode
        : (200 + (lane * 40) + Math.random() * 20)
      
      // Determine vehicle type based on lane
      let vehicleType = 'car'
      const isBusLane = segment.hasBusLane && (lane === 0 || lane === segment.lanes - 1)
      if (isBusLane && Math.random() > 0.3) {
        vehicleType = 'bus'
      } else if (Math.random() > 0.8) {
        vehicleType = 'truck'
      }
      
      // Determine direction for two-way roads
      const isOppositeDirection = segment.direction === 'both' && lane >= Math.floor(segment.lanes / 2)
      const direction = segment.direction === 'forward' ? 1 : isOppositeDirection ? -1 : 1
      
      newVehicles.push({
        id: `${roadConfig.id || 'road'}_${i}`,
        x: direction === 1 ? Math.random() * 1200 : 1200 - Math.random() * 1200,
        y: laneY,
        speed: (segment.speed * 0.6 + (Math.random() - 0.5) * 20) * direction,
        lane: lane,
        segment: segment.id,
        type: vehicleType,
        color: getVehicleColor(vehicleType),
        roadId: roadConfig.id || 'main',
        direction: direction,
        isBusLane: isBusLane
      })
    }
    
    return newVehicles
  }, [compareMode])

  const getVehicleColor = (vehicleType = 'car') => {
    switch (vehicleType) {
      case 'bus':
        return '#f59e0b' // Yellow/orange for buses
      case 'truck':
        return '#6b7280' // Gray for trucks
      default: {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
        return colors[Math.floor(Math.random() * colors.length)]
      }
    }
  }

  const clearCanvas = useCallback((ctx) => {
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, 1200, 600)
  }, [])

  const drawRoad = useCallback((ctx, road, yOffset = 0, isOriginal = false) => {
    if (!road) return

    const roadY = 150 + yOffset
    const roadHeight = compareMode ? 150 : 300
    
    // Draw segments with their individual characteristics
    road.segments.forEach((segment, index) => {
      const segmentWidth = 1200 / road.segments.length
      const startX = index * segmentWidth
      const segmentRoadHeight = roadHeight * (segment.lanes / Math.max(...road.segments.map(s => s.lanes)))
      const segmentRoadY = roadY + (roadHeight - segmentRoadHeight) / 2
      
      // Apply bridge elevation
      const elevation = segment.hasBridge ? -10 : 0
      const adjustedRoadY = segmentRoadY + elevation
      
      // Segment background
      let segmentColor = isOriginal ? '#34495E' : '#2C3E50'
      if (segment.hasBridge) segmentColor = '#8b5cf6' // Purple for bridges
      
      ctx.fillStyle = segmentColor
      ctx.fillRect(startX, adjustedRoadY, segmentWidth, segmentRoadHeight)
      
      // Draw bridge structure
      if (segment.hasBridge) {
        // Bridge pillars
        ctx.fillStyle = '#6b7280'
        ctx.fillRect(startX + 20, adjustedRoadY + segmentRoadHeight, 8, 20)
        ctx.fillRect(startX + segmentWidth - 28, adjustedRoadY + segmentRoadHeight, 8, 20)
        
        // Bridge shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.fillRect(startX, adjustedRoadY + segmentRoadHeight + 5, segmentWidth, 8)
      }
      
      // Draw lanes
      const laneHeight = segmentRoadHeight / segment.lanes
      const halfLanes = Math.floor(segment.lanes / 2)
      
      for (let lane = 0; lane < segment.lanes; lane++) {
        const laneY = adjustedRoadY + (lane * laneHeight)
        
        // Bus lane highlighting
        if (segment.hasBusLane && (lane === 0 || lane === segment.lanes - 1)) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.4)' // Yellow for bus lanes
          ctx.fillRect(startX, laneY, segmentWidth, laneHeight)
          
          // Bus lane text
          ctx.fillStyle = '#f59e0b'
          ctx.font = 'bold 8px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('BUS ONLY', startX + segmentWidth/2, laneY + laneHeight/2 + 2)
        }
        
        // Direction arrows for opposite traffic
        if (segment.direction === 'both' && lane >= halfLanes) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('←', startX + segmentWidth/2, laneY + laneHeight/2 + 3)
        } else if (segment.direction === 'forward') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('→', startX + segmentWidth/2, laneY + laneHeight/2 + 3)
        }
        
        // Lane dividers
        if (lane > 0) {
          let dividerColor = '#ECF0F1'
          let lineWidth = 1
          
          // Center median
          if (segment.hasMedian && lane === halfLanes) {
            dividerColor = '#10b981'
            lineWidth = 3
            
            // Draw trees on median
            if (segment.medianType === 'trees') {
              for (let treeX = startX + 30; treeX < startX + segmentWidth - 30; treeX += 50) {
                ctx.fillStyle = '#059669'
                ctx.beginPath()
                ctx.arc(treeX, laneY - 3, 5, 0, 2 * Math.PI)
                ctx.fill()
                
                // Tree trunk
                ctx.fillStyle = '#92400e'
                ctx.fillRect(treeX - 1, laneY - 3, 2, 6)
              }
            }
          }
          
          ctx.strokeStyle = dividerColor
          ctx.lineWidth = lineWidth
          ctx.setLineDash(segment.hasMedian && lane === halfLanes ? [] : [6, 6])
          ctx.beginPath()
          ctx.moveTo(startX, laneY)
          ctx.lineTo(startX + segmentWidth, laneY)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    })
    
    // Road edges
    ctx.setLineDash([])
    ctx.lineWidth = 3
    ctx.strokeStyle = isOriginal ? '#E67E22' : '#F39C12'
    
    ctx.beginPath()
    ctx.moveTo(0, roadY)
    ctx.lineTo(1200, roadY)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(0, roadY + roadHeight)
    ctx.lineTo(1200, roadY + roadHeight)
    ctx.stroke()

    // Road labels
    if (compareMode) {
      ctx.fillStyle = 'white'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(isOriginal ? 'Original Road' : 'Modified Road', 10, roadY - 10)
    }

    // Traffic lights and signs
    const intersections = [250, 500, 750, 1000]
    intersections.forEach(x => {
      ctx.fillStyle = '#27AE60'  // Green light for flow
      ctx.beginPath()
      ctx.arc(x, roadY - 15, 5, 0, 2 * Math.PI)
      ctx.fill()
    })
  }, [compareMode])

  const drawVehicle = useCallback((ctx, vehicle, scale = 1) => {
    const { x, y, type, color, direction = 1 } = vehicle
    
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(scale * direction, scale) // Flip for opposite direction
    
    if (type === 'bus') {
      // Draw bus
      ctx.fillStyle = color
      ctx.fillRect(-20, -8, 40, 16)
      ctx.fillRect(-22, -6, 4, 12)
      
      // Bus windows
      ctx.fillStyle = '#87CEEB'
      ctx.fillRect(-15, -6, 6, 4)
      ctx.fillRect(-7, -6, 6, 4)
      ctx.fillRect(1, -6, 6, 4)
      ctx.fillRect(9, -6, 6, 4)
      
      // Wheels
      ctx.fillStyle = '#2C3E50'
      ctx.beginPath()
      ctx.arc(-15, 8, 3, 0, 2 * Math.PI)
      ctx.arc(-5, 8, 3, 0, 2 * Math.PI)
      ctx.arc(5, 8, 3, 0, 2 * Math.PI)
      ctx.arc(15, 8, 3, 0, 2 * Math.PI)
      ctx.fill()
      
      // Bus number
      ctx.fillStyle = 'white'
      ctx.font = 'bold 8px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('BUS', 0, 2)
    } else if (type === 'truck') {
      // Draw truck
      ctx.fillStyle = color
      ctx.fillRect(-15, -8, 30, 16)
      ctx.fillRect(-20, -6, 8, 12)
      
      // Wheels
      ctx.fillStyle = '#2C3E50'
      ctx.beginPath()
      ctx.arc(-12, 8, 3, 0, 2 * Math.PI)
      ctx.arc(8, 8, 3, 0, 2 * Math.PI)
      ctx.fill()
    } else {
      // Draw car
      ctx.fillStyle = color
      ctx.fillRect(-10, -5, 20, 10)
      ctx.fillRect(-12, -4, 4, 8)
      
      // Wheels
      ctx.fillStyle = '#2C3E50'
      ctx.beginPath()
      ctx.arc(-8, 5, 2, 0, 2 * Math.PI)
      ctx.arc(8, 5, 2, 0, 2 * Math.PI)
      ctx.fill()
    }
    
    ctx.restore()
  }, [])

  const updateVehicles = useCallback((vehicleList, setVehicleList) => {
    setVehicleList(prevVehicles => 
      prevVehicles.map(vehicle => {
        const direction = vehicle.direction || 1
        let speedMultiplier = simulationSpeed / 20
        
        // Bus priority - buses move slightly faster in bus lanes
        if (vehicle.type === 'bus' && vehicle.isBusLane) {
          speedMultiplier *= 1.2
        }
        
        let newX = vehicle.x + (vehicle.speed * speedMultiplier)
        
        // Reset position based on direction
        if (direction === 1 && newX > 1250) {
          newX = -50
        } else if (direction === -1 && newX < -50) {
          newX = 1250
        }
        
        // Traffic flow simulation - slower near intersections
        const nearIntersection = [250, 500, 750, 1000].some(intersection => 
          Math.abs(newX - intersection) < 50
        )
        
        if (nearIntersection) {
          newX = vehicle.x + (vehicle.speed * speedMultiplier / 2) // Slow down at intersections
        }
        
        // Advanced collision avoidance with direction consideration
        const nearbyVehicles = prevVehicles.filter(v => {
          if (v.id === vehicle.id) return false
          
          // Only consider vehicles in same direction and lane
          const sameDirection = (v.direction || 1) === direction
          const sameLane = Math.abs(v.y - vehicle.y) < 25
          
          if (!sameDirection || !sameLane) return false
          
          // Check if vehicle is ahead in the direction of travel
          if (direction === 1) {
            return v.x > newX && v.x - newX < 60
          } else {
            return v.x < newX && newX - v.x < 60
          }
        })
        
        if (nearbyVehicles.length > 0) {
          // More severe slowdown for regular vehicles, less for buses in bus lanes
          const slowdownFactor = (vehicle.type === 'bus' && vehicle.isBusLane) ? 40 : 60
          newX = vehicle.x + (vehicle.speed * speedMultiplier / slowdownFactor)
        }
        
        return {
          ...vehicle,
          x: newX
        }
      })
    )
  }, [simulationSpeed])

  const animate = useCallback(() => {
    if (!isRunning) return

    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    clearCanvas(ctx)
    
    if (compareMode && originalRoad) {
      // Draw original road on top
      drawRoad(ctx, originalRoad, 0, true)
      originalVehicles.forEach(vehicle => drawVehicle(ctx, vehicle, 0.8))
      
      // Draw modified road on bottom
      drawRoad(ctx, roadData, 200, false)
      vehicles.forEach(vehicle => drawVehicle(ctx, vehicle, 0.8))
    } else {
      // Single road view
      drawRoad(ctx, roadData, 0, false)
      vehicles.forEach(vehicle => drawVehicle(ctx, vehicle))
    }
    
    // Update vehicles
    updateVehicles(vehicles, setVehicles)
    if (compareMode) {
      updateVehicles(originalVehicles, setOriginalVehicles)
    }
    
    setSimulationTime(prev => prev + simulationSpeed)
    
    animationRef.current = requestAnimationFrame(animate)
  }, [isRunning, compareMode, originalRoad, roadData, vehicles, originalVehicles, clearCanvas, drawRoad, drawVehicle, updateVehicles, simulationSpeed])

  useEffect(() => {
    if (!roadData) return

    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = 1200
    canvas.height = 600

    // Generate vehicles for current road
    const newVehicles = generateVehicles(roadData, 40)
    setVehicles(newVehicles)

    // Generate vehicles for original road if in compare mode
    if (compareMode && originalRoad) {
      const newOriginalVehicles = generateVehicles({...originalRoad, id: 'original'}, 40)
      setOriginalVehicles(newOriginalVehicles)
    }
  }, [roadData, originalRoad, compareMode, generateVehicles])

  useEffect(() => {
    if (isRunning) {
      animate()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, animate])

  const getAverageSpeed = (vehicleList) => {
    if (vehicleList.length === 0) return 0
    const totalSpeed = vehicleList.reduce((sum, v) => sum + Math.abs(v.speed), 0)
    return Math.round(totalSpeed / vehicleList.length)
  }

  const getCongestionLevel = (vehicleList) => {
    const congestionCount = vehicleList.filter(v => Math.abs(v.speed) < 10).length
    const percentage = (congestionCount / vehicleList.length) * 100
    return Math.round(percentage)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Traffic Simulation</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Time: {Math.floor(simulationTime / 60)}:{(simulationTime % 60).toString().padStart(2, '0')}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Speed:</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-8">{simulationSpeed}x</span>
          </div>
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto bg-gray-50"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="font-medium text-blue-800">Active Vehicles</div>
          <div className="text-xl font-bold text-blue-600">
            {compareMode ? `${vehicles.length} / ${originalVehicles.length}` : vehicles.length}
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <div className="font-medium text-green-800">Avg Speed</div>
          <div className="text-xl font-bold text-green-600">
            {compareMode 
              ? `${getAverageSpeed(vehicles)} / ${getAverageSpeed(originalVehicles)}`
              : getAverageSpeed(vehicles)
            } km/h
          </div>
        </div>
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <div className="font-medium text-yellow-800">Congestion</div>
          <div className="text-xl font-bold text-yellow-600">
            {compareMode 
              ? `${getCongestionLevel(vehicles)}% / ${getCongestionLevel(originalVehicles)}%`
              : `${getCongestionLevel(vehicles)}%`
            }
          </div>
        </div>
        <div className="bg-purple-50 p-3 rounded border border-purple-200">
          <div className="font-medium text-purple-800">Efficiency</div>
          <div className="text-xl font-bold text-purple-600">
            {compareMode 
              ? `${Math.max(0, 100 - getCongestionLevel(vehicles))}% / ${Math.max(0, 100 - getCongestionLevel(originalVehicles))}%`
              : `${Math.max(0, 100 - getCongestionLevel(vehicles))}%`
            }
          </div>
        </div>
      </div>
      
      {compareMode && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="text-sm text-blue-800 font-medium mb-2">Comparison Mode Active</div>
          <div className="text-xs text-blue-700">
            📊 Top section shows original road performance • Bottom section shows modified road performance
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-600">
        🚦 Green lights indicate traffic flow • 🚗 Vehicle size represents type • Speed affects all traffic behavior
      </div>
    </div>
  )
}

export default TrafficSimulation
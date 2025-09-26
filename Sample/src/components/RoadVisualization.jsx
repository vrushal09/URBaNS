import React, { useRef, useEffect, useState, useCallback } from 'react'

const RoadVisualization = ({ roadData }) => {
  const canvasRef = useRef(null)
  const [vehicles, setVehicles] = useState([])
  const [timeOfDay, setTimeOfDay] = useState('morning')

  const getVehicleColor = useCallback(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  const clearCanvas = useCallback((ctx) => {
    ctx.fillStyle = '#f0f8ff'
    ctx.fillRect(0, 0, 1200, 600)
  }, [])

  const drawRoad = useCallback((ctx) => {
    if (!roadData) return

    // Draw road background
    ctx.fillStyle = '#2C3E50'
    ctx.fillRect(0, 150, 1200, 300)

    // Draw lane dividers
    const totalLanes = Math.max(...roadData.segments.map(s => s.lanes))
    const laneWidth = 300 / totalLanes

    ctx.strokeStyle = '#ECF0F1'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 10])

    for (let i = 1; i < totalLanes; i++) {
      const y = 150 + (i * laneWidth)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1200, y)
      ctx.stroke()
    }

    // Draw road edges
    ctx.setLineDash([])
    ctx.lineWidth = 4
    ctx.strokeStyle = '#F39C12'
    
    ctx.beginPath()
    ctx.moveTo(0, 150)
    ctx.lineTo(1200, 150)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(0, 450)
    ctx.lineTo(1200, 450)
    ctx.stroke()

    // Draw road segments with different characteristics
    roadData.segments.forEach((segment, index) => {
      const startX = (index / roadData.segments.length) * 1200
      
      // Speed limit signs
      ctx.fillStyle = '#E74C3C'
      ctx.fillRect(startX + 20, 100, 60, 40)
      ctx.fillStyle = 'white'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(segment.speed, startX + 50, 125)
      
      // Lane count indicators
      ctx.fillStyle = '#3498DB'
      ctx.fillRect(startX + 20, 470, 60, 40)
      ctx.fillStyle = 'white'
      ctx.fillText(`${segment.lanes}L`, startX + 50, 495)
    })

    // Draw traffic lights at intersections
    const intersections = [300, 600, 900]
    intersections.forEach(x => {
      // Traffic light pole
      ctx.fillStyle = '#34495E'
      ctx.fillRect(x - 5, 120, 10, 50)
      
      // Traffic light box
      ctx.fillStyle = '#2C3E50'
      ctx.fillRect(x - 15, 120, 30, 25)
      
      // Light (simplified - always green for flow)
      ctx.fillStyle = '#27AE60'
      ctx.beginPath()
      ctx.arc(x, 132, 8, 0, 2 * Math.PI)
      ctx.fill()
    })
  }, [roadData])

  const drawVehicle = useCallback((ctx, vehicle) => {
    const { x, y, type, color } = vehicle
    
    ctx.save()
    ctx.translate(x, y)
    
    if (type === 'truck') {
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
      ctx.fillRect(-10, -6, 20, 12)
      ctx.fillRect(-12, -4, 4, 8)
      
      // Wheels
      ctx.fillStyle = '#2C3E50'
      ctx.beginPath()
      ctx.arc(-8, 6, 2, 0, 2 * Math.PI)
      ctx.arc(8, 6, 2, 0, 2 * Math.PI)
      ctx.fill()
    }
    
    ctx.restore()
  }, [])

  const drawVehicles = useCallback((ctx) => {
    vehicles.forEach(vehicle => {
      drawVehicle(ctx, vehicle)
    })
  }, [vehicles, drawVehicle])

  const updateVehicles = useCallback(() => {
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => {
        let newX = vehicle.x + (vehicle.speed / 10)
        
        // Reset position if vehicle goes off screen
        if (newX > 1250) {
          newX = -50
        }
        
        // Simple collision avoidance
        const nearbyVehicles = prevVehicles.filter(v => 
          v.id !== vehicle.id && 
          Math.abs(v.x - newX) < 50 && 
          Math.abs(v.y - vehicle.y) < 30
        )
        
        if (nearbyVehicles.length > 0) {
          newX = vehicle.x + (vehicle.speed / 20) // Slow down
        }
        
        return {
          ...vehicle,
          x: newX
        }
      })
    )
  }, [])

  useEffect(() => {
    if (!roadData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = 1200
    canvas.height = 600

    // Generate initial vehicles based on traffic flow
    const generateVehiclesEffect = () => {
      const trafficData = roadData.trafficFlow[timeOfDay]
      const numVehicles = Math.floor(trafficData.density * 50) // Scale for visualization
      
      const newVehicles = []
      for (let i = 0; i < numVehicles; i++) {
        const segment = roadData.segments[Math.floor(Math.random() * roadData.segments.length)]
        const lane = Math.floor(Math.random() * segment.lanes)
        
        newVehicles.push({
          id: i,
          x: Math.random() * 1200,
          y: 200 + (lane * 40) + Math.random() * 20,
          speed: trafficData.avgSpeed + (Math.random() - 0.5) * 20,
          lane: lane,
          segment: segment.id,
          type: Math.random() > 0.7 ? 'truck' : 'car',
          color: getVehicleColor()
        })
      }
      
      setVehicles(newVehicles)
    }

    generateVehiclesEffect()
    
    // Animation loop
    const animate = () => {
      clearCanvas(ctx)
      drawRoad(ctx)
      drawVehicles(ctx)
      updateVehicles()
      requestAnimationFrame(animate)
    }
    
    animate()
  }, [roadData, timeOfDay, getVehicleColor, clearCanvas, drawRoad, drawVehicles, updateVehicles])

  const handleTimeChange = (newTime) => {
    setTimeOfDay(newTime)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">2D Road Visualization</h3>
        <div className="flex gap-2">
          {['morning', 'afternoon', 'evening', 'night'].map(time => (
            <button
              key={time}
              onClick={() => handleTimeChange(time)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                timeOfDay === time 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      {roadData && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-100 p-3 rounded">
            <div className="font-medium text-gray-700">Current Traffic</div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round(roadData.trafficFlow[timeOfDay].density * 100)}%
            </div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="font-medium text-gray-700">Avg Speed</div>
            <div className="text-lg font-bold text-green-600">
              {roadData.trafficFlow[timeOfDay].avgSpeed} km/h
            </div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="font-medium text-gray-700">Total Lanes</div>
            <div className="text-lg font-bold text-purple-600">
              {roadData.lanes}
            </div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="font-medium text-gray-700">Road Length</div>
            <div className="text-lg font-bold text-orange-600">
              {roadData.length}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-600">
        🚗 Real-time traffic simulation based on imported data • Time: {timeOfDay} • 
        Vehicles: {vehicles.length} • Click time buttons to see traffic patterns
      </div>
    </div>
  )
}

export default RoadVisualization
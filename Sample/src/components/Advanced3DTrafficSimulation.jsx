import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'

const Advanced3DTrafficSimulation = ({ roadData, originalRoad, isRunning, compareMode }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [vehicles, setVehicles] = useState([])
  const [_originalVehicles, setOriginalVehicles] = useState([])
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [simulationTime, setSimulationTime] = useState(0)
  const [physicsEngine, setPhysicsEngine] = useState('enhanced')
  const [renderQuality, setRenderQuality] = useState('high')
  const [showVehicleInfo, setShowVehicleInfo] = useState(false)
  const [viewAngle, setViewAngle] = useState({ x: 20, y: 0, z: 0 })
  const [_particleSystem, _setParticleSystem] = useState([])
  const [trafficDensity, setTrafficDensity] = useState(0.7)

  // Vehicle physics constants
  const PHYSICS_CONFIG = useMemo(() => ({
    maxSpeed: { car: 80, bus: 60, truck: 50, motorcycle: 100 },
    acceleration: { car: 3.5, bus: 2.0, truck: 1.8, motorcycle: 5.0 },
    braking: { car: 8.0, bus: 6.0, truck: 5.5, motorcycle: 10.0 },
    length: { car: 18, bus: 40, truck: 35, motorcycle: 8 },
    width: { car: 8, bus: 10, truck: 10, motorcycle: 4 },
    followDistance: { car: 2.0, bus: 3.0, truck: 3.5, motorcycle: 1.5 }
  }), [])

  // 2.5D transformation with enhanced depth
  const transform2_5D = useCallback((x, y, z = 0) => {
    const rad = Math.PI / 180
    const cosX = Math.cos(viewAngle.x * rad)
    
    // Enhanced isometric projection
    const isoX = (x - z * 0.5) * Math.cos(30 * rad)
    const isoY = (x + z * 0.5) * Math.sin(30 * rad) - y * cosX
    
    return { x: isoX, y: isoY, scale: 1 - z * 0.001 }
  }, [viewAngle])

  // Advanced vehicle generation with realistic behavior
  const generateAdvancedVehicles = useCallback((roadConfig, count) => {
    if (!roadConfig) return []
    
    const newVehicles = []
    const typeWeights = { car: 0.7, bus: 0.1, truck: 0.15, motorcycle: 0.05 }
    
    for (let i = 0; i < count * trafficDensity; i++) {
      const segment = roadConfig.segments[Math.floor(Math.random() * roadConfig.segments.length)]
      const lane = Math.floor(Math.random() * segment.lanes)
      
      // Select vehicle type based on lane restrictions and weights
      let vehicleType = 'car'
      const rand = Math.random()
      let cumulative = 0
      
      for (const [type, weight] of Object.entries(typeWeights)) {
        cumulative += weight
        if (rand <= cumulative) {
          vehicleType = type
          break
        }
      }
      
      // Bus lane restrictions
      if (segment.hasBusLane && (lane === 0 || lane === segment.lanes - 1)) {
        vehicleType = Math.random() > 0.3 ? 'bus' : 'car'
      }
      
      const baseY = compareMode ? 150 : 200
      const laneHeight = compareMode ? 25 : 35
      const laneY = baseY + (lane * laneHeight) + Math.random() * 8
      const elevation = segment.elevation || 0
      
      const vehicle = {
        id: `vehicle_${i}_${Date.now()}`,
        type: vehicleType,
        x: Math.random() * 1000 + 100,
        y: laneY,
        z: elevation,
        lane,
        segment: roadConfig.segments.indexOf(segment),
        speed: Math.random() * PHYSICS_CONFIG.maxSpeed[vehicleType] * 0.5,
        targetSpeed: PHYSICS_CONFIG.maxSpeed[vehicleType] * (0.7 + Math.random() * 0.3),
        acceleration: 0,
        direction: segment.direction === 'backward' ? -1 : 1,
        color: getVehicleColor(vehicleType),
        behavior: {
          aggressiveness: Math.random(), // 0 = cautious, 1 = aggressive
          reactionTime: 0.5 + Math.random() * 1.0, // seconds
          preferredFollowDistance: PHYSICS_CONFIG.followDistance[vehicleType] * (0.8 + Math.random() * 0.4)
        },
        physics: {
          velocity: { x: 0, y: 0 },
          force: { x: 0, y: 0 },
          mass: getMass(vehicleType)
        },
        state: 'driving', // driving, braking, stopped, lane_changing
        lastUpdate: Date.now()
      }
      
      newVehicles.push(vehicle)
    }
    
    return newVehicles.sort((a, b) => a.x - b.x) // Sort by position for collision detection
  }, [PHYSICS_CONFIG, trafficDensity, compareMode, getVehicleColor, getMass])

  const getVehicleColor = useCallback((type) => {
    const colors = {
      car: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
      bus: ['#fbbf24', '#f97316'],
      truck: ['#6b7280', '#374151'],
      motorcycle: ['#ec4899', '#14b8a6']
    }
    const typeColors = colors[type] || colors.car
    return typeColors[Math.floor(Math.random() * typeColors.length)]
  }, [])

  const getMass = useCallback((type) => {
    const masses = { car: 1500, bus: 12000, truck: 8000, motorcycle: 300 }
    return masses[type] || masses.car
  }, [])

  // Advanced physics simulation
  const updateVehiclePhysics = useCallback((vehicle, vehicles, deltaTime) => {
    const config = PHYSICS_CONFIG[vehicle.type]
    if (!config) return vehicle

    const updated = { ...vehicle }
    
    // Find vehicle ahead in same lane
    const vehicleAhead = vehicles.find(v => 
      v.id !== vehicle.id &&
      v.lane === vehicle.lane &&
      v.segment === vehicle.segment &&
      v.x > vehicle.x &&
      v.x - vehicle.x < 150
    )
    
    // Calculate forces
    let targetAcceleration = 0
    
    if (vehicleAhead) {
      const distance = vehicleAhead.x - vehicle.x - config.length
      const relativeSpeed = vehicle.speed - vehicleAhead.speed
      const safeDistance = updated.behavior.preferredFollowDistance * vehicle.speed
      
      if (distance < safeDistance) {
        // Intelligent Car Following Model (IDM)
        const s0 = config.length + 2 // minimum gap
        const T = updated.behavior.reactionTime
        const a = config.acceleration
        const b = config.braking
        
        const sStar = s0 + Math.max(0, vehicle.speed * T + 
                     (vehicle.speed * relativeSpeed) / (2 * Math.sqrt(a * b)))
        
        targetAcceleration = a * (1 - Math.pow(vehicle.speed / vehicle.targetSpeed, 4) - 
                                Math.pow(sStar / Math.max(distance, 0.1), 2))
        
        updated.state = distance < 20 ? 'braking' : 'following'
      } else {
        updated.state = 'driving'
      }
    }
    
    // Free flow acceleration
    if (!vehicleAhead || updated.state === 'driving') {
      const speedRatio = vehicle.speed / vehicle.targetSpeed
      targetAcceleration = config.acceleration * (1 - Math.pow(speedRatio, 4))
    }
    
    // Apply acceleration with mass consideration
    updated.acceleration = Math.max(-config.braking, 
                          Math.min(config.acceleration, targetAcceleration))
    
    // Update velocity and position
    updated.speed = Math.max(0, vehicle.speed + updated.acceleration * deltaTime)
    updated.speed = Math.min(updated.speed, config.maxSpeed)
    
    updated.x += vehicle.speed * vehicle.direction * deltaTime * 60 // pixels per second
    
    // Wrap around screen
    if (updated.x > 1200) updated.x = -50
    if (updated.x < -50) updated.x = 1200
    
    // Lane changing logic (simplified)
    if (Math.random() < 0.001 && updated.state === 'following') {
      const canChangeLane = vehicles.every(v => 
        v.id === vehicle.id || 
        v.lane !== vehicle.lane + 1 || 
        Math.abs(v.x - vehicle.x) > 80
      )
      
      if (canChangeLane && vehicle.lane < 3) {
        updated.lane += 1
        updated.state = 'lane_changing'
      }
    }
    
    updated.lastUpdate = Date.now()
    return updated
  }, [PHYSICS_CONFIG])

  // Enhanced 3D vehicle rendering
  const draw3DVehicle = useCallback((ctx, vehicle) => {
    const pos = transform2_5D(vehicle.x, vehicle.y, vehicle.z)
    const config = PHYSICS_CONFIG[vehicle.type]
    
    if (!config || !pos) return
    
    ctx.save()
    ctx.translate(pos.x, pos.y)
    ctx.scale(pos.scale, pos.scale)
    
    // Vehicle shadow
    if (vehicle.z > 0) {
      const shadowOffset = vehicle.z * 0.3
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.1, 0.4 - vehicle.z * 0.01)})`
      ctx.fillRect(-config.length/2 + shadowOffset, -config.width/2 + shadowOffset, 
                   config.length, config.width)
    }
    
    // Vehicle body with 3D effect
    const gradient = ctx.createLinearGradient(
      -config.length/2, -config.width/2,
      -config.length/2, config.width/2
    )
    
    // Dynamic color based on state
    let baseColor = vehicle.color
    if (vehicle.state === 'braking') {
      baseColor = '#ef4444' // Red for braking
    } else if (vehicle.state === 'lane_changing') {
      baseColor = '#f59e0b' // Yellow for lane changing
    }
    
    gradient.addColorStop(0, lightenColor(baseColor, 30))
    gradient.addColorStop(0.5, baseColor)
    gradient.addColorStop(1, darkenColor(baseColor, 30))
    
    ctx.fillStyle = gradient
    
    // Different shapes for different vehicle types
    switch (vehicle.type) {
      case 'bus':
        drawBus(ctx, config, gradient)
        break
      case 'truck':
        drawTruck(ctx, config, gradient)
        break
      case 'motorcycle':
        drawMotorcycle(ctx, config, gradient)
        break
      default:
        drawCar(ctx, config, gradient)
    }
    
    // Vehicle details
    if (renderQuality === 'high') {
      drawVehicleDetails(ctx, vehicle, config)
    }
    
    // Vehicle info overlay
    if (showVehicleInfo) {
      drawVehicleInfo(ctx, vehicle, config)
    }
    
    ctx.restore()
  }, [transform2_5D, PHYSICS_CONFIG, renderQuality, showVehicleInfo, drawCar, drawBus, drawTruck, drawMotorcycle, drawVehicleDetails, drawVehicleInfo, lightenColor, darkenColor])

  const drawCar = useCallback((ctx, config, gradient) => {
    ctx.fillStyle = gradient
    ctx.fillRect(-config.length/2, -config.width/2, config.length, config.width)
    
    // Car details
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(-config.length/2 + 2, -config.width/2 + 1, config.length - 4, config.width - 2)
    
    // Windshield
    ctx.fillStyle = 'rgba(100, 150, 200, 0.7)'
    ctx.fillRect(-config.length/4, -config.width/3, config.length/2, config.width * 2/3)
  }, [])

  const drawBus = useCallback((ctx, config, gradient) => {
    ctx.fillStyle = gradient
    ctx.fillRect(-config.length/2, -config.width/2, config.length, config.width)
    
    // Windows
    const windowCount = 6
    const windowWidth = config.length / windowCount - 2
    ctx.fillStyle = 'rgba(100, 150, 200, 0.8)'
    
    for (let i = 0; i < windowCount; i++) {
      const windowX = -config.length/2 + 4 + i * (config.length / windowCount)
      ctx.fillRect(windowX, -config.width/3, windowWidth, config.width * 2/3)
    }
    
    // Door
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)'
    ctx.fillRect(-2, -config.width/2, 4, config.width)
  }, [])

  const drawTruck = useCallback((ctx, config, gradient) => {
    // Truck cab
    ctx.fillStyle = gradient
    ctx.fillRect(-config.length/2, -config.width/2, config.length/3, config.width)
    
    // Trailer - using fixed color instead of darkenColor function
    ctx.fillStyle = '#374151'
    ctx.fillRect(-config.length/6, -config.width/2 + 1, config.length * 2/3, config.width - 2)
    
    // Windshield
    ctx.fillStyle = 'rgba(100, 150, 200, 0.7)'
    ctx.fillRect(-config.length/2 + 2, -config.width/3, config.length/4, config.width * 2/3)
  }, [])

  const drawMotorcycle = useCallback((ctx, config, gradient) => {
    ctx.fillStyle = gradient
    ctx.fillRect(-config.length/2, -config.width/2, config.length, config.width)
    
    // Rider
    ctx.fillStyle = '#444444'
    ctx.beginPath()
    ctx.arc(-config.length/4, 0, 3, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  const drawVehicleDetails = useCallback((ctx, vehicle, config) => {
    // Headlights
    ctx.fillStyle = vehicle.state === 'braking' ? '#ff6b6b' : '#ffffff'
    ctx.beginPath()
    ctx.arc(-config.length/2 - 1, -config.width/4, 1.5, 0, 2 * Math.PI)
    ctx.arc(-config.length/2 - 1, config.width/4, 1.5, 0, 2 * Math.PI)
    ctx.fill()
    
    // Brake lights for braking vehicles
    if (vehicle.state === 'braking') {
      ctx.fillStyle = '#ff0000'
      ctx.beginPath()
      ctx.arc(config.length/2 + 1, -config.width/4, 1, 0, 2 * Math.PI)
      ctx.arc(config.length/2 + 1, config.width/4, 1, 0, 2 * Math.PI)
      ctx.fill()
    }
  }, [])

  const drawVehicleInfo = useCallback((ctx, vehicle, config) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(-20, -config.width/2 - 20, 40, 15)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '8px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.round(vehicle.speed)}km/h`, 0, -config.width/2 - 10)
  }, [])

  const lightenColor = useCallback((color, percent) => {
    const num = parseInt(color.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
  }, [])

  const darkenColor = useCallback((color, percent) => {
    return lightenColor(color, -percent)
  }, [lightenColor])

  // Main render loop
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    let lastTime = Date.now()
    
    const animate = () => {
      const currentTime = Date.now()
      const deltaTime = (currentTime - lastTime) * 0.001 * simulationSpeed
      lastTime = currentTime

      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => 
          updateVehiclePhysics(vehicle, prevVehicles, deltaTime)
        )
      )

      setSimulationTime(prev => prev + deltaTime)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, simulationSpeed, updateVehiclePhysics])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = renderQuality

    // Clear with professional background
    const bgGradient = ctx.createRadialGradient(
      600, 300, 0, 600, 300, 800
    )
    bgGradient.addColorStop(0, '#2a2a2a')
    bgGradient.addColorStop(1, '#1a1a1a')
    
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, 1200, 600)

    // Draw road (simplified for simulation)
    if (roadData) {
      drawRoadForSimulation(ctx, roadData)
    }

    // Draw vehicles
    vehicles.forEach(vehicle => draw3DVehicle(ctx, vehicle))

    // Draw simulation info
    drawSimulationInfo(ctx)

  }, [vehicles, roadData, draw3DVehicle, renderQuality, drawRoadForSimulation, drawSimulationInfo])

  const drawRoadForSimulation = useCallback((ctx) => {
    const roadY = compareMode ? 150 : 200
    const roadHeight = compareMode ? 100 : 140
    
    // Road surface with 2.5D effect
    const roadGradient = ctx.createLinearGradient(0, roadY, 0, roadY + roadHeight)
    roadGradient.addColorStop(0, '#4a5568')
    roadGradient.addColorStop(0.5, '#2d3748')
    roadGradient.addColorStop(1, '#1a202c')
    
    ctx.fillStyle = roadGradient
    ctx.fillRect(0, roadY, 1200, roadHeight)
    
    // Lane markings
    const laneCount = 4
    const laneHeight = roadHeight / laneCount
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 10])
    
    for (let i = 1; i < laneCount; i++) {
      const y = roadY + (i * laneHeight)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1200, y)
      ctx.stroke()
    }
    
    ctx.setLineDash([])
  }, [compareMode])

  const drawSimulationInfo = useCallback((ctx) => {
    // Simulation stats panel
    ctx.fillStyle = 'rgba(42, 42, 42, 0.95)'
    ctx.fillRect(10, 10, 200, 120)
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(10, 10, 200, 120)
    
    ctx.fillStyle = '#f0f0f0'
    ctx.font = '12px Inter, monospace'
    ctx.textAlign = 'left'
    
    const stats = [
      `Vehicles: ${vehicles.length}`,
      `Speed: ${simulationSpeed}x`,
      `Time: ${simulationTime.toFixed(1)}s`,
      `Density: ${(trafficDensity * 100).toFixed(0)}%`,
      `Physics: ${physicsEngine}`,
      `Quality: ${renderQuality}`,
      `View: ${viewAngle.x}°`
    ]
    
    stats.forEach((stat, i) => {
      ctx.fillText(stat, 20, 30 + (i * 14))
    })
  }, [vehicles.length, simulationSpeed, simulationTime, trafficDensity, 
      physicsEngine, renderQuality, viewAngle.x])

  // Initialize vehicles when road data changes
  useEffect(() => {
    if (roadData) {
      const newVehicles = generateAdvancedVehicles(roadData, 50)
      setVehicles(newVehicles)
    }
    
    if (compareMode && originalRoad) {
      const newOriginalVehicles = generateAdvancedVehicles(originalRoad, 50)
      setOriginalVehicles(newOriginalVehicles)
    }
  }, [roadData, originalRoad, compareMode, generateAdvancedVehicles])

  return (
    <div className="advanced-3d-traffic-simulation">
      {/* Simulation Controls */}
      <div className="simulation-controls-panel">
        <div className="control-group">
          <label>Simulation Speed:</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
          />
          <span>{simulationSpeed}x</span>
        </div>
        
        <div className="control-group">
          <label>Traffic Density:</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={trafficDensity}
            onChange={(e) => setTrafficDensity(parseFloat(e.target.value))}
          />
          <span>{(trafficDensity * 100).toFixed(0)}%</span>
        </div>
        
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
        
        <div className="control-toggles">
          <label>
            <input
              type="checkbox"
              checked={showVehicleInfo}
              onChange={(e) => setShowVehicleInfo(e.target.checked)}
            />
            Vehicle Info
          </label>
          
          <select 
            value={physicsEngine}
            onChange={(e) => setPhysicsEngine(e.target.value)}
          >
            <option value="basic">Basic Physics</option>
            <option value="enhanced">Enhanced Physics</option>
            <option value="realistic">Realistic Physics</option>
          </select>
          
          <select 
            value={renderQuality}
            onChange={(e) => setRenderQuality(e.target.value)}
          >
            <option value="low">Low Quality</option>
            <option value="medium">Medium Quality</option>
            <option value="high">High Quality</option>
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

export default Advanced3DTrafficSimulation
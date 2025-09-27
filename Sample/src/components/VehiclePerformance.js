import * as THREE from 'three'

// Performance optimization utilities for vehicle simulation
export class VehiclePerformanceManager {
  constructor() {
    this.instancedMeshes = new Map()
    this.cullingManager = new FrustumCullingManager()
    this.lodManager = new LODManager()
    this.maxVehicles = 100
    this.frameCount = 0
    this.performanceMetrics = {
      fps: 60,
      drawCalls: 0,
      triangles: 0
    }
  }

  // Create instanced meshes for similar vehicles
  createInstancedVehicleMesh(vehicleType, count = 50) {
    if (this.instancedMeshes.has(vehicleType)) {
      return this.instancedMeshes.get(vehicleType)
    }

    let geometry, material
    
    switch (vehicleType) {
      case 'car':
        geometry = new THREE.BoxGeometry(4, 1.5, 1.8)
        material = new THREE.MeshLambertMaterial({ color: 0x444444 })
        break
      case 'truck':
        geometry = new THREE.BoxGeometry(8, 2.5, 2.2)
        material = new THREE.MeshLambertMaterial({ color: 0xdc2626 })
        break
      case 'bus':
        geometry = new THREE.BoxGeometry(12, 2.8, 2.4)
        material = new THREE.MeshLambertMaterial({ color: 0x1e40af })
        break
      case 'motorcycle':
        geometry = new THREE.BoxGeometry(2.5, 1, 0.8)
        material = new THREE.MeshLambertMaterial({ color: 0x333333 })
        break
      default:
        geometry = new THREE.BoxGeometry(4, 1.5, 1.8)
        material = new THREE.MeshLambertMaterial({ color: 0x444444 })
    }

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
    instancedMesh.castShadow = true
    instancedMesh.receiveShadow = true
    
    // Initialize dummy object for matrix calculations
    const dummy = new THREE.Object3D()
    instancedMesh.userData.dummy = dummy
    
    this.instancedMeshes.set(vehicleType, instancedMesh)
    return instancedMesh
  }

  // Update instanced mesh positions and rotations
  updateInstancedVehicles(vehicleType, vehicles) {
    const instancedMesh = this.instancedMeshes.get(vehicleType)
    if (!instancedMesh) return

    const dummy = instancedMesh.userData.dummy
    const relevantVehicles = vehicles.filter(v => v.type === vehicleType)
    
    relevantVehicles.forEach((vehicle, index) => {
      if (index >= instancedMesh.count) return
      
      dummy.position.set(...vehicle.position)
      dummy.rotation.set(0, vehicle.rotation, 0)
      dummy.scale.set(1, 1, 1)
      
      // Apply LOD scaling based on distance
      const distance = this.lodManager.getDistanceFromCamera(vehicle.position)
      const lodScale = this.lodManager.getLODScale(distance)
      dummy.scale.multiplyScalar(lodScale)
      
      dummy.updateMatrix()
      instancedMesh.setMatrixAt(index, dummy.matrix)
    })
    
    instancedMesh.instanceMatrix.needsUpdate = true
    instancedMesh.count = Math.min(relevantVehicles.length, instancedMesh.count)
  }

  // Manage performance by adjusting vehicle count and quality
  adaptivePerformanceControl(currentFPS, targetFPS = 60) {
    this.performanceMetrics.fps = currentFPS
    
    if (currentFPS < targetFPS * 0.8) {
      // Performance is poor, reduce quality
      this.maxVehicles = Math.max(20, this.maxVehicles - 5)
      this.lodManager.decreaseQuality()
    } else if (currentFPS > targetFPS * 0.95) {
      // Performance is good, can increase quality
      this.maxVehicles = Math.min(100, this.maxVehicles + 2)
      this.lodManager.increaseQuality()
    }
  }

  // Get performance recommendations
  getPerformanceRecommendations() {
    const recommendations = []
    
    if (this.performanceMetrics.fps < 30) {
      recommendations.push('Reduce vehicle count')
      recommendations.push('Decrease shadow quality')
      recommendations.push('Use simpler vehicle models')
    }
    
    if (this.performanceMetrics.drawCalls > 100) {
      recommendations.push('Use more instanced rendering')
    }
    
    return recommendations
  }
}

// Frustum culling manager for off-screen vehicles
class FrustumCullingManager {
  constructor() {
    this.frustum = new THREE.Frustum()
    this.cameraMatrix = new THREE.Matrix4()
  }

  updateFrustum(camera) {
    this.cameraMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    this.frustum.setFromProjectionMatrix(this.cameraMatrix)
  }

  isVehicleVisible(vehiclePosition, boundingRadius = 5) {
    const sphere = new THREE.Sphere(new THREE.Vector3(...vehiclePosition), boundingRadius)
    return this.frustum.intersectsSphere(sphere)
  }

  cullVehicles(vehicles, camera) {
    this.updateFrustum(camera)
    return vehicles.filter(vehicle => 
      this.isVehicleVisible(vehicle.position)
    )
  }
}

// Level of Detail manager
class LODManager {
  constructor() {
    this.lodLevels = [
      { distance: 50, scale: 1.0, quality: 'high' },
      { distance: 150, scale: 0.8, quality: 'medium' },
      { distance: 300, scale: 0.5, quality: 'low' },
      { distance: Infinity, scale: 0.2, quality: 'minimal' }
    ]
    this.currentQualityMultiplier = 1.0
  }

  getLODScale(distance) {
    for (const level of this.lodLevels) {
      if (distance < level.distance) {
        return level.scale * this.currentQualityMultiplier
      }
    }
    return 0.1
  }

  getLODQuality(distance) {
    for (const level of this.lodLevels) {
      if (distance < level.distance) {
        return level.quality
      }
    }
    return 'minimal'
  }

  getDistanceFromCamera(position, cameraPosition = [0, 60, 100]) {
    const dx = position[0] - cameraPosition[0]
    const dy = position[1] - cameraPosition[1]
    const dz = position[2] - cameraPosition[2]
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  decreaseQuality() {
    this.currentQualityMultiplier = Math.max(0.3, this.currentQualityMultiplier - 0.1)
  }

  increaseQuality() {
    this.currentQualityMultiplier = Math.min(1.0, this.currentQualityMultiplier + 0.05)
  }
}

// Vehicle pooling system for memory efficiency
export class VehiclePool {
  constructor(maxSize = 200) {
    this.pool = []
    this.activeVehicles = new Set()
    this.maxSize = maxSize
  }

  getVehicle(type, position, speed) {
    let vehicle = this.pool.pop()
    
    if (!vehicle) {
      vehicle = {
        id: `vehicle-${Date.now()}-${Math.random()}`,
        type,
        position: [...position],
        speed,
        rotation: 0,
        lane: 0,
        segmentIndex: 0,
        targetSpeed: speed,
        acceleration: 0,
        color: this.getRandomColor(),
        isActive: true
      }
    } else {
      // Reuse existing vehicle
      vehicle.type = type
      vehicle.position = [...position]
      vehicle.speed = speed
      vehicle.rotation = 0
      vehicle.isActive = true
    }
    
    this.activeVehicles.add(vehicle)
    return vehicle
  }

  releaseVehicle(vehicle) {
    if (this.activeVehicles.has(vehicle)) {
      this.activeVehicles.delete(vehicle)
      vehicle.isActive = false
      
      if (this.pool.length < this.maxSize) {
        this.pool.push(vehicle)
      }
    }
  }

  getRandomColor() {
    const colors = [
      '#ff4444', '#4444ff', '#44ff44', '#ffff44', 
      '#ff44ff', '#44ffff', '#ffffff', '#888888',
      '#ff8844', '#8844ff', '#44ff88', '#ffaa44'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  getActiveCount() {
    return this.activeVehicles.size
  }

  cleanup() {
    // Remove vehicles that are too far or inactive
    const vehiclesToRemove = []
    
    this.activeVehicles.forEach(vehicle => {
      if (!vehicle.isActive || 
          Math.abs(vehicle.position[0]) > 1000 || 
          Math.abs(vehicle.position[2]) > 1000) {
        vehiclesToRemove.push(vehicle)
      }
    })
    
    vehiclesToRemove.forEach(vehicle => this.releaseVehicle(vehicle))
  }
}

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.frameCount = 0
    this.lastTime = performance.now()
    this.fps = 60
    this.frameHistory = []
    this.maxHistoryLength = 60
  }

  update() {
    this.frameCount++
    const currentTime = performance.now()
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount
      this.frameHistory.push(this.fps)
      
      if (this.frameHistory.length > this.maxHistoryLength) {
        this.frameHistory.shift()
      }
      
      this.frameCount = 0
      this.lastTime = currentTime
    }
  }

  getAverageFPS() {
    if (this.frameHistory.length === 0) return 60
    return this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length
  }

  getCurrentFPS() {
    return this.fps
  }

  getPerformanceGrade() {
    const avgFPS = this.getAverageFPS()
    if (avgFPS >= 55) return 'Excellent'
    if (avgFPS >= 45) return 'Good'
    if (avgFPS >= 30) return 'Fair'
    return 'Poor'
  }
}

export { FrustumCullingManager, LODManager }
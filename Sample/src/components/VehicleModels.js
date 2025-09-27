import * as THREE from 'three'
// import { useLoader } from '@react-three/fiber'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Vehicle Model Factory - Creates detailed low-poly models
export class VehicleModelFactory {
  static vehicleCache = new Map()
  
  // Car model with realistic proportions and details
  static createCarModel() {
    if (this.vehicleCache.has('car')) {
      return this.vehicleCache.get('car').clone()
    }

    const car = new THREE.Group()
    
    // Main body - lower section
    const bodyGeometry = new THREE.BoxGeometry(4, 1.2, 1.8)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.set(0, 0.6, 0)
    body.castShadow = true
    car.add(body)
    
    // Cabin - upper section
    const cabinGeometry = new THREE.BoxGeometry(2.5, 1, 1.6)
    const cabinMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial)
    cabin.position.set(-0.3, 1.6, 0)
    cabin.castShadow = true
    car.add(cabin)
    
    // Hood
    const hoodGeometry = new THREE.BoxGeometry(1.2, 0.3, 1.6)
    const hood = new THREE.Mesh(hoodGeometry, bodyMaterial)
    hood.position.set(1.4, 1.35, 0)
    hood.castShadow = true
    car.add(hood)
    
    // Windshield
    const windshieldGeometry = new THREE.PlaneGeometry(1.8, 0.8)
    const windshieldMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB, 
      transparent: true, 
      opacity: 0.7 
    })
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial)
    windshield.position.set(0.5, 1.8, 0)
    windshield.rotation.x = -0.2
    car.add(windshield)
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.25)
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 })
    
    const wheelPositions = [
      [1.3, 0.4, 0.95],   // Front Right
      [1.3, 0.4, -0.95],  // Front Left  
      [-1.3, 0.4, 0.95],  // Rear Right
      [-1.3, 0.4, -0.95]  // Rear Left
    ]
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(...pos)
      wheel.castShadow = true
      car.add(wheel)
      
      // Rim details
      const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.1)
      const rimMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
      const rim = new THREE.Mesh(rimGeometry, rimMaterial)
      rim.rotation.z = Math.PI / 2
      rim.position.set(pos[0], pos[1], pos[2])
      car.add(rim)
    })
    
    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 6)
    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa })
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
    leftHeadlight.position.set(2, 1.1, 0.5)
    car.add(leftHeadlight)
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
    rightHeadlight.position.set(2, 1.1, -0.5)
    car.add(rightHeadlight)
    
    // Taillights
    const taillightMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 })
    const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial)
    leftTaillight.position.set(-2, 1.1, 0.5)
    car.add(leftTaillight)
    
    const rightTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial)
    rightTaillight.position.set(-2, 1.1, -0.5)
    car.add(rightTaillight)
    
    this.vehicleCache.set('car', car)
    return car.clone()
  }
  
  // Bus model - elongated and taller
  static createBusModel() {
    if (this.vehicleCache.has('bus')) {
      return this.vehicleCache.get('bus').clone()
    }

    const bus = new THREE.Group()
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(12, 2.8, 2.4)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x1e40af })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.set(0, 1.4, 0)
    body.castShadow = true
    bus.add(body)
    
    // Windows - multiple sections
    const windowMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB, 
      transparent: true, 
      opacity: 0.6 
    })
    
    for (let i = -4; i <= 4; i += 2) {
      const windowGeometry = new THREE.PlaneGeometry(1.5, 1.2)
      const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial)
      leftWindow.position.set(i, 2.2, 1.25)
      bus.add(leftWindow)
      
      const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial)
      rightWindow.position.set(i, 2.2, -1.25)
      rightWindow.rotation.y = Math.PI
      bus.add(rightWindow)
    }
    
    // Wheels - 6 wheels for bus
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3)
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 })
    
    const busWheelPositions = [
      [4, 0.5, 1.3],    // Front Right
      [4, 0.5, -1.3],   // Front Left
      [-2, 0.5, 1.3],   // Middle Right
      [-2, 0.5, -1.3],  // Middle Left
      [-4, 0.5, 1.3],   // Rear Right
      [-4, 0.5, -1.3]   // Rear Left
    ]
    
    busWheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(...pos)
      wheel.castShadow = true
      bus.add(wheel)
    })
    
    // Door
    const doorGeometry = new THREE.BoxGeometry(0.1, 1.8, 1)
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    const door = new THREE.Mesh(doorGeometry, doorMaterial)
    door.position.set(2, 1.4, 1.3)
    bus.add(door)
    
    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.2, 8, 6)
    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa })
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
    leftHeadlight.position.set(6, 1.5, 0.8)
    bus.add(leftHeadlight)
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
    rightHeadlight.position.set(6, 1.5, -0.8)
    bus.add(rightHeadlight)
    
    this.vehicleCache.set('bus', bus)
    return bus.clone()
  }
  
  // Truck model - heavy and robust
  static createTruckModel() {
    if (this.vehicleCache.has('truck')) {
      return this.vehicleCache.get('truck').clone()
    }

    const truck = new THREE.Group()
    
    // Cab
    const cabGeometry = new THREE.BoxGeometry(3, 2.5, 2.2)
    const cabMaterial = new THREE.MeshLambertMaterial({ color: 0xdc2626 })
    const cab = new THREE.Mesh(cabGeometry, cabMaterial)
    cab.position.set(2, 1.25, 0)
    cab.castShadow = true
    truck.add(cab)
    
    // Cargo container
    const cargoGeometry = new THREE.BoxGeometry(6, 2.8, 2.4)
    const cargoMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
    const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial)
    cargo.position.set(-2.5, 1.4, 0)
    cargo.castShadow = true
    truck.add(cargo)
    
    // Windshield
    const windshieldGeometry = new THREE.PlaneGeometry(2, 1.5)
    const windshieldMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB, 
      transparent: true, 
      opacity: 0.7 
    })
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial)
    windshield.position.set(3.4, 2, 0)
    windshield.rotation.x = -0.1
    truck.add(windshield)
    
    // Wheels - dual rear wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.4)
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 })
    
    const truckWheelPositions = [
      [2.5, 0.6, 1.3],   // Front Right
      [2.5, 0.6, -1.3],  // Front Left
      [-2, 0.6, 1.3],    // Rear Right Outer
      [-2, 0.6, 0.9],    // Rear Right Inner
      [-2, 0.6, -1.3],   // Rear Left Outer
      [-2, 0.6, -0.9],   // Rear Left Inner
      [-4, 0.6, 1.3],    // Back Axle Right
      [-4, 0.6, -1.3]    // Back Axle Left
    ]
    
    truckWheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(...pos)
      wheel.castShadow = true
      truck.add(wheel)
    })
    
    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.2, 8, 6)
    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa })
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
    leftHeadlight.position.set(3.5, 1.5, 0.7)
    truck.add(leftHeadlight)
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
    rightHeadlight.position.set(3.5, 1.5, -0.7)
    truck.add(rightHeadlight)
    
    this.vehicleCache.set('truck', truck)
    return truck.clone()
  }
  
  // Motorcycle model - compact and streamlined
  static createMotorcycleModel() {
    if (this.vehicleCache.has('motorcycle')) {
      return this.vehicleCache.get('motorcycle').clone()
    }

    const motorcycle = new THREE.Group()
    
    // Main body/frame
    const frameGeometry = new THREE.BoxGeometry(2.5, 0.3, 0.8)
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    const frame = new THREE.Mesh(frameGeometry, frameMaterial)
    frame.position.set(0, 0.8, 0)
    frame.castShadow = true
    motorcycle.add(frame)
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(1, 0.3, 0.6)
    const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const seat = new THREE.Mesh(seatGeometry, seatMaterial)
    seat.position.set(-0.3, 1.1, 0)
    motorcycle.add(seat)
    
    // Engine
    const engineGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.6)
    const engineMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 })
    const engine = new THREE.Mesh(engineGeometry, engineMaterial)
    engine.position.set(0.3, 0.5, 0)
    engine.castShadow = true
    motorcycle.add(engine)
    
    // Handlebars
    const handlebarGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1)
    const handlebarMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
    const handlebar = new THREE.Mesh(handlebarGeometry, handlebarMaterial)
    handlebar.rotation.z = Math.PI / 2
    handlebar.position.set(1, 1.3, 0)
    motorcycle.add(handlebar)
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.15)
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 })
    
    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
    frontWheel.rotation.z = Math.PI / 2
    frontWheel.position.set(1.1, 0.4, 0)
    frontWheel.castShadow = true
    motorcycle.add(frontWheel)
    
    const rearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
    rearWheel.rotation.z = Math.PI / 2
    rearWheel.position.set(-1.1, 0.4, 0)
    rearWheel.castShadow = true
    motorcycle.add(rearWheel)
    
    // Headlight
    const headlightGeometry = new THREE.SphereGeometry(0.12, 8, 6)
    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa })
    const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
    headlight.position.set(1.2, 1, 0)
    motorcycle.add(headlight)
    
    this.vehicleCache.set('motorcycle', motorcycle)
    return motorcycle.clone()
  }
  
  // Factory method to get any vehicle model
  static getVehicleModel(type) {
    switch (type) {
      case 'bus':
        return this.createBusModel()
      case 'truck':
        return this.createTruckModel()
      case 'motorcycle':
        return this.createMotorcycleModel()
      default:
        return this.createCarModel()
    }
  }
}

// Simple function to get vehicle models (no external loading for now)
export const getVehicleModel = (type) => {
  return VehicleModelFactory.getVehicleModel(type)
}

// If you want to use external models, place GLB/GLTF files in public/models/ 
// and use a separate component with Suspense:
//
// import { Suspense } from 'react'
// 
// const ExternalVehicleModel = ({ modelPath, fallbackType }) => {
//   const gltf = useLoader(GLTFLoader, modelPath)
//   return <primitive object={gltf.scene.clone()} />
// }
//
// export const VehicleWithModel = ({ modelPath, fallbackType, ...props }) => (
//   <Suspense fallback={<primitive object={VehicleModelFactory.getVehicleModel(fallbackType)} />}>
//     {modelPath ? (
//       <ExternalVehicleModel modelPath={modelPath} fallbackType={fallbackType} />
//     ) : (
//       <primitive object={VehicleModelFactory.getVehicleModel(fallbackType)} />
//     )}
//   </Suspense>
// )

export default VehicleModelFactory
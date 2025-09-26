import React, { useState } from 'react'

const MapSelector = ({ onRoadSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)
  
  // Sample road data for demonstration with enhanced configurations
  const sampleRoads = [
    {
      id: 'sp-ring-road',
      name: 'S.P. Ring Road, Ahmedabad',
      location: 'Ahmedabad, Gujarat',
      length: '125 km',
      lanes: 6,
      avgTraffic: 'High',
      coordinates: [23.0225, 72.5714],
      segments: [
        { id: 1, start: [23.0225, 72.5714], end: [23.0425, 72.5814], lanes: 6, speed: 60, direction: 'both', hasMedian: true },
        { id: 2, start: [23.0425, 72.5814], end: [23.0625, 72.5914], lanes: 4, speed: 50, direction: 'both', hasMedian: false },
        { id: 3, start: [23.0625, 72.5914], end: [23.0825, 72.6014], lanes: 6, speed: 70, direction: 'both', hasMedian: true },
      ],
      trafficFlow: {
        morning: { density: 0.8, avgSpeed: 35 },
        afternoon: { density: 0.6, avgSpeed: 45 },
        evening: { density: 0.9, avgSpeed: 25 },
        night: { density: 0.3, avgSpeed: 65 }
      }
    },
    {
      id: 'sarkhej-gandhinagar',
      name: 'Sarkhej-Gandhinagar Highway',
      location: 'Ahmedabad, Gujarat',
      length: '65 km',
      lanes: 8,
      avgTraffic: 'Very High',
      coordinates: [23.0358, 72.5258],
      segments: [
        { id: 1, start: [23.0358, 72.5258], end: [23.0558, 72.5358], lanes: 8, speed: 80, direction: 'both', hasMedian: true },
        { id: 2, start: [23.0558, 72.5358], end: [23.0758, 72.5458], lanes: 6, speed: 70, direction: 'both', hasMedian: true },
      ],
      trafficFlow: {
        morning: { density: 0.9, avgSpeed: 30 },
        afternoon: { density: 0.7, avgSpeed: 50 },
        evening: { density: 0.95, avgSpeed: 20 },
        night: { density: 0.4, avgSpeed: 75 }
      }
    },
    {
      id: 'cg-road',
      name: 'C.G. Road, Ahmedabad',
      location: 'Ahmedabad, Gujarat',
      length: '12 km',
      lanes: 4,
      avgTraffic: 'Medium',
      coordinates: [23.0285, 72.5647],
      segments: [
        { id: 1, start: [23.0285, 72.5647], end: [23.0385, 72.5747], lanes: 4, speed: 40 },
        { id: 2, start: [23.0385, 72.5747], end: [23.0485, 72.5847], lanes: 4, speed: 35 },
      ],
      trafficFlow: {
        morning: { density: 0.7, avgSpeed: 25 },
        afternoon: { density: 0.5, avgSpeed: 35 },
        evening: { density: 0.8, avgSpeed: 20 },
        night: { density: 0.2, avgSpeed: 45 }
      }
    }
  ]

  const filteredRoads = sampleRoads.filter(road =>
    road.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    road.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRoadSelect = (road) => {
    setSelectedLocation(road)
    onRoadSelect(road)
  }

  const getTrafficColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-600'
      case 'Medium': return 'text-yellow-600'
      case 'High': return 'text-orange-600'
      case 'Very High': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Road from Google Maps</h2>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for roads (e.g., S.P. Ring Road, Ahmedabad)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mock Google Maps Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map View (Simulated) */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Map View</h3>
            <div className="relative h-96 bg-green-100 rounded-lg overflow-hidden">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200">
                <div className="p-4">
                  <div className="text-sm text-gray-600 mb-2">📍 Ahmedabad, Gujarat</div>
                  
                  {/* Road representations */}
                  <div className="space-y-2">
                    {filteredRoads.map((road) => (
                      <div
                        key={road.id}
                        className={`relative p-2 bg-white bg-opacity-80 rounded cursor-pointer hover:bg-opacity-100 transition-all ${
                          selectedLocation?.id === road.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleRoadSelect(road)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{road.name}</div>
                            <div className="text-xs text-gray-500">{road.length} • {road.lanes} lanes</div>
                          </div>
                          <div className={`text-xs font-medium ${getTrafficColor(road.avgTraffic)}`}>
                            {road.avgTraffic}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedLocation && (
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="text-sm font-medium">{selectedLocation.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Traffic Analysis Available • Ready for Import
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Road List */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Available Roads</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredRoads.map((road) => (
                <div
                  key={road.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedLocation?.id === road.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleRoadSelect(road)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{road.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTrafficColor(road.avgTraffic)} bg-opacity-20`}>
                      {road.avgTraffic}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{road.location}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Length: {road.length}</span>
                    <span>Lanes: {road.lanes}</span>
                  </div>
                  
                  {/* Traffic flow preview */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-600 mb-2">Current Traffic Flow:</div>
                    <div className="flex justify-between text-xs">
                      <span>🌅 Morning: {Math.round(road.trafficFlow.morning.density * 100)}%</span>
                      <span>🌆 Evening: {Math.round(road.trafficFlow.evening.density * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Import Button */}
        {selectedLocation && (
          <div className="mt-6 text-center">
            <button
              onClick={() => onRoadSelect(selectedLocation)}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Import "{selectedLocation.name}" for Traffic Simulation
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This will import the road structure and current traffic patterns for analysis
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapSelector
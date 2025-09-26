import React, { useState } from 'react'
import './App.css'
import MapSelector from './components/MapSelector'
import RoadVisualization from './components/RoadVisualization'
import TrafficSimulation from './components/TrafficSimulation'
import RoadEditor from './components/RoadEditor'
import SimulationControls from './components/SimulationControls'
import TrafficAnalytics from './components/TrafficAnalytics'

function App() {
  const [selectedRoad, setSelectedRoad] = useState(null)
  const [modifiedRoad, setModifiedRoad] = useState(null)
  const [currentView, setCurrentView] = useState('map')
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  const handleRoadSelection = (roadData) => {
    setSelectedRoad(roadData)
    setCurrentView('visualization')
  }

  const handleRoadModification = (modifiedRoadData) => {
    setModifiedRoad(modifiedRoadData)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">URBaNS</h1>
          <p className="text-blue-200">Urban Road Behavior and Navigation Simulator</p>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentView('map')}
              className={`px-4 py-2 rounded ${currentView === 'map' ? 'bg-blue-700' : 'bg-blue-800 hover:bg-blue-700'}`}
            >
              Map Selection
            </button>
            <button
              onClick={() => setCurrentView('editor')}
              disabled={!selectedRoad}
              className={`px-4 py-2 rounded ${currentView === 'editor' ? 'bg-blue-700' : 'bg-blue-800 hover:bg-blue-700 disabled:opacity-50'}`}
            >
              Road Editor
            </button>
            <button
              onClick={() => setCurrentView('simulation')}
              disabled={!selectedRoad}
              className={`px-4 py-2 rounded ${currentView === 'simulation' ? 'bg-blue-700' : 'bg-blue-800 hover:bg-blue-700 disabled:opacity-50'}`}
            >
              Traffic Simulation
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'map' && (
          <MapSelector onRoadSelect={handleRoadSelection} />
        )}
        
        {currentView === 'visualization' && selectedRoad && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Road Visualization: {selectedRoad.name}</h2>
            <RoadVisualization roadData={selectedRoad} />
          </div>
        )}
        
        {currentView === 'editor' && selectedRoad && (
          <div className="flex h-screen">
            <div className="flex-1">
              <RoadEditor 
                roadData={modifiedRoad || selectedRoad} 
                onRoadModify={handleRoadModification}
              />
            </div>
            <div className="w-80 bg-white border-l border-gray-300">
              <TrafficAnalytics 
                originalRoad={selectedRoad}
                modifiedRoad={modifiedRoad}
                compareMode={compareMode}
              />
            </div>
          </div>
        )}
        
        {currentView === 'simulation' && selectedRoad && (
          <div className="p-6">
            <div className="mb-4">
              <SimulationControls 
                isRunning={simulationRunning}
                onToggleSimulation={setSimulationRunning}
                onToggleCompare={() => setCompareMode(!compareMode)}
                compareMode={compareMode}
                onStopSimulation={() => setSimulationRunning(false)}
                onResetSimulation={() => {
                  setSimulationRunning(false)
                  // Additional reset logic could be added here
                }}
              />
            </div>
            <TrafficSimulation 
              roadData={modifiedRoad || selectedRoad}
              originalRoad={selectedRoad}
              isRunning={simulationRunning}
              compareMode={compareMode}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

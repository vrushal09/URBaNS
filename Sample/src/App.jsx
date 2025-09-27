import React, { useState } from 'react'
import './App.css'
import './styles/BlenderTheme.css'
import RoadTemplates from './components/RoadTemplates'
import ThreeJSRoadVisualization from './components/ThreeJSRoadVisualization'
import ThreeJSTrafficSimulation from './components/ThreeJSTrafficSimulation'
import ThreeJSRoadEditor from './components/ThreeJSRoadEditor'
import SimulationControls from './components/SimulationControls'
import TrafficAnalytics from './components/TrafficAnalytics'

function App() {
  const [selectedRoad, setSelectedRoad] = useState(null)
  const [modifiedRoad, setModifiedRoad] = useState(null)
  const [currentView, setCurrentView] = useState('templates')
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [use3DMode, setUse3DMode] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedSegment, setSelectedSegment] = useState(null)

  const handleTemplateSelection = (templateData) => {
    setSelectedRoad(templateData)
    setModifiedRoad(templateData)
    setCurrentView('editor')
  }

  const handleRoadModification = (modifiedRoadData) => {
    setModifiedRoad(modifiedRoadData)
  }



  const tools = [
    { id: 'templates', name: 'Road Templates', icon: '📋', disabled: false },
    { id: 'visualization', name: '3D Visualization', icon: '🔍', disabled: !selectedRoad },
    { id: 'editor', name: '3D Editor', icon: '✏️', disabled: !selectedRoad },
    { id: 'simulation', name: 'Traffic Simulation', icon: '🚗', disabled: !selectedRoad },
    { id: 'analytics', name: 'Analytics', icon: '📊', disabled: !selectedRoad }
  ]

  return (
    <div className="urbans-app">
      {/* Blender-style Header */}
      <header className="urbans-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1>URBaNS</h1>
          <span className="subtitle">Urban Road Behavior and Navigation Simulator</span>
        </div>
        
        <div className="nav-buttons">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setCurrentView(tool.id)}
              disabled={tool.disabled}
              className={`nav-button ${currentView === tool.id ? 'active' : ''}`}
              title={tool.name}
            >
              <span style={{ marginRight: '8px' }}>{tool.icon}</span>
              {tool.name}
            </button>
          ))}
          
          <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={use3DMode}
                onChange={(e) => setUse3DMode(e.target.checked)}
                style={{ accentColor: 'var(--accent-blue)' }}
              />
              2.5D Mode
            </label>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="urbans-main">
        {/* Left Sidebar - Tools */}
        {(currentView === 'editor' || currentView === 'simulation') && (
          <div className="urbans-sidebar left">
            <div className="property-panel">
              <div className="panel-header" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                <span>Tools & Properties</span>
                <span>{sidebarCollapsed ? '▶' : '▼'}</span>
              </div>
              <div className={`panel-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
                {currentView === 'editor' && (
                  <>
                    <div className="form-group">
                      <div className="form-label">Tool Selection</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                        {['select', 'elevation', 'bridge', 'lanes'].map(tool => (
                          <button
                            key={tool}
                            className={`btn btn-secondary ${selectedTool === tool ? 'btn-primary' : ''}`}
                            onClick={() => setSelectedTool(tool)}
                            style={{ padding: '6px', fontSize: '11px' }}
                          >
                            {tool.charAt(0).toUpperCase() + tool.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="form-label">Render Options</div>
                      <div className="form-checkbox">
                        <input type="checkbox" id="showGrid" defaultChecked />
                        <label htmlFor="showGrid">Show Grid</label>
                      </div>
                      <div className="form-checkbox">
                        <input type="checkbox" id="showWireframe" />
                        <label htmlFor="showWireframe">Wireframe</label>
                      </div>
                    </div>
                  </>
                )}
                
                {currentView === 'simulation' && (
                  <>
                    <div className="form-group">
                      <div className="form-label">Simulation Controls</div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <button 
                          className={`btn ${simulationRunning ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => setSimulationRunning(!simulationRunning)}
                        >
                          {simulationRunning ? '⏹️ Stop' : '▶️ Start'}
                        </button>
                        <button className="btn btn-secondary">🔄 Reset</button>
                      </div>
                      <div className="form-checkbox">
                        <input 
                          type="checkbox" 
                          id="compareMode" 
                          checked={compareMode}
                          onChange={(e) => setCompareMode(e.target.checked)}
                        />
                        <label htmlFor="compareMode">Compare Mode</label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Viewport */}
        <div className="urbans-viewport">
          {currentView === 'templates' && (
            <RoadTemplates onTemplateSelect={handleTemplateSelection} />
          )}
          
          {currentView === 'visualization' && selectedRoad && (
            <ThreeJSRoadVisualization 
              roadData={selectedRoad} 
              selectedSegment={selectedSegment}
              onSegmentSelect={setSelectedSegment}
            />
          )}
          
          {currentView === 'editor' && selectedRoad && (
            <ThreeJSRoadEditor 
              roadData={modifiedRoad || selectedRoad} 
              onRoadModify={handleRoadModification}
              selectedSegment={selectedSegment}
              onSegmentSelect={setSelectedSegment}
            />
          )}
          
          {currentView === 'simulation' && selectedRoad && (
            <div style={{ height: '100%', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                top: '20px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                zIndex: 1000,
                background: 'rgba(42, 42, 42, 0.9)',
                borderRadius: '8px',
                padding: '8px'
              }}>
                <SimulationControls 
                  isRunning={simulationRunning}
                  onToggleSimulation={setSimulationRunning}
                  onToggleCompare={() => setCompareMode(!compareMode)}
                  compareMode={compareMode}
                  onStopSimulation={() => setSimulationRunning(false)}
                  onResetSimulation={() => setSimulationRunning(false)}
                  style={{ background: 'transparent', border: 'none' }}
                />
              </div>
              <ThreeJSTrafficSimulation 
                roadData={modifiedRoad || selectedRoad}
                isRunning={simulationRunning}
                onVehicleData={(data) => {
                  // Handle traffic data for analytics
                  console.log('Traffic Data:', data)
                }}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties & Analytics */}
        {(currentView === 'editor' || currentView === 'simulation') && (
          <div className="urbans-sidebar right">
            <div className="property-panel">
              <div className="panel-header">
                <span>Analytics & Properties</span>
                <span>📊</span>
              </div>
              <div className="panel-content">
                <TrafficAnalytics 
                  originalRoad={selectedRoad}
                  modifiedRoad={modifiedRoad}
                  compareMode={compareMode}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="urbans-statusbar">
        <span>Mode: {use3DMode ? '2.5D Enhanced' : '2D Classic'}</span>
        <span>View: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}</span>
        {selectedRoad && <span>Road: {selectedRoad.name}</span>}
        {currentView === 'simulation' && <span>Simulation: {simulationRunning ? 'Running' : 'Stopped'}</span>}
        <span style={{ marginLeft: 'auto' }}>URBaNS v2.5D - Professional Traffic Simulation Suite</span>
      </div>
    </div>
  )
}

export default App

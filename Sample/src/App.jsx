import React, { useState } from 'react'
import './App.css'
import './styles/BlenderTheme.css'
import RoadTemplates from './components/RoadTemplates'
import ThreeJSRoadVisualization from './components/ThreeJSRoadVisualization'
import ThreeJSTrafficSimulation from './components/ThreeJSTrafficSimulation'
import ThreeJSRoadEditor from './components/ThreeJSRoadEditor'
import TwoD_RoadEditor from './components/TwoD_RoadEditor'
import SimulationControls from './components/SimulationControls'
import TrafficAnalytics from './components/TrafficAnalytics'

function App() {
  const [selectedRoad, setSelectedRoad] = useState(null)
  const [modifiedRoad, setModifiedRoad] = useState(null)
  const [currentView, setCurrentView] = useState('templates')
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [is3DMode, setIs3DMode] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [showInstructions, setShowInstructions] = useState(false)

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
    { id: 'editor', name: is3DMode ? '3D Editor' : '2D Editor', icon: is3DMode ? '✏️' : '📐', disabled: !selectedRoad },
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
          
          <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setIs3DMode(false)}
                className={`nav-button ${!is3DMode ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                2D Edit
              </button>
              <button
                onClick={() => setIs3DMode(true)}
                className={`nav-button ${is3DMode ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                3D View
              </button>
            </div>
            
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="nav-button"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              title="Navigation Help"
            >
              ❓ Help
            </button>
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
                      {is3DMode ? (
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
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                          {['select', 'lanes', 'speed', 'elevation', 'type', 'median', 'traffic', 'bus'].map(tool => (
                            <button
                              key={tool}
                              className={`btn btn-secondary ${selectedTool === tool ? 'btn-primary' : ''}`}
                              onClick={() => setSelectedTool(tool)}
                              style={{ padding: '6px', fontSize: '11px' }}
                              title={`${tool === 'select' ? 'Select segments' : 
                                      tool === 'lanes' ? 'Add lanes' :
                                      tool === 'speed' ? 'Increase speed limit' :
                                      tool === 'elevation' ? 'Raise elevation' :
                                      tool === 'type' ? 'Change road type' :
                                      tool === 'median' ? 'Toggle median' :
                                      tool === 'traffic' ? 'Toggle traffic lights' :
                                      'Toggle bus lanes'}`}
                            >
                              {tool === 'select' ? '🎯' :
                               tool === 'lanes' ? '🛣️' :
                               tool === 'speed' ? '⚡' :
                               tool === 'elevation' ? '🏔️' :
                               tool === 'type' ? '🌉' :
                               tool === 'median' ? '🛤️' :
                               tool === 'traffic' ? '🚦' : '🚌'}
                            </button>
                          ))}
                        </div>
                      )}
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

        {/* Navigation Instructions Overlay */}
        {showInstructions && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '350px',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Navigation Help</h3>
              <button 
                onClick={() => setShowInstructions(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            {currentView === 'editor' && (
              <div>
                <h4 style={{ color: 'var(--accent-blue)', marginBottom: '10px' }}>
                  {is3DMode ? '3D Editor Controls' : '2D Editor Controls'}
                </h4>
                {is3DMode ? (
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <li><strong>Mouse:</strong> Left click + drag to rotate view</li>
                    <li><strong>Wheel:</strong> Scroll to zoom in/out</li>
                    <li><strong>Right click:</strong> Pan the view</li>
                    <li><strong>Select:</strong> Click on road segments to select</li>
                    <li><strong>Transform:</strong> Use gizmos to move/rotate segments</li>
                    <li><strong>Properties:</strong> Edit values in right panel</li>
                  </ul>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <li><strong>Tools:</strong> Select tools from left palette</li>
                    <li><strong>Click:</strong> Apply selected tool to road segments</li>
                    <li><strong>Pan:</strong> Middle mouse or Shift+drag</li>
                    <li><strong>Zoom:</strong> Mouse wheel to zoom in/out</li>
                    <li><strong>Properties:</strong> View segment details in panels</li>
                    <li><strong>Preview:</strong> Switch to 3D mode to see results</li>
                  </ul>
                )}
              </div>
            )}
            
            {currentView === 'simulation' && (
              <div>
                <h4 style={{ color: 'var(--accent-blue)', marginBottom: '10px' }}>Simulation Controls</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <li><strong>Start/Stop:</strong> Use play button to control simulation</li>
                  <li><strong>Camera:</strong> Same 3D navigation as editor</li>
                  <li><strong>Analytics:</strong> View traffic data in right panel</li>
                  <li><strong>Compare:</strong> Enable to compare original vs modified</li>
                </ul>
              </div>
            )}
            
            {currentView === 'visualization' && (
              <div>
                <h4 style={{ color: 'var(--accent-blue)', marginBottom: '10px' }}>3D Visualization</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <li><strong>Explore:</strong> Navigate around your road design</li>
                  <li><strong>Inspect:</strong> Click segments for details</li>
                  <li><strong>View only:</strong> No editing in this mode</li>
                </ul>
              </div>
            )}
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
            <>
              {is3DMode ? (
                <ThreeJSRoadEditor 
                  roadData={modifiedRoad || selectedRoad} 
                  onRoadModify={handleRoadModification}
                  selectedSegment={selectedSegment}
                  onSegmentSelect={setSelectedSegment}
                />
              ) : (
                <TwoD_RoadEditor 
                  roadData={modifiedRoad || selectedRoad} 
                  onRoadModify={handleRoadModification}
                  selectedSegment={selectedSegment}
                  onSegmentSelect={setSelectedSegment}
                  selectedTool={selectedTool}
                  onToolSelect={setSelectedTool}
                />
              )}
            </>
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
        <span>Mode: {is3DMode ? '3D View' : '2D Edit'}</span>
        <span>View: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}</span>
        {selectedRoad && <span>Road: {selectedRoad.name}</span>}
        {currentView === 'simulation' && <span>Simulation: {simulationRunning ? 'Running' : 'Stopped'}</span>}
        <span style={{ marginLeft: 'auto' }}>URBaNS v2.5D - Professional Traffic Simulation Suite</span>
      </div>
    </div>
  )
}

export default App

import React, { useState, useRef, useEffect, useCallback } from 'react'

const RoadEditor = ({ roadData, onRoadModify }) => {
  const canvasRef = useRef(null)
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [modifiedRoad, setModifiedRoad] = useState(roadData)
  const [showGrid, setShowGrid] = useState(true)
  const [history, setHistory] = useState([roadData])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [roadConfig, setRoadConfig] = useState('6-lane') // 4-lane, 6-lane, one-way, two-way
  const [selectedTool, setSelectedTool] = useState('select') // select, bridge, divider, bus-lane

  useEffect(() => {
    setModifiedRoad(roadData)
    setHistory([roadData])
    setHistoryIndex(0)
  }, [roadData])

  const drawGrid = useCallback((ctx) => {
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    
    // Vertical lines
    for (let x = 0; x <= 1000; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 500)
      ctx.stroke()
    }
    
    // Horizontal lines
    for (let y = 0; y <= 500; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1000, y)
      ctx.stroke()
    }
    
    ctx.setLineDash([])
  }, [])

  const drawToolsOverlay = useCallback((ctx) => {
    // Tool indicators
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(10, 10, 200, 60)
    
    ctx.fillStyle = 'white'
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Selected: ${selectedSegment !== null ? `Segment ${selectedSegment + 1}` : 'None'}`, 20, 30)
    ctx.fillText(`Click segments to select/edit`, 20, 50)
  }, [selectedSegment])

  const drawEditableRoad = useCallback((ctx) => {
    if (!modifiedRoad) return

    // Calculate road dimensions
    const roadY = 200
    const maxLanes = Math.max(...modifiedRoad.segments.map(s => s.lanes))
    const roadHeight = maxLanes * 30
    
    // Draw segments
    modifiedRoad.segments.forEach((segment, index) => {
      const segmentWidth = 1000 / modifiedRoad.segments.length
      const startX = index * segmentWidth
      const currentRoadHeight = segment.lanes * 35
      const currentRoadY = roadY + (roadHeight - currentRoadHeight) / 2
      
      // Apply elevation for bridges
      const elevation = segment.hasBridge ? -20 : 0
      const adjustedRoadY = currentRoadY + elevation
      
      // Segment background
      const isSelected = selectedSegment === index
      let segmentColor = isSelected ? '#3b82f6' : '#4a5568'
      if (segment.hasBridge) segmentColor = '#8b5cf6' // Purple for bridges
      
      ctx.fillStyle = segmentColor
      ctx.fillRect(startX, adjustedRoadY, segmentWidth, currentRoadHeight)
      
      // Draw bridge structure if applicable
      if (segment.hasBridge) {
        // Bridge pillars
        ctx.fillStyle = '#6b7280'
        ctx.fillRect(startX + 10, adjustedRoadY + currentRoadHeight, 8, 30)
        ctx.fillRect(startX + segmentWidth - 18, adjustedRoadY + currentRoadHeight, 8, 30)
        
        // Bridge shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.fillRect(startX, adjustedRoadY + currentRoadHeight + 5, segmentWidth, 10)
      }
      
      // Draw lanes for this segment
      const laneHeight = currentRoadHeight / segment.lanes
      const halfLanes = Math.floor(segment.lanes / 2)
      
      for (let lane = 0; lane < segment.lanes; lane++) {
        const laneY = adjustedRoadY + (lane * laneHeight)
        
        // Bus lane highlighting
        if (segment.hasBusLane && (lane === 0 || lane === segment.lanes - 1)) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.3)' // Yellow highlight for bus lanes
          ctx.fillRect(startX, laneY, segmentWidth, laneHeight)
          
          // Bus lane text
          ctx.fillStyle = '#f59e0b'
          ctx.font = 'bold 10px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('BUS', startX + segmentWidth/2, laneY + laneHeight/2 + 3)
        }
        
        // Direction arrows for one-way roads
        if (segment.direction === 'forward' && lane % 2 === 0) {
          ctx.fillStyle = '#ffffff'
          ctx.font = '16px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('→', startX + segmentWidth/2, laneY + laneHeight/2 + 5)
        }
        
        // Lane divider
        if (lane > 0) {
          let dividerColor = '#e2e8f0'
          let lineWidth = 2
          
          // Center median (divider between opposite directions)
          if (segment.hasMedian && lane === halfLanes) {
            dividerColor = '#10b981' // Green for median
            lineWidth = 4
            
            // Draw trees on median
            if (segment.medianType === 'trees') {
              for (let treeX = startX + 20; treeX < startX + segmentWidth - 20; treeX += 40) {
                ctx.fillStyle = '#059669'
                ctx.beginPath()
                ctx.arc(treeX, laneY - 5, 8, 0, 2 * Math.PI)
                ctx.fill()
                
                // Tree trunk
                ctx.fillStyle = '#92400e'
                ctx.fillRect(treeX - 2, laneY - 5, 4, 10)
              }
            }
          }
          
          ctx.strokeStyle = dividerColor
          ctx.lineWidth = lineWidth
          ctx.setLineDash(segment.hasMedian && lane === halfLanes ? [] : [8, 8])
          ctx.beginPath()
          ctx.moveTo(startX, laneY)
          ctx.lineTo(startX + segmentWidth, laneY)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
      
      // Segment border
      ctx.strokeStyle = isSelected ? '#1d4ed8' : '#2d3748'
      ctx.lineWidth = isSelected ? 3 : 1
      ctx.setLineDash([])
      ctx.strokeRect(startX, adjustedRoadY, segmentWidth, currentRoadHeight)
      
      // Feature indicators
      const features = []
      if (segment.hasBridge) features.push('🌉')
      if (segment.hasMedian) features.push('🌳')
      if (segment.hasBusLane) features.push('🚌')
      if (segment.direction === 'forward') features.push('→')
      
      // Segment info
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${segment.lanes}L`, startX + segmentWidth/2, adjustedRoadY - 25)
      ctx.fillText(`${segment.speed}km/h`, startX + segmentWidth/2, adjustedRoadY - 10)
      if (features.length > 0) {
        ctx.fillText(features.join(' '), startX + segmentWidth/2, adjustedRoadY + currentRoadHeight + 30)
      }
      
      // Add/Remove lane buttons (only in select mode)
      if (isSelected && selectedTool === 'select') {
        // Add lane button
        ctx.fillStyle = '#10b981'
        ctx.fillRect(startX + 5, adjustedRoadY - 40, 20, 20)
        ctx.fillStyle = 'white'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('+', startX + 15, adjustedRoadY - 27)
        
        // Remove lane button
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(startX + 30, adjustedRoadY - 40, 20, 20)
        ctx.fillStyle = 'white'
        ctx.fillText('-', startX + 40, adjustedRoadY - 27)
      }
    })
    
    // Road edges
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(0, roadY)
    ctx.lineTo(1000, roadY)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(0, roadY + roadHeight)
    ctx.lineTo(1000, roadY + roadHeight)
    ctx.stroke()
  }, [modifiedRoad, selectedSegment, selectedTool])

  const drawEditor = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    canvas.width = 1000
    canvas.height = 500
    
    // Clear canvas
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, 1000, 500)
    
    // Draw grid
    if (showGrid) {
      drawGrid(ctx)
    }
    
    // Draw road
    drawEditableRoad(ctx)
    
    // Draw tools overlay
    drawToolsOverlay(ctx)
  }, [showGrid, drawGrid, drawEditableRoad, drawToolsOverlay])

  useEffect(() => {
    if (!modifiedRoad) return
    drawEditor()
  }, [modifiedRoad, selectedSegment, showGrid, drawEditor])



  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Scale coordinates
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const canvasX = x * scaleX
    const canvasY = y * scaleY
    
    // Check if clicked on a segment
    const segmentWidth = 1000 / modifiedRoad.segments.length
    const clickedSegment = Math.floor(canvasX / segmentWidth)
    
    if (clickedSegment >= 0 && clickedSegment < modifiedRoad.segments.length) {
      const roadY = 200
      const maxLanes = Math.max(...modifiedRoad.segments.map(s => s.lanes))
      const roadHeight = maxLanes * 30
      
      if (canvasY >= roadY && canvasY <= roadY + roadHeight) {
        setSelectedSegment(clickedSegment)
        
        // Apply selected tool if not in select mode
        if (selectedTool !== 'select') {
          applySelectedTool(clickedSegment)
        }
      }
      
      // Check for button clicks when in select mode
      if (selectedTool === 'select') {
        const startX = clickedSegment * segmentWidth
        if (selectedSegment === clickedSegment) {
          // Add lane button
          if (canvasX >= startX + 5 && canvasX <= startX + 25 && canvasY >= roadY - 30 && canvasY <= roadY - 10) {
            addLane(clickedSegment)
          }
          // Remove lane button
          if (canvasX >= startX + 30 && canvasX <= startX + 50 && canvasY >= roadY - 30 && canvasY <= roadY - 10) {
            removeLane(clickedSegment)
          }
        }
      }
    }
  }

  const addLane = (segmentIndex) => {
    const newRoad = { ...modifiedRoad }
    newRoad.segments = [...newRoad.segments]
    newRoad.segments[segmentIndex] = {
      ...newRoad.segments[segmentIndex],
      lanes: newRoad.segments[segmentIndex].lanes + 1
    }
    
    updateRoad(newRoad)
  }

  const removeLane = (segmentIndex) => {
    const newRoad = { ...modifiedRoad }
    if (newRoad.segments[segmentIndex].lanes > 1) {
      newRoad.segments = [...newRoad.segments]
      newRoad.segments[segmentIndex] = {
        ...newRoad.segments[segmentIndex],
        lanes: newRoad.segments[segmentIndex].lanes - 1
      }
      
      updateRoad(newRoad)
    }
  }

  const addSegment = () => {
    const newRoad = { ...modifiedRoad }
    const lastSegment = newRoad.segments[newRoad.segments.length - 1]
    
    newRoad.segments = [...newRoad.segments, {
      id: newRoad.segments.length + 1,
      start: lastSegment.end,
      end: [lastSegment.end[0] + 0.01, lastSegment.end[1] + 0.01],
      lanes: 4,
      speed: 50
    }]
    
    updateRoad(newRoad)
  }

  const removeSegment = () => {
    if (modifiedRoad.segments.length > 1) {
      const newRoad = { ...modifiedRoad }
      newRoad.segments = newRoad.segments.slice(0, -1)
      updateRoad(newRoad)
    }
  }

  const addFlyover = () => {
    if (selectedSegment !== null) {
      const newRoad = { ...modifiedRoad }
      newRoad.segments = [...newRoad.segments]
      
      // Insert flyover segment
      const currentSegment = newRoad.segments[selectedSegment]
      const flyoverSegment = {
        id: `flyover_${selectedSegment}`,
        start: currentSegment.start,
        end: currentSegment.end,
        lanes: Math.max(2, currentSegment.lanes - 2),
        speed: currentSegment.speed + 20,
        type: 'flyover'
      }
      
      newRoad.segments.splice(selectedSegment, 0, flyoverSegment)
      updateRoad(newRoad)
    }
  }

  const widenRoad = () => {
    const newRoad = { ...modifiedRoad }
    newRoad.segments = newRoad.segments.map(segment => ({
      ...segment,
      lanes: segment.lanes + 2
    }))
    
    updateRoad(newRoad)
  }



  const updateRoad = (newRoad) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newRoad)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setModifiedRoad(newRoad)
    onRoadModify(newRoad)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const previousRoad = history[newIndex]
      setModifiedRoad(previousRoad)
      onRoadModify(previousRoad)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const nextRoad = history[newIndex]
      setModifiedRoad(nextRoad)
      onRoadModify(nextRoad)
    }
  }

  const resetRoad = () => {
    setModifiedRoad(roadData)
    setHistory([roadData])
    setHistoryIndex(0)
    setSelectedSegment(null)
    onRoadModify(roadData)
  }

  const applyRoadConfiguration = (config) => {
    setRoadConfig(config)
    const newRoad = { ...modifiedRoad }
    
    switch (config) {
      case '4-lane':
        newRoad.segments = newRoad.segments.map(segment => ({
          ...segment,
          lanes: 4,
          direction: 'both',
          hasMedian: false,
          hasBusLane: false
        }))
        break
      case '6-lane':
        newRoad.segments = newRoad.segments.map(segment => ({
          ...segment,
          lanes: 6,
          direction: 'both',
          hasMedian: true,
          hasBusLane: false
        }))
        break
      case 'one-way':
        newRoad.segments = newRoad.segments.map(segment => ({
          ...segment,
          direction: 'forward',
          hasMedian: false
        }))
        break
      case 'two-way':
        newRoad.segments = newRoad.segments.map(segment => ({
          ...segment,
          direction: 'both',
          hasMedian: segment.lanes > 4
        }))
        break
    }
    
    updateRoad(newRoad)
  }

  const applySelectedTool = (segmentIndex) => {
    if (!modifiedRoad) return
    
    const newRoad = { ...modifiedRoad }
    newRoad.segments = [...newRoad.segments]
    
    switch (selectedTool) {
      case 'bridge':
        newRoad.segments[segmentIndex] = {
          ...newRoad.segments[segmentIndex],
          hasBridge: !newRoad.segments[segmentIndex].hasBridge,
          elevation: newRoad.segments[segmentIndex].hasBridge ? 0 : 5
        }
        break
      case 'divider':
        newRoad.segments[segmentIndex] = {
          ...newRoad.segments[segmentIndex],
          hasMedian: !newRoad.segments[segmentIndex].hasMedian,
          medianType: 'trees'
        }
        break
      case 'bus-lane':
        newRoad.segments[segmentIndex] = {
          ...newRoad.segments[segmentIndex],
          hasBusLane: !newRoad.segments[segmentIndex].hasBusLane
        }
        break
      case 'flyover':
        addFlyover(segmentIndex)
        return
      default:
        return
    }
    
    updateRoad(newRoad)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Road Editor</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1 rounded text-sm ${showGrid ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Grid
          </button>
          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm disabled:opacity-50"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm disabled:opacity-50"
          >
            Redo
          </button>
        </div>
      </div>

      {/* Tool Panel */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        {/* Road Configuration Presets */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Road Configuration</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['4-lane', '6-lane', 'one-way', 'two-way'].map((config) => (
              <button
                key={config}
                onClick={() => applyRoadConfiguration(config)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${roadConfig === config
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-200'
                }`}
              >
                🛣️ {config.charAt(0).toUpperCase() + config.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Construction Tools */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Construction Tools</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => setSelectedTool('bridge')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedTool === 'bridge'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-200'
              }`}
            >
              🌉 Bridge
            </button>
            <button
              onClick={() => setSelectedTool('divider')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedTool === 'divider'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-green-100 border border-gray-200'
              }`}
            >
              🌳 Divider
            </button>
            <button
              onClick={() => setSelectedTool('bus-lane')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedTool === 'bus-lane'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-orange-100 border border-gray-200'
              }`}
            >
              🚌 Bus Lane
            </button>
            <button
              onClick={() => setSelectedTool('flyover')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedTool === 'flyover'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-indigo-100 border border-gray-200'
              }`}
            >
              🛤️ Flyover
            </button>
            <button
              onClick={() => setSelectedTool('select')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedTool === 'select'
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              👆 Select
            </button>
          </div>
        </div>

        {/* Basic Operations */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Basic Operations</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={addSegment}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all shadow-md"
            >
              ➕ Add Segment
            </button>
            <button
              onClick={removeSegment}
              disabled={modifiedRoad?.segments.length <= 1}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-md"
            >
              ➖ Remove Segment
            </button>
            <button
              onClick={widenRoad}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md"
            >
              ↔️ Widen Road
            </button>
            <button
              onClick={resetRoad}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-all shadow-md"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Current Tool Info */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Active Tool:</span>
            <span className="text-sm font-semibold text-blue-600 capitalize">{selectedTool.replace('-', ' ')}</span>
            {selectedTool !== 'select' && (
              <span className="text-xs text-gray-500 ml-2">Click on road segments to apply</span>
            )}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-pointer"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Segment Details */}
      {selectedSegment !== null && modifiedRoad && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            Segment {selectedSegment + 1} Properties
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">
                Lanes: {modifiedRoad.segments[selectedSegment].lanes}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => removeLane(selectedSegment)}
                  disabled={modifiedRoad.segments[selectedSegment].lanes <= 1}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm disabled:opacity-50"
                >
                  -
                </button>
                <button
                  onClick={() => addLane(selectedSegment)}
                  className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">
                Speed Limit: {modifiedRoad.segments[selectedSegment].speed} km/h
              </label>
              <input
                type="range"
                min="20"
                max="120"
                value={modifiedRoad.segments[selectedSegment].speed}
                onChange={(e) => {
                  const newRoad = { ...modifiedRoad }
                  newRoad.segments = [...newRoad.segments]
                  newRoad.segments[selectedSegment] = {
                    ...newRoad.segments[selectedSegment],
                    speed: parseInt(e.target.value)
                  }
                  updateRoad(newRoad)
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        💡 Click on road segments to select and modify them • Use the + and - buttons on selected segments to add/remove lanes
      </div>
    </div>
  )
}

export default RoadEditor
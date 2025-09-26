import React from 'react'

const SimulationControls = ({ isRunning, onToggleSimulation, onToggleCompare, compareMode, onStopSimulation, onResetSimulation }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Play/Pause/Stop Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleSimulation(!isRunning)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
              isRunning
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play
              </>
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={() => {
              onStopSimulation && onStopSimulation()
              onToggleSimulation(false)
            }}
            disabled={!isRunning}
            className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V7z" clipRule="evenodd" />
            </svg>
            Stop
          </button>
          
          {/* Reset Button */}
          <button
            onClick={() => {
              onResetSimulation && onResetSimulation()
              onToggleSimulation(false)
            }}
            className="flex items-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset
          </button>
        </div>

        {/* Compare Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Compare Mode:</span>
          <button
            onClick={onToggleCompare}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              compareMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                compareMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">
            {compareMode ? 'Comparing Original vs Modified' : 'Single Road View'}
          </span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Additional Controls Row */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Simulation Presets */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Quick Scenarios:</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors">
                🌅 Morning Rush
              </button>
              <button className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors">
                🌆 Evening Peak
              </button>
              <button className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded transition-colors">
                🌙 Night Light
              </button>
              <button className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors">
                🚨 Emergency
              </button>
            </div>
          </div>

          {/* View Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex gap-1">
              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors">
                🔍 Zoom Fit
              </button>
              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors">
                📊 Metrics
              </button>
              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors">
                📹 Record
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-500">
        💡 Use play/pause to control simulation • Toggle compare mode to see before/after analysis • Quick scenarios apply different traffic patterns
      </div>
    </div>
  )
}

export default SimulationControls
import React, { useState, useEffect } from 'react'

const TrafficAnalytics = ({ originalRoad, modifiedRoad }) => {
  const [analytics, setAnalytics] = useState({
    original: null,
    modified: null,
    comparison: null
  })

  useEffect(() => {
    if (originalRoad) {
      const originalAnalytics = calculateRoadAnalytics(originalRoad)
      const modifiedAnalytics = modifiedRoad ? calculateRoadAnalytics(modifiedRoad) : null
      const comparisonData = modifiedAnalytics ? calculateComparison(originalAnalytics, modifiedAnalytics) : null

      setAnalytics({
        original: originalAnalytics,
        modified: modifiedAnalytics,
        comparison: comparisonData
      })
    }
  }, [originalRoad, modifiedRoad])

  const calculateRoadAnalytics = (road) => {
    const totalLanes = road.segments.reduce((sum, segment) => sum + segment.lanes, 0)
    const averageLanes = totalLanes / road.segments.length
    const averageSpeed = road.segments.reduce((sum, segment) => sum + segment.speed, 0) / road.segments.length
    
    // Calculate capacity (simplified formula)
    const capacity = totalLanes * 1800 // vehicles per hour per lane
    
    // Calculate traffic flow metrics
    const morningFlow = road.trafficFlow.morning
    const eveningFlow = road.trafficFlow.evening
    
    const peakFlowEfficiency = Math.min(eveningFlow.avgSpeed / averageSpeed, 1) * 100
    const congestionIndex = (1 - (eveningFlow.avgSpeed / averageSpeed)) * 100
    
    return {
      totalLanes,
      averageLanes: Math.round(averageLanes * 10) / 10,
      averageSpeed: Math.round(averageSpeed),
      capacity,
      peakFlowEfficiency: Math.round(peakFlowEfficiency),
      congestionIndex: Math.round(congestionIndex),
      morningDensity: Math.round(morningFlow.density * 100),
      eveningDensity: Math.round(eveningFlow.density * 100),
      morningSpeed: morningFlow.avgSpeed,
      eveningSpeed: eveningFlow.avgSpeed,
      segments: road.segments.length
    }
  }

  const calculateComparison = (original, modified) => {
    return {
      laneChange: modified.totalLanes - original.totalLanes,
      capacityChange: modified.capacity - original.capacity,
      speedChange: modified.averageSpeed - original.averageSpeed,
      efficiencyChange: modified.peakFlowEfficiency - original.peakFlowEfficiency,
      congestionChange: original.congestionIndex - modified.congestionIndex, // Reduction is positive
      segmentChange: modified.segments - original.segments
    }
  }

  const getChangeColor = (value, reverse = false) => {
    if (value === 0) return 'text-gray-600'
    const isPositive = reverse ? value < 0 : value > 0
    return isPositive ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (value, reverse = false) => {
    if (value === 0) return '='
    const isPositive = reverse ? value < 0 : value > 0
    return isPositive ? '↑' : '↓'
  }

  const MetricCard = ({ title, original, modified, unit = '', showChange = true, reverse = false }) => {
    const change = modified !== undefined ? modified - original : 0
    const changePercent = original !== 0 ? Math.round((change / original) * 100) : 0

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Original:</span>
            <span className="font-semibold text-gray-800">{original}{unit}</span>
          </div>
          {modified !== undefined && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Modified:</span>
                <span className="font-semibold text-gray-800">{modified}{unit}</span>
              </div>
              {showChange && (
                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Change:</span>
                  <span className={`font-semibold ${getChangeColor(change, reverse)}`}>
                    {getChangeIcon(change, reverse)} {Math.abs(change)}{unit} ({changePercent > 0 ? '+' : ''}{changePercent}%)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  const PerformanceChart = ({ data, title }) => {
    const maxValue = Math.max(...Object.values(data))
    
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => {
            const percentage = (value / maxValue) * 100
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-20 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-800 w-8">{value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Traffic Analytics Dashboard</h3>
      
      {analytics.original && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-3">
            <MetricCard
              title="Total Lanes"
              original={analytics.original.totalLanes}
              modified={analytics.modified?.totalLanes}
            />
            <MetricCard
              title="Road Capacity"
              original={analytics.original.capacity}
              modified={analytics.modified?.capacity}
              unit=" veh/hr"
            />
            <MetricCard
              title="Average Speed"
              original={analytics.original.averageSpeed}
              modified={analytics.modified?.averageSpeed}
              unit=" km/h"
            />
            <MetricCard
              title="Peak Efficiency"
              original={analytics.original.peakFlowEfficiency}
              modified={analytics.modified?.peakFlowEfficiency}
              unit="%"
            />
            <MetricCard
              title="Congestion Index"
              original={analytics.original.congestionIndex}
              modified={analytics.modified?.congestionIndex}
              unit="%"
              reverse={true}
            />
          </div>

          {/* Performance Charts */}
          <PerformanceChart
            title="Traffic Flow Comparison"
            data={{
              'Morning Density': analytics.original.morningDensity,
              'Evening Density': analytics.original.eveningDensity,
              'Morning Speed': analytics.original.morningSpeed,
              'Evening Speed': analytics.original.eveningSpeed
            }}
          />

          {/* Improvement Summary */}
          {analytics.comparison && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Improvement Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Capacity Gain:</span>
                  <span className={`font-semibold ${getChangeColor(analytics.comparison.capacityChange)}`}>
                    {analytics.comparison.capacityChange > 0 ? '+' : ''}{analytics.comparison.capacityChange} veh/hr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Speed Improvement:</span>
                  <span className={`font-semibold ${getChangeColor(analytics.comparison.speedChange)}`}>
                    {analytics.comparison.speedChange > 0 ? '+' : ''}{analytics.comparison.speedChange} km/h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Congestion Reduction:</span>
                  <span className={`font-semibold ${getChangeColor(analytics.comparison.congestionChange)}`}>
                    {analytics.comparison.congestionChange > 0 ? '-' : ''}{Math.abs(analytics.comparison.congestionChange)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Efficiency Gain:</span>
                  <span className={`font-semibold ${getChangeColor(analytics.comparison.efficiencyChange)}`}>
                    {analytics.comparison.efficiencyChange > 0 ? '+' : ''}{analytics.comparison.efficiencyChange}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Recommendations</h4>
            <div className="space-y-1 text-xs text-blue-700">
              {analytics.original.congestionIndex > 50 && (
                <p>• High congestion detected - consider adding more lanes or improving traffic flow</p>
              )}
              {analytics.original.peakFlowEfficiency < 60 && (
                <p>• Low peak efficiency - optimize signal timing or add bypass routes</p>
              )}
              {analytics.comparison?.capacityChange > 1000 && (
                <p>• Excellent capacity improvement - modifications show significant benefits</p>
              )}
              {analytics.comparison?.congestionChange < -10 && (
                <p>• Warning: Modifications may increase congestion - review design</p>
              )}
              <p>• Consider adding flyovers at major intersections for better flow</p>
              <p>• Monitor real-time traffic patterns for further optimization</p>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Export & Reports</h4>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors">
                📊 Export Metrics
              </button>
              <button className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded transition-colors">
                📈 Generate Report
              </button>
              <button className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded transition-colors">
                🔗 Share Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {!analytics.original && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>Select a road to view traffic analytics</p>
        </div>
      )}
    </div>
  )
}

export default TrafficAnalytics
    import React from 'react'

const RoadTemplates = ({ onTemplateSelect }) => {
  const roadTemplates = [
    {
      id: '6-lane-highway',
      name: '6-Lane Highway (Bidirectional)',
      description: 'Major highway with 3 lanes each direction separated by center median barrier',
      icon: '🛣️',
      complexity: 'Beginner',
      length: '4.0 km',
      segments: [
        { 
          id: 1, 
          lanes: 6, 
          speed: 100, 
          elevation: 0, 
          hasMedian: true, 
          medianType: 'barrier',
          direction: 'bidirectional',
          lanesPerDirection: 3,
          shoulderWidth: 3,
          length: '1.0km' 
        },
        { 
          id: 2, 
          lanes: 6, 
          speed: 100, 
          elevation: 0, 
          hasMedian: true, 
          medianType: 'barrier',
          direction: 'bidirectional',
          lanesPerDirection: 3,
          shoulderWidth: 3,
          length: '1.0km' 
        },
        { 
          id: 3, 
          lanes: 6, 
          speed: 100, 
          elevation: 0, 
          hasMedian: true, 
          medianType: 'barrier',
          direction: 'bidirectional',
          lanesPerDirection: 3,
          shoulderWidth: 3,
          length: '1.0km' 
        },
        { 
          id: 4, 
          lanes: 6, 
          speed: 100, 
          elevation: 0, 
          hasMedian: true, 
          medianType: 'barrier',
          direction: 'bidirectional',
          lanesPerDirection: 3,
          shoulderWidth: 3,
          length: '1.0km' 
        }
      ]
    },
    {
      id: '4-lane-street',
      name: '4-Lane Street (Bidirectional)',
      description: 'Urban arterial road with 2 lanes each direction and traffic signals',
      icon: '🏙️',
      complexity: 'Beginner',
      length: '3.0 km',
      segments: [
        { 
          id: 1, 
          lanes: 4, 
          speed: 60, 
          elevation: 0, 
          hasMedian: false,
          direction: 'bidirectional',
          lanesPerDirection: 2,
          hasTrafficLights: true,
          hasSidewalks: true,
          length: '0.75km' 
        },
        { 
          id: 2, 
          lanes: 4, 
          speed: 60, 
          elevation: 0, 
          hasMedian: false,
          direction: 'bidirectional',
          lanesPerDirection: 2,
          hasTrafficLights: true,
          hasSidewalks: true,
          length: '0.75km' 
        },
        { 
          id: 3, 
          lanes: 4, 
          speed: 60, 
          elevation: 0, 
          hasMedian: false,
          direction: 'bidirectional',
          lanesPerDirection: 2,
          hasTrafficLights: true,
          hasSidewalks: true,
          length: '0.75km' 
        },
        { 
          id: 4, 
          lanes: 4, 
          speed: 60, 
          elevation: 0, 
          hasMedian: false,
          direction: 'bidirectional',
          lanesPerDirection: 2,
          hasTrafficLights: true,
          hasSidewalks: true,
          length: '0.75km' 
        }
      ]
    },
    {
      id: '4-lane-bus-street',
      name: '4-Lane Street with Bus Lanes',
      description: 'Transit-oriented street with dedicated center bus lanes and regular traffic lanes',
      icon: '🚌',
      complexity: 'Intermediate',
      length: '3.2 km',
      segments: [
        { 
          id: 1, 
          lanes: 4, 
          speed: 50, 
          elevation: 0, 
          hasMedian: false,
          direction: 'bidirectional',
          lanesPerDirection: 2,
          hasBusLane: true,
          busLaneType: 'center',
          busLaneWidth: 3.5,
          hasTrafficLights: true,
          hasSidewalks: true,
          length: '0.8km' 
        },
        { 
          id: 2, 
          lanes: 4, 
          speed: 50, 
          elevation: 0, 
          hasMedian: false,
          direction: 'bidirectional',
          lanesPerDirection: 2,
          hasBusLane: true,
          busLaneType: 'center',
          busLaneWidth: 3.5,
          hasTrafficLights: true,
          hasSidewalks: true,
          length: '0.8km' 
        },
        { 
          id: 3, 
          lanes: 4, 
          speed: 50, 
          elevation: 0, 
          hasMedian: false,
          direction: 'bidirectional',
          lanesPerDirection: 2,
          hasBusLane: true,
          busLaneType: 'center',
          busLaneWidth: 3.5,
          hasTrafficLights: true,
          hasSidewalks: true,
          length: '0.8km' 
        },
        { 
          id: 4, 
          lanes: 4, 
          speed: 50, 
          elevation: 0, 
          hasMedian: false,
          direction: 'bidirectional',
          lanesPerDirection: 2,
          hasBusLane: true,
          busLaneType: 'center',
          busLaneWidth: 3.5,
          hasTrafficLights: true,
          hasSidewalks: true,
          length: '0.8km' 
        }
      ]
    }
  ]

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Beginner': return '#10b981'
      case 'Intermediate': return '#f59e0b'
      case 'Advanced': return '#ef4444'
      case 'Expert': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  const handleTemplateClick = (template) => {
    const roadData = {
      id: template.id,
      name: template.name,
      location: 'Custom Design',
      length: template.length,
      segments: template.segments,
      trafficFlow: {
        morning: { density: 0.7, avgSpeed: 45 },
        afternoon: { density: 0.5, avgSpeed: 55 },
        evening: { density: 0.8, avgSpeed: 35 },
        night: { density: 0.3, avgSpeed: 65 }
      }
    }
    onTemplateSelect(roadData)
  }

  return (
    <div style={{ 
      padding: '40px', 
      height: '100%', 
      overflow: 'auto',
      background: 'var(--bg-primary)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ 
          color: 'var(--text-primary)', 
          fontSize: '32px', 
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          Road Design Templates
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '16px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Choose from professionally designed road templates or start with a basic layout and customize it to your needs.
        </p>
      </div>

      {/* Template Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {roadTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            style={{
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="template-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 132, 255, 0.15)'
              e.currentTarget.style.borderColor = 'var(--accent-blue)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'var(--border-color)'
            }}
          >
            {/* Template Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '40px', 
                marginRight: '16px',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
              }}>
                {template.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '20px', 
                  fontWeight: '600',
                  margin: '0 0 4px 0'
                }}>
                  {template.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    color: getComplexityColor(template.complexity),
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    background: `${getComplexityColor(template.complexity)}20`,
                    borderRadius: '4px'
                  }}>
                    {template.complexity}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {template.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '14px', 
              lineHeight: '1.5',
              marginBottom: '20px'
            }}>
              {template.description}
            </p>

            {/* Template Preview */}
            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Road Segments
                </span>
              </div>
              
              {/* Segments Preview */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {template.segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    style={{
                      flex: 1,
                      height: '24px',
                      background: segment.type === 'overpass' ? 
                        'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 
                        'linear-gradient(135deg, #4a5568, #2d3748)',
                      borderRadius: '4px',
                      position: 'relative',
                      border: segment.hasMedian ? '1px solid #10b981' : 'none'
                    }}
                    title={`Segment ${index + 1}: ${segment.lanes} lanes, ${segment.speed}km/h, ${segment.elevation || 0}m elevation`}
                  >
                    {segment.type === 'overpass' && (
                      <div style={{
                        position: 'absolute',
                        top: '-2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '10px'
                      }}>
                        🌉
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {template.segments.length} segments
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Max: {Math.max(...template.segments.map(s => s.lanes))} lanes
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {Math.max(...template.segments.map(s => s.elevation || 0))}m elevation
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--accent-blue)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0066cc'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent-blue)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Start Designing →
            </button>

            {/* Decorative Element */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(0, 132, 255, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
          </div>
        ))}
      </div>

      {/* Custom Option */}
      <div style={{ 
        marginTop: '40px', 
        textAlign: 'center',
        padding: '30px',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '2px dashed var(--border-color)'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛠️</div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '8px' }}>
          Create Custom Road
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
          Start with a blank canvas and design your road from scratch
        </p>
        <button
          onClick={() => handleTemplateClick({
            id: 'custom',
            name: 'Custom Road Design',
            length: '2.0 km',
            segments: [
              { id: 1, lanes: 4, speed: 60, elevation: 0, hasMedian: false },
              { id: 2, lanes: 4, speed: 60, elevation: 0, hasMedian: false }
            ]
          })}
          style={{
            padding: '10px 24px',
            background: 'transparent',
            color: 'var(--accent-blue)',
            border: '2px solid var(--accent-blue)',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-blue)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--accent-blue)'
          }}
        >
          Start Custom Design
        </button>
      </div>
    </div>
  )
}

export default RoadTemplates
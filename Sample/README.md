# URBaNS - Urban Road Behavior and Navigation Simulator

A comprehensive traffic simulation and road network analysis tool built with React and Vite. URBaNS enables urban planners, traffic engineers, and researchers to visualize, modify, and simulate traffic flow on real road networks.

## 🚀 Features

### 🗺️ Interactive Map Selection
- Search and select real road networks from major Indian cities
- Pre-configured road data including S.P. Ring Road (Ahmedabad), Sarkhej-Gandhinagar Highway, and more
- Detailed road segment information with lane configurations and traffic patterns

### 🛠️ Advanced Road Editor
- Visual road segment editing with drag-and-drop interface
- Modify lane configurations (4-lane, 6-lane, one-way, two-way)
- Add infrastructure elements (bridges, dividers, bus lanes)
- Real-time grid-based editing with undo/redo functionality
- Multiple editing tools for precise road network modifications

### 🚗 Real-time Traffic Simulation
- Dynamic vehicle simulation with multiple vehicle types (cars, buses, trucks)
- Lane-specific behavior modeling
- Traffic flow patterns based on time of day (morning, afternoon, evening, night)
- Realistic vehicle physics and movement patterns
- Comparative simulation mode to analyze before/after scenarios

### 📊 Traffic Analytics Dashboard
- Comprehensive traffic flow analysis
- Road capacity calculations
- Performance metrics comparison
- Real-time analytics for original vs. modified road configurations
- Traffic density and average speed analysis

### 🎮 Simulation Controls
- Start/stop/reset simulation controls
- Variable simulation speed adjustment
- Compare mode for before/after analysis
- Background simulation processing

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Styling**: TailwindCSS 4.1.13
- **Canvas Rendering**: HTML5 Canvas for traffic simulation and road editing
- **State Management**: React Hooks (useState, useEffect, useCallback)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Sample
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 🎯 Usage

1. **Map Selection**: Choose a road network from the available options or search for specific roads
2. **Road Visualization**: View detailed road segments with lane configurations
3. **Road Editing**: Modify road parameters, add infrastructure, and customize lane layouts
4. **Traffic Simulation**: Run realistic traffic simulations with various vehicle types
5. **Analytics**: Analyze traffic performance metrics and compare scenarios

## 📁 Project Structure

```
src/
├── components/
│   ├── MapSelector.jsx          # Road network selection interface
│   ├── RoadEditor.jsx           # Interactive road editing canvas
│   ├── RoadVisualization.jsx    # Road segment visualization
│   ├── SimulationControls.jsx   # Simulation control panel
│   ├── TrafficAnalytics.jsx     # Analytics dashboard
│   └── TrafficSimulation.jsx    # Real-time traffic simulation
├── App.jsx                      # Main application component
├── App.css                      # Application styles
├── main.jsx                     # Application entry point
└── index.css                    # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🎨 Key Components

- **MapSelector**: Interactive interface for selecting and searching road networks
- **RoadEditor**: Advanced canvas-based editor for modifying road configurations
- **TrafficSimulation**: Real-time vehicle simulation with physics-based movement
- **TrafficAnalytics**: Comprehensive analytics dashboard with performance metrics
- **SimulationControls**: Control panel for managing simulation parameters

## 🚧 Future Enhancements

- Integration with real-time traffic APIs
- Machine learning-based traffic prediction
- Export functionality for simulation results
- Advanced traffic signal management
- Multi-city road network expansion

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is part of the URBaNS (Urban Road Behavior and Navigation Simulator) system.

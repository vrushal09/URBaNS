import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/BlenderTheme.css'
import App from './App.jsx'

// Override any Tailwind conflicts
document.documentElement.style.setProperty('--tw-ring-shadow', 'none')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

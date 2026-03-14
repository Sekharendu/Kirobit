import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App className="flex min-h-screen bg-[#0f0f0f] text-slate-100" />
  </StrictMode>,
)

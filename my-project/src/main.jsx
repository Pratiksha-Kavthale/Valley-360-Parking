import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ensure light mode on startup - remove any dark class
document.documentElement.classList.remove('dark');

// Clear any stored dark theme preference
if (localStorage.getItem('valley360_theme') === 'dark') {
  localStorage.setItem('valley360_theme', 'light');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


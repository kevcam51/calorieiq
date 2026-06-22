import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'           // Tailwind v4 (theme + utilities; preflight intentionally excluded)
import './storage.js'          // installs window.storage (Firestore-backed) + imports firebase
import AuthGate from './AuthGate.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
  </StrictMode>,
)

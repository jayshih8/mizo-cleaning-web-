import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Prevent an old browser-side CMS draft from overriding the latest deployed content.
// Admin edits still preview immediately in the current session, but every real page reload
// always starts from the newest contentConfig.json bundled by the production deployment.
try {
  localStorage.removeItem('mizo_config')
} catch (error) {
  console.warn('Unable to clear legacy MIZO preview cache', error)
}

const root = document.getElementById('root')
const app = <StrictMode><App /></StrictMode>
if (root.dataset.prerendered === 'true') hydrateRoot(root, app)
else createRoot(root).render(app)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Root element not found");
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  console.error("Mounting error:", e);
  document.body.innerHTML = `<div style="padding: 20px; color: red;"><h1>Mount Error</h1><p>${e.message}</p></div>`;
}

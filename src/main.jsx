import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AIProviderProvider } from './context/AIProviderContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AIProviderProvider>
          <App />
        </AIProviderProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

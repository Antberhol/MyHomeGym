import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from './components/ui/ErrorFallback'
import { LanguageProvider } from './context/LanguageContext'
// Tipografías dentro de la app (subconjunto latino: cubre español e inglés). No se pide nada a Google.
import '@fontsource/barlow/latin-400'
import '@fontsource/barlow/latin-500'
import '@fontsource/barlow/latin-600'
import '@fontsource/barlow/latin-700'
import '@fontsource/big-shoulders-display/latin-600'
import '@fontsource/big-shoulders-display/latin-700'
import '@fontsource/big-shoulders-display/latin-800'
import '@fontsource/big-shoulders-display/latin-900'
import './index.css'
import './i18n'
import App from './App'
import { registerServiceWorker } from './lib/pwa'

registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
)

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { RecruteurProvider } from './contexts/RecruteurContext'
import WizardPage from './pages/WizardPage'
import SuccessPage from './pages/SuccessPage'

export default function App() {
  return (
    <ThemeProvider>
      <RecruteurProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WizardPage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </BrowserRouter>
      </RecruteurProvider>
    </ThemeProvider>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import VocabularyPage from './pages/VocabularyPage'
import LoginPage from './pages/LoginPage'
import SsoPage from './pages/SsoPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<VocabularyPage />} />
      <Route path="/word-garden" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sso" element={<SsoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

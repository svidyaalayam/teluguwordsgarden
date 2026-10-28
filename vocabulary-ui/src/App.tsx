import { Routes, Route, Navigate } from 'react-router-dom'
import VocabularyPage from './pages/VocabularyPage'
import HomePage from './pages/HomePage'
import VarnamalaPage from './pages/VarnamalaPage'
import LoginPage from './pages/LoginPage'
import SsoPage from './pages/SsoPage'
import ResourcesPage from './pages/ResourcesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/varnamala" element={<VarnamalaPage />} />
      <Route path="/word-garden" element={<VocabularyPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sso" element={<SsoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

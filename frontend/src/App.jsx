import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Landing          from './pages/Landing'
import Login            from './pages/Login'
import Register         from './pages/Register'
import AdminDashboard   from './pages/admin/Dashboard'
import AdminAspirasi    from './pages/admin/Aspirasi'
import AdminPermohonan  from './pages/admin/Permohonan'
import AdminMasyarakat  from './pages/admin/Masyarakat'
import AdminPetugas     from './pages/admin/Petugas'
import AdminKelurahan   from './pages/admin/Kelurahan'
import UserAspirasi     from './pages/user/Aspirasi'
import UserPermohonan   from './pages/user/Permohonan'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-paper">
      <div className="flex items-center gap-3 text-sm text-muted">
        <span
          className="keep-motion inline-block h-4 w-4 animate-spin rounded-full border-2 border-rule border-t-ink"
          aria-hidden="true"
        />
        <span>Memuat sesi akun…</span>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'masyarakat' ? '/user/aspirasi' : '/admin/dashboard'} />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin + Petugas */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin', 'petugas']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/aspirasi" element={
        <ProtectedRoute allowedRoles={['admin', 'petugas']}><AdminAspirasi /></ProtectedRoute>
      } />
      <Route path="/admin/permohonan" element={
        <ProtectedRoute allowedRoles={['admin', 'petugas']}><AdminPermohonan /></ProtectedRoute>
      } />
      <Route path="/admin/masyarakat" element={
        <ProtectedRoute allowedRoles={['admin', 'petugas']}><AdminMasyarakat /></ProtectedRoute>
      } />
      <Route path="/admin/kelurahan" element={
        <ProtectedRoute allowedRoles={['admin', 'petugas']}><AdminKelurahan /></ProtectedRoute>
      } />

      {/* Admin only */}
      <Route path="/admin/petugas" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminPetugas /></ProtectedRoute>
      } />

      {/* Masyarakat */}
      <Route path="/user/aspirasi" element={
        <ProtectedRoute allowedRoles={['masyarakat']}><UserAspirasi /></ProtectedRoute>
      } />
      <Route path="/user/permohonan" element={
        <ProtectedRoute allowedRoles={['masyarakat']}><UserPermohonan /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

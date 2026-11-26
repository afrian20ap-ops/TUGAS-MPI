import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  Users,
  X,
} from 'lucide-react'
import api from '../services/api'

const ALL_NAV = [
  { path: '/admin/dashboard',  label: 'Dashboard',       icon: LayoutDashboard, roles: ['admin', 'petugas'] },
  { path: '/admin/aspirasi',   label: 'Aspirasi',        icon: MessageSquare,   roles: ['admin', 'petugas'] },
  { path: '/admin/permohonan', label: 'Permohonan',      icon: FileText,        roles: ['admin', 'petugas'] },
  { path: '/admin/masyarakat', label: 'Data masyarakat', icon: Users,           roles: ['admin'] },
  { path: '/admin/petugas',    label: 'Data petugas',    icon: Shield,          roles: ['admin'] },
  { path: '/admin/kelurahan',  label: 'Info kelurahan',  icon: Building2,       roles: ['admin', 'petugas'] },
]

export default function AdminLayout({ children }) {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifCount, setNotifCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = ALL_NAV.filter(item => item.roles.includes(role))

  useEffect(() => {
    const fetchCount = () => {
      api.get('/lupa-password/count')
        .then(r => setNotifCount(r.data.count || 0))
        .catch(() => {})
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (location.pathname === '/admin/dashboard') setNotifCount(0)
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-rail text-rail-ink">
      <div className="px-5 h-[68px] border-b border-rail-rule flex items-center justify-between gap-2">
        <Link to="/admin/dashboard" className="flex items-center gap-3 no-underline text-rail-ink min-w-0">
          <span className="w-9 h-9 rounded-control bg-rail-2 border border-rail-rule flex items-center justify-center shrink-0">
            <Building2 size={17} strokeWidth={1.75} aria-hidden="true" className="text-accent-soft" />
          </span>
          <span className="min-w-0">
            <span className="block font-display font-bold text-sm leading-tight">SIPLA</span>
            <span className="block text-xs text-rail-muted truncate">Serua Indah</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup menu"
          className="lg:hidden p-1.5 rounded-control text-rail-muted hover:text-rail-ink hover:bg-rail-2"
        >
          <X size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Navigasi admin" className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-medium no-underline transition-colors duration-150 ${
                active
                  ? 'bg-accent text-accent-ink font-semibold'
                  : 'text-rail-muted hover:bg-rail-2 hover:text-rail-ink'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.path === '/admin/dashboard' && notifCount > 0 && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-pill bg-accent-soft text-accent-soft-ink font-medium num">
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-rail-rule space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-rail-2 border border-rail-rule flex items-center justify-center text-xs font-bold text-rail-ink shrink-0">
            {user?.nama_petugas?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-rail-ink truncate">{user?.nama_petugas}</p>
            <p className="text-xs text-rail-muted capitalize">{user?.roles}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn-logout-dark w-full"
        >
          <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
          <span>Keluar dari akun</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-[100dvh] lg:h-[100dvh] flex flex-col lg:flex-row bg-paper text-ink">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-[300] h-[58px] glass-nav px-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu navigasi"
          className="btn btn-sm px-2.5"
        >
          <Menu size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>Menu</span>
        </button>
        <span className="font-display font-bold text-sm text-ink truncate">SIPLA Serua Indah</span>
        <button type="button" onClick={handleLogout} className="btn-logout" aria-label="Keluar dari akun">
          <LogOut size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[400] flex">
          <div className="w-64 max-w-[80vw] h-full">{sidebarContent}</div>
          <button
            type="button"
            aria-label="Tutup latar menu"
            onClick={() => setMobileOpen(false)}
            className="flex-1 bg-[var(--overlay-scrim)] border-0 cursor-pointer"
          />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-full">{sidebarContent}</aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">{children}</div>
      </main>
    </div>
  )
}

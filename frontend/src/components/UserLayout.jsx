import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Building2, FileText, LogOut, MessageSquare, User } from 'lucide-react'

export default function UserLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = [
    { path: '/user/aspirasi', label: 'Aspirasi saya', icon: MessageSquare },
    { path: '/user/permohonan', label: 'Permohonan layanan', icon: FileText },
  ]

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <header className="sticky top-0 z-[300] glass-nav">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link to="/user/aspirasi" className="inline-flex items-center gap-2.5 no-underline text-ink whitespace-nowrap">
              <span className="w-8 h-8 rounded-control bg-rail text-rail-ink flex items-center justify-center">
                <Building2 size={16} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display font-bold text-sm leading-tight">SIPLA</span>
                <span className="hidden sm:block text-xs text-muted leading-tight">Serua Indah</span>
              </span>
            </Link>

            <nav aria-label="Menu warga" className="hidden md:flex items-center gap-1.5">
              {navItems.map(n => {
                const Icon = n.icon
                const active = location.pathname === n.path
                return (
                  <Link
                    key={n.path}
                    to={n.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-control text-sm font-medium no-underline whitespace-nowrap transition-colors duration-150 ${
                      active
                        ? 'bg-accent-soft text-accent-soft-ink font-semibold'
                        : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                    <span>{n.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-paper-2 text-xs font-medium text-ink-2">
              <User size={14} strokeWidth={1.75} aria-hidden="true" className="text-accent" />
              <span>{user?.name || user?.username}</span>
            </span>
            <button type="button" onClick={handleLogout} className="btn-logout">
              <LogOut size={14} strokeWidth={1.75} aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Mobile subnav */}
        <nav aria-label="Menu warga ponsel" className="md:hidden border-t border-rule px-4 py-2 flex gap-2 overflow-x-auto">
          {navItems.map(n => {
            const active = location.pathname === n.path
            return (
              <Link
                key={n.path}
                to={n.path}
                className={`px-3 py-1.5 rounded-control text-xs font-semibold no-underline whitespace-nowrap ${
                  active ? 'bg-accent-soft text-accent-soft-ink' : 'text-muted'
                }`}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}

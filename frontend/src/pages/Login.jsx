import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, Building2, CheckCircle2, Eye, EyeOff, Info, ShieldCheck, User, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]     = useState({ username: '', password: '', role: 'masyarakat' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Lupa password
  const [showLupa, setShowLupa]       = useState(false)
  const [lupaForm, setLupaForm]       = useState({ nik: '', no_hp: '' })
  const [lupaStep, setLupaStep]       = useState('form')
  const [lupaError, setLupaError]     = useState('')
  const [lupaLoading, setLupaLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form.username, form.password, form.role)
      if (data.role === 'admin' || data.role === 'petugas') navigate('/admin/dashboard')
      else navigate('/user/aspirasi')
    } catch (err) {
      setError(err.response?.data?.error || 'Username atau password salah')
    } finally {
      setLoading(false)
    }
  }

  const handleLupaSubmit = async (e) => {
    e.preventDefault()
    setLupaError('')
    setLupaLoading(true)
    try {
      await api.post('/public/lupa-password', lupaForm)
      setLupaStep('success')
    } catch (err) {
      setLupaError(err.response?.data?.error || 'Gagal mengirim permintaan')
    } finally {
      setLupaLoading(false)
    }
  }

  const closeLupa = () => {
    setShowLupa(false)
    setLupaStep('form')
    setLupaForm({ nik: '', no_hp: '' })
    setLupaError('')
  }

  return (
    <div className="min-h-[100dvh] bg-paper grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Panel Kiri: Deep Executive Forest Civic Showcase */}
      <aside className="hidden lg:flex flex-col justify-between band-dark p-12 xl:p-16">
        <Link to="/" className="inline-flex items-center gap-3 text-rail-ink no-underline">
          <span className="w-9 h-9 rounded-control bg-rail-2 border border-rail-rule flex items-center justify-center">
            <Building2 size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-display font-bold text-base leading-tight">Kelurahan Serua Indah</span>
            <span className="block text-xs text-rail-muted">Ciputat, Tangerang Selatan</span>
          </span>
        </Link>

        <div className="my-10 space-y-6">
          <img
            src="/hero_bg.jpg"
            alt="Kantor Kelurahan Serua Indah"
            width={960}
            height={640}
            className="rounded-card w-full aspect-[16/10] object-cover border border-rail-rule"
          />
          <div>
            <h1 className="text-3xl leading-[1.1] font-bold text-rail-ink max-w-[18ch]">
              Pusat layanan dan aspirasi masyarakat.
            </h1>
            <p className="text-rail-muted text-sm mt-3 max-w-[44ch]">
              Sampaikan pengaduan fasilitas umum, ajukan surat keterangan, dan pantau status penanganan secara terbuka.
            </p>
          </div>
          <dl className="border-t border-rail-rule divide-y divide-rail-rule text-sm">
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-rail-muted">Jam layanan loket</dt>
              <dd className="text-rail-ink font-medium">Senin sampai Jumat, 08.00 hingga 16.00 WIB</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-rail-muted">Alamat</dt>
              <dd className="text-rail-ink font-medium">Jl. Serua Indah, Ciputat 15414</dd>
            </div>
          </dl>
        </div>

        <p className="text-xs text-rail-muted">
          Sistem Informasi Pusat Layanan dan Aspirasi Masyarakat (SIPLA)
        </p>
      </aside>

      {/* Panel Kanan: Elevated Login Panel */}
      <main className="flex flex-col justify-center items-center px-6 py-12 bg-paper">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2.5 text-ink no-underline">
              <span className="w-8 h-8 rounded-control bg-rail text-rail-ink flex items-center justify-center">
                <Building2 size={16} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="font-display font-bold text-base">Kelurahan Serua Indah</span>
            </Link>
            <span className="tag tag-in text-xs">SIPLA</span>
          </div>

          <div className="panel p-7 sm:p-8">
            <h2 className="text-2xl font-bold text-ink">Masuk ke akun Anda</h2>
            <p className="text-sm text-muted mt-1.5 mb-6">
              Pilih peran akun lalu masukkan username dan kata sandi.
            </p>

            {/* Toggle Role yang jelas dengan ikon & warna aktif hijau */}
            <div
              role="tablist"
              aria-label="Jenis akun"
              className="grid grid-cols-2 gap-2 p-1.5 bg-paper-2 border border-rule rounded-control mb-6"
            >
              {[
                { val: 'masyarakat', label: 'Masyarakat', icon: User },
                { val: 'petugas', label: 'Petugas / Admin', icon: ShieldCheck },
              ].map(r => {
                const Icon = r.icon
                const active = form.role === r.val
                return (
                  <button
                    key={r.val}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setForm({ ...form, role: r.val })
                      setError('')
                    }}
                    className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] text-sm font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                      active
                        ? 'bg-accent text-accent-ink'
                        : 'bg-transparent text-ink-2 hover:bg-accent-soft hover:text-accent-soft-ink'
                    }`}
                  >
                    <Icon size={15} strokeWidth={2} aria-hidden="true" className="shrink-0" />
                    <span>{r.label}</span>
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="notice notice-error" role="alert">
                  <AlertCircle size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="login-username" className="field-label">
                  {form.role === 'masyarakat' ? 'Username masyarakat' : 'Username petugas atau admin'}
                </label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder={form.role === 'masyarakat' ? 'Masukkan username warga' : 'Masukkan username petugas / admin'}
                  className="field-input"
                  required
                />
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <label htmlFor="login-password" className="field-label mb-0">Password</label>
                  {form.role === 'masyarakat' && (
                    <button
                      type="button"
                      onClick={() => setShowLupa(true)}
                      className="text-xs civic-link bg-transparent border-0 p-0 cursor-pointer"
                    >
                      Lupa password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Masukkan password"
                    className="field-input pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink rounded"
                  >
                    {showPass
                      ? <EyeOff size={16} strokeWidth={1.75} aria-hidden="true" />
                      : <Eye size={16} strokeWidth={1.75} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? 'Memproses…' : 'Masuk'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-rule-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
              <span>Belum punya akun warga?</span>
              <Link to="/register" className="civic-link">
                Daftar sekarang
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Lupa Password */}
      {showLupa && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="lupa-title">
          <div className="modal-panel max-w-md">
            <div className="px-6 py-4 border-b border-rule-2 flex items-start justify-between gap-4">
              <div>
                <h2 id="lupa-title" className="text-lg font-bold text-ink">Lupa password</h2>
                <p className="text-xs text-muted mt-0.5">Kirim permintaan reset ke petugas kelurahan</p>
              </div>
              <button type="button" onClick={closeLupa} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              {lupaStep === 'form' ? (
                <form onSubmit={handleLupaSubmit} className="space-y-4">
                  <div className="notice">
                    <Info size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 mt-0.5 text-accent" />
                    <span>
                      Isi NIK dan nomor HP terdaftar. Petugas kelurahan akan memproses permintaan dan menghubungi Anda.
                    </span>
                  </div>

                  {lupaError && (
                    <div className="notice notice-error" role="alert">
                      <AlertCircle size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 mt-0.5" />
                      <span>{lupaError}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="lupa-nik" className="field-label">NIK (16 digit)</label>
                    <input
                      id="lupa-nik"
                      name="nik"
                      type="text"
                      inputMode="numeric"
                      value={lupaForm.nik}
                      onChange={e => setLupaForm({ ...lupaForm, nik: e.target.value })}
                      placeholder="Masukkan NIK Anda"
                      maxLength={16}
                      className="field-input font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lupa-hp" className="field-label">No. HP terdaftar</label>
                    <input
                      id="lupa-hp"
                      name="no_hp"
                      type="tel"
                      value={lupaForm.no_hp}
                      onChange={e => setLupaForm({ ...lupaForm, no_hp: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="field-input font-mono"
                      required
                    />
                    <p className="text-xs text-muted mt-1 min-h-[1lh]">
                      Harus sesuai dengan nomor HP saat mendaftar.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeLupa} className="btn flex-1">
                      Batal
                    </button>
                    <button type="submit" disabled={lupaLoading} className="btn btn-primary flex-1">
                      {lupaLoading ? 'Mengirim…' : 'Kirim permintaan'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="notice notice-in">
                    <CheckCircle2 size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-accent-soft-ink">Permintaan terkirim</p>
                      <p className="mt-1">
                        Permintaan reset password Anda sudah diterima. Petugas kelurahan akan menghubungi nomor HP yang terdaftar.
                      </p>
                    </div>
                  </div>
                  <div className="notice notice-warn">
                    <span>
                      Jam layanan: Senin sampai Jumat, 08.00 hingga 16.00 WIB. Permintaan di luar jam layanan diproses pada hari kerja berikutnya.
                    </span>
                  </div>
                  <button type="button" onClick={closeLupa} className="btn btn-primary w-full">
                    Kembali ke halaman masuk
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

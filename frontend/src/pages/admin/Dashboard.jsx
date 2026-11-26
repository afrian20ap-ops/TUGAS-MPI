import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Polygon, Popup, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, Eye, EyeOff, Info, KeyRound, MapPin, Phone, X } from 'lucide-react'
import api from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { ProgressBar3D, Reveal3D, Tilt3D } from '../../components/Motion3D'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const STATUS_ASPIRASI = {
  verifikasi_lapangan: { label: 'Verifikasi lapangan',         color: '#6b7280', cls: 'tag-out' },
  koordinasi:          { label: 'Koordinasi perangkat daerah', color: '#b45309', cls: 'tag-warn' },
  proses_penyelesaian: { label: 'Proses penyelesaian',         color: '#1e3a34', cls: 'tag-on' },
  selesai:             { label: 'Selesai',                     color: '#0f766e', cls: 'tag-in' },
  ditolak:             { label: 'Ditolak',                     color: '#b91c1c', cls: 'tag-error' },
}

const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:999px;background:${color};border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10],
})

const ICONS = Object.fromEntries(
  Object.entries(STATUS_ASPIRASI).map(([k, v]) => [k, makeIcon(v.color)])
)
const getMarkerIcon = (status) => ICONS[status] || makeIcon('#1e3a34')

const SERUA_INDAH_POLYGON = [
  [-6.3050, 106.7180], [-6.3050, 106.7310], [-6.3100, 106.7340],
  [-6.3160, 106.7330], [-6.3200, 106.7290], [-6.3210, 106.7240],
  [-6.3180, 106.7190], [-6.3130, 106.7160], [-6.3080, 106.7165],
  [-6.3050, 106.7180],
]
const CENTER = [-6.3130, 106.7250]

function MapBounds({ polygon }) {
  const map = useMap()
  useEffect(() => {
    if (polygon.length) map.fitBounds(L.latLngBounds(polygon), { padding: [28, 28] })
  }, [polygon, map])
  return null
}

const statusBadge = (status) => {
  const st = STATUS_ASPIRASI[status]
  if (!st) return <span className="tag tag-out">{status}</span>
  return <span className={`tag ${st.cls}`}>{st.label}</span>
}

export default function AdminDashboard() {
  const { role } = useAuth()
  const [stats, setStats]                 = useState(null)
  const [kelurahan, setKelurahan]         = useState(null)
  const [aspirasi, setAspirasi]           = useState([])
  const [showKelurahan, setShowKelurahan] = useState(false)

  const [notifList, setNotifList]             = useState([])
  const [resetModal, setResetModal]           = useState(null)
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]               = useState(false)
  const [resetMsg, setResetMsg]               = useState(null)
  const [resetLoading, setResetLoading]       = useState(false)

  const fetchNotif = () => {
    api.get('/lupa-password?status=menunggu').then(r => setNotifList(r.data.data || []))
  }

  const fetchAll = () => {
    api.get('/dashboard').then(r => setStats(r.data))
    api.get('/kelurahan').then(r => setKelurahan(r.data.data))
    api.get('/aspirasi').then(r => setAspirasi(
      (r.data.data || []).filter(a =>
        a.latitude && a.longitude &&
        a.status !== 'selesai' && a.status !== 'ditolak'
      )
    ))
    fetchNotif()
  }

  useEffect(() => { fetchAll() }, [])

  const handleBaca = (id) => {
    api.put(`/lupa-password/${id}/baca`)
    setNotifList(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n))
  }

  const openResetModal = (notif) => {
    handleBaca(notif.id)
    setResetModal(notif)
    setNewPassword('')
    setConfirmPassword('')
    setShowPass(false)
    setResetMsg(null)
  }

  const handleSelesaikan = async (e) => {
    e.preventDefault()
    setResetMsg(null)
    if (newPassword.length < 6) { setResetMsg({ type: 'error', text: 'Password minimal 6 karakter' }); return }
    if (newPassword !== confirmPassword) { setResetMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' }); return }
    setResetLoading(true)
    try {
      const res = await api.put(`/lupa-password/${resetModal.id}/selesai`, {
        new_password: newPassword,
        catatan: `Direset oleh petugas. Hubungi ${resetModal.no_hp}`,
      })
      setResetMsg({ type: 'success', text: res.data.message })
      fetchNotif()
      setTimeout(() => setResetModal(null), 1800)
    } catch (err) {
      setResetMsg({ type: 'error', text: err.response?.data?.error || 'Gagal mereset password' })
    } finally {
      setResetLoading(false)
    }
  }

  const unreadCount   = notifList.filter(n => !n.dibaca).length
  const totalAspirasi = stats?.total_aspirasi ?? stats?.total_pengaduan ?? 0
  const selesaiAsp    = stats?.selesai ?? 0
  const totalPerm     = stats?.total_permohonan ?? 0
  const selesaiPerm   = stats?.perm_selesai ?? 0
  const aktifAsp      = totalAspirasi - selesaiAsp
  const aktifPerm     = totalPerm - selesaiPerm

  const aspByStatus = Object.entries(STATUS_ASPIRASI)
    .filter(([k]) => k !== 'selesai' && k !== 'ditolak')
    .map(([k]) => ({
      key: k,
      label: STATUS_ASPIRASI[k].label,
      color: STATUS_ASPIRASI[k].color,
      count: aspirasi.filter(a => a.status === k).length,
    }))
    .filter(s => s.count > 0)

  const pctAsp  = totalAspirasi ? Math.round((selesaiAsp / totalAspirasi) * 100) : 0
  const pctPerm = totalPerm ? Math.round((selesaiPerm / totalPerm) * 100) : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Dashboard pelayanan</h1>
            <p className="text-sm text-muted mt-1">Kelurahan Serua Indah, Kecamatan Ciputat</p>
          </div>
          <button type="button" onClick={() => setShowKelurahan(true)} className="btn btn-sm">
            Info kelurahan
          </button>
        </div>

        {/* Permintaan Reset Password */}
        {notifList.length > 0 && (
          <section className="panel overflow-hidden">
            <div className="px-5 py-3.5 bg-warn-soft flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <KeyRound size={16} strokeWidth={1.75} aria-hidden="true" className="text-warn-soft-ink" />
                <h2 className="text-sm font-bold text-warn-soft-ink">Permintaan reset password</h2>
                {unreadCount > 0 && (
                  <span className="tag tag-on font-mono text-xs num">{unreadCount} baru</span>
                )}
              </div>
              <span className="text-xs text-warn-soft-ink font-mono num">{notifList.length} menunggu</span>
            </div>
            <div className="divide-y divide-rule-2">
              {notifList.map(n => (
                <div key={n.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{n.masyarakat?.name || n.nik}</p>
                    <p className="text-xs text-muted font-mono mt-0.5">
                      NIK {n.nik}, HP {n.no_hp} ({new Date(n.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})
                    </p>
                  </div>
                  <button type="button" onClick={() => openResetModal(n)} className="btn btn-primary btn-sm shrink-0">
                    Proses
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ringkasan Angka Operasional 3D Interaktif & Klik Menuju Tujuan */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 stage-3d">
          {[
            { label: 'Total aspirasi',   val: totalAspirasi,             to: '/admin/aspirasi',                highlight: false },
            { label: 'Aspirasi aktif',   val: aktifAsp,                  to: '/admin/aspirasi?status=aktif',   highlight: false },
            { label: 'Aspirasi selesai', val: selesaiAsp,                to: '/admin/aspirasi?status=selesai', highlight: true  },
            { label: 'Total permohonan', val: totalPerm,                 to: '/admin/permohonan',              highlight: false },
            { label: 'Permohonan aktif', val: aktifPerm,                 to: '/admin/permohonan?status=aktif', highlight: false },
            { label: 'Warga terdaftar',  val: stats?.total_masyarakat ?? '-', to: role === 'admin' ? '/admin/masyarakat' : '/admin/aspirasi', highlight: false },
          ].map((item, idx) => (
            <Reveal3D key={item.label} delay={idx * 45}>
              <Tilt3D maxTilt={6} className="rounded-card h-full">
                <Link to={item.to} className="card-link p-4 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <span className="card-link-label text-xs font-medium text-muted">{item.label}</span>
                    <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" className="card-link-icon text-muted shrink-0" />
                  </div>
                  <span className={`card-link-val mt-2.5 block font-display font-bold text-2xl num tilt-3d-layer ${item.highlight ? 'text-accent-soft-ink' : 'text-ink'}`}>
                    {item.val ?? '-'}
                  </span>
                </Link>
              </Tilt3D>
            </Reveal3D>
          ))}
        </div>

        {/* Peta Wilayah + Antrean Terbaru */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-6 items-start">
          {/* Peta */}
          <section className="panel p-5 min-w-0">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-ink">Peta sebaran aspirasi aktif</h2>
                <p className="text-xs text-muted mt-0.5">Menampilkan titik laporan yang belum selesai atau ditolak.</p>
              </div>
              <span className="tag tag-in font-mono text-xs num">{aspirasi.length} titik</span>
            </div>

            <div className="rounded-control overflow-hidden border border-rule" style={{ height: 370 }}>
              <MapContainer center={CENTER} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapBounds polygon={SERUA_INDAH_POLYGON} />
                <Polygon
                  positions={SERUA_INDAH_POLYGON}
                  pathOptions={{ color: '#0f766e', fillColor: '#0f766e', fillOpacity: 0.14, weight: 2 }}
                  eventHandlers={{ click: () => setShowKelurahan(true) }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold">Kelurahan Serua Indah</p>
                      <p>Kecamatan Ciputat, Tangerang Selatan</p>
                      {kelurahan && <p className="mt-1">{kelurahan.jumlah_penduduk?.toLocaleString('id-ID')} jiwa</p>}
                    </div>
                  </Popup>
                </Polygon>
                {aspirasi.map(a => (
                  <Marker key={a.id_pengaduan} position={[a.latitude, a.longitude]} icon={getMarkerIcon(a.status)}>
                    <Popup>
                      <div className="text-xs space-y-1" style={{ minWidth: 160 }}>
                        <p className="font-semibold">{a.judul_laporan}</p>
                        <p>{a.lokasi_kejadian}</p>
                        {statusBadge(a.status)}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {aspByStatus.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 mt-3.5 text-xs text-muted">
                {aspByStatus.map(s => (
                  <span key={s.key} className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      style={{ width: 9, height: 9, borderRadius: '999px', background: s.color, display: 'inline-block' }}
                    />
                    <span>{s.label} ({s.count})</span>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Kolom Kanan */}
          <div className="space-y-5 min-w-0">
            <section className="panel p-5">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-base font-bold text-ink">Aspirasi terbaru</h2>
                <Link to="/admin/aspirasi" className="text-xs civic-link">Lihat semua</Link>
              </div>
              <div className="divide-y divide-rule-2">
                {(stats?.recent_aspirasi || []).slice(0, 4).map(p => (
                  <Link
                    key={p.id_pengaduan}
                    to="/admin/aspirasi"
                    className="service-row-link"
                  >
                    <div className="min-w-0">
                      <p className="service-row-title text-sm font-semibold text-ink truncate">{p.judul_laporan}</p>
                      <p className="text-xs text-muted mt-0.5">{p.masyarakat?.name || p.nik}</p>
                    </div>
                    {statusBadge(p.status)}
                  </Link>
                ))}
                {!stats?.recent_aspirasi?.length && (
                  <p className="py-4 text-xs text-muted">Belum ada aspirasi masuk.</p>
                )}
              </div>
            </section>

            <section className="panel p-5">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-base font-bold text-ink">Permohonan terbaru</h2>
                <Link to="/admin/permohonan" className="text-xs civic-link">Lihat semua</Link>
              </div>
              <div className="divide-y divide-rule-2">
                {(stats?.recent_permohonan || []).slice(0, 3).map(p => {
                  const stMap = {
                    verifikasi_persyaratan: ['Verifikasi', 'tag-out'],
                    pembuatan_draft:        ['Draft surat', 'tag-warn'],
                    penandatanganan:        ['Tanda tangan', 'tag-warn'],
                    register_dokumen:       ['Register', 'tag-on'],
                    selesai:                ['Selesai', 'tag-in'],
                    ditolak:                ['Ditolak', 'tag-error'],
                  }[p.status] || [p.status, 'tag-out']
                  return (
                    <Link
                      key={p.id}
                      to="/admin/permohonan"
                      className="service-row-link"
                    >
                      <div className="min-w-0">
                        <p className="service-row-title text-sm font-semibold text-ink truncate">{p.jenis_layanan?.nama_layanan}</p>
                        <p className="text-xs text-muted mt-0.5">{p.masyarakat?.name || p.nik}</p>
                      </div>
                      <span className={`tag ${stMap[1]} shrink-0`}>{stMap[0]}</span>
                    </Link>
                  )
                })}
                {!stats?.recent_permohonan?.length && (
                  <p className="py-4 text-xs text-muted">Belum ada permohonan masuk.</p>
                )}
              </div>
            </section>

            <Reveal3D delay={120}>
              <section className="panel p-5 space-y-3.5">
                <h2 className="text-sm font-bold text-ink">Tingkat penyelesaian</h2>
                {[
                  { label: 'Aspirasi', selesai: selesaiAsp, total: totalAspirasi, pct: pctAsp },
                  { label: 'Permohonan', selesai: selesaiPerm, total: totalPerm, pct: pctPerm },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-ink-2 font-medium">{item.label}</span>
                      <span className="font-mono text-ink num">{item.selesai}/{item.total} ({item.pct}%)</span>
                    </div>
                    <ProgressBar3D pct={item.pct} />
                  </div>
                ))}
              </section>
            </Reveal3D>
          </div>
        </div>
      </div>

      {/* Modal Info Kelurahan */}
      {showKelurahan && kelurahan && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="info-kel-title">
          <div className="modal-panel max-w-lg">
            <div className="px-6 py-4 border-b border-rule-2 flex items-start justify-between gap-4">
              <div>
                <h2 id="info-kel-title" className="text-lg font-bold text-ink">{kelurahan.nama}</h2>
                <p className="text-xs text-muted mt-0.5">Kecamatan {kelurahan.kecamatan}, {kelurahan.kota}</p>
              </div>
              <button type="button" onClick={() => setShowKelurahan(false)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <dl className="grid grid-cols-2 gap-3">
                {[
                  ['Jumlah penduduk', `${kelurahan.jumlah_penduduk?.toLocaleString('id-ID')} jiwa`],
                  ['Jumlah KK', `${kelurahan.jumlah_kk?.toLocaleString('id-ID')} KK`],
                  ['Luas wilayah', kelurahan.luas_wilayah],
                  ['Kode pos', kelurahan.kode_pos],
                ].map(([l, v]) => (
                  <div key={l} className="well p-3">
                    <dt className="text-xs text-muted">{l}</dt>
                    <dd className="font-semibold text-ink mt-0.5 font-mono num">{v}</dd>
                  </div>
                ))}
              </dl>

              {kelurahan.visi && (
                <div>
                  <h3 className="text-xs font-semibold text-muted mb-1">Visi</h3>
                  <p className="text-ink-2">{kelurahan.visi}</p>
                </div>
              )}
              {kelurahan.misi && (
                <div>
                  <h3 className="text-xs font-semibold text-muted mb-1">Misi</h3>
                  <p className="text-ink-2 whitespace-pre-line">{kelurahan.misi}</p>
                </div>
              )}
              <div className="pt-4 border-t border-rule-2 space-y-1.5 text-xs text-ink-2">
                <p className="flex items-center gap-2"><MapPin size={13} aria-hidden="true" className="text-accent" /> {kelurahan.alamat_kantor}</p>
                <p className="flex items-center gap-2"><Phone size={13} aria-hidden="true" className="text-accent" /> {kelurahan.telp_kantor}</p>
                <p className="flex items-center gap-2"><Clock size={13} aria-hidden="true" className="text-accent" /> {kelurahan.jam_operasional}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Proses Reset Password */}
      {resetModal && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="reset-dash-title">
          <div className="modal-panel max-w-md">
            <div className="px-6 py-4 border-b border-rule-2 flex items-start justify-between gap-4">
              <div>
                <h2 id="reset-dash-title" className="text-base font-bold text-ink">Proses reset password</h2>
                <p className="text-xs text-muted mt-0.5">
                  {resetModal.masyarakat?.name || resetModal.nik}, HP {resetModal.no_hp}
                </p>
              </div>
              <button type="button" onClick={() => setResetModal(null)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleSelesaikan} className="p-6 space-y-4">
              <div className="notice">
                <Info size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 mt-0.5 text-accent" />
                <span>Tetapkan password baru lalu informasikan kepada warga di nomor {resetModal.no_hp}.</span>
              </div>

              {resetMsg && (
                <div className={`notice ${resetMsg.type === 'success' ? 'notice-in' : 'notice-error'}`} role="alert">
                  {resetMsg.type === 'success'
                    ? <CheckCircle2 size={16} aria-hidden="true" className="shrink-0 mt-0.5" />
                    : <AlertCircle size={16} aria-hidden="true" className="shrink-0 mt-0.5" />}
                  <span>{resetMsg.text}</span>
                </div>
              )}

              <div>
                <label htmlFor="dash-new-pw" className="field-label">Password baru</label>
                <div className="relative">
                  <input
                    id="dash-new-pw"
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="field-input pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink"
                  >
                    {showPass ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="dash-confirm-pw" className="field-label">Konfirmasi password</label>
                <input
                  id="dash-confirm-pw"
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="field-input"
                  required
                />
                <p className="text-xs mt-1 min-h-[1lh] text-muted">
                  {confirmPassword && confirmPassword !== newPassword && (
                    <span className="text-error">Konfirmasi password belum cocok.</span>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <span className="text-accent-soft-ink">Password cocok.</span>
                  )}
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setResetModal(null)} className="btn flex-1">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || newPassword !== confirmPassword || newPassword.length < 6}
                  className="btn btn-primary flex-1"
                >
                  {resetLoading ? 'Menyimpan…' : 'Reset dan selesaikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

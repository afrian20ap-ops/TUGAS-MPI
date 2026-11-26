import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Plus, Trash2, X } from 'lucide-react'
import api from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../context/AuthContext'

const EMPTY_FORM = { nama_petugas: '', username: '', password: '', telp: '', roles: 'petugas' }

export default function AdminPetugas() {
  const { user } = useAuth()
  const [list, setList]                       = useState([])
  const [showForm, setShowForm]               = useState(false)
  const [form, setForm]                       = useState(EMPTY_FORM)
  const [showPass, setShowPass]               = useState(false)
  const [formLoading, setFormLoading]         = useState(false)
  const [formMsg, setFormMsg]                 = useState(null)
  const [resetModal, setResetModal]           = useState(null)
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showResetPass, setShowResetPass]     = useState(false)
  const [resetLoading, setResetLoading]       = useState(false)
  const [resetMsg, setResetMsg]               = useState(null)

  const fetchData = () => api.get('/petugas').then(r => setList(r.data.data || []))
  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormMsg(null)
    setFormLoading(true)
    try {
      await api.post('/petugas', form)
      setShowForm(false)
      setForm(EMPTY_FORM)
      setFormMsg({ type: 'success', text: `Petugas "${form.nama_petugas}" berhasil ditambahkan.` })
      fetchData()
    } catch (err) {
      setFormMsg({ type: 'error', text: err.response?.data?.error || 'Gagal menambah petugas' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Hapus petugas "${p.nama_petugas}" (${p.username})? Tindakan ini tidak dapat dibatalkan.`)) return
    try {
      await api.delete(`/petugas/${p.id_petugas}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus petugas')
    }
  }

  const openReset = (p) => {
    setResetModal(p)
    setNewPassword('')
    setConfirmPassword('')
    setShowResetPass(false)
    setResetMsg(null)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setResetMsg(null)
    if (newPassword.length < 6) { setResetMsg({ type: 'error', text: 'Password minimal 6 karakter' }); return }
    if (newPassword !== confirmPassword) { setResetMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' }); return }
    setResetLoading(true)
    try {
      const res = await api.put(`/reset-password/petugas/${resetModal.id_petugas}`, { new_password: newPassword })
      setResetMsg({ type: 'success', text: res.data.message })
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setResetMsg({ type: 'error', text: err.response?.data?.error || 'Gagal mereset password' })
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Data petugas</h1>
            <p className="text-sm text-muted mt-1 font-mono num">{list.length} petugas terdaftar</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm(true); setFormMsg(null) }}
            className="btn btn-primary"
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>Tambah petugas</span>
          </button>
        </div>

        {formMsg && !showForm && (
          <div className={`notice ${formMsg.type === 'success' ? 'notice-in' : 'notice-error'}`} role="status">
            {formMsg.type === 'success'
              ? <CheckCircle2 size={16} aria-hidden="true" className="shrink-0 mt-0.5" />
              : <AlertCircle size={16} aria-hidden="true" className="shrink-0 mt-0.5" />}
            <span>{formMsg.text}</span>
          </div>
        )}

        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama petugas</th>
                  <th>Username</th>
                  <th>No. HP</th>
                  <th>Peran</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted">Tidak ada data petugas.</td></tr>
                ) : list.map((p, i) => {
                  const isSelf = p.username === user?.username
                  return (
                    <tr key={p.id_petugas}>
                      <td className="font-mono text-xs text-muted num">{i + 1}</td>
                      <td>
                        <p className="font-semibold text-ink">{p.nama_petugas}</p>
                        {isSelf && <p className="text-xs text-accent-soft-ink">Akun Anda</p>}
                      </td>
                      <td className="font-mono text-xs text-ink-2">{p.username}</td>
                      <td className="font-mono text-xs text-ink-2">{p.telp || '-'}</td>
                      <td>
                        <span className={`tag ${p.roles === 'admin' ? 'tag-on' : 'tag-in'}`}>
                          {p.roles === 'admin' ? 'Administrator' : 'Petugas'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => openReset(p)} className="btn btn-sm">
                            <KeyRound size={13} aria-hidden="true" />
                            <span>Reset PW</span>
                          </button>
                          {!isSelf && (
                            <button type="button" onClick={() => handleDelete(p)} className="btn btn-danger btn-sm" aria-label="Hapus petugas">
                              <Trash2 size={13} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tambah Petugas */}
      {showForm && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="add-petugas-title">
          <div className="modal-panel max-w-md">
            <div className="px-6 py-4 border-b border-rule-2 flex items-center justify-between">
              <h2 id="add-petugas-title" className="text-base font-bold text-ink">Tambah petugas baru</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formMsg && (
                <div className={`notice ${formMsg.type === 'success' ? 'notice-in' : 'notice-error'}`} role="alert">
                  <span>{formMsg.text}</span>
                </div>
              )}

              <div>
                <p className="field-label">Peran akun</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'petugas', label: 'Petugas', desc: 'Kelola aspirasi dan permohonan' },
                    { val: 'admin',   label: 'Administrator', desc: 'Akses penuh seluruh fitur' },
                  ].map(r => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setForm({ ...form, roles: r.val })}
                      className={`p-3 rounded-control border text-left transition-colors duration-150 ${
                        form.roles === r.val
                          ? 'border-accent bg-accent-soft'
                          : 'border-rule bg-surface hover:border-muted'
                      }`}
                    >
                      <p className="font-semibold text-sm text-ink">{r.label}</p>
                      <p className="text-xs text-muted mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {[
                ['Nama lengkap', 'nama_petugas', 'text', 'Nama petugas'],
                ['Username',     'username',     'text', 'Username login'],
                ['No. HP',       'telp',         'tel',  '08xxxxxxxxxx'],
              ].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label htmlFor={`pet-${key}`} className="field-label">{label}</label>
                  <input
                    id={`pet-${key}`}
                    type={type}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    required={key !== 'telp'}
                    className={`field-input ${key === 'telp' ? 'font-mono' : ''}`}
                  />
                </div>
              ))}

              <div>
                <label htmlFor="pet-password" className="field-label">Password</label>
                <div className="relative">
                  <input
                    id="pet-password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    required
                    className="field-input pr-11"
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

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn flex-1">Batal</button>
                <button type="submit" disabled={formLoading} className="btn btn-primary flex-1">
                  {formLoading ? 'Menyimpan…' : 'Tambah petugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password Petugas */}
      {resetModal && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="reset-pet-title">
          <div className="modal-panel max-w-md">
            <div className="px-6 py-4 border-b border-rule-2 flex items-start justify-between gap-4">
              <div>
                <h2 id="reset-pet-title" className="text-base font-bold text-ink">Reset password petugas</h2>
                <p className="text-xs text-muted mt-0.5">
                  {resetModal.nama_petugas} (<span className="font-mono">{resetModal.username}</span>)
                </p>
              </div>
              <button type="button" onClick={() => setResetModal(null)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleReset} className="p-6 space-y-4">
              <div className="notice notice-warn">
                <span>Password baru langsung aktif pada sesi login berikutnya.</span>
              </div>
              {resetMsg && (
                <div className={`notice ${resetMsg.type === 'success' ? 'notice-in' : 'notice-error'}`} role="alert">
                  <span>{resetMsg.text}</span>
                </div>
              )}
              <div>
                <label htmlFor="pet-new-pw" className="field-label">Password baru</label>
                <div className="relative">
                  <input
                    id="pet-new-pw"
                    type={showResetPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="field-input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPass(!showResetPass)}
                    aria-label={showResetPass ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink"
                  >
                    {showResetPass ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="pet-conf-pw" className="field-label">Konfirmasi password</label>
                <input
                  id="pet-conf-pw"
                  type={showResetPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  className="field-input"
                />
                <p className="text-xs mt-1 min-h-[1lh] text-muted">
                  {confirmPassword && confirmPassword !== newPassword && (
                    <span className="text-error">Password tidak cocok.</span>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <span className="text-accent-soft-ink">Password cocok.</span>
                  )}
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setResetModal(null)} className="btn flex-1">Batal</button>
                <button
                  type="submit"
                  disabled={resetLoading || newPassword !== confirmPassword || newPassword.length < 6}
                  className="btn btn-primary flex-1"
                >
                  {resetLoading ? 'Menyimpan…' : 'Reset password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff, FileDown, KeyRound, Search, X } from 'lucide-react'
import api from '../../services/api'
import AdminLayout from '../../components/AdminLayout'

export default function AdminMasyarakat() {
  const [list, setList]                       = useState([])
  const [search, setSearch]                   = useState('')
  const [selected, setSelected]               = useState(null)
  const [resetModal, setResetModal]           = useState(null)
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]               = useState(false)
  const [resetLoading, setResetLoading]       = useState(false)
  const [resetMsg, setResetMsg]               = useState(null)

  useEffect(() => {
    api.get('/masyarakat').then(r => setList(r.data.data || []))
  }, [])

  const filtered = list.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.nik?.includes(search) ||
    m.username?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.telp?.includes(search)
  )

  const openReset = (m) => {
    setResetModal(m)
    setNewPassword('')
    setConfirmPassword('')
    setShowPass(false)
    setResetMsg(null)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setResetMsg(null)
    if (newPassword.length < 6) { setResetMsg({ type: 'error', text: 'Password minimal 6 karakter' }); return }
    if (newPassword !== confirmPassword) { setResetMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' }); return }

    setResetLoading(true)
    try {
      const res = await api.put(`/reset-password/masyarakat/${resetModal.nik}`, { new_password: newPassword })
      setResetMsg({ type: 'success', text: res.data.message })
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setResetMsg({ type: 'error', text: err.response?.data?.error || 'Gagal mereset password' })
    } finally {
      setResetLoading(false)
    }
  }

  const exportPDF = () => {
    const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const rows = filtered.map((m, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="font-family:monospace;font-size:9px">${m.nik}</td>
        <td>${m.name}</td>
        <td>${m.email}</td>
        <td>${m.telp}</td>
        <td>${m.jenis_kelamin}</td>
        <td>${m.alamat ? `${m.alamat}, RT ${m.rt}/RW ${m.rw}` : '-'}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>Data Masyarakat</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}
      .header{text-align:center;margin-bottom:20px;border-bottom:2px solid #0f766e;padding-bottom:12px}
      .header h2{margin:0;color:#0f766e;font-size:15px}
      .header p{margin:2px 0;font-size:11px;color:#555}
      .meta{display:flex;justify-content:space-between;margin-bottom:12px;font-size:10px;color:#555}
      table{width:100%;border-collapse:collapse}
      th{background:#0f766e;color:#fff;padding:7px 6px;text-align:left;font-size:10px}
      td{padding:6px;border-bottom:1px solid #ddd;vertical-align:top;font-size:10px}
      @media print{body{margin:0}}
    </style></head><body>
    <div class="header">
      <h2>DATA MASYARAKAT TERDAFTAR</h2>
      <p>Kelurahan Serua Indah, Kecamatan Ciputat, Kota Tangerang Selatan</p>
      <p>Sistem Informasi Pusat Layanan dan Aspirasi Masyarakat (SIPLA)</p>
    </div>
    <div class="meta"><span>Tanggal cetak: ${tgl}</span><span>Total: ${filtered.length} warga terdaftar</span></div>
    <table>
      <thead><tr><th>No</th><th>NIK</th><th>Nama</th><th>Email</th><th>No. HP</th><th>Jenis kelamin</th><th>Alamat</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 500)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Data masyarakat</h1>
            <p className="text-sm text-muted mt-1 font-mono num">
              {filtered.length} dari {list.length} warga terdaftar
            </p>
          </div>
          <button type="button" onClick={exportPDF} className="btn">
            <FileDown size={15} strokeWidth={1.75} aria-hidden="true" />
            <span>Ekspor PDF</span>
          </button>
        </div>

        {/* Pencarian */}
        <div className="panel p-4">
          <div className="relative max-w-lg">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Cari data masyarakat"
              placeholder="Cari nama, NIK, username, email, atau nomor HP"
              className="field-input pl-10 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Tabel */}
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>NIK</th>
                  <th>Nama</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>No. HP</th>
                  <th>Jenis kelamin</th>
                  <th>Alamat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-muted">
                      {search ? `Tidak ada hasil untuk "${search}".` : 'Belum ada data masyarakat.'}
                    </td>
                  </tr>
                ) : filtered.map((m, i) => (
                  <tr key={m.nik}>
                    <td className="font-mono text-xs text-muted num">{i + 1}</td>
                    <td className="font-mono text-xs text-ink whitespace-nowrap num">{m.nik}</td>
                    <td className="font-semibold text-ink whitespace-nowrap">{m.name}</td>
                    <td className="text-ink-2">{m.username}</td>
                    <td className="text-ink-2">{m.email}</td>
                    <td className="font-mono text-xs whitespace-nowrap">{m.telp}</td>
                    <td><span className="tag tag-out">{m.jenis_kelamin}</span></td>
                    <td className="max-w-xs">
                      {m.alamat ? (
                        <div>
                          <p className="truncate max-w-[180px] text-ink-2">{m.alamat}</p>
                          <p className="text-xs text-muted font-mono">
                            RT {m.rt}/RW {m.rw}{m.kode_pos ? ` (${m.kode_pos})` : ''}
                          </p>
                        </div>
                      ) : <span className="text-muted">-</span>}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => setSelected(m)} className="btn btn-sm">Detail</button>
                        <button type="button" onClick={() => openReset(m)} className="btn btn-sm">
                          <KeyRound size={13} aria-hidden="true" />
                          <span>Reset PW</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {selected && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="detail-masy-title">
          <div className="modal-panel max-w-lg">
            <div className="px-6 py-4 border-b border-rule-2 flex items-center justify-between">
              <h2 id="detail-masy-title" className="text-base font-bold text-ink">Detail masyarakat</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-rule-2">
                <div>
                  <p className="font-display font-bold text-lg text-ink">{selected.name}</p>
                  <p className="text-xs text-muted font-mono">{selected.username}</p>
                </div>
                <span className="tag tag-out">{selected.jenis_kelamin}</span>
              </div>

              <dl className="divide-y divide-rule-2">
                {[
                  ['NIK', selected.nik, true],
                  ['Email', selected.email, false],
                  ['No. telepon', selected.telp, true],
                  ['Alamat', selected.alamat ? `${selected.alamat}, RT ${selected.rt}/RW ${selected.rw}` : '-', false],
                  ['Kode pos', selected.kode_pos || '-', true],
                ].map(([l, v, mono]) => (
                  <div key={l} className="py-2.5 grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3">
                    <dt className="text-muted text-xs">{l}</dt>
                    <dd className={`text-ink font-medium break-all ${mono ? 'font-mono text-xs' : ''}`}>{v}</dd>
                  </div>
                ))}
              </dl>

              {selected.created_at && (
                <p className="text-xs text-muted">
                  Terdaftar sejak {new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}

              <button
                type="button"
                onClick={() => { setSelected(null); openReset(selected) }}
                className="btn w-full"
              >
                <KeyRound size={14} aria-hidden="true" />
                <span>Reset password akun ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetModal && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="reset-masy-title">
          <div className="modal-panel max-w-md">
            <div className="px-6 py-4 border-b border-rule-2 flex items-start justify-between gap-4">
              <div>
                <h2 id="reset-masy-title" className="text-base font-bold text-ink">Reset password</h2>
                <p className="text-xs text-muted mt-0.5">
                  {resetModal.name} (<span className="font-mono">{resetModal.username}</span>)
                </p>
              </div>
              <button type="button" onClick={() => setResetModal(null)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleReset} className="p-6 space-y-4">
              <div className="notice notice-warn">
                <span>Password baru akan langsung aktif. Pastikan warga mengetahui kata sandi barunya.</span>
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
                <label htmlFor="masy-new-pw" className="field-label">Password baru</label>
                <div className="relative">
                  <input
                    id="masy-new-pw"
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
                <label htmlFor="masy-conf-pw" className="field-label">Konfirmasi password baru</label>
                <input
                  id="masy-conf-pw"
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="field-input"
                  required
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

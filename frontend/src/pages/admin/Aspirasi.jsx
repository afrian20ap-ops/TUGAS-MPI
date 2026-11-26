import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileDown, MapPin, Paperclip, Trash2, X } from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../context/AuthContext'

const FILTER_ASPIRASI = [
  { val: 'verifikasi_lapangan', label: 'Verifikasi lapangan',         cls: 'tag-out',   step: 1 },
  { val: 'koordinasi',          label: 'Koordinasi perangkat daerah', cls: 'tag-warn',  step: 2 },
  { val: 'proses_penyelesaian', label: 'Proses penyelesaian',         cls: 'tag-on',    step: 3 },
  { val: 'selesai',             label: 'Selesai',                     cls: 'tag-in',    step: 4 },
  { val: 'ditolak',             label: 'Ditolak',                     cls: 'tag-error', step: 5 },
]

const STATUS_ASPIRASI = {
  verifikasi_lapangan: { label: 'Verifikasi lapangan',         cls: 'tag-out',   step: 1 },
  koordinasi:          { label: 'Koordinasi perangkat daerah', cls: 'tag-warn',  step: 2 },
  proses_penyelesaian: { label: 'Proses penyelesaian',         cls: 'tag-on',    step: 3 },
  selesai:             { label: 'Selesai',                     cls: 'tag-in',    step: 4 },
  ditolak:             { label: 'Ditolak',                     cls: 'tag-error', step: 5 },
  '0':                 { label: 'Verifikasi lapangan',         cls: 'tag-out',   step: 1 },
  menunggu:            { label: 'Verifikasi lapangan',         cls: 'tag-out',   step: 1 },
  proses:              { label: 'Proses penyelesaian',         cls: 'tag-on',    step: 3 },
  diproses:            { label: 'Proses penyelesaian',         cls: 'tag-on',    step: 3 },
}

const statusBadge = (s) => {
  const st = STATUS_ASPIRASI[s] || { label: s || 'Verifikasi lapangan', cls: 'tag-out' }
  return <span className={`tag ${st.cls}`}>{st.label}</span>
}
const statusLabel = (s) => STATUS_ASPIRASI[s]?.label || s || 'Verifikasi lapangan'

const StatusProgress = ({ status }) => {
  const steps = [
    { key: 'verifikasi_lapangan', label: 'Verifikasi' },
    { key: 'koordinasi',          label: 'Koordinasi' },
    { key: 'proses_penyelesaian', label: 'Penyelesaian' },
    { key: 'selesai',             label: 'Selesai' },
  ]
  const currentStep = STATUS_ASPIRASI[status]?.step || 1
  if (status === 'ditolak') {
    return <div className="notice notice-error text-xs font-semibold">Aspirasi ini berstatus ditolak.</div>
  }
  return (
    <ol className="grid grid-cols-4 gap-3 list-none p-0">
      {steps.map((s, i) => {
        const done = currentStep > i + 1
        const active = currentStep === i + 1
        return (
          <li
            key={s.key}
            className={`pt-2 border-t-2 ${done ? 'border-accent' : active ? 'border-ink' : 'border-rule'}`}
          >
            <span className={`text-xs font-semibold ${done || active ? 'text-ink' : 'text-muted'}`}>
              {i + 1}. {s.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function AdminAspirasi() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [list, setList]                 = useState([])
  const [selected, setSelected]         = useState(null)
  const [tanggapan, setTanggapan]       = useState('')
  const [newStatus, setNewStatus]       = useState('')
  const [fileBukti, setFileBukti]       = useState([null, null, null])
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '')
  const [filterDari, setFilterDari]     = useState('')
  const [filterSampai, setFilterSampai] = useState('')
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    const paramStatus = searchParams.get('status') || ''
    if (paramStatus !== filterStatus) setFilterStatus(paramStatus)
  }, [searchParams])

  const fetchData = () => {
    const params = new URLSearchParams()
    if (filterStatus && filterStatus !== 'aktif') params.append('status', filterStatus)
    if (filterDari)   params.append('dari', filterDari)
    if (filterSampai) params.append('sampai', filterSampai)
    const q = params.toString() ? `?${params.toString()}` : ''
    api.get(`/aspirasi${q}`).then(r => setList(r.data.data || []))
  }

  useEffect(() => { fetchData() }, [filterStatus, filterDari, filterSampai])

  const filtered = list.filter(p => {
    if (filterStatus === 'aktif' && (p.status === 'selesai' || p.status === 'ditolak')) return false
    const tgl = new Date(p.tgl_pengaduan)
    if (filterDari && tgl < new Date(filterDari)) return false
    if (filterSampai && tgl > new Date(filterSampai + 'T23:59:59')) return false
    return true
  })

  const handleStatusChange = (val) => {
    setFilterStatus(val)
    if (val) setSearchParams({ status: val })
    else setSearchParams({})
  }

  const resetFilter = () => {
    setFilterStatus('')
    setFilterDari('')
    setFilterSampai('')
    setSearchParams({})
  }

  const openDetail = async (p) => {
    const res = await api.get(`/aspirasi/${p.id_pengaduan}`)
    setSelected(res.data.data)
    setNewStatus(res.data.data.status)
    setTanggapan('')
    setFileBukti([null, null, null])
  }

  const handleSetBukti = (idx, file) => {
    setFileBukti(prev => { const n = [...prev]; n[idx] = file; return n })
  }

  const handleTanggapan = async () => {
    if (!tanggapan.trim()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('id_pengaduan', selected.id_pengaduan)
      fd.append('tanggapan', tanggapan)
      fd.append('status', newStatus)
      fileBukti.forEach((f, i) => { if (f) fd.append(`file_bukti_${i + 1}`, f) })
      await api.post('/tanggapan', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      fetchData()
      setSelected(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal kirim tanggapan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Hapus aspirasi "${p.judul_laporan}"? Tindakan ini tidak dapat dibatalkan.`)) return
    try {
      if (user?.roles === 'admin') {
        await api.delete(`/admin/aspirasi/${p.id_pengaduan}`)
      } else {
        await api.delete(`/aspirasi/${p.id_pengaduan}`)
      }
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus aspirasi')
    }
  }

  const exportPDF = () => {
    const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const filterInfo = [
      filterStatus ? `Status: ${statusLabel(filterStatus)}` : '',
      filterDari ? `Dari: ${new Date(filterDari).toLocaleDateString('id-ID')}` : '',
      filterSampai ? `Sampai: ${new Date(filterSampai).toLocaleDateString('id-ID')}` : '',
    ].filter(Boolean).join(', ')

    const rows = filtered.map((p, i) => {
      const lastTanggapan = p.tanggapan?.length > 0 ? p.tanggapan[p.tanggapan.length - 1] : null
      return `<tr>
        <td>${i + 1}</td>
        <td>${p.tipe_aspirasi || '-'}</td>
        <td><strong>${p.judul_laporan}</strong><br/><small>${p.isi_laporan?.slice(0, 60)}...</small></td>
        <td>${p.masyarakat?.name || p.nik}</td>
        <td>${new Date(p.tgl_pengaduan).toLocaleDateString('id-ID')}</td>
        <td>${statusLabel(p.status)}</td>
        <td>${lastTanggapan ? `<em>${lastTanggapan.tanggapan?.slice(0, 80)}...</em><br/><small>${new Date(lastTanggapan.tgl_tanggapan).toLocaleDateString('id-ID')}</small>` : '-'}</td>
      </tr>`
    }).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>Laporan Aspirasi</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:10px;margin:20px;color:#111}
      .header{text-align:center;margin-bottom:16px;border-bottom:2px solid #0f766e;padding-bottom:10px}
      .header h2{margin:0;color:#0f766e;font-size:14px}
      .header p{margin:2px 0;color:#555;font-size:10px}
      .meta{display:flex;justify-content:space-between;margin-bottom:10px;font-size:10px;color:#555}
      table{width:100%;border-collapse:collapse;table-layout:fixed}
      th{background:#0f766e;color:#fff;padding:6px;text-align:left;font-size:9px}
      td{padding:5px 6px;border-bottom:1px solid #ddd;vertical-align:top;font-size:9px;overflow-wrap:break-word}
      @media print{body{margin:0}}
    </style></head><body>
    <div class="header">
      <h2>LAPORAN ASPIRASI MASYARAKAT</h2>
      <p>Kelurahan Serua Indah, Kecamatan Ciputat, Kota Tangerang Selatan</p>
      <p>Sistem Informasi Pusat Layanan dan Aspirasi Masyarakat (SIPLA)</p>
    </div>
    ${filterInfo ? `<p>Filter: ${filterInfo}</p>` : ''}
    <div class="meta"><span>Tanggal cetak: ${tgl}</span><span>Total data: ${filtered.length} aspirasi</span></div>
    <table>
      <thead><tr><th>No</th><th>Kategori</th><th>Judul aspirasi</th><th>Pelapor</th><th>Tanggal</th><th>Status</th><th>Tanggapan terakhir</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 600)
  }

  const lastTanggapan = (p) => (p.tanggapan?.length ? p.tanggapan[p.tanggapan.length - 1] : null)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Aspirasi masyarakat</h1>
            <p className="text-sm text-muted mt-1 font-mono num">{filtered.length} data ditampilkan</p>
          </div>
          <button type="button" onClick={exportPDF} className="btn">
            <FileDown size={15} strokeWidth={1.75} aria-hidden="true" />
            <span>Ekspor PDF</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="panel p-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="f-asp-status" className="field-label text-xs">Status</label>
            <select
              id="f-asp-status"
              value={filterStatus}
              onChange={e => handleStatusChange(e.target.value)}
              className="field-input min-h-[38px] text-sm w-auto"
            >
              <option value="">Semua status</option>
              <option value="aktif">Aktif diproses</option>
              {FILTER_ASPIRASI.map(s => (
                <option key={s.val} value={s.val}>{s.step}. {s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-asp-dari" className="field-label text-xs">Dari tanggal</label>
            <input
              id="f-asp-dari"
              type="date"
              value={filterDari}
              onChange={e => setFilterDari(e.target.value)}
              className="field-input min-h-[38px] text-sm w-auto"
            />
          </div>
          <div>
            <label htmlFor="f-asp-sampai" className="field-label text-xs">Sampai tanggal</label>
            <input
              id="f-asp-sampai"
              type="date"
              value={filterSampai}
              onChange={e => setFilterSampai(e.target.value)}
              className="field-input min-h-[38px] text-sm w-auto"
            />
          </div>
          {(filterStatus || filterDari || filterSampai) && (
            <button type="button" onClick={resetFilter} className="btn btn-sm h-[38px]">
              <X size={14} aria-hidden="true" />
              <span>Reset filter</span>
            </button>
          )}
        </div>

        {/* Tabel */}
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kategori</th>
                  <th>Judul aspirasi</th>
                  <th>Pelapor</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Tanggapan terakhir</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-muted">
                      Tidak ada data aspirasi yang sesuai.
                    </td>
                  </tr>
                ) : filtered.map((p, i) => {
                  const last = lastTanggapan(p)
                  return (
                    <tr key={p.id_pengaduan}>
                      <td className="font-mono text-xs text-muted num">{i + 1}</td>
                      <td>
                        {p.tipe_aspirasi
                          ? <span className="tag">{p.tipe_aspirasi}</span>
                          : <span className="text-muted">-</span>}
                      </td>
                      <td>
                        <p className="font-semibold text-ink max-w-[200px] truncate">{p.judul_laporan}</p>
                        <p className="text-xs text-muted truncate max-w-[200px] mt-0.5">{p.isi_laporan}</p>
                      </td>
                      <td className="text-xs whitespace-nowrap">{p.masyarakat?.name || p.nik}</td>
                      <td className="font-mono text-xs text-muted whitespace-nowrap num">
                        {new Date(p.tgl_pengaduan).toLocaleDateString('id-ID')}
                      </td>
                      <td>{statusBadge(p.status)}</td>
                      <td className="max-w-[200px]">
                        {last ? (
                          <div>
                            <p className="text-xs text-ink-2 line-clamp-2">{last.tanggapan}</p>
                            <p className="text-xs text-muted font-mono mt-0.5">
                              {new Date(last.tgl_tanggapan).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        ) : <span className="text-xs text-muted">Belum ada</span>}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => openDetail(p)} className="btn btn-sm">
                            Detail
                          </button>
                          {(user?.roles === 'admin' || p.status === 'verifikasi_lapangan' || p.status === '0') && (
                            <button type="button" onClick={() => handleDelete(p)} className="btn btn-danger btn-sm" aria-label="Hapus aspirasi">
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

      {/* Modal Detail */}
      {selected && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="adm-asp-title">
          <div className="modal-panel max-w-2xl">
            <div className="px-6 py-4 border-b border-rule-2 flex items-center justify-between sticky top-0 bg-surface z-10">
              <h2 id="adm-asp-title" className="text-base font-bold text-ink">Detail aspirasi</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <StatusProgress status={selected.status} />

              <dl className="grid grid-cols-2 gap-3">
                {[
                  ['Pelapor', selected.masyarakat?.name || selected.nik, false],
                  ['NIK', selected.nik, true],
                  ['Tanggal pengaduan', new Date(selected.tgl_pengaduan).toLocaleString('id-ID'), true],
                  ['Tanggal kejadian', new Date(selected.tgl_kejadian).toLocaleDateString('id-ID'), true],
                ].map(([l, v, mono]) => (
                  <div key={l} className="well p-3">
                    <dt className="text-xs text-muted">{l}</dt>
                    <dd className={`font-semibold text-ink mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="space-y-2">
                {selected.tipe_aspirasi && <span className="tag">{selected.tipe_aspirasi}</span>}
                <h3 className="text-base font-bold text-ink">{selected.judul_laporan}</h3>
                <p className="text-ink-2">{selected.isi_laporan}</p>
                <p className="text-xs text-muted flex items-center gap-1.5">
                  <MapPin size={13} aria-hidden="true" className="text-accent" />
                  <span>{selected.lokasi_kejadian}</span>
                  {selected.latitude && (
                    <span className="font-mono ml-2">({selected.latitude}, {selected.longitude})</span>
                  )}
                </p>
              </div>

              {selected.foto && (
                <img
                  src={assetUrl(selected.foto)}
                  alt="Foto aspirasi"
                  className="civic-photo max-h-56 w-full object-cover"
                />
              )}

              {selected.tanggapan?.length > 0 && (
                <div className="pt-4 border-t border-rule-2">
                  <h3 className="text-xs font-semibold text-muted mb-2.5">Riwayat tanggapan</h3>
                  <div className="space-y-2.5">
                    {selected.tanggapan.map(t => (
                      <div key={t.id_tanggapan} className="well p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ink text-xs">{t.petugas?.nama_petugas}</span>
                          <time className="text-xs text-muted font-mono">
                            {new Date(t.tgl_tanggapan).toLocaleString('id-ID')}
                          </time>
                        </div>
                        <p className="text-ink-2">{t.tanggapan}</p>
                        <div className="flex flex-wrap gap-3 pt-1">
                          {[t.file_bukti, t.file_bukti_2, t.file_bukti_3].filter(Boolean).map((f, i) => (
                            <a key={i} href={assetUrl(f)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs civic-link">
                              <Paperclip size={12} aria-hidden="true" />
                              <span>Bukti {i + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-5 border-t border-rule space-y-3.5">
                <h3 className="text-sm font-bold text-ink">Kirim tanggapan dan perbarui status</h3>
                <div>
                  <label htmlFor="adm-asp-status" className="field-label text-xs">Status proses</label>
                  <select
                    id="adm-asp-status"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="field-input text-sm"
                  >
                    {FILTER_ASPIRASI.map(s => (
                      <option key={s.val} value={s.val}>{s.step}. {s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="adm-asp-text" className="field-label text-xs">Isi tanggapan</label>
                  <textarea
                    id="adm-asp-text"
                    value={tanggapan}
                    onChange={e => setTanggapan(e.target.value)}
                    placeholder="Tulis tanggapan tindak lanjut untuk warga…"
                    rows={3}
                    className="field-input text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Unggah bukti penanganan (PDF, JPG, PNG, maks. 3 file)</span>
                    {fileBukti.filter(Boolean).length > 0 && (
                      <span className="font-mono text-ink">{fileBukti.filter(Boolean).length}/3 dipilih</span>
                    )}
                  </div>
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-muted w-14 shrink-0">Bukti {idx + 1}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleSetBukti(idx, e.target.files[0] || null)}
                        className="field-input text-xs py-1.5"
                      />
                      {fileBukti[idx] && (
                        <button type="button" onClick={() => handleSetBukti(idx, null)} aria-label="Hapus file bukti" className="btn btn-ghost btn-sm px-2">
                          <X size={14} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleTanggapan}
                  disabled={loading || !tanggapan.trim()}
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? 'Mengirim…' : 'Kirim tanggapan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

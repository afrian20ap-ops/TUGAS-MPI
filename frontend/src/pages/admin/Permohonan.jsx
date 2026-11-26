import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, FileDown, Paperclip, X } from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../context/AuthContext'

const FILTER_PERMOHONAN = [
  { val: 'verifikasi_persyaratan', label: 'Verifikasi persyaratan', cls: 'tag-out',   step: 1 },
  { val: 'pembuatan_draft',        label: 'Pembuatan draft surat',  cls: 'tag-warn',  step: 2 },
  { val: 'penandatanganan',        label: 'Proses penandatanganan', cls: 'tag-warn',  step: 3 },
  { val: 'register_dokumen',       label: 'Register dokumen',       cls: 'tag-on',    step: 4 },
  { val: 'selesai',                label: 'Selesai',                cls: 'tag-in',    step: 5 },
  { val: 'ditolak',                label: 'Ditolak',                cls: 'tag-error', step: 6 },
]

const STATUS_PERMOHONAN = {
  verifikasi_persyaratan: { label: 'Verifikasi persyaratan', cls: 'tag-out',   step: 1 },
  pembuatan_draft:        { label: 'Pembuatan draft surat',  cls: 'tag-warn',  step: 2 },
  penandatanganan:        { label: 'Proses penandatanganan', cls: 'tag-warn',  step: 3 },
  register_dokumen:       { label: 'Register dokumen',       cls: 'tag-on',    step: 4 },
  selesai:                { label: 'Selesai',                cls: 'tag-in',    step: 5 },
  ditolak:                { label: 'Ditolak',                cls: 'tag-error', step: 6 },
  menunggu:               { label: 'Verifikasi persyaratan', cls: 'tag-out',   step: 1 },
  diproses:               { label: 'Pembuatan draft surat',  cls: 'tag-warn',  step: 2 },
  proses:                 { label: 'Pembuatan draft surat',  cls: 'tag-warn',  step: 2 },
}

const badge = (s) => {
  const st = STATUS_PERMOHONAN[s] || { label: s || 'Verifikasi persyaratan', cls: 'tag-out' }
  return <span className={`tag ${st.cls}`}>{st.label}</span>
}
const statusLabel = (s) => STATUS_PERMOHONAN[s]?.label || s || 'Verifikasi persyaratan'

const StatusProgress = ({ status }) => {
  const steps = [
    { key: 'verifikasi_persyaratan', label: 'Verifikasi' },
    { key: 'pembuatan_draft',        label: 'Draft' },
    { key: 'penandatanganan',        label: 'Tanda tangan' },
    { key: 'register_dokumen',       label: 'Register' },
    { key: 'selesai',                label: 'Selesai' },
  ]
  const currentStep = STATUS_PERMOHONAN[status]?.step || 1
  if (status === 'ditolak') {
    return <div className="notice notice-error text-xs font-semibold">Permohonan ini ditolak.</div>
  }
  return (
    <ol className="grid grid-cols-5 gap-2 list-none p-0">
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

export default function AdminPermohonan() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [list, setList]                 = useState([])
  const [selected, setSelected]         = useState(null)
  const [form, setForm]                 = useState({ status: '', catatan_petugas: '', file_hasil: null })
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
    const q = params.toString() ? `?${params.toString()}` : ''
    api.get(`/permohonan${q}`).then(r => setList(r.data.data || []))
  }
  useEffect(() => { fetchData() }, [filterStatus])

  const filtered = list.filter(p => {
    if (filterStatus === 'aktif' && (p.status === 'selesai' || p.status === 'ditolak')) return false
    const tgl = new Date(p.tgl_permohonan)
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
    const res = await api.get(`/permohonan/${p.id}`)
    setSelected(res.data.data)
    setForm({ status: res.data.data.status, catatan_petugas: '', file_hasil: null })
  }

  const handleProses = async () => {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('status', form.status)
      fd.append('catatan_petugas', form.catatan_petugas)
      if (form.file_hasil) fd.append('file_hasil', form.file_hasil)
      await api.put(`/permohonan/${selected.id}/proses`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      fetchData()
      setSelected(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal memproses')
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = () => {
    const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const filterInfo = [
      filterStatus ? `Status: ${statusLabel(filterStatus)}` : '',
      filterDari ? `Dari: ${new Date(filterDari).toLocaleDateString('id-ID')}` : '',
      filterSampai ? `Sampai: ${new Date(filterSampai).toLocaleDateString('id-ID')}` : '',
    ].filter(Boolean).join(', ')

    const rows = filtered.map((p, i) => `<tr>
      <td>${i + 1}</td>
      <td>${p.jenis_layanan?.nama_layanan || '-'}</td>
      <td>${p.masyarakat?.name || p.nik}<br/><small>${p.nik}</small></td>
      <td>${new Date(p.tgl_permohonan).toLocaleDateString('id-ID')}</td>
      <td>${statusLabel(p.status)}</td>
      <td>${p.catatan_petugas || '-'}</td>
      <td>${p.tgl_selesai ? new Date(p.tgl_selesai).toLocaleDateString('id-ID') : '-'}</td>
    </tr>`).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>Laporan Permohonan</title>
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
      <h2>LAPORAN PERMOHONAN LAYANAN</h2>
      <p>Kelurahan Serua Indah, Kecamatan Ciputat, Kota Tangerang Selatan</p>
      <p>Sistem Informasi Pusat Layanan dan Aspirasi Masyarakat (SIPLA)</p>
    </div>
    ${filterInfo ? `<p>Filter: ${filterInfo}</p>` : ''}
    <div class="meta"><span>Tanggal cetak: ${tgl}</span><span>Total data: ${filtered.length} permohonan</span></div>
    <table>
      <thead><tr><th>No</th><th>Jenis layanan</th><th>Pemohon</th><th>Tanggal</th><th>Status</th><th>Catatan petugas</th><th>Selesai</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 600)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Permohonan layanan</h1>
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
            <label htmlFor="f-perm-status" className="field-label text-xs">Status</label>
            <select
              id="f-perm-status"
              value={filterStatus}
              onChange={e => handleStatusChange(e.target.value)}
              className="field-input min-h-[38px] text-sm w-auto"
            >
              <option value="">Semua status</option>
              <option value="aktif">Aktif diproses</option>
              {FILTER_PERMOHONAN.map(s => (
                <option key={s.val} value={s.val}>{s.step}. {s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-perm-dari" className="field-label text-xs">Dari tanggal</label>
            <input
              id="f-perm-dari"
              type="date"
              value={filterDari}
              onChange={e => setFilterDari(e.target.value)}
              className="field-input min-h-[38px] text-sm w-auto"
            />
          </div>
          <div>
            <label htmlFor="f-perm-sampai" className="field-label text-xs">Sampai tanggal</label>
            <input
              id="f-perm-sampai"
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
                  <th>Jenis layanan</th>
                  <th>Pemohon</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Catatan terakhir</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted">
                      Tidak ada permohonan yang sesuai.
                    </td>
                  </tr>
                ) : filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs text-muted num">{i + 1}</td>
                    <td>
                      <p className="font-semibold text-ink whitespace-nowrap">{p.jenis_layanan?.nama_layanan}</p>
                      <p className="text-xs text-muted">Estimasi {p.jenis_layanan?.estimasi_hari} hari</p>
                    </td>
                    <td className="text-xs">
                      <p className="font-semibold text-ink whitespace-nowrap">{p.masyarakat?.name}</p>
                      <p className="font-mono text-muted">{p.nik}</p>
                    </td>
                    <td className="font-mono text-xs text-muted whitespace-nowrap num">
                      {new Date(p.tgl_permohonan).toLocaleDateString('id-ID')}
                    </td>
                    <td>{badge(p.status)}</td>
                    <td className="max-w-[200px]">
                      {p.catatan_petugas ? (
                        <div>
                          <p className="text-xs text-ink-2 line-clamp-2">{p.catatan_petugas}</p>
                          {p.tgl_selesai && (
                            <p className="text-xs text-muted font-mono mt-0.5">
                              {new Date(p.tgl_selesai).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-xs text-muted">Belum ada</span>}
                    </td>
                    <td>
                      <button type="button" onClick={() => openDetail(p)} className="btn btn-sm">
                        Proses
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Proses */}
      {selected && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="adm-perm-title">
          <div className="modal-panel max-w-2xl">
            <div className="px-6 py-4 border-b border-rule-2 flex items-center justify-between sticky top-0 bg-surface z-10">
              <div>
                <h2 id="adm-perm-title" className="text-base font-bold text-ink">{selected.jenis_layanan?.nama_layanan}</h2>
                <p className="text-xs text-muted">Estimasi {selected.jenis_layanan?.estimasi_hari} hari kerja</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <StatusProgress status={selected.status} />

              <dl className="grid grid-cols-2 gap-3">
                {[
                  ['Pemohon', selected.masyarakat?.name, false],
                  ['NIK', selected.nik, true],
                  ['Tanggal permohonan', new Date(selected.tgl_permohonan).toLocaleDateString('id-ID'), true],
                  ['Status saat ini', statusLabel(selected.status), false],
                ].map(([l, v, mono]) => (
                  <div key={l} className="well p-3">
                    <dt className="text-xs text-muted">{l}</dt>
                    <dd className={`font-semibold text-ink mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>{v}</dd>
                  </div>
                ))}
              </dl>

              {selected.keterangan && (
                <div>
                  <p className="text-xs font-semibold text-muted mb-1">Keterangan pemohon</p>
                  <p className="well p-3 text-ink-2">{selected.keterangan}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted mb-2">Dokumen pemohon</p>
                <div className="divide-y divide-rule-2">
                  {[
                    ['KTP', selected.file_ktp],
                    ['Kartu Keluarga', selected.file_kk],
                    ['Surat RT/RW', selected.file_surat_rtrw],
                    ['Foto rumah', selected.file_foto_rumah],
                    ['File pendukung', selected.file_pendukung],
                  ].map(([label, file]) => file && (
                    <div key={label} className="py-2.5 flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-1.5 text-ink-2">
                        <Paperclip size={13} aria-hidden="true" className="text-muted" />
                        {label}
                      </span>
                      <a href={assetUrl(file)} target="_blank" rel="noreferrer" className="text-xs civic-link">
                        Lihat dokumen
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {selected.file_hasil && (
                <div className="notice notice-in flex items-center justify-between">
                  <span className="text-xs font-semibold">File hasil sebelumnya</span>
                  <a href={assetUrl(selected.file_hasil)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs civic-link">
                    <Download size={13} aria-hidden="true" />
                    <span>Lihat hasil</span>
                  </a>
                </div>
              )}

              <div className="pt-5 border-t border-rule space-y-3.5">
                <h3 className="text-sm font-bold text-ink">Perbarui status permohonan</h3>
                <div>
                  <label htmlFor="adm-perm-status" className="field-label text-xs">Status proses</label>
                  <select
                    id="adm-perm-status"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="field-input text-sm"
                  >
                    {FILTER_PERMOHONAN.map(s => (
                      <option key={s.val} value={s.val}>{s.step}. {s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="adm-perm-cat" className="field-label text-xs">Catatan untuk pemohon</label>
                  <textarea
                    id="adm-perm-cat"
                    value={form.catatan_petugas}
                    onChange={e => setForm({ ...form, catatan_petugas: e.target.value })}
                    placeholder="Tulis catatan verifikasi atau pengambilan surat…"
                    rows={3}
                    className="field-input text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="adm-perm-hasil" className="field-label text-xs">Unggah hasil atau bukti (PDF, JPG, PNG)</label>
                  <input
                    id="adm-perm-hasil"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setForm({ ...form, file_hasil: e.target.files[0] })}
                    className="field-input text-xs py-2"
                  />
                </div>
                <button type="button" onClick={handleProses} disabled={loading} className="btn btn-primary btn-lg w-full">
                  {loading ? 'Menyimpan…' : 'Simpan dan perbarui status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

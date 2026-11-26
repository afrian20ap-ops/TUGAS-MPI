import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronRight, Download, Paperclip, Plus, X } from 'lucide-react'
import api from '../../services/api'
import UserLayout from '../../components/UserLayout'
import { Reveal3D, Tilt3D } from '../../components/Motion3D'

const STATUS = {
  verifikasi_persyaratan: { label: 'Verifikasi persyaratan', cls: 'tag-out' },
  pembuatan_draft:        { label: 'Pembuatan draft surat',  cls: 'tag-warn' },
  penandatanganan:        { label: 'Proses penandatanganan', cls: 'tag-warn' },
  register_dokumen:       { label: 'Register dokumen',       cls: 'tag-on' },
  selesai:                { label: 'Selesai',                cls: 'tag-in' },
  ditolak:                { label: 'Ditolak',                cls: 'tag-error' },
  menunggu:               { label: 'Verifikasi persyaratan', cls: 'tag-out' },
  diproses:               { label: 'Pembuatan draft surat',  cls: 'tag-warn' },
}

const badge = (s) => {
  const st = STATUS[s] || STATUS.verifikasi_persyaratan
  return <span className={`tag ${st.cls}`}>{st.label}</span>
}

const getFileFields = (namaLayanan) => {
  const isSKTM = namaLayanan?.toLowerCase().includes('tidak mampu')
  const fields = [
    { key: 'file_ktp',        label: 'Foto atau scan KTP',            required: true  },
    { key: 'file_kk',         label: 'Foto atau scan Kartu Keluarga', required: true  },
    { key: 'file_surat_rtrw', label: 'Surat pengantar RT/RW',         required: true  },
  ]
  if (isSKTM) {
    fields.push({ key: 'file_foto_rumah', label: 'Foto rumah tampak depan', required: true })
  }
  fields.push({ key: 'file_pendukung', label: 'File pendukung', required: false })
  return fields
}

const EMPTY_FORM = {
  id_jenis_layanan: '', keterangan: '',
  file_ktp: null, file_kk: null,
  file_surat_rtrw: null, file_foto_rumah: null, file_pendukung: null,
}

export default function UserPermohonan() {
  const [list, setList]                   = useState([])
  const [jenisLayanan, setJenisLayanan]   = useState([])
  const [showForm, setShowForm]           = useState(false)
  const [formStep, setFormStep]           = useState('pilih')
  const [selected, setSelected]           = useState(null)
  const [selectedJenis, setSelectedJenis] = useState(null)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [loading, setLoading]             = useState(false)
  const [filterTab, setFilterTab]         = useState('semua')

  const fetchData = () => api.get('/permohonan').then(r => setList(r.data.data || []))

  useEffect(() => {
    fetchData()
    api.get('/jenis-layanan').then(r => setJenisLayanan(r.data.data || []))
  }, [])

  const handleOpenForm = () => {
    setForm(EMPTY_FORM)
    setSelectedJenis(null)
    setFormStep('pilih')
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setFormStep('pilih')
    setSelectedJenis(null)
    setForm(EMPTY_FORM)
  }

  const handlePilihJenis = (jenis) => {
    setSelectedJenis(jenis)
    setForm({ ...EMPTY_FORM, id_jenis_layanan: jenis.id })
    setFormStep('isi')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      await api.post('/permohonan', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      handleCloseForm()
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengirim permohonan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Batalkan permohonan ini?')) return
    await api.delete(`/permohonan/${id}`)
    fetchData()
  }

  const fileFields = getFileFields(selectedJenis?.nama_layanan)
  const totalPerm = list.length
  const selesaiPerm = list.filter(p => p.status === 'selesai').length
  const prosesPerm = list.filter(p => p.status !== 'selesai' && p.status !== 'ditolak').length
  const filteredList = list.filter(p => {
    if (filterTab === 'proses') return p.status !== 'selesai' && p.status !== 'ditolak'
    if (filterTab === 'selesai') return p.status === 'selesai'
    return true
  })

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Permohonan layanan</h1>
            <p className="text-sm text-muted mt-1">
              Ajukan surat keterangan dan pantau tahapan penerbitannya dari kelurahan.
            </p>
          </div>
          <button type="button" onClick={handleOpenForm} className="btn btn-primary">
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>Buat permohonan</span>
          </button>
        </div>

        {/* Ringkasan 3D Dashboard Permohonan Warga — Klik untuk menyaring daftar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stage-3d">
          {[
            { key: 'semua',   label: 'Total permohonan', val: totalPerm,   highlight: false },
            { key: 'proses',  label: 'Dalam proses',     val: prosesPerm,  highlight: false },
            { key: 'selesai', label: 'Dokumen selesai',  val: selesaiPerm, highlight: true  },
          ].map((item, idx) => (
            <Reveal3D key={item.key} delay={idx * 60}>
              <Tilt3D maxTilt={5} className="rounded-card">
                <button
                  type="button"
                  onClick={() => setFilterTab(item.key)}
                  data-selected={filterTab === item.key ? 'true' : 'false'}
                  className="card-link p-5"
                >
                  <span className="card-link-label block text-xs font-medium text-muted">{item.label}</span>
                  <span className={`card-link-val mt-2 block font-display font-bold text-3xl num tilt-3d-layer ${item.highlight ? 'text-accent-soft-ink' : 'text-ink'}`}>
                    {item.val}
                  </span>
                </button>
              </Tilt3D>
            </Reveal3D>
          ))}
        </div>

        {filteredList.length === 0 ? (
          <div className="panel p-10 text-center">
            <p className="font-semibold text-ink">
              {list.length === 0 ? 'Belum ada permohonan layanan' : 'Tidak ada permohonan pada kategori ini'}
            </p>
            <p className="text-sm text-muted mt-1">
              {list.length === 0
                ? 'Klik Buat permohonan untuk memilih jenis surat yang dibutuhkan.'
                : 'Pilih kartu Total permohonan untuk menampilkan seluruh pengajuan.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((p, idx) => (
              <Reveal3D key={p.id} delay={Math.min(idx * 50, 250)}>
                <article className="panel p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {badge(p.status)}
                    <time className="text-xs text-muted font-mono num">
                      {new Date(p.tgl_permohonan).toLocaleDateString('id-ID')}
                    </time>
                  </div>
                  <h2 className="text-base font-bold text-ink">{p.jenis_layanan?.nama_layanan}</h2>
                  {p.keterangan && <p className="text-sm text-ink-2 line-clamp-2">{p.keterangan}</p>}
                  {p.catatan_petugas && (
                    <div className="well px-3.5 py-2.5 text-xs">
                      <span className="font-semibold text-ink">Catatan petugas: </span>
                      <span className="text-ink-2">{p.catatan_petugas}</span>
                    </div>
                  )}
                  {p.file_hasil && (
                    <a
                      href={`http://localhost:8080/${p.file_hasil}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs civic-link"
                    >
                      <Download size={13} strokeWidth={1.75} aria-hidden="true" />
                      <span>Unduh hasil surat</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={() => setSelected(p)} className="btn btn-sm">
                    Detail
                  </button>
                  {p.status === 'verifikasi_persyaratan' && (
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </article>
              </Reveal3D>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form Buat Permohonan */}
      {showForm && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="form-perm-title">
          <div className="modal-panel max-w-xl">
            <div className="px-6 py-4 border-b border-rule-2 flex items-center justify-between gap-3 sticky top-0 bg-surface z-10">
              <div className="flex items-center gap-3 min-w-0">
                {formStep === 'isi' && (
                  <button type="button" onClick={() => setFormStep('pilih')} className="btn btn-sm px-2.5">
                    <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
                    <span>Ganti</span>
                  </button>
                )}
                <div className="min-w-0">
                  <h2 id="form-perm-title" className="text-base font-bold text-ink truncate">
                    {formStep === 'pilih' ? 'Pilih jenis layanan' : selectedJenis?.nama_layanan}
                  </h2>
                  {formStep === 'isi' && (
                    <p className="text-xs text-muted">
                      Estimasi {selectedJenis?.estimasi_hari} hari kerja
                    </p>
                  )}
                </div>
              </div>
              <button type="button" onClick={handleCloseForm} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            {formStep === 'pilih' && (
              <div className="p-6">
                <p className="text-sm text-muted mb-4">Pilih layanan administrasi yang ingin Anda ajukan.</p>
                <div className="divide-y divide-rule-2">
                  {jenisLayanan.map(j => (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => handlePilihJenis(j)}
                      className="w-full text-left py-3.5 px-3 rounded-control hover:bg-paper-2 flex items-center justify-between gap-4 transition-colors duration-150"
                    >
                      <div>
                        <p className="font-semibold text-sm text-ink">{j.nama_layanan}</p>
                        <p className="text-xs text-muted mt-0.5">Estimasi {j.estimasi_hari} hari kerja</p>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" className="text-muted shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formStep === 'isi' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {selectedJenis?.syarat && (
                  <div className="notice notice-warn">
                    <div>
                      <p className="font-semibold text-warn-soft-ink mb-1">Syarat yang diperlukan</p>
                      <p className="whitespace-pre-line">{selectedJenis.syarat}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="perm-ket" className="field-label">Keterangan tambahan</label>
                  <textarea
                    id="perm-ket"
                    value={form.keterangan}
                    onChange={e => setForm({ ...form, keterangan: e.target.value })}
                    placeholder="Tambahkan keterangan keperluan surat bila perlu…"
                    rows={2}
                    className="field-input"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold text-ink">Unggah dokumen persyaratan</p>
                    <span className="text-xs text-muted">
                      {fileFields.filter(f => f.required).length} wajib, 1 opsional
                    </span>
                  </div>
                  {fileFields.map(({ key, label, required }) => (
                    <div key={key}>
                      <label htmlFor={`perm-${key}`} className="field-label text-xs">
                        {label}{' '}
                        {required
                          ? <span className="text-error">*</span>
                          : <span className="font-normal text-muted">(opsional)</span>}
                      </label>
                      <input
                        id={`perm-${key}`}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={e => setForm({ ...form, [key]: e.target.files[0] })}
                        required={required}
                        className="field-input text-sm py-2"
                      />
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                  {loading ? 'Mengirim…' : 'Kirim permohonan'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {selected && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="detail-perm-title">
          <div className="modal-panel max-w-lg">
            <div className="px-6 py-4 border-b border-rule-2 flex items-center justify-between">
              <h2 id="detail-perm-title" className="text-base font-bold text-ink">Detail permohonan</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-rule-2">
                <h3 className="text-base font-bold text-ink">{selected.jenis_layanan?.nama_layanan}</h3>
                {badge(selected.status)}
              </div>

              <dl className="grid grid-cols-2 gap-4">
                <div className="well p-3">
                  <dt className="text-xs text-muted">Tanggal permohonan</dt>
                  <dd className="font-mono text-ink font-medium mt-0.5">
                    {new Date(selected.tgl_permohonan).toLocaleDateString('id-ID')}
                  </dd>
                </div>
                <div className="well p-3">
                  <dt className="text-xs text-muted">Estimasi proses</dt>
                  <dd className="text-ink font-medium mt-0.5">
                    {selected.jenis_layanan?.estimasi_hari} hari kerja
                  </dd>
                </div>
              </dl>

              {selected.catatan_petugas && (
                <div className="notice">
                  <div>
                    <p className="font-semibold text-ink text-xs mb-0.5">Catatan petugas</p>
                    <p>{selected.catatan_petugas}</p>
                  </div>
                </div>
              )}

              {selected.file_hasil && (
                <div className="notice notice-in flex items-center justify-between">
                  <span className="font-semibold text-xs">Dokumen hasil tersedia</span>
                  <a
                    href={`http://localhost:8080/${selected.file_hasil}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs civic-link"
                  >
                    <Download size={13} strokeWidth={1.75} aria-hidden="true" />
                    <span>Unduh surat</span>
                  </a>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-muted mb-2">Dokumen yang diunggah</h3>
                <div className="divide-y divide-rule-2">
                  {[
                    ['KTP', selected.file_ktp],
                    ['Kartu Keluarga', selected.file_kk],
                    ['Surat RT/RW', selected.file_surat_rtrw],
                    ['Foto rumah', selected.file_foto_rumah],
                    ['File pendukung', selected.file_pendukung],
                  ].map(([l, f]) => f && (
                    <div key={l} className="py-2.5 flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-1.5 text-ink-2">
                        <Paperclip size={13} strokeWidth={1.75} aria-hidden="true" className="text-muted" />
                        {l}
                      </span>
                      <a
                        href={`http://localhost:8080/${f}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs civic-link"
                      >
                        Lihat dokumen
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  )
}

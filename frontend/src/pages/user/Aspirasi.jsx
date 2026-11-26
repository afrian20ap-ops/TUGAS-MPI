import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { ArrowLeft, Calendar, ChevronRight, MapPin, Paperclip, Plus, Trash2, X } from 'lucide-react'
import api from '../../services/api'
import UserLayout from '../../components/UserLayout'
import { Reveal3D, Tilt3D } from '../../components/Motion3D'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const SERUA_INDAH_POLYGON = [
  [-6.3050, 106.7180], [-6.3050, 106.7310], [-6.3100, 106.7340],
  [-6.3160, 106.7330], [-6.3200, 106.7290], [-6.3210, 106.7240],
  [-6.3180, 106.7190], [-6.3130, 106.7160], [-6.3080, 106.7165],
  [-6.3050, 106.7180],
]
const CENTER = [-6.3130, 106.7250]

const TIPE_ASPIRASI = [
  { id: 'ketentraman',  label: 'Ketentraman dan Ketertiban Umum',      desc: 'Gangguan keamanan, ketertiban, atau konflik lingkungan warga' },
  { id: 'sarana',       label: 'Sarana, Prasarana dan Mobilitas Umum', desc: 'Jalan rusak, jembatan, lampu penerangan, saluran drainase' },
  { id: 'sosial',       label: 'Sosial Kemasyarakatan',                desc: 'Bantuan sosial, layanan kesehatan, atau pendidikan warga' },
  { id: 'lingkungan',   label: 'Lingkungan Hidup',                     desc: 'Pengelolaan sampah, pohon tumbang, atau pencemaran' },
  { id: 'administrasi', label: 'Administrasi dan Pelayanan',           desc: 'Keluhan pelayanan loket atau dokumen kependudukan' },
  { id: 'lainnya',      label: 'Lainnya',                              desc: 'Aspirasi warga di luar kategori di atas' },
]

const STATUS_ASPIRASI = {
  verifikasi_lapangan: { label: 'Verifikasi lapangan',         cls: 'tag-out' },
  koordinasi:          { label: 'Koordinasi perangkat daerah', cls: 'tag-warn' },
  proses_penyelesaian: { label: 'Proses penyelesaian',         cls: 'tag-on' },
  selesai:             { label: 'Selesai',                     cls: 'tag-in' },
  ditolak:             { label: 'Ditolak',                     cls: 'tag-error' },
  '0':                 { label: 'Verifikasi lapangan',         cls: 'tag-out' },
  menunggu:            { label: 'Verifikasi lapangan',         cls: 'tag-out' },
  proses:              { label: 'Proses penyelesaian',         cls: 'tag-on' },
}

const statusBadge = (s) => {
  const st = STATUS_ASPIRASI[s] || STATUS_ASPIRASI.verifikasi_lapangan
  return <span className={`tag ${st.cls}`}>{st.label}</span>
}

function PinPicker({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng) } })
  return null
}

const EMPTY_FORM = {
  tipe_aspirasi: '',
  judul_laporan: '', isi_laporan: '', tgl_kejadian: '',
  lokasi_kejadian: '', foto: null, latitude: null, longitude: null,
}

export default function UserAspirasi() {
  const [list, setList]                 = useState([])
  const [showForm, setShowForm]         = useState(false)
  const [formStep, setFormStep]         = useState('pilih')
  const [selectedTipe, setSelectedTipe] = useState(null)
  const [selected, setSelected]         = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [loading, setLoading]           = useState(false)
  const [filterTab, setFilterTab]       = useState('semua')

  const fetchData = () => api.get('/aspirasi').then(r => setList(r.data.data || []))
  useEffect(() => { fetchData() }, [])

  const handleOpenForm = () => {
    setForm(EMPTY_FORM)
    setSelectedTipe(null)
    setFormStep('pilih')
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setFormStep('pilih')
    setSelectedTipe(null)
    setForm(EMPTY_FORM)
  }

  const handlePilihTipe = (tipe) => {
    setSelectedTipe(tipe)
    setForm({ ...EMPTY_FORM, tipe_aspirasi: tipe.label })
    setFormStep('isi')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v)
      })
      await api.post('/aspirasi', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      handleCloseForm()
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengirim aspirasi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus aspirasi ini?')) return
    await api.delete(`/aspirasi/${id}`)
    fetchData()
  }

  const totalAsp = list.length
  const selesaiAsp = list.filter(p => p.status === 'selesai').length
  const prosesAsp = list.filter(p => p.status !== 'selesai' && p.status !== 'ditolak').length
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
            <h1 className="text-2xl font-bold text-ink">Aspirasi saya</h1>
            <p className="text-sm text-muted mt-1">
              Sampaikan aspirasi atau pengaduan lingkungan dan pantau tindak lanjutnya.
            </p>
          </div>
          <button type="button" onClick={handleOpenForm} className="btn btn-primary">
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>Buat aspirasi</span>
          </button>
        </div>

        {/* Ringkasan 3D Dashboard Warga — Klik untuk menyaring daftar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stage-3d">
          {[
            { key: 'semua',   label: 'Total aspirasi Anda', val: totalAsp,   highlight: false },
            { key: 'proses',  label: 'Sedang ditangani',    val: prosesAsp,  highlight: false },
            { key: 'selesai', label: 'Terselesaikan',       val: selesaiAsp, highlight: true  },
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
              {list.length === 0 ? 'Belum ada aspirasi yang disampaikan' : 'Tidak ada aspirasi pada kategori ini'}
            </p>
            <p className="text-sm text-muted mt-1">
              {list.length === 0
                ? 'Gunakan tombol Buat aspirasi untuk melaporkan keluhan atau usulan lingkungan Anda.'
                : 'Pilih kartu Total aspirasi Anda untuk menampilkan seluruh laporan.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((p, idx) => (
              <Reveal3D key={p.id_pengaduan} delay={Math.min(idx * 50, 250)}>
                <article className="panel p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {statusBadge(p.status)}
                    {p.tipe_aspirasi && <span className="tag">{p.tipe_aspirasi}</span>}
                    <time className="text-xs text-muted font-mono num">
                      {new Date(p.tgl_pengaduan).toLocaleDateString('id-ID')}
                    </time>
                  </div>
                  <h2 className="text-base font-bold text-ink">{p.judul_laporan}</h2>
                  <p className="text-sm text-ink-2 line-clamp-2">{p.isi_laporan}</p>
                  <p className="text-xs text-muted flex items-center gap-1.5 pt-0.5">
                    <MapPin size={13} strokeWidth={1.75} aria-hidden="true" className="text-accent" />
                    <span>{p.lokasi_kejadian}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={() => setSelected(p)} className="btn btn-sm">
                    Detail
                  </button>
                  {(p.status === '0' || p.status === 'verifikasi_lapangan') && (
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id_pengaduan)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={13} strokeWidth={1.75} aria-hidden="true" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </article>
              </Reveal3D>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form Buat Aspirasi */}
      {showForm && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="form-aspirasi-title">
          <div className="modal-panel max-w-xl">
            <div className="px-6 py-4 border-b border-rule-2 flex items-center justify-between gap-3 sticky top-0 bg-surface z-10">
              <div className="flex items-center gap-3 min-w-0">
                {formStep === 'isi' && (
                  <button
                    type="button"
                    onClick={() => setFormStep('pilih')}
                    className="btn btn-sm px-2.5"
                    aria-label="Kembali pilih kategori"
                  >
                    <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
                    <span>Ganti</span>
                  </button>
                )}
                <div className="min-w-0">
                  <h2 id="form-aspirasi-title" className="text-base font-bold text-ink truncate">
                    {formStep === 'pilih' ? 'Pilih kategori aspirasi' : 'Isi detail aspirasi'}
                  </h2>
                  {formStep === 'isi' && selectedTipe && (
                    <p className="text-xs text-accent-soft-ink font-medium truncate">
                      {selectedTipe.label}
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
                <p className="text-sm text-muted mb-4">Pilih kategori yang paling sesuai dengan laporan Anda.</p>
                <div className="divide-y divide-rule-2">
                  {TIPE_ASPIRASI.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handlePilihTipe(t)}
                      className="w-full text-left py-3.5 px-3 rounded-control hover:bg-paper-2 flex items-center justify-between gap-4 transition-colors duration-150"
                    >
                      <div>
                        <p className="font-semibold text-sm text-ink">{t.label}</p>
                        <p className="text-xs text-muted mt-0.5">{t.desc}</p>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" className="text-muted shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formStep === 'isi' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="asp-judul" className="field-label">Judul aspirasi</label>
                  <input
                    id="asp-judul"
                    value={form.judul_laporan}
                    onChange={e => setForm({ ...form, judul_laporan: e.target.value })}
                    placeholder="Tulis judul singkat aspirasi Anda"
                    className="field-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="asp-isi" className="field-label">Isi aspirasi</label>
                  <textarea
                    id="asp-isi"
                    value={form.isi_laporan}
                    onChange={e => setForm({ ...form, isi_laporan: e.target.value })}
                    rows={4}
                    placeholder="Jelaskan kondisi, waktu, dan harapan penanganan…"
                    className="field-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="asp-tgl" className="field-label">Tanggal kejadian</label>
                    <input
                      id="asp-tgl"
                      type="date"
                      value={form.tgl_kejadian}
                      onChange={e => setForm({ ...form, tgl_kejadian: e.target.value })}
                      className="field-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="asp-lokasi" className="field-label">Keterangan lokasi kejadian</label>
                    <input
                      id="asp-lokasi"
                      value={form.lokasi_kejadian}
                      onChange={e => setForm({ ...form, lokasi_kejadian: e.target.value })}
                      placeholder="Contoh: Jl. Serua Raya No. 5"
                      className="field-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label">
                    Pin lokasi di peta <span className="font-normal text-muted">(klik pada peta)</span>
                  </label>
                  <div className="rounded-control overflow-hidden border border-rule" style={{ height: 210 }}>
                    <MapContainer center={CENTER} zoom={14} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Polygon
                        positions={SERUA_INDAH_POLYGON}
                        pathOptions={{ color: '#0d766e', fillColor: '#0d766e', fillOpacity: 0.14, weight: 2 }}
                      />
                      <PinPicker onPick={ll => setForm(f => ({ ...f, latitude: ll.lat, longitude: ll.lng }))} />
                      {form.latitude && form.longitude && (
                        <Marker position={[form.latitude, form.longitude]} />
                      )}
                    </MapContainer>
                  </div>
                  <p className="text-xs text-muted mt-1.5 font-mono min-h-[1lh]">
                    {form.latitude
                      ? `Titik dipilih: ${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}`
                      : 'Belum ada titik lokasi dipilih.'}
                  </p>
                </div>

                <div>
                  <label htmlFor="asp-foto" className="field-label">
                    Foto pendukung <span className="font-normal text-muted">(opsional)</span>
                  </label>
                  <input
                    id="asp-foto"
                    type="file"
                    accept="image/*"
                    onChange={e => setForm({ ...form, foto: e.target.files[0] })}
                    className="field-input text-sm py-2"
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                    {loading ? 'Mengirim…' : 'Kirim aspirasi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {selected && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="detail-aspirasi-title">
          <div className="modal-panel max-w-lg">
            <div className="px-6 py-4 border-b border-rule-2 flex items-center justify-between">
              <h2 id="detail-aspirasi-title" className="text-base font-bold text-ink">Detail aspirasi</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Tutup dialog" className="btn btn-ghost btn-sm px-2">
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <div className="flex flex-wrap gap-2">
                {statusBadge(selected.status)}
                {selected.tipe_aspirasi && <span className="tag">{selected.tipe_aspirasi}</span>}
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-ink">{selected.judul_laporan}</h3>
                <p className="text-ink-2">{selected.isi_laporan}</p>
                <div className="pt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} strokeWidth={1.75} aria-hidden="true" className="text-accent" />
                    {selected.lokasi_kejadian}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <Calendar size={13} strokeWidth={1.75} aria-hidden="true" />
                    {new Date(selected.tgl_kejadian).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>

              {selected.foto && (
                <img
                  src={`http://localhost:8080/${selected.foto}`}
                  alt="Foto pendukung aspirasi"
                  className="civic-photo w-full object-cover max-h-56"
                />
              )}

              {selected.tanggapan?.length > 0 && (
                <div className="pt-4 border-t border-rule-2">
                  <h3 className="text-sm font-bold text-ink mb-3">Tanggapan petugas</h3>
                  <div className="space-y-3">
                    {selected.tanggapan.map(t => (
                      <div key={t.id_tanggapan} className="well p-4 space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-semibold text-ink text-xs">{t.petugas?.nama_petugas}</p>
                          <time className="text-xs text-muted font-mono">
                            {new Date(t.tgl_tanggapan).toLocaleString('id-ID')}
                          </time>
                        </div>
                        <p className="text-ink-2">{t.tanggapan}</p>
                        {[t.file_bukti, t.file_bukti_2, t.file_bukti_3].filter(Boolean).map((f, idx) => (
                          <a
                            key={idx}
                            href={`http://localhost:8080/${f}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs civic-link mr-4 pt-1"
                          >
                            <Paperclip size={12} strokeWidth={1.75} aria-hidden="true" />
                            <span>Bukti penanganan {idx + 1}</span>
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  )
}

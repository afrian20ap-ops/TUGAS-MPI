import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Pencil } from 'lucide-react'
import api from '../../services/api'
import AdminLayout from '../../components/AdminLayout'

const NumField = ({ label, k, value, onChange }) => (
  <div>
    <label htmlFor={`kel-${k}`} className="field-label text-xs">{label}</label>
    <input
      id={`kel-${k}`}
      type="number"
      min="0"
      value={value || 0}
      onChange={e => onChange(k, parseInt(e.target.value) || 0)}
      className="field-input font-mono text-sm"
    />
  </div>
)

export default function AdminKelurahan() {
  const [info, setInfo]       = useState(null)
  const [form, setForm]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState(null)
  const [edit, setEdit]       = useState(false)

  useEffect(() => {
    api.get('/kelurahan').then(r => {
      setInfo(r.data.data)
      setForm(r.data.data)
    })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      await api.put('/kelurahan', form)
      setInfo({ ...form })
      setEdit(false)
      setMsg({ type: 'success', text: 'Data kelurahan berhasil diperbarui.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Gagal menyimpan perubahan' })
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (!info) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64 text-sm text-muted">
        Memuat profil kelurahan…
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Info kelurahan</h1>
            <p className="text-sm text-muted mt-1">Profil wilayah, demografi, dan sarana Kelurahan Serua Indah</p>
          </div>
          {!edit && (
            <button type="button" onClick={() => setEdit(true)} className="btn btn-primary">
              <Pencil size={14} strokeWidth={1.75} aria-hidden="true" />
              <span>Edit informasi</span>
            </button>
          )}
        </div>

        {msg && (
          <div className={`notice ${msg.type === 'success' ? 'notice-in' : 'notice-error'}`} role="status">
            {msg.type === 'success'
              ? <CheckCircle2 size={16} aria-hidden="true" className="shrink-0 mt-0.5" />
              : <AlertCircle size={16} aria-hidden="true" className="shrink-0 mt-0.5" />}
            <span>{msg.text}</span>
          </div>
        )}

        {!edit ? (
          <div className="space-y-6">
            {/* Demografi */}
            <dl className="panel grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-rule-2">
              {[
                ['Jumlah penduduk', info.jumlah_penduduk, 'jiwa'],
                ['Kepala keluarga', info.jumlah_kk, 'KK'],
                ['Penduduk laki-laki', info.jumlah_laki_laki, 'jiwa'],
                ['Penduduk perempuan', info.jumlah_perempuan, 'jiwa'],
              ].map(([label, val, unit]) => (
                <div key={label} className="p-5">
                  <dt className="text-xs font-medium text-muted">{label}</dt>
                  <dd className="mt-1.5 font-display font-bold text-2xl text-ink num">
                    {(val || 0).toLocaleString('id-ID')}
                    <span className="ml-1.5 text-xs font-sans font-normal text-muted">{unit}</span>
                  </dd>
                </div>
              ))}
            </dl>

            {/* Sarana Pendidikan & Kesehatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="panel p-6">
                <h2 className="text-base font-bold text-ink mb-3">Sarana pendidikan</h2>
                <dl className="divide-y divide-rule-2 text-sm">
                  {[
                    ['PAUD, KB, dan TK', info.jml_paud_kb_tk],
                    ['Sekolah Dasar', info.jml_sekolah_dasar],
                    ['SLTP', info.jml_sltp],
                    ['SLTA', info.jml_slta],
                    ['Perguruan Tinggi', info.jml_perguruan_tinggi],
                  ].map(([l, v]) => (
                    <div key={l} className="py-2.5 flex justify-between">
                      <dt className="text-ink-2">{l}</dt>
                      <dd className="font-mono font-medium text-ink num">{(v || 0).toLocaleString('id-ID')}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="panel p-6">
                <h2 className="text-base font-bold text-ink mb-3">Sarana kesehatan</h2>
                <dl className="divide-y divide-rule-2 text-sm">
                  {[
                    ['Rumah Sakit', info.jml_rumah_sakit],
                    ['Puskesmas', info.jml_puskesmas],
                    ['Klinik dan Balai Pengobatan', info.jml_klinik],
                    ['Pengobatan Tradisional', info.jml_klinik_tradisional],
                    ['Posyandu', info.jml_posyandu],
                  ].map(([l, v]) => (
                    <div key={l} className="py-2.5 flex justify-between">
                      <dt className="text-ink-2">{l}</dt>
                      <dd className="font-mono font-medium text-ink num">{(v || 0).toLocaleString('id-ID')}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>

            {/* Visi Misi & Info Kantor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="panel p-6 space-y-5 text-sm">
                <div>
                  <h2 className="text-sm font-bold text-accent-soft-ink mb-1.5">Visi</h2>
                  <p className="text-ink-2">{info.visi || '-'}</p>
                </div>
                <div className="pt-4 border-t border-rule-2">
                  <h2 className="text-sm font-bold text-ink mb-1.5">Misi</h2>
                  <p className="text-ink-2 whitespace-pre-line">{info.misi || '-'}</p>
                </div>
                {info.sejarah && (
                  <div className="pt-4 border-t border-rule-2">
                    <h2 className="text-sm font-bold text-ink mb-1.5">Sejarah singkat</h2>
                    <p className="text-ink-2 leading-relaxed">{info.sejarah}</p>
                  </div>
                )}
              </section>

              <section className="panel p-6">
                <h2 className="text-base font-bold text-ink mb-3">Informasi kantor</h2>
                <dl className="divide-y divide-rule-2 text-sm">
                  {[
                    ['Alamat kantor', info.alamat_kantor],
                    ['Telepon', info.telp_kantor],
                    ['Email', info.email_kantor],
                    ['Jam layanan', info.jam_operasional],
                    ['Luas wilayah', info.luas_wilayah],
                    ['Kode pos', info.kode_pos],
                  ].map(([l, v]) => (
                    <div key={l} className="py-2.5 grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3">
                      <dt className="text-muted text-xs">{l}</dt>
                      <dd className="text-ink font-medium">{v || '-'}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <section className="panel p-6 space-y-4">
              <h2 className="text-base font-bold text-ink">Penduduk</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NumField label="Jumlah penduduk" k="jumlah_penduduk" value={form.jumlah_penduduk} onChange={set} />
                <NumField label="Kepala keluarga" k="jumlah_kk" value={form.jumlah_kk} onChange={set} />
                <NumField label="Laki-laki" k="jumlah_laki_laki" value={form.jumlah_laki_laki} onChange={set} />
                <NumField label="Perempuan" k="jumlah_perempuan" value={form.jumlah_perempuan} onChange={set} />
              </div>
            </section>

            <section className="panel p-6 space-y-4">
              <h2 className="text-base font-bold text-ink">Sarana pendidikan</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <NumField label="PAUD/KB/TK" k="jml_paud_kb_tk" value={form.jml_paud_kb_tk} onChange={set} />
                <NumField label="Sekolah Dasar" k="jml_sekolah_dasar" value={form.jml_sekolah_dasar} onChange={set} />
                <NumField label="SLTP" k="jml_sltp" value={form.jml_sltp} onChange={set} />
                <NumField label="SLTA" k="jml_slta" value={form.jml_slta} onChange={set} />
                <NumField label="Perguruan Tinggi" k="jml_perguruan_tinggi" value={form.jml_perguruan_tinggi} onChange={set} />
              </div>
            </section>

            <section className="panel p-6 space-y-4">
              <h2 className="text-base font-bold text-ink">Sarana kesehatan</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <NumField label="Rumah Sakit" k="jml_rumah_sakit" value={form.jml_rumah_sakit} onChange={set} />
                <NumField label="Puskesmas" k="jml_puskesmas" value={form.jml_puskesmas} onChange={set} />
                <NumField label="Klinik" k="jml_klinik" value={form.jml_klinik} onChange={set} />
                <NumField label="Tradisional" k="jml_klinik_tradisional" value={form.jml_klinik_tradisional} onChange={set} />
                <NumField label="Posyandu" k="jml_posyandu" value={form.jml_posyandu} onChange={set} />
              </div>
            </section>

            <section className="panel p-6 space-y-4">
              <h2 className="text-base font-bold text-ink">Visi, misi, dan sejarah</h2>
              <div>
                <label htmlFor="kel-visi" className="field-label">Visi</label>
                <input id="kel-visi" value={form.visi || ''} onChange={e => set('visi', e.target.value)} className="field-input" />
              </div>
              <div>
                <label htmlFor="kel-misi" className="field-label">Misi</label>
                <textarea id="kel-misi" value={form.misi || ''} onChange={e => set('misi', e.target.value)} rows={4} className="field-input" />
              </div>
              <div>
                <label htmlFor="kel-sejarah" className="field-label">Sejarah</label>
                <textarea id="kel-sejarah" value={form.sejarah || ''} onChange={e => set('sejarah', e.target.value)} rows={4} className="field-input" />
              </div>
            </section>

            <section className="panel p-6 space-y-4">
              <h2 className="text-base font-bold text-ink">Informasi kantor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Alamat kantor', 'alamat_kantor', 'text'],
                  ['Telepon', 'telp_kantor', 'text'],
                  ['Email', 'email_kantor', 'email'],
                  ['Jam operasional', 'jam_operasional', 'text'],
                  ['Luas wilayah', 'luas_wilayah', 'text'],
                  ['Kode pos', 'kode_pos', 'text'],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label htmlFor={`kel-${key}`} className="field-label">{label}</label>
                    <input
                      id={`kel-${key}`}
                      type={type}
                      value={form[key] || ''}
                      onChange={e => set(key, e.target.value)}
                      className="field-input"
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setEdit(false); setForm(info) }} className="btn btn-lg flex-1">
                Batal
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg flex-1">
                {loading ? 'Menyimpan…' : 'Simpan perubahan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  )
}

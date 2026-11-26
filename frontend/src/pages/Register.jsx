import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, Building2 } from 'lucide-react'
import api from '../services/api'

const Field = ({ label, k, type = 'text', placeholder = '', value, onChange, required = true, mono = false }) => (
  <div>
    <label htmlFor={`reg-${k}`} className="field-label">{label}</label>
    <input
      id={`reg-${k}`}
      name={k}
      type={type}
      value={value}
      onChange={e => onChange(k, e.target.value)}
      placeholder={placeholder}
      className={`field-input ${mono ? 'font-mono' : ''}`}
      required={required}
    />
  </div>
)

const SelectField = ({ label, k, options, value, onChange, onChangeExtra }) => (
  <div>
    <label htmlFor={`reg-${k}`} className="field-label">{label}</label>
    <select
      id={`reg-${k}`}
      name={k}
      value={value}
      onChange={e => { onChange(k, e.target.value); onChangeExtra && onChangeExtra() }}
      className="field-input"
      required
    >
      <option value="">Pilih {label.toLowerCase()}</option>
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  </div>
)

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nik: '', name: '', email: '', username: '', password: '',
    jenis_kelamin: 'Laki-laki', telp: '', alamat: '', rt: '', rw: '',
    kode_pos: '', province_id: '', regency_id: '', district_id: '', village_id: '',
  })
  const [provinces, setProvinces] = useState([])
  const [regencies, setRegencies] = useState([])
  const [districts, setDistricts] = useState([])
  const [villages, setVillages]   = useState([])
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [step, setStep]           = useState(1)

  useEffect(() => {
    api.get('/provinces').then(r => setProvinces(r.data.data || [])).catch(() => {})
  }, [])
  useEffect(() => {
    if (form.province_id) {
      setRegencies([]); setDistricts([]); setVillages([])
      api.get(`/regencies?province_id=${form.province_id}`).then(r => setRegencies(r.data.data || []))
    }
  }, [form.province_id])
  useEffect(() => {
    if (form.regency_id) {
      setDistricts([]); setVillages([])
      api.get(`/districts?regency_id=${form.regency_id}`).then(r => setDistricts(r.data.data || []))
    }
  }, [form.regency_id])
  useEffect(() => {
    if (form.district_id) {
      setVillages([])
      api.get(`/villages?district_id=${form.district_id}`).then(r => setVillages(r.data.data || []))
    }
  }, [form.district_id])

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal, silakan periksa kembali data Anda.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { n: 1, label: 'Data akun' },
    { n: 2, label: 'Kontak dan alamat' },
    { n: 3, label: 'Wilayah domisili' },
  ]

  return (
    <div className="min-h-[100dvh] bg-paper text-ink flex flex-col">
      <header className="sticky top-0 z-[300] glass-nav">
        <div className="civic-container h-[64px] flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2.5 text-ink no-underline">
            <span className="w-8 h-8 rounded-control bg-rail text-rail-ink flex items-center justify-center">
              <Building2 size={16} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="font-display font-bold text-base">Kelurahan Serua Indah</span>
          </Link>
          <Link to="/login" className="text-sm civic-link whitespace-nowrap">
            Sudah punya akun? Masuk
          </Link>
        </div>
      </header>

      <main className="flex-1 civic-container py-10 lg:py-14">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-ink">Daftar akun warga</h1>
          <p className="text-sm text-muted mt-1.5">
            Lengkapi tiga tahapan data berikut untuk menggunakan layanan daring kelurahan.
          </p>

          <ol className="grid grid-cols-3 gap-4 mt-8 mb-6 list-none p-0">
            {steps.map(s => {
              const active = step === s.n
              const done = step > s.n
              return (
                <li
                  key={s.n}
                  className={`pt-3 border-t-2 ${
                    done ? 'border-accent' : active ? 'border-ink' : 'border-rule'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className={`font-mono text-xs font-medium ${done ? 'text-accent' : active ? 'text-ink' : 'text-muted'}`}>
                      0{s.n}
                    </span>
                    <span className={`text-sm font-semibold ${active || done ? 'text-ink' : 'text-muted'}`}>
                      {s.label}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="panel p-6 sm:p-8">
            {error && (
              <div className="notice notice-error mb-6" role="alert">
                <AlertCircle size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-ink">Data akun</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="NIK (16 digit)" k="nik" value={form.nik} onChange={handleChange} placeholder="3271xxxxxxxxxxxx" mono />
                    <Field label="Nama lengkap" k="name" value={form.name} onChange={handleChange} placeholder="Nama sesuai KTP" />
                    <Field label="Email" k="email" value={form.email} onChange={handleChange} type="email" placeholder="nama@email.com" />
                    <Field label="Username" k="username" value={form.username} onChange={handleChange} placeholder="Username unik" />
                    <Field label="Password" k="password" value={form.password} onChange={handleChange} type="password" placeholder="Minimal 8 karakter" />
                    <div>
                      <label htmlFor="reg-jenis_kelamin" className="field-label">Jenis kelamin</label>
                      <select
                        id="reg-jenis_kelamin"
                        name="jenis_kelamin"
                        value={form.jenis_kelamin}
                        onChange={e => handleChange('jenis_kelamin', e.target.value)}
                        className="field-input"
                      >
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!form.nik || !form.name || !form.email || !form.username || !form.password}
                      className="btn btn-primary btn-lg w-full whitespace-nowrap"
                    >
                      Lanjut
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-ink">Kontak dan alamat</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="No. telepon" k="telp" value={form.telp} onChange={handleChange} type="tel" placeholder="08xxxxxxxxxx" mono />
                    <Field label="Kode pos" k="kode_pos" value={form.kode_pos} onChange={handleChange} placeholder="15414" mono />
                    <div className="md:col-span-2">
                      <Field label="Alamat lengkap" k="alamat" value={form.alamat} onChange={handleChange} placeholder="Jl. Serua Indah No. 12" />
                    </div>
                    <Field label="RT" k="rt" value={form.rt} onChange={handleChange} placeholder="001" mono />
                    <Field label="RW" k="rw" value={form.rw} onChange={handleChange} placeholder="010" mono />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn btn-lg flex-1">
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!form.telp || !form.alamat || !form.rt || !form.rw || !form.kode_pos}
                      className="btn btn-primary btn-lg flex-1 whitespace-nowrap"
                    >
                      Lanjut
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-ink">Wilayah tempat tinggal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Provinsi" k="province_id" options={provinces}
                      value={form.province_id} onChange={handleChange}
                      onChangeExtra={() => setForm(f => ({ ...f, regency_id: '', district_id: '', village_id: '' }))}
                    />
                    <SelectField
                      label="Kabupaten atau Kota" k="regency_id" options={regencies}
                      value={form.regency_id} onChange={handleChange}
                      onChangeExtra={() => setForm(f => ({ ...f, district_id: '', village_id: '' }))}
                    />
                    <SelectField
                      label="Kecamatan" k="district_id" options={districts}
                      value={form.district_id} onChange={handleChange}
                      onChangeExtra={() => setForm(f => ({ ...f, village_id: '' }))}
                    />
                    <SelectField
                      label="Desa atau Kelurahan" k="village_id" options={villages}
                      value={form.village_id} onChange={handleChange}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(2)} className="btn btn-lg flex-1">
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !form.province_id || !form.regency_id || !form.district_id || !form.village_id}
                      className="btn btn-primary btn-lg flex-1 whitespace-nowrap"
                    >
                      {loading ? 'Mendaftarkan…' : 'Daftar sekarang'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

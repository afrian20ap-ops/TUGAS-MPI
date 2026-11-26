import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Building2, CheckCircle2, Clock, MapPin, Phone, Search } from 'lucide-react'
import api from '../services/api'
import { ProgressBar3D, Reveal3D, Tilt3D } from '../components/Motion3D'

const FALLBACK_LAYANAN = [
  { id: 'domisili', nama_layanan: 'Surat Keterangan Domisili', deskripsi: 'Keterangan tempat tinggal warga di wilayah Serua Indah.', estimasi_hari: 1 },
  { id: 'sktm', nama_layanan: 'Surat Keterangan Tidak Mampu', deskripsi: 'Keperluan administrasi bantuan pendidikan dan kesehatan.', estimasi_hari: 2 },
  { id: 'ktpkk', nama_layanan: 'Surat Pengantar KTP dan KK', deskripsi: 'Pengantar pembuatan atau pembaruan data kependudukan.', estimasi_hari: 1 },
  { id: 'usaha', nama_layanan: 'Surat Keterangan Usaha', deskripsi: 'Keterangan kepemilikan usaha di wilayah kelurahan.', estimasi_hari: 3 },
  { id: 'kelahiran', nama_layanan: 'Surat Keterangan Kelahiran', deskripsi: 'Pengantar pencatatan kelahiran warga baru.', estimasi_hari: 2 },
  { id: 'kematian', nama_layanan: 'Surat Keterangan Kematian', deskripsi: 'Pengantar pencatatan kematian bagi keluarga warga.', estimasi_hari: 1 },
]

export default function Landing() {
  const [kelurahan, setKelurahan] = useState(null)
  const [statistik, setStatistik] = useState(null)
  const [jenisLayanan, setJenisLayanan] = useState([])
  const [cariLayanan, setCariLayanan] = useState('')

  useEffect(() => {
    api.get('/kelurahan').then(r => setKelurahan(r.data.data)).catch(() => {})
    api.get('/public/statistik').then(r => setStatistik(r.data)).catch(() => {})
    api.get('/jenis-layanan').then(r => setJenisLayanan(r.data.data || [])).catch(() => {})
  }, [])

  const katalog = jenisLayanan.length > 0 ? jenisLayanan : FALLBACK_LAYANAN
  const layananTampil = katalog.filter(item =>
    item.nama_layanan?.toLowerCase().includes(cariLayanan.toLowerCase()) ||
    item.deskripsi?.toLowerCase().includes(cariLayanan.toLowerCase())
  )

  const pctAsp = statistik?.aspirasi?.total
    ? Math.round((statistik.aspirasi.selesai / statistik.aspirasi.total) * 100)
    : 0
  const pctPerm = statistik?.permohonan?.total
    ? Math.round((statistik.permohonan.selesai / statistik.permohonan.total) * 100)
    : 0

  const jamLayanan = kelurahan?.jam_operasional || 'Senin sampai Jumat, 08.00 hingga 16.00 WIB'
  const alamatKantor = kelurahan?.alamat_kantor || 'Jl. Serua Indah, Ciputat, Tangerang Selatan 15414'

  const saranaPendidikan = [
    ['PAUD, KB, dan TK', kelurahan?.jml_paud_kb_tk],
    ['Sekolah Dasar', kelurahan?.jml_sekolah_dasar],
    ['SLTP', kelurahan?.jml_sltp],
    ['SLTA', kelurahan?.jml_slta],
    ['Perguruan Tinggi', kelurahan?.jml_perguruan_tinggi],
  ]

  const saranaKesehatan = [
    ['Rumah Sakit', kelurahan?.jml_rumah_sakit],
    ['Puskesmas', kelurahan?.jml_puskesmas],
    ['Klinik dan Balai Pengobatan', kelurahan?.jml_klinik],
    ['Pengobatan Tradisional', kelurahan?.jml_klinik_tradisional],
    ['Posyandu', kelurahan?.jml_posyandu],
  ]

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      {/* Frosted glass sticky navigation */}
      <header className="sticky top-0 z-[300] glass-nav">
        <div className="civic-container h-[68px] flex items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="Beranda SIPLA Kelurahan Serua Indah"
            className="flex items-center gap-3 text-ink no-underline min-w-0"
          >
            <span className="w-9 h-9 rounded-control bg-rail text-rail-ink flex items-center justify-center shrink-0">
              <Building2 size={18} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-display font-bold text-[0.98rem] leading-tight text-ink whitespace-nowrap">
                Kelurahan Serua Indah
              </span>
              <span className="hidden sm:block text-xs text-muted leading-tight whitespace-nowrap">
                Ciputat, Tangerang Selatan
              </span>
            </span>
          </Link>

          <nav aria-label="Navigasi utama" className="flex items-center gap-2 sm:gap-5">
            <a href="#transparansi" className="hidden md:inline text-sm font-medium text-ink-2 hover:text-ink no-underline whitespace-nowrap">
              Transparansi
            </a>
            <a href="#profil-kelurahan" className="hidden md:inline text-sm font-medium text-ink-2 hover:text-ink no-underline whitespace-nowrap">
              Profil wilayah
            </a>
            <Link to="/login" className="btn btn-ghost whitespace-nowrap">
              Masuk
            </Link>
            <Link to="/register" className="btn btn-primary whitespace-nowrap">
              Daftar akun
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Stage Hero modern dengan panel layanan melayang */}
        <section className="hero-canvas py-12 lg:py-16">
          <div className="civic-container">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] gap-10 lg:gap-14 items-center">
              <div className="min-w-0">
                <h1 className="text-[clamp(2.5rem,4.4vw+0.75rem,4.35rem)] leading-[1.03] tracking-[-0.03em] font-bold text-ink max-w-[14ch]">
                  Layanan dan aspirasi warga Serua Indah.
                </h1>
                <p className="lead text-ink-2 mt-5 max-w-[44ch]">
                  Sampaikan pengaduan, ajukan surat kelurahan, dan pantau penanganannya dari rumah.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-8">
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Sampaikan aspirasi
                  </Link>
                  <Link to="/login" className="btn btn-lg">
                    Ajukan permohonan
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-rule flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
                  <span className="inline-flex items-center gap-2">
                    <Clock size={15} strokeWidth={1.75} aria-hidden="true" className="text-accent" />
                    <span>{jamLayanan}</span>
                  </span>
                  <Link to="/login" className="civic-link inline-flex items-center gap-1">
                    <span>Portal petugas</span>
                    <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Signature: Panel Katalog Layanan Loket Elevated dengan Perspektif 3D Interaktif */}
              <div className="stage-3d min-w-0">
                <Tilt3D
                  maxTilt={4.5}
                  restRotateX={1.5}
                  restRotateY={-3.5}
                  className="panel p-6 sm:p-7 min-w-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 tilt-3d-layer">
                    <h2 className="text-lg font-bold text-ink">Katalog layanan kelurahan</h2>
                    <span className="tag tag-in font-mono text-xs num float-3d" role="status">
                      <CheckCircle2 size={12} strokeWidth={2} aria-hidden="true" />
                      <span>{katalog.length} layanan aktif</span>
                    </span>
                  </div>

                  <div className="relative mb-4">
                    <Search
                      size={16}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      id="cari-layanan"
                      name="cari_layanan"
                      type="search"
                      aria-label="Cari layanan surat kelurahan"
                      value={cariLayanan}
                      onChange={e => setCariLayanan(e.target.value)}
                      placeholder="Cari surat domisili, SKTM, pengantar KTP, usaha"
                      className="field-input pl-10"
                    />
                  </div>

                  <div className="divide-y divide-rule-2">
                    {layananTampil.length === 0 ? (
                      <div className="py-6 text-sm text-muted">
                        Tidak ada jenis layanan yang cocok dengan pencarian Anda.
                      </div>
                    ) : (
                      layananTampil.slice(0, 5).map(item => (
                        <Link
                          key={item.id}
                          to="/login"
                          className="service-row-link"
                        >
                          <div className="min-w-0">
                            <p className="service-row-title font-semibold text-sm text-ink">{item.nama_layanan}</p>
                            <p className="text-xs text-muted mt-0.5 line-clamp-1">{item.deskripsi}</p>
                          </div>
                          <span className="tag tag-in font-mono text-xs shrink-0 num">
                            {item.estimasi_hari} hari
                          </span>
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-rule-2 flex items-center justify-between gap-3 text-xs text-muted">
                    <span>Estimasi dihitung pada hari kerja.</span>
                    <Link to="/login" className="civic-link whitespace-nowrap">
                      Ajukan sekarang
                    </Link>
                  </div>
                </Tilt3D>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Dark Forest Transparency Band */}
        <section id="transparansi" className="band-dark py-20 lg:py-24">
          <div className="civic-container">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] gap-10 lg:gap-16 items-start">
              <div>
                <h2 className="text-[clamp(1.9rem,2.4vw+0.8rem,2.9rem)] leading-[1.08] font-bold">
                  Transparansi penanganan layanan publik.
                </h2>
                <p className="text-rail-muted mt-4 max-w-[42ch] text-base">
                  Setiap aspirasi warga dan permohonan administrasi tercatat secara langsung sehingga progres penyelesaiannya dapat dipantau bersama.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Aspirasi masyarakat',
                    total: statistik?.aspirasi?.total,
                    proses: statistik?.aspirasi?.proses,
                    selesai: statistik?.aspirasi?.selesai,
                    pct: pctAsp,
                    prosesLabel: 'Sedang ditangani',
                    selesaiLabel: 'Terselesaikan',
                  },
                  {
                    title: 'Permohonan layanan',
                    total: statistik?.permohonan?.total,
                    proses: statistik?.permohonan?.proses,
                    selesai: statistik?.permohonan?.selesai,
                    pct: pctPerm,
                    prosesLabel: 'Dalam verifikasi',
                    selesaiLabel: 'Dokumen terbit',
                  },
                ].map((card, idx) => (
                  <Reveal3D key={card.title} delay={idx * 90} className="stage-3d">
                    <Tilt3D maxTilt={4} className="rounded-card">
                      <Link
                        to="/login"
                        className="card-link-dark rounded-card bg-rail-2 p-6 border border-rail-rule"
                      >
                        <div className="flex items-baseline justify-between gap-3 tilt-3d-layer">
                          <h3 className="text-base font-bold text-rail-ink">{card.title}</h3>
                          <span className="font-mono text-xs px-2.5 py-1 rounded-pill bg-accent-soft text-accent-soft-ink font-medium num">
                            {card.pct}% selesai
                          </span>
                        </div>

                        <p className="mt-5 font-display font-bold text-4xl text-rail-ink num">
                          {card.total ?? '-'}
                          <span className="ml-2 text-sm font-sans font-normal text-rail-muted">total berkas</span>
                        </p>

                        <div className="mt-4">
                          <ProgressBar3D pct={card.pct} dark />
                        </div>

                        <dl className="mt-5 pt-4 border-t border-rail-rule grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <dt className="text-xs text-rail-muted">{card.prosesLabel}</dt>
                            <dd className="font-mono font-medium text-lg text-rail-ink mt-0.5 num">
                              {card.proses ?? '-'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-rail-muted">{card.selesaiLabel}</dt>
                            <dd className="font-mono font-medium text-lg text-rail-ink mt-0.5 num">
                              {card.selesai ?? '-'}
                            </dd>
                          </div>
                        </dl>
                      </Link>
                    </Tilt3D>
                  </Reveal3D>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Profil Kelurahan & Foto Kantor Lurah */}
        <section id="profil-kelurahan" className="civic-container py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-start">
            <Reveal3D className="stage-3d min-w-0">
              <figure className="m-0 min-w-0">
                <Tilt3D maxTilt={3.5} className="rounded-card">
                  <img
                    src="/hero_bg.jpg"
                    alt="Gedung Kantor Kelurahan Serua Indah, Kecamatan Ciputat"
                    width={1200}
                    height={800}
                    className="civic-photo w-full aspect-[4/3] object-cover"
                  />
                </Tilt3D>
                <figcaption className="mt-3.5 flex flex-wrap items-baseline justify-between gap-2 text-sm text-muted">
                  <span className="font-medium text-ink">Kantor Kelurahan Serua Indah</span>
                  <span>{alamatKantor}</span>
                </figcaption>
              </figure>
            </Reveal3D>

            <div className="min-w-0 space-y-6">
              <div>
                <h2 className="text-[clamp(1.9rem,2.3vw+0.8rem,2.8rem)] leading-[1.08] font-bold text-ink">
                  Profil Kelurahan Serua Indah
                </h2>
                <p className="text-ink-2 mt-4 leading-relaxed">
                  {kelurahan?.sejarah ||
                    'Kelurahan Serua Indah merupakan salah satu kelurahan di Kecamatan Ciputat, Kota Tangerang Selatan, Provinsi Banten. Wilayah ini berkembang sebagai kawasan permukiman strategis yang berbatasan langsung dengan Jakarta.'}
                </p>
              </div>

              {kelurahan?.visi && (
                <div className="panel p-5">
                  <h3 className="text-sm font-bold text-accent-soft-ink">Visi kelurahan</h3>
                  <p className="text-ink-2 mt-1.5 text-sm leading-relaxed">{kelurahan.visi}</p>
                </div>
              )}

              {kelurahan?.misi && (
                <div className="well p-5">
                  <h3 className="text-sm font-bold text-ink">Misi pelayanan</h3>
                  <p className="text-ink-2 mt-1.5 text-sm leading-relaxed whitespace-pre-line">{kelurahan.misi}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Data Kependudukan & Sarana Wilayah */}
        <section className="civic-container pb-20 lg:pb-28">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
            <h2 className="text-[clamp(1.75rem,2vw+0.75rem,2.5rem)] leading-[1.08] font-bold text-ink">
              Data kependudukan dan sarana wilayah
            </h2>
            <p className="text-sm text-muted max-w-[40ch]">
              Informasi demografi dan fasilitas umum yang diperbarui oleh petugas kelurahan.
            </p>
          </div>

          <dl className="panel grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-rule-2 mb-8">
            {[
              ['Jumlah penduduk', kelurahan?.jumlah_penduduk, 'jiwa'],
              ['Kepala keluarga', kelurahan?.jumlah_kk, 'KK'],
              ['Penduduk laki-laki', kelurahan?.jumlah_laki_laki, 'jiwa'],
              ['Penduduk perempuan', kelurahan?.jumlah_perempuan, 'jiwa'],
            ].map(([label, val, unit]) => (
              <div key={label} className="p-6">
                <dt className="text-xs font-medium text-muted">{label}</dt>
                <dd className="mt-2 font-display font-bold text-3xl text-ink num">
                  {val != null ? val.toLocaleString('id-ID') : '-'}
                  {val != null && (
                    <span className="ml-1.5 text-sm font-sans font-normal text-muted">{unit}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="panel p-6">
              <h3 className="text-base font-bold text-ink mb-4">Sarana pendidikan</h3>
              <dl className="divide-y divide-rule-2">
                {saranaPendidikan.map(([label, val]) => (
                  <div key={label} className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-ink-2">{label}</dt>
                    <dd className="font-mono text-sm font-medium text-ink num">
                      {val != null ? val.toLocaleString('id-ID') : '-'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="panel p-6">
              <h3 className="text-base font-bold text-ink mb-4">Sarana kesehatan</h3>
              <dl className="divide-y divide-rule-2">
                {saranaKesehatan.map(([label, val]) => (
                  <div key={label} className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-ink-2">{label}</dt>
                    <dd className="font-mono text-sm font-medium text-ink num">
                      {val != null ? val.toLocaleString('id-ID') : '-'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Penutup: Informasi Kunjungan & Akses Layanan */}
        <section className="bg-paper-2 border-t border-rule py-16 lg:py-20">
          <div className="civic-container">
            <div className="panel p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 items-start">
              <div>
                <h2 className="text-[clamp(1.7rem,2vw+0.7rem,2.35rem)] leading-[1.1] font-bold text-ink">
                  Mulai layanan daring Kelurahan Serua Indah
                </h2>
                <p className="text-ink-2 mt-3 max-w-[46ch]">
                  Buat akun warga untuk menyampaikan aspirasi beserta titik lokasi peta dan memantau pengajuan surat secara terbuka.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-7">
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Daftar akun warga
                  </Link>
                  <Link to="/login" className="btn btn-lg">
                    Masuk ke akun
                  </Link>
                </div>
              </div>

              <dl className="divide-y divide-rule-2 text-sm">
                {[
                  [MapPin, 'Alamat kantor', alamatKantor],
                  [Phone, 'Telepon', kelurahan?.telp_kantor || '021-7490xxx'],
                  [Clock, 'Jam layanan', jamLayanan],
                ].map(([Icon, k, v]) => (
                  <div key={k} className="py-3.5 flex items-start gap-3">
                    <Icon size={16} strokeWidth={1.75} aria-hidden="true" className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs text-muted">{k}</dt>
                      <dd className="text-ink font-medium mt-0.5">{v}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-paper border-t border-rule py-12">
        <div className="civic-container grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] gap-8 text-sm">
          <div>
            <p className="font-display font-bold text-base text-ink">Kelurahan Serua Indah</p>
            <p className="text-muted mt-2 max-w-[38ch]">
              Sistem Informasi Pusat Layanan dan Aspirasi Masyarakat Kecamatan Ciputat, Kota Tangerang Selatan, Provinsi Banten.
            </p>
          </div>

          <div>
            <p className="font-semibold text-ink mb-3">Akses layanan</p>
            <ul className="space-y-2 list-none p-0 m-0">
              <li><Link to="/login" className="civic-link font-normal text-ink-2">Masuk warga</Link></li>
              <li><Link to="/register" className="civic-link font-normal text-ink-2">Registrasi akun baru</Link></li>
              <li><Link to="/login" className="civic-link font-normal text-ink-2">Portal petugas dan admin</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-ink mb-3">Informasi kantor</p>
            <ul className="space-y-2 list-none p-0 m-0 text-muted">
              <li>{alamatKantor}</li>
              <li>{jamLayanan}</li>
              <li>SIPLA 2026</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

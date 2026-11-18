import { useEffect, useRef, useState } from 'react'
import heroImage from '../assets/images/hero.png'
import backgroundImage from '../assets/images/background.png'
import ButterflyCursor from './ButterflyCursor.jsx'
import '../css/style.css'

const pages = [
  ['index.html', 'Home'],
  ['about.html', 'About'],
  ['content.html', 'Artikel'],
  ['gallery.html', 'Galeri'],
  ['contact.html', 'Contact'],
]

const heroPhrases = [
  'Berpikir ke Mana Perginya Sampahmu?',
  'Membayangkan Bumi Tanpa Sampah?',
  'Tahu Berapa Lama Sampah Terurai?',
  'Melihat Nilai di Balik Sampah?',
  'Membayangkan Bumi yang Lebih Bersih?',
]

function App() {
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0)
  const [isHeroChanging, setIsHeroChanging] = useState(false)
  const heroMediaRef = useRef(null)
  const heroTargetRef = useRef({ x: 0, y: 0, radius: 0 })
  const heroPositionRef = useRef({ x: 0, y: 0, radius: 0 })
  const heroFrameRef = useRef(null)
  const [isIntroVisible, setIsIntroVisible] = useState(
    () =>
      !sessionStorage.getItem('ev') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [isIntroExiting, setIsIntroExiting] = useState(false)

  useEffect(() => {
    const updateNavigation = () => {
      document.querySelector('nav.top')?.classList.toggle('is-solid', window.scrollY > 60)
    }

    updateNavigation()
    window.addEventListener('scroll', updateNavigation, { passive: true })
    return () => window.removeEventListener('scroll', updateNavigation)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    const sections = document.querySelectorAll('main > section, body > section')
    sections.forEach((section) => section.classList.add('rv'))
    document.querySelectorAll('.rv').forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const media = heroMediaRef.current
    if (!media) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const positionEase = reduceMotion ? 1 : 0.14
    const radiusEase = reduceMotion ? 1 : 0.12
    let frameId = 0

    const tick = () => {
      const target = heroTargetRef.current
      const position = heroPositionRef.current
      position.x += (target.x - position.x) * positionEase
      position.y += (target.y - position.y) * positionEase
      position.radius += (target.radius - position.radius) * radiusEase
      if (target.radius === 0 && position.radius < 0.5) position.radius = 0

      media.style.setProperty('--hx', `${position.x.toFixed(1)}px`)
      media.style.setProperty('--hy', `${position.y.toFixed(1)}px`)
      media.style.setProperty('--hr', `${position.radius.toFixed(1)}px`)

      const settled =
        Math.abs(target.x - position.x) < 0.3 &&
        Math.abs(target.y - position.y) < 0.3 &&
        Math.abs(target.radius - position.radius) < 0.3
      frameId = settled ? 0 : window.requestAnimationFrame(tick)
    }

    heroFrameRef.current = () => {
      if (!frameId) frameId = window.requestAnimationFrame(tick)
    }

    return () => {
      window.cancelAnimationFrame(frameId)
      heroFrameRef.current = null
    }
  }, [])

  useEffect(() => {
    let changeTimer
    const intervalId = window.setInterval(() => {
      setIsHeroChanging(true)
      changeTimer = window.setTimeout(() => {
        setHeroPhraseIndex((index) => (index + 1) % heroPhrases.length)
        setIsHeroChanging(false)
      }, 250)
    }, 3000)
    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(changeTimer)
    }
  }, [])

  useEffect(() => {
    if (!isIntroVisible) return undefined

    const outTimer = window.setTimeout(() => {
      setIsIntroExiting(true)
      sessionStorage.setItem('ev', '1')
    }, 1500)
    const removeTimer = window.setTimeout(() => setIsIntroVisible(false), 2300)
    return () => {
      window.clearTimeout(outTimer)
      window.clearTimeout(removeTimer)
    }
  }, [isIntroVisible])

  const aimHeroReveal = (event) => {
    const bounds = heroMediaRef.current?.getBoundingClientRect()
    if (!bounds) return

    const target = heroTargetRef.current
    target.x = event.clientX - bounds.left
    target.y = event.clientY - bounds.top
  }

  const showHeroReveal = (event) => {
    aimHeroReveal(event)
    const target = heroTargetRef.current
    const position = heroPositionRef.current
    if (position.radius < 1) {
      position.x = target.x
      position.y = target.y
    }
    target.radius = Math.max(40, Math.min(window.innerWidth * 0.12, 120))
    heroFrameRef.current?.()
  }

  const moveHeroReveal = (event) => {
    if (event.pointerType === 'touch' && heroTargetRef.current.radius === 0) return
    aimHeroReveal(event)
    if (heroTargetRef.current.radius === 0) {
      heroTargetRef.current.radius = Math.max(40, Math.min(window.innerWidth * 0.12, 120))
    }
    heroFrameRef.current?.()
  }

  const hideHeroReveal = () => {
    heroTargetRef.current.radius = 0
    heroFrameRef.current?.()
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html'

  return (
    <>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>

      <nav className="top" aria-label="Navigasi utama">
        <a className="logo" href="index.html" aria-label="EcoVera — Beranda">
          <span className="logo-icon" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </span>
          <span className="logo-text">EcoVera</span>
        </a>
        <ul id="menu">
          {pages.map(([href, label]) => (
            <li key={href}>
              <a href={href} aria-current={href === currentPage ? 'page' : undefined}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {isIntroVisible && (
        <div id="intro" className={isIntroExiting ? 'out' : undefined} aria-hidden="true">
          <div>
            {'EcoVera'.split('').map((letter, index) => (
              <span key={`${letter}-${index}`} style={{ animationDelay: `${index * 70}ms` }}>
                {letter}
              </span>
            ))}
          </div>
        </div>
      )}

      <main id="main" className="stack">
        <section
          className="hero"
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') showHeroReveal(event)
          }}
          onPointerMove={moveHeroReveal}
          onPointerDown={(event) => {
            if (event.pointerType === 'touch') showHeroReveal(event)
          }}
          onPointerUp={(event) => {
            if (event.pointerType === 'touch') hideHeroReveal()
          }}
          onPointerCancel={hideHeroReveal}
          onPointerLeave={hideHeroReveal}
        >
          <div
            ref={heroMediaRef}
            className="hero-media"
            aria-hidden="true"
          >
            <img className="hero-img hero-main" src={heroImage} alt="" decoding="async" fetchPriority="high" />
            <img className="hero-img hero-alt" src={backgroundImage} alt="" decoding="async" />
          </div>
          <div
            className="photo"
            style={{ position: 'absolute', inset: 0, '--img': 'url("/assets/images/hero.jpg")' }}
          ></div>
          <div className="hero-content">
            <h1>
              <span className="hero-static">Pernahkah kamu</span>{' '}
              <span
                className={`hero-changing${isHeroChanging ? ' is-changing' : ''}`}
                aria-live="polite"
              >
                {heroPhrases[heroPhraseIndex]}
              </span>
            </h1>
            <p>
              Every piece of waste tells a story. Discover where it goes,
              understand its impact, and explore how better choices can shape a
              cleaner environment.
            </p>
          </div>
        </section>

        <section className="cream">
          <div className="split">
            <div>
              <h2>Sampah tidak hilang. Ia hanya berpindah tempat.</h2>
              <p>
                EcoVera adalah portal edukasi dan galeri dokumentasi lingkungan
                yang membahas satu hal: sampah. Dari apa yang kita buang di dapur,
                sampai ke mana ia berakhir.
              </p>
              <p>
                Kami menyusun penjelasan yang runtut, bersumber dari lembaga
                resmi, supaya setiap orang bisa memahami masalahnya sebelum
                memutuskan apa yang ingin diubah.
              </p>
            </div>
            <div
              className="photo"
              style={{ '--img': 'url("/assets/images/intro.jpg")' }}
              aria-hidden="true"
            ></div>
          </div>
        </section>

        <section className="olive">
          <h2>Masalahnya ada di cara kita memperlakukan barang</h2>
          <div className="cols">
            <div className="rv">
              <span className="icon-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2m-9 4v8m5-8v8m5-8v8M5 6l1 14h12l1-14" /></svg>
              </span>
              <h3>Dibuang tanpa dipilah</h3>
              <p>
                Sampah organik, plastik, dan limbah berbahaya rumah tangga
                bercampur. Akibatnya bahan yang masih bisa diolah ikut tertimbun.
              </p>
            </div>
            <div className="rv">
              <span className="icon-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </span>
              <h3>Dipakai sekali</h3>
              <p>
                Kemasan sekali pakai menghabiskan bahan baku untuk fungsi yang
                singkat, lalu menjadi beban pengelolaan yang panjang.
              </p>
            </div>
            <div className="rv">
              <span className="icon-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              </span>
              <h3>Tidak terlihat</h3>
              <p>
                Setelah truk pengangkut pergi, banyak orang tidak tahu ke mana
                sampahnya berakhir. Karena itu masalahnya terasa jauh.
              </p>
            </div>
          </div>
        </section>

        <section className="lime">
          <h2>Fakta dasar tentang sampah</h2>
          <div className="cols">
            <div>
              <span className="icon-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
              </span>
              <h3>Organik yang tertimbun</h3>
              <p>
                Sampah makanan yang membusuk tanpa oksigen di tempat pembuangan
                menghasilkan metana, gas rumah kaca. Dikomposkan, bahan yang sama
                menjadi pupuk.
              </p>
            </div>
            <div>
              <span className="icon-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" /><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" /><path d="m14 16-3 3 3 3" /><path d="M8.293 13.596 7.196 9.5 3.1 10.598" /><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" /><path d="m13.378 9.633 4.096 1.098 1.097-4.096" /></svg>
              </span>
              <h3>Plastik bertahan lama</h3>
              <p>
                Plastik tidak membusuk seperti daun. Ia terpecah menjadi serpihan
                kecil (mikroplastik) yang tetap berada di tanah dan air.
              </p>
            </div>
            <div>
              <span className="icon-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              </span>
              <h3>Data resmi tersedia</h3>
              <p>
                Angka timbulan sampah nasional per tahun dipublikasikan di SIPSN,
                Kementerian Lingkungan Hidup. Rujuk langsung ke sana untuk angka
                terbaru.
              </p>
            </div>
          </div>
        </section>

        <section className="mintbg">
          <h2>Memahami jenis sampah</h2>
          <div className="cols">
            <div><h3>Organik</h3><p>Sisa makanan, daun, ranting. Bisa dikomposkan.</p></div>
            <div><h3>Anorganik</h3><p>Plastik, kaca, logam, kertas. Sebagian besar dapat didaur ulang bila bersih dan terpisah.</p></div>
            <div><h3>B3 rumah tangga</h3><p>Baterai, lampu, obat kedaluwarsa, pestisida. Perlu penanganan khusus.</p></div>
            <div><h3>Residu</h3><p>Sisa yang tidak bisa diolah lagi, misalnya popok dan puntung rokok.</p></div>
          </div>
          <p style={{ marginTop: '2rem' }}>
            <a className="btn" href="content.html#jenis">Baca selengkapnya</a>
          </p>
        </section>

        <section className="green">
          <div className="split">
            <div
              className="photo"
              style={{ '--img': 'url("/assets/images/impact.jpg")' }}
              aria-hidden="true"
            ></div>
            <div>
              <h2>Dampaknya sampai ke ekosistem</h2>
              <p>
                Sampah yang bocor dari pengelolaan mengalir lewat selokan dan
                sungai ke laut. Hewan dapat menelan atau terjerat sampah,
                sementara air dan tanah menerima zat yang dilepaskannya.
              </p>
              <p>
                Di sisi lain, sampah yang menumpuk di permukiman memicu banjir
                akibat saluran tersumbat dan memengaruhi kesehatan warga sekitar.
              </p>
            </div>
          </div>
        </section>

        <section className="cream">
          <h2>Pengelolaan yang lebih baik dimulai dari rumah</h2>
          <p className="big" style={{ marginTop: '1.5rem' }}>
            Kurangi. Gunakan ulang. Daur ulang. Dalam urutan itu.
          </p>
          <p style={{ marginTop: '1.2rem' }}>
            Mengurangi sampah di sumber lebih efektif daripada mengolahnya setelah
            menumpuk. Pemilahan di rumah membuat tahap berikutnya jauh lebih
            mudah.
          </p>
          <p style={{ marginTop: '1.5rem' }}>
            <a className="btn" href="content.html#3r">Pelajari 3R</a>
          </p>
        </section>

        <section className="olive" style={{ textAlign: 'center', alignItems: 'center' }}>
          <p
            className="mission"
            style={{ maxWidth: '20ch', fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--white)' }}
          >
            Building awareness today for a more responsible tomorrow.
          </p>
        </section>
      </main>

      <section className="free cream">
        <h2>Galeri dokumentasi</h2>
        <p style={{ margin: '1rem 0 1.5rem' }}>
          Potret lingkungan dan pengelolaan sampah yang kami kumpulkan.
        </p>
        <a className="btn" href="gallery.html">Buka galeri</a>
      </section>

      <section className="free green" style={{ textAlign: 'center' }}>
        <h2>Mulai dari satu kebiasaan</h2>
        <p style={{ margin: '1rem auto 1.5rem' }}>
          Pilih satu hal yang bisa Anda ubah minggu ini, lalu bagikan ke orang di
          sekitar Anda.
        </p>
        <a className="btn white" href="contact.html">Hubungi kami</a>
      </section>

      <footer>
        <div>
          <a className="logo" href="index.html">EcoVera</a>
          <p>Portal edukasi dan galeri dokumentasi lingkungan tentang sampah.</p>
        </div>
        <p>Tim: [isi nama tim] — Anggota: [isi nama anggota]<br />Karya lomba Technoversary Vol. II</p>
      </footer>
      <ButterflyCursor />
    </>
  )
}

export default App

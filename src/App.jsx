import { useEffect, useRef, useState } from 'react'
import heroImage from '../assets/images/hero.png'
import backgroundImage from '../assets/images/background.png'
import ButterflyCursor from './ButterflyCursor.jsx'
import ScrollText from './ScrollText.jsx'
import useScrollProgress from './useScrollProgress.js'
import useHorizontalReel from './useHorizontalReel.js'
import '../css/style.css'

// Ambil foto berdasarkan nama tanpa terikat ekstensi (png/jpg/jpeg),
// supaya rename atau konversi file tidak mematahkan halaman.
const photoFiles = import.meta.glob(
  '../assets/images/{Foto1,Foto2,Foto4,Foto7,Foto10,Foto11,foto8,foto16}.{png,jpg,jpeg}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

const photo = (name) => {
  const path = Object.keys(photoFiles).find((file) =>
    new RegExp(`/${name}\\.(png|jpe?g)$`, 'i').test(file),
  )
  return path ? photoFiles[path] : heroImage
}

const collectPhoto = photo('Foto1')
const sortingPhoto = photo('Foto11')
const riverPhoto = photo('Foto8')
const underwaterPhoto = photo('foto16')
const compostPhoto = photo('Foto2')
const scrapsPhoto = photo('Foto4')
const bottlePhoto = photo('Foto10')
const pilePhoto = photo('Foto7')

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

const tickerItems = [
  'Sampah tidak hilang',
  'Hanya berpindah',
  'Pilah di rumah',
  'Kurangi sejak sumber',
  'Gunakan ulang',
  'Daur ulang',
]

const reelItems = [
  { src: pilePhoto, caption: 'Tumpukan di ujung jalan', place: 'Permukiman' },
  { src: sortingPhoto, caption: 'Bak yang meluap', place: 'Tempat pembuangan' },
  { src: riverPhoto, caption: 'Sungai yang menanggung sisanya', place: 'Hilir' },
  { src: underwaterPhoto, caption: 'Plastik di dalam air', place: 'Perairan' },
  { src: bottlePhoto, caption: 'Botol yang masih berguna', place: 'Bank sampah' },
  { src: compostPhoto, caption: 'Sisa yang menjadi tanah', place: 'Pengomposan' },
]

function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <div className="ticker-group" key={copy}>
            {tickerItems.map((item) => (
              <span key={item}>
                {item}
                <b>✳</b>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Reel({ sectionRef, trackRef }) {
  return (
    <section className="reel" ref={sectionRef} aria-labelledby="reel-title">
      <div className="reel-viewport">
        <div className="reel-track" ref={trackRef}>
          <article className="reel-lead">
            <span className="reel-eyebrow">Arsip visual · 01—06</span>
            <h2 id="reel-title">
              Potret yang jarang <em>masuk berita.</em>
            </h2>
            <p>
              Enam bingkai dari perjalanan sampah: dari bak yang meluap sampai
              sisa dapur yang kembali menjadi tanah.
            </p>
            <span className="reel-cue" aria-hidden="true">
              Telusuri arsip <b>→</b>
            </span>
          </article>

          {reelItems.map(({ src, caption, place }, index) => (
            <figure className="reel-frame" key={caption}>
              <div className="reel-frame-media">
                <img src={src} alt={caption} loading="lazy" decoding="async" />
              </div>
              <figcaption>
                <span className="reel-frame-no">{String(index + 1).padStart(2, '0')}</span>
                <span className="reel-frame-caption">{caption}</span>
                <span className="reel-frame-place">{place}</span>
              </figcaption>
            </figure>
          ))}

          <article className="reel-end">
            <span className="reel-eyebrow">Lanjutkan</span>
            <p>Tujuh bingkai lain menunggu di galeri.</p>
            <a className="link-arrow" href="gallery.html">
              Buka galeri <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>
        <div className="reel-bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  )
}

function ChapterHead({ number, label, note }) {
  return (
    <header className="ch-head">
      <span className="ch-no">{number}</span>
      <span className="ch-label">{label}</span>
      <span className="ch-note">{note}</span>
    </header>
  )
}

function RoundBadge() {
  return (
    <div className="round-badge" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <path
            id="round-badge-path"
            d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
          />
        </defs>
        <text>
          <textPath href="#round-badge-path" textLength="262" lengthAdjust="spacing">
            PILAH · OLAH · GUNAKAN ·
          </textPath>
        </text>
      </svg>
      <span>✳</span>
    </div>
  )
}

function App() {
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0)
  const [isHeroChanging, setIsHeroChanging] = useState(false)
  const heroMediaRef = useRef(null)
  const heroTargetRef = useRef({ x: 0, y: 0, radius: 0 })
  const heroPositionRef = useRef({ x: 0, y: 0, radius: 0 })
  const heroFrameRef = useRef(null)
  const photoStageRef = useRef(null)
  const reelSectionRef = useRef(null)
  const reelTrackRef = useRef(null)
  const ch2BgRef = useRef(null)
  const ch3MediaRef = useRef(null)
  const ch4MediaRef = useRef(null)
  const ch5MediaRef = useRef(null)
  const [introCount, setIntroCount] = useState(0)
  const [isIntroVisible, setIsIntroVisible] = useState(
    () =>
      !sessionStorage.getItem('ev') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [isIntroExiting, setIsIntroExiting] = useState(false)

  useEffect(() => {
    let frameId = 0

    const updateNavigation = () => {
      frameId = 0
      document.querySelector('nav.top')?.classList.toggle('is-solid', window.scrollY > 60)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0
      document.documentElement.style.setProperty('--page-progress', progress.toFixed(4))
    }

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateNavigation)
    }

    updateNavigation()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
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
    const sections = document.querySelectorAll('main > section, body > section, #root > section')
    sections.forEach((section) => {
      if (section.classList.contains('hero')) return
      section.classList.add('rv')
    })
    document.querySelectorAll('.rv').forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  useScrollProgress(photoStageRef)
  useScrollProgress(ch2BgRef)
  useScrollProgress(ch3MediaRef)
  useScrollProgress(ch4MediaRef)
  useScrollProgress(ch5MediaRef)
  useHorizontalReel(reelSectionRef, reelTrackRef)

  useEffect(() => {
    if (!isIntroVisible) return undefined

    let value = 0
    const counter = window.setInterval(() => {
      value = Math.min(100, value + Math.max(1, Math.ceil((100 - value) / 7)))
      setIntroCount(value)
      if (value >= 100) window.clearInterval(counter)
    }, 55)

    return () => window.clearInterval(counter)
  }, [isIntroVisible])

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
      <div className="page-progress" aria-hidden="true" />

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
          <div className="intro-word">
            {'EcoVera'.split('').map((letter, index) => (
              <span key={`${letter}-${index}`} style={{ animationDelay: `${index * 70}ms` }}>
                {letter}
              </span>
            ))}
          </div>
          <div className="intro-meter">
            <b className="intro-count">{String(introCount).padStart(3, '0')}</b>
            <small className="intro-label">Memuat arsip</small>
            <i className="intro-rule" style={{ transform: `scaleX(${introCount / 100})` }} />
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

        <Ticker />

        <section className="manifesto" aria-labelledby="manifesto-title">
          <div className="manifesto-meta">
            <span>EcoVera</span>
            <span>Pilah · Olah · Guna</span>
            <span>2026</span>
          </div>
          <ScrollText
            as="h2"
            id="manifesto-title"
            className="manifesto-quote"
            text="Sampah tidak pernah benar-benar pergi. Ia berpindah, lalu menunggu keputusan kita."
          />
          <div className="manifesto-foot">
            <span>Gulir untuk menelusuri</span>
            <span className="manifesto-line" aria-hidden="true" />
            <span aria-hidden="true">06 bab</span>
          </div>
        </section>

        <section className="chapter ch-bone ch1" id="jejak">
          <ChapterHead number="01" label="Jejak" note="Sumber → Tempat pengolahan" />
          <div className="ch1-grid">
            <div className="ch-copy">
              <h2 className="ch-title">
                <span className="ch-kicker">Pernahkah Kamu</span>{' '}
                Berpikir ke Mana Perginya <em>Sampahmu?</em>
              </h2>
              <ScrollText text="Setelah dibuang, sampah tidak serta-merta menghilang. Sampah akan dikumpulkan dan dibawa ke tempat pengolahan untuk dipilah. Sebagian dapat didaur ulang, sampah organik bisa diolah menjadi kompos, sedangkan sisanya dapat berakhir di tempat pemrosesan akhir. Sayangnya, tidak semua sampah berhasil dikelola dengan baik." />
              <div className="ch1-steps" aria-label="Alur sampah">
                <span><b>01</b> Dibuang</span>
                <span><b>02</b> Dipilah</span>
                <span><b>03</b> Diolah</span>
              </div>
            </div>
            <div className="ch1-media" ref={photoStageRef}>
              <figure className="ch1-main">
                <img src={riverPhoto} alt="Sungai yang penuh sampah plastik" loading="lazy" decoding="async" />
                <figcaption>Sungai yang menanggung sisanya</figcaption>
              </figure>
              <figure className="ch1-inset">
                <img src={sortingPhoto} alt="Bak sampah lingkungan yang meluap" loading="lazy" decoding="async" />
              </figure>
              <span className="ch1-sticker">Sampah tidak hilang</span>
            </div>
          </div>
        </section>

        <section className="chapter ch-forest ch-cinema ch2" id="tanpa-sampah">
          <div className="ch-bg" aria-hidden="true" ref={ch2BgRef}>
            <img src={heroImage} alt="" loading="lazy" decoding="async" />
          </div>
          <ChapterHead number="02" label="Tanpa Sampah" note="Sebuah kemungkinan" />
          <div className="ch2-body">
            <h2 className="ch-title">
              <span className="ch-kicker">Pernahkah Kamu</span>{' '}
              Membayangkan Bumi <em>Tanpa Sampah?</em>
            </h2>
            <div className="glass-copy">
              <ScrollText text="Bayangkan sungai yang jernih, laut yang bebas dari tumpukan sampah, dan udara yang lebih bersih. Bumi seperti itu tentu menjadi harapan banyak orang. Sayangnya, sampah yang terus dihasilkan dan tidak dikelola dengan baik dapat merusak keindahan alam serta mengancam kehidupan makhluk hidup. Bumi yang lebih bersih membutuhkan perubahan cara kita memperlakukan lingkungan." />
            </div>
          </div>
        </section>

        <Reel sectionRef={reelSectionRef} trackRef={reelTrackRef} />

        <section className="chapter ch-acid ch3" id="waktu">
          <ChapterHead number="03" label="Waktu" note="Sisa makanan · Plastik · Kaca · Logam" />
          <div className="ch3-grid">
            <div className="ch3-copy">
              <h2 className="ch-title">
                <span className="ch-kicker">Pernahkah Kamu</span>{' '}
                Tahu Berapa Lama Sampah <em>Terurai?</em>
              </h2>
              <ScrollText text="Tidak semua sampah dapat terurai dengan mudah. Sisa makanan dan daun dapat membusuk secara alami, sedangkan plastik, kaca, dan logam membutuhkan waktu jauh lebih lama. Bahkan, plastik dapat pecah menjadi bagian-bagian kecil yang disebut mikroplastik dan tetap mencemari lingkungan. Artinya, sampah yang kita buang hari ini bisa menjadi masalah bagi lingkungan dalam jangka panjang." />
              <ul className="chips" aria-label="Jenis material">
                <li>Sisa makanan</li>
                <li>Plastik</li>
                <li>Kaca</li>
                <li>Logam</li>
              </ul>
            </div>
            <figure className="ch3-media" ref={ch3MediaRef}>
              <img src={underwaterPhoto} alt="Kantong plastik mengambang di dalam air" loading="lazy" decoding="async" />
              <figcaption>
                <span>Mikroplastik</span>
                <span>Bertahan lebih lama</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="chapter ch-bone ch4" id="nilai">
          <ChapterHead number="04" label="Nilai" note="Pilah → Olah → Guna" />
          <div className="ch4-grid">
            <div className="ch4-media" ref={ch4MediaRef}>
              <figure className="ch4-main">
                <img src={compostPhoto} alt="Tangan menggenggam kompos dari sisa sayuran" loading="lazy" decoding="async" />
              </figure>
              <figure className="ch4-inset">
                <img src={scrapsPhoto} alt="Sisa sayuran di wadah kompos" loading="lazy" decoding="async" />
              </figure>
              <RoundBadge />
            </div>
            <div className="ch4-copy">
              <h2 className="ch-title">
                <span className="ch-kicker">Pernahkah Kamu</span>{' '}
                Melihat Nilai di Balik <em>Sampah?</em>
              </h2>
              <ScrollText text="Sesuatu yang dianggap tidak berguna ternyata masih bisa memiliki manfaat. Botol plastik dapat diolah menjadi bahan baru, kertas bekas bisa didaur ulang, dan sisa makanan dapat dimanfaatkan menjadi kompos. Melalui pemilahan dan pengolahan yang tepat, sampah tidak hanya berakhir sebagai limbah, tetapi juga dapat menjadi sumber daya yang memiliki nilai guna." />
              <div className="ch4-tags">
                <a href="content.html#3r">
                  Botol plastik <b>→ Bahan baru</b>
                </a>
                <a href="content.html#3r">
                  Kertas bekas <b>→ Didaur ulang</b>
                </a>
                <a href="content.html#kelola">
                  Sisa makanan <b>→ Kompos</b>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="chapter ch-forest ch5" id="arah">
          <ChapterHead number="05" label="Arah" note="Kebiasaan kecil, dampak besar" />
          <div className="ch5-grid">
            <div className="ch5-copy">
              <h2 className="ch-title">
                <span className="ch-kicker">Pernahkah Kamu</span>{' '}
                Membayangkan Bumi yang <em>Lebih Bersih?</em>
              </h2>
              <ScrollText text="Bumi yang lebih bersih bukan hanya tentang pemandangan yang indah, tetapi juga lingkungan yang sehat bagi seluruh makhluk hidup. Kita dapat memulainya dengan mengurangi plastik sekali pakai, memilah sampah, menggunakan kembali barang yang masih layak, dan menjaga kebersihan sekitar. Perubahan tidak harus dimulai dari hal besar, karena kebiasaan sederhana yang dilakukan bersama dapat membawa dampak positif bagi bumi." />
              <a className="link-arrow" href="#aksi">
                Lanjut ke aksi <span aria-hidden="true">↓</span>
              </a>
            </div>
            <figure className="ch5-media" ref={ch5MediaRef}>
              <img src={collectPhoto} alt="Tangan mengambil botol plastik ke dalam kantong sampah" loading="lazy" decoding="async" />
              <figcaption>
                <span>05</span>
                <span>Mulai dari satu langkah</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="chapter ch-bone ch6" id="aksi">
          <ChapterHead number="06" label="Aksi" note="Urutan yang paling efektif" />
          <div className="ch6-top">
            <h2 className="ch-title">
              Pengelolaan yang lebih baik dimulai dari <em>rumah</em>
            </h2>
            <p className="ch6-lead">
              Mengurangi sampah di sumber lebih efektif daripada mengolahnya setelah
              menumpuk. Pemilahan di rumah membuat tahap berikutnya jauh lebih mudah.
            </p>
          </div>
          <ol className="r3-list">
            {[
              ['01', 'Kurangi'],
              ['02', 'Gunakan ulang'],
              ['03', 'Daur ulang'],
            ].map(([number, word]) => (
              <li key={number}>
                <a href="content.html#3r" aria-label={`${word} — pelajari 3R`}>
                  <span className="r3-num">{number}</span>
                  <span className="r3-word">{word}</span>
                  <span className="r3-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="ch6-foot">
            <p className="ch6-note">Dalam urutan itu.</p>
            <a className="btn" href="content.html#3r">Pelajari 3R</a>
          </div>
        </section>

        <section className="chapter ch-mission">
          <span className="mission-eyebrow">Misi kami</span>
          <ScrollText
            as="p"
            className="mission-quote"
            text="Building awareness today for a more responsible tomorrow."
          />
          <div className="mission-foot">
            <span>EcoVera</span>
            <a href="#main">Kembali ke atas ↑</a>
          </div>
        </section>
      </main>

      <section className="free home-finale">
        <div className="finale-grid">
          <article className="finale-card">
            <span className="finale-index">01 / Galeri</span>
            <h2>Galeri dokumentasi</h2>
            <p>Potret lingkungan dan pengelolaan sampah yang kami kumpulkan.</p>
            <div className="finale-strip" aria-hidden="true">
              <img src={pilePhoto} alt="" loading="lazy" decoding="async" />
              <img src={compostPhoto} alt="" loading="lazy" decoding="async" />
              <img src={bottlePhoto} alt="" loading="lazy" decoding="async" />
            </div>
            <a className="link-arrow" href="gallery.html">
              Buka galeri <span aria-hidden="true">↗</span>
            </a>
          </article>
          <article className="finale-card finale-card--acid">
            <span className="finale-index">02 / Aksi</span>
            <h2>Mulai dari satu kebiasaan</h2>
            <p>
              Pilih satu hal yang bisa Anda ubah minggu ini, lalu bagikan ke orang di
              sekitar Anda.
            </p>
            <span className="finale-mark" aria-hidden="true">✳</span>
            <a className="link-arrow" href="contact.html">
              Hubungi kami <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-top">
          <div>
            <a className="footer-logo" href="index.html">EcoVera</a>
            <p>Portal edukasi dan galeri dokumentasi lingkungan tentang sampah.</p>
          </div>
          <nav className="footer-nav" aria-label="Navigasi footer">
            {pages.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>
          <a className="footer-contact" href="contact.html">
            Hubungi kami <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="footer-bottom">
          <p>Tim: Strawberry Flavour</p>
          <p>Karya lomba Technoversary Vol. II</p>
        </div>
      </footer>
      <ButterflyCursor />
    </>
  )
}

export default App

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
              <h2>Pernahkah Kamu Berpikir ke Mana Perginya Sampahmu?</h2>
              <p>
                Setelah dibuang, sampah tidak serta-merta menghilang. Sampah akan dikumpulkan dan dibawa ke tempat pengolahan untuk dipilah.
                Sebagian dapat didaur ulang, sampah organik bisa diolah menjadi kompos, sedangkan sisanya dapat berakhir di tempat pemrosesan akhir. Sayangnya, tidak semua sampah berhasil dikelola dengan baik.
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
          <h2>Pernahkah Kamu Membayangkan Bumi Tanpa Sampah?</h2>
          <div className="cols">
            <div className="rv">
              <p>
                Bayangkan sungai yang jernih, laut yang bebas dari tumpukan sampah, dan udara yang lebih bersih. Bumi seperti itu tentu menjadi harapan banyak orang.
                Sayangnya, sampah yang terus dihasilkan dan tidak dikelola dengan baik dapat merusak keindahan alam serta mengancam kehidupan makhluk hidup. Bumi yang lebih bersih membutuhkan perubahan cara kita memperlakukan lingkungan.
              </p>
            </div>
          </div>
        </section>

        <section className="lime">
          <h2>Pernahkah Kamu Tahu Berapa Lama Sampah Terurai?</h2>
          <div className="cols">
            <div>
              <p>
                Tidak semua sampah dapat terurai dengan mudah. Sisa makanan dan daun dapat membusuk secara alami, sedangkan plastik, kaca, dan logam membutuhkan waktu jauh lebih lama. Bahkan, plastik dapat pecah menjadi bagian-bagian kecil yang disebut mikroplastik dan tetap mencemari lingkungan. Artinya, sampah yang kita buang hari ini bisa menjadi masalah bagi lingkungan dalam jangka panjang.
              </p>
            </div>
          </div>
        </section>

        <section className="mintbg">
          <h2>Pernahkah Kamu Melihat Nilai di Balik Sampah?</h2>
          <div className="cols">
            <div>
              <p>
                Sesuatu yang dianggap tidak berguna ternyata masih bisa memiliki manfaat. Botol plastik dapat diolah menjadi bahan baru, kertas bekas bisa didaur ulang, dan sisa makanan dapat dimanfaatkan menjadi kompos. Melalui pemilahan dan pengolahan yang tepat,
                sampah tidak hanya berakhir sebagai limbah, tetapi juga dapat menjadi sumber daya yang memiliki nilai guna.
              </p>
            </div>
          </div>
        </section>

        <section className="green">
          <div className="split">
            <div>
              <h2>Pernahkah Kamu Membayangkan Bumi yang Lebih Bersih?</h2>
              <p>
               Bumi yang lebih bersih bukan hanya tentang pemandangan yang indah, tetapi juga lingkungan yang sehat bagi seluruh makhluk hidup. Kita dapat memulainya dengan mengurangi plastik sekali pakai, memilah sampah, menggunakan kembali barang yang masih layak, dan menjaga kebersihan sekitar. Perubahan tidak harus dimulai dari hal besar, karena kebiasaan sederhana yang dilakukan bersama dapat membawa dampak positif bagi bumi.
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

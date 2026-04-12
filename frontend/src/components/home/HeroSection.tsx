import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  useEffect(() => {
    if (!document.querySelector('link[data-sasha-fonts]')) {
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lexend+Deca:wght@300;400;500;600;700;800;900&display=swap'
      l.setAttribute('data-sasha-fonts', 'true')
      document.head.appendChild(l)
    }
    if (!document.querySelector('link[data-fa]')) {
      const fa = document.createElement('link')
      fa.rel = 'stylesheet'
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
      fa.setAttribute('data-fa', 'true')
      document.head.appendChild(fa)
    }
    if (!document.querySelector('link[data-sasha-css]')) {
      const css = document.createElement('link')
      css.rel = 'stylesheet'
      css.href = '/sasha-home.css'
      css.setAttribute('data-sasha-css', 'true')
      document.head.appendChild(css)
    }
    // Three.js loaded via sasha-home.js CDN importmap
    // Always load fresh on mount
    const s = document.createElement('script')
    s.type = 'module'
    s.setAttribute('data-sasha-main', 'true')
    s.src = '/sasha-home.js?' + Date.now()
    document.body.appendChild(s)
    return () => {
      // Clean up canvases and scripts on unmount so they reload on return
      ;['model-canvas','particles-canvas','cursorDot','cursorRing','scrollTop'].forEach(id => {
        document.getElementById(id)?.remove()
      })
      document.querySelector('link[data-sasha-css]')?.remove()
      // Remove script so it reloads fresh when returning to home
      document.querySelector('script[data-sasha-main]')?.remove()
      // importmap cleanup removed
      // Reset window flags so Three.js reinitializes
      if ((window as any).__splashActive !== undefined) {
        (window as any).__splashActive = false
      }
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" id="cursorDot"></div>
      <div className="cursor-ring" id="cursorRing"></div>
      <canvas id="model-canvas"></canvas>
      <canvas id="particles-canvas"></canvas>
      <button className="scroll-top" id="scrollTop"><i className="fa-solid fa-arrow-up"></i></button>

      <section className="hero" id="home">
        <div className="hero-sticky">
          <div className="hero-text-left" id="heroLeft">
            <div className="hero-tag"><i className="fa-solid fa-bolt"></i> Learn what you need</div>
            <h1 className="hero-title">
              <span className="brand">SashaInfinity</span> :<br/>
              <span className="highlight">Classical Skills</span> From Our Top Instructors
            </h1>
            <div className="hero-actions">
              <Link to="/courses" className="hero-btn hero-btn-fill">
                Explore Courses <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <a href="tel:+918438740893" className="hero-phone">
                <div className="hero-phone-icon"><i className="fa-solid fa-phone"></i></div>
                <div className="hero-phone-info">
                  <span>Have any Question?</span>
                  <strong>+91 8438740893</strong>
                </div>
              </a>
            </div>
          </div>
          <div className="hero-text-right" id="heroRight">
            <div className="hero-right-tag">Why Choose Us</div>
            <h3 className="hero-right-title">Transform Education with AR/VR Innovation</h3>
            <p className="hero-right-desc">An Edtech that provides Hybrid tutoring and data-driven personalized learning for K12 and College Students across India.</p>
            <div className="hero-right-stats">
              <div className="hero-right-stat"><div className="num">50+</div><div className="lbl">Students</div></div>
              <div className="hero-right-stat"><div className="num">70+</div><div className="lbl">Lessons</div></div>
              <div className="hero-right-stat"><div className="num">5+</div><div className="lbl">Tutors</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="velocity-row"><div className="velocity-track" id="velocityRow1"></div></div>
        <div className="velocity-row"><div className="velocity-track" id="velocityRow2"></div></div>
      </section>
    </>
  )
}

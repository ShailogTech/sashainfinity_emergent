import { useEffect, useRef, useState } from "react";
import { SashaTutor } from '@/components/core/SashaTutor';
import { useSashaAnimator } from '@/hooks/core/useSashaAnimator';
import { Link } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import DashboardDemo from '@/components/ui/DashboardDemo';
import ParallaxContainer from '@/components/ui/ParallaxContainer';
import ParallaxShowcase from '@/components/ui/ParallaxShowcase';
import GlassCard from '@/components/ui/GlassCard';

function HeroSection({ canvasRef }) {
  return (
    <section className="sasha-hero" id="home" data-testid="hero-section">
      <div className="hero-sticky">
        <div className="hero-text-left" id="heroLeft">
          <div className="hero-tag"><i className="fa-solid fa-bolt"></i> Learn what you need</div>
          <h1 className="hero-title">
            <span className="brand">SashaInfinity</span> :<br />
            <span className="highlight">Classical Skills</span> From Our Top Instructors
          </h1>
          <div className="hero-actions">
            <Link to="/courses" className="hero-btn hero-btn-fill" data-testid="explore-courses-btn">
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
          <p className="hero-right-desc">An Edtech that provides Hybrid tutoring &amp; data-driven personalized learning for K12 and College Students across India.</p>
          <div className="hero-right-stats">
            <div className="hero-right-stat"><div className="num">50+</div><div className="lbl">Students</div></div>
            <div className="hero-right-stat"><div className="num">70+</div><div className="lbl">Lessons</div></div>
            <div className="hero-right-stat"><div className="num">5+</div><div className="lbl">Tutors</div></div>
          </div>
        </div>
        <div className="scroll-hint">
          <div className="scroll-mouse"></div>
          <span>Scroll</span>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);

  useEffect(() => {
    const row1Data = [
      { num: "50+", label: "Students Enrolled" },
      { num: "70+", label: "Top Lessons" },
      { num: "5+", label: "Expert Tutors" },
      { num: "100+", label: "Pro Videos" },
    ];
    const row2Data = [
      { num: "2+", label: "Years Experience" },
      { num: "38", label: "Certified" },
      { num: "100%", label: "Satisfaction" },
      { num: "24/7", label: "Support" },
    ];

    function buildRow(el, data, copies) {
      if (!el) return;
      let html = "";
      for (let c = 0; c < copies; c++) {
        data.forEach(d => {
          html += `<div class="velocity-item"><span class="v-num">${d.num.replace("+", '<span class="accent">+</span>').replace("%", '<span class="accent">%</span>')}</span><span class="v-label">${d.label}</span><span class="v-dot"></span></div>`;
        });
      }
      el.innerHTML = html;
    }

    buildRow(row1Ref.current, row1Data, 6);
    buildRow(row2Ref.current, row2Data, 6);

    let vScrollY = 0, vLastScroll = 0, vVelocity = 0, vPos1 = 0, vPos2 = 0;
    let w1 = 0, w2 = 0;
    let animId;

    const onScroll = () => { vScrollY = window.scrollY; };
    window.addEventListener("scroll", onScroll);

    requestAnimationFrame(() => {
      if (row1Ref.current) w1 = row1Ref.current.scrollWidth / 6;
      if (row2Ref.current) w2 = row2Ref.current.scrollWidth / 6;
    });

    function animateVelocity() {
      animId = requestAnimationFrame(animateVelocity);
      const scrollDelta = vScrollY - vLastScroll;
      vLastScroll = vScrollY;
      vVelocity += (scrollDelta - vVelocity) * 0.08;
      const speed = vVelocity * 0.8;
      vPos1 -= speed;
      vPos2 += speed;
      if (w1 > 0) { if (vPos1 <= -w1) vPos1 += w1; if (vPos1 > 0) vPos1 -= w1; }
      if (w2 > 0) { if (vPos2 <= -w2) vPos2 += w2; if (vPos2 > 0) vPos2 -= w2; }
      if (row1Ref.current) row1Ref.current.style.transform = `translateX(${vPos1}px)`;
      if (row2Ref.current) row2Ref.current.style.transform = `translateX(${vPos2}px)`;
    }
    animateVelocity();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section className="sasha-stats-bar" data-testid="stats-bar">
      <div className="velocity-row"><div className="velocity-track" ref={row1Ref}></div></div>
      <div className="velocity-row"><div className="velocity-track" ref={row2Ref}></div></div>
    </section>
  );
}

function ScrollStackSection() {
  const cards = [
    { icon: "fa-solid fa-vr-cardboard", title: "Immersive AR/VR Learning", desc: "Experience mathematics like never before with our cutting-edge Augmented and Virtual Reality modules. Visualize complex concepts in 3D and interact with mathematical models in real-time.", stats: [{ n: "100+", l: "AR Models" }, { n: "3D", l: "Visualization" }, { n: "Real-time", l: "Interaction" }] },
    { icon: "fa-solid fa-brain", title: "Personalized Learning Paths", desc: "Our AI-driven platform creates customized learning journeys for each student. Adaptive quizzes, progress tracking, and data-driven insights ensure every learner reaches their full potential.", stats: [{ n: "AI", l: "Powered" }, { n: "50+", l: "Students" }, { n: "98%", l: "Satisfaction" }] },
    { icon: "fa-solid fa-school", title: "Hybrid Tutoring Centers", desc: "Combining the best of online and offline education. Our hybrid centers in tier 2 and tier 3 cities provide hands-on guidance with the flexibility of digital learning tools.", stats: [{ n: "5+", l: "Expert Tutors" }, { n: "70+", l: "Lessons" }, { n: "24/7", l: "Support" }] },
    { icon: "fa-solid fa-chart-line", title: "Analytics & Data Science", desc: "Go beyond traditional math education with our analytics courses. Learn data science, visualization, and real-world problem solving skills that prepare you for the future of work.", stats: [{ n: "10+", l: "Courses" }, { n: "Pro", l: "Certification" }, { n: "100+", l: "Videos" }] },
  ];

  return (
    <section className="sasha-scroll-stack-section" data-testid="scroll-stack-section">
      <div className="scroll-stack-inner">
        <div className="scroll-stack-header">
          <div className="section-label" style={{ justifyContent: "center" }}>Why SashaInfinity</div>
          <h2>What Makes Us Different</h2>
          <p>Discover how we're transforming education with cutting-edge technology and personalized learning.</p>
        </div>
        {cards.map((card, i) => (
          <div className="scroll-stack-card" key={i} data-testid={`scroll-card-${i}`}>
            <div className="card-icon"><i className={card.icon}></i></div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <div className="card-stats">
              {card.stats.map((s, j) => (
                <div key={j}><div className="card-stat-num">{s.n}</div><div className="card-stat-label">{s.l}</div></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  const [morphIdx, setMorphIdx] = useState(0);
  const texts = ["The Place Where You Can Achieve", "Immersive AR/VR Learning", "Personalized Education", "Data-Driven Learning Paths", "Hybrid Tutoring Centers"];

  useEffect(() => {
    const interval = setInterval(() => {
      setMorphIdx(prev => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <section className="sasha-about-section" id="about" data-testid="about-section">
      <div className="sasha-container">
        <div className="about-grid">
          <div className="about-visual">
            <div className="about-visual-placeholder">
              <div className="about-exp-badge">
                <div className="year">2+</div>
                <div className="label">Years</div>
              </div>
              <img src="https://sashainfinity.com/wp-content/uploads/2025/06/Untitled-29.7-x-21-cm-e1751107505505.png" alt="About Sashainfinity" />
            </div>
          </div>
          <div className="about-content">
            <div className="section-label">Get To Know About Us</div>
            <div className="morph-container">
              <h2 className="morph-text-display" key={morphIdx}>{texts[morphIdx]}</h2>
            </div>
            <p>Sashainfinity is a pioneering EdTech Company transforming mathematics education for students in tier 2 and tier 3 cities. With cutting-edge AR/VR integration, hybrid tutoring centers and analytics courses.</p>
            <p>Personalized Tutoring by using customized and dedicated LMS module to actively engage students with quizzes and engaging content.</p>
            <ul className="feature-list">
              <li><span className="icon"><i className="fa-solid fa-vr-cardboard"></i></span> Immersive AR/VR Math Learning</li>
              <li><span className="icon"><i className="fa-solid fa-brain"></i></span> Personalized Interactive Quizzes</li>
              <li><span className="icon"><i className="fa-solid fa-school"></i></span> Hybrid Tutoring Centers</li>
              <li><span className="icon"><i className="fa-solid fa-chart-line"></i></span> Analytics Courses for Everyone</li>
              <li><span className="icon"><i className="fa-solid fa-route"></i></span> Custom Learning Paths</li>
            </ul>
            <div className="about-stats">
              <div className="about-stat"><div className="icon-wrap"><i className="fa-solid fa-headset"></i></div><div className="stat-info"><strong>5+ Expert Tutors</strong><span>Dedicated mentors</span></div></div>
              <div className="about-stat"><div className="icon-wrap"><i className="fa-solid fa-file-alt"></i></div><div className="stat-info"><strong>70+ Top Lessons</strong><span>Quality content</span></div></div>
              <div className="about-stat"><div className="icon-wrap"><i className="fa-solid fa-user-graduate"></i></div><div className="stat-info"><strong>50+ Students</strong><span>And growing</span></div></div>
              <div className="about-stat"><div className="icon-wrap"><i className="fa-solid fa-video"></i></div><div className="stat-info"><strong>100+ Pro Videos</strong><span>Learn anywhere</span></div></div>
            </div>
            <Link to="/courses" className="hero-btn hero-btn-fill" style={{ marginTop: 28 }} data-testid="about-discover-btn">
              Discover More <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="sasha-categories-section" id="categories" data-testid="categories-section">
      <div className="sasha-container">
        <div className="categories-top">
          <div>
            <div className="section-label">Unique Online Courses</div>
            <h2>Browse By Categories</h2>
            <Link to="/courses" className="hero-btn hero-btn-fill" style={{ marginTop: 24 }} data-testid="all-categories-btn">
              All Categories <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <div className="categories-grid">
            <Link to="/meiporul-ar" className="category-card" data-testid="category-meiporul">
              <div className="category-icon"><i className="fa-solid fa-rocket"></i></div>
              <h3>Meiporul</h3>
              <span>06 Courses</span>
            </Link>
            <Link to="/courses" className="category-card" data-testid="category-seyappaduporul">
              <div className="category-icon"><i className="fa-solid fa-sun"></i></div>
              <h3>Seyappaduporul</h3>
              <span>08 Courses</span>
            </Link>
            <Link to="/courses" className="category-card" data-testid="category-utporul">
              <div className="category-icon"><i className="fa-solid fa-lightbulb"></i></div>
              <h3>Utporul</h3>
              <span>13 Courses</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardSwapSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const cards = [
    { icon: "fa-solid fa-vr-cardboard", title: "AR/VR Learning", desc: "Immersive augmented and virtual reality experiences that bring complex concepts to life in 3D.", tag: "Immersive" },
    { icon: "fa-solid fa-brain", title: "AI Personalized Paths", desc: "Smart learning paths powered by AI that adapt to each student's pace, strengths and areas to improve.", tag: "AI Powered" },
    { icon: "fa-solid fa-chalkboard-user", title: "Hybrid Tutoring", desc: "The best of online and offline education combined. Expert tutors guide you through every concept.", tag: "Hybrid" },
    { icon: "fa-solid fa-chart-line", title: "Analytics & Data", desc: "Track progress with detailed analytics dashboards. Data-driven insights help optimize the learning journey.", tag: "Data Driven" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <section className="sasha-card-swap-section" data-testid="card-swap-section">
      <div className="sasha-container">
        <div className="card-swap-layout">
          <div className="card-swap-content">
            <div className="section-label">What We Offer</div>
            <h2>Discover Our Learning Programs</h2>
            <p>From AR/VR immersive lessons to personalized tutoring, explore programs designed to make learning engaging, effective, and fun for every student.</p>
            <Link to="/courses" className="hero-btn hero-btn-fill" data-testid="view-programs-btn">
              View All Programs <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <div className="card-swap-display">
            {cards.map((card, i) => (
              <div key={i} className={`swap-card-item ${i === activeIdx ? "active" : ""}`} style={{ "--card-index": i }} data-testid={`swap-card-${i}`}>
                <div className="swap-card-icon"><i className={card.icon}></i></div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <div className="swap-card-footer">
                  <span className="swap-card-tag">{card.tag}</span>
                  <div className="swap-card-arrow"><i className="fa-solid fa-arrow-right"></i></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  const [current, setCurrent] = useState(0);
  const testimonials = [
    { text: "Hi, this is Annamalai Venkatachalam. I have completed the Sasha Infinity course, which had excellent content and wonderful teaching methods.", author: "Annamalai Venkatachalam", role: "Student" },
    { text: "I am very satisfied with this course. Topics are very clear and the teaching methodology is excellent.", author: "Durkka P", role: "Student" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="sasha-testimonial-section" data-testid="testimonial-section">
      <div className="sasha-container">
        <div className="section-header">
          <div className="section-label" style={{ justifyContent: "center" }}>Testimonials</div>
          <h2>What Students Say</h2>
        </div>
        <div className="testimonial-card">
          <div className="quote-icon"><i className="fa-solid fa-quote-left"></i></div>
          <div className="testimonial-stars">
            {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
          </div>
          <p className="testimonial-text" key={current}>{testimonials[current].text}</p>
          <div className="testimonial-author">{testimonials[current].author}</div>
          <div className="testimonial-role">{testimonials[current].role}</div>
          <div className="testimonial-nav">
            <button onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)} data-testid="prev-testimonial">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button onClick={() => setCurrent((current + 1) % testimonials.length)} data-testid="next-testimonial">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const team = [
    { role: "Math Specialist", name: "Mathematics Lead", color: "c1" },
    { role: "AR/VR Expert", name: "Tech Lead", color: "c2" },
    { role: "Digital Marketer", name: "Analytics Mentor", color: "c3" },
    { role: "Support Staff", name: "Student Coordinator", color: "c4" },
  ];
  return (
    <section className="sasha-team-section" data-testid="team-section">
      <div className="sasha-container">
        <div className="section-header">
          <div className="section-label" style={{ justifyContent: "center" }}>Our Qualified People Matter</div>
          <h2>Top Class Instructors</h2>
        </div>
        <div className="team-grid">
          {team.map((t, i) => (
            <div className="team-card" key={i} data-testid={`team-card-${i}`}>
              <div className={`team-card-img ${t.color}`}><i className="fa-solid fa-user"></i></div>
              <div className="team-card-info"><div className="role">{t.role}</div><h4>{t.name}</h4></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="sasha-cta-section" data-testid="cta-section">
      <div className="sasha-container">
        <div className="cta-box">
          <div>
            <h2>Join Us &amp; Spread<br />Experiences</h2>
            <p>Join SashaInfinity and experience the future of education with AR/VR powered courses, personalized learning, and expert guidance.</p>
          </div>
          <Link to="/get-started" className="hero-btn hero-btn-fill" data-testid="cta-instructor-btn">
            Become an Instructor <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlogPreviewSection() {
  const blogs = [
    { slug: "modulus-of-a-complex-number", title: "Modulus of a Complex Number", tag: "Mathematics", date: "Nov 21, 2025", gradient: "linear-gradient(135deg, #667EEA, #764BA2)", icon: "fa-solid fa-infinity" },
    { slug: "conjugate-of-a-complex-number", title: "Conjugate of a Complex Number", tag: "Mathematics", date: "Nov 21, 2025", gradient: "linear-gradient(135deg, #F093FB, #F5576C)", icon: "fa-solid fa-right-left" },
    { slug: "basic-algebraic-properties-of-complex-numbers", title: "Basic Algebraic Properties of Complex Numbers", tag: "Mathematics", date: "Nov 21, 2025", gradient: "linear-gradient(135deg, #4FACFE, #00F2FE)", icon: "fa-solid fa-superscript" },
  ];

  return (
    <section className="sasha-blog-section" data-testid="blog-preview-section">
      <div className="sasha-container">
        <div className="section-header">
          <div className="section-label" style={{ justifyContent: "center" }}>Always Smart To Hear News</div>
          <h2>Latest News &amp; Blog</h2>
        </div>
        <div className="blog-grid">
          {blogs.map((b, i) => (
            <Link to={`/blog/${b.slug}`} className="blog-card" key={i} data-testid={`blog-preview-${i}`}>
              <div className="blog-card-thumb" style={{ background: b.gradient }}><i className={b.icon}></i></div>
              <div className="blog-card-body">
                <span className="blog-card-tag">{b.tag}</span>
                <h4>{b.title}</h4>
                <div className="blog-card-meta">
                  <span><i className="fa-solid fa-user"></i> Admin</span>
                  <span><i className="fa-solid fa-calendar"></i> {b.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnersSection() {
  return (
    <section className="sasha-partners-section" data-testid="partners-section">
      <div className="sasha-container">
        <div className="partners-track">
          <img src="https://sashainfinity.com/wp-content/uploads/2025/06/sif-logo-png-e1750397156954.png" alt="Sona Incubations" />
          <img src="https://sashainfinity.com/wp-content/uploads/2025/06/blue-horizontal-3-scaled.png" alt="StartupTN" />
          <img src="https://sashainfinity.com/wp-content/uploads/2025/06/Trueline-lOGO-1-scaled-e1750400158902.png" alt="Trueline Research" />
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="sasha-newsletter-section" data-testid="newsletter-section">
      <div className="sasha-container">
        <h3>Stay Updated</h3>
        <p>Subscribe to our newsletter for the latest updates and courses.</p>
        <form className="newsletter-form" onSubmit={e => e.preventDefault()} data-testid="newsletter-form">
          <input type="email" placeholder="Enter your email" required data-testid="newsletter-email" />
          <button type="submit" data-testid="newsletter-submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

export default function HomePage() {
  const canvasRef = useRef(null);
  const [showTutor, setShowTutor] = useState(true);
  const [sashaMixer, setSashaMixer] = useState(null);
  const [sashaModel, setSashaModel] = useState(null);
  const particlesRef = useRef(null);
  // Sasha animator for tutoring system
  const sashaAnimator = useSashaAnimator(sashaModel, sashaMixer);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);

  // 3D Model
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const isMobileDevice = window.innerWidth <= 768;
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, isMobileDevice ? 0.5 : 1.0, isMobileDevice ? 6 : 6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(3, 8, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xf4911a, 0.5);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0x88bbff, 0.8);
    rimLight.position.set(-1, 4, -8);
    scene.add(rimLight);
    const bottomLight = new THREE.PointLight(0xf4911a, 0.4, 10);
    bottomLight.position.set(0, -2, 2);
    scene.add(bottomLight);

    const groundMat = new THREE.MeshBasicMaterial({ color: 0xf4911a, transparent: true, opacity: 0.05 });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(2.5, 64), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    scene.add(ground);

    let model = null, mixer = null, headBone = null, spineBone = null;
    let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0;
    let scrollY = 0, smoothScroll = 0;

    const onMouseMove = (e) => {
      tMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      tMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll);

    const loader = new GLTFLoader();
    loader.load("/Sasha-Character.glb", (gltf) => {
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const isMobile = window.innerWidth <= 768;
      const baseScale = (isMobile ? 2.7 : 2.8) / maxDim;
      model.scale.setScalar(baseScale);
      model.position.sub(center.multiplyScalar(baseScale));
      model.position.y -= isMobile ? 0.8 : 0.3;
      model.userData.baseScale = baseScale;
      model.userData.baseY = model.position.y;
      model.userData.scrollRotY = 0;
      scene.add(model);

      model.traverse((child) => {
        const n = child.name.toLowerCase();
        if (!headBone && child.isBone && n.includes("head")) headBone = child;
        if (!spineBone && child.isBone && n.includes("spine")) spineBone = child;
      });

            if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        setSashaMixer(mixer);
        model.userData.animations = gltf.animations; // Store for animator
        gltf.animations.forEach(clip => mixer.clipAction(clip).play());
      }
    });

    const clock = new THREE.Clock();
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      if (mixer) mixer.update(delta);

      mouseX += (tMouseX - mouseX) * 0.05;
      mouseY += (tMouseY - mouseY) * 0.05;
      smoothScroll += (scrollY - smoothScroll) * 0.07;

      const heroSection = document.getElementById("home");
      const heroH = heroSection ? heroSection.offsetHeight - window.innerHeight : window.innerHeight * 2;
      const progress = Math.min(Math.max(smoothScroll / heroH, 0), 1);

      const slideAmount = progress * 120;
      const textOpacity = 1 - progress * 2.5;
      const isMobileView = window.innerWidth <= 768;
      const heroLeft = document.getElementById("heroLeft");
      const heroRightEl = document.getElementById("heroRight");

      if (heroLeft) {
        if (!isMobileView) heroLeft.style.transform = `translateY(-50%) translateX(${-slideAmount}%)`;
        heroLeft.style.opacity = Math.max(textOpacity, 0);
      }
      if (heroRightEl) {
        if (!isMobileView) heroRightEl.style.transform = `translateY(-50%) translateX(${slideAmount}%)`;
        heroRightEl.style.opacity = Math.max(textOpacity, 0);
      }

      if (model) {
        model.userData.scrollRotY = progress * Math.PI * 3;
        model.rotation.y = model.userData.scrollRotY + mouseX * 0.25 + Math.sin(elapsed * 0.3) * 0.04;
        model.rotation.x = mouseY * 0.06;
        model.rotation.z = Math.sin(progress * Math.PI) * 0.1;

        if (headBone) {
          headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, mouseX * 0.5, 0.07);
          headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, -mouseY * 0.3, 0.07);
        }
        if (spineBone) spineBone.rotation.y = THREE.MathUtils.lerp(spineBone.rotation.y, mouseX * 0.12, 0.05);

        const breathe = Math.sin(elapsed * 1.2) * 0.04;
        model.position.y = model.userData.baseY + breathe;
        const pulse = 1 + Math.sin(elapsed * 1.5) * 0.012;
        const scrollGrow = 1 + progress * 0.1;
        model.scale.setScalar(model.userData.baseScale * pulse * scrollGrow);

        const globalFade = Math.min(Math.max(1 - (smoothScroll - heroH) / (window.innerHeight * 0.5), 0), 1);
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = globalFade;
          }
        });
      }

      ground.material.opacity = 0.05 + Math.sin(elapsed * 1.5) * 0.02;
      camera.position.x = Math.sin(elapsed * 0.12) * 0.06;
      const mobileAnim = window.innerWidth <= 768;
      camera.position.y = (mobileAnim ? 0.6 : 1.0) + Math.cos(elapsed * 0.15) * 0.04;
      camera.lookAt(0, mobileAnim ? 0.3 : 0.6, 0);
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  // Particles
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let pW, pH;
    const dots = [];
    const DOT_COUNT = 60;
    let animId;

    function initParticles() {
      pW = canvas.width = window.innerWidth;
      pH = canvas.height = window.innerHeight;
      dots.length = 0;
      for (let i = 0; i < DOT_COUNT; i++) {
        dots.push({
          x: Math.random() * pW, y: Math.random() * pH,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.3 + 0.1
        });
      }
    }

    function drawParticles() {
      animId = requestAnimationFrame(drawParticles);
      ctx.clearRect(0, 0, pW, pH);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = pW; if (d.x > pW) d.x = 0;
        if (d.y < 0) d.y = pH; if (d.y > pH) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 145, 26, ${d.o})`;
        ctx.fill();
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(244, 145, 26, ${0.04 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
    initParticles();
    drawParticles();
    window.addEventListener("resize", initParticles);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", initParticles);
    };
  }, []);

  // Scroll top button
  useEffect(() => {
    const onScroll = () => setScrollTopVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.transition = "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".category-card, .team-card, .blog-card").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 0.1}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="sasha-home" data-testid="home-page">
      {/* Hero pattern overlay */}
      <div className="hero-pattern-overlay"></div>

      {/* 3D canvas */}
      <canvas ref={canvasRef} className="model-canvas" data-testid="3d-model-canvas" />

      {/* Particles */}
      <canvas ref={particlesRef} className="particles-canvas" />

      {/* Scroll Top */}
      <button className={`scroll-top-btn ${scrollTopVisible ? "show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} data-testid="scroll-top-btn">
        <i className="fa-solid fa-arrow-up"></i>
      </button>

      <div className="scroll-container">
        <HeroSection canvasRef={canvasRef} />
        <StatsBar />

        {/* Glassmorphic Dashboard Demo Section */}
        <section style={{
          padding: 'var(--sasha-section-gap) 0',
          background: '#ffffff',
          position: 'relative'
        }}>
          <div className="sasha-container">
            <div className="section-header">
              <div className="section-label" style={{ justifyContent: "center" }}>
                Glassmorphic UI System
              </div>
              <h2>Experience Modern Design</h2>
              <p>
                A complete glassmorphic UI system with bento-box layouts, parallax transitions,
                and beautiful blur effects. Fully responsive and accessible.
              </p>
            </div>
          </div>

          <ParallaxContainer.Reveal animation="fadeUp">
            <DashboardDemo />
          </ParallaxContainer.Reveal>
        </section>

        {/* Advanced Parallax Showcase */}
        <ParallaxShowcase />

        {/* Glassmorphic Cards Showcase */}
        <section style={{
          padding: 'var(--sasha-section-gap) 0',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
        }}>
          <div className="sasha-container">
            <div className="section-header">
              <div className="section-label" style={{ justifyContent: "center" }}>
                Component Library
              </div>
              <h2>Glassmorphic Components</h2>
              <p>Beautiful, reusable glassmorphic components for your next project</p>
            </div>

            {/* Component Showcase Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '48px'
            }}>
              {/* Card Variants */}
              <ParallaxContainer.Tilt>
                <GlassCard variant="default" size="lg" hoverable>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '12px'
                  }}>
                    Default Card
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.7'
                  }}>
                    Classic glassmorphic design with subtle blur and transparency
                  </p>
                </GlassCard>
              </ParallaxContainer.Tilt>

              <ParallaxContainer.Tilt>
                <GlassCard variant="primary" size="lg" hoverable gradient>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '12px'
                  }}>
                    Primary Card
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.7'
                  }}>
                    Warm orange gradient perfect for CTAs and highlights
                  </p>
                </GlassCard>
              </ParallaxContainer.Tilt>

              <ParallaxContainer.Tilt>
                <GlassCard variant="secondary" size="lg" hoverable gradient>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '12px'
                  }}>
                    Secondary Card
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.7'
                  }}>
                    Professional blue gradient for business content
                  </p>
                </GlassCard>
              </ParallaxContainer.Tilt>

              <ParallaxContainer.Tilt>
                <GlassCard variant="accent" size="lg" hoverable gradient>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '12px'
                  }}>
                    Accent Card
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.7'
                  }}>
                    Modern purple gradient for creative sections
                  </p>
                </GlassCard>
              </ParallaxContainer.Tilt>

              <ParallaxContainer.Tilt>
                <GlassCard variant="success" size="lg" hoverable gradient>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '12px'
                  }}>
                    Success Card
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.7'
                  }}>
                    Fresh green gradient for achievements and progress
                  </p>
                </GlassCard>
              </ParallaxContainer.Tilt>

              <ParallaxContainer.Tilt>
                <GlassCard variant="warning" size="lg" hoverable gradient>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '12px'
                  }}>
                    Warning Card
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.7'
                  }}>
                    Vibrant red-pink gradient for alerts and notifications
                  </p>
                </GlassCard>
              </ParallaxContainer.Tilt>
            </div>

            {/* Features Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {[
                { icon: '🎨', title: 'Glassmorphic Design', desc: 'Beautiful frosted glass effects with backdrop blur' },
                { icon: '📦', title: 'Bento Box Layout', desc: 'Modern responsive grid system with flexible sizing' },
                { icon: '✨', title: 'Parallax Effects', desc: 'Smooth scroll animations with GSAP integration' },
                { icon: '🎯', title: '3D Tilt Interactions', desc: 'Interactive cards that respond to mouse movement' },
                { icon: '🌈', title: 'Gradient Variants', desc: 'Multiple color schemes for any design need' },
                { icon: '📱', title: 'Fully Responsive', desc: 'Perfect display on all device sizes' },
                { icon: '♿', title: 'Accessible', desc: 'WCAG compliant with reduced motion support' },
                { icon: '⚡', title: 'Performance', desc: 'Optimized animations with hardware acceleration' },
              ].map((feature, index) => (
                <ParallaxContainer.Reveal
                  key={index}
                  animation="fadeUp"
                  delay={index * 0.1}
                >
                  <GlassCard
                    variant="default"
                    size="md"
                    hoverable
                    style={{ height: '100%' }}
                  >
                    <div style={{
                      fontSize: '32px',
                      marginBottom: '16px'
                    }}>
                      {feature.icon}
                    </div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      marginBottom: '8px'
                    }}>
                      {feature.title}
                    </h4>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      lineHeight: '1.6'
                    }}>
                      {feature.desc}
                    </p>
                  </GlassCard>
                </ParallaxContainer.Reveal>
              ))}
            </div>
          </div>
        </section>

        <ScrollStackSection />
        <AboutSection />
        <CategoriesSection />
        <CardSwapSection />
        <TestimonialSection />
        <TeamSection />
        <CTASection />
        <BlogPreviewSection />
        <PartnersSection />
        <NewsletterSection />
      </div>
    </div>
  );
}

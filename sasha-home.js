
// Hide loader immediately - LMS has its own loading
const loaderElImmediate = document.getElementById('loader');
if (loaderElImmediate) loaderElImmediate.style.display = 'none';


        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

        // ===== SPLASH 3D MODEL =====
        const splashCanvas = document.getElementById('loader-canvas');
        const splashScene = new THREE.Scene();
        const splashCam = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
        splashCam.position.set(0, 1.0, 5.5);

        if (!splashCanvas) { /* no splash loader in LMS mode */ }
        const splashRenderer = splashCanvas ? new THREE.WebGLRenderer({ canvas: splashCanvas, antialias: true, alpha: true }) : null;
        if (splashRenderer) splashRenderer.setSize(window.innerWidth, window.innerHeight);
        if (splashRenderer) splashRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if (splashRenderer) splashRenderer.outputColorSpace = THREE.SRGBColorSpace;
        if (splashRenderer) splashRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        if (splashRenderer) splashRenderer.toneMappingExposure = 1.2;

        // Splash lighting
        splashScene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const splKey = new THREE.DirectionalLight(0xffffff, 2);
        splKey.position.set(3, 8, 5);
        splashScene.add(splKey);
        const splFill = new THREE.DirectionalLight(0xf4911a, 0.6);
        splFill.position.set(-4, 2, -3);
        splashScene.add(splFill);
        const splRim = new THREE.DirectionalLight(0x6688ff, 0.8);
        splRim.position.set(0, 4, -8);
        splashScene.add(splRim);

        let splashModel = null;
        let splashMixer = null;
        window.__splashActive = true;
        const splashClock = new THREE.Clock();

        function animateSplash() {
            if (!window.__splashActive) return;
            requestAnimationFrame(animateSplash);
            const delta = splashClock.getDelta();
            const t = splashClock.getElapsedTime();

            if (splashMixer) splashMixer.update(delta);

            if (splashModel) {
                splashModel.rotation.y = t * 0.3;
                splashModel.position.y = splashModel.userData.baseY + Math.sin(t * 1.5) * 0.08;
                const pulse = 1 + Math.sin(t * 2) * 0.02;
                splashModel.scale.setScalar(splashModel.userData.baseScale * pulse);
            }

            splashCam.position.x = Math.sin(t * 0.2) * 0.1;
            splashCam.position.y = 1.0 + Math.cos(t * 0.25) * 0.06;
            splashCam.lookAt(0, 0.6, 0);
            if (splashRenderer) splashRenderer.render(splashScene, splashCam);
        }

        // ===== SETUP =====
        // Wait for canvas to be in DOM
        function waitForCanvas(cb) {
            const c = document.getElementById('model-canvas');
            if (c) { cb(c); }
            else { setTimeout(() => waitForCanvas(cb), 100); }
        }
        waitForCanvas(function(modelCanvas) {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0.5, 6);

        const renderer = new THREE.WebGLRenderer({ canvas: modelCanvas, antialias: true, alpha: true });
        const viewH = window.innerHeight - 64;
        renderer.setSize(window.innerWidth, viewH);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;

        // Lighting
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

        // Ground glow circle
        const groundMat = new THREE.MeshBasicMaterial({ color: 0xf4911a, transparent: true, opacity: 0.05 });
        const ground = new THREE.Mesh(new THREE.CircleGeometry(2.5, 64), groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1.5;
        scene.add(ground);

        // ===== LOAD MODEL =====
        let model = null, mixer = null, headBone = null, spineBone = null;
        const loaderFill = document.getElementById('loaderFill');
        const loaderText = document.getElementById('loaderText');
        const loaderEl = document.getElementById('loader');

        const gltfLoader = new GLTFLoader();

        // Load model once, use for both splash and main
        gltfLoader.load(
            '/models/Sasha-Character.glb',
            (gltf) => {
                // === SPLASH MODEL ===
                const splashClone = gltf.scene.clone(true);
                const sBox = new THREE.Box3().setFromObject(splashClone);
                const sCenter = sBox.getCenter(new THREE.Vector3());
                const sSize = sBox.getSize(new THREE.Vector3());
                const sMax = Math.max(sSize.x, sSize.y, sSize.z);
                const sScale = 2.8 / sMax;
                splashClone.scale.setScalar(sScale);
                splashClone.position.sub(sCenter.multiplyScalar(sScale));
                splashClone.position.y -= 0.2;
                splashClone.userData.baseScale = sScale;
                splashClone.userData.baseY = splashClone.position.y;
                splashModel = splashClone;
                splashScene.add(splashClone);

                if (gltf.animations.length > 0) {
                    splashMixer = new THREE.AnimationMixer(splashClone);
                    gltf.animations.forEach(clip => splashMixer.clipAction(clip).play());
                }

                // Start splash animation
                animateSplash();

                // === MAIN MODEL ===
                model = gltf.scene;
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const baseScale = 2.8 / maxDim;
                model.scale.setScalar(baseScale);
                model.position.sub(center.multiplyScalar(baseScale));
                model.position.y -= 0.3;
                model.userData.baseScale = baseScale;
                model.userData.baseY = model.position.y;
                model.userData.scrollRotY = 0;
                scene.add(model);

                model.traverse((child) => {
                    const n = child.name.toLowerCase();
                    if (!headBone && child.isBone && n.includes('head')) headBone = child;
                    if (!spineBone && child.isBone && n.includes('spine')) spineBone = child;
                });

                if (gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(model);
                    gltf.animations.forEach(clip => mixer.clipAction(clip).play());
                }

                if(loaderFill) loaderFill.style.width = '100%';
                if(loaderText) loaderText.textContent = 'Ready';
                setTimeout(() => {
                    loaderEl.classList.add('hidden');
                    document.body.style.overflow = '';
                    setTimeout(() => { window.__splashActive = false; }, 1000);
                }, 2000);
            },
            (p) => {
                if (p.total > 0) {
                    const pct = Math.round((p.loaded / p.total) * 100);
                    if(loaderFill) loaderFill.style.width = pct + '%';
                    if(loaderText) loaderText.textContent = `Loading 3D... ${pct}%`;
                }
            },
            () => {
                if(loaderFill) loaderFill.style.width = '100%';
                if(loaderText) loaderText.textContent = 'Starting...';
                setTimeout(() => {
                    loaderEl.classList.add('hidden');
                    document.body.style.overflow = '';
                    setTimeout(() => { window.__splashActive = false; }, 1000);
                }, 1500);
            }
        );

        // ===== MOUSE =====
        let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0;
        window.addEventListener('mousemove', (e) => {
            tMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            tMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // ===== SCROLL - TEXT SPLIT + MODEL ROTATE =====
        const heroLeft = document.getElementById('heroLeft');
        const heroRightEl = document.getElementById('heroRight');
        let scrollY = 0, smoothScroll = 0;

        window.addEventListener('scroll', () => { scrollY = window.scrollY; });

        // ===== ANIMATION LOOP =====
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();
            if (mixer) mixer.update(delta);

            mouseX += (tMouseX - mouseX) * 0.05;
            mouseY += (tMouseY - mouseY) * 0.05;

            smoothScroll += (scrollY - smoothScroll) * 0.07;

            // Hero scroll progress (0 to 1 over the hero's 300vh)
            const heroSection = document.getElementById('home');
            const heroH = heroSection ? heroSection.offsetHeight - window.innerHeight : window.innerHeight * 2;
            const progress = Math.min(Math.max(smoothScroll / heroH, 0), 1);

            // === TEXT SPLIT ANIMATION ===
            // Text slides out to left/right as you scroll
            const slideAmount = progress * 120; // percentage to translate
            const textOpacity = 1 - progress * 2.5; // fade out

            if (heroLeft) {
                heroLeft.style.transform = `translateY(-50%) translateX(${-slideAmount}%)`;
                heroLeft.style.opacity = Math.max(textOpacity, 0);
            }
            if (heroRightEl) {
                heroRightEl.style.transform = `translateY(-50%) translateX(${slideAmount}%)`;
                heroRightEl.style.opacity = Math.max(textOpacity, 0);
            }

            // === 3D MODEL ANIMATION ===
            if (model) {
                // Scroll-based rotation (full 360 as you scroll through hero)
                model.userData.scrollRotY = progress * Math.PI * 3;
                model.rotation.y = model.userData.scrollRotY + mouseX * 0.1 + Math.sin(elapsed * 0.3) * 0.04;
                model.rotation.x = mouseY * 0.06;
                model.rotation.z = Math.sin(progress * Math.PI) * 0.1;

                // Head tracks mouse
                if (headBone) {
                    headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, mouseX * 0.5, 0.07);
                    headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, -mouseY * 0.3, 0.07);
                }
                if (spineBone) {
                    spineBone.rotation.y = THREE.MathUtils.lerp(spineBone.rotation.y, mouseX * 0.12, 0.05);
                }

                // Floating breathe
                const breathe = Math.sin(elapsed * 1.2) * 0.04;
                model.position.y = model.userData.baseY + breathe;

                // Scale with subtle pulse
                const pulse = 1 + Math.sin(elapsed * 1.5) * 0.012;
                const scrollGrow = 1 + progress * 0.1;
                model.scale.setScalar(model.userData.baseScale * pulse * scrollGrow);

                // Fade model after hero
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
            camera.position.y = 1.0 + Math.cos(elapsed * 0.15) * 0.04;
            camera.lookAt(0, 0.6, 0);
            renderer.render(scene, camera);
        }
        animate();
        }); // end waitForCanvas
        const camera = null; // fallback to prevent ReferenceError

        // ===== RESIZE =====
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            const viewH = window.innerHeight - 64;
        renderer.setSize(window.innerWidth, viewH);
        });

        // ===== BACKGROUND PARTICLES =====
        const pCanvas = document.getElementById('particles-canvas');
        const pCtx = pCanvas.getContext('2d');
        let pW, pH;
        const dots = [];
        const DOT_COUNT = 60;

        function initParticles() {
            pW = pCanvas.width = window.innerWidth;
            pH = pCanvas.height = window.innerHeight;
            dots.length = 0;
            for (let i = 0; i < DOT_COUNT; i++) {
                dots.push({
                    x: Math.random() * pW,
                    y: Math.random() * pH,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 1.5 + 0.5,
                    o: Math.random() * 0.3 + 0.1
                });
            }
        }

        function drawParticles() {
            pCtx.clearRect(0, 0, pW, pH);
            for (const d of dots) {
                d.x += d.vx;
                d.y += d.vy;
                if (d.x < 0) d.x = pW;
                if (d.x > pW) d.x = 0;
                if (d.y < 0) d.y = pH;
                if (d.y > pH) d.y = 0;

                pCtx.beginPath();
                pCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                pCtx.fillStyle = `rgba(244, 145, 26, ${d.o})`;
                pCtx.fill();
            }

            // Draw connections
            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        pCtx.beginPath();
                        pCtx.moveTo(dots[i].x, dots[i].y);
                        pCtx.lineTo(dots[j].x, dots[j].y);
                        pCtx.strokeStyle = `rgba(244, 145, 26, ${0.04 * (1 - dist / 150)})`;
                        pCtx.lineWidth = 0.5;
                        pCtx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawParticles);
        }

        initParticles();
        drawParticles();
        window.addEventListener('resize', initParticles);
    

// ===== SCROLL VELOCITY MARQUEE =====
(function() {
    const row1Data = [
        { num: '50+', label: 'Students Enrolled' },
        { num: '70+', label: 'Top Lessons' },
        { num: '5+', label: 'Expert Tutors' },
        { num: '100+', label: 'Pro Videos' },
    ];
    const row2Data = [
        { num: '2+', label: 'Years Experience' },
        { num: '38', label: 'Certified' },
        { num: '100%', label: 'Satisfaction' },
        { num: '24/7', label: 'Support' },
    ];
    function buildVelocityRow(container, data, copies) {
        if (!container) return;
        let html = '';
        for (let c = 0; c < copies; c++) {
            data.forEach(d => {
                html += '<div class="velocity-item"><span class="v-num">' + d.num.replace('+', '<span class="accent">+</span>').replace('%', '<span class="accent">%</span>') + '</span><span class="v-label">' + d.label + '</span><span class="v-dot"></span></div>';
            });
        }
        container.innerHTML = html;
    }
    function initVelocity() {
        const vRow1 = document.getElementById('velocityRow1');
        const vRow2 = document.getElementById('velocityRow2');
        if (!vRow1 || !vRow2) { setTimeout(initVelocity, 500); return; }
        buildVelocityRow(vRow1, row1Data, 6);
        buildVelocityRow(vRow2, row2Data, 6);
        let vScrollY = 0, vLastScroll = 0, vVelocity = 0, vPos1 = 0, vPos2 = 0, w1 = 0, w2 = 0;
        window.addEventListener('scroll', () => { vScrollY = window.scrollY; });
        setTimeout(() => { w1 = vRow1.scrollWidth / 6; w2 = vRow2.scrollWidth / 6; }, 300);
        function animateVelocity() {
            requestAnimationFrame(animateVelocity);
            const scrollDelta = vScrollY - vLastScroll;
            vLastScroll = vScrollY;
            vVelocity += (scrollDelta - vVelocity) * 0.08;
            const speed = vVelocity * 0.8;
            vPos1 -= speed; vPos2 += speed;
            if (w1 > 0) { if (vPos1 <= -w1) vPos1 += w1; if (vPos1 > 0) vPos1 -= w1; }
            if (w2 > 0) { if (vPos2 <= -w2) vPos2 += w2; if (vPos2 > 0) vPos2 -= w2; }
            vRow1.style.transform = 'translateX(' + vPos1 + 'px)';
            vRow2.style.transform = 'translateX(' + vPos2 + 'px)';
        }
        animateVelocity();
    }
    initVelocity();
})();

// ===== 3D CARD TILT =====
(function() {
    function initTilt() {
        const aboutCard = document.querySelector('.about-visual-placeholder');
        if (!aboutCard) { setTimeout(initTilt, 800); return; }
        aboutCard.addEventListener('mousemove', (e) => {
            const rect = aboutCard.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 25;
            const y = (e.clientY - rect.top - rect.height / 2) / 25;
            aboutCard.style.transform = 'rotateY(' + x + 'deg) rotateX(' + (-y) + 'deg)';
        });
        aboutCard.addEventListener('mouseleave', () => { aboutCard.style.transform = 'rotateY(0deg) rotateX(0deg)'; });
    }
    initTilt();
})();

// ===== MORPHING TEXT =====
(function() {
    const morphTexts = ["The Place Where You Can Achieve","Immersive AR/VR Learning","Personalized Education","Data-Driven Learning Paths","Hybrid Tutoring Centers"];
    let morphTextIndex = 0, morphProgress = 0, morphCooldown = 0.5, morphLastTime = Date.now();
    const MORPH_TIME = 1.5, COOLDOWN_TIME = 0.5;
    function initMorph() {
        const t1 = document.getElementById('morphText1');
        const t2 = document.getElementById('morphText2');
        if (!t1 || !t2) { setTimeout(initMorph, 800); return; }
        t1.textContent = morphTexts[0]; t2.textContent = morphTexts[1];
        function setMorphStyles(fraction) {
            t2.style.filter = 'blur(' + Math.min(8 / fraction - 8, 100) + 'px)';
            t2.style.opacity = Math.pow(fraction, 0.4) * 100 + '%';
            const inv = 1 - fraction;
            t1.style.filter = 'blur(' + Math.min(8 / inv - 8, 100) + 'px)';
            t1.style.opacity = Math.pow(inv, 0.4) * 100 + '%';
            t1.textContent = morphTexts[morphTextIndex % morphTexts.length];
            t2.textContent = morphTexts[(morphTextIndex + 1) % morphTexts.length];
        }
        function animateMorph() {
            requestAnimationFrame(animateMorph);
            const now = Date.now(), dt = (now - morphLastTime) / 1000;
            morphLastTime = now; morphCooldown -= dt;
            if (morphCooldown <= 0) {
                morphProgress -= morphCooldown; morphCooldown = 0;
                let fraction = morphProgress / MORPH_TIME;
                if (fraction > 1) { morphCooldown = COOLDOWN_TIME; fraction = 1; }
                setMorphStyles(fraction);
                if (fraction === 1) { morphTextIndex++; morphProgress = 0; }
            } else {
                morphProgress = 0; t2.style.filter = 'none'; t2.style.opacity = '100%';
                t1.style.filter = 'none'; t1.style.opacity = '0%';
            }
        }
        animateMorph();
    }
    initMorph();
})();

// ===== TESTIMONIAL SLIDER =====
(function() {
    function initSlider() {
        const slides = document.querySelectorAll('.testimonial-slide');
        const prev = document.getElementById('prevSlide');
        const next = document.getElementById('nextSlide');
        if (!slides.length || !prev || !next) { setTimeout(initSlider, 800); return; }
        let current = 0;
        function showSlide(n) { slides.forEach(s => s.classList.remove('active')); current = (n + slides.length) % slides.length; slides[current].classList.add('active'); }
        prev.addEventListener('click', () => showSlide(current - 1));
        next.addEventListener('click', () => showSlide(current + 1));
        setInterval(() => showSlide(current + 1), 6000);
    }
    initSlider();
})();

// ===== SCROLL REVEAL =====
(function() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    setTimeout(() => {
        document.querySelectorAll('.category-card, .team-card, .blog-card').forEach((el, i) => {
            el.style.opacity = '0'; el.style.transform = 'translateY(30px)';
            el.style.transitionDelay = (i % 4) * 0.1 + 's'; obs.observe(el);
        });
    }, 1000);
})();

// ===== CUSTOM CURSOR =====
(function() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx - 4 + 'px'; dot.style.top = my - 4 + 'px'; });
    function animCursor() { requestAnimationFrame(animCursor); rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15; ring.style.left = rx - 20 + 'px'; ring.style.top = ry - 20 + 'px'; }
    animCursor();
})();

// ===== SCROLL TOP =====
(function() {
    const btn = document.getElementById('scrollTop');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 500));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

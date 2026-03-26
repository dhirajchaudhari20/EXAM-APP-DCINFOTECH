// ========== ELITE UI ENHANCEMENTS JAVASCRIPT ==========

(function () {
    'use strict';

    // ========== CUSTOM CURSOR ==========
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('cursorDot');

    if (cursor && cursorDot) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';

            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
        });
    }

    // ========== SCROLL PROGRESS BAR ==========
    const scrollProgress = document.getElementById('scrollProgress');

    if (scrollProgress) {
        window.addEventListener('scroll', function () {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            scrollProgress.style.width = scrolled + '%';
        });
    }

    // ========== SCROLL-TO-TOP BUTTON ==========
    const scrollToTopBtn = document.getElementById('scrollToTop');

    if (scrollToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========== MAGNETIC EFFECT ==========
    document.querySelectorAll('.btn, .card').forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            element.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
        });
    });

    // ========== 3D TILT EFFECT ==========
    document.querySelectorAll('.card, .bento-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // ========== PARTICLE GENERATOR ==========
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 5000);
    }

    // Create particles periodically
    setInterval(createParticle, 800);

    // ========== FADE-IN ANIMATION ON SCROLL ==========
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                appearOnScroll.unobserve(entry.target);
            }
        })
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // ========== MOUSE FOLLOW EFFECT FOR BUTTONS ==========
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mousemove', function (e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            button.style.setProperty('--mouse-x', x + 'px');
            button.style.setProperty('--mouse-y', y + 'px');
        });
    });

    // ========== SHINE EFFECT ON CLICK ==========
    document.querySelectorAll('.card, .btn').forEach(element => {
        element.addEventListener('click', function (e) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const shine = document.createElement('div');
            shine.className = 'shine-effect';
            shine.style.cssText = `
        position: absolute;
        width: 0;
        height: 0;
        background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%);
        animation: shineExpand 0.6s ease-out;
      `;
            element.appendChild(shine);

            setTimeout(() => shine.remove(), 600);
        });
    });

    // ========== DYNAMIC ANIMATIONS ==========
    const style = document.createElement('style');
    style.textContent = `
    @keyframes shineExpand {
      0% {
        width: 0;
        height: 0;
        opacity: 1;
      }
      100% {
        width: 200px;
        height: 200px;
        opacity: 0;
      }
    }
  `;
    document.head.appendChild(style);

    // ========== ACCESSIBILITY: REDUCE MOTION ==========
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    }

    console.log('🎨 Elite UI Enhancements Loaded Successfully!');
})();

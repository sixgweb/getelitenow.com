/**
 * Elite Physique Gym — Theme JavaScript
 * Scroll animations, component init, interactions
 */

// ── Scroll-triggered Animate.css observer ─────────────────
let animateObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        let animateClass = 'animate__' + entry.target.dataset.animate;
        if (entry.intersectionRatio > 0) {
            entry.target.classList.remove('invisible');
            entry.target.classList.add('animate__animated', animateClass);
            animateObserver.unobserve(entry.target);
        } else {
            entry.target.classList.add('invisible');
            entry.target.classList.remove('animate__animated', animateClass);
        }
    });
}, { threshold: 0.15 });

// ── Main init ─────────────────────────────────────────────
(() => {
    addEventListener('page:load', function () {

        // Dismiss modals when opening packages offcanvas
        const packagesOffcanvas = document.getElementById('packagesOffcanvas');
        if (packagesOffcanvas) {
            packagesOffcanvas.addEventListener('show.bs.offcanvas', event => {
                document.querySelectorAll('.modal').forEach(modal => {
                    bootstrap.Modal.getInstance(modal)?.hide();
                });
            });
        }

        // Init scroll animations
        document.querySelectorAll('[data-animate]').forEach(element => {
            element.classList.add('invisible');
            animateObserver.observe(element);
        });

        // Init lightGallery
        document.querySelectorAll('.lightgallery').forEach(element => {
            lightGallery(element, {
                plugins: [],
                speed: 500,
                download: false,
            });
        });

        // Init Swiper for brand carousel
        const brandSwiperEl = document.getElementById('brandSwiper');
        if (brandSwiperEl) {
            new Swiper('#brandSwiper', {
                direction: 'horizontal',
                loop: true,
                pagination: {
                    el: '.swiper-pagination',
                },
                slidesPerView: 3,
                autoplay: {
                    delay: 2000,
                },
                breakpoints: {
                    960: {
                        slidesPerView: 6,
                    }
                },
            });
        }

        // Navbar scroll behavior — add background on scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const updateNavbar = () => {
                if (window.scrollY > 100) {
                    navbar.classList.add('shadow-lg');
                    navbar.style.backgroundColor = 'rgba(23, 23, 23, 0.95)';
                    navbar.style.backdropFilter = 'blur(10px)';
                } else {
                    navbar.classList.remove('shadow-lg');
                    navbar.style.backgroundColor = '';
                    navbar.style.backdropFilter = '';
                }
            };

            window.addEventListener('scroll', updateNavbar, { passive: true });
            updateNavbar(); // Run on page load
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    });
})();

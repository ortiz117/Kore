document.addEventListener('DOMContentLoaded', () => {

            // --- NAVBAR SCROLL EFFECT ---
            const navbar = document.getElementById('navbar');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });

            // --- CAROUSEL ---
            const track = document.getElementById('carousel-track');
            const slides = track.querySelectorAll('.carousel-slide');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const indicatorsContainer = document.getElementById('carousel-indicators');
            
            let currentSlide = 0;
            const totalSlides = slides.length;

            // Crear indicadores
            slides.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.classList.add('indicator');
                if (index === 0) indicator.classList.add('active');
                indicator.addEventListener('click', () => goToSlide(index));
                indicatorsContainer.appendChild(indicator);
            });

            const indicators = document.querySelectorAll('.indicator');

            function updateCarousel() {
                const offset = -currentSlide * 100;
                track.style.transform = `translateX(${offset}%)`;
                
                indicators.forEach((ind, index) => {
                    ind.classList.toggle('active', index === currentSlide);
                });
            }

            function goToSlide(index) {
                currentSlide = index;
                updateCarousel();
            }

            function nextSlide() {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateCarousel();
            }

            function prevSlide() {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                updateCarousel();
            }

            nextBtn.addEventListener('click', nextSlide);
            prevBtn.addEventListener('click', prevSlide);

            // Auto-play carousel
            setInterval(nextSlide, 5000);

            // --- MODAL DE LOGIN ---
            const btnLoginNav = document.getElementById('btn-login-nav');
            const loginModal = document.getElementById('login-modal');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const loginForm = document.getElementById('login-form');
            const btnPremium = document.getElementById('btn-premium');
            const btnCta = document.getElementById('btn-cta');

            function openModal() {
                loginModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }

            function closeModal() {
                loginModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }

            btnLoginNav.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });

            btnPremium.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });

            btnCta.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });

            closeModalBtn.addEventListener('click', closeModal);

            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    closeModal();
                }
            });

            // --- SIMULACIÓN DE LOGIN ---
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const submitButton = loginForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = '🔄 Entrando...';
                submitButton.disabled = true;

                // Simular autenticación
                setTimeout(() => {
                    // En producción, aquí iría tu fetch a la API
                    // window.location.href = 'dashboard.html';
                    
                    // Para demo, mostrar mensaje
                    alert('✅ ¡Inicio de sesión exitoso! Redirigiendo al dashboard...');
                    submitButton.textContent = '✅ ¡Éxito!';
                    
                    setTimeout(() => {
                        closeModal();
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        loginForm.reset();
                        
                        // Descomentar para redirección real:
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }, 1500);
            });

            // --- SCROLL REVEAL ANIMATION ---
            const revealElements = document.querySelectorAll('.reveal');
            
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            revealElements.forEach(element => {
                revealObserver.observe(element);
            });

            // --- SMOOTH SCROLL ---
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');
                    if (href === '#' || href === '#login') return;
                    
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offsetTop = target.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                });
            });

            // --- TYPING EFFECT (opcional) ---
            const heroTitle = document.querySelector('.hero h1');
            const originalText = heroTitle.innerHTML;
            let charIndex = 0;
            
            // Descomentar para activar efecto de escritura:
            /*
            heroTitle.innerHTML = '';
            function typeWriter() {
                if (charIndex < originalText.length) {
                    heroTitle.innerHTML += originalText.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeWriter, 50);
                }
            }
            setTimeout(typeWriter, 500);
            */

            // --- PARTICLES BACKGROUND (opcional) ---
            // Puedes añadir un canvas con partículas en el hero
            
            console.log('🚀 Kore POS Landing Page Cargada');
        });
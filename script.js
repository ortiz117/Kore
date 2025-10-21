// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- MANEJO DEL MODAL DE LOGIN ---

    const btnLoginNav = document.getElementById('btn-login-nav');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const loginForm = document.getElementById('login-form');

    // Abrir el modal
    btnLoginNav.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('show');
    });

    // Cerrar el modal con el botón 'X'
    closeModalBtn.addEventListener('click', () => {
        loginModal.classList.remove('show');
    });

    // Cerrar el modal haciendo click fuera de él
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('show');
        }
    });

    // --- SIMULACIÓN DE INICIO DE SESIÓN ---
    // En un proyecto real, esto haría un 'fetch' a tu API de Spring Boot
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Aquí iría tu lógica de 'fetch' para autenticar
        // fetch('/api/auth/login', { ... })

        // ----------------------------------------------------
        // INICIO: Simulación para el prototipo
        // ----------------------------------------------------
        
        // Simular que el login fue exitoso y redirigir al dashboard
        console.log('Iniciando sesión...');
        
        // Mostramos un feedback al usuario
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Entrando...';
        submitButton.disabled = true;

        // Simulamos un pequeño retraso de red
        setTimeout(() => {
            // ¡Esta es la línea clave! Redirige al dashboard que ya hicimos.
            window.location.href = 'dashboard.html';
        }, 1000);

        // ----------------------------------------------------
        // FIN: Simulación para el prototipo
        // ----------------------------------------------------
    });

});
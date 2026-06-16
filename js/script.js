document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. TEMA DE COLOR (DARK/LIGHT MODE)
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyElement = document.body;
    
    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    bodyElement.className = savedTheme;

    themeToggleBtn.addEventListener('click', () => {
        if (bodyElement.classList.contains('dark-theme')) {
            bodyElement.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            bodyElement.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }
    });

    // ==========================================================================
    // 2. INDICADOR DE PROGRESO DE LECTURA Y NAVBAR EFECTO SCROLL
    // ==========================================================================
    const progressBar = document.getElementById('progress-bar');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        // Barra de progreso
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        progressBar.style.width = scrollPercent + '%';

        // Estilo Navbar en scroll
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Resaltar sección activa en el menú de navegación
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // Compensación de cabecera
            const sectionHeight = section.offsetHeight;
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // ==========================================================================
    // 3. MENÚ DE NAVEGACIÓN MÓVIL
    // ==========================================================================
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });

    // Cerrar menú móvil al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });

    // ==========================================================================
    // 4. LÍNEA DE TIEMPO INTERACTIVA
    // ==========================================================================
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            timelineItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // ==========================================================================
    // 5. RUEDA DE CARACTERÍSTICAS INTERACTIVAS
    // ==========================================================================
    const wheelNodes = document.querySelectorAll('.wheel-node');
    const details = document.querySelectorAll('.feature-detail');

    wheelNodes.forEach(node => {
        node.addEventListener('click', () => {
            // Desactivar todos los nodos
            wheelNodes.forEach(n => n.classList.remove('active'));
            // Activar nodo seleccionado
            node.classList.add('active');

            // Obtener característica
            const feature = node.getAttribute('data-feature');
            
            // Ocultar todos los detalles de características
            details.forEach(detail => {
                detail.classList.remove('active');
                setTimeout(() => {
                    if (!detail.classList.contains('active')) {
                        detail.style.display = 'none';
                    }
                }, 300); // Mismo tiempo que transición en CSS
            });

            // Mostrar el detalle correspondiente
            const targetDetail = document.getElementById(`detail-${feature}`);
            setTimeout(() => {
                targetDetail.style.display = 'block';
                // Trigger reflow
                targetDetail.offsetHeight;
                targetDetail.classList.add('active');
            }, 300);
        });
    });

    // ==========================================================================
    // 6. ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER)
    // ==========================================================================
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Dejar de observar una vez que se muestra
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Revelar un poco antes de que entre del todo
    });

    scrollRevealElements.forEach(el => revealObserver.observe(el));

    // ==========================================================================
    // 6.1 AVATARES DE ESTUDIANTES (FALLBACK SI NO CARGA LA FOTO)
    // ==========================================================================
    document.querySelectorAll('.author-avatar-img').forEach(img => {
        const avatar = img.closest('.author-avatar');
        const showFallback = () => avatar?.classList.add('is-fallback');

        if (img.complete && img.naturalHeight === 0) {
            showFallback();
        } else {
            img.addEventListener('error', showFallback);
        }
    });

    // ==========================================================================
    // 7. REPRODUCTOR DE AUDIO Y VISUALIZADOR EN CANVAS
    // ==========================================================================
    const audio = document.getElementById('main-audio');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnBackward = document.getElementById('btn-backward');
    const btnForward = document.getElementById('btn-forward');
    const btnMute = document.getElementById('btn-mute');
    
    const playPauseIcon = btnPlayPause.querySelector('i');
    const muteIcon = btnMute.querySelector('i');
    
    const playerProgressContainer = document.getElementById('player-progress-container');
    const playerProgressFill = document.getElementById('player-progress-fill');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationTimeDisplay = document.getElementById('duration-time');
    
    const canvas = document.getElementById('audio-visualizer');
    const ctx = canvas.getContext('2d');
    
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let source = null;
    let animationFrameId = null;
    let isPlaying = false;
    let useProceduralAnimation = true; // Por defecto o fallback a animación matemática

    // Configurar dimensiones de Canvas
    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Formatear Segundos a mm:ss
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Inicializar Web Audio API (cuando el usuario interactúa para evitar bloqueo del navegador)
    function initAudioContext() {
        if (audioContext) return;
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            
            // Conectar el elemento audio al analizador
            // Nota: Para fuentes remotas puede haber problemas de CORS. 
            // Si eso pasa, el Web Audio API fallará silenciosamente o dará error, 
            // y activaremos la animación procedimental.
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            useProceduralAnimation = false;
        } catch (e) {
            console.warn("Web Audio API bloqueado o con problemas CORS. Usando fallback procedimental.");
            useProceduralAnimation = true;
        }
    }

    // Manejo de Reproducción / Pausa
    btnPlayPause.addEventListener('click', () => {
        initAudioContext();
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(err => {
                console.log("Error al reproducir audio:", err);
            });
        }
    });

    audio.addEventListener('play', () => {
        isPlaying = true;
        playPauseIcon.classList.replace('fa-play', 'fa-pause');
        drawVisualizer();
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        playPauseIcon.classList.replace('fa-pause', 'fa-play');
        cancelAnimationFrame(animationFrameId);
        drawStaticVisualizer();
    });

    // Avance y Retroceso de 10 segundos
    btnBackward.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    btnForward.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
    });

    // Silenciar
    btnMute.addEventListener('click', () => {
        audio.muted = !audio.muted;
        if (audio.muted) {
            muteIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
        } else {
            muteIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
        }
    });

    // Actualización de tiempos e indicador de progreso
    audio.addEventListener('timeupdate', () => {
        const current = audio.currentTime;
        const duration = audio.duration || 0;
        
        currentTimeDisplay.textContent = formatTime(current);
        if (duration > 0) {
            const percent = (current / duration) * 100;
            playerProgressFill.style.width = percent + '%';
            // Mover manilla
            const handle = playerProgressContainer.querySelector('.progress-handle');
            if (handle) handle.style.left = percent + '%';
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        durationTimeDisplay.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        playPauseIcon.classList.replace('fa-pause', 'fa-play');
        cancelAnimationFrame(animationFrameId);
        drawStaticVisualizer();
    });

    audio.addEventListener('error', () => {
        console.error('No se pudo cargar el podcast:', audio.error);
        durationTimeDisplay.textContent = '--:--';
    });

    // Permitir clic en barra de progreso para buscar momento del audio
    playerProgressContainer.addEventListener('click', (e) => {
        const containerWidth = playerProgressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration || 0;
        if (duration > 0) {
            audio.currentTime = (clickX / containerWidth) * duration;
        }
    });

    // Dibujar ondas de audio estáticas
    function drawStaticVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = 4;
        const gap = 3;
        const totalBars = Math.floor(canvas.width / (barWidth + gap));
        
        ctx.fillStyle = getComputedStyle(bodyElement).getPropertyValue('--text-muted').trim() || '#6b7280';
        
        for (let i = 0; i < totalBars; i++) {
            // Ondas estáticas con forma de campana en el centro
            const factor = 1 - Math.abs(i - totalBars / 2) / (totalBars / 2);
            const height = 4 + factor * 20;
            const x = i * (barWidth + gap);
            const y = canvas.height / 2 - height / 2;
            ctx.fillRect(x, y, barWidth, height);
        }
    }
    
    // Iniciar con visualizador estático
    drawStaticVisualizer();
    // Intentar refrescar duración por si ya cargó
    if (audio.readyState >= 1) {
        durationTimeDisplay.textContent = formatTime(audio.duration);
    }

    // Dibujar ondas activas
    let phase = 0; // Para animación procedimental
    
    function drawVisualizer() {
        if (!isPlaying) return;
        
        animationFrameId = requestAnimationFrame(drawVisualizer);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = 4;
        const gap = 3;
        const totalBars = Math.floor(canvas.width / (barWidth + gap));
        
        const accentColor = getComputedStyle(bodyElement).getPropertyValue('--color-accent').trim() || '#06b6d4';
        const secondaryColor = getComputedStyle(bodyElement).getPropertyValue('--color-secondary').trim() || '#6366f1';
        
        // Crear un degradado lineal para las barras
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = gradient;

        if (!useProceduralAnimation && analyser) {
            // Analizar frecuencias reales
            analyser.getByteFrequencyData(dataArray);
            
            for (let i = 0; i < totalBars; i++) {
                // Mapear el índice de las barras al índice de frecuencia
                const dataIndex = Math.floor((i / totalBars) * dataArray.length);
                const value = dataArray[dataIndex] || 0;
                // Escalar altura
                const height = Math.max(4, (value / 255) * canvas.height * 0.85);
                const x = i * (barWidth + gap);
                const y = canvas.height / 2 - height / 2;
                ctx.fillRect(x, y, barWidth, height);
            }
        } else {
            // Animación procedimental basada en seno y coseno en caso de CORS o bloqueos
            phase += 0.05;
            for (let i = 0; i < totalBars; i++) {
                // Calcular un patrón de onda senoidal ondulante
                const factor = 1 - Math.abs(i - totalBars / 2) / (totalBars / 2);
                const sineVal = Math.sin(i * 0.15 + phase) * Math.cos(i * 0.05 - phase * 0.5);
                const height = Math.max(4, (sineVal + 1) * 20 * factor + 4);
                
                const x = i * (barWidth + gap);
                const y = canvas.height / 2 - height / 2;
                ctx.fillRect(x, y, barWidth, height);
            }
        }
    }
});

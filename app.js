// Estado global de sonido
let soundEnabled = true;

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundButtons = document.querySelectorAll('.sound-btn');
    soundButtons.forEach(btn => {
        btn.textContent = soundEnabled ? '🔊' : '🔇';
        if (soundEnabled) {
            btn.classList.remove('muted');
        } else {
            btn.classList.add('muted');
        }
    });
}

// Navegación entre pantallas
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
});

function initNavigation() {
    const activityCards = document.querySelectorAll('.activity-card');

    activityCards.forEach(card => {
        card.addEventListener('click', () => {
            const activity = card.getAttribute('data-activity');
            showScreen(`${activity}-screen`, activity);
        });
    });
}

function showScreen(screenId, activity) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // Inicializar la actividad cuando se muestra la pantalla (sin delay)
        requestAnimationFrame(() => {
            switch(activity) {
                case 'toggle':
                    initToggleSwitch();
                    break;
                case 'drawing':
                    initDrawingBoard();
                    break;
                case 'bubbles':
                    initBubbles();
                    break;
                case 'spinner':
                    initSpinner();
                    break;
            }
        });
    }
}

function goHome() {
    showScreen('home-screen');
}

// Toggle Switch HORIZONTAL con sonido realista
let toggleInitialized = false;
function initToggleSwitch() {
    if (toggleInitialized) return;
    toggleInitialized = true;

    const toggle = document.getElementById('toggleSwitch');
    if (!toggle) return;

    let audioContext;

    toggle.addEventListener('click', () => {
        const wasActive = toggle.classList.contains('active');
        toggle.classList.toggle('active');
        if (soundEnabled) {
            playClickSound(!wasActive);
        }
    });

    function playClickSound(isOn) {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Sonido de click mecánico
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Simular click mecánico
        oscillator.type = 'square';
        oscillator.frequency.value = isOn ? 1200 : 800;

        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    }
}

// Pizarra de dibujo con auto-borrado
let drawingInitialized = false;
function initDrawingBoard() {
    if (drawingInitialized) return;
    drawingInitialized = true;

    const canvas = document.getElementById('drawingCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const brushSizeInput = document.getElementById('brushSize');
    const clearBtn = document.getElementById('clearCanvas');

    // Ajustar tamaño del canvas
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let hue = 0;
    const strokes = [];

    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const coords = getCoordinates(e);
        if (coords) {
            [lastX, lastY] = coords;
        }
    }

    function draw(e) {
        e.preventDefault();
        if (!isDrawing) return;

        const coords = getCoordinates(e);
        if (!coords) return;
        const [x, y] = coords;

        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.lineWidth = brushSizeInput.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        strokes.push({
            x1: lastX,
            y1: lastY,
            x2: x,
            y2: y,
            color: ctx.strokeStyle,
            width: ctx.lineWidth,
            timestamp: Date.now()
        });

        [lastX, lastY] = [x, y];
        hue = (hue + 2) % 360;
    }

    function stopDrawing(e) {
        e.preventDefault();
        isDrawing = false;
    }

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        if (clientX === undefined || clientY === undefined) return null;

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return [x, y];
    }

    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });

    // Clear button
    clearBtn.addEventListener('click', () => {
        strokes.length = 0;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Auto-borrado gradual
    setInterval(() => {
        const now = Date.now();
        const fadeTime = 3000;
        const validStrokes = strokes.filter(stroke => now - stroke.timestamp < fadeTime);

        if (validStrokes.length !== strokes.length) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            validStrokes.forEach(stroke => {
                ctx.strokeStyle = stroke.color;
                ctx.lineWidth = stroke.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(stroke.x1, stroke.y1);
                ctx.lineTo(stroke.x2, stroke.y2);
                ctx.stroke();
            });

            strokes.length = 0;
            strokes.push(...validStrokes);
        }
    }, 100);
}

// Burbujas pop con sonido suave y partículas
let bubblesInitialized = false;
let audioContext;

function initBubbles() {
    if (bubblesInitialized) return;
    bubblesInitialized = true;

    const container = document.getElementById('bubblesContainer');
    if (!container) return;

    const colors = [
        'rgba(255, 107, 107, 0.7)',
        'rgba(78, 205, 196, 0.7)',
        'rgba(255, 159, 243, 0.7)',
        'rgba(132, 129, 255, 0.7)',
        'rgba(255, 234, 167, 0.7)',
        'rgba(162, 155, 254, 0.7)'
    ];

    function createBubble() {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        if (containerWidth === 0 || containerHeight === 0) {
            requestAnimationFrame(createBubble);
            return;
        }

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const size = Math.random() * 50 + 50;
        const left = Math.random() * (containerWidth - size);
        const top = Math.random() * (containerHeight - size);
        const color = colors[Math.floor(Math.random() * colors.length)];

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}px`;
        bubble.style.top = `${top}px`;
        bubble.style.background = color;
        bubble.style.animationDelay = `${Math.random() * 2}s`;
        bubble.style.animationDuration = `${Math.random() * 2 + 2}s`;

        bubble.addEventListener('click', (e) => {
            e.stopPropagation();

            // Crear partículas de explosión
            createParticles(bubble, color);

            // Sonido suave
            if (soundEnabled) {
                playPopSound();
            }

            // Animar explosión
            bubble.classList.add('popping');

            setTimeout(() => {
                bubble.remove();
                createBubble();
            }, 400);
        }, { once: true });

        container.appendChild(bubble);
    }

    function createParticles(bubble, color) {
        const rect = bubble.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const centerX = rect.left - containerRect.left + rect.width / 2;
        const centerY = rect.top - containerRect.top + rect.height / 2;

        // Crear 8 partículas
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'bubble-particle';
            particle.style.background = color;
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;

            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);

            container.appendChild(particle);

            setTimeout(() => particle.remove(), 500);
        }
    }

    function playPopSound() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sonido más suave y agradable
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.15);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    }

    // Crear burbujas iniciales SIN DELAY
    container.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        requestAnimationFrame(() => createBubble());
    }

    // Mantener número de burbujas
    setInterval(() => {
        const bubbles = container.querySelectorAll('.bubble');
        if (bubbles.length < 15) {
            createBubble();
        }
    }, 1000);
}

// Spinner realista - arrastrable
let spinnerInitialized = false;
function initSpinner() {
    if (spinnerInitialized) return;
    spinnerInitialized = true;

    const spinner = document.getElementById('spinner');
    const spinnerWrapper = document.querySelector('.spinner-wrapper');

    if (!spinner || !spinnerWrapper) return;

    let rotation = 0;
    let velocity = 0;
    let lastAngle = 0;
    let lastTime = 0;
    let isDragging = false;
    let animationId = null;

    function getAngle(e, rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return Math.atan2(clientY - centerY, clientX - centerX);
    }

    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        velocity = 0;

        const rect = spinner.getBoundingClientRect();
        lastAngle = getAngle(e, rect);
        lastTime = Date.now();

        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const rect = spinner.getBoundingClientRect();
        const currentAngle = getAngle(e, rect);
        const currentTime = Date.now();

        let delta = currentAngle - lastAngle;

        // Corregir salto de ángulo
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;

        rotation += delta * (180 / Math.PI);

        // Calcular velocidad
        const timeDelta = currentTime - lastTime;
        if (timeDelta > 0) {
            velocity = (delta * (180 / Math.PI)) / timeDelta * 16;
        }

        spinner.style.transform = `rotate(${rotation}deg)`;

        lastAngle = currentAngle;
        lastTime = currentTime;
    }

    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;

        // Aplicar inercia
        applyInertia();
    }

    function applyInertia() {
        const friction = 0.95;

        function animate() {
            if (Math.abs(velocity) < 0.1) {
                velocity = 0;
                return;
            }

            velocity *= friction;
            rotation += velocity;
            spinner.style.transform = `rotate(${rotation}deg)`;

            animationId = requestAnimationFrame(animate);
        }

        animate();
    }

    // Mouse events
    spinner.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    // Touch events
    spinner.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

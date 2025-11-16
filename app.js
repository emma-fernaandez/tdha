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

        // Sonido de click mecánico realista de interruptor
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Click de interruptor - diferente para ON y OFF
        osc1.type = 'triangle';
        osc2.type = 'sine';

        if (isOn) {
            // Encender - tono más alto y brillante
            osc1.frequency.value = 900;
            osc2.frequency.value = 450;
        } else {
            // Apagar - tono más bajo y apagado
            osc1.frequency.value = 600;
            osc2.frequency.value = 300;
        }

        // Filtro para simular el sonido mecánico
        filter.type = 'bandpass';
        filter.frequency.value = isOn ? 1000 : 700;
        filter.Q.value = 3;

        // Click muy corto y seco
        gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.04);

        // Decay rápido de frecuencia para simular el "clack"
        osc1.frequency.exponentialRampToValueAtTime(isOn ? 200 : 150, audioContext.currentTime + 0.04);
        osc2.frequency.exponentialRampToValueAtTime(isOn ? 100 : 80, audioContext.currentTime + 0.04);

        osc1.start(audioContext.currentTime);
        osc2.start(audioContext.currentTime);
        osc1.stop(audioContext.currentTime + 0.04);
        osc2.stop(audioContext.currentTime + 0.04);
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
    const fadeTimeInput = document.getElementById('fadeTime');
    const fadeTimeValue = document.getElementById('fadeTimeValue');
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

    // Fade time control
    fadeTimeInput.addEventListener('input', () => {
        fadeTimeValue.textContent = fadeTimeInput.value;
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        strokes.length = 0;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Auto-borrado gradual
    setInterval(() => {
        const now = Date.now();
        const fadeTime = fadeTimeInput.value * 1000; // Convertir segundos a milisegundos
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

// Variables del modo juego
let isGameMode = false;
let targetColor = '';
let targetColorIndex = -1;
let targetCount = 0;
let currentCount = 0;

const colors = [
    'rgba(255, 107, 107, 0.7)',    // Rojo/Rosa
    'rgba(78, 205, 196, 0.7)',     // Turquesa
    'rgba(255, 159, 243, 0.7)',    // Rosa
    'rgba(132, 129, 255, 0.7)',    // Morado
    'rgba(255, 234, 167, 0.7)',    // Amarillo
    'rgba(162, 155, 254, 0.7)'     // Lila
];

const colorNames = [
    'Rojas',
    'Turquesas',
    'Rosas',
    'Moradas',
    'Amarillas',
    'Lilas'
];

function toggleGameMode() {
    isGameMode = !isGameMode;
    const gameModeBtn = document.querySelector('.game-mode-btn');
    const gameObjective = document.getElementById('gameObjective');

    if (isGameMode) {
        gameModeBtn.classList.add('active');
        gameModeBtn.textContent = '🎮 Modo Normal';
        gameObjective.style.display = 'block';
        generateNewObjective();
    } else {
        gameModeBtn.classList.remove('active');
        gameModeBtn.textContent = '🎮 Modo Juego';
        gameObjective.style.display = 'none';
    }
}

function generateNewObjective() {
    // Generar color objetivo aleatorio
    targetColorIndex = Math.floor(Math.random() * colors.length);
    targetColor = colors[targetColorIndex];

    // Generar número de burbujas a explotar (entre 3 y 8)
    targetCount = Math.floor(Math.random() * 6) + 3;
    currentCount = 0;

    // Actualizar interfaz
    const targetColorDisplay = document.getElementById('targetColorDisplay');
    const objectiveCounter = document.getElementById('objectiveCounter');

    targetColorDisplay.style.background = targetColor;
    objectiveCounter.textContent = `0/${targetCount}`;
}

function updateObjectiveCounter() {
    currentCount++;
    const objectiveCounter = document.getElementById('objectiveCounter');
    objectiveCounter.textContent = `${currentCount}/${targetCount}`;

    // Si completó el objetivo, generar uno nuevo
    if (currentCount >= targetCount) {
        setTimeout(() => {
            generateNewObjective();
        }, 500);
    }
}

function initBubbles() {
    if (bubblesInitialized) return;
    bubblesInitialized = true;

    const container = document.getElementById('bubblesContainer');
    if (!container) return;

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
        const colorIndex = Math.floor(Math.random() * colors.length);
        const color = colors[colorIndex];

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}px`;
        bubble.style.top = `${top}px`;
        bubble.style.background = color;
        bubble.style.animationDelay = `${Math.random() * 2}s`;
        bubble.style.animationDuration = `${Math.random() * 2 + 2}s`;

        // Guardar el índice de color en la burbuja
        bubble.dataset.colorIndex = colorIndex;

        // Animación de aparición suave
        bubble.style.animation = 'bubbleAppear 0.4s ease-out, float 3s ease-in-out infinite ' + (Math.random() * 2) + 's';

        bubble.addEventListener('click', (e) => {
            e.stopPropagation();

            // Si está en modo juego, verificar si es el color correcto
            if (isGameMode) {
                const bubbleColorIndex = parseInt(bubble.dataset.colorIndex);
                if (bubbleColorIndex === targetColorIndex) {
                    // Color correcto! Actualizar contador
                    updateObjectiveCounter();
                } else {
                    // Color incorrecto, no hacer nada más que explotar
                    // (no cuenta para el objetivo)
                }
            }

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

        // Sonido de pop ligero y agradable - tipo burbuja suave
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sonido más agudo y ligero
        osc.type = 'sine';
        osc.frequency.value = 1000;

        // Filtro pasa-altos para sonido más brillante y ligero
        filter.type = 'highpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.5;

        // Volumen muy suave
        gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);

        // Frecuencia que baja ligeramente para efecto pop delicado
        osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.06);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.06);
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

// Spinner realista con física mejorada - como un spinner real
let spinnerInitialized = false;
function initSpinner() {
    if (spinnerInitialized) return;
    spinnerInitialized = true;

    const spinner = document.getElementById('spinner');
    if (!spinner) return;

    let rotation = 0;
    let velocity = 0;
    let lastAngle = 0;
    let lastTime = 0;
    let isDragging = false;
    let animationId = null;
    const velocityHistory = [];

    function getAngle(e) {
        const rect = spinner.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return Math.atan2(clientY - centerY, clientX - centerX);
    }

    function startDrag(e) {
        e.preventDefault();
        e.stopPropagation();

        isDragging = true;
        velocity = 0;
        velocityHistory.length = 0;

        lastAngle = getAngle(e);
        lastTime = performance.now();

        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();

        const currentAngle = getAngle(e);
        const currentTime = performance.now();

        let delta = currentAngle - lastAngle;

        // Normalizar delta para evitar saltos
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;

        const degreeDelta = delta * (180 / Math.PI);
        rotation += degreeDelta;

        // Calcular velocidad (grados por milisegundo)
        const timeDelta = currentTime - lastTime;
        if (timeDelta > 0) {
            const currentVelocity = degreeDelta / timeDelta;

            // Mantener historial de velocidad
            velocityHistory.push(currentVelocity);
            if (velocityHistory.length > 5) {
                velocityHistory.shift();
            }
        }

        // Aplicar rotación inmediatamente
        spinner.style.transform = `rotate(${rotation}deg)`;

        lastAngle = currentAngle;
        lastTime = currentTime;
    }

    function stopDrag(e) {
        if (!isDragging) return;
        isDragging = false;

        // Calcular velocidad promedio de los últimos movimientos
        if (velocityHistory.length > 0) {
            velocity = velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length;
            // Multiplicar por factor para simular spinner real (más inercia)
            velocity *= 20;
        }

        velocityHistory.length = 0;

        // Aplicar inercia como spinner real
        applyInertia();
    }

    function applyInertia() {
        // Fricción más baja = gira más tiempo (como spinner real)
        const friction = 0.985; // Antes era 0.95, ahora 0.985 para más inercia
        const minVelocity = 0.05; // Velocidad mínima antes de parar

        function animate() {
            if (Math.abs(velocity) < minVelocity) {
                velocity = 0;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                return;
            }

            // Aplicar fricción
            velocity *= friction;

            // Actualizar rotación
            rotation += velocity;

            // Normalizar rotación para evitar números muy grandes
            rotation = rotation % 360;

            spinner.style.transform = `rotate(${rotation}deg)`;

            animationId = requestAnimationFrame(animate);
        }

        if (Math.abs(velocity) >= minVelocity) {
            animate();
        }
    }

    // Mouse events
    spinner.addEventListener('mousedown', startDrag, false);
    document.addEventListener('mousemove', drag, false);
    document.addEventListener('mouseup', stopDrag, false);
    document.addEventListener('mouseleave', stopDrag, false);

    // Touch events - SIN passive para prevenir scroll
    spinner.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag, false);
    document.addEventListener('touchcancel', stopDrag, false);
}

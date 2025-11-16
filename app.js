// Navegación entre pantallas
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initToggleSwitch();
    initDrawingBoard();
    initBubbles();
    initSpinner();
});

function initNavigation() {
    const activityCards = document.querySelectorAll('.activity-card');

    activityCards.forEach(card => {
        card.addEventListener('click', () => {
            const activity = card.getAttribute('data-activity');
            showScreen(`${activity}-screen`);
        });
    });
}

function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function goHome() {
    showScreen('home-screen');
}

// Toggle Switch con sonido
function initToggleSwitch() {
    const toggle = document.getElementById('toggleSwitch');
    if (!toggle) return;

    // Crear contexto de audio
    let audioContext;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        playToggleSound(toggle.classList.contains('active'));
    });

    function playToggleSound(isOn) {
        // Crear contexto de audio si no existe
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Frecuencia diferente para on/off
        oscillator.frequency.value = isOn ? 800 : 400;
        oscillator.type = 'sine';

        // Volumen suave
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// Pizarra de dibujo con auto-borrado
function initDrawingBoard() {
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

    // Array para almacenar trazos y su tiempo de creación
    const strokes = [];

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
    }

    function draw(e) {
        if (!isDrawing) return;

        const [x, y] = getCoordinates(e);

        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.lineWidth = brushSizeInput.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Guardar el trazo con timestamp
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
        hue = (hue + 1) % 360;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        return [x, y];
    }

    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend', stopDrawing);

    // Clear button
    clearBtn.addEventListener('click', () => {
        strokes.length = 0;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Auto-borrado gradual (después de 3 segundos)
    setInterval(() => {
        const now = Date.now();
        const fadeTime = 3000; // 3 segundos

        // Filtrar trazos viejos
        const validStrokes = strokes.filter(stroke => now - stroke.timestamp < fadeTime);

        if (validStrokes.length !== strokes.length) {
            // Redibujar solo trazos válidos
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

            // Actualizar array de trazos
            strokes.length = 0;
            strokes.push(...validStrokes);
        }
    }, 100);
}

// Burbujas pop
function initBubbles() {
    const container = document.getElementById('bubblesContainer');
    if (!container) return;

    const colors = [
        'rgba(255, 107, 107, 0.6)',
        'rgba(78, 205, 196, 0.6)',
        'rgba(255, 159, 243, 0.6)',
        'rgba(132, 129, 255, 0.6)',
        'rgba(255, 234, 167, 0.6)',
        'rgba(162, 155, 254, 0.6)'
    ];

    function createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const size = Math.random() * 60 + 40;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * (container.clientWidth - size)}px`;
        bubble.style.top = `${Math.random() * (container.clientHeight - size)}px`;
        bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
        bubble.style.animationDelay = `${Math.random() * 2}s`;
        bubble.style.animationDuration = `${Math.random() * 2 + 2}s`;

        bubble.addEventListener('click', () => {
            bubble.classList.add('popping');
            setTimeout(() => {
                bubble.remove();
                createBubble();
            }, 300);
        });

        container.appendChild(bubble);
    }

    // Crear burbujas iniciales
    for (let i = 0; i < 12; i++) {
        createBubble();
    }

    // Recrear burbujas cada cierto tiempo
    setInterval(() => {
        if (container.children.length < 12) {
            createBubble();
        }
    }, 2000);
}

// Spinner
function initSpinner() {
    const spinner = document.getElementById('spinner');
    const spinBtn = document.getElementById('spinBtn');
    const speedInput = document.getElementById('spinSpeed');

    if (!spinner || !spinBtn || !speedInput) return;

    let rotation = 0;
    let isSpinning = false;
    let isDragging = false;
    let lastAngle = 0;

    spinBtn.addEventListener('click', () => {
        if (isSpinning) {
            spinner.classList.remove('spinning');
            isSpinning = false;
            spinBtn.textContent = 'Girar';
        } else {
            const speed = speedInput.value;
            spinner.style.animationDuration = `${11 - speed}s`;
            spinner.classList.add('spinning');
            isSpinning = true;
            spinBtn.textContent = 'Parar';
        }
    });

    // Drag para girar manualmente
    spinner.addEventListener('mousedown', startDrag);
    spinner.addEventListener('touchstart', startDrag);

    function startDrag(e) {
        isDragging = true;
        spinner.classList.remove('spinning');
        isSpinning = false;
        spinBtn.textContent = 'Girar';

        const rect = spinner.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        lastAngle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function drag(e) {
        if (!isDragging) return;

        const rect = spinner.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        const angle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
        const delta = angle - lastAngle;

        rotation += delta;
        spinner.style.transform = `rotate(${rotation}deg)`;

        lastAngle = angle;
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }
}

# 🧠 TDAH Fidget - Aplicación de Fidget Digital

Una aplicación web diseñada específicamente para personas con TDAH que necesitan mantener su mente ocupada con distracciones ligeras mientras realizan otras tareas importantes como escuchar podcasts, estudiar o trabajar.

## 🎯 Propósito

Esta aplicación simula digitalmente los juguetes fidget físicos, proporcionando pequeñas actividades que:
- Requieren muy poca atención consciente
- Ayudan a regular la mente neurodivergente
- Permiten mantener el foco en la tarea principal
- Proporcionan estimulación sensorial suave

## ✨ Actividades Disponibles

### 🔘 Interruptor (Toggle Switch)
Un interruptor digital que puedes tocar repetidamente. Incluye:
- Sonido suave diferenciado para encendido/apagado
- Animación fluida del botón
- Retroalimentación visual y auditiva

### 🎨 Pizarra Zen
Una pizarra de dibujo minimalista con características únicas:
- Fondo negro para reducir fatiga visual
- Pincel multicolor que cambia de tono automáticamente
- **Auto-borrado gradual**: Los trazos desaparecen después de 3 segundos
- Ajuste de tamaño del pincel
- Soporte para táctil y ratón

### 🫧 Pop Bubbles
Burbujas flotantes para explotar:
- Burbujas con colores suaves y translúcidos
- Animación de flotación
- Efecto de explosión al tocar
- Se regeneran automáticamente

### ⭕ Spinner
Un spinner digital interactivo:
- Arrastra para girar manualmente
- Botón para activar giro automático
- Control de velocidad ajustable
- Diseño con gradientes suaves

## 🚀 Cómo Usar

### Opción 1: Abrir directamente
Simplemente abre el archivo `index.html` en tu navegador web.

### Opción 2: Servidor local
Si prefieres usar un servidor local:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (si tienes http-server instalado)
npx http-server

# Con PHP
php -S localhost:8000
```

Luego abre tu navegador en `http://localhost:8000`

## 🌐 Despliegue en Vercel

La forma más fácil de tener tu app online es desplegarla en Vercel:

### Opción 1: Deploy con Git (Recomendado)

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New" → "Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un sitio estático
5. Haz clic en "Deploy"
6. ¡Listo! Tu app estará en línea en segundos

### Opción 2: Deploy con CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde la carpeta del proyecto
vercel

# Para producción
vercel --prod
```

### Opción 3: Deploy desde GitHub

Simplemente haz push a tu repositorio y Vercel desplegará automáticamente cada vez que hagas cambios.

**URL de ejemplo**: `https://tdha-fidget.vercel.app`

### Alternativa: Netlify

También puedes desplegar en Netlify:

1. Arrastra la carpeta del proyecto a [app.netlify.com/drop](https://app.netlify.com/drop)
2. O conecta tu repositorio de GitHub en Netlify

## 📱 Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles (iOS, Android)
- ✅ Tablets
- ✅ Desktop

## 🎨 Características Técnicas

- **Sin dependencias**: HTML, CSS y JavaScript vanilla
- **Responsive**: Se adapta a cualquier tamaño de pantalla
- **Touch-friendly**: Optimizado para pantallas táctiles
- **Ligero**: Carga rápida sin librerías externas
- **Accesible**: Diseño minimalista y claro

## 🧩 Futuras Mejoras Posibles

Ideas para expandir la aplicación:
- Sonidos ASMR opcionales
- Modo oscuro/claro
- Más actividades (mezclar colores, arena cinética digital, etc.)
- Temporizadores con recordatorios suaves
- Guardado de preferencias
- Modo offline (PWA)
- Estadísticas de uso (tiempo en cada actividad)

## 💡 Inspiración

Esta aplicación está inspirada en:
- Juguetes fidget físicos (spinners, interruptores, etc.)
- Investigación sobre TDAH y estimulación sensorial
- La necesidad de herramientas digitales para neurodivergentes

## 📝 Contribuir

Si tienes ideas para nuevas actividades o mejoras, ¡son bienvenidas! Algunas sugerencias:
- Actividades basadas en patrones visuales
- Sonidos personalizables
- Modo "focus" con estadísticas
- Integración con técnicas Pomodoro

## 📄 Licencia

Este proyecto es de código abierto y está disponible para su uso libre.

---

**Nota**: Esta aplicación no sustituye el tratamiento médico o terapéutico para el TDAH. Es simplemente una herramienta de apoyo para mejorar el enfoque y reducir la ansiedad en situaciones cotidianas.

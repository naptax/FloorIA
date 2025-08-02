<template>
  <div class="flooria-canvas" ref="canvasContainer">
    <canvas
      ref="canvas"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel="handleWheel"
      class="main-canvas"
    ></canvas>
    
    <!-- Canvas Controls -->
    <div class="canvas-controls">
      <button @click="zoomIn" class="control-btn" title="Zoom avant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      
      <button @click="zoomOut" class="control-btn" title="Zoom arrière">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      
      <button @click="fitToWindow" class="control-btn" title="Ajuster à la fenêtre">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
      </button>
      
      <button @click="resetView" class="control-btn" title="Réinitialiser la vue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M8 16l-5 5v-5h5"/>
        </svg>
      </button>
    </div>
    
    <!-- Empty State -->
    <div v-if="!imageSrc" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
      <h3>Aucun plan chargé</h3>
      <p>Importez un plan architectural pour commencer l'analyse</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Detection } from '../types/types'

interface Props {
  imageSrc: string | null
  detections: Detection[]
  selectedDetection: Detection | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'detection-select': [detection: Detection | null]
  'canvas-ready': []
}>()

// Template refs
const canvas = ref<HTMLCanvasElement>()
const canvasContainer = ref<HTMLDivElement>()

// Canvas state
const ctx = ref<CanvasRenderingContext2D | null>(null)
const image = ref<HTMLImageElement | null>(null)
const transform = ref({
  scale: 1,
  translateX: 0,
  translateY: 0
})

// Interaction state
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })
const minScale = 0.1
const maxScale = 5

// Element type colors
const elementColors: Record<string, string> = {
  'mur': '#4fc3f7',
  'porte': '#66bb6a', 
  'fenêtre': '#ffa726',
  'pièce': '#ab47bc'
}

// Setup canvas when mounted
onMounted(async () => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d')
    setupEventListeners()
    await nextTick()
    emit('canvas-ready')
  }
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
})

// Watch for image changes
watch(() => props.imageSrc, async (newSrc) => {
  if (newSrc) {
    await loadImage(newSrc)
  }
})

// Watch for detection changes
watch(() => [props.detections, props.selectedDetection], () => {
  drawCanvas()
}, { deep: true })

// Load image
const loadImage = async (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      image.value = img
      setupCanvas(img.width, img.height)
      drawCanvas()
      resolve()
    }
    img.onerror = reject
    img.src = src
  })
}

// Setup canvas dimensions
const setupCanvas = (width: number, height: number) => {
  if (!canvas.value || !canvasContainer.value) return
  
  const container = canvasContainer.value
  const containerRect = container.getBoundingClientRect()
  
  // Calculate scale to fit image in container
  const scaleX = (containerRect.width - 40) / width
  const scaleY = (containerRect.height - 40) / height
  const initialScale = Math.min(scaleX, scaleY, 1)
  
  canvas.value.width = width
  canvas.value.height = height
  
  // Reset transform and center
  transform.value = {
    scale: initialScale,
    translateX: (containerRect.width - width * initialScale) / 2,
    translateY: (containerRect.height - height * initialScale) / 2
  }
  
  updateCanvasTransform()
}

// Update canvas transform
const updateCanvasTransform = () => {
  if (!canvas.value) return
  
  const { scale, translateX, translateY } = transform.value
  canvas.value.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
  canvas.value.style.transformOrigin = '0 0'
}

// Draw canvas content
const drawCanvas = () => {
  if (!ctx.value || !image.value) return
  
  const context = ctx.value
  context.clearRect(0, 0, canvas.value!.width, canvas.value!.height)
  
  // Draw image
  context.globalAlpha = 0.7
  context.drawImage(image.value, 0, 0)
  context.globalAlpha = 1.0
  
  // Draw detections
  drawDetections(context)
}

// Draw detection bounding boxes
const drawDetections = (context: CanvasRenderingContext2D) => {
  props.detections.forEach((detection, index) => {
    const isSelected = props.selectedDetection?.id === detection.id
    const color = elementColors[detection.class] || '#64748b'
    
    // Convert hex to RGB for transparency
    const rgb = hexToRgb(color)
    
    // Draw bounding box
    context.strokeStyle = color
    context.lineWidth = isSelected ? 3 : 2
    context.setLineDash(isSelected ? [] : [5, 5])
    
    context.strokeRect(detection.x, detection.y, detection.width, detection.height)
    
    // Draw fill with transparency
    if (rgb) {
      context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isSelected ? 0.3 : 0.1})`
      context.fillRect(detection.x, detection.y, detection.width, detection.height)
    }
    
    // Draw label
    const label = `${detection.class} (${Math.round(detection.confidence * 100)}%)`
    const labelY = detection.y > 25 ? detection.y - 5 : detection.y + detection.height + 20
    
    context.fillStyle = color
    context.font = '14px -apple-system, BlinkMacSystemFont, sans-serif'
    context.fillText(label, detection.x, labelY)
    
    // Reset line dash
    context.setLineDash([])
  })
}

// Convert hex color to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Mouse event handlers
const handleMouseDown = (event: MouseEvent) => {
  if (!canvas.value) return
  
  const rect = canvas.value.getBoundingClientRect()
  const x = (event.clientX - rect.left - transform.value.translateX) / transform.value.scale
  const y = (event.clientY - rect.top - transform.value.translateY) / transform.value.scale
  
  // Check if clicking on a detection
  const clickedDetection = props.detections.find(detection => 
    x >= detection.x && x <= detection.x + detection.width &&
    y >= detection.y && y <= detection.y + detection.height
  )
  
  if (clickedDetection) {
    emit('detection-select', clickedDetection)
  } else {
    emit('detection-select', null)
    // Start panning
    isDragging.value = true
    lastMousePos.value = { x: event.clientX, y: event.clientY }
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - lastMousePos.value.x
  const deltaY = event.clientY - lastMousePos.value.y
  
  transform.value.translateX += deltaX
  transform.value.translateY += deltaY
  
  lastMousePos.value = { x: event.clientX, y: event.clientY }
  updateCanvasTransform()
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  if (!canvas.value) return
  
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(minScale, Math.min(maxScale, transform.value.scale * scaleFactor))
  
  if (newScale !== transform.value.scale) {
    // Zoom towards mouse position
    const scaleChange = newScale / transform.value.scale
    transform.value.translateX = mouseX - (mouseX - transform.value.translateX) * scaleChange
    transform.value.translateY = mouseY - (mouseY - transform.value.translateY) * scaleChange
    transform.value.scale = newScale
    
    updateCanvasTransform()
  }
}

// Control functions
const zoomIn = () => {
  const newScale = Math.min(maxScale, transform.value.scale * 1.2)
  if (newScale !== transform.value.scale) {
    transform.value.scale = newScale
    updateCanvasTransform()
  }
}

const zoomOut = () => {
  const newScale = Math.max(minScale, transform.value.scale / 1.2)
  if (newScale !== transform.value.scale) {
    transform.value.scale = newScale
    updateCanvasTransform()
  }
}

const fitToWindow = () => {
  if (!image.value || !canvasContainer.value) return
  
  const container = canvasContainer.value
  const containerRect = container.getBoundingClientRect()
  
  const scaleX = (containerRect.width - 40) / image.value.width
  const scaleY = (containerRect.height - 40) / image.value.height
  const newScale = Math.min(scaleX, scaleY, 1)
  
  transform.value = {
    scale: newScale,
    translateX: (containerRect.width - image.value.width * newScale) / 2,
    translateY: (containerRect.height - image.value.height * newScale) / 2
  }
  
  updateCanvasTransform()
}

const resetView = () => {
  if (!image.value) return
  
  transform.value = {
    scale: 1,
    translateX: 0,
    translateY: 0
  }
  
  updateCanvasTransform()
}

const handleWindowResize = () => {
  // Recenter canvas on window resize
  if (image.value) {
    fitToWindow()
  }
}

const setupEventListeners = () => {
  window.addEventListener('resize', handleWindowResize)
}
</script>

<style scoped>
.flooria-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-canvas {
  cursor: grab;
  transition: transform 0.1s ease-out;
}

.main-canvas:active {
  cursor: grabbing;
}

.canvas-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}

.control-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.control-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #64748b;
}

.empty-state {
  text-align: center;
  color: #64748b;
  max-width: 300px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  stroke-width: 1.5;
  color: #cbd5e1;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-state p {
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .canvas-controls {
    top: 0.5rem;
    right: 0.5rem;
  }
  
  .control-btn {
    width: 36px;
    height: 36px;
  }
  
  .control-btn svg {
    width: 18px;
    height: 18px;
  }
}
</style>

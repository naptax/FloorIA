<template>
  <div id="app">
    <!-- Header Component -->
    <FlooriaHeader 
      :is-authenticated="isAuthenticated"
      :user="currentUser"
      @login="showAuthModal"
      @logout="handleLogout"
    />
    
    <!-- Test Mode Toggle (only visible with ?modetest parameter) -->
    <div v-if="showTestModeButton" class="test-mode-toggle">
      <button 
        @click="showTestPage = !showTestPage" 
        class="btn-test-toggle"
        :class="{ active: showTestPage }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
        {{ showTestPage ? 'Mode Normal' : 'Mode Test' }}
      </button>
    </div>
    
    <!-- Test Page or Main Content -->
    <TechnicalTestPage v-if="showTestPage" />
    
    <!-- Login Screen - When not authenticated -->
    <div v-else-if="!isAuthenticated" class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>FloorIA</h2>
          <p>Connexion requise pour accéder à l'application</p>
        </div>
        <div class="login-actions">
          <button @click="showAuthModal" class="login-btn">
            Se connecter
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main Content - Only if authenticated -->
    <div v-else-if="isAuthenticated" class="main-container">
      <!-- Main Section: Sidebar + Canvas + Detection Table -->
      <div class="main-section">
        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Toolbar -->
          <FlooriaToolbar 
            :hasFile="!!currentImageSrc"
            :hasDetections="detections.length > 0"
            @file-selected="handleFileSelected"
            @analyze="handleAnalyze"
            @export="handleExport"
          />
          
          <!-- Progress Gauge -->
          <FlooriaProgressGauge 
            v-if="isAnalyzing"
            :progress="analysisProgress"
          />
          
          <!-- Summary Stats Only -->
          <div v-if="detections.length > 0" class="detection-summary-sidebar">
            <h4 class="summary-title">Résumé des détections</h4>
            <div class="summary-stats">
              <div
                v-for="(count, type) in detectionStats"
                :key="type"
                class="stat-item"
              >
                <div 
                  class="stat-indicator"
                  :style="{ backgroundColor: getElementColor(type) }"
                ></div>
                <span class="stat-label">{{ formatClassName(type) }}</span>
                <span class="stat-count">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Content Area: Canvas + Detection Table -->
        <div class="content-area">
          <!-- Canvas Area -->
          <div class="canvas-container">
            <FlooriaCanvas 
              ref="canvasRef"
              :image-src="currentImageSrc"
              :detections="detections"
              :selected-detection="selectedDetection"
              @detection-select="handleDetectionSelect"
              @canvas-ready="handleCanvasReady"
            />
          </div>
          
          <!-- Detection Table (Right Panel) -->
          <div v-if="detections.length > 0" class="detection-panel-right">
            <FlooriaDetectionPanel 
              :detections="detections"
              :selected-detection="selectedDetection"
              @detection-select="handleDetectionSelect"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <FlooriaFooter />
    
    <!-- Auth Modal -->
    <FlooriaAuthModal 
      v-if="showAuthModalState"
      @close="showAuthModalState = false"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import FlooriaHeader from './components/FlooriaHeader.vue'
import FlooriaToolbar from './components/FlooriaToolbar.vue'
import FlooriaCanvas from './components/FlooriaCanvas.vue'
import FlooriaDetectionPanel from './components/FlooriaDetectionPanel.vue'
import FlooriaProgressGauge from './components/FlooriaProgressGauge.vue'
import FlooriaFooter from './components/FlooriaFooter.vue'
import FlooriaAuthModal from './components/FlooriaAuthModal.vue'
import TechnicalTestPage from './components/TechnicalTestPage.vue'
import { authManager, type AuthUser } from './supabaseClient'
import type { Detection } from './types/types'

// Type alias for compatibility
type User = AuthUser

// Reactive state
const isAuthenticated = ref(false)
const currentUser = ref<User | null>(null)
const showAuthModalState = ref(false)
const showTestPage = ref(false)
const showTestModeButton = ref(false)
const currentImageSrc = ref<string | null>(null)
const currentImageFilename = ref<string>('')
const detections = ref<Detection[]>([])
const selectedDetection = ref<Detection | null>(null)
const isAnalyzing = ref(false)
const analysisProgress = ref(0)
const canvasRef = ref<any>(null)

// Auth methods
const showAuthModal = () => {
  showAuthModalState.value = true
}

const handleLoginSuccess = (user: User) => {
  currentUser.value = user
  isAuthenticated.value = true
  showAuthModalState.value = false
  console.log('User logged in:', user)
}

const handleLogout = async () => {
  try {
    const result = await authManager.signOut()
    if (result.success) {
      currentUser.value = null
      isAuthenticated.value = false
      console.log('User logged out')
    } else {
      console.error('Logout error:', result.message)
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// File handling
const handleFileSelected = (file: File) => {
  // Clear previous analysis data when loading new image
  detections.value = []
  selectedDetection.value = null
  
  currentImageFilename.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    currentImageSrc.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Analysis methods
const handleAnalyze = async () => {
  console.log('🔍 Starting analysis...')
  if (!currentImageSrc.value) {
    console.error('❌ No image source available')
    return
  }
  
  isAnalyzing.value = true
  analysisProgress.value = 0
  detections.value = []
  
  try {
    console.log('📊 Setting up progress simulation...')
    // Simulate progress
    const progressInterval = setInterval(() => {
      analysisProgress.value += 10
      console.log(`📈 Progress: ${analysisProgress.value}%`)
      if (analysisProgress.value >= 90) {
        clearInterval(progressInterval)
      }
    }, 200)
    
    console.log('🖼️ Converting image to blob...')
    // Call API for analysis
    const formData = new FormData()
    const blob = await fetch(currentImageSrc.value).then(r => r.blob())
    console.log('📦 Blob created:', blob.size, 'bytes, type:', blob.type)
    
    formData.append('image', blob, currentImageFilename.value)
    console.log('📝 FormData field name: "image" (matching backend expectation)')
    
    const authToken = authManager.getAuthToken()
    console.log('🔐 Auth token:', authToken ? 'Present' : 'Missing')
    console.log('👤 Current user:', currentUser.value?.email || 'Not logged in')
    console.log('📤 Sending request to /api/analyze...')
    
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    
    // Use API_BASE_URL from environment variables
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const backendUrl = `${API_BASE_URL}/analyze`
    console.log('🎯 Calling backend:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
      headers
    })
    
    console.log('📥 Response received:', response.status, response.statusText)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Analysis result:', result)
      console.log('🔍 Raw detections from backend:', result.detections)
      console.log('📊 Number of detections:', result.detections?.length || 0)
      
      // Check if we have a converted image from PDF
      if (result.converted_image) {
        console.log('📄 PDF converted image received, updating canvas source')
        currentImageSrc.value = result.converted_image
        // Show success message for PDF conversion
        console.log('✅ PDF converti avec succès en image pour l\'analyse')
      }
      
      if (result.detections && result.detections.length > 0) {
        console.log('🔬 First detection sample:', result.detections[0])
        console.log('🏷️ Detection keys:', Object.keys(result.detections[0]))
      }
      
      // Transform backend format to Vue.js format
      const transformedDetections = (result.detections || []).map((detection: any, index: number) => {
        const transformed = {
          id: `detection_${index}`,
          class: detection.label || detection.class || 'unknown',
          confidence: detection.confidence || 0,
          x: detection.bbox?.x || detection.x || 0,
          y: detection.bbox?.y || detection.y || 0,
          width: detection.bbox?.width || detection.width || 0,
          height: detection.bbox?.height || detection.height || 0
        }
        return transformed
      })
      
      console.log('🔄 Transformed detections:', transformedDetections.length)
      if (transformedDetections.length > 0) {
        console.log('✨ First transformed detection:', transformedDetections[0])
      }
      
      detections.value = transformedDetections
      console.log('📋 Detections assigned to Vue state:', detections.value.length)
      analysisProgress.value = 100
      clearInterval(progressInterval)
    } else {
      const errorText = await response.text()
      console.error('❌ Analysis failed:', response.status, errorText)
      throw new Error(`Analysis failed: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('❌ Analysis error:', error)
  } finally {
    console.log('🏁 Analysis completed, cleaning up...')
    setTimeout(() => {
      isAnalyzing.value = false
      analysisProgress.value = 0
    }, 500)
  }
}

// Export methods
const handleExport = () => {
  if (detections.value.length === 0) return
  
  const exportData = {
    image: currentImageFilename.value,
    timestamp: new Date().toISOString(),
    detections: detections.value
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentImageFilename.value.replace(/\.[^/.]+$/, '')}-analysis.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Detection selection
const handleDetectionSelect = (detection: Detection | null) => {
  selectedDetection.value = detection
}



// Canvas events
const handleCanvasReady = () => {
  console.log('Canvas is ready')
}

// Detection statistics and utilities (for sidebar summary)
const detectionStats = computed(() => {
  const stats: Record<string, number> = {}
  detections.value.forEach(detection => {
    stats[detection.class] = (stats[detection.class] || 0) + 1
  })
  return stats
})

const getElementColor = (className: string): string => {
  const elementColors: Record<string, string> = {
    'mur': '#4fc3f7',
    'porte': '#66bb6a', 
    'fenêtre': '#ffa726',
    'pièce': '#ab47bc'
  }
  return elementColors[className] || '#64748b'
}

const formatClassName = (className: string): string => {
  const classNames: Record<string, string> = {
    'mur': 'Mur',
    'porte': 'Porte',
    'fenêtre': 'Fenêtre',
    'pièce': 'Pièce'
  }
  return classNames[className] || className.charAt(0).toUpperCase() + className.slice(1)
}

// Initialize authentication
onMounted(async () => {
  try {
    // Check for test mode parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    showTestModeButton.value = urlParams.has('modetest')
    
    console.log('🧪 Test mode button visibility:', showTestModeButton.value ? 'VISIBLE' : 'HIDDEN')
    if (showTestModeButton.value) {
      console.log('🔧 Test mode enabled via URL parameter: ?modetest')
    }
    
    const user = authManager.getCurrentUser()
    if (user) {
      currentUser.value = user
      isAuthenticated.value = true
    }
    
    // Listen for auth state changes
    authManager.onAuthStateChange((user) => {
      currentUser.value = user
      isAuthenticated.value = !!user
    })
  } catch (error) {
    console.error('Auth initialization error:', error)
  }
})

// Provide global state for child components
provide('authState', {
  isAuthenticated,
  currentUser
})
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Lato, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #1a1b26;
  color: #c0caf5;
  font-weight: 400;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.test-mode-toggle {
  background: #1a1b26;
  padding: 0.75rem;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #24283b;
}

.btn-test-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #24283b;
  color: #c0caf5;
  border: 1px solid #414868;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-test-toggle:hover {
  background: #414868;
  border-color: #565f89;
}

.btn-test-toggle.active {
  background: #bb9af7;
  border-color: #bb9af7;
  color: #1a1b26;
}

.btn-test-toggle svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px); /* Account for header and footer */
}

.main-section {
  display: flex;
  flex: 1;
  min-height: 0; /* Allow flex shrinking */
}

.sidebar {
  width: 240px;
  background: #24283b;
  border-right: 1px solid #414868;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 2px 0 4px rgba(26, 27, 38, 0.3);
}

.content-area {
  flex: 1;
  display: flex;
  min-height: 0;
}

.canvas-container {
  flex: 1;
  max-width: 50%;
  position: relative;
  background: #1a1b26;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0; /* Allow flex shrinking */
}

.detection-panel-right {
  flex: 1;
  max-width: 50%;
  min-width: 500px;
  background: #24283b;
  border-left: 2px solid #bb9af7;
  overflow: auto;
  box-shadow: -4px 0 12px rgba(187, 154, 247, 0.2);
  display: flex;
  flex-direction: column;
}

/* Sidebar summary styles */
.detection-summary-sidebar {
  padding: 1rem 1.5rem;
  background: #1a1b26;
  border-top: 1px solid #414868;
}

.summary-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #c0caf5;
  margin: 0 0 0.75rem 0;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.stat-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  margin-right: 0.25rem;
}

.stat-label {
  flex: 1;
  color: #9aa5ce;
  font-weight: 500;
}

.stat-count {
  color: #1a1b26;
  font-weight: 600;
  background: #bb9af7;
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

/* Login screen styles */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1b26 0%, #24283b 100%);
  font-family: Lato, system-ui, sans-serif;
}

.login-card {
  background: #24283b;
  border: 1px solid #414868;
  border-radius: 12px;
  padding: 3rem 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.login-header h2 {
  color: #c0caf5;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #7aa2f7, #bb9af7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header p {
  color: #9aa5ce;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.login-btn {
  background: linear-gradient(135deg, #7aa2f7, #bb9af7);
  color: #1a1b26;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(122, 162, 247, 0.3);
  font-family: Lato, system-ui, sans-serif;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(122, 162, 247, 0.4);
  background: linear-gradient(135deg, #bb9af7, #7dcfff);
}

/* Responsive design */
@media (max-width: 1024px) {
  .detection-panel-right {
    min-width: 450px;
  }
}

@media (max-width: 768px) {
  .main-section {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #414868;
  }
  
  .content-area {
    flex-direction: column;
  }
  
  .canvas-container {
    max-width: 100%;
    height: 300px;
    min-height: 300px;
  }
  
  .detection-panel-right {
    max-width: 100%;
    min-width: 100%;
    height: 300px;
    border-left: none;
    border-top: 2px solid #bb9af7;
    box-shadow: 0 -4px 12px rgba(187, 154, 247, 0.2);
  }
}
</style>

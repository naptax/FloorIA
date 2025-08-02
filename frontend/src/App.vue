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
    
    <!-- Main Content -->
    <div v-else class="main-container">
      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Toolbar -->
        <FlooriaToolbar 
          :hasFile="!!currentImageSrc"
          :hasDetections="detections.length > 0"
          @file-selected="handleFileSelected"
          @analyze="handleAnalyze"
          @export="handleExport"
          @calibrate="handleCalibrate"
        />
        
        <!-- Progress Gauge -->
        <FlooriaProgressGauge 
          v-if="isAnalyzing"
          :progress="analysisProgress"
        />
        
        <!-- Detection Panel -->
        <FlooriaDetectionPanel 
          :detections="detections"
          :selected-detection="selectedDetection"
          @detection-select="handleDetectionSelect"
        />
      </div>
      
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
        
        <!-- Scale Calibrator -->
        <FlooriaScaleCalibrator 
          v-if="showCalibrator"
          @calibration-complete="handleCalibrationComplete"
          @close="showCalibrator = false"
        />
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
import { ref, onMounted, provide } from 'vue'
import FlooriaHeader from './components/FlooriaHeader.vue'
import FlooriaToolbar from './components/FlooriaToolbar.vue'
import FlooriaCanvas from './components/FlooriaCanvas.vue'
import FlooriaDetectionPanel from './components/FlooriaDetectionPanel.vue'
import FlooriaProgressGauge from './components/FlooriaProgressGauge.vue'
import FlooriaScaleCalibrator from './components/FlooriaScaleCalibrator.vue'
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
const showCalibrator = ref(false)
const canvasRef = ref()

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
    
    // Bypass Vite proxy and call backend directly
    const backendUrl = 'http://localhost:8000/analyze'
    console.log('🎯 Calling backend directly:', backendUrl)
    
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

// Calibration
const handleCalibrate = () => {
  showCalibrator.value = true
}

const handleCalibrationComplete = (scale: number) => {
  console.log('Calibration complete:', scale)
  showCalibrator.value = false
}

// Canvas events
const handleCanvasReady = () => {
  console.log('Canvas is ready')
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f8fafc;
  color: #334155;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.test-mode-toggle {
  background: #1e293b;
  padding: 0.75rem;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #334155;
}

.btn-test-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #374151;
  color: #e5e7eb;
  border: 1px solid #4b5563;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-test-toggle:hover {
  background: #4b5563;
  border-color: #6b7280;
}

.btn-test-toggle.active {
  background: #3b82f6;
  border-color: #2563eb;
  color: white;
}

.btn-test-toggle svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.main-container {
  flex: 1;
  display: flex;
  height: calc(100vh - 120px); /* Account for header and footer */
}

.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.canvas-container {
  flex: 1;
  position: relative;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 300px;
  }
  
  .canvas-container {
    height: calc(100vh - 420px);
  }
}
</style>

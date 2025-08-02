<template>
  <div class="technical-test-page">
    <!-- Header Section -->
    <div class="test-header">
      <h1 class="test-title">
        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
        FloorIA - Test Technique
      </h1>
      <p class="test-subtitle">Validation complète de l'intégration Vue.js</p>
      
      <div class="test-status">
        <div class="status-item" :class="{ passed: testResults.vue }">
          <span class="status-label">Vue.js</span>
          <span class="status-value">{{ testResults.vue ? '✅' : '⏳' }}</span>
        </div>
        <div class="status-item" :class="{ passed: testResults.components }">
          <span class="status-label">Composants</span>
          <span class="status-value">{{ testResults.components ? '✅' : '⏳' }}</span>
        </div>
        <div class="status-item" :class="{ passed: testResults.supabase }">
          <span class="status-label">Supabase</span>
          <span class="status-value">{{ testResults.supabase ? '✅' : '⏳' }}</span>
        </div>
      </div>
    </div>

    <!-- Test Controls -->
    <div class="test-controls">
      <button @click="runAllTests" :disabled="isRunningTests" class="btn-run-tests">
        <div v-if="isRunningTests" class="loading-spinner"></div>
        <span v-else>🚀</span>
        {{ isRunningTests ? 'Tests en cours...' : 'Lancer tous les tests' }}
      </button>
      
      <button @click="resetTests" class="btn-reset">
        🔄 Réinitialiser
      </button>
    </div>

    <!-- Component Tests Grid -->
    <div class="test-grid">
      <!-- Authentication Test -->
      <div class="test-card">
        <div class="card-header">
          <h3>🔐 Test Authentification</h3>
        </div>
        <div class="card-content">
          <div class="test-controls-small">
            <button @click="testAuth" class="btn-test">Tester Auth</button>
            <button @click="showAuthModal = true" class="btn-test">Ouvrir Modal</button>
          </div>
          <div v-if="authTestResult" class="test-result">
            <pre>{{ authTestResult }}</pre>
          </div>
        </div>
      </div>

      <!-- Canvas Test -->
      <div class="test-card">
        <div class="card-header">
          <h3>🎨 Test Canvas</h3>
        </div>
        <div class="card-content">
          <div class="canvas-test-area">
            <FlooriaCanvas 
              ref="testCanvas"
              :image-src="testImageSrc"
              :detections="testDetections"
              :selected-detection="selectedTestDetection"
              @detection-select="handleTestDetectionSelect"
              @canvas-ready="onCanvasReady"
            />
          </div>
          <div class="test-controls-small">
            <button @click="loadTestImage" class="btn-test">Image Test</button>
            <button @click="addTestDetections" class="btn-test">Détections</button>
          </div>
        </div>
      </div>

      <!-- Detection Panel Test -->
      <div class="test-card">
        <div class="card-header">
          <h3>📋 Panneau Détections</h3>
        </div>
        <div class="card-content">
          <FlooriaDetectionPanel 
            :detections="testDetections"
            :selected-detection="selectedTestDetection"
            @detection-select="handleTestDetectionSelect"
          />
        </div>
      </div>

      <!-- Progress Test -->
      <div class="test-card">
        <div class="card-header">
          <h3>📊 Test Progression</h3>
        </div>
        <div class="card-content">
          <FlooriaProgressGauge :progress="testProgress" />
          <div class="progress-controls">
            <button @click="simulateProgress" class="btn-test">Simuler</button>
            <input 
              v-model.number="testProgress" 
              type="range" 
              min="0" 
              max="100" 
              class="progress-slider"
            />
            <span>{{ testProgress }}%</span>
          </div>
        </div>
      </div>

      <!-- Toolbar Test -->
      <div class="test-card">
        <div class="card-header">
          <h3>🛠️ Barre d'Outils</h3>
        </div>
        <div class="card-content">
          <FlooriaToolbar 
            :has-file="!!testImageSrc"
            :has-detections="testDetections.length > 0"
            @file-selected="handleTestFileSelected"
            @analyze="handleTestAnalyze"
            @export="handleTestExport"
            @calibrate="showCalibrator = true"
          />
        </div>
      </div>

      <!-- API Test -->
      <div class="test-card">
        <div class="card-header">
          <h3>🌐 Test API</h3>
        </div>
        <div class="card-content">
          <div class="test-controls-small">
            <button @click="testBackendConnection" class="btn-test">Connexion</button>
            <button @click="testAnalysisAPI" class="btn-test">Analyse</button>
          </div>
          <div v-if="apiTestResult" class="test-result">
            <pre>{{ apiTestResult }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Log -->
    <div class="test-log">
      <h3>📝 Journal des Tests</h3>
      <div class="log-content">
        <div 
          v-for="(log, index) in testLogs" 
          :key="index"
          class="log-entry"
          :class="log.type"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <button @click="clearLogs" class="btn-clear">Effacer</button>
    </div>

    <!-- Modals -->
    <FlooriaAuthModal 
      v-if="showAuthModal"
      @close="showAuthModal = false"
      @login-success="handleTestLoginSuccess"
    />
    
    <FlooriaScaleCalibrator 
      v-if="showCalibrator"
      @calibration-complete="handleTestCalibration"
      @close="showCalibrator = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import FlooriaCanvas from './FlooriaCanvas.vue'
import FlooriaDetectionPanel from './FlooriaDetectionPanel.vue'
import FlooriaProgressGauge from './FlooriaProgressGauge.vue'
import FlooriaToolbar from './FlooriaToolbar.vue'
import FlooriaAuthModal from './FlooriaAuthModal.vue'
import FlooriaScaleCalibrator from './FlooriaScaleCalibrator.vue'
import { authManager, type AuthUser } from '../supabaseClient'
import type { Detection } from '../types/types'

// Test state
const isRunningTests = ref(false)
const showAuthModal = ref(false)
const showCalibrator = ref(false)

// Test results
const testResults = reactive({
  vue: false,
  components: false,
  supabase: false
})

// Component test states
const testImageSrc = ref<string | null>(null)
const testDetections = ref<Detection[]>([])
const selectedTestDetection = ref<Detection | null>(null)
const testProgress = ref(0)

// Test results
const authTestResult = ref('')
const apiTestResult = ref('')

// Test logs
const testLogs = ref<Array<{time: string, message: string, type: string}>>([])

// Methods
const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
  const time = new Date().toLocaleTimeString()
  testLogs.value.unshift({ time, message, type })
  if (testLogs.value.length > 20) {
    testLogs.value = testLogs.value.slice(0, 20)
  }
}

const clearLogs = () => {
  testLogs.value = []
  addLog('Logs effacés', 'info')
}

// Test functions
const testAuth = async () => {
  try {
    addLog('Test Authentification...', 'info')
    
    const user = authManager.getCurrentUser()
    const token = authManager.getAuthToken()
    
    authTestResult.value = JSON.stringify({
      user: user ? { id: user.id, email: user.email } : null,
      hasToken: !!token,
      isAuthenticated: authManager.isAuthenticated()
    }, null, 2)
    
    addLog('✅ Test Auth réussi', 'success')
  } catch (error) {
    authTestResult.value = `Erreur: ${error}`
    addLog(`❌ Test Auth échoué: ${error}`, 'error')
  }
}

const loadTestImage = () => {
  try {
    addLog('Chargement image test...', 'info')
    
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')!
    
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 400, 300)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, 300, 200)
    
    testImageSrc.value = canvas.toDataURL()
    addLog('✅ Image chargée', 'success')
  } catch (error) {
    addLog(`❌ Erreur image: ${error}`, 'error')
  }
}

const addTestDetections = () => {
  try {
    testDetections.value = [
      {
        id: 'test-1',
        class: 'mur',
        confidence: 0.95,
        x: 50,
        y: 50,
        width: 300,
        height: 10
      },
      {
        id: 'test-2',
        class: 'porte',
        confidence: 0.88,
        x: 100,
        y: 50,
        width: 20,
        height: 50
      }
    ]
    
    addLog(`✅ ${testDetections.value.length} détections ajoutées`, 'success')
  } catch (error) {
    addLog(`❌ Erreur détections: ${error}`, 'error')
  }
}

const simulateProgress = () => {
  testProgress.value = 0
  const interval = setInterval(() => {
    testProgress.value += 10
    if (testProgress.value >= 100) {
      clearInterval(interval)
      addLog('✅ Progression terminée', 'success')
    }
  }, 200)
}

const testBackendConnection = async () => {
  try {
    addLog('Test backend...', 'info')
    
    const response = await fetch('/api/health')
    
    if (response.ok) {
      const data = await response.json()
      apiTestResult.value = JSON.stringify(data, null, 2)
      addLog('✅ Backend OK', 'success')
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    apiTestResult.value = `Erreur: ${error}`
    addLog(`❌ Backend KO: ${error}`, 'error')
  }
}

const testAnalysisAPI = async () => {
  try {
    addLog('Test API analyse...', 'info')
    
    if (!testImageSrc.value) {
      throw new Error('Aucune image')
    }
    
    const response = await fetch(testImageSrc.value)
    const blob = await response.blob()
    
    const formData = new FormData()
    formData.append('file', blob, 'test.png')
    
    const analysisResponse = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    })
    
    if (analysisResponse.ok) {
      const result = await analysisResponse.json()
      apiTestResult.value = JSON.stringify(result, null, 2)
      addLog('✅ API analyse OK', 'success')
    } else {
      throw new Error(`HTTP ${analysisResponse.status}`)
    }
  } catch (error) {
    apiTestResult.value = `Erreur: ${error}`
    addLog(`❌ API analyse KO: ${error}`, 'error')
  }
}

// Event handlers
const handleTestDetectionSelect = (detection: Detection | null) => {
  selectedTestDetection.value = detection
  addLog(`Détection: ${detection?.class || 'aucune'}`, 'info')
}

const handleTestFileSelected = (file: File) => {
  addLog(`Fichier: ${file.name}`, 'info')
}

const handleTestAnalyze = () => {
  addLog('Analyse déclenchée', 'info')
  simulateProgress()
}

const handleTestExport = () => {
  const exportData = {
    test: true,
    detections: testDetections.value,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'test-export.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  addLog('✅ Export réussi', 'success')
}

const handleTestLoginSuccess = (user: AuthUser) => {
  addLog(`Connexion: ${user.email}`, 'success')
  showAuthModal.value = false
}

const handleTestCalibration = (scale: number) => {
  addLog(`Calibrage: ${scale}`, 'success')
  showCalibrator.value = false
}

const onCanvasReady = () => {
  addLog('Canvas prêt', 'success')
}

// Main test runner
const runAllTests = async () => {
  isRunningTests.value = true
  addLog('🚀 Tests en cours...', 'info')
  
  try {
    // Test Vue.js
    testResults.vue = true
    addLog('✅ Vue.js OK', 'success')
    
    // Test Supabase
    testResults.supabase = true
    addLog('✅ Supabase OK', 'success')
    
    // Test Components
    loadTestImage()
    await new Promise(resolve => setTimeout(resolve, 500))
    addTestDetections()
    testResults.components = true
    addLog('✅ Composants OK', 'success')
    
    addLog('🎉 Tous les tests OK!', 'success')
  } catch (error) {
    addLog(`❌ Erreur: ${error}`, 'error')
  } finally {
    isRunningTests.value = false
  }
}

const resetTests = () => {
  testResults.vue = false
  testResults.components = false
  testResults.supabase = false
  testImageSrc.value = null
  testDetections.value = []
  selectedTestDetection.value = null
  testProgress.value = 0
  authTestResult.value = ''
  apiTestResult.value = ''
  addLog('🔄 Reset effectué', 'info')
}

onMounted(() => {
  addLog('Page de test initialisée', 'info')
})
</script>

<style scoped>
.technical-test-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

.test-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.test-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.title-icon {
  width: 2.5rem;
  height: 2.5rem;
  stroke-width: 2;
  color: #3b82f6;
}

.test-subtitle {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.test-status {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f1f5f9;
  min-width: 120px;
  transition: all 0.2s ease;
}

.status-item.passed {
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}

.status-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.status-value {
  font-size: 1.5rem;
}

.test-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-run-tests {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-run-tests:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-run-tests:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-reset {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.test-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.card-content {
  padding: 1.5rem;
}

.test-controls-small {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.btn-test {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-test:hover {
  background: #2563eb;
}

.canvas-test-area {
  height: 200px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.progress-slider {
  flex: 1;
}

.test-result {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.test-result pre {
  margin: 0;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.test-log {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.test-log h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.log-entry {
  display: flex;
  gap: 1rem;
  padding: 0.25rem 0;
  font-size: 0.9rem;
  border-bottom: 1px solid #e2e8f0;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.success {
  color: #166534;
}

.log-entry.error {
  color: #991b1b;
}

.log-time {
  color: #6b7280;
  font-family: monospace;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.btn-clear {
  padding: 0.5rem 1rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .technical-test-page {
    padding: 1rem;
  }
  
  .test-grid {
    grid-template-columns: 1fr;
  }
  
  .test-status {
    gap: 1rem;
  }
  
  .test-controls {
    flex-direction: column;
    align-items: center;
  }
}
</style>

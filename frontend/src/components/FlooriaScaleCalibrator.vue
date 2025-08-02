<template>
  <div class="flooria-scale-calibrator">
    <div class="calibrator-overlay" @click="$emit('close')"></div>
    
    <div class="calibrator-modal">
      <div class="modal-header">
        <h3 class="modal-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          Calibrage de l'échelle
        </h3>
        <button @click="$emit('close')" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-content">
        <div class="step-indicator">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <span>Sélectionner une référence</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <span>Mesurer la distance</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-number">3</div>
            <span>Définir l'échelle</span>
          </div>
        </div>
        
        <!-- Step 1: Instructions -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="instruction-card">
            <svg class="instruction-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <h4>Sélectionnez une référence connue</h4>
            <p>Cliquez sur deux points du plan pour mesurer une distance dont vous connaissez la valeur réelle (ex: largeur d'une porte, longueur d'un mur).</p>
            <button @click="startMeasurement" class="btn-primary">
              Commencer la mesure
            </button>
          </div>
        </div>
        
        <!-- Step 2: Measurement -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="measurement-info">
            <h4>Cliquez sur deux points pour mesurer</h4>
            <p>Points sélectionnés: {{ selectedPoints.length }}/2</p>
            
            <div v-if="selectedPoints.length === 2" class="measurement-result">
              <div class="measured-distance">
                <span class="label">Distance mesurée:</span>
                <span class="value">{{ Math.round(measuredDistance) }} pixels</span>
              </div>
              <button @click="nextStep" class="btn-primary">
                Continuer
              </button>
            </div>
          </div>
        </div>
        
        <!-- Step 3: Scale Definition -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="scale-form">
            <h4>Définir l'échelle réelle</h4>
            <p>La distance mesurée ({{ Math.round(measuredDistance) }} pixels) correspond à quelle distance réelle ?</p>
            
            <div class="form-group">
              <label for="realDistance">Distance réelle:</label>
              <div class="input-group">
                <input
                  id="realDistance"
                  v-model.number="realDistance"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Ex: 0.8"
                  class="distance-input"
                />
                <select v-model="unit" class="unit-select">
                  <option value="m">mètres</option>
                  <option value="cm">centimètres</option>
                  <option value="mm">millimètres</option>
                  <option value="ft">pieds</option>
                  <option value="in">pouces</option>
                </select>
              </div>
            </div>
            
            <div v-if="realDistance > 0" class="scale-preview">
              <div class="scale-info">
                <span class="label">Échelle calculée:</span>
                <span class="value">1 pixel = {{ scaleRatio.toFixed(4) }} {{ unit }}</span>
              </div>
            </div>
            
            <div class="form-actions">
              <button @click="previousStep" class="btn-secondary">
                Retour
              </button>
              <button 
                @click="applyCalibration" 
                :disabled="realDistance <= 0"
                class="btn-primary"
              >
                Appliquer le calibrage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  'calibration-complete': [scale: number]
  close: []
}>()

// State
const currentStep = ref(1)
const selectedPoints = ref<Array<{x: number, y: number}>>([])
const realDistance = ref(0)
const unit = ref('m')

// Computed
const measuredDistance = computed(() => {
  if (selectedPoints.value.length !== 2) return 0
  const [p1, p2] = selectedPoints.value
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
})

const scaleRatio = computed(() => {
  if (measuredDistance.value === 0 || realDistance.value === 0) return 0
  return realDistance.value / measuredDistance.value
})

// Methods
const startMeasurement = () => {
  currentStep.value = 2
  selectedPoints.value = []
  // Here you would typically enable click listeners on the canvas
}

const nextStep = () => {
  currentStep.value = 3
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const applyCalibration = () => {
  if (scaleRatio.value > 0) {
    emit('calibration-complete', scaleRatio.value)
  }
}
</script>

<style scoped>
.flooria-scale-calibrator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calibrator-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.calibrator-modal {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.title-icon {
  width: 22px;
  height: 22px;
  stroke-width: 2;
  color: #3b82f6;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #6b7280;
}

.modal-content {
  padding: 1.5rem;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.step-indicator::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.step.active .step-number {
  background: #3b82f6;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step span {
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
}

.step.active span {
  color: #374151;
  font-weight: 600;
}

.step-content {
  min-height: 200px;
}

.instruction-card {
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.instruction-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  stroke-width: 1.5;
  color: #3b82f6;
}

.instruction-card h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.instruction-card p {
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.measurement-info {
  text-align: center;
}

.measurement-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.measurement-info p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.measurement-result {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.measured-distance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.measured-distance .label {
  color: #374151;
  font-weight: 500;
}

.measured-distance .value {
  color: #0369a1;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
}

.scale-form h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.scale-form p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.distance-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.distance-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.unit-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  min-width: 120px;
}

.unit-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.scale-preview {
  background: #f0fdf4;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
  margin-bottom: 1.5rem;
}

.scale-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scale-info .label {
  color: #374151;
  font-weight: 500;
}

.scale-info .value {
  color: #166534;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

@media (max-width: 768px) {
  .calibrator-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .step span {
    font-size: 0.7rem;
  }
  
  .instruction-card {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>

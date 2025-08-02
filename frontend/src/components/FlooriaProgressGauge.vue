<template>
  <div class="flooria-progress-gauge">
    <div class="gauge-header">
      <h3 class="gauge-title">
        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        Analyse en cours
      </h3>
    </div>
    
    <div class="gauge-container">
      <!-- Circular Progress -->
      <div class="circular-progress">
        <svg class="progress-ring" width="120" height="120">
          <circle
            class="progress-ring-background"
            cx="60"
            cy="60"
            r="50"
            fill="transparent"
            stroke="#e2e8f0"
            stroke-width="8"
          />
          <circle
            class="progress-ring-progress"
            cx="60"
            cy="60"
            r="50"
            fill="transparent"
            stroke="url(#progressGradient)"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            transform="rotate(-90 60 60)"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
        
        <div class="progress-content">
          <div class="progress-percentage">{{ Math.round(progress) }}%</div>
          <div class="progress-label">{{ getProgressLabel() }}</div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="linear-progress">
        <div class="progress-bar-background">
          <div 
            class="progress-bar-fill"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
      
      <!-- Status Messages -->
      <div class="status-messages">
        <div class="status-item" :class="{ active: progress >= 0 }">
          <div class="status-icon">
            <svg v-if="progress >= 25" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <div v-else class="loading-spinner"></div>
          </div>
          <span>Préparation de l'image</span>
        </div>
        
        <div class="status-item" :class="{ active: progress >= 25 }">
          <div class="status-icon">
            <svg v-if="progress >= 50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <div v-else-if="progress >= 25" class="loading-spinner"></div>
          </div>
          <span>Analyse des éléments</span>
        </div>
        
        <div class="status-item" :class="{ active: progress >= 50 }">
          <div class="status-icon">
            <svg v-if="progress >= 75" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <div v-else-if="progress >= 50" class="loading-spinner"></div>
          </div>
          <span>Classification des objets</span>
        </div>
        
        <div class="status-item" :class="{ active: progress >= 75 }">
          <div class="status-icon">
            <svg v-if="progress >= 100" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <div v-else-if="progress >= 75" class="loading-spinner"></div>
          </div>
          <span>Finalisation des résultats</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  progress: number
}

const props = defineProps<Props>()

// Constants for circular progress
const radius = 50
const circumference = 2 * Math.PI * radius

// Computed properties
const strokeDashoffset = computed(() => {
  return circumference - (props.progress / 100) * circumference
})

const getProgressLabel = () => {
  if (props.progress < 25) return 'Initialisation...'
  if (props.progress < 50) return 'Analyse...'
  if (props.progress < 75) return 'Classification...'
  if (props.progress < 100) return 'Finalisation...'
  return 'Terminé !'
}
</script>

<style scoped>
.flooria-progress-gauge {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.gauge-header {
  margin-bottom: 1.5rem;
}

.gauge-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.title-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #3b82f6;
}

.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.circular-progress {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.3s ease;
}

.progress-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  line-height: 1;
}

.progress-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
  text-align: center;
}

.linear-progress {
  width: 100%;
  max-width: 200px;
}

.progress-bar-background {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.status-messages {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: 0.5;
}

.status-item.active {
  opacity: 1;
  background: #f0f9ff;
}

.status-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e2e8f0;
  flex-shrink: 0;
}

.status-item.active .status-icon {
  background: #dbeafe;
}

.status-icon svg {
  width: 14px;
  height: 14px;
  stroke-width: 2.5;
  color: #3b82f6;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-item span {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.status-item.active span {
  color: #374151;
}

@media (max-width: 768px) {
  .flooria-progress-gauge {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .circular-progress svg {
    width: 100px;
    height: 100px;
  }
  
  .progress-percentage {
    font-size: 1.25rem;
  }
  
  .progress-label {
    font-size: 0.75rem;
  }
  
  .status-item {
    padding: 0.375rem;
  }
  
  .status-item span {
    font-size: 0.8rem;
  }
}
</style>

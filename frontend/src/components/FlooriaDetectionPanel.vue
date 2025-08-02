<template>
  <div class="flooria-detection-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
          <rect x="9" y="7" width="6" height="4"/>
        </svg>
        Éléments détectés
      </h3>
      <div class="detection-count">
        {{ detections.length }} élément{{ detections.length > 1 ? 's' : '' }}
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="detections.length === 0" class="empty-detections">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <p>Aucun élément détecté</p>
      <small>Analysez un plan pour voir les résultats</small>
    </div>
    
    <!-- Detection List -->
    <div v-else class="detection-list">
      <div
        v-for="(detection, index) in detections"
        :key="detection.id"
        :class="[
          'detection-item',
          { 'selected': selectedDetection?.id === detection.id }
        ]"
        @click="selectDetection(detection)"
      >
        <div class="detection-header">
          <div class="detection-type">
            <div 
              class="type-indicator"
              :style="{ backgroundColor: getElementColor(detection.class) }"
            ></div>
            <span class="type-name">{{ formatClassName(detection.class) }}</span>
          </div>
          <div class="confidence-badge" :class="getConfidenceClass(detection.confidence)">
            {{ Math.round(detection.confidence * 100) }}%
          </div>
        </div>
        
        <div class="detection-details">
          <div class="detail-row">
            <span class="detail-label">Position:</span>
            <span class="detail-value">
              {{ Math.round(detection.x) }}, {{ Math.round(detection.y) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Taille:</span>
            <span class="detail-value">
              {{ Math.round(detection.width) }} × {{ Math.round(detection.height) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Summary Stats -->
    <div v-if="detections.length > 0" class="detection-summary">
      <h4 class="summary-title">Résumé</h4>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Detection } from '../types/types'

interface Props {
  detections: Detection[]
  selectedDetection: Detection | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'detection-select': [detection: Detection | null]
}>()

// Element type colors matching Canvas component
const elementColors: Record<string, string> = {
  'mur': '#4fc3f7',
  'porte': '#66bb6a', 
  'fenêtre': '#ffa726',
  'pièce': '#ab47bc'
}

// Computed detection statistics
const detectionStats = computed(() => {
  const stats: Record<string, number> = {}
  props.detections.forEach(detection => {
    stats[detection.class] = (stats[detection.class] || 0) + 1
  })
  return stats
})

// Methods
const selectDetection = (detection: Detection) => {
  const isCurrentlySelected = props.selectedDetection?.id === detection.id
  emit('detection-select', isCurrentlySelected ? null : detection)
}

const getElementColor = (className: string): string => {
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

const getConfidenceClass = (confidence: number): string => {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}
</script>

<style scoped>
.flooria-detection-panel {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.title-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #6b7280;
}

.detection-count {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.empty-detections {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  stroke-width: 1.5;
  color: #d1d5db;
}

.empty-detections p {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-detections small {
  font-size: 0.8rem;
  color: #9ca3af;
}

.detection-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.detection-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detection-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.detection-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 1px #3b82f6;
}

.detection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.detection-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.confidence-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.confidence-badge.high {
  background: #dcfce7;
  color: #166534;
}

.confidence-badge.medium {
  background: #fef3c7;
  color: #92400e;
}

.confidence-badge.low {
  background: #fee2e2;
  color: #991b1b;
}

.detection-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #374151;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}

.detection-summary {
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
  background: #f8fafc;
}

.summary-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
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
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-label {
  flex: 1;
  color: #6b7280;
  font-weight: 500;
}

.stat-count {
  color: #374151;
  font-weight: 600;
  background: #e2e8f0;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 24px;
  text-align: center;
}

/* Scrollbar styling */
.detection-list::-webkit-scrollbar {
  width: 6px;
}

.detection-list::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.detection-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.detection-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .panel-header {
    padding: 0.75rem 1rem;
  }
  
  .detection-list {
    padding: 0.25rem;
  }
  
  .detection-item {
    padding: 0.75rem;
  }
  
  .detection-summary {
    padding: 0.75rem 1rem;
  }
}
</style>

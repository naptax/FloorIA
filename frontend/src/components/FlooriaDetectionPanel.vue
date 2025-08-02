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
    
    <!-- Detection Table -->
    <div v-if="detections.length > 0" class="detection-table-wrapper">
      <!-- Fixed Header -->
      <div class="detection-table-header">
        <div class="header-row">
          <div 
            class="header-cell sortable"
            :class="getSortClass('class')"
            @click="sortBy('class')"
          >
            Type
          </div>
          <div 
            class="header-cell sortable"
            :class="getSortClass('confidence')"
            @click="sortBy('confidence')"
          >
            Confiance
          </div>
          <div 
            class="header-cell sortable"
            :class="getSortClass('x')"
            @click="sortBy('x')"
          >
            Position X
          </div>
          <div 
            class="header-cell sortable"
            :class="getSortClass('y')"
            @click="sortBy('y')"
          >
            Position Y
          </div>
          <div 
            class="header-cell sortable"
            :class="getSortClass('width')"
            @click="sortBy('width')"
          >
            Largeur
          </div>
          <div 
            class="header-cell sortable"
            :class="getSortClass('height')"
            @click="sortBy('height')"
          >
            Hauteur
          </div>
        </div>
      </div>
      
      <!-- Scrollable Body -->
      <div class="detection-table-body">
        <div 
          v-for="detection in sortedDetections"
          :key="detection.id"
          :class="[
            'detection-row',
            { 'selected': selectedDetection?.id === detection.id }
          ]"
          @click="selectDetection(detection)"
        >
          <div class="table-cell type-cell">
            <div class="type-content">
              <div 
                class="type-indicator"
                :style="{ backgroundColor: getElementColor(detection.class) }"
              ></div>
              <span class="type-name">{{ formatClassName(detection.class) }}</span>
            </div>
          </div>
          <div class="table-cell confidence-cell">
            <div class="confidence-badge" :class="getConfidenceClass(detection.confidence)">
              {{ Math.round(detection.confidence * 100) }}%
            </div>
          </div>
          <div class="table-cell numeric-cell">{{ Math.round(detection.x) }}</div>
          <div class="table-cell numeric-cell">{{ Math.round(detection.y) }}</div>
          <div class="table-cell numeric-cell">{{ Math.round(detection.width) }}</div>
          <div class="table-cell numeric-cell">{{ Math.round(detection.height) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Detection } from '../types/types'

interface Props {
  detections: Detection[]
  selectedDetection: Detection | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'detection-select': [detection: Detection | null]
}>()

// Sorting state
const sortField = ref<keyof Detection>('class')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Element type colors - Tokyo Night palette with high contrast
const elementColors: Record<string, string> = {
  'mur': '#7aa2f7',        // Tokyo Night blue
  'porte': '#9ece6a',      // Tokyo Night green
  'fenêtre': '#e0af68',    // Tokyo Night yellow/orange
  'pièce': '#bb9af7',      // Tokyo Night purple
  'door': '#9ece6a',       // English variant
  'wall': '#7aa2f7',       // English variant
  'window': '#e0af68',     // English variant
  'room': '#bb9af7',       // English variant
  'escalier': '#f7768e',   // Tokyo Night red/pink
  'stairs': '#f7768e',     // English variant
  'meuble': '#7dcfff',     // Tokyo Night cyan
  'furniture': '#7dcfff',  // English variant
  'cloison': '#c0caf5',    // Tokyo Night light
  'partition': '#c0caf5'   // English variant
}

// Computed detection statistics
const detectionStats = computed(() => {
  const stats: Record<string, number> = {}
  props.detections.forEach(detection => {
    stats[detection.class] = (stats[detection.class] || 0) + 1
  })
  return stats
})

// Sorted detections
const sortedDetections = computed(() => {
  const sorted = [...props.detections].sort((a, b) => {
    const aValue = a[sortField.value]
    const bValue = b[sortField.value]
    
    let comparison = 0
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue)
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue
    }
    
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
  
  return sorted
})

// Methods
const selectDetection = (detection: Detection) => {
  const isCurrentlySelected = props.selectedDetection?.id === detection.id
  emit('detection-select', isCurrentlySelected ? null : detection)
}

const sortBy = (field: keyof Detection) => {
  if (sortField.value === field) {
    // Toggle direction if same field
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // New field, start with ascending
    sortField.value = field
    sortDirection.value = 'asc'
  }
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

const getSortClass = (field: keyof Detection): string => {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? 'sort-asc' : 'sort-desc'
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

/* Table wrapper with fixed header */
.detection-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1a1b26;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(26, 27, 38, 0.3);
}

/* Fixed header */
.detection-table-header {
  background: #24283b;
  border-bottom: 2px solid #414868;
  z-index: 100;
  position: relative;
}

.header-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
  font-family: Lato, system-ui, sans-serif;
}

.header-cell {
  background: #24283b;
  color: #ffffff;
  padding: 0.8rem;
  text-align: left;
  font-weight: 600;
  border-right: 1px solid #414868;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
}

.header-cell:last-child {
  border-right: none;
}

.header-cell:hover {
  background: #414868;
}

/* Scrollable body */
.detection-table-body {
  flex: 1;
  overflow-y: auto;
  max-height: 450px;
}

/* Remove old table styles - now using grid */

/* Sorting indicators for header cells */
.header-cell.sortable::after {
  content: '↕';
  margin-left: 0.5rem;
  opacity: 0.7;
  color: #9aa5ce;
  font-size: 0.8rem;
}

.header-cell.sort-asc::after {
  content: '↑';
  opacity: 1;
  color: #7aa2f7;
}

.header-cell.sort-desc::after {
  content: '↓';
  opacity: 1;
  color: #7aa2f7;
}

/* Detection rows using CSS Grid */
.detection-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid #414868;
  transition: background-color 0.2s ease;
  font-family: Lato, system-ui, sans-serif;
}

.detection-row:hover {
  background: #1a1b26;
}

.detection-row.selected {
  background: rgba(187, 154, 247, 0.2);
  border-color: #bb9af7;
}

.detection-row.selected:hover {
  background: rgba(187, 154, 247, 0.3);
}

/* Table cells using divs */
.table-cell {
  padding: 0.6rem 0.8rem;
  border-right: 1px solid #414868;
  font-size: 0.85rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  min-height: 48px;
}

.table-cell:last-child {
  border-right: none;
}

.type-cell {
  width: auto;
}

.type-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  margin-right: 0.25rem;
}

.type-name {
  font-weight: 600;
  color: #ffffff;
}

.confidence-cell {
  text-align: center;
}

.confidence-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  min-width: 45px;
}

.confidence-badge.high {
  background: #7dcfff;
  color: #1a1b26;
}

.confidence-badge.medium {
  background: #7aa2f7;
  color: #1a1b26;
}

.confidence-badge.low {
  background: #565f89;
  color: #c0caf5;
}

.numeric-cell {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  color: #ffffff;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 500;
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

.type-name {
  font-weight: 600;
  color: #ffffff;
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

/* Compact view styles */
.detection-compact {
  margin-top: 0.5rem;
}

.compact-info {
  display: flex;
  justify-content: center;
}

.compact-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
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

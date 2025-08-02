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
    <div v-if="detections.length > 0" class="detection-table-container">
      <table class="detection-table">
        <thead>
          <tr>
            <th 
              class="sortable-header" 
              @click="sortBy('class')"
              :class="{ 'sorted': sortField === 'class' }"
            >
              <div class="header-content">
                <span>Type</span>
                <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 10l5 5 5-5"/>
                  <path d="M7 14l5-5 5 5"/>
                </svg>
              </div>
            </th>
            <th 
              class="sortable-header" 
              @click="sortBy('confidence')"
              :class="{ 'sorted': sortField === 'confidence' }"
            >
              <div class="header-content">
                <span>Confiance</span>
                <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 10l5 5 5-5"/>
                  <path d="M7 14l5-5 5 5"/>
                </svg>
              </div>
            </th>
            <th 
              class="sortable-header" 
              @click="sortBy('x')"
              :class="{ 'sorted': sortField === 'x' }"
            >
              <div class="header-content">
                <span>Position X</span>
                <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 10l5 5 5-5"/>
                  <path d="M7 14l5-5 5 5"/>
                </svg>
              </div>
            </th>
            <th 
              class="sortable-header" 
              @click="sortBy('y')"
              :class="{ 'sorted': sortField === 'y' }"
            >
              <div class="header-content">
                <span>Position Y</span>
                <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 10l5 5 5-5"/>
                  <path d="M7 14l5-5 5 5"/>
                </svg>
              </div>
            </th>
            <th 
              class="sortable-header" 
              @click="sortBy('width')"
              :class="{ 'sorted': sortField === 'width' }"
            >
              <div class="header-content">
                <span>Largeur</span>
                <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 10l5 5 5-5"/>
                  <path d="M7 14l5-5 5 5"/>
                </svg>
              </div>
            </th>
            <th 
              class="sortable-header" 
              @click="sortBy('height')"
              :class="{ 'sorted': sortField === 'height' }"
            >
              <div class="header-content">
                <span>Hauteur</span>
                <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 10l5 5 5-5"/>
                  <path d="M7 14l5-5 5 5"/>
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="detection in sortedDetections"
            :key="detection.id"
            :class="[
              'detection-row',
              { 'selected': selectedDetection?.id === detection.id }
            ]"
            @click="selectDetection(detection)"
          >
            <td class="type-cell">
              <div class="type-content">
                <div 
                  class="type-indicator"
                  :style="{ backgroundColor: getElementColor(detection.class) }"
                ></div>
                <span class="type-name">{{ formatClassName(detection.class) }}</span>
              </div>
            </td>
            <td class="confidence-cell">
              <div class="confidence-badge" :class="getConfidenceClass(detection.confidence)">
                {{ Math.round(detection.confidence * 100) }}%
              </div>
            </td>
            <td class="numeric-cell">{{ Math.round(detection.x) }}</td>
            <td class="numeric-cell">{{ Math.round(detection.y) }}</td>
            <td class="numeric-cell">{{ Math.round(detection.width) }}</td>
            <td class="numeric-cell">{{ Math.round(detection.height) }}</td>
          </tr>
        </tbody>
      </table>
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

/* Table container */
.detection-table-container {
  flex: 1;
  overflow: auto;
  background: white;
}

.detection-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  table-layout: auto;
}

/* Table header */
.detection-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sortable-header {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  border-right: 1px solid #e2e8f0;
  white-space: nowrap;
}

.sortable-header:hover {
  background: #f1f5f9;
}

.sortable-header.sorted {
  background: #eff6ff;
  color: #3b82f6;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sort-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.sortable-header:hover .sort-icon,
.sortable-header.sorted .sort-icon {
  opacity: 1;
}

/* Table body */
.detection-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.detection-row:hover {
  background: #f8fafc;
}

.detection-row.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.detection-row.selected:hover {
  background: #dbeafe;
}

/* Table cells */
.detection-table td {
  padding: 0.6rem 0.8rem;
  border-right: 1px solid #e2e8f0;
  vertical-align: middle;
  font-size: 0.85rem;
  white-space: nowrap;
}

.type-cell {
  /* Auto-sized */
}

.type-content {
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

.numeric-cell {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  color: #374151;
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

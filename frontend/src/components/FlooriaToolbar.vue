<template>
  <div class="flooria-toolbar">
    <div class="toolbar-section">
      <h3 class="section-title">Analyse</h3>
      
      <!-- File Input -->
      <div class="file-input-container">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileChange"
          class="file-input"
          id="file-input"
        />
        <label for="file-input" class="file-input-label">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Importer un plan
        </label>
      </div>
      
      <!-- Analyze Button -->
      <button
        @click="$emit('analyze')"
        :disabled="!hasFile"
        class="btn-primary"
        :class="{ disabled: !hasFile }"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        Analyser le plan
      </button>
    </div>
    
    <div class="toolbar-section">
      <h3 class="section-title">Actions</h3>
      
      <!-- Export Button -->
      <button
        @click="$emit('export')"
        :disabled="!hasDetections"
        class="btn-secondary"
        :class="{ disabled: !hasDetections }"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17,8 12,3 7,8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Exporter JSON
      </button>
      
      <!-- Calibrate Button -->
      <button
        @click="$emit('calibrate')"
        :disabled="!hasFile"
        class="btn-secondary"
        :class="{ disabled: !hasFile }"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
        Calibrer
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlooriaToolbar',
  props: {
    hasFile: {
      type: Boolean,
      default: false
    },
    hasDetections: {
      type: Boolean,
      default: false
    }
  },
  emits: ['file-selected', 'analyze', 'export', 'calibrate'],
  methods: {
    handleFileChange(event) {
      const target = event.target
      const file = target.files?.[0]
      if (file) {
        this.$emit('file-selected', file)
      }
    },
    handleAnalyze() {
      this.$emit('analyze')
    },
    handleExport() {
      this.$emit('export')
    },
    handleCalibrate() {
      this.$emit('calibrate')
    }
  }
}
</script>

<style scoped>
.flooria-toolbar {
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.toolbar-section {
  margin-bottom: 2rem;
}

.toolbar-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.file-input-container {
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  color: #64748b;
}

.file-input-label:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #475569;
}

.btn-primary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  margin-bottom: 1rem;
}

.btn-primary:hover:not(.disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.btn-secondary:hover:not(.disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.btn-secondary:last-child {
  margin-bottom: 0;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  transform: none !important;
}

.icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

@media (max-width: 768px) {
  .flooria-toolbar {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 0.9rem;
  }
  
  .btn-primary,
  .btn-secondary {
    font-size: 0.8rem;
    padding: 0.625rem 0.75rem;
  }
}
</style>

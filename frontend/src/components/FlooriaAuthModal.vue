<template>
  <div class="flooria-auth-modal">
    <div class="auth-overlay" @click="$emit('close')"></div>
    
    <div class="auth-modal">
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isLogin ? 'Connexion' : 'Inscription' }}
        </h3>
        <button @click="$emit('close')" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-content">
        <!-- Login Only - No Signup -->
        <div class="auth-header">
          <h4>Connexion requise</h4>
          <p>Utilisez vos identifiants autorisés</p>
        </div>
        
        <!-- Auth Form - Login Only -->
        <form @submit.prevent="handleSubmit" class="auth-form">
          <!-- Email field -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="votre@email.com"
              class="form-input"
              required
            />
          </div>
          
          <!-- Password field -->
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <div class="password-input-container">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Votre mot de passe"
                class="form-input"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ errorMessage }}
          </div>
          
          <!-- Success Message -->
          <div v-if="successMessage" class="success-message">
            <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            {{ successMessage }}
          </div>
          
          <!-- Submit Button -->
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="isLoading"
          >
            <svg v-if="isLoading" class="loading-spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
        
        <!-- Login Only - No Signup Option -->
        <div class="auth-footer">
          <p class="auth-info">
            Seuls les comptes autorisés peuvent se connecter.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { authManager, type AuthUser } from '../supabaseClient'

// Type alias for compatibility
type User = AuthUser

const emit = defineEmits<{
  close: []
  'login-success': [user: User]
}>()

// State - Login only mode
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const formData = ref({
  email: '',
  password: ''
})

// Computed - Login validation only
const isFormValid = computed(() => {
  return formData.value.email && formData.value.password
})

// Methods - Login only
const resetForm = () => {
  formData.value = {
    email: '',
    password: ''
  }
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  clearMessages()
  
  try {
    // Login only
    const result = await authManager.signIn({
      email: formData.value.email,
      password: formData.value.password
    })
    
    if (!result.success) {
      throw new Error(result.message)
    }
    
    const user = result.user!
    successMessage.value = 'Connexion réussie !'
    setTimeout(() => {
      emit('login-success', user)
    }, 1000)
  } catch (error: any) {
    console.error('Auth error:', error)
    errorMessage.value = error.message || 'Une erreur est survenue'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.flooria-auth-modal {
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

.auth-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.auth-modal {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
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
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
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

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-header h4 {
  margin: 0 0 0.5rem 0;
  color: #1a1b26;
  font-size: 1.1rem;
  font-weight: 600;
}

.auth-header p {
  margin: 0;
  color: #565f89;
  font-size: 0.9rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.password-toggle:hover {
  background: #f3f4f6;
}

.password-toggle svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  color: #6b7280;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.9rem;
}

.error-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  flex-shrink: 0;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  color: #166534;
  font-size: 0.9rem;
}

.success-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  flex-shrink: 0;
}

.submit-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.auth-info {
  color: #565f89;
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
}

@media (max-width: 768px) {
  .auth-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
}
</style>

<template>
  <header class="flooria-header">
    <div class="header-content">
      <div class="logo-section">
        <h1 class="logo">FloorIA</h1>
        <span class="version">v1.4.1</span>
      </div>
      
      <div class="auth-section">
        <div v-if="isAuthenticated" class="user-info">
          <span class="welcome">Bonjour, {{ user?.name || user?.email }}</span>
          <button @click="$emit('logout')" class="btn-logout">
            Déconnexion
          </button>
        </div>
        <div v-else class="auth-buttons">
          <button @click="$emit('login')" class="btn-login">
            Connexion
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { User } from '../types/types'

interface Props {
  isAuthenticated: boolean
  user: User | null
}

defineProps<Props>()

defineEmits<{
  login: []
  logout: []
}>()
</script>

<style scoped>
.flooria-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
}

.version {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.auth-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome {
  font-size: 0.9rem;
  opacity: 0.9;
}

.btn-login,
.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-login:hover,
.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .logo {
    font-size: 1.4rem;
  }
  
  .welcome {
    display: none;
  }
}
</style>

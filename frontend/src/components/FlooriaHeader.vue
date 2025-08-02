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
  background: #1a1b26;
  color: #c0caf5;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(26, 27, 38, 0.4);
  border-bottom: 1px solid #24283b;
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
  font-weight: 700;
  margin: 0;
  font-family: Lato, sans-serif;
}

.version {
  background: #24283b;
  padding: 0.3rem 0.6rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #414868;
  color: #9aa5ce;
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
  font-weight: 400;
  color: #9aa5ce;
}

.btn-login,
.btn-logout {
  background: #7aa2f7;
  color: #1a1b26;
  border: 1px solid #7aa2f7;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: Lato, sans-serif;
}

.btn-login:hover,
.btn-logout:hover {
  background: #bb9af7;
  border-color: #bb9af7;
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

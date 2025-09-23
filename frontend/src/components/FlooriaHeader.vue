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
  width: 100%;
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

/* Responsive design */
@media (max-width: 1024px) {
  .header-content {
    padding: 0 1.5rem;
  }
  
  .logo {
    font-size: 1.6rem;
  }
  
  .welcome {
    font-size: 0.85rem;
  }
  
  .version {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
    flex-wrap: nowrap;
  }
  
  .logo {
    font-size: 1.4rem;
  }
  
  .logo-section {
    gap: 0.5rem;
    flex-shrink: 0;
  }
  
  .auth-section {
    flex-shrink: 0;
  }
  
  .welcome {
    display: none;
  }
  
  .btn-login,
  .btn-logout {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 0.75rem;
  }
  
  .logo {
    font-size: 1.2rem;
  }
  
  .version {
    display: none;
  }
  
  .btn-login,
  .btn-logout {
    padding: 0.35rem 0.6rem;
    font-size: 0.8rem;
  }
}
</style>

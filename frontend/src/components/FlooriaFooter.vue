<template>
  <footer class="flooria-footer">
    <div class="footer-content">
      <div class="footer-left">
        <span class="copyright">© 2024 FloorIA</span>
        <span class="separator">•</span>
        <span class="version">v1.4.1</span>
      </div>
      
      <div class="footer-right">
        <span class="powered-by">Développé avec</span>
        <span class="heart">❤️</span>
        <span class="by">par</span>
        <a 
          href="https://deep-5.com" 
          target="_blank" 
          rel="noopener noreferrer"
          class="company-link"
        >
          Deep-5
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No props or logic needed for this simple footer
</script>

<style scoped>
.flooria-footer {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #6b7280;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.separator {
  color: #d1d5db;
}

.version {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.heart {
  color: #ef4444;
  animation: heartbeat 2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 50%, 100% {
    transform: scale(1);
  }
  25%, 75% {
    transform: scale(1.1);
  }
}

.company-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.company-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 1rem;
    text-align: center;
  }
  
  .footer-left,
  .footer-right {
    justify-content: center;
  }
}
</style>

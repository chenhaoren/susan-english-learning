<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="nav-title">Susan英语学习</h1>
        <div class="nav-links">
          <router-link to="/" class="nav-link">随机组句</router-link>
          <router-link to="/sentence-transform" class="nav-link">句型转换</router-link>
          <router-link to="/word-bank" class="nav-link">单词库</router-link>
          <router-link to="/phonics-practice" class="nav-link">自然拼读</router-link>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useWordStore } from './stores/wordStore'
import { useSettingsStore } from './stores/settingsStore'

export default {
  name: 'App',
  setup() {
    const wordStore = useWordStore()
    const settingsStore = useSettingsStore()

    onMounted(async () => {
      // 预加载常用单词音标
      await wordStore.preloadCommonPhonetics()
      
      // 清理过期缓存
      wordStore.clearExpiredCache()
    })

    return {}
  }
}
</script>

<style scoped>
.navbar {
  background: #fff;
  color: #2c3e50;
  padding: 0;
  border-bottom: 1px solid #e5e9f2;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: #42b983;
  transition: color 0.2s;
}

.nav-title:hover {
  color: #36976b;
}

.nav-links {
  display: flex;
  gap: 0;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  padding: 12px 20px;
  border-radius: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-bottom: 2px solid transparent;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #42b983;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}

.nav-link:hover {
  color: #42b983;
  background: rgba(66, 185, 131, 0.05);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.router-link-active {
  color: #42b983;
  background: rgba(66, 185, 131, 0.08);
}

.nav-link.router-link-active::after {
  width: 100%;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 64px);
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 1rem 2rem;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 0;
    width: 100%;
    justify-content: space-around;
  }
  
  .nav-link {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style> 
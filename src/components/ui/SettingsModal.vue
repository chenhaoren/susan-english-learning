<template>
  <div v-if="isOpen" class="settings-drawer" @click="handleBackdropClick">
    <div class="settings-panel" @click.stop>
      <div class="settings-header">
        <h3 class="settings-title">设置</h3>
        <button class="close-btn" @click="closeModal" title="关闭">
          &times;
        </button>
      </div>

      <div class="settings-content">
        <!-- DeepSeek API Key 设置 -->
        <div class="setting-section">
          <h4 class="section-title">DeepSeek API 设置</h4>
          <p class="section-description">
            用于 AI 随机组句等 AI 功能。如果没有余额，请先前往
            <a href="https://platform.deepseek.com/top_up" target="_blank" class="link">充值页面</a>
            进行充值。充值后，前往
            <a href="https://platform.deepseek.com/api_keys" target="_blank" class="link">API Key 页面</a>
            ，点击"创建 API Key"并复制生成的 key。
          </p>
          <div class="input-group">
            <input 
              type="password" 
              v-model="deepseekKey"
              placeholder="请输入你的 DeepSeek API Key"
              class="api-input"
            />
            <button class="save-btn" @click="saveDeepseekKey">
              保存
            </button>
          </div>
          <div v-if="deepseekKeyStatus" class="status-message" :class="deepseekKeyStatusType">
            {{ deepseekKeyStatus }}
          </div>
        </div>

        <!-- Grist 远程同步设置 -->
        <div class="setting-section">
          <h4 class="section-title">Grist 远程同步</h4>
          <p class="section-description">
            设置 Grist 远程同步功能，实现数据的云端备份和跨端同步。
            <a href="https://docs.getgrist.com/" target="_blank" class="link">查看 Grist 文档</a>
          </p>
          
          <!-- Grist Token 设置引导 -->
          <div class="grist-guide">
            <h5 class="guide-title">如何获取 Grist API Token？</h5>
            <ol class="guide-steps">
              <li>访问 <a href="https://docs.getgrist.com/" target="_blank" class="link">Grist 官网</a> 并注册账号</li>
              <li>登录后，点击右上角的用户头像，选择 "API Keys"</li>
              <li>点击 "Create API Key" 创建新的 API Key</li>
              <li>复制生成的 Token（注意保存，不会再次显示）</li>
              <li>粘贴到下面的输入框中并保存</li>
            </ol>
          </div>
          
          <div class="input-group">
            <input 
              type="password" 
              v-model="gristToken"
              placeholder="请输入 Grist API Token"
              class="api-input"
            />
            <button class="save-btn" @click="saveGristToken">
              保存
            </button>
          </div>
          
          <!-- 组织 ID 和文档 ID 设置 -->
          <div class="input-group" style="margin-top: 12px;">
            <input 
              type="text" 
              v-model="gristOrgId"
              placeholder="组织 ID（可选，留空使用默认）"
              class="api-input"
            />
            <input 
              type="text" 
              v-model="gristDocId"
              placeholder="文档 ID（可选，留空自动创建）"
              class="api-input"
            />
          </div>
          
          <!-- 定时同步设置 -->
          <div class="auto-sync-section">
            <h5 class="guide-title">定时同步设置</h5>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">启用定时同步</span>
                <span class="toggle-description">自动定期同步数据到云端</span>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="autoSyncEnabled"
                  @change="toggleAutoSync"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div v-if="autoSyncEnabled" class="sync-interval">
              <label>同步间隔：</label>
              <select v-model="syncInterval" @change="updateSyncInterval">
                <option value="15">15 分钟</option>
                <option value="30">30 分钟</option>
                <option value="60">1 小时</option>
                <option value="120">2 小时</option>
                <option value="240">4 小时</option>
              </select>
            </div>
          </div>
          
          <div class="sync-controls">
            <button class="sync-btn" @click="testGristConnection" :disabled="!gristToken || testingConnection">
              {{ testingConnection ? '测试中...' : '测试连接' }}
            </button>
            <button class="sync-btn" @click="syncToGrist" :disabled="!gristToken || syncing">
              {{ syncing ? '同步中...' : '同步到云端' }}
            </button>
            <button class="sync-btn" @click="syncFromGrist" :disabled="!gristToken || syncing">
              {{ syncing ? '同步中...' : '从云端同步' }}
            </button>
          </div>
          
          <!-- 同步状态信息 -->
          <div v-if="lastSyncTime" class="sync-info">
            <small>最后同步时间：{{ formatTime(lastSyncTime) }}</small>
          </div>
          
          <div v-if="gristStatus" class="status-message" :class="gristStatusType">
            {{ gristStatus }}
          </div>
        </div>

        <!-- 显示功能开关 -->
        <div class="setting-section">
          <h4 class="section-title">显示设置</h4>
          <div class="toggle-group">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">显示自然拼读</span>
                <span class="toggle-description">显示单词的音素切分和拼读规则</span>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="showPhonics"
                  @change="saveDisplaySettings"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">显示音标</span>
                <span class="toggle-description">显示单词的国际音标</span>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="showPhonetics"
                  @change="saveDisplaySettings"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'

export default {
  name: 'SettingsModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const settingsStore = useSettingsStore()
    
    // 响应式数据
    const deepseekKey = ref('')
    const gristToken = ref('')
    const gristOrgId = ref('')
    const gristDocId = ref('')
    const showPhonics = ref(false)
    const showPhonetics = ref(false)
    const deepseekKeyStatus = ref('')
    const deepseekKeyStatusType = ref('info')
    const gristStatus = ref('')
    const gristStatusType = ref('info')
    const testingConnection = ref(false)
    const syncing = ref(false)
    const autoSyncEnabled = ref(false)
    const syncInterval = ref(30)
    const lastSyncTime = ref('')

    // 计算属性
    const isOpen = computed(() => props.isOpen)

    // 方法
    const closeModal = () => {
      emit('close')
    }

    const handleBackdropClick = (event) => {
      if (event.target === event.currentTarget) {
        closeModal()
      }
    }

    const saveDeepseekKey = () => {
      const key = deepseekKey.value.trim()
      if (!key) {
        showDeepseekKeyStatus('API Key 不能为空！', 'error')
        return
      }
      
      const success = settingsStore.saveDeepseekKey(key)
      if (success) {
        showDeepseekKeyStatus('DeepSeek API Key 已保存！', 'success')
      } else {
        showDeepseekKeyStatus('保存失败，请重试', 'error')
      }
    }

    const saveGristToken = () => {
      const token = gristToken.value.trim()
      if (!token) {
        showGristStatus('Grist Token 不能为空！', 'error')
        return
      }
      
      const success = settingsStore.saveGristToken(token)
      if (success) {
        // 同时保存组织 ID 和文档 ID
        if (gristOrgId.value.trim()) {
          localStorage.setItem('gristOrgId', gristOrgId.value.trim())
        }
        if (gristDocId.value.trim()) {
          localStorage.setItem('gristDocId', gristDocId.value.trim())
        }
        
        showGristStatus('Grist Token 已保存！', 'success')
      } else {
        showGristStatus('保存失败，请重试', 'error')
      }
    }

    const saveDisplaySettings = () => {
      settingsStore.saveDisplaySettings({
        showPhonics: showPhonics.value,
        showPhonetics: showPhonetics.value
      })
    }

    const testGristConnection = async () => {
      if (!gristToken.value) {
        showGristStatus('请先输入 Grist Token', 'error')
        return
      }

      testingConnection.value = true
      try {
        const result = await settingsStore.testGristConnection()
        if (result.success) {
          showGristStatus('Grist 连接测试成功！', 'success')
        } else {
          showGristStatus('连接测试失败：' + result.message, 'error')
        }
      } catch (error) {
        showGristStatus('连接测试失败：' + error.message, 'error')
      } finally {
        testingConnection.value = false
      }
    }

    const syncToGrist = async () => {
      if (!gristToken.value) {
        showGristStatus('请先输入 Grist Token', 'error')
        return
      }

      syncing.value = true
      try {
        const result = await settingsStore.syncToGrist()
        if (result.success) {
          showGristStatus('数据已成功同步到云端！', 'success')
        } else {
          showGristStatus('同步失败：' + result.message, 'error')
        }
      } catch (error) {
        showGristStatus('同步失败：' + error.message, 'error')
      } finally {
        syncing.value = false
      }
    }

    const syncFromGrist = async () => {
      if (!gristToken.value) {
        showGristStatus('请先输入 Grist Token', 'error')
        return
      }

      syncing.value = true
      try {
        const result = await settingsStore.syncFromGrist()
        if (result.success) {
          showGristStatus('数据已成功从云端同步！', 'success')
        } else {
          showGristStatus('同步失败：' + result.message, 'error')
        }
      } catch (error) {
        showGristStatus('同步失败：' + error.message, 'error')
      } finally {
        syncing.value = false
      }
    }

    const showDeepseekKeyStatus = (message, type = 'info') => {
      deepseekKeyStatus.value = message
      deepseekKeyStatusType.value = type
      setTimeout(() => {
        deepseekKeyStatus.value = ''
      }, 3000)
    }

    const showGristStatus = (message, type = 'info') => {
      gristStatus.value = message
      gristStatusType.value = type
      setTimeout(() => {
        gristStatus.value = ''
      }, 3000)
    }

    const toggleAutoSync = async () => {
      try {
        const { gristSyncService } = await import('../../services/GristSync.js')
        
        if (autoSyncEnabled.value) {
          gristSyncService.startAutoSync(parseInt(syncInterval.value))
          localStorage.setItem('autoSyncEnabled', 'true')
          localStorage.setItem('syncInterval', syncInterval.value.toString())
          showGristStatus('定时同步已启动', 'success')
        } else {
          gristSyncService.stopAutoSync()
          localStorage.setItem('autoSyncEnabled', 'false')
          showGristStatus('定时同步已停止', 'info')
        }
      } catch (error) {
        console.error('切换定时同步失败:', error)
        showGristStatus('切换定时同步失败', 'error')
      }
    }

    const updateSyncInterval = async () => {
      if (autoSyncEnabled.value) {
        try {
          const { gristSyncService } = await import('../../services/GristSync.js')
          gristSyncService.stopAutoSync()
          gristSyncService.startAutoSync(parseInt(syncInterval.value))
          localStorage.setItem('syncInterval', syncInterval.value.toString())
          showGristStatus(`同步间隔已更新为 ${syncInterval.value} 分钟`, 'success')
        } catch (error) {
          console.error('更新同步间隔失败:', error)
        }
      }
    }

    const formatTime = (timeString) => {
      if (!timeString) return ''
      const date = new Date(timeString)
      return date.toLocaleString('zh-CN')
    }

    // 监听弹窗打开，加载设置
    watch(() => props.isOpen, (newValue) => {
      if (newValue) {
        // 加载当前设置
        deepseekKey.value = settingsStore.deepseekKey || ''
        gristToken.value = settingsStore.gristToken || ''
        gristOrgId.value = localStorage.getItem('gristOrgId') || ''
        gristDocId.value = localStorage.getItem('gristDocId') || ''
        showPhonics.value = settingsStore.showPhonics || false
        showPhonetics.value = settingsStore.showPhonetics || false
        
        // 加载定时同步设置
        autoSyncEnabled.value = localStorage.getItem('autoSyncEnabled') === 'true'
        syncInterval.value = parseInt(localStorage.getItem('syncInterval')) || 30
        lastSyncTime.value = localStorage.getItem('lastSyncTime') || ''
        
        // 清空状态消息
        deepseekKeyStatus.value = ''
        gristStatus.value = ''
      }
    })

    return {
      deepseekKey,
      gristToken,
      gristOrgId,
      gristDocId,
      showPhonics,
      showPhonetics,
      deepseekKeyStatus,
      deepseekKeyStatusType,
      gristStatus,
      gristStatusType,
      testingConnection,
      syncing,
      autoSyncEnabled,
      syncInterval,
      lastSyncTime,
      isOpen,
      closeModal,
      handleBackdropClick,
      saveDeepseekKey,
      saveGristToken,
      saveDisplaySettings,
      testGristConnection,
      syncToGrist,
      syncFromGrist,
      toggleAutoSync,
      updateSyncInterval,
      formatTime
    }
  }
}
</script>

<style scoped>
.settings-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.settings-panel {
  background: #fff;
  width: 500px;
  max-width: 90vw;
  height: 100vh;
  overflow-y: auto;
  animation: slideInRight 0.3s ease-out;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e9f2;
  margin-bottom: 24px;
}

.settings-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(66, 185, 131, 0.1);
  color: #42b983;
}

.settings-content {
  padding: 0 24px 24px 24px;
}

.setting-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.section-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.link {
  color: #42b983;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.api-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e9f2;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #f8fafc;
  color: #2c3e50;
  outline: none;
  transition: all 0.2s;
}

.api-input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.save-btn {
  padding: 12px 20px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.save-btn:hover {
  background: #36976b;
}

.sync-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.sync-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.sync-btn:hover:not(:disabled) {
  background: #5a6268;
}

.sync-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
}

.toggle-info {
  flex: 1;
}

.toggle-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.toggle-description {
  font-size: 0.8rem;
  color: #666;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #42b983;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.status-message {
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.grist-guide {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.guide-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.guide-steps {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
}

.guide-steps li {
  margin-bottom: 8px;
}

.auto-sync-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.sync-interval {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sync-interval label {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

.sync-interval select {
  padding: 6px 12px;
  border: 1px solid #e5e9f2;
  border-radius: 4px;
  font-size: 0.9rem;
  background: #fff;
  color: #2c3e50;
}

.sync-info {
  margin-top: 8px;
  color: #666;
  font-size: 0.8rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-panel {
    width: 100vw;
    max-width: 100vw;
  }
  
  .settings-header {
    padding: 20px 20px 0 20px;
  }
  
  .settings-content {
    padding: 0 20px 20px 20px;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .sync-controls {
    flex-direction: column;
  }
  
  .toggle-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style> 
<template>
  <div class="phonics-settings">
    <div class="settings-header">
      <h3 class="settings-title">自然拼读设置</h3>
      <p class="settings-description">配置自然拼读功能的显示和验证选项</p>
    </div>

    <div class="settings-content">
      <!-- 显示模式设置 -->
      <div class="setting-section">
        <h4 class="section-title">显示模式</h4>
        <div class="setting-options">
          <div 
            v-for="option in displayModeOptions" 
            :key="option.value"
            class="setting-option"
            :class="{ 'active': modelValue.displayMode === option.value }"
            @click="updateSetting('displayMode', option.value)"
          >
            <div class="option-header">
              <span class="option-label">{{ option.label }}</span>
              <span class="option-value">{{ option.value }}</span>
            </div>
            <p class="option-description">{{ option.description }}</p>
          </div>
        </div>
      </div>

      <!-- 视觉主题设置 -->
      <div class="setting-section">
        <h4 class="section-title">视觉主题</h4>
        <div class="setting-options">
          <div 
            v-for="option in visualThemeOptions" 
            :key="option.value"
            class="setting-option"
            :class="{ 'active': modelValue.visualTheme === option.value }"
            @click="updateSetting('visualTheme', option.value)"
          >
            <div class="option-header">
              <span class="option-label">{{ option.label }}</span>
              <span class="option-value">{{ option.value }}</span>
            </div>
            <p class="option-description">{{ option.description }}</p>
          </div>
        </div>
      </div>

      <!-- 验证级别设置 -->
      <div class="setting-section">
        <h4 class="section-title">验证级别</h4>
        <div class="setting-options">
          <div 
            v-for="option in validationLevelOptions" 
            :key="option.value"
            class="setting-option"
            :class="{ 'active': modelValue.validationLevel === option.value }"
            @click="updateSetting('validationLevel', option.value)"
          >
            <div class="option-header">
              <span class="option-label">{{ option.label }}</span>
              <span class="option-value">{{ option.value }}</span>
            </div>
            <p class="option-description">{{ option.description }}</p>
          </div>
        </div>
      </div>

      <!-- 功能开关设置 -->
      <div class="setting-section">
        <h4 class="section-title">功能开关</h4>
        <div class="setting-toggles">
          <div class="setting-toggle">
            <div class="toggle-info">
              <span class="toggle-label">启用动画效果</span>
              <span class="toggle-description">显示音素切分的动画效果</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                :checked="modelValue.animationEnabled"
                @change="updateSetting('animationEnabled', $event.target.checked)"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-toggle">
            <div class="toggle-info">
              <span class="toggle-label">显示置信度</span>
              <span class="toggle-description">在音素上显示分析置信度</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                :checked="modelValue.showConfidence"
                @change="updateSetting('showConfidence', $event.target.checked)"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-toggle">
            <div class="toggle-info">
              <span class="toggle-label">自动验证</span>
              <span class="toggle-description">自动验证单词切分结果</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                :checked="modelValue.autoValidate"
                @change="updateSetting('autoValidate', $event.target.checked)"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-toggle">
            <div class="toggle-info">
              <span class="toggle-label">使用Phonics+Stuff API</span>
              <span class="toggle-description">使用在线API进行高级验证</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                :checked="modelValue.usePhonicsStuff"
                @change="updateSetting('usePhonicsStuff', $event.target.checked)"
                :disabled="!hasPhonicsStuffKey"
              >
              <span class="toggle-slider" :class="{ 'disabled': !hasPhonicsStuffKey }"></span>
            </label>
          </div>

          <div class="setting-toggle">
            <div class="toggle-info">
              <span class="toggle-label">使用CMU词典数据</span>
              <span class="toggle-description">使用CMU词典数据进行验证</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                :checked="modelValue.useCMU"
                @change="updateSetting('useCMU', $event.target.checked)"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- API密钥设置 -->
      <div class="setting-section">
        <h4 class="section-title">API配置</h4>
        <div class="api-settings">
          <div class="api-input-group">
            <label class="api-label">Phonics+Stuff API密钥</label>
            <div class="api-input-wrapper">
              <input 
                type="password" 
                class="api-input"
                :value="phonicsStuffKey"
                @input="updatePhonicsStuffKey($event.target.value)"
                placeholder="输入API密钥以启用高级功能"
              >
              <button 
                class="api-test-btn"
                @click="testPhonicsStuffAPI"
                :disabled="!phonicsStuffKey || testingAPI"
              >
                {{ testingAPI ? '测试中...' : '测试连接' }}
              </button>
            </div>
            <p class="api-description">
              获取API密钥请访问 
              <a href="https://phonicsandstuff.com/api" target="_blank" class="api-link">
                Phonics+Stuff API
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="setting-section">
        <h4 class="section-title">实时预览</h4>
        <div class="preview-container">
          <div class="preview-word">
            <PhonicsVisualizer
              word="beautiful"
              :display-mode="modelValue.displayMode"
              :visual-theme="modelValue.visualTheme"
              :animation-enabled="modelValue.animationEnabled"
              :validation-level="modelValue.validationLevel"
              :show-confidence="modelValue.showConfidence"
              :show-validation="modelValue.showValidation"
              :auto-validate="modelValue.autoValidate"
            />
          </div>
          <p class="preview-description">
            预览单词 "beautiful" 在当前设置下的显示效果
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="settings-actions">
        <button class="action-btn secondary" @click="resetSettings">
          重置为默认
        </button>
        <button class="action-btn secondary" @click="exportSettings">
          导出配置
        </button>
        <button class="action-btn primary" @click="saveSettings">
          保存设置
        </button>
      </div>
    </div>

    <!-- 状态提示 -->
    <div v-if="statusMessage" class="status-message" :class="statusType">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'
import PhonicsVisualizer from './PhonicsVisualizer.vue'

export default {
  name: 'PhonicsSettings',
  components: {
    PhonicsVisualizer
  },
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const settingsStore = useSettingsStore()
    const statusMessage = ref('')
    const statusType = ref('info')
    const testingAPI = ref(false)

    // 计算属性
    const phonicsStuffKey = computed(() => settingsStore.phonicsStuffKey)
    const hasPhonicsStuffKey = computed(() => !!settingsStore.phonicsStuffKey)

    const displayModeOptions = computed(() => settingsStore.getDisplayModeOptions())
    const visualThemeOptions = computed(() => settingsStore.getVisualThemeOptions())
    const validationLevelOptions = computed(() => settingsStore.getValidationLevelOptions())

    // 方法
    const updateSetting = (key, value) => {
      const newConfig = { ...props.modelValue, [key]: value }
      emit('update:modelValue', newConfig)
    }

    const updatePhonicsStuffKey = (key) => {
      settingsStore.savePhonicsStuffKey(key)
    }

    const testPhonicsStuffAPI = async () => {
      if (!phonicsStuffKey.value) {
        showStatus('请先输入API密钥', 'error')
        return
      }

      testingAPI.value = true
      try {
        const { phonicsAPIService } = await import('../../services/PhonicsAPI.js')
        phonicsAPIService.setPhonicsStuffKey(phonicsStuffKey.value)
        const result = await phonicsAPIService.validateConfiguration()
        
        if (result.phonicsStuff) {
          showStatus('API连接测试成功', 'success')
        } else {
          showStatus('API连接测试失败，请检查密钥', 'error')
        }
      } catch (error) {
        showStatus('API测试失败: ' + error.message, 'error')
      } finally {
        testingAPI.value = false
      }
    }

    const resetSettings = () => {
      settingsStore.resetPhonicsConfig()
      emit('update:modelValue', settingsStore.phonicsConfig)
      showStatus('设置已重置为默认值', 'info')
    }

    const exportSettings = () => {
      try {
        const configData = settingsStore.exportPhonicsConfig()
        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `phonics-config-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showStatus('配置已导出', 'success')
      } catch (error) {
        showStatus('导出失败: ' + error.message, 'error')
      }
    }

    const saveSettings = () => {
      try {
        const validation = settingsStore.validatePhonicsConfig()
        if (!validation.valid) {
          showStatus('配置验证失败: ' + validation.errors.join(', '), 'error')
          return
        }

        settingsStore.savePhonicsConfig(props.modelValue)
        emit('save', props.modelValue)
        showStatus('设置已保存', 'success')
      } catch (error) {
        showStatus('保存失败: ' + error.message, 'error')
      }
    }

    const showStatus = (message, type = 'info') => {
      statusMessage.value = message
      statusType.value = type
      setTimeout(() => {
        statusMessage.value = ''
      }, 3000)
    }

    // 监听配置变化
    watch(() => props.modelValue, (newConfig) => {
      // 可以在这里添加配置变化的处理逻辑
    }, { deep: true })

    return {
      phonicsStuffKey,
      hasPhonicsStuffKey,
      displayModeOptions,
      visualThemeOptions,
      validationLevelOptions,
      statusMessage,
      statusType,
      testingAPI,
      updateSetting,
      updatePhonicsStuffKey,
      testPhonicsStuffAPI,
      resetSettings,
      exportSettings,
      saveSettings
    }
  }
}
</script>

<style scoped>
.phonics-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.settings-header {
  margin-bottom: 24px;
  text-align: center;
}

.settings-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.settings-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 16px;
  margin-top: 0;
}

.setting-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.setting-option {
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-option:hover {
  border-color: #42b983;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.15);
}

.setting-option.active {
  border-color: #42b983;
  background: rgba(66, 185, 131, 0.05);
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.option-label {
  font-weight: 600;
  color: #2c3e50;
}

.option-value {
  font-size: 0.8rem;
  color: #42b983;
  background: rgba(66, 185, 131, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.option-description {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

.setting-toggles {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e9ecef;
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
  color: #6c757d;
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

.toggle-slider.disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.api-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.api-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.api-label {
  font-weight: 600;
  color: #2c3e50;
}

.api-input-wrapper {
  display: flex;
  gap: 8px;
}

.api-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
}

.api-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.api-test-btn {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.api-test-btn:hover:not(:disabled) {
  background: #36976b;
}

.api-test-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.api-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
}

.api-link {
  color: #42b983;
  text-decoration: none;
}

.api-link:hover {
  text-decoration: underline;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.preview-word {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
  text-align: center;
}

.settings-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #42b983;
  color: white;
}

.action-btn.primary:hover {
  background: #36976b;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn.secondary:hover {
  background: #5a6268;
}

.status-message {
  margin-top: 16px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .phonics-settings {
    padding: 16px;
    margin: 0 8px;
  }

  .setting-options {
    grid-template-columns: 1fr;
  }

  .setting-toggle {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .api-input-wrapper {
    flex-direction: column;
  }

  .settings-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style> 
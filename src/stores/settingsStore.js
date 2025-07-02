import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 原有设置
  const deepseekKey = ref('')
  const isSettingsModalOpen = ref(false)

  // 自然拼读相关设置
  const phonicsStuffKey = ref('')
  const phonicsDisplayMode = ref('normal') // normal | phonics | detailed
  const phonicsVisualTheme = ref('colorful') // colorful | minimal | educational
  const phonicsAnimationEnabled = ref(true)
  const phonicsValidationLevel = ref('basic') // basic | advanced | expert
  const phonicsUsePhonicsStuff = ref(true)
  const phonicsUseCMU = ref(true)
  const phonicsShowConfidence = ref(false)
  const phonicsAutoValidate = ref(true)

  // 默认配置
  const defaultPhonicsConfig = {
    displayMode: 'normal',
    visualTheme: 'colorful',
    animationEnabled: true,
    validationLevel: 'basic',
    usePhonicsStuff: true,
    useCMU: true,
    showConfidence: false,
    autoValidate: true
  }

  // 计算属性
  const phonicsConfig = computed(() => ({
    displayMode: phonicsDisplayMode.value,
    visualTheme: phonicsVisualTheme.value,
    animationEnabled: phonicsAnimationEnabled.value,
    validationLevel: phonicsValidationLevel.value,
    usePhonicsStuff: phonicsUsePhonicsStuff.value,
    useCMU: phonicsUseCMU.value,
    showConfidence: phonicsShowConfidence.value,
    autoValidate: phonicsAutoValidate.value
  }))

  const isPhonicsEnhanced = computed(() => {
    return phonicsDisplayMode.value !== 'normal' || 
           phonicsAnimationEnabled.value || 
           phonicsValidationLevel.value !== 'basic'
  })

  // 加载设置
  const loadSettings = () => {
    try {
      // 加载原有设置
      const storedKey = localStorage.getItem('deepseekKey')
      if (storedKey) {
        deepseekKey.value = storedKey
      }

      // 加载自然拼读设置
      const storedPhonicsKey = localStorage.getItem('phonicsStuffKey')
      if (storedPhonicsKey) {
        phonicsStuffKey.value = storedPhonicsKey
      }

      const storedPhonicsConfig = localStorage.getItem('phonicsConfig')
      if (storedPhonicsConfig) {
        const config = JSON.parse(storedPhonicsConfig)
        phonicsDisplayMode.value = config.displayMode || defaultPhonicsConfig.displayMode
        phonicsVisualTheme.value = config.visualTheme || defaultPhonicsConfig.visualTheme
        phonicsAnimationEnabled.value = config.animationEnabled !== undefined ? config.animationEnabled : defaultPhonicsConfig.animationEnabled
        phonicsValidationLevel.value = config.validationLevel || defaultPhonicsConfig.validationLevel
        phonicsUsePhonicsStuff.value = config.usePhonicsStuff !== undefined ? config.usePhonicsStuff : defaultPhonicsConfig.usePhonicsStuff
        phonicsUseCMU.value = config.useCMU !== undefined ? config.useCMU : defaultPhonicsConfig.useCMU
        phonicsShowConfidence.value = config.showConfidence !== undefined ? config.showConfidence : defaultPhonicsConfig.showConfidence
        phonicsAutoValidate.value = config.autoValidate !== undefined ? config.autoValidate : defaultPhonicsConfig.autoValidate
      }
    } catch (error) {
      console.error('加载设置失败:', error)
      // 重置为默认值
      resetPhonicsConfig()
    }
  }

  // 保存DeepSeek密钥
  const saveDeepseekKey = (key) => {
    try {
      deepseekKey.value = key
      localStorage.setItem('deepseekKey', key)
      return true
    } catch (error) {
      console.error('保存DeepSeek密钥失败:', error)
      return false
    }
  }

  // 保存Phonics+Stuff密钥
  const savePhonicsStuffKey = (key) => {
    try {
      phonicsStuffKey.value = key
      localStorage.setItem('phonicsStuffKey', key)
      return true
    } catch (error) {
      console.error('保存Phonics+Stuff密钥失败:', error)
      return false
    }
  }

  // 保存自然拼读配置
  const savePhonicsConfig = (config) => {
    try {
      // 更新状态
      if (config.displayMode !== undefined) phonicsDisplayMode.value = config.displayMode
      if (config.visualTheme !== undefined) phonicsVisualTheme.value = config.visualTheme
      if (config.animationEnabled !== undefined) phonicsAnimationEnabled.value = config.animationEnabled
      if (config.validationLevel !== undefined) phonicsValidationLevel.value = config.validationLevel
      if (config.usePhonicsStuff !== undefined) phonicsUsePhonicsStuff.value = config.usePhonicsStuff
      if (config.useCMU !== undefined) phonicsUseCMU.value = config.useCMU
      if (config.showConfidence !== undefined) phonicsShowConfidence.value = config.showConfidence
      if (config.autoValidate !== undefined) phonicsAutoValidate.value = config.autoValidate

      // 保存到本地存储
      localStorage.setItem('phonicsConfig', JSON.stringify(phonicsConfig.value))
      return true
    } catch (error) {
      console.error('保存自然拼读配置失败:', error)
      return false
    }
  }

  // 重置自然拼读配置
  const resetPhonicsConfig = () => {
    phonicsDisplayMode.value = defaultPhonicsConfig.displayMode
    phonicsVisualTheme.value = defaultPhonicsConfig.visualTheme
    phonicsAnimationEnabled.value = defaultPhonicsConfig.animationEnabled
    phonicsValidationLevel.value = defaultPhonicsConfig.validationLevel
    phonicsUsePhonicsStuff.value = defaultPhonicsConfig.usePhonicsStuff
    phonicsUseCMU.value = defaultPhonicsConfig.useCMU
    phonicsShowConfidence.value = defaultPhonicsConfig.showConfidence
    phonicsAutoValidate.value = defaultPhonicsConfig.autoValidate

    try {
      localStorage.setItem('phonicsConfig', JSON.stringify(defaultPhonicsConfig))
    } catch (error) {
      console.error('重置配置失败:', error)
    }
  }

  // 获取配置选项
  const getDisplayModeOptions = () => [
    { value: 'normal', label: '普通模式', description: '显示完整单词' },
    { value: 'phonics', label: '自然拼读模式', description: '显示音素切分' },
    { value: 'detailed', label: '详细模式', description: '显示切分和验证信息' }
  ]

  const getVisualThemeOptions = () => [
    { value: 'colorful', label: '彩色主题', description: '使用丰富的颜色区分音素' },
    { value: 'minimal', label: '简约主题', description: '使用简洁的视觉设计' },
    { value: 'educational', label: '教育主题', description: '适合教学使用的设计' }
  ]

  const getValidationLevelOptions = () => [
    { value: 'basic', label: '基础验证', description: '仅使用本地规则库' },
    { value: 'advanced', label: '高级验证', description: '使用CMU词典数据验证' },
    { value: 'expert', label: '专家验证', description: '使用Phonics+Stuff API和CMU数据' }
  ]

  // 模态框控制
  const openSettingsModal = () => {
    isSettingsModalOpen.value = true
  }

  const closeSettingsModal = () => {
    isSettingsModalOpen.value = false
  }

  // 验证配置
  const validatePhonicsConfig = () => {
    const errors = []

    if (phonicsValidationLevel.value === 'expert' && !phonicsStuffKey.value) {
      errors.push('专家验证模式需要配置Phonics+Stuff API密钥')
    }

    if (!phonicsUsePhonicsStuff.value && !phonicsUseCMU.value) {
      errors.push('至少需要启用一种验证方式')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 导出配置
  const exportPhonicsConfig = () => {
    return {
      version: '1.0',
      timestamp: Date.now(),
      config: phonicsConfig.value,
      deepseekKey: deepseekKey.value ? '***' : '',
      phonicsStuffKey: phonicsStuffKey.value ? '***' : ''
    }
  }

  // 导入配置
  const importPhonicsConfig = (configData) => {
    try {
      if (configData.config) {
        savePhonicsConfig(configData.config)
        return { success: true, message: '配置导入成功' }
      }
      return { success: false, message: '配置数据格式无效' }
    } catch (error) {
      console.error('导入配置失败:', error)
      return { success: false, message: '导入配置失败: ' + error.message }
    }
  }

  // 初始化
  loadSettings()

  return {
    // 原有属性
    deepseekKey,
    isSettingsModalOpen,
    
    // 自然拼读属性
    phonicsStuffKey,
    phonicsDisplayMode,
    phonicsVisualTheme,
    phonicsAnimationEnabled,
    phonicsValidationLevel,
    phonicsUsePhonicsStuff,
    phonicsUseCMU,
    phonicsShowConfidence,
    phonicsAutoValidate,
    
    // 计算属性
    phonicsConfig,
    isPhonicsEnhanced,
    
    // 原有方法
    loadSettings,
    saveDeepseekKey,
    openSettingsModal,
    closeSettingsModal,
    
    // 自然拼读方法
    savePhonicsStuffKey,
    savePhonicsConfig,
    resetPhonicsConfig,
    getDisplayModeOptions,
    getVisualThemeOptions,
    getValidationLevelOptions,
    validatePhonicsConfig,
    exportPhonicsConfig,
    importPhonicsConfig
  }
}) 
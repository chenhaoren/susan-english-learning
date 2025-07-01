import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const deepseekKey = ref('')
  const isSettingsModalOpen = ref(false)

  const loadSettings = () => {
    try {
      const storedKey = localStorage.getItem('deepseekKey')
      if (storedKey) {
        deepseekKey.value = storedKey
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  const saveDeepseekKey = (key) => {
    try {
      deepseekKey.value = key
      localStorage.setItem('deepseekKey', key)
      return true
    } catch (error) {
      console.error('保存设置失败:', error)
      return false
    }
  }

  const openSettingsModal = () => {
    isSettingsModalOpen.value = true
  }

  const closeSettingsModal = () => {
    isSettingsModalOpen.value = false
  }

  // 初始化
  loadSettings()

  return {
    deepseekKey,
    isSettingsModalOpen,
    loadSettings,
    saveDeepseekKey,
    openSettingsModal,
    closeSettingsModal
  }
}) 
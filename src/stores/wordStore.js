import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWordStore = defineStore('word', () => {
  // 状态
  const verbs = ref([])
  const adjectives = ref([])
  const nouns = ref([])
  const verbCounts = ref({})
  const adjectiveCounts = ref({})
  const nounCounts = ref({})
  const selectedTypes = ref(['verb', 'adjective', 'noun'])
  
  // 音标数据存储
  const wordPhonetics = ref({})
  
  // 自然拼读切分结果缓存
  const phonicsSegments = ref({})
  
  // 学习进度跟踪
  const learningProgress = ref({})

  // 默认单词库
  const defaultWords = {
    verbs: ["annoy", "approach", "attack", "bite", "break", "build", "carry", "catch", "charge", "chase"],
    adjectives: ["good", "bad", "big", "small", "tall", "short", "beautiful", "ugly", "careful", "careless"],
    nouns: ["apple", "arm", "autumn", "baby", "banana", "bed", "boat", "book", "boy", "building"]
  }

  // 计算属性
  const currentWords = computed(() => ({
    verbs: verbs.value.length > 0 ? verbs.value : defaultWords.verbs,
    adjectives: adjectives.value.length > 0 ? adjectives.value : defaultWords.adjectives,
    nouns: nouns.value.length > 0 ? nouns.value : defaultWords.nouns
  }))

  const isEmpty = computed(() => {
    const words = currentWords.value
    return (!words.verbs || words.verbs.length === 0) &&
           (!words.adjectives || words.adjectives.length === 0) &&
           (!words.nouns || words.nouns.length === 0)
  })

  // 方法
  const loadFromStorage = () => {
    try {
      const storedVerbs = JSON.parse(localStorage.getItem('verbs'))
      const storedAdjectives = JSON.parse(localStorage.getItem('adjectives'))
      const storedNouns = JSON.parse(localStorage.getItem('nouns'))
      const storedPhonetics = JSON.parse(localStorage.getItem('wordPhonetics'))
      const storedPhonicsSegments = JSON.parse(localStorage.getItem('phonicsSegments'))
      const storedLearningProgress = JSON.parse(localStorage.getItem('learningProgress'))
      
      if (storedVerbs) verbs.value = storedVerbs
      if (storedAdjectives) adjectives.value = storedAdjectives
      if (storedNouns) nouns.value = storedNouns
      if (storedPhonetics) wordPhonetics.value = storedPhonetics
      if (storedPhonicsSegments) phonicsSegments.value = storedPhonicsSegments
      if (storedLearningProgress) learningProgress.value = storedLearningProgress
    } catch (error) {
      console.error('加载存储数据失败:', error)
    }
  }

  const saveToStorage = () => {
    try {
      localStorage.setItem('verbs', JSON.stringify(verbs.value))
      localStorage.setItem('adjectives', JSON.stringify(adjectives.value))
      localStorage.setItem('nouns', JSON.stringify(nouns.value))
      localStorage.setItem('wordPhonetics', JSON.stringify(wordPhonetics.value))
      localStorage.setItem('phonicsSegments', JSON.stringify(phonicsSegments.value))
      localStorage.setItem('learningProgress', JSON.stringify(learningProgress.value))
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }

  const updateWordCount = (word, type) => {
    const counts = type === 'verb' ? verbCounts : type === 'adjective' ? adjectiveCounts : nounCounts
    counts.value[word] = (counts.value[word] || 0) + 1
  }

  const getRandomWord = (type) => {
    const words = currentWords.value[type + 's']
    if (!words || words.length === 0) return null
    return words[Math.floor(Math.random() * words.length)]
  }

  const getRandomCombination = () => {
    const result = {}
    if (selectedTypes.value.includes('verb')) {
      result.verb = getRandomWord('verb')
    }
    if (selectedTypes.value.includes('adjective')) {
      result.adjective = getRandomWord('adjective')
    }
    if (selectedTypes.value.includes('noun')) {
      result.noun = getRandomWord('noun')
    }
    return result
  }

  // 音标相关方法
  const getWordPhonetics = (word) => {
    return wordPhonetics.value[word.toLowerCase()] || null
  }

  const setWordPhonetics = (word, phoneticsData) => {
    wordPhonetics.value[word.toLowerCase()] = phoneticsData
    saveToStorage()
  }

  const setBatchPhonetics = (phoneticsMap) => {
    Object.assign(wordPhonetics.value, phoneticsMap)
    saveToStorage()
  }

  const hasPhonetics = (word) => {
    return !!wordPhonetics.value[word.toLowerCase()]
  }

  // 自然拼读相关方法
  const getPhonicsSegments = (word) => {
    return phonicsSegments.value[word.toLowerCase()] || null
  }

  const setPhonicsSegments = (word, segments) => {
    phonicsSegments.value[word.toLowerCase()] = segments
    saveToStorage()
  }

  const hasPhonicsSegments = (word) => {
    return !!phonicsSegments.value[word.toLowerCase()]
  }

  const clearPhonicsSegments = () => {
    phonicsSegments.value = {}
    saveToStorage()
  }

  // 学习进度相关方法
  const getLearningProgress = (word) => {
    return learningProgress.value[word.toLowerCase()] || {
      viewed: 0,
      practiced: 0,
      mastered: false,
      lastViewed: null,
      difficulty: 'medium'
    }
  }

  const updateLearningProgress = (word, action) => {
    const progress = getLearningProgress(word)
    
    switch (action) {
      case 'view':
        progress.viewed++
        progress.lastViewed = new Date().toISOString()
        break
      case 'practice':
        progress.practiced++
        break
      case 'master':
        progress.mastered = true
        break
      case 'reset':
        progress.mastered = false
        progress.practiced = 0
        break
    }

    learningProgress.value[word.toLowerCase()] = progress
    saveToStorage()
  }

  const setWordDifficulty = (word, difficulty) => {
    const progress = getLearningProgress(word)
    progress.difficulty = difficulty
    learningProgress.value[word.toLowerCase()] = progress
    saveToStorage()
  }

  const getMasteredWords = () => {
    return Object.entries(learningProgress.value)
      .filter(([word, progress]) => progress.mastered)
      .map(([word]) => word)
  }

  const getWordsByDifficulty = (difficulty) => {
    return Object.entries(learningProgress.value)
      .filter(([word, progress]) => progress.difficulty === difficulty)
      .map(([word]) => word)
  }

  // 批量导入单词并获取音标
  const importWordsWithPhonetics = async (wordLists) => {
    try {
      // 导入单词
      if (wordLists.verbs) verbs.value = [...new Set([...verbs.value, ...wordLists.verbs])]
      if (wordLists.adjectives) adjectives.value = [...new Set([...adjectives.value, ...wordLists.adjectives])]
      if (wordLists.nouns) nouns.value = [...new Set([...nouns.value, ...wordLists.nouns])]
      
      // 保存单词
      saveToStorage()
      
      // 获取所有新单词
      const allWords = [
        ...(wordLists.verbs || []),
        ...(wordLists.adjectives || []),
        ...(wordLists.nouns || [])
      ]
      
      // 过滤出没有音标的单词
      const wordsWithoutPhonetics = allWords.filter(word => !hasPhonetics(word))
      
      if (wordsWithoutPhonetics.length > 0) {
        // 批量获取音标
        const { phoneticsService } = await import('../services/api.js')
        const phoneticsData = await phoneticsService.getBatchPhonetics(wordsWithoutPhonetics)
        
        // 保存音标数据
        setBatchPhonetics(phoneticsData)
        
        return {
          success: true,
          wordsImported: allWords.length,
          phoneticsFetched: Object.keys(phoneticsData).length
        }
      }
      
      return {
        success: true,
        wordsImported: allWords.length,
        phoneticsFetched: 0
      }
    } catch (error) {
      console.error('导入单词失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 预加载常用单词音标
  const preloadCommonPhonetics = async () => {
    const commonWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must', 'shall'
    ]
    
    const wordsToLoad = commonWords.filter(word => !hasPhonetics(word))
    
    if (wordsToLoad.length > 0) {
      try {
        const { phoneticsService } = await import('../services/api.js')
        const phoneticsData = await phoneticsService.getBatchPhonetics(wordsToLoad)
        setBatchPhonetics(phoneticsData)
        console.log(`预加载了 ${Object.keys(phoneticsData).length} 个常用单词音标`)
      } catch (error) {
        console.warn('预加载音标失败:', error)
      }
    }
  }

  // 清理过期缓存
  const clearExpiredCache = () => {
    try {
      const { cacheService } = require('../services/api.js')
      cacheService.clearExpiredCache()
    } catch (error) {
      console.warn('清理缓存失败:', error)
    }
  }

  // 初始化
  loadFromStorage()

  return {
    verbs,
    adjectives,
    nouns,
    verbCounts,
    adjectiveCounts,
    nounCounts,
    selectedTypes,
    wordPhonetics,
    phonicsSegments,
    learningProgress,
    currentWords,
    isEmpty,
    loadFromStorage,
    saveToStorage,
    updateWordCount,
    getRandomWord,
    getRandomCombination,
    getWordPhonetics,
    setWordPhonetics,
    setBatchPhonetics,
    hasPhonetics,
    getPhonicsSegments,
    setPhonicsSegments,
    hasPhonicsSegments,
    clearPhonicsSegments,
    getLearningProgress,
    updateLearningProgress,
    setWordDifficulty,
    getMasteredWords,
    getWordsByDifficulty,
    importWordsWithPhonetics,
    preloadCommonPhonetics,
    clearExpiredCache
  }
}) 
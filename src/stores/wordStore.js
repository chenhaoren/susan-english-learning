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

  // 单词本管理
  const wordBooks = ref([]) // 单词本列表
  const currentWordBook = ref(null) // 当前选中的单词本

  // 默认单词库
  const defaultWords = {
    verbs: ["annoy", "approach", "attack", "bite", "break", "build", "carry", "catch", "charge", "chase"],
    adjectives: ["good", "bad", "big", "small", "tall", "short", "beautiful", "ugly", "careful", "careless"],
    nouns: ["apple", "arm", "autumn", "baby", "banana", "bed", "boat", "book", "boy", "building"]
  }

  // 计算属性
  const currentWords = computed(() => {
    // 如果有选中的单词本，使用单词本的单词
    if (currentWordBook.value && currentWordBook.value.words) {
      return {
        verbs: currentWordBook.value.words.verbs || [],
        adjectives: currentWordBook.value.words.adjectives || [],
        nouns: currentWordBook.value.words.nouns || []
      }
    }
    
    // 否则使用本地存储的单词或默认单词
    return {
      verbs: verbs.value && verbs.value.length > 0 ? verbs.value : defaultWords.verbs,
      adjectives: adjectives.value && adjectives.value.length > 0 ? adjectives.value : defaultWords.adjectives,
      nouns: nouns.value && nouns.value.length > 0 ? nouns.value : defaultWords.nouns
    }
  })

  // 所有单词本中的单词（去重）
  const allWordsFromBooks = computed(() => {
    const allVerbs = new Set()
    const allAdjectives = new Set()
    const allNouns = new Set()
    
    // 添加默认单词
    defaultWords.verbs.forEach(word => allVerbs.add(word))
    defaultWords.adjectives.forEach(word => allAdjectives.add(word))
    defaultWords.nouns.forEach(word => allNouns.add(word))
    
    // 添加所有单词本中的单词
    if (Array.isArray(wordBooks.value)) {
      wordBooks.value.forEach(book => {
        if (book.words && book.words.verbs) {
          book.words.verbs.forEach(word => allVerbs.add(word))
        }
        if (book.words && book.words.adjectives) {
          book.words.adjectives.forEach(word => allAdjectives.add(word))
        }
        if (book.words && book.words.nouns) {
          book.words.nouns.forEach(word => allNouns.add(word))
        }
      })
    }
    
    return {
      verbs: Array.from(allVerbs),
      adjectives: Array.from(allAdjectives),
      nouns: Array.from(allNouns)
    }
  })

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
      const storedWordBooks = JSON.parse(localStorage.getItem('wordBooks'))
      const storedCurrentWordBook = JSON.parse(localStorage.getItem('currentWordBook'))
      
      if (storedVerbs) verbs.value = storedVerbs
      if (storedAdjectives) adjectives.value = storedAdjectives
      if (storedNouns) nouns.value = storedNouns
      if (storedPhonetics) wordPhonetics.value = storedPhonetics
      if (storedPhonicsSegments) phonicsSegments.value = storedPhonicsSegments
      if (storedLearningProgress) learningProgress.value = storedLearningProgress
      if (storedWordBooks) wordBooks.value = storedWordBooks
      if (storedCurrentWordBook) currentWordBook.value = storedCurrentWordBook
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
      localStorage.setItem('wordBooks', JSON.stringify(wordBooks.value))
      localStorage.setItem('currentWordBook', JSON.stringify(currentWordBook.value))
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

  // 导入Excel文件并创建单词本
  const importExcelFile = async (file) => {
    try {
      const XLSX = await import('xlsx')
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
            
            // 去掉第一行标题
            const rows = json.slice(1)
            
            // 分别提取三列并去重
            const verbs = Array.from(new Set(rows.map(row => row[0]).filter(Boolean)))
            const adjectives = Array.from(new Set(rows.map(row => row[1]).filter(Boolean)))
            const nouns = Array.from(new Set(rows.map(row => row[2]).filter(Boolean)))
            
            // 生成单词本名称
            const wordBookName = generateWordBookName(file.name)
            
            // 创建单词本
            const wordBook = createWordBook(wordBookName, { verbs, adjectives, nouns })
            
            // 获取音标
            const allWords = [...verbs, ...adjectives, ...nouns]
            const wordsWithoutPhonetics = allWords.filter(word => !hasPhonetics(word))
            
            let phoneticsFetched = 0
            if (wordsWithoutPhonetics.length > 0) {
              try {
                const { phoneticsService } = await import('../services/api.js')
                const phoneticsData = await phoneticsService.getBatchPhonetics(wordsWithoutPhonetics)
                setBatchPhonetics(phoneticsData)
                phoneticsFetched = Object.keys(phoneticsData).length
              } catch (phoneticsError) {
                console.warn('获取音标失败:', phoneticsError)
              }
            }
            
            resolve({
              success: true,
              wordBook,
              wordsImported: allWords.length,
              phoneticsFetched,
              stats: {
                verbs: verbs.length,
                adjectives: adjectives.length,
                nouns: nouns.length
              }
            })
          } catch (error) {
            reject(new Error('文件解析失败: ' + error.message))
          }
        }
        
        reader.onerror = () => {
          reject(new Error('文件读取失败'))
        }
        
        reader.readAsArrayBuffer(file)
      })
    } catch (error) {
      console.error('导入Excel文件失败:', error)
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

  // 单词本管理方法
  const createWordBook = (name, words) => {
    const wordBook = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      words: {
        verbs: words.verbs || [],
        adjectives: words.adjectives || [],
        nouns: words.nouns || []
      },
      wordCount: {
        verbs: (words.verbs || []).length,
        adjectives: (words.adjectives || []).length,
        nouns: (words.nouns || []).length
      }
    }
    
    wordBooks.value.push(wordBook)
    saveToStorage()
    return wordBook
  }

  const selectWordBook = (wordBookId) => {
    const wordBook = wordBooks.value.find(book => book.id === wordBookId)
    if (wordBook) {
      currentWordBook.value = wordBook
      // 更新当前显示的单词
      verbs.value = wordBook.words.verbs
      adjectives.value = wordBook.words.adjectives
      nouns.value = wordBook.words.nouns
      saveToStorage()
    }
  }

  const deleteWordBook = (wordBookId) => {
    const index = wordBooks.value.findIndex(book => book.id === wordBookId)
    if (index !== -1) {
      wordBooks.value.splice(index, 1)
      
      // 如果删除的是当前选中的单词本，切换到默认
      if (currentWordBook.value && currentWordBook.value.id === wordBookId) {
        currentWordBook.value = null
        verbs.value = []
        adjectives.value = []
        nouns.value = []
      }
      
      saveToStorage()
    }
  }

  const getWordBookById = (wordBookId) => {
    return wordBooks.value.find(book => book.id === wordBookId)
  }

  const getAllWordBooks = () => {
    return wordBooks.value
  }

  const getCurrentWordBook = () => {
    return currentWordBook.value
  }

  const clearAllWordBooks = () => {
    wordBooks.value = []
    currentWordBook.value = null
    verbs.value = []
    adjectives.value = []
    nouns.value = []
    saveToStorage()
  }

  // 生成单词本名称（文件名+时间）
  const generateWordBookName = (fileName) => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // 移除文件扩展名
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    
    return `${nameWithoutExt}_${dateStr}_${timeStr}`
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
    wordBooks,
    currentWordBook,
    currentWords,
    allWordsFromBooks,
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
    importExcelFile,
    preloadCommonPhonetics,
    clearExpiredCache,
    createWordBook,
    selectWordBook,
    deleteWordBook,
    getWordBookById,
    getAllWordBooks,
    getCurrentWordBook,
    clearAllWordBooks,
    generateWordBookName
  }
}) 
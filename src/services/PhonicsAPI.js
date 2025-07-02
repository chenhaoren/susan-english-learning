/**
 * 自然拼读API服务层
 * 集成Phonics+Stuff API和CMU词典数据，提供校验和增强功能
 */

import axios from 'axios'

// API配置
const API_CONFIG = {
  PHONICS_STUFF_BASE_URL: 'https://api.phonicsandstuff.com/v1',
  CMU_DICT_URL: 'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
}

// 缓存配置
const CACHE_CONFIG = {
  PHONICS_CACHE_PREFIX: 'phonics_data_',
  CMU_CACHE_PREFIX: 'cmu_data_',
  CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7天
  MAX_CACHE_SIZE: 1000
}

/**
 * Phonics+Stuff API服务
 */
export const phonicsStuffAPI = {
  /**
   * 获取单词的自然拼读分析
   * @param {string} word - 单词
   * @param {string} apiKey - API密钥
   * @returns {Promise<Object>} 分析结果
   */
  async getPhonicsAnalysis(word, apiKey) {
    try {
      const response = await axios.get(`${API_CONFIG.PHONICS_STUFF_BASE_URL}/phonics/${encodeURIComponent(word)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: API_CONFIG.TIMEOUT
      })
      
      return this.processPhonicsResponse(response.data)
    } catch (error) {
      console.warn(`Phonics+Stuff API调用失败 (${word}):`, error.message)
      return null
    }
  },

  /**
   * 批量获取单词分析
   * @param {Array<string>} words - 单词数组
   * @param {string} apiKey - API密钥
   * @returns {Promise<Object>} 批量结果
   */
  async getBatchPhonicsAnalysis(words, apiKey) {
    const results = {}
    const promises = words.map(async (word) => {
      try {
        const analysis = await this.getPhonicsAnalysis(word, apiKey)
        if (analysis) {
          results[word] = analysis
        }
        // 减少API调用频率
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`批量获取失败 (${word}):`, error.message)
      }
    })
    
    await Promise.all(promises)
    return results
  },

  /**
   * 处理Phonics+Stuff API响应
   * @param {Object} data - API响应数据
   * @returns {Object} 处理后的数据
   */
  processPhonicsResponse(data) {
    if (!data) return null

    return {
      word: data.word,
      segments: data.segments || [],
      pronunciation: data.pronunciation,
      rules: data.rules || [],
      difficulty: data.difficulty,
      confidence: data.confidence,
      source: 'phonics-stuff'
    }
  },

  /**
   * 验证API密钥
   * @param {string} apiKey - API密钥
   * @returns {Promise<boolean>} 是否有效
   */
  async validateApiKey(apiKey) {
    try {
      const response = await axios.get(`${API_CONFIG.PHONICS_STUFF_BASE_URL}/validate`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: API_CONFIG.TIMEOUT
      })
      
      return response.status === 200
    } catch (error) {
      console.warn('API密钥验证失败:', error.message)
      return false
    }
  }
}

/**
 * CMU词典数据处理服务
 */
export const cmuDictAPI = {
  // CMU词典数据缓存
  cmuData: null,
  cmuLoaded: false,

  /**
   * 加载CMU词典数据
   * @returns {Promise<boolean>} 是否加载成功
   */
  async loadCMUDict() {
    if (this.cmuLoaded && this.cmuData) {
      return true
    }

    try {
      // 检查缓存
      const cached = this.getCachedCMUData()
      if (cached) {
        this.cmuData = cached
        this.cmuLoaded = true
        return true
      }

      // 从远程加载
      const response = await axios.get(API_CONFIG.CMU_DICT_URL, {
        timeout: API_CONFIG.TIMEOUT * 2
      })
      
      this.cmuData = this.parseCMUDict(response.data)
      this.cacheCMUData(this.cmuData)
      this.cmuLoaded = true
      
      console.log('CMU词典数据加载成功')
      return true
    } catch (error) {
      console.warn('CMU词典数据加载失败:', error.message)
      return false
    }
  },

  /**
   * 解析CMU词典数据
   * @param {string} rawData - 原始数据
   * @returns {Object} 解析后的数据
   */
  parseCMUDict(rawData) {
    const lines = rawData.split('\n')
    const dict = {}

    for (const line of lines) {
      if (line.startsWith(';;;') || !line.trim()) continue

      const parts = line.split('  ')
      if (parts.length < 2) continue

      const word = parts[0].toLowerCase()
      const pronunciation = parts[1].trim()
      
      dict[word] = {
        pronunciation,
        phonemes: this.extractPhonemes(pronunciation),
        stress: this.extractStress(pronunciation),
        syllables: this.countSyllables(pronunciation)
      }
    }

    return dict
  },

  /**
   * 提取音素
   * @param {string} pronunciation - 发音字符串
   * @returns {Array} 音素数组
   */
  extractPhonemes(pronunciation) {
    return pronunciation.split(' ').filter(p => p && !p.match(/^\d+$/))
  },

  /**
   * 提取重音信息
   * @param {string} pronunciation - 发音字符串
   * @returns {Array} 重音数组
   */
  extractStress(pronunciation) {
    const stresses = []
    const parts = pronunciation.split(' ')
    
    parts.forEach((part, index) => {
      if (part.match(/^\d+$/)) {
        stresses.push({
          position: index,
          level: parseInt(part)
        })
      }
    })
    
    return stresses
  },

  /**
   * 计算音节数
   * @param {string} pronunciation - 发音字符串
   * @returns {number} 音节数
   */
  countSyllables(pronunciation) {
    return pronunciation.split(' ').filter(p => p.match(/^\d+$/)).length
  },

  /**
   * 获取单词的CMU数据
   * @param {string} word - 单词
   * @returns {Object|null} CMU数据
   */
  getWordData(word) {
    if (!this.cmuLoaded || !this.cmuData) {
      return null
    }

    const normalizedWord = word.toLowerCase()
    return this.cmuData[normalizedWord] || null
  },

  /**
   * 验证单词切分
   * @param {string} word - 单词
   * @param {Array} segments - 切分片段
   * @returns {Object} 验证结果
   */
  validateSegmentation(word, segments) {
    const cmuData = this.getWordData(word)
    if (!cmuData) {
      return {
        valid: false,
        confidence: 0,
        reason: 'CMU数据不可用'
      }
    }

    // 基于音节数验证
    const expectedSyllables = cmuData.syllables
    const actualSyllables = this.countSegmentsByType(segments, ['vowel', 'vowel-team', 'r-controlled'])
    
    const syllableMatch = Math.abs(expectedSyllables - actualSyllables) <= 1
    
    // 基于音素长度验证
    const expectedPhonemes = cmuData.phonemes.length
    const actualPhonemes = segments.length
    
    const phonemeMatch = Math.abs(expectedPhonemes - actualPhonemes) <= 2

    const confidence = (syllableMatch ? 0.6 : 0.3) + (phonemeMatch ? 0.4 : 0.2)

    return {
      valid: confidence > 0.5,
      confidence: Math.min(confidence, 1),
      expectedSyllables,
      actualSyllables,
      expectedPhonemes,
      actualPhonemes,
      cmuData
    }
  },

  /**
   * 统计特定类型的片段数量
   * @param {Array} segments - 片段数组
   * @param {Array} types - 类型数组
   * @returns {number} 数量
   */
  countSegmentsByType(segments, types) {
    return segments.filter(segment => types.includes(segment.type)).length
  },

  /**
   * 缓存CMU数据
   * @param {Object} data - CMU数据
   */
  cacheCMUData(data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_CONFIG.CMU_CACHE_PREFIX + 'dict', JSON.stringify(cacheData))
    } catch (error) {
      console.warn('缓存CMU数据失败:', error.message)
    }
  },

  /**
   * 获取缓存的CMU数据
   * @returns {Object|null} 缓存的CMU数据
   */
  getCachedCMUData() {
    try {
      const cached = localStorage.getItem(CACHE_CONFIG.CMU_CACHE_PREFIX + 'dict')
      if (cached) {
        const data = JSON.parse(cached)
        if (data.timestamp && Date.now() - data.timestamp < CACHE_CONFIG.CACHE_EXPIRY) {
          return data.data
        } else {
          localStorage.removeItem(CACHE_CONFIG.CMU_CACHE_PREFIX + 'dict')
        }
      }
      return null
    } catch (error) {
      console.warn('读取CMU缓存失败:', error.message)
      return null
    }
  }
}

/**
 * 自然拼读API服务主类
 */
export class PhonicsAPIService {
  constructor() {
    this.phonicsStuffKey = null
    this.cache = new Map()
  }

  /**
   * 设置Phonics+Stuff API密钥
   * @param {string} apiKey - API密钥
   */
  setPhonicsStuffKey(apiKey) {
    this.phonicsStuffKey = apiKey
  }

  /**
   * 获取单词的增强自然拼读分析
   * @param {string} word - 单词
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 分析结果
   */
  async getEnhancedPhonicsAnalysis(word, options = {}) {
    const normalizedWord = word.toLowerCase().trim()
    
    // 检查缓存
    const cacheKey = `enhanced_${normalizedWord}_${JSON.stringify(options)}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const result = {
      word: normalizedWord,
      segments: [],
      validation: null,
      sources: [],
      confidence: 0,
      timestamp: Date.now()
    }

    // 1. 尝试Phonics+Stuff API
    if (this.phonicsStuffKey && options.usePhonicsStuff !== false) {
      try {
        const phonicsData = await phonicsStuffAPI.getPhonicsAnalysis(normalizedWord, this.phonicsStuffKey)
        if (phonicsData) {
          result.segments = phonicsData.segments
          result.sources.push('phonics-stuff')
          result.confidence = Math.max(result.confidence, phonicsData.confidence || 0.7)
        }
      } catch (error) {
        console.warn('Phonics+Stuff API调用失败:', error.message)
      }
    }

    // 2. 使用CMU词典数据验证
    if (options.useCMU !== false) {
      try {
        await cmuDictAPI.loadCMUDict()
        const validation = cmuDictAPI.validateSegmentation(normalizedWord, result.segments)
        result.validation = validation
        result.sources.push('cmu-dict')
        result.confidence = Math.max(result.confidence, validation.confidence)
      } catch (error) {
        console.warn('CMU验证失败:', error.message)
      }
    }

    // 3. 如果没有获取到数据，返回空结果
    if (result.segments.length === 0) {
      result.confidence = 0
    }

    // 缓存结果
    this.cache.set(cacheKey, result)
    
    return result
  }

  /**
   * 批量获取增强分析
   * @param {Array<string>} words - 单词数组
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 批量结果
   */
  async getBatchEnhancedAnalysis(words, options = {}) {
    const results = {}
    const promises = words.map(async (word) => {
      try {
        const analysis = await this.getEnhancedPhonicsAnalysis(word, options)
        results[word] = analysis
        // 减少API调用频率
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.warn(`批量分析失败 (${word}):`, error.message)
        results[word] = {
          word,
          segments: [],
          validation: null,
          sources: [],
          confidence: 0,
          error: error.message
        }
      }
    })
    
    await Promise.all(promises)
    return results
  }

  /**
   * 验证API配置
   * @returns {Promise<Object>} 验证结果
   */
  async validateConfiguration() {
    const result = {
      phonicsStuff: false,
      cmuDict: false,
      overall: false
    }

    // 验证Phonics+Stuff API
    if (this.phonicsStuffKey) {
      result.phonicsStuff = await phonicsStuffAPI.validateApiKey(this.phonicsStuffKey)
    }

    // 验证CMU词典
    result.cmuDict = await cmuDictAPI.loadCMUDict()

    result.overall = result.phonicsStuff || result.cmuDict
    return result
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * 获取服务状态
   * @returns {Object} 状态信息
   */
  getServiceStatus() {
    return {
      phonicsStuffConfigured: !!this.phonicsStuffKey,
      cmuDictLoaded: cmuDictAPI.cmuLoaded,
      cacheSize: this.cache.size,
      cmuDataSize: cmuDictAPI.cmuData ? Object.keys(cmuDictAPI.cmuData).length : 0
    }
  }
}

// 创建默认实例
export const phonicsAPIService = new PhonicsAPIService() 
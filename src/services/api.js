import axios from 'axios'

// DeepSeek API服务
export const deepseekAPI = {
  async generateSentence(prompt, apiKey) {
    try {
      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      })
      
      return response.data.choices[0].message.content
    } catch (error) {
      throw new Error('生成句子失败: ' + error.message)
    }
  },

  async generateTips(prompt, apiKey) {
    try {
      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      })
      
      return response.data.choices[0].message.content
    } catch (error) {
      throw new Error('生成提示失败: ' + error.message)
    }
  }
}

// LanguageTool API服务 - 语法检查
export const grammarAPI = {
  async checkGrammar(text) {
    try {
      const response = await axios.post('https://api.languagetoolplus.com/v2/check', 
        `text=${encodeURIComponent(text)}&language=en-US`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      
      return response.data
    } catch (error) {
      throw new Error('语法检查失败: ' + error.message)
    }
  }
}

// Free Dictionary API服务 - 音标获取
export const dictionaryAPI = {
  // 获取单个单词的音标和释义
  async getWordInfo(word) {
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
      
      if (response.data && response.data.length > 0) {
        const wordData = response.data[0]
        return {
          word: wordData.word,
          phonetic: wordData.phonetic || '',
          phonetics: wordData.phonetics || [],
          meanings: wordData.meanings || [],
          origin: wordData.origin || '',
          pronunciation: this.extractPronunciation(wordData.phonetics)
        }
      }
      return null
    } catch (error) {
      console.warn(`获取单词 ${word} 信息失败:`, error.message)
      return null
    }
  },

  // 批量获取单词信息
  async getBatchWordInfo(words) {
    const results = {}
    const promises = words.map(async (word) => {
      try {
        const info = await this.getWordInfo(word)
        if (info) {
          results[word] = info
        }
        // 减少延迟，提升响应速度
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.warn(`批量获取单词 ${word} 失败:`, error.message)
      }
    })
    
    await Promise.all(promises)
    return results
  },

  // 提取发音URL
  extractPronunciation(phonetics) {
    if (!phonetics || phonetics.length === 0) return null
    
    // 优先选择有audio的phonetic
    const withAudio = phonetics.find(p => p.audio)
    if (withAudio && withAudio.audio) {
      return withAudio.audio
    }
    
    // 如果没有audio，返回第一个phonetic的text
    return phonetics[0].text || null
  }
}

// 本地缓存服务
export const cacheService = {
  // 缓存键前缀
  CACHE_PREFIX: 'word_info_',
  CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7天

  // 获取缓存
  getCachedWordInfo(word) {
    try {
      const key = this.CACHE_PREFIX + word.toLowerCase()
      const cached = localStorage.getItem(key)
      if (cached) {
        const data = JSON.parse(cached)
        if (data.timestamp && Date.now() - data.timestamp < this.CACHE_EXPIRY) {
          return data.info
        } else {
          // 缓存过期，删除
          localStorage.removeItem(key)
        }
      }
      return null
    } catch (error) {
      console.warn('读取缓存失败:', error.message)
      return null
    }
  },

  // 设置缓存
  setCachedWordInfo(word, info) {
    try {
      const key = this.CACHE_PREFIX + word.toLowerCase()
      const data = {
        info,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.warn('设置缓存失败:', error.message)
    }
  },

  // 批量设置缓存
  setBatchCachedWordInfo(wordInfoMap) {
    Object.entries(wordInfoMap).forEach(([word, info]) => {
      this.setCachedWordInfo(word, info)
    })
  },

  // 清除过期缓存
  clearExpiredCache() {
    try {
      const keys = Object.keys(localStorage)
      const expiredKeys = keys.filter(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const cached = localStorage.getItem(key)
          if (cached) {
            const data = JSON.parse(cached)
            return data.timestamp && Date.now() - data.timestamp >= this.CACHE_EXPIRY
          }
        }
        return false
      })
      
      expiredKeys.forEach(key => localStorage.removeItem(key))
      console.log(`清理了 ${expiredKeys.length} 个过期缓存`)
    } catch (error) {
      console.warn('清理缓存失败:', error.message)
    }
  }
}

// 音标服务 - 整合缓存和API
export const phoneticsService = {
  // 获取单词音标信息（优先使用缓存）
  async getWordPhonetics(word) {
    // 1. 检查本地缓存
    const cached = cacheService.getCachedWordInfo(word)
    if (cached) {
      return cached
    }

    // 2. 调用API获取
    const info = await dictionaryAPI.getWordInfo(word)
    if (info) {
      // 3. 处理音标数据
      const processedInfo = this.processPhoneticsData(info)
      // 4. 缓存结果
      cacheService.setCachedWordInfo(word, processedInfo)
      return processedInfo
    }

    return null
  },

  // 批量获取音标信息
  async getBatchPhonetics(words) {
    const results = {}
    const uncachedWords = []

    // 1. 检查缓存
    words.forEach(word => {
      const cached = cacheService.getCachedWordInfo(word)
      if (cached) {
        results[word] = cached
      } else {
        uncachedWords.push(word)
      }
    })

    // 2. 批量获取未缓存的单词
    if (uncachedWords.length > 0) {
      const apiResults = await dictionaryAPI.getBatchWordInfo(uncachedWords)
      
      // 3. 处理音标数据
      Object.keys(apiResults).forEach(word => {
        apiResults[word] = this.processPhoneticsData(apiResults[word])
      })
      
      // 4. 合并结果并缓存
      Object.assign(results, apiResults)
      cacheService.setBatchCachedWordInfo(apiResults)
    }

    return results
  },

  // 生成自然拼读分割
  generatePhoneticSegments(word, phonetic) {
    if (!word || !phonetic) return null
    
    const segments = []
    let currentSegment = ''
    let currentType = ''
    
    // 改进的自然拼读规则
    const vowelPatterns = ['a', 'e', 'i', 'o', 'u', 'y']
    const consonantPatterns = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z']
    const digraphs = ['ch', 'sh', 'th', 'ph', 'wh', 'ck', 'ng', 'qu', 'gh', 'kn', 'wr', 'mb', 'gn', 'sc', 'dg', 'tch', 'dge']
    const vowelTeams = ['ai', 'ay', 'ee', 'ea', 'ie', 'oa', 'oe', 'ue', 'ui', 'ou', 'ow', 'oi', 'oy', 'au', 'aw', 'ew', 'oo']
    const rControlled = ['ar', 'er', 'ir', 'or', 'ur']
    const silentE = ['a_e', 'e_e', 'i_e', 'o_e', 'u_e']
    
    let i = 0
    while (i < word.length) {
      let found = false
      
      // 检查三字母组合
      if (i < word.length - 2) {
        const threeLetters = word.slice(i, i + 3).toLowerCase()
        if (threeLetters.endsWith('e') && vowelPatterns.includes(threeLetters[0])) {
          const pattern = `${threeLetters[0]}_e`
          if (silentE.includes(pattern)) {
            if (currentSegment && currentType !== 'silent-e') {
              segments.push({ text: currentSegment, type: currentType })
              currentSegment = ''
            }
            currentSegment = threeLetters
            currentType = 'silent-e'
            i += 3
            found = true
          }
        }
      }
      
      // 检查双字母组合
      if (!found && i < word.length - 1) {
        const twoLetters = word.slice(i, i + 2).toLowerCase()
        
        if (digraphs.includes(twoLetters)) {
          if (currentSegment && currentType !== 'digraph') {
            segments.push({ text: currentSegment, type: currentType })
            currentSegment = ''
          }
          currentSegment = twoLetters
          currentType = 'digraph'
          i += 2
          found = true
        } else if (vowelTeams.includes(twoLetters)) {
          if (currentSegment && currentType !== 'vowel-team') {
            segments.push({ text: currentSegment, type: currentType })
            currentSegment = ''
          }
          currentSegment = twoLetters
          currentType = 'vowel-team'
          i += 2
          found = true
        } else if (rControlled.includes(twoLetters)) {
          if (currentSegment && currentType !== 'r-controlled') {
            segments.push({ text: currentSegment, type: currentType })
            currentSegment = ''
          }
          currentSegment = twoLetters
          currentType = 'r-controlled'
          i += 2
          found = true
        }
      }
      
      // 检查单个字母
      if (!found) {
        const letter = word[i].toLowerCase()
        let letterType = ''
        
        if (vowelPatterns.includes(letter)) {
          letterType = 'vowel'
        } else if (consonantPatterns.includes(letter)) {
          letterType = 'consonant'
        } else {
          letterType = 'other'
        }
        
        if (currentSegment && currentType !== letterType) {
          segments.push({ text: currentSegment, type: currentType })
          currentSegment = ''
        }
        
        currentSegment += letter
        currentType = letterType
        i++
      }
    }
    
    // 添加最后一个片段
    if (currentSegment) {
      segments.push({ text: currentSegment, type: currentType })
    }
    
    return segments
  },

  // 处理音标数据，提取英音美音
  processPhoneticsData(info) {
    if (!info) return info

    const processed = { ...info }
    
    // 提取英音和美音
    const ukPhonetic = this.extractUKPhonetic(info.phonetics)
    const usPhonetic = this.extractUSPhonetic(info.phonetics)
    
    processed.ukPhonetic = ukPhonetic
    processed.usPhonetic = usPhonetic
    processed.ukAudio = this.extractUKAudio(info.phonetics)
    processed.usAudio = this.extractUSAudio(info.phonetics)
    
    // 生成自然拼读分割
    processed.phoneticSegments = this.generatePhoneticSegments(info.word, ukPhonetic || usPhonetic)
    
    // 清理音标格式
    processed.ukPhonetic = this.cleanPhonetic(ukPhonetic)
    processed.usPhonetic = this.cleanPhonetic(usPhonetic)
    
    return processed
  },

  // 提取英音
  extractUKPhonetic(phonetics) {
    if (!phonetics || phonetics.length === 0) return null
    
    // 查找英音标记
    const ukPhonetic = phonetics.find(p => 
      p.audio && p.audio.includes('/uk/') ||
      p.text && p.text.includes('UK') ||
      p.audio && p.audio.includes('gb')
    )
    
    if (ukPhonetic) {
      return ukPhonetic.text || ukPhonetic.audio
    }
    
    // 如果没有明确标记，返回第一个
    return phonetics[0]?.text || null
  },

  // 提取美音
  extractUSPhonetic(phonetics) {
    if (!phonetics || phonetics.length === 0) return null
    
    // 查找美音标记
    const usPhonetic = phonetics.find(p => 
      p.audio && p.audio.includes('/us/') ||
      p.text && p.text.includes('US') ||
      p.audio && p.audio.includes('us')
    )
    
    if (usPhonetic) {
      return usPhonetic.text || usPhonetic.audio
    }
    
    // 如果有多个音标，返回第二个（通常是美音）
    if (phonetics.length > 1) {
      return phonetics[1]?.text || null
    }
    
    return null
  },

  // 提取英音音频
  extractUKAudio(phonetics) {
    if (!phonetics || phonetics.length === 0) return null
    
    const ukAudio = phonetics.find(p => 
      p.audio && (p.audio.includes('/uk/') || p.audio.includes('gb'))
    )
    
    return ukAudio?.audio || null
  },

  // 提取美音音频
  extractUSAudio(phonetics) {
    if (!phonetics || phonetics.length === 0) return null
    
    const usAudio = phonetics.find(p => 
      p.audio && (p.audio.includes('/us/') || p.audio.includes('us'))
    )
    
    return usAudio?.audio || null
  },

  // 清理音标格式，使其更易读
  cleanPhonetic(phonetic) {
    if (!phonetic) return null
    
    // 移除多余的斜杠和方括号
    let cleaned = phonetic.replace(/^[\/\[\]]+|[\/\[\]]+$/g, '')
    
    // 标准化音标符号，使其更符合教材标准
    cleaned = cleaned
      // 长音标记
      .replace(/ɑː/g, 'ɑː')
      .replace(/ɔː/g, 'ɔː')
      .replace(/ɜː/g, 'ɜː')
      .replace(/iː/g, 'iː')
      .replace(/uː/g, 'uː')
      .replace(/əː/g, 'ɜː')
      
      // 短音
      .replace(/ɑ/g, 'ɑ')
      .replace(/ɔ/g, 'ɔ')
      .replace(/ɜ/g, 'ɜ')
      .replace(/i/g, 'ɪ')
      .replace(/u/g, 'ʊ')
      .replace(/ə/g, 'ə')
      
      // 其他音标
      .replace(/æ/g, 'æ')
      .replace(/ʌ/g, 'ʌ')
      .replace(/ʊ/g, 'ʊ')
      .replace(/θ/g, 'θ')
      .replace(/ð/g, 'ð')
      .replace(/ʃ/g, 'ʃ')
      .replace(/ʒ/g, 'ʒ')
      .replace(/ŋ/g, 'ŋ')
      .replace(/j/g, 'j')
      .replace(/w/g, 'w')
      
      // 重音标记
      .replace(/ˈ/g, 'ˈ')
      .replace(/ˌ/g, 'ˌ')
      
      // 音节分隔
      .replace(/\./g, '·')
    
    return cleaned
  },

  // 播放发音
  playPronunciation(audioUrl) {
    if (!audioUrl) {
      console.warn('没有可用的发音URL')
      return
    }

    try {
      const audio = new Audio(audioUrl)
      audio.play().catch(error => {
        console.warn('播放发音失败:', error.message)
        // 降级到浏览器TTS
        this.playTTS(audioUrl)
      })
    } catch (error) {
      console.warn('创建音频对象失败:', error.message)
    }
  },

  // 浏览器TTS降级方案
  playTTS(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    } else {
      console.warn('浏览器不支持语音合成')
    }
  }
}

// Grist API服务（待实现）
export const gristAPI = {
  async syncData(data) {
    // TODO: 实现Grist数据同步
    console.log('同步数据到Grist:', data)
    return true
  },

  async loadData() {
    // TODO: 从Grist加载数据
    console.log('从Grist加载数据')
    return null
  }
} 
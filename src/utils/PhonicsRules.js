/**
 * 自然拼读规则库引擎
 * 实现优先级匹配算法，支持多种音素类型的识别和切分
 */

// 音素类型定义
export const PHONICS_TYPES = {
  VOWEL: 'vowel',
  CONSONANT: 'consonant',
  DIGRAPH: 'digraph',
  VOWEL_TEAM: 'vowel-team',
  R_CONTROLLED: 'r-controlled',
  SILENT_E: 'silent-e',
  TRIGRAPH: 'trigraph',
  BLEND: 'blend',
  PREFIX: 'prefix',
  SUFFIX: 'suffix',
  OTHER: 'other'
}

// 优先级定义（数字越小优先级越高）
export const PRIORITY_LEVELS = {
  EXCEPTION: 1,
  TRIGRAPH: 2,
  DIGRAPH: 3,
  VOWEL_TEAM: 4,
  R_CONTROLLED: 5,
  SILENT_E: 6,
  BLEND: 7,
  PREFIX: 8,
  SUFFIX: 9,
  VOWEL: 10,
  CONSONANT: 11,
  OTHER: 12
}

// 扩展规则库
export const PHONICS_RULES = {
  // 例外词表（最高优先级）
  exceptions: {
    'machine': [{ text: 'ma', type: PHONICS_TYPES.CONSONANT }, { text: 'chine', type: PHONICS_TYPES.DIGRAPH }],
    'said': [{ text: 's', type: PHONICS_TYPES.CONSONANT }, { text: 'ai', type: PHONICS_TYPES.VOWEL_TEAM }, { text: 'd', type: PHONICS_TYPES.CONSONANT }],
    'friend': [{ text: 'fr', type: PHONICS_TYPES.BLEND }, { text: 'ie', type: PHONICS_TYPES.VOWEL_TEAM }, { text: 'nd', type: PHONICS_TYPES.BLEND }],
    'build': [{ text: 'b', type: PHONICS_TYPES.CONSONANT }, { text: 'ui', type: PHONICS_TYPES.VOWEL_TEAM }, { text: 'ld', type: PHONICS_TYPES.BLEND }],
    'guitar': [{ text: 'gui', type: PHONICS_TYPES.VOWEL_TEAM }, { text: 'tar', type: PHONICS_TYPES.R_CONTROLLED }],
    'beautiful': [{ text: 'beau', type: PHONICS_TYPES.VOWEL_TEAM }, { text: 'ti', type: PHONICS_TYPES.DIGRAPH }, { text: 'ful', type: PHONICS_TYPES.SUFFIX }]
  },

  // 三字母组合
  trigraphs: [
    { pattern: 'tch', type: PHONICS_TYPES.TRIGRAPH, examples: ['catch', 'watch', 'match'] },
    { pattern: 'dge', type: PHONICS_TYPES.TRIGRAPH, examples: ['bridge', 'judge', 'ledge'] },
    { pattern: 'igh', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['high', 'night', 'light'] },
    { pattern: 'ear', type: PHONICS_TYPES.R_CONTROLLED, examples: ['ear', 'hear', 'fear'] },
    { pattern: 'air', type: PHONICS_TYPES.R_CONTROLLED, examples: ['air', 'fair', 'chair'] },
    { pattern: 'oor', type: PHONICS_TYPES.R_CONTROLLED, examples: ['door', 'floor'] },
    { pattern: 'ure', type: PHONICS_TYPES.R_CONTROLLED, examples: ['sure', 'pure', 'cure'] }
  ],

  // 双字母组合
  digraphs: [
    { pattern: 'ch', type: PHONICS_TYPES.DIGRAPH, examples: ['chair', 'church', 'lunch'] },
    { pattern: 'sh', type: PHONICS_TYPES.DIGRAPH, examples: ['ship', 'fish', 'wish'] },
    { pattern: 'th', type: PHONICS_TYPES.DIGRAPH, examples: ['this', 'that', 'with'] },
    { pattern: 'ph', type: PHONICS_TYPES.DIGRAPH, examples: ['phone', 'photo', 'elephant'] },
    { pattern: 'wh', type: PHONICS_TYPES.DIGRAPH, examples: ['what', 'when', 'where'] },
    { pattern: 'ck', type: PHONICS_TYPES.DIGRAPH, examples: ['back', 'sick', 'rock'] },
    { pattern: 'ng', type: PHONICS_TYPES.DIGRAPH, examples: ['sing', 'ring', 'long'] },
    { pattern: 'qu', type: PHONICS_TYPES.DIGRAPH, examples: ['queen', 'quick', 'quiet'] },
    { pattern: 'gh', type: PHONICS_TYPES.DIGRAPH, examples: ['ghost', 'light', 'night'] },
    { pattern: 'kn', type: PHONICS_TYPES.DIGRAPH, examples: ['know', 'knee', 'knife'] },
    { pattern: 'wr', type: PHONICS_TYPES.DIGRAPH, examples: ['write', 'wrong', 'wrap'] },
    { pattern: 'mb', type: PHONICS_TYPES.DIGRAPH, examples: ['comb', 'lamb', 'thumb'] },
    { pattern: 'gn', type: PHONICS_TYPES.DIGRAPH, examples: ['sign', 'gnat', 'gnaw'] },
    { pattern: 'sc', type: PHONICS_TYPES.DIGRAPH, examples: ['science', 'scene', 'scent'] },
    { pattern: 'dg', type: PHONICS_TYPES.DIGRAPH, examples: ['edge', 'bridge', 'judge'] }
  ],

  // 元音团队
  vowelTeams: [
    { pattern: 'ai', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['rain', 'train', 'mail'] },
    { pattern: 'ay', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['day', 'play', 'say'] },
    { pattern: 'ee', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['see', 'tree', 'feet'] },
    { pattern: 'ea', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['eat', 'meat', 'seat'] },
    { pattern: 'ie', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['pie', 'lie', 'tie'] },
    { pattern: 'oa', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['boat', 'coat', 'road'] },
    { pattern: 'oe', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['toe', 'hoe', 'foe'] },
    { pattern: 'ue', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['blue', 'glue', 'true'] },
    { pattern: 'ui', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['fruit', 'juice', 'suit'] },
    { pattern: 'ou', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['out', 'house', 'mouse'] },
    { pattern: 'ow', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['cow', 'how', 'now'] },
    { pattern: 'oi', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['oil', 'coin', 'join'] },
    { pattern: 'oy', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['boy', 'toy', 'joy'] },
    { pattern: 'au', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['auto', 'author', 'cause'] },
    { pattern: 'aw', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['saw', 'law', 'draw'] },
    { pattern: 'ew', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['new', 'few', 'grew'] },
    { pattern: 'oo', type: PHONICS_TYPES.VOWEL_TEAM, examples: ['book', 'look', 'good'] }
  ],

  // R控制音
  rControlled: [
    { pattern: 'ar', type: PHONICS_TYPES.R_CONTROLLED, examples: ['car', 'star', 'far'] },
    { pattern: 'er', type: PHONICS_TYPES.R_CONTROLLED, examples: ['her', 'per', 'term'] },
    { pattern: 'ir', type: PHONICS_TYPES.R_CONTROLLED, examples: ['bird', 'girl', 'first'] },
    { pattern: 'or', type: PHONICS_TYPES.R_CONTROLLED, examples: ['for', 'or', 'more'] },
    { pattern: 'ur', type: PHONICS_TYPES.R_CONTROLLED, examples: ['fur', 'turn', 'hurt'] }
  ],

  // 静音e模式
  silentE: [
    { pattern: 'a_e', type: PHONICS_TYPES.SILENT_E, examples: ['make', 'take', 'cake'] },
    { pattern: 'e_e', type: PHONICS_TYPES.SILENT_E, examples: ['here', 'there', 'where'] },
    { pattern: 'i_e', type: PHONICS_TYPES.SILENT_E, examples: ['like', 'bike', 'time'] },
    { pattern: 'o_e', type: PHONICS_TYPES.SILENT_E, examples: ['home', 'bone', 'note'] },
    { pattern: 'u_e', type: PHONICS_TYPES.SILENT_E, examples: ['cute', 'mute', 'use'] }
  ],

  // 辅音混合音
  blends: [
    { pattern: 'bl', type: PHONICS_TYPES.BLEND, examples: ['black', 'blue', 'blow'] },
    { pattern: 'br', type: PHONICS_TYPES.BLEND, examples: ['bread', 'brown', 'break'] },
    { pattern: 'cl', type: PHONICS_TYPES.BLEND, examples: ['clock', 'clean', 'clap'] },
    { pattern: 'cr', type: PHONICS_TYPES.BLEND, examples: ['crab', 'cry', 'cross'] },
    { pattern: 'dr', type: PHONICS_TYPES.BLEND, examples: ['drum', 'drop', 'drive'] },
    { pattern: 'fl', type: PHONICS_TYPES.BLEND, examples: ['flag', 'fly', 'flower'] },
    { pattern: 'fr', type: PHONICS_TYPES.BLEND, examples: ['frog', 'from', 'friend'] },
    { pattern: 'gl', type: PHONICS_TYPES.BLEND, examples: ['glad', 'glow', 'glass'] },
    { pattern: 'gr', type: PHONICS_TYPES.BLEND, examples: ['green', 'grow', 'grass'] },
    { pattern: 'pl', type: PHONICS_TYPES.BLEND, examples: ['play', 'plan', 'plant'] },
    { pattern: 'pr', type: PHONICS_TYPES.BLEND, examples: ['pray', 'print', 'pretty'] },
    { pattern: 'sc', type: PHONICS_TYPES.BLEND, examples: ['scare', 'school', 'score'] },
    { pattern: 'sk', type: PHONICS_TYPES.BLEND, examples: ['sky', 'skip', 'skin'] },
    { pattern: 'sl', type: PHONICS_TYPES.BLEND, examples: ['sleep', 'slow', 'slide'] },
    { pattern: 'sm', type: PHONICS_TYPES.BLEND, examples: ['smile', 'small', 'smoke'] },
    { pattern: 'sn', type: PHONICS_TYPES.BLEND, examples: ['snake', 'snow', 'snap'] },
    { pattern: 'sp', type: PHONICS_TYPES.BLEND, examples: ['spoon', 'spot', 'spin'] },
    { pattern: 'st', type: PHONICS_TYPES.BLEND, examples: ['stop', 'star', 'stick'] },
    { pattern: 'sw', type: PHONICS_TYPES.BLEND, examples: ['swim', 'swing', 'sweet'] },
    { pattern: 'tr', type: PHONICS_TYPES.BLEND, examples: ['tree', 'train', 'truck'] },
    { pattern: 'tw', type: PHONICS_TYPES.BLEND, examples: ['twin', 'twice', 'twelve'] }
  ],

  // 常见前缀
  prefixes: [
    { pattern: 'un', type: PHONICS_TYPES.PREFIX, examples: ['undo', 'unhappy', 'unlock'] },
    { pattern: 're', type: PHONICS_TYPES.PREFIX, examples: ['redo', 'return', 'replay'] },
    { pattern: 'in', type: PHONICS_TYPES.PREFIX, examples: ['inside', 'input', 'inbox'] },
    { pattern: 'im', type: PHONICS_TYPES.PREFIX, examples: ['impossible', 'improve', 'import'] },
    { pattern: 'dis', type: PHONICS_TYPES.PREFIX, examples: ['dislike', 'disagree', 'disappear'] },
    { pattern: 'pre', type: PHONICS_TYPES.PREFIX, examples: ['prefix', 'prepare', 'preview'] },
    { pattern: 'mis', type: PHONICS_TYPES.PREFIX, examples: ['mistake', 'misunderstand', 'mislead'] }
  ],

  // 常见后缀
  suffixes: [
    { pattern: 'ing', type: PHONICS_TYPES.SUFFIX, examples: ['running', 'jumping', 'playing'] },
    { pattern: 'ed', type: PHONICS_TYPES.SUFFIX, examples: ['walked', 'played', 'jumped'] },
    { pattern: 'er', type: PHONICS_TYPES.SUFFIX, examples: ['teacher', 'runner', 'player'] },
    { pattern: 'est', type: PHONICS_TYPES.SUFFIX, examples: ['biggest', 'fastest', 'tallest'] },
    { pattern: 'ful', type: PHONICS_TYPES.SUFFIX, examples: ['beautiful', 'careful', 'helpful'] },
    { pattern: 'less', type: PHONICS_TYPES.SUFFIX, examples: ['careless', 'hopeless', 'fearless'] },
    { pattern: 'ly', type: PHONICS_TYPES.SUFFIX, examples: ['quickly', 'slowly', 'happily'] },
    { pattern: 'ness', type: PHONICS_TYPES.SUFFIX, examples: ['happiness', 'kindness', 'darkness'] }
  ],

  // 单个元音
  vowels: ['a', 'e', 'i', 'o', 'u', 'y'],

  // 单个辅音
  consonants: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z']
}

/**
 * 自然拼读规则引擎
 */
export class PhonicsRulesEngine {
  constructor() {
    this.rules = PHONICS_RULES
    this.cache = new Map()
  }

  /**
   * 分析单词的自然拼读结构
   * @param {string} word - 要分析的单词
   * @param {Object} options - 分析选项
   * @returns {Array} 音素片段数组
   */
  analyzeWord(word, options = {}) {
    if (!word) return []

    const normalizedWord = word.toLowerCase().trim()
    
    // 检查缓存
    if (this.cache.has(normalizedWord)) {
      return this.cache.get(normalizedWord)
    }

    // 检查例外词表
    if (this.rules.exceptions[normalizedWord]) {
      const result = this.rules.exceptions[normalizedWord]
      this.cache.set(normalizedWord, result)
      return result
    }

    // 执行优先级匹配
    const segments = this.priorityMatch(normalizedWord, options)
    
    // 缓存结果
    this.cache.set(normalizedWord, segments)
    
    return segments
  }

  /**
   * 优先级匹配算法
   * @param {string} word - 单词
   * @param {Object} options - 选项
   * @returns {Array} 音素片段
   */
  priorityMatch(word, options = {}) {
    const segments = []
    let i = 0

    while (i < word.length) {
      let matched = false
      let segment = null

      // 按优先级顺序匹配
      const matchOrder = [
        () => this.matchTrigraph(word, i),
        () => this.matchDigraph(word, i),
        () => this.matchVowelTeam(word, i),
        () => this.matchRControlled(word, i),
        () => this.matchSilentE(word, i),
        () => this.matchBlend(word, i),
        () => this.matchPrefix(word, i),
        () => this.matchSuffix(word, i),
        () => this.matchVowel(word, i),
        () => this.matchConsonant(word, i)
      ]

      for (const matchFn of matchOrder) {
        segment = matchFn()
        if (segment) {
          matched = true
          break
        }
      }

      if (matched && segment) {
        segments.push(segment)
        i += segment.text.length
      } else {
        // 如果没有匹配到任何规则，作为其他类型处理
        segments.push({
          text: word[i],
          type: PHONICS_TYPES.OTHER,
          priority: PRIORITY_LEVELS.OTHER
        })
        i++
      }
    }

    return segments
  }

  /**
   * 匹配三字母组合
   */
  matchTrigraph(word, index) {
    if (index + 2 >= word.length) return null

    const trigraph = word.slice(index, index + 3)
    const rule = this.rules.trigraphs.find(r => r.pattern === trigraph)
    
    if (rule) {
      return {
        text: trigraph,
        type: rule.type,
        priority: PRIORITY_LEVELS.TRIGRAPH,
        rule: rule
      }
    }

    return null
  }

  /**
   * 匹配双字母组合
   */
  matchDigraph(word, index) {
    if (index + 1 >= word.length) return null

    const digraph = word.slice(index, index + 2)
    const rule = this.rules.digraphs.find(r => r.pattern === digraph)
    
    if (rule) {
      return {
        text: digraph,
        type: rule.type,
        priority: PRIORITY_LEVELS.DIGRAPH,
        rule: rule
      }
    }

    return null
  }

  /**
   * 匹配元音团队
   */
  matchVowelTeam(word, index) {
    if (index + 1 >= word.length) return null

    const team = word.slice(index, index + 2)
    const rule = this.rules.vowelTeams.find(r => r.pattern === team)
    
    if (rule) {
      return {
        text: team,
        type: rule.type,
        priority: PRIORITY_LEVELS.VOWEL_TEAM,
        rule: rule
      }
    }

    return null
  }

  /**
   * 匹配R控制音
   */
  matchRControlled(word, index) {
    if (index + 1 >= word.length) return null

    const rControlled = word.slice(index, index + 2)
    const rule = this.rules.rControlled.find(r => r.pattern === rControlled)
    
    if (rule) {
      return {
        text: rControlled,
        type: rule.type,
        priority: PRIORITY_LEVELS.R_CONTROLLED,
        rule: rule
      }
    }

    return null
  }

  /**
   * 匹配静音e模式
   */
  matchSilentE(word, index) {
    if (index + 2 >= word.length) return null

    const firstLetter = word[index]
    const lastLetter = word[index + 2]
    
    if (this.rules.vowels.includes(firstLetter) && lastLetter === 'e') {
      const pattern = `${firstLetter}_e`
      const rule = this.rules.silentE.find(r => r.pattern === pattern)
      
      if (rule) {
        return {
          text: word.slice(index, index + 3),
          type: rule.type,
          priority: PRIORITY_LEVELS.SILENT_E,
          rule: rule
        }
      }
    }

    return null
  }

  /**
   * 匹配辅音混合音
   */
  matchBlend(word, index) {
    if (index + 1 >= word.length) return null

    const blend = word.slice(index, index + 2)
    const rule = this.rules.blends.find(r => r.pattern === blend)
    
    if (rule) {
      return {
        text: blend,
        type: rule.type,
        priority: PRIORITY_LEVELS.BLEND,
        rule: rule
      }
    }

    return null
  }

  /**
   * 匹配前缀
   */
  matchPrefix(word, index) {
    if (index !== 0) return null // 前缀只能在开头

    for (const prefixRule of this.rules.prefixes) {
      if (word.startsWith(prefixRule.pattern)) {
        return {
          text: prefixRule.pattern,
          type: prefixRule.type,
          priority: PRIORITY_LEVELS.PREFIX,
          rule: prefixRule
        }
      }
    }

    return null
  }

  /**
   * 匹配后缀
   */
  matchSuffix(word, index) {
    for (const suffixRule of this.rules.suffixes) {
      const suffixStart = word.length - suffixRule.pattern.length
      if (index === suffixStart && word.endsWith(suffixRule.pattern)) {
        return {
          text: suffixRule.pattern,
          type: suffixRule.type,
          priority: PRIORITY_LEVELS.SUFFIX,
          rule: suffixRule
        }
      }
    }

    return null
  }

  /**
   * 匹配单个元音
   */
  matchVowel(word, index) {
    const letter = word[index]
    if (this.rules.vowels.includes(letter)) {
      return {
        text: letter,
        type: PHONICS_TYPES.VOWEL,
        priority: PRIORITY_LEVELS.VOWEL
      }
    }
    return null
  }

  /**
   * 匹配单个辅音
   */
  matchConsonant(word, index) {
    const letter = word[index]
    if (this.rules.consonants.includes(letter)) {
      return {
        text: letter,
        type: PHONICS_TYPES.CONSONANT,
        priority: PRIORITY_LEVELS.CONSONANT
      }
    }
    return null
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * 获取规则统计信息
   */
  getRuleStats() {
    return {
      exceptions: Object.keys(this.rules.exceptions).length,
      trigraphs: this.rules.trigraphs.length,
      digraphs: this.rules.digraphs.length,
      vowelTeams: this.rules.vowelTeams.length,
      rControlled: this.rules.rControlled.length,
      silentE: this.rules.silentE.length,
      blends: this.rules.blends.length,
      prefixes: this.rules.prefixes.length,
      suffixes: this.rules.suffixes.length,
      vowels: this.rules.vowels.length,
      consonants: this.rules.consonants.length
    }
  }
}

// 创建默认实例
export const phonicsEngine = new PhonicsRulesEngine() 
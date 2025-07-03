import { phonicsEngine } from './PhonicsRules.js'
import { PHONICS_TYPES } from './PhonicsRules.js'

/**
 * 自然拼读练习引擎
 * 负责生成练习题目、验证答案和管理练习状态
 */
export class PhonicsPracticeEngine {
  constructor() {
    this.currentExercise = null
    this.score = 0
    this.totalQuestions = 0
    this.correctAnswers = 0
    this.exerciseHistory = []
  }

  /**
   * 练习类型定义
   */
  static EXERCISE_TYPES = {
    PHONEME_IDENTIFICATION: 'phoneme-identification', // 音素识别
    PHONEME_CLASSIFICATION: 'phoneme-classification', // 音素分类
    WORD_BUILDING: 'word-building' // 单词构建
  }

  /**
   * 生成音素识别练习题目
   * @param {Array} words - 可选，指定单词列表
   * @param {Object} options - 练习选项
   * @returns {Object} 练习题目对象
   */
  generatePhonemeIdentificationExercise(words = null, options = {}) {
    const {
      targetTypes = [PHONICS_TYPES.VOWEL_TEAM, PHONICS_TYPES.DIGRAPH, PHONICS_TYPES.BLEND],
      difficulty = 'medium',
      wordCount = 1
    } = options

    console.log('Generating exercise with options:', options)
    console.log('Target types:', targetTypes)

    // 如果没有提供单词，使用默认单词库
    if (!words) {
      words = this.getDefaultPracticeWords()
    }

    console.log('Using words:', words)

    // 随机选择单词
    const selectedWords = this.getRandomWords(words, wordCount)
    console.log('Selected words:', selectedWords)
    
    // 分析每个单词的音素
    const exercises = selectedWords.map(word => {
      console.log('Analyzing word:', word)
      const segments = phonicsEngine.analyzeWord(word)
      console.log('Segments for', word, ':', segments)
      
      const targetSegments = segments.filter(segment => 
        targetTypes.includes(segment.type)
      )
      console.log('Target segments for', word, ':', targetSegments)

      if (targetSegments.length === 0) {
        console.log('No target segments found for', word, ', skipping')
        return null // 跳过没有目标音素的单词
      }

      // 随机选择一个目标音素
      const targetSegment = targetSegments[Math.floor(Math.random() * targetSegments.length)]
      console.log('Selected target segment for', word, ':', targetSegment)
      
      return {
        word,
        segments,
        targetSegment,
        targetType: targetSegment.type,
        question: `请点击单词 "${word}" 中的 ${this.getTypeLabel(targetSegment.type)}`,
        type: PhonicsPracticeEngine.EXERCISE_TYPES.PHONEME_IDENTIFICATION
      }
    }).filter(Boolean)

    console.log('Generated exercises:', exercises)

    return {
      exercises,
      type: PhonicsPracticeEngine.EXERCISE_TYPES.PHONEME_IDENTIFICATION,
      difficulty,
      totalQuestions: exercises.length
    }
  }

  /**
   * 生成音素分类练习题目
   * @param {Object} options - 练习选项
   * @returns {Object} 练习题目对象
   */
  generatePhonemeClassificationExercise(options = {}) {
    const {
      phonemeCount = 6,
      includeTypes = [PHONICS_TYPES.VOWEL_TEAM, PHONICS_TYPES.DIGRAPH, PHONICS_TYPES.BLEND, PHONICS_TYPES.R_CONTROLLED]
    } = options

    // 从规则库中收集音素
    const phonemes = this.collectPhonemesFromRules(includeTypes)
    
    // 随机选择音素
    const selectedPhonemes = this.getRandomPhonemes(phonemes, phonemeCount)
    
    // 创建分类区域
    const categories = includeTypes.map(type => ({
      type,
      label: this.getTypeLabel(type),
      phonemes: []
    }))

    return {
      phonemes: selectedPhonemes,
      categories,
      type: PhonicsPracticeEngine.EXERCISE_TYPES.PHONEME_CLASSIFICATION,
      totalQuestions: selectedPhonemes.length
    }
  }

  /**
   * 验证音素识别答案
   * @param {Object} exercise - 练习题目
   * @param {Object} selectedSegment - 用户选择的音素片段
   * @returns {Object} 验证结果
   */
  validatePhonemeIdentification(exercise, selectedSegment) {
    console.log('=== 验证音素识别答案 ===')
    console.log('练习题目:', exercise)
    console.log('用户选择:', selectedSegment)
    console.log('目标音素:', exercise.targetSegment)
    
    const isCorrect = selectedSegment && 
                     selectedSegment.text === exercise.targetSegment.text &&
                     selectedSegment.type === exercise.targetSegment.type

    console.log('文本匹配:', selectedSegment?.text === exercise.targetSegment.text)
    console.log('类型匹配:', selectedSegment?.type === exercise.targetSegment.type)
    console.log('最终结果:', isCorrect)

    const result = {
      correct: isCorrect,
      expected: exercise.targetSegment,
      selected: selectedSegment,
      feedback: isCorrect ? 
        `正确！"${selectedSegment.text}" 确实是 ${this.getTypeLabel(selectedSegment.type)}` :
        `错误！正确答案是 "${exercise.targetSegment.text}"，它是 ${this.getTypeLabel(exercise.targetSegment.type)}`
    }

    this.updateScore(isCorrect)
    return result
  }

  /**
   * 验证音素分类答案
   * @param {Array} classifications - 用户分类结果
   * @param {Array} correctClassifications - 正确答案
   * @returns {Object} 验证结果
   */
  validatePhonemeClassification(classifications, correctClassifications) {
    let correctCount = 0
    const results = []

    classifications.forEach(classification => {
      const correct = correctClassifications.find(c => c.phoneme === classification.phoneme)
      const isCorrect = correct && correct.type === classification.type
      
      if (isCorrect) correctCount++
      
      results.push({
        phoneme: classification.phoneme,
        userType: classification.type,
        correctType: correct ? correct.type : null,
        correct: isCorrect
      })
    })

    const accuracy = correctCount / classifications.length
    const isFullyCorrect = accuracy === 1

    this.updateScore(isFullyCorrect)

    return {
      correct: isFullyCorrect,
      accuracy,
      correctCount,
      totalCount: classifications.length,
      results,
      feedback: isFullyCorrect ? 
        '完美！所有音素都分类正确' :
        `部分正确！正确分类了 ${correctCount}/${classifications.length} 个音素`
    }
  }

  /**
   * 获取音素类型的中文标签
   * @param {string} type - 音素类型
   * @returns {string} 中文标签
   */
  getTypeLabel(type) {
    const labels = {
      [PHONICS_TYPES.VOWEL]: '元音',
      [PHONICS_TYPES.CONSONANT]: '辅音',
      [PHONICS_TYPES.DIGRAPH]: '双字母组合',
      [PHONICS_TYPES.VOWEL_TEAM]: '元音团队',
      [PHONICS_TYPES.R_CONTROLLED]: 'R控制音',
      [PHONICS_TYPES.SILENT_E]: '静音e',
      [PHONICS_TYPES.TRIGRAPH]: '三字母组合',
      [PHONICS_TYPES.BLEND]: '辅音混合音',
      [PHONICS_TYPES.PREFIX]: '前缀',
      [PHONICS_TYPES.SUFFIX]: '后缀',
      [PHONICS_TYPES.OTHER]: '其他'
    }
    return labels[type] || type
  }

  /**
   * 获取默认练习单词
   * @returns {Array} 单词列表
   */
  getDefaultPracticeWords() {
    return [
      'beautiful', 'machine', 'friend', 'build', 'guitar', 'said',
      'through', 'enough', 'thought', 'brought', 'caught', 'taught',
      'rain', 'train', 'mail', 'day', 'play', 'say', 'see', 'tree',
      'feet', 'eat', 'meat', 'seat', 'pie', 'lie', 'tie', 'boat',
      'coat', 'road', 'toe', 'hoe', 'foe', 'blue', 'glue', 'true',
      'fruit', 'juice', 'suit', 'out', 'house', 'mouse', 'cow',
      'how', 'now', 'oil', 'coin', 'join', 'boy', 'toy', 'joy'
    ]
  }

  /**
   * 从规则库中收集音素
   * @param {Array} types - 要包含的音素类型
   * @returns {Array} 音素列表
   */
  collectPhonemesFromRules(types) {
    const phonemes = []
    
    // 从各种规则中收集音素
    const rules = phonicsEngine.rules
    
    if (types.includes(PHONICS_TYPES.VOWEL_TEAM)) {
      rules.vowelTeams.forEach(rule => {
        phonemes.push({ text: rule.pattern, type: PHONICS_TYPES.VOWEL_TEAM })
      })
    }
    
    if (types.includes(PHONICS_TYPES.DIGRAPH)) {
      rules.digraphs.forEach(rule => {
        phonemes.push({ text: rule.pattern, type: PHONICS_TYPES.DIGRAPH })
      })
    }
    
    if (types.includes(PHONICS_TYPES.BLEND)) {
      rules.blends.forEach(rule => {
        phonemes.push({ text: rule.pattern, type: PHONICS_TYPES.BLEND })
      })
    }
    
    if (types.includes(PHONICS_TYPES.R_CONTROLLED)) {
      rules.rControlled.forEach(rule => {
        phonemes.push({ text: rule.pattern, type: PHONICS_TYPES.R_CONTROLLED })
      })
    }

    return phonemes
  }

  /**
   * 随机选择单词
   * @param {Array} words - 单词列表
   * @param {number} count - 需要的数量
   * @returns {Array} 选中的单词
   */
  getRandomWords(words, count) {
    const shuffled = [...words].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  /**
   * 随机选择音素
   * @param {Array} phonemes - 音素列表
   * @param {number} count - 需要的数量
   * @returns {Array} 选中的音素
   */
  getRandomPhonemes(phonemes, count) {
    const shuffled = [...phonemes].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  /**
   * 更新得分
   * @param {boolean} isCorrect - 是否答对
   */
  updateScore(isCorrect) {
    this.totalQuestions++
    if (isCorrect) {
      this.correctAnswers++
      this.score += 10
    }
  }

  /**
   * 获取当前得分统计
   * @returns {Object} 得分统计
   */
  getScoreStats() {
    return {
      score: this.score,
      totalQuestions: this.totalQuestions,
      correctAnswers: this.correctAnswers,
      accuracy: this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions * 100).toFixed(1) : 0
    }
  }

  /**
   * 重置练习状态
   */
  reset() {
    this.currentExercise = null
    this.score = 0
    this.totalQuestions = 0
    this.correctAnswers = 0
  }

  /**
   * 保存练习历史
   * @param {Object} exerciseResult - 练习结果
   */
  saveExerciseHistory(exerciseResult) {
    this.exerciseHistory.push({
      ...exerciseResult,
      timestamp: new Date().toISOString(),
      stats: this.getScoreStats()
    })
  }

  /**
   * 获取练习历史
   * @returns {Array} 练习历史
   */
  getExerciseHistory() {
    return this.exerciseHistory
  }
}

// 创建全局实例
export const phonicsPracticeEngine = new PhonicsPracticeEngine() 
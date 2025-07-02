<template>
  <div class="phonics-test">
    <div class="test-header">
      <h1>自然拼读功能测试</h1>
      <p>测试和验证自然拼读单词组件的各项功能</p>
    </div>

    <div class="test-content">
      <!-- 测试单词输入 -->
      <div class="test-section">
        <h3>测试单词</h3>
        <div class="word-input-group">
          <input 
            v-model="testWord" 
            class="word-input"
            placeholder="输入要测试的单词"
            @keyup.enter="testWordAnalysis"
          >
          <button class="test-btn" @click="testWordAnalysis">分析</button>
        </div>
        
        <div class="sample-words">
          <span class="sample-label">示例单词:</span>
          <button 
            v-for="word in sampleWords" 
            :key="word"
            class="sample-word-btn"
            @click="testWord = word; testWordAnalysis()"
          >
            {{ word }}
          </button>
        </div>
      </div>

      <!-- 显示模式测试 -->
      <div class="test-section">
        <h3>显示模式测试</h3>
        <div class="mode-toggles">
          <button 
            v-for="mode in displayModes" 
            :key="mode.value"
            class="mode-btn"
            :class="{ 'active': currentDisplayMode === mode.value }"
            @click="currentDisplayMode = mode.value"
          >
            {{ mode.label }}
          </button>
        </div>
        
        <div class="word-display">
          <WordBox 
            :word="testWord || 'beautiful'"
            type="noun"
            :count="5"
            :visible="true"
          />
        </div>
      </div>

      <!-- 主题测试 -->
      <div class="test-section">
        <h3>视觉主题测试</h3>
        <div class="theme-toggles">
          <button 
            v-for="theme in visualThemes" 
            :key="theme.value"
            class="theme-btn"
            :class="{ 'active': currentTheme === theme.value }"
            @click="currentTheme = theme.value"
          >
            {{ theme.label }}
          </button>
        </div>
        
        <div class="theme-preview">
          <PhonicsVisualizer
            word="beautiful"
            :display-mode="currentDisplayMode"
            :visual-theme="currentTheme"
            :animation-enabled="animationEnabled"
            :validation-level="validationLevel"
            :show-confidence="showConfidence"
            :show-validation="showValidation"
            :auto-validate="autoValidate"
          />
        </div>
      </div>

      <!-- 功能开关测试 -->
      <div class="test-section">
        <h3>功能开关测试</h3>
        <div class="feature-toggles">
          <div class="feature-toggle">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="animationEnabled"
              >
              动画效果
            </label>
          </div>
          
          <div class="feature-toggle">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="showConfidence"
              >
              显示置信度
            </label>
          </div>
          
          <div class="feature-toggle">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="showValidation"
              >
              显示验证信息
            </label>
          </div>
          
          <div class="feature-toggle">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="autoValidate"
              >
              自动验证
            </label>
          </div>
        </div>
      </div>

      <!-- 验证级别测试 -->
      <div class="test-section">
        <h3>验证级别测试</h3>
        <div class="validation-toggles">
          <button 
            v-for="level in validationLevels" 
            :key="level.value"
            class="validation-btn"
            :class="{ 'active': validationLevel === level.value }"
            @click="validationLevel = level.value"
          >
            {{ level.label }}
          </button>
        </div>
        
        <div class="validation-info">
          <p><strong>当前级别:</strong> {{ validationLevel }}</p>
          <p><strong>说明:</strong> {{ getValidationDescription(validationLevel) }}</p>
        </div>
      </div>

      <!-- 批量测试 -->
      <div class="test-section">
        <h3>批量测试</h3>
        <div class="batch-test">
          <button 
            v-for="testSet in batchTestSets" 
            :key="testSet.name"
            class="batch-btn"
            @click="runBatchTest(testSet.words)"
          >
            {{ testSet.name }} ({{ testSet.words.length }}个单词)
          </button>
        </div>
        
        <div v-if="batchResults.length > 0" class="batch-results">
          <h4>批量测试结果</h4>
          <div class="results-list">
            <div 
              v-for="result in batchResults" 
              :key="result.word"
              class="result-item"
              :class="{ 'success': result.success, 'error': !result.success }"
            >
              <span class="result-word">{{ result.word }}</span>
              <span class="result-status">{{ result.success ? '成功' : '失败' }}</span>
              <span v-if="result.error" class="result-error">{{ result.error }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能测试 -->
      <div class="test-section">
        <h3>性能测试</h3>
        <div class="performance-test">
          <button class="perf-btn" @click="runPerformanceTest">
            运行性能测试
          </button>
          
          <div v-if="performanceResults" class="perf-results">
            <h4>性能测试结果</h4>
            <div class="perf-metrics">
              <div class="perf-metric">
                <span class="metric-label">测试单词数:</span>
                <span class="metric-value">{{ performanceResults.wordCount }}</span>
              </div>
              <div class="perf-metric">
                <span class="metric-label">总耗时:</span>
                <span class="metric-value">{{ performanceResults.totalTime }}ms</span>
              </div>
              <div class="perf-metric">
                <span class="metric-label">平均耗时:</span>
                <span class="metric-value">{{ performanceResults.averageTime }}ms</span>
              </div>
              <div class="perf-metric">
                <span class="metric-label">成功率:</span>
                <span class="metric-value">{{ performanceResults.successRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 设置面板 -->
      <div class="test-section">
        <h3>设置面板</h3>
        <button class="settings-btn" @click="showSettings = !showSettings">
          {{ showSettings ? '隐藏' : '显示' }}设置面板
        </button>
        
        <div v-if="showSettings" class="settings-panel">
          <PhonicsSettings
            v-model="currentConfig"
            @save="handleSettingsSave"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'
import { phonicsEngine } from '../utils/PhonicsRules.js'
import { phonicsAPIService } from '../services/PhonicsAPI.js'
import WordBox from '../components/ui/WordBox.vue'
import PhonicsVisualizer from '../components/ui/PhonicsVisualizer.vue'
import PhonicsSettings from '../components/ui/PhonicsSettings.vue'

export default {
  name: 'PhonicsTest',
  components: {
    WordBox,
    PhonicsVisualizer,
    PhonicsSettings
  },
  setup() {
    const settingsStore = useSettingsStore()
    
    // 测试状态
    const testWord = ref('beautiful')
    const currentDisplayMode = ref('phonics')
    const currentTheme = ref('colorful')
    const animationEnabled = ref(true)
    const showConfidence = ref(false)
    const showValidation = ref(true)
    const autoValidate = ref(true)
    const validationLevel = ref('basic')
    const showSettings = ref(false)
    const batchResults = ref([])
    const performanceResults = ref(null)

    // 当前配置
    const currentConfig = computed(() => settingsStore.phonicsConfig)

    // 测试数据
    const sampleWords = [
      'beautiful', 'machine', 'friend', 'build', 'guitar', 'said',
      'through', 'enough', 'thought', 'brought', 'caught', 'taught'
    ]

    const displayModes = [
      { value: 'normal', label: '普通模式' },
      { value: 'phonics', label: '自然拼读' },
      { value: 'detailed', label: '详细模式' }
    ]

    const visualThemes = [
      { value: 'colorful', label: '彩色主题' },
      { value: 'minimal', label: '简约主题' },
      { value: 'educational', label: '教育主题' }
    ]

    const validationLevels = [
      { value: 'basic', label: '基础验证' },
      { value: 'advanced', label: '高级验证' },
      { value: 'expert', label: '专家验证' }
    ]

    const batchTestSets = [
      {
        name: '基础单词',
        words: ['cat', 'dog', 'hat', 'run', 'big', 'small']
      },
      {
        name: '复杂单词',
        words: ['beautiful', 'machine', 'friend', 'through', 'enough']
      },
      {
        name: '混合单词',
        words: ['cat', 'beautiful', 'dog', 'machine', 'hat', 'friend']
      }
    ]

    // 方法
    const testWordAnalysis = async () => {
      if (!testWord.value) return

      try {
        console.log('测试单词:', testWord.value)
        
        // 测试本地规则引擎
        const localSegments = phonicsEngine.analyzeWord(testWord.value)
        console.log('本地规则结果:', localSegments)
        
        // 测试API服务
        if (validationLevel.value !== 'basic') {
          const apiResult = await phonicsAPIService.getEnhancedPhonicsAnalysis(
            testWord.value, 
            { usePhonicsStuff: validationLevel.value === 'expert', useCMU: validationLevel.value !== 'basic' }
          )
          console.log('API结果:', apiResult)
        }
        
        console.log('测试完成')
      } catch (error) {
        console.error('测试失败:', error)
      }
    }

    const getValidationDescription = (level) => {
      const descriptions = {
        basic: '仅使用本地规则库进行切分',
        advanced: '使用CMU词典数据进行验证',
        expert: '使用Phonics+Stuff API和CMU数据进行完整验证'
      }
      return descriptions[level] || '未知级别'
    }

    const runBatchTest = async (words) => {
      batchResults.value = []
      
      for (const word of words) {
        try {
          const startTime = performance.now()
          
          let result
          if (validationLevel.value === 'basic') {
            result = phonicsEngine.analyzeWord(word)
          } else {
            result = await phonicsAPIService.getEnhancedPhonicsAnalysis(word, {
              usePhonicsStuff: validationLevel.value === 'expert',
              useCMU: validationLevel.value !== 'basic'
            })
          }
          
          const endTime = performance.now()
          
          batchResults.value.push({
            word,
            success: true,
            time: endTime - startTime,
            segments: result.segments || result
          })
        } catch (error) {
          batchResults.value.push({
            word,
            success: false,
            error: error.message
          })
        }
      }
    }

    const runPerformanceTest = async () => {
      const testWords = sampleWords.concat(['cat', 'dog', 'hat', 'run', 'big', 'small'])
      const results = []
      const startTime = performance.now()
      
      for (const word of testWords) {
        try {
          const wordStartTime = performance.now()
          
          if (validationLevel.value === 'basic') {
            phonicsEngine.analyzeWord(word)
          } else {
            await phonicsAPIService.getEnhancedPhonicsAnalysis(word, {
              usePhonicsStuff: validationLevel.value === 'expert',
              useCMU: validationLevel.value !== 'basic'
            })
          }
          
          const wordEndTime = performance.now()
          results.push({
            word,
            success: true,
            time: wordEndTime - wordStartTime
          })
        } catch (error) {
          results.push({
            word,
            success: false,
            error: error.message
          })
        }
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      const successCount = results.filter(r => r.success).length
      const averageTime = results.reduce((sum, r) => sum + (r.time || 0), 0) / results.length
      
      performanceResults.value = {
        wordCount: testWords.length,
        totalTime: Math.round(totalTime),
        averageTime: Math.round(averageTime),
        successRate: Math.round((successCount / testWords.length) * 100)
      }
    }

    const handleSettingsSave = (config) => {
      console.log('设置已保存:', config)
      // 更新当前测试配置
      currentDisplayMode.value = config.displayMode
      currentTheme.value = config.visualTheme
      animationEnabled.value = config.animationEnabled
      showConfidence.value = config.showConfidence
      showValidation.value = config.showValidation
      autoValidate.value = config.autoValidate
      validationLevel.value = config.validationLevel
    }

    // 组件挂载时初始化
    onMounted(() => {
      console.log('PhonicsTest组件已挂载')
      console.log('当前配置:', currentConfig.value)
    })

    return {
      testWord,
      currentDisplayMode,
      currentTheme,
      animationEnabled,
      showConfidence,
      showValidation,
      autoValidate,
      validationLevel,
      showSettings,
      batchResults,
      performanceResults,
      currentConfig,
      sampleWords,
      displayModes,
      visualThemes,
      validationLevels,
      batchTestSets,
      testWordAnalysis,
      getValidationDescription,
      runBatchTest,
      runPerformanceTest,
      handleSettingsSave
    }
  }
}
</script>

<style scoped>
.phonics-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.test-header {
  text-align: center;
  margin-bottom: 32px;
}

.test-header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.test-header p {
  color: #7f8c8d;
  margin: 0;
}

.test-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.test-section {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-section h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
}

.word-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.word-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
}

.word-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.test-btn {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-btn:hover {
  background: #36976b;
}

.sample-words {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sample-label {
  font-weight: 600;
  color: #495057;
}

.sample-word-btn {
  padding: 4px 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sample-word-btn:hover {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.mode-toggles,
.theme-toggles,
.validation-toggles {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.mode-btn,
.theme-btn,
.validation-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover,
.theme-btn:hover,
.validation-btn:hover {
  background: #e9ecef;
}

.mode-btn.active,
.theme-btn.active,
.validation-btn.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.word-display,
.theme-preview {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 100px;
}

.feature-toggles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.feature-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.validation-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.validation-info p {
  margin: 8px 0;
}

.batch-test {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.batch-btn {
  padding: 10px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.batch-btn:hover {
  background: #5a6268;
}

.batch-results {
  margin-top: 16px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.result-item.success {
  background: #d4edda;
  color: #155724;
}

.result-item.error {
  background: #f8d7da;
  color: #721c24;
}

.result-word {
  font-weight: 600;
  min-width: 80px;
}

.result-status {
  font-weight: 500;
}

.result-error {
  font-size: 0.8rem;
  opacity: 0.8;
}

.performance-test {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.perf-btn {
  padding: 12px 24px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.perf-btn:hover {
  background: #138496;
}

.perf-results {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.perf-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.perf-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.metric-label {
  font-weight: 500;
  color: #495057;
}

.metric-value {
  font-weight: 600;
  color: #42b983;
}

.settings-btn {
  padding: 10px 20px;
  background: #6f42c1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-btn:hover {
  background: #5a32a3;
}

.settings-panel {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .phonics-test {
    padding: 16px;
  }

  .word-input-group {
    flex-direction: column;
  }

  .mode-toggles,
  .theme-toggles,
  .validation-toggles {
    flex-direction: column;
  }

  .feature-toggles {
    grid-template-columns: 1fr;
  }

  .batch-test {
    flex-direction: column;
  }

  .perf-metrics {
    grid-template-columns: 1fr;
  }
}
</style> 
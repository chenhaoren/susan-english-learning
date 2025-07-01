<template>
  <div class="random-sentence-page">
    <!-- 空状态 -->
    <div v-if="wordStore.isEmpty" class="empty-state">
      <div class="empty-icon">📚</div>
      <div class="empty-title">单词库为空</div>
      <div class="empty-desc">请先添加一些单词到单词库中</div>
      <div class="empty-actions">
        <button class="vue-btn primary" @click="openUploadModal">
          <span>📥</span>
          <span>上传单词库</span>
        </button>
        <button class="vue-btn secondary" @click="showWordBank">
          <span>📝</span>
          <span>手动添加</span>
        </button>
      </div>
    </div>

    <!-- 主界面 -->
    <div v-else class="main-content">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-content">
          <h1>随机组句</h1>
          <p class="header-desc">选择单词类型，生成随机组合进行造句练习</p>
        </div>
        <div class="header-actions">
          <button class="icon-btn" @click="showWordBank" title="单词库">
            <span>📚</span>
          </button>
          <button class="icon-btn" @click="showHistory" title="历史记录">
            <span>📋</span>
          </button>
          <button class="icon-btn" @click="openSettingsModal" title="设置">
            <span>⚙️</span>
          </button>
        </div>
      </header>

      <!-- 核心功能区域 -->
      <div class="core-section">
        <!-- 单词类型选择 -->
        <div class="type-selector">
          <div class="selector-label">选择单词类型</div>
          <div class="type-options">
            <button 
              v-for="type in wordTypes" 
              :key="type.value"
              class="type-option"
              :class="{ 'active': selectedTypes.includes(type.value) }"
              @click="toggleType(type.value)"
            >
              <span class="type-icon">{{ type.icon }}</span>
              <span class="type-name">{{ type.label }}</span>
              <span class="type-count">{{ words[type.value + 's'].length }}</span>
            </button>
          </div>
        </div>

        <!-- 单词展示区域 -->
        <div class="word-display">
          <div class="display-header">
            <span class="display-title">当前组合</span>
            <button class="refresh-btn" @click="generateNewSentence" title="刷新组合">
              <span>🔄</span>
            </button>
          </div>
          <div class="word-container">
            <WordBox 
              :word="currentSentence.verb" 
              type="verb" 
              :count="getWordCount(currentSentence.verb, 'verb')"
              :visible="selectedTypes.includes('verb')"
            />
            <div class="connector" v-if="shouldShowConnector(0)">+</div>
            <WordBox 
              :word="currentSentence.adjective" 
              type="adjective" 
              :count="getWordCount(currentSentence.adjective, 'adjective')"
              :visible="selectedTypes.includes('adjective')"
            />
            <div class="connector" v-if="shouldShowConnector(1)">+</div>
            <WordBox 
              :word="currentSentence.noun" 
              type="noun" 
              :count="getWordCount(currentSentence.noun, 'noun')"
              :visible="selectedTypes.includes('noun')"
            />
          </div>
        </div>

        <!-- 造句练习区域 -->
        <div class="practice-section">
          <div class="practice-header">
            <h3>造句练习</h3>
            <div class="practice-actions">
              <label class="count-checkbox">
                <input 
                  type="checkbox" 
                  v-model="wordCountChecked"
                  @change="handleWordCount"
                  :disabled="wordCountDisabled"
                />
                <span>标记已用</span>
              </label>
              <button class="grammar-btn" @click="checkGrammar" :disabled="!userSentence.trim()">
                <span>✓</span>
                <span>检查语法</span>
              </button>
            </div>
          </div>
          
          <div class="input-area">
            <textarea 
              v-model="userSentence"
              placeholder="使用上面的单词组合写一个英文句子..."
              @keydown.enter.prevent="checkGrammar"
              class="practice-input"
            ></textarea>
            <div v-if="grammarResult" class="grammar-result" v-html="grammarResult"></div>
          </div>
        </div>
      </div>

      <!-- 结果展示 -->
      <div v-if="sentenceResult" class="result-section">
        <div class="result-header">
          <h3>AI 造句建议</h3>
        </div>
        <div class="result-content" v-html="sentenceResult"></div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <button class="action-btn primary" @click="generateNewSentence">
          <span>🎲</span>
          <span>新组合</span>
        </button>
        <button class="action-btn secondary" @click="showWordBank">
          <span>📚</span>
          <span>单词库</span>
        </button>
        <button class="action-btn secondary" @click="showHistory">
          <span>📋</span>
          <span>历史</span>
        </button>
      </div>
    </div>

    <!-- 悬浮上传按钮 -->
    <button class="upload-fab" @click="openUploadModal" title="上传单词库">
      <span class="fab-icon">📥</span>
    </button>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useWordStore } from '../stores/wordStore'
import { useSentenceStore } from '../stores/sentenceStore'
import { useSettingsStore } from '../stores/settingsStore'
import WordBox from '../components/ui/WordBox.vue'

export default {
  name: 'RandomSentence',
  components: {
    WordBox
  },
  setup() {
    const wordStore = useWordStore()
    const sentenceStore = useSentenceStore()
    const settingsStore = useSettingsStore()

    const selectedTypes = ref(['verb', 'adjective', 'noun'])
    const wordCountChecked = ref(false)
    const wordCountDisabled = ref(false)
    const userSentence = ref('')
    const grammarResult = ref('')

    const wordTypes = [
      { value: 'verb', label: '动词', icon: '🏃' },
      { value: 'adjective', label: '形容词', icon: '🎨' },
      { value: 'noun', label: '名词', icon: '📦' }
    ]

    const currentSentence = computed(() => sentenceStore.currentSentence)
    const sentenceResult = computed(() => sentenceStore.sentenceResult)
    const words = computed(() => wordStore.currentWords)

    const getWordCount = (word, type) => {
      if (!word) return 0
      const counts = type === 'verb' ? wordStore.verbCounts : 
                    type === 'adjective' ? wordStore.adjectiveCounts : 
                    wordStore.nounCounts
      return counts[word] || 0
    }

    const shouldShowConnector = (index) => {
      const visibleTypes = selectedTypes.value
      if (visibleTypes.length === 1) return false
      if (visibleTypes.length === 2) {
        if (index === 0) return visibleTypes.includes('verb') && visibleTypes.includes('adjective')
        return false
      }
      return index < visibleTypes.length - 1
    }

    const toggleType = (type) => {
      const index = selectedTypes.value.indexOf(type)
      if (index > -1) {
        selectedTypes.value.splice(index, 1)
      } else {
        selectedTypes.value.push(type)
      }
      updateCombinationType()
    }

    const updateCombinationType = () => {
      wordStore.selectedTypes = selectedTypes.value
      generateNewSentence()
    }

    const generateNewSentence = () => {
      const combination = wordStore.getRandomCombination()
      sentenceStore.generateSentence(combination)
      resetWordCount()
    }

    const resetWordCount = () => {
      wordCountChecked.value = false
      wordCountDisabled.value = false
    }

    const handleWordCount = () => {
      if (!wordCountChecked.value) return

      Object.entries(currentSentence.value).forEach(([type, word]) => {
        if (word) {
          wordStore.updateWordCount(word, type)
        }
      })

      wordCountDisabled.value = true
    }

    const openUploadModal = () => {
      // TODO: 实现上传模态框
      console.log('打开上传模态框')
    }

    const openSettingsModal = () => {
      settingsStore.openSettingsModal()
    }

    const showWordBank = () => {
      // TODO: 实现单词库展示
      console.log('显示单词库')
    }

    const showHistory = () => {
      // TODO: 实现历史记录展示
      console.log('显示历史记录')
    }

    const checkGrammar = () => {
      if (!userSentence.value.trim()) {
        grammarResult.value = '<div style="color: #e74c3c;">请输入英文句子！</div>'
        return
      }

      grammarResult.value = '<div style="color: #42b983;">正在检查语法...</div>'
      
      import('../services/api.js').then(({ grammarAPI }) => {
        grammarAPI.checkGrammar(userSentence.value)
          .then(data => {
            if (data.matches && data.matches.length > 0) {
              let html = '<div style="background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e5e9f2;">'
              html += '<div style="color: #e74c3c; font-weight: 600; margin-bottom: 12px;">发现语法/拼写问题：</div>'
              html += '<ul style="margin: 0; padding-left: 20px;">'
              
              data.matches.forEach(match => {
                const highlightedText = userSentence.value.substring(
                  match.offset,
                  match.offset + match.length
                )
                html += '<li style="margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #42b983;">'
                html += `<div style="color: #2c3e50; margin-bottom: 8px; font-weight: 500;">${match.message}</div>`
                
                if (match.replacements && match.replacements.length > 0) {
                  const suggestions = match.replacements.slice(0, 3).map(r => r.value).join(', ')
                  html += `<div style="color: #42b983; font-size: 0.95rem; margin-bottom: 8px;">建议：${suggestions}</div>`
                }
                
                html += `<div style="color: #666; font-size: 0.9rem;">问题位置：<span style="background: #ffecec; color: #e74c3c; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${highlightedText}</span></div>`
                html += '</li>'
              })
              
              html += '</ul></div>'
              grammarResult.value = html
            } else {
              grammarResult.value = '<div style="color: #42b983; background: #f0f9f6; padding: 12px; border-radius: 6px; border-left: 4px solid #42b983;">✅ 语法检查通过！句子看起来没有明显问题。</div>'
            }
          })
          .catch(error => {
            console.error('语法检查失败:', error)
            grammarResult.value = '<div style="color: #e74c3c;">语法检查服务暂时不可用，请稍后重试。</div>'
          })
      })
    }

    onMounted(() => {
      generateNewSentence()
    })

    return {
      wordStore,
      selectedTypes,
      wordCountChecked,
      wordCountDisabled,
      userSentence,
      grammarResult,
      wordTypes,
      currentSentence,
      sentenceResult,
      words,
      getWordCount,
      shouldShowConnector,
      toggleType,
      updateCombinationType,
      generateNewSentence,
      handleWordCount,
      openUploadModal,
      openSettingsModal,
      showWordBank,
      showHistory,
      checkGrammar
    }
  }
}
</script>

<style scoped>
.random-sentence-page {
  min-height: 100vh;
  background: #fafbfc;
  animation: fadeInUp 0.5s ease-out;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.empty-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.empty-desc {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* 主内容 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 0 1.5rem 0;
  border-bottom: 1px solid #e5e9f2;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.header-desc {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(66, 185, 131, 0.1);
  color: #42b983;
}

/* 核心功能区域 */
.core-section {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* 类型选择器 */
.type-selector {
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 1.5rem;
}

.selector-label {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.type-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 16px;
  border: 1px solid #e5e9f2;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
  min-width: 120px;
}

.type-option:hover {
  border-color: #42b983;
  background: rgba(66, 185, 131, 0.05);
}

.type-option.active {
  background: #42b983;
  color: #fff;
  border-color: #42b983;
}

.type-icon {
  font-size: 1.2rem;
}

.type-name {
  font-weight: 500;
}

.type-count {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* 单词展示区域 */
.word-display {
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 1.5rem;
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.display-title {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(66, 185, 131, 0.1);
  color: #42b983;
  transform: rotate(180deg);
}

.word-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.connector {
  font-size: 1.5rem;
  color: #42b983;
  font-weight: 700;
  animation: pulse 2s infinite;
}

/* 练习区域 */
.practice-section {
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 1.5rem;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.practice-header h3 {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.practice-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.count-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
}

.count-checkbox input {
  margin: 0;
}

.grammar-btn {
  background: #42b983;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.grammar-btn:hover:not(:disabled) {
  background: #36976b;
}

.grammar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.input-area {
  margin-top: 1rem;
}

.practice-input {
  width: 100%;
  min-height: 100px;
  font-size: 1rem;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e5e9f2;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.6;
  transition: all 0.2s;
  background: #fff;
}

.practice-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.grammar-result {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(66, 185, 131, 0.1);
  border-radius: 6px;
  border-left: 4px solid #42b983;
}

/* 结果区域 */
.result-section {
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  animation: fadeInUp 0.4s ease-out;
}

.result-header h3 {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.result-content {
  color: #666;
  line-height: 1.6;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #42b983;
  color: #fff;
}

.action-btn.primary:hover {
  background: #36976b;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #fff;
  color: #666;
  border: 1px solid #e5e9f2;
}

.action-btn.secondary:hover {
  border-color: #42b983;
  color: #42b983;
  transform: translateY(-1px);
}

/* 悬浮按钮 */
.upload-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(66, 185, 131, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-fab:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 6px 25px rgba(66, 185, 131, 0.4);
}

.fab-icon {
  font-size: 1.5rem;
}

/* 按钮样式 */
.vue-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
}

.vue-btn.primary {
  background: #42b983;
  color: #fff;
}

.vue-btn.primary:hover {
  background: #36976b;
  transform: translateY(-1px);
}

.vue-btn.secondary {
  background: #fff;
  color: #666;
  border: 1px solid #e5e9f2;
}

.vue-btn.secondary:hover {
  border-color: #42b983;
  color: #42b983;
  transform: translateY(-1px);
}

/* 动画 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 0 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    align-self: flex-end;
  }
  
  .type-options {
    justify-content: center;
  }
  
  .type-option {
    min-width: 100px;
    flex: 1;
  }
  
  .word-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .connector {
    transform: rotate(90deg);
  }
  
  .practice-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .practice-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .upload-fab {
    bottom: 1rem;
    right: 1rem;
    width: 48px;
    height: 48px;
  }
}
</style> 
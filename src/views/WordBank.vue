<template>
  <div class="word-bank-flat">
    <div class="header-row">
      <h1>单词库</h1>
      <div class="actions">
        <button class="icon-btn" @click="openImport" title="导入"><span>📥</span></button>
        <button class="icon-btn" @click="exportWords" title="导出"><span>📤</span></button>
        <button class="icon-btn" @click="fetchAllPhonetics" title="获取音标"><span>🔊</span></button>
        <button class="icon-btn danger" @click="clearAll" title="清空"><span>🗑️</span></button>
        <input type="file" ref="fileInput" style="display:none" @change="handleImport" accept=".xlsx,.csv" />
      </div>
    </div>
    <div class="word-bank-groups">
      <div v-for="type in wordTypes" :key="type.value" class="word-group">
        <div class="group-title">
          <span>{{ type.label }}</span>
          <span class="count">{{ words[type.value + 's'].length }}</span>
          <input v-model="newWord[type.value]" :placeholder="'添加'+type.label" @keyup.enter="addWord(type.value)" class="add-input" />
        </div>
        <div class="word-chips">
          <span
            v-for="word in filteredWords(type.value)"
            :key="word"
            class="chip"
            :title="word"
            :style="{ background: getColorByCount(getWordCount(word, type.value)) }"
            @mouseenter="hoverWord = type.value + '-' + word"
            @mouseleave="hoverWord = ''"
          >
            <div class="chip-content">
              <!-- 自然拼读分割的单词 -->
              <div v-if="getWordPhonetics(word)?.phoneticSegments" class="chip-word-segments">
                <span 
                  v-for="(segment, index) in getWordPhonetics(word).phoneticSegments" 
                  :key="index"
                  class="chip-word-segment"
                  :class="`chip-segment-${segment.type}`"
                >
                  {{ segment.text }}
                </span>
              </div>
              <div v-else class="chip-word">{{ word }}</div>
              
              <div v-if="getWordPhonetics(word)" class="chip-phonetics">
                <!-- 英音 -->
                <div v-if="getWordPhonetics(word).ukPhonetic" class="chip-phonetic-item">
                  <span class="chip-phonetic-label">🇬🇧</span>
                  <span class="chip-phonetic-text">{{ getWordPhonetics(word).ukPhonetic }}</span>
                  <button 
                    v-if="getWordPhonetics(word).ukAudio"
                    class="chip-pronunciation-btn" 
                    @click.stop="playWordPronunciation(word, 'uk')"
                    title="播放英音"
                  >
                    🔊
                  </button>
                </div>
                
                <!-- 美音 -->
                <div v-if="getWordPhonetics(word).usPhonetic" class="chip-phonetic-item">
                  <span class="chip-phonetic-label">🇺🇸</span>
                  <span class="chip-phonetic-text">{{ getWordPhonetics(word).usPhonetic }}</span>
                  <button 
                    v-if="getWordPhonetics(word).usAudio"
                    class="chip-pronunciation-btn" 
                    @click.stop="playWordPronunciation(word, 'us')"
                    title="播放美音"
                  >
                    🔊
                  </button>
                </div>
                
                <!-- 通用音标 -->
                <div v-if="!getWordPhonetics(word).ukPhonetic && !getWordPhonetics(word).usPhonetic && getWordPhonetics(word).phonetic" class="chip-phonetic-item">
                  <span class="chip-phonetic-text">{{ getWordPhonetics(word).phonetic }}</span>
                  <button 
                    v-if="getWordPhonetics(word).pronunciation"
                    class="chip-pronunciation-btn" 
                    @click.stop="playWordPronunciation(word)"
                    title="播放发音"
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>
            <span v-if="getWordCount(word, type.value) > 0" class="chip-count">{{ getWordCount(word, type.value) }}</span>
            <span
              v-if="hoverWord === (type.value + '-' + word)"
              class="chip-actions"
            >
              <span class="chip-icon" @click="editWord(type.value, word)" title="编辑">✏️</span>
              <span class="chip-icon" @click="deleteWord(type.value, word)" title="删除">✖️</span>
            </span>
          </span>
        </div>
      </div>
    </div>
    <!-- 编辑弹窗 -->
    <div v-if="editDialog.visible" class="modal-overlay">
      <div class="modal-panel">
        <button class="modal-close" @click="closeEditDialog">&times;</button>
        <h3>编辑单词</h3>
        <input v-model="editDialog.word" />
        <button class="vue-btn" @click="confirmEdit">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useWordStore } from '../stores/wordStore'

export default {
  name: 'WordBank',
  setup() {
    const wordStore = useWordStore()
    const wordTypes = [
      { value: 'verb', label: '动词' },
      { value: 'adjective', label: '形容词' },
      { value: 'noun', label: '名词' }
    ]
    const newWord = reactive({ verb: '', adjective: '', noun: '' })
    const editDialog = reactive({ visible: false, type: '', oldWord: '', word: '' })
    const fileInput = ref(null)
    const words = wordStore.currentWords
    const hoverWord = ref('')

    function getWordCount(word, type) {
      const counts = type === 'verb' ? wordStore.verbCounts : type === 'adjective' ? wordStore.adjectiveCounts : wordStore.nounCounts
      return counts[word] || 0
    }
    
    function getWordPhonetics(word) {
      return wordStore.getWordPhonetics(word)
    }
    
    function getColorByCount(count) {
      if (!count) return '#f5f7fa'
      const ratio = Math.min(count, 20) / 20
      const r = Math.round(66 + (204 - 66) * ratio)
      const g = Math.round(185 + (51 - 185) * ratio)
      const b = Math.round(131 + (51 - 131) * ratio)
      return `rgba(${r},${g},${b},0.18)`
    }
    function filteredWords(type) {
      return words[type + 's']
    }
    function addWord(type) {
      const val = newWord[type].trim()
      if (!val) return
      if (!words[type + 's'].includes(val)) {
        words[type + 's'].push(val)
        wordStore.saveToStorage()
        // 自动获取音标
        fetchWordPhonetics(val)
      }
      newWord[type] = ''
    }
    function deleteWord(type, word) {
      if (!confirm(`确定要删除"${word}"吗？`)) return
      const arr = words[type + 's']
      const idx = arr.indexOf(word)
      if (idx !== -1) {
        arr.splice(idx, 1)
        wordStore.saveToStorage()
      }
    }
    function editWord(type, word) {
      editDialog.visible = true
      editDialog.type = type
      editDialog.oldWord = word
      editDialog.word = word
    }
    function closeEditDialog() {
      editDialog.visible = false
    }
    function confirmEdit() {
      const arr = words[editDialog.type + 's']
      const idx = arr.indexOf(editDialog.oldWord)
      if (idx !== -1 && editDialog.word.trim()) {
        arr[idx] = editDialog.word.trim()
        wordStore.saveToStorage()
        // 为新单词获取音标
        fetchWordPhonetics(editDialog.word.trim())
      }
      closeEditDialog()
    }
    function clearAll() {
      if (!confirm('确定要清空全部单词库吗？')) return
      wordStore.verbs = []
      wordStore.adjectives = []
      wordStore.nouns = []
      wordStore.saveToStorage()
    }
    
    // 获取单个单词音标
    async function fetchWordPhonetics(word) {
      try {
        const { phoneticsService } = await import('../services/api.js')
        const info = await phoneticsService.getWordPhonetics(word)
        if (info) {
          wordStore.setWordPhonetics(word, info)
        }
      } catch (error) {
        console.warn(`获取单词 ${word} 音标失败:`, error)
      }
    }
    
    // 批量获取所有单词音标
    async function fetchAllPhonetics() {
      const allWords = [
        ...words.verbs,
        ...words.adjectives,
        ...words.nouns
      ]
      
      if (allWords.length === 0) {
        alert('单词库为空，请先添加一些单词')
        return
      }
      
      const wordsWithoutPhonetics = allWords.filter(word => !wordStore.hasPhonetics(word))
      
      if (wordsWithoutPhonetics.length === 0) {
        alert('所有单词都已获取音标')
        return
      }
      
      try {
        const { phoneticsService } = await import('../services/api.js')
        const phoneticsData = await phoneticsService.getBatchPhonetics(wordsWithoutPhonetics)
        wordStore.setBatchPhonetics(phoneticsData)
        alert(`成功获取 ${Object.keys(phoneticsData).length} 个单词的音标`)
      } catch (error) {
        console.error('批量获取音标失败:', error)
        alert('获取音标失败，请稍后重试')
      }
    }
    
    // 播放单词发音
    async function playWordPronunciation(word, language = 'us') {
      const phoneticsData = getWordPhonetics(word)
      
      // 根据语言选择音频
      let audioUrl = null
      let lang = 'en-US'
      
      if (language === 'uk' && phoneticsData?.ukAudio) {
        audioUrl = phoneticsData.ukAudio
        lang = 'en-GB'
      } else if (language === 'us' && phoneticsData?.usAudio) {
        audioUrl = phoneticsData.usAudio
        lang = 'en-US'
      } else if (phoneticsData?.pronunciation) {
        audioUrl = phoneticsData.pronunciation
      }
      
      if (!audioUrl) {
        // 降级到浏览器TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word)
          utterance.lang = lang
          utterance.rate = 0.8
          speechSynthesis.speak(utterance)
        }
        return
      }

      try {
        const { phoneticsService } = await import('../services/api.js')
        phoneticsService.playPronunciation(audioUrl)
      } catch (error) {
        console.warn('播放发音失败:', error)
        // 降级到浏览器TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word)
          utterance.lang = lang
          utterance.rate = 0.8
          speechSynthesis.speak(utterance)
        }
      }
    }
    
    function openImport() {
      fileInput.value && fileInput.value.click()
    }
    async function handleImport(e) {
      const file = e.target.files[0]
      if (!file) return
      
      try {
        // 这里应该实现Excel/CSV解析
        // 暂时使用模拟数据
        const mockData = {
          verbs: ['run', 'jump', 'swim'],
          adjectives: ['fast', 'tall', 'beautiful'],
          nouns: ['cat', 'dog', 'house']
        }
        
        const result = await wordStore.importWordsWithPhonetics(mockData)
        if (result.success) {
          alert(`导入成功！\n导入单词：${result.wordsImported}个\n获取音标：${result.phoneticsFetched}个`)
        } else {
          alert(`导入失败：${result.error}`)
        }
      } catch (error) {
        console.error('导入失败:', error)
        alert('导入失败，请检查文件格式')
      }
      
      // 清空文件输入
      e.target.value = ''
    }
    function exportWords() {
      alert('导出功能待实现')
    }

    return {
      wordTypes,
      words,
      newWord,
      addWord,
      deleteWord,
      editWord,
      editDialog,
      closeEditDialog,
      confirmEdit,
      clearAll,
      openImport,
      fileInput,
      handleImport,
      exportWords,
      getWordCount,
      getWordPhonetics,
      getColorByCount,
      filteredWords,
      hoverWord,
      fetchAllPhonetics,
      playWordPronunciation
    }
  }
}
</script>

<style scoped>
.word-bank-flat {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 8px;
  background: #fff;
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 1rem;
}
h1 {
  font-size: 1.5rem;
  color: #222;
  font-weight: 700;
  margin: 0;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #888;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}
.icon-btn:hover {
  background: #f5f7fa;
  color: #42b983;
}
.icon-btn.danger:hover {
  color: #e74c3c;
}
.word-bank-groups {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
.word-group {
  flex: 1 1 0;
  min-width: 260px;
  margin-bottom: 1.5rem;
}
.group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.08rem;
  margin-bottom: 0.5rem;
  color: #42b983;
  font-weight: 600;
}
.count {
  background: #f5f7fa;
  color: #888;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.95rem;
  margin-right: 8px;
}
.add-input {
  flex: 1;
  border: none;
  border-bottom: 1.5px solid #e5e9f2;
  background: transparent;
  padding: 4px 8px;
  font-size: 1rem;
  outline: none;
  margin-left: 8px;
  transition: border-color 0.2s;
}
.add-input:focus {
  border-color: #42b983;
}
.word-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  display: inline-flex;
  align-items: center;
  background: #f5f7fa;
  color: #222;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 1rem;
  position: relative;
  min-width: 36px;
  transition: background 0.2s, color 0.2s;
  cursor: default;
  user-select: text;
}

.chip-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chip-word {
  font-weight: 500;
}

/* 自然拼读分割样式 */
.chip-word-segments {
  display: flex;
  align-items: center;
  gap: 0.5px;
  flex-wrap: wrap;
}

.chip-word-segment {
  font-weight: 500;
  transition: all 0.2s;
  padding: 0.5px 1px;
  border-radius: 2px;
  font-size: 0.9em;
}

.chip-segment-vowel {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.chip-segment-consonant {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.chip-segment-digraph {
  color: #9b59b6;
  background: rgba(155, 89, 182, 0.1);
}

.chip-segment-vowel-team {
  color: #f39c12;
  background: rgba(243, 156, 18, 0.1);
}

.chip-segment-r-controlled {
  color: #e67e22;
  background: rgba(230, 126, 34, 0.1);
}

.chip-segment-silent-e {
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.chip-segment-other {
  color: #95a5a6;
  background: rgba(149, 165, 166, 0.1);
}

.chip-phonetics {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip-phonetic-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #666;
  font-family: 'Arial', sans-serif;
}

.chip-phonetic-label {
  font-weight: 600;
}

.chip-phonetic-text {
  font-weight: 500;
}

.chip-pronunciation-btn {
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #42b983;
  cursor: pointer;
  padding: 1px;
  border-radius: 2px;
  transition: all 0.2s;
}

.chip-pronunciation-btn:hover {
  background: rgba(66, 185, 131, 0.1);
  transform: scale(1.1);
}

.chip-count {
  background: #e0e0e0;
  color: #888;
  border-radius: 8px;
  font-size: 0.85em;
  padding: 0 6px;
  margin-left: 6px;
  font-weight: 600;
}
.chip-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
}
.chip-icon {
  font-size: 1em;
  color: #bbb;
  cursor: pointer;
  margin-left: 2px;
  border-radius: 4px;
  padding: 1px 3px;
  transition: background 0.2s, color 0.2s;
}
.chip-icon:hover {
  background: #eafaf5;
  color: #42b983;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal-panel {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  box-shadow: 0 8px 32px 0 rgba(66, 185, 131, 0.13);
  position: relative;
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
}
@media (max-width: 900px) {
  .word-bank-groups {
    flex-direction: column;
    gap: 1rem;
  }
  .word-group {
    min-width: 0;
  }
}
</style> 
<template>
  <div class="word-bank-flat">
    <!-- 单词本管理区 -->
    <div class="header-row">
      <h1>单词库</h1>
      <div class="actions">
        <button class="icon-btn" @click="openImport" title="导入单词本"><span>📥</span></button>
        <button class="icon-btn" @click="toggleMode" :title="isAllMode ? '切换到单词本模式' : '切换到总表模式'">
          <span>{{ isAllMode ? '📚' : '📖' }}</span>
        </button>
        <input type="file" ref="fileInput" style="display:none" @change="handleImport" accept=".xlsx,.csv" />
      </div>
    </div>
    <div class="word-book-list">
      <div v-for="book in wordBooks" :key="book.id" class="word-book-item" :class="{active: book.id === currentWordBookId}" @click="selectWordBook(book.id)">
        <div v-if="editingId === book.id">
          <input v-model="editName" @keyup.enter="saveRename(book.id)" @blur="saveRename(book.id)" class="edit-input" />
        </div>
        <div v-else class="book-name-row">
          <span class="book-name">{{ book.name }}</span>
          <button class="book-action-btn" @click.stop="startRename(book)">✏️</button>
          <button class="book-action-btn" @click.stop="deleteBook(book.id)">🗑️</button>
        </div>
        <div class="book-date">{{ formatDate(book.createdAt) }}</div>
      </div>
      <div v-if="wordBooks.length === 0" class="empty-state">暂无单词本，请导入</div>
    </div>
    <div class="display-mode-info">
      <span>{{ isAllMode ? '总表模式（所有单词本去重）' : '当前单词本模式' }}</span>
    </div>
    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-container">
        <input v-model="searchText" type="text" placeholder="搜索单词..." class="search-input" />
        <span class="search-icon">🔍</span>
      </div>
    </div>
    <!-- 单词分组展示区 -->
    <div class="word-bank-groups">
      <div v-for="type in wordTypes" :key="type.value" class="word-group">
        <div class="group-title">
          <span class="group-name">{{ type.label }}</span>
          <span class="group-count">{{ filteredWords(type.value).length }}/{{ words[type.value].length }}</span>
        </div>
        <div class="word-chips">
          <div v-if="filteredWords(type.value).length === 0" class="empty-state">
            <span class="empty-text">{{ searchText.trim() ? '没有找到匹配的单词' : '暂无单词' }}</span>
          </div>
          <span v-for="word in filteredWords(type.value)" :key="word" class="chip">
            {{ word }}
            <button v-if="!isAllMode && store && store.currentWordBook && store.currentWordBook.words" class="chip-del-btn" @click.stop="deleteWord(type.value, word)">✖️</button>
          </span>
        </div>
        <div v-if="!isAllMode && store && store.currentWordBook && store.currentWordBook.words" class="add-word-input">
          <input v-model="addWordInput[type.value]" @keyup.enter="addWord(type.value)" placeholder="添加单词..." />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useWordBookStore } from '../stores/wordBookStore'

export default {
  name: 'WordBank',
  setup() {
    const store = useWordBookStore()
    if (!store) return {}
    const wordTypes = [
      { value: 'verb', label: '动词' },
      { value: 'adjective', label: '形容词' },
      { value: 'noun', label: '名词' }
    ]
    const searchText = ref('')
    const isAllMode = ref(false)
    const editingId = ref(null)
    const editName = ref('')
    const fileInput = ref(null)
    const addWordInput = reactive({})

    // 当前展示的单词数据
    const words = computed(() => {
      if (!store) return { verb: [], adjective: [], noun: [] }
      if (isAllMode.value) return store.allWords
      if (store.currentWordBook && store.currentWordBook.words) return store.currentWordBook.words
      return { verb: [], adjective: [], noun: [] }
    })
    const wordBooks = computed(() => store.wordBooks)
    const currentWordBookId = computed(() => store.currentWordBookId)

    function filteredWords(type) {
      const arr = (words.value[type] || [])
      if (!searchText.value.trim()) return arr
      const s = searchText.value.toLowerCase()
      return arr.filter(w => typeof w === 'string' && w.toLowerCase().includes(s))
    }
    function openImport() {
      fileInput.value && fileInput.value.click()
    }
    async function handleImport(e) {
      const file = e.target.files[0]
      if (!file) return
      try {
        const XLSX = await import('xlsx')
        const reader = new FileReader()
        reader.onload = evt => {
          const data = new Uint8Array(evt.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          const rows = json.slice(1)
          const words = {
            verb: rows.map(r => r[0]).filter(Boolean),
            adjective: rows.map(r => r[1]).filter(Boolean),
            noun: rows.map(r => r[2]).filter(Boolean)
          }
          const name = file.name.replace(/\.[^/.]+$/, '') + '_' + formatDate(new Date())
          store.importWordBook({ name, sourceFileName: file.name, words })
        }
        reader.readAsArrayBuffer(file)
      } catch (err) {
        alert('导入失败: ' + err.message)
      }
      e.target.value = ''
    }
    function toggleMode() {
      isAllMode.value = !isAllMode.value
    }
    function selectWordBook(id) {
      store.selectWordBook(id)
      isAllMode.value = false
    }
    function deleteBook(id) {
      if (confirm('确定要删除该单词本吗？')) store.deleteWordBook(id)
    }
    function startRename(book) {
      editingId.value = book.id
      editName.value = book.name
    }
    function saveRename(id) {
      if (editName.value.trim()) store.renameWordBook(id, editName.value)
      editingId.value = null
      editName.value = ''
    }
    function formatDate(date) {
      const d = new Date(date)
      return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + '_' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
    }
    function addWord(type) {
      const val = (addWordInput[type] || '').trim()
      if (!val) return
      // 只在当前单词本模式下可用
      if (!isAllMode.value && store && store.currentWordBook && store.currentWordBook.words) {
        const book = store.currentWordBook
        if (!book.words[type].includes(val)) {
          book.words[type].push(val)
          store.saveToStorage()
        }
      }
      addWordInput[type] = ''
    }
    function deleteWord(type, word) {
      if (!isAllMode.value && store && store.currentWordBook && store.currentWordBook.words) {
        const book = store.currentWordBook
        const idx = book.words[type].indexOf(word)
        if (idx !== -1) {
          book.words[type].splice(idx, 1)
          store.saveToStorage()
        }
      }
    }
    return {
      wordTypes,
      searchText,
      isAllMode,
      editingId,
      editName,
      fileInput,
      words,
      wordBooks,
      currentWordBookId,
      filteredWords,
      openImport,
      handleImport,
      toggleMode,
      selectWordBook,
      deleteBook,
      startRename,
      saveRename,
      formatDate,
      addWordInput,
      addWord,
      deleteWord
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
.word-book-list {
  display: flex;
  gap: 1rem;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.word-book-item {
  background: #f5f7fa;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  min-width: 200px;
  max-width: 320px;
  flex: 1;
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
}
.word-book-item.active {
  border-color: #42b983;
  background: #42b983;
  color: #fff;
}
.book-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.08rem;
  font-weight: 600;
}
.book-action-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 2px;
}
.book-action-btn:hover {
  color: #e74c3c;
}
.book-date {
  font-size: 0.85rem;
  color: #888;
  margin-top: 4px;
}
.edit-input {
  font-size: 1.08rem;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.display-mode-info {
  margin: 12px 0;
  text-align: center;
  color: #888;
  font-size: 1rem;
}
.search-section {
  margin: 18px 0;
}
.search-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}
.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  transition: border-color 0.2s;
}
.search-input:focus {
  outline: none;
  border-color: #42b983;
}
.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 1rem;
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
  gap: 8px;
  margin-bottom: 8px;
}
.group-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}
.group-count {
  background: #f0f0f0;
  color: #666;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}
.word-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  background: #fff !important;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 6px 12px;
  margin: 2px 0;
  display: inline-block;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.2s;
}
.chip:hover {
  border-color: #42b983;
  background: #f8fffe !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(66, 185, 131, 0.1);
}
.empty-state {
  padding: 20px;
  text-align: center;
  color: #888;
}
.empty-text {
  font-size: 0.95rem;
}
.add-word-input {
  margin-top: 8px;
}
.add-word-input input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}
.chip-del-btn {
  background: none;
  border: none;
  color: #bbb;
  font-size: 1em;
  margin-left: 6px;
  cursor: pointer;
  border-radius: 4px;
  padding: 0 2px;
  transition: background 0.2s, color 0.2s;
}
.chip-del-btn:hover {
  background: #eafaf5;
  color: #e74c3c;
}
@media (max-width: 768px) {
  .search-input {
    font-size: 0.95rem;
    padding: 10px 36px 10px 14px;
  }
  .chip {
    font-size: 0.9rem;
    padding: 5px 10px;
  }
  .group-name {
    font-size: 1rem;
  }
}
</style> 
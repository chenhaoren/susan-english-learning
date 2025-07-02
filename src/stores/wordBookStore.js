import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function normalizeWordArray(arr) {
  if (!Array.isArray(arr)) return []
  return Array.from(new Set(
    arr
      .filter(w => typeof w === 'string' && w.trim())
      .map(w => w.trim())
  ))
}

export const useWordBookStore = defineStore('wordBook', () => {
  // 所有单词本
  const wordBooks = ref([])
  // 当前选中单词本id
  const currentWordBookId = ref(null)

  // 当前单词本
  const currentWordBook = computed(() => {
    return wordBooks.value.find(b => b.id === currentWordBookId.value) || null
  })

  // 总表：所有单词本合并去重
  const allWords = computed(() => {
    const all = { verb: new Set(), adjective: new Set(), noun: new Set() }
    wordBooks.value.forEach(book => {
      if (book.words) {
        Object.keys(all).forEach(type => {
          (book.words[type] || []).forEach(w => all[type].add(w))
        })
      }
    })
    return {
      verb: Array.from(all.verb),
      adjective: Array.from(all.adjective),
      noun: Array.from(all.noun)
    }
  })

  // 持久化
  function saveToStorage() {
    localStorage.setItem('wordBooks', JSON.stringify(wordBooks.value))
    localStorage.setItem('currentWordBookId', JSON.stringify(currentWordBookId.value))
  }
  function loadFromStorage() {
    try {
      const books = JSON.parse(localStorage.getItem('wordBooks'))
      const curId = JSON.parse(localStorage.getItem('currentWordBookId'))
      if (Array.isArray(books)) wordBooks.value = books
      if (curId) currentWordBookId.value = curId
    } catch {}
  }

  // 导入单词本
  function importWordBook({ name, sourceFileName, words }) {
    const now = new Date()
    const id = now.getTime().toString()
    const safeWords = {
      verb: normalizeWordArray(words.verb),
      adjective: normalizeWordArray(words.adjective),
      noun: normalizeWordArray(words.noun)
    }
    const book = {
      id,
      name,
      createdAt: now.toISOString(),
      sourceFileName,
      words: safeWords
    }
    wordBooks.value.push(book)
    currentWordBookId.value = id
    saveToStorage()
    return book
  }

  // 删除单词本
  function deleteWordBook(id) {
    const idx = wordBooks.value.findIndex(b => b.id === id)
    if (idx !== -1) {
      wordBooks.value.splice(idx, 1)
      // 自动切换到下一个或总表
      if (currentWordBookId.value === id) {
        currentWordBookId.value = wordBooks.value[0]?.id || null
      }
      saveToStorage()
    }
  }

  // 重命名单词本
  function renameWordBook(id, newName) {
    const book = wordBooks.value.find(b => b.id === id)
    if (book && newName && newName.trim()) {
      book.name = newName.trim()
      saveToStorage()
    }
  }

  // 切换单词本
  function selectWordBook(id) {
    if (wordBooks.value.some(b => b.id === id)) {
      currentWordBookId.value = id
      saveToStorage()
    }
  }

  // 初始化
  loadFromStorage()

  return {
    wordBooks,
    currentWordBookId,
    currentWordBook,
    allWords,
    importWordBook,
    deleteWordBook,
    renameWordBook,
    selectWordBook,
    saveToStorage,
    loadFromStorage
  }
}) 
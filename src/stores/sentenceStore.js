import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSentenceStore = defineStore('sentence', () => {
  const currentSentence = ref({})
  const sentenceResult = ref('')
  const isGenerating = ref(false)
  const grammarResult = ref('')
  const userSentence = ref('')

  const generateSentence = (combination) => {
    currentSentence.value = combination
    sentenceResult.value = ''
  }

  const setSentenceResult = (result) => {
    sentenceResult.value = result
  }

  const setGenerating = (status) => {
    isGenerating.value = status
  }

  const setGrammarResult = (result) => {
    grammarResult.value = result
  }

  const setUserSentence = (sentence) => {
    userSentence.value = sentence
  }

  const clearResults = () => {
    sentenceResult.value = ''
    grammarResult.value = ''
    userSentence.value = ''
  }

  return {
    currentSentence,
    sentenceResult,
    isGenerating,
    grammarResult,
    userSentence,
    generateSentence,
    setSentenceResult,
    setGenerating,
    setGrammarResult,
    setUserSentence,
    clearResults
  }
}) 
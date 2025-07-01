<template>
  <div class="sentence-transform-page">
    <h1>句型转换</h1>
    <p>将简单句型转换为更复杂的表达方式</p>
    
    <div class="transform-container">
      <div class="input-section">
        <h3>输入原句</h3>
        <textarea 
          v-model="originalSentence"
          placeholder="请输入要转换的英文句子..."
          class="flat-input"
        ></textarea>
      </div>
      
      <div class="transform-options">
        <h3>转换选项</h3>
        <div class="option-buttons">
          <button 
            v-for="option in transformOptions" 
            :key="option.id"
            class="transform-btn"
            :class="{ active: selectedOption === option.id }"
            @click="selectOption(option.id)"
          >
            {{ option.name }}
          </button>
        </div>
      </div>
      
      <div class="transform-button">
        <button class="vue-btn" @click="transformSentence" :disabled="!canTransform">
          开始转换
        </button>
      </div>
      
      <div v-if="transformedSentence" class="result-section">
        <h3>转换结果</h3>
        <div class="result-content">
          <div class="original">
            <strong>原句：</strong>
            <p>{{ originalSentence }}</p>
          </div>
          <div class="transformed">
            <strong>转换后：</strong>
            <p>{{ transformedSentence }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'SentenceTransform',
  setup() {
    const originalSentence = ref('')
    const selectedOption = ref('')
    const transformedSentence = ref('')

    const transformOptions = [
      { id: 'passive', name: '被动语态' },
      { id: 'complex', name: '复合句' },
      { id: 'formal', name: '正式表达' },
      { id: 'emphatic', name: '强调句' },
      { id: 'conditional', name: '条件句' }
    ]

    const canTransform = computed(() => {
      return originalSentence.value.trim() && selectedOption.value
    })

    const selectOption = (optionId) => {
      selectedOption.value = optionId
    }

    const transformSentence = () => {
      // TODO: 实现句型转换逻辑
      console.log('转换句子:', originalSentence.value, selectedOption.value)
      transformedSentence.value = `转换后的句子示例 (${selectedOption.value})`
    }

    return {
      originalSentence,
      selectedOption,
      transformedSentence,
      transformOptions,
      canTransform,
      selectOption,
      transformSentence
    }
  }
}
</script>

<style scoped>
.sentence-transform-page {
  min-height: 100vh;
  background: #fafbfc;
  padding: 2rem;
  animation: fadeInUp 0.5s ease-out;
}

h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 700;
  animation: slideIn 0.6s ease-out;
}

p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  text-align: center;
  animation: slideIn 0.6s ease-out 0.1s both;
}

.transform-container {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 6px;
  padding: 2rem;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.input-section,
.transform-options,
.transform-button,
.result-section {
  margin-bottom: 2rem;
}

h3 {
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.sentence-input {
  width: 100%;
  min-height: 120px;
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

.sentence-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.option-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.transform-btn {
  background: #fff;
  color: #666;
  border: 1px solid #e5e9f2;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.transform-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(66, 185, 131, 0.1), transparent);
  transition: left 0.5s;
}

.transform-btn:hover::before {
  left: 100%;
}

.transform-btn:hover {
  border-color: #42b983;
  color: #42b983;
  transform: translateY(-1px);
}

.transform-btn.active {
  background: #42b983;
  color: #fff;
  border-color: #42b983;
}

.transform-btn.active::before {
  display: none;
}

.transform-button {
  text-align: center;
}

.result-content {
  background: #f8fafc;
  border: 1px solid #e5e9f2;
  border-radius: 6px;
  padding: 1.5rem;
  animation: fadeInUp 0.4s ease-out;
}

.original,
.transformed {
  margin-bottom: 1rem;
}

.original strong,
.transformed strong {
  color: #2c3e50;
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}

.original p,
.transformed p {
  color: #666;
  margin: 0;
  padding: 0.75rem;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #42b983;
}

.transformed p {
  border-left-color: #f7b500;
}

@media (max-width: 768px) {
  .sentence-transform-page {
    padding: 1rem;
  }
  
  .transform-container {
    padding: 1.5rem;
  }
  
  .option-buttons {
    justify-content: center;
  }
  
  .transform-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
</style> 
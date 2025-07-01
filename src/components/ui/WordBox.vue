<template>
  <div class="word-box" :class="{ 'hidden': !visible }">
    <div class="word" :id="`${type}-container`">
      <!-- 自然拼读分割的单词 -->
      <div class="word-segments" v-if="phoneticsData?.phoneticSegments">
        <span 
          v-for="(segment, index) in phoneticsData.phoneticSegments" 
          :key="index"
          class="word-segment"
          :class="`segment-${segment.type}`"
        >
          {{ segment.text }}
        </span>
      </div>
      <span v-else :id="type">{{ word }}</span>
      <span class="word-badge" :id="`${type}-count`" v-if="count > 0">{{ count }}</span>
    </div>
    
    <!-- 音标显示区域 -->
    <div v-if="phoneticsData" class="phonetics-section">
      <!-- 英音 -->
      <div v-if="phoneticsData.ukPhonetic" class="phonetic-item">
        <div class="phonetic-label">🇬🇧</div>
        <div class="phonetic-text">{{ phoneticsData.ukPhonetic }}</div>
        <button 
          v-if="phoneticsData.ukAudio" 
          class="pronunciation-btn" 
          @click="playUKPronunciation"
          title="播放英音"
        >
          🔊
        </button>
      </div>
      
      <!-- 美音 -->
      <div v-if="phoneticsData.usPhonetic" class="phonetic-item">
        <div class="phonetic-label">🇺🇸</div>
        <div class="phonetic-text">{{ phoneticsData.usPhonetic }}</div>
        <button 
          v-if="phoneticsData.usAudio" 
          class="pronunciation-btn" 
          @click="playUSPronunciation"
          title="播放美音"
        >
          🔊
        </button>
      </div>
      
      <!-- 通用音标（如果没有英音美音） -->
      <div v-if="!phoneticsData.ukPhonetic && !phoneticsData.usPhonetic && phoneticsData.phonetic" class="phonetic-item">
        <div class="phonetic-text">{{ phoneticsData.phonetic }}</div>
        <button 
          v-if="phoneticsData.pronunciation" 
          class="pronunciation-btn" 
          @click="playPronunciation"
          title="播放发音"
        >
          🔊
        </button>
      </div>
    </div>
    
    <div class="word-type">{{ typeLabel }}</div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useWordStore } from '../../stores/wordStore'

export default {
  name: 'WordBox',
  props: {
    word: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const wordStore = useWordStore()
    
    const typeLabel = computed(() => {
      const labels = {
        verb: '动词',
        adjective: '形容词',
        noun: '名词'
      }
      return labels[props.type] || props.type
    })

    const phoneticsData = computed(() => {
      if (!props.word) return null
      return wordStore.getWordPhonetics(props.word)
    })

    const playUKPronunciation = async () => {
      if (!phoneticsData.value?.ukAudio) {
        // 降级到浏览器TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(props.word)
          utterance.lang = 'en-GB'
          utterance.rate = 0.8
          speechSynthesis.speak(utterance)
        }
        return
      }

      try {
        const { phoneticsService } = await import('../../services/api.js')
        phoneticsService.playPronunciation(phoneticsData.value.ukAudio)
      } catch (error) {
        console.warn('播放英音失败:', error)
        // 降级到浏览器TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(props.word)
          utterance.lang = 'en-GB'
          utterance.rate = 0.8
          speechSynthesis.speak(utterance)
        }
      }
    }

    const playUSPronunciation = async () => {
      if (!phoneticsData.value?.usAudio) {
        // 降级到浏览器TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(props.word)
          utterance.lang = 'en-US'
          utterance.rate = 0.8
          speechSynthesis.speak(utterance)
        }
        return
      }

      try {
        const { phoneticsService } = await import('../../services/api.js')
        phoneticsService.playPronunciation(phoneticsData.value.usAudio)
      } catch (error) {
        console.warn('播放美音失败:', error)
        // 降级到浏览器TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(props.word)
          utterance.lang = 'en-US'
          utterance.rate = 0.8
          speechSynthesis.speak(utterance)
        }
      }
    }

    const playPronunciation = async () => {
      if (!phoneticsData.value?.pronunciation) {
        // 降级到浏览器TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(props.word)
          utterance.lang = 'en-US'
          utterance.rate = 0.8
          speechSynthesis.speak(utterance)
        }
        return
      }

      try {
        const { phoneticsService } = await import('../../services/api.js')
        phoneticsService.playPronunciation(phoneticsData.value.pronunciation)
      } catch (error) {
        console.warn('播放发音失败:', error)
        // 降级到浏览器TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(props.word)
          utterance.lang = 'en-US'
          utterance.rate = 0.8
          speechSynthesis.speak(utterance)
        }
      }
    }

    // 自动获取音标（如果还没有的话）
    onMounted(async () => {
      if (props.word && !phoneticsData.value) {
        try {
          const { phoneticsService } = await import('../../services/api.js')
          const info = await phoneticsService.getWordPhonetics(props.word)
          if (info) {
            wordStore.setWordPhonetics(props.word, info)
          }
        } catch (error) {
          console.warn(`获取单词 ${props.word} 音标失败:`, error)
        }
      }
    })

    return {
      typeLabel,
      phoneticsData,
      playUKPronunciation,
      playUSPronunciation,
      playPronunciation
    }
  }
}
</script>

<style scoped>
.word-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 20px 16px 16px 16px;
  background: #fff;
  border-radius: 6px;
  min-width: 140px;
  border: 1px solid #e5e9f2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.word-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #42b983, #36976b);
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.word-box:hover::before {
  transform: scaleX(1);
}

.word-box:hover {
  border-color: #42b983;
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(66, 185, 131, 0.15);
}

.word-box.hidden {
  display: none;
}

.word {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #42b983;
  letter-spacing: 0.5px;
  transition: all 0.2s;
  position: relative;
  display: inline-flex;
  align-items: flex-start;
}

.word-box:hover .word {
  transform: scale(1.05);
}

/* 自然拼读分割样式 */
.word-segments {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1px;
}

.word-segment {
  font-weight: 700;
  transition: all 0.2s;
  padding: 1px 2px;
  border-radius: 3px;
}

.segment-vowel {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.segment-consonant {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.segment-digraph {
  color: #9b59b6;
  background: rgba(155, 89, 182, 0.1);
}

.segment-vowel-team {
  color: #f39c12;
  background: rgba(243, 156, 18, 0.1);
}

.segment-r-controlled {
  color: #e67e22;
  background: rgba(230, 126, 34, 0.1);
}

.segment-silent-e {
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.segment-other {
  color: #95a5a6;
  background: rgba(149, 165, 166, 0.1);
}

/* 音标区域 */
.phonetics-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
  min-height: 24px;
  width: 100%;
}

.phonetic-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e9f2;
  transition: all 0.2s;
}

.phonetic-item:hover {
  background: #f0f9f6;
  border-color: #42b983;
}

.phonetic-label {
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.phonetic-text {
  color: #2c3e50;
  font-size: 0.9rem;
  font-family: 'Arial', sans-serif;
  font-weight: 500;
  flex: 1;
}

.pronunciation-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  color: #42b983;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.pronunciation-btn:hover {
  background: rgba(66, 185, 131, 0.1);
  transform: scale(1.1);
}

.pronunciation-btn:active {
  transform: scale(0.95);
}

.word-type {
  color: #666;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  margin-top: 2px;
  transition: color 0.2s;
}

.word-box:hover .word-type {
  color: #42b983;
}

.word-badge {
  position: absolute;
  top: -20px;
  right: -40px;
  background: #ff6b6b;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 12px;
  padding: 2px 8px;
  min-width: 18px;
  min-height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  z-index: 2;
  font-family: inherit;
  line-height: 1;
  animation: pulse 2s infinite;
}

@media (max-width: 600px) {
  .word-box {
    margin: 8px 0;
    min-width: 90vw;
    padding: 16px 12px 12px 12px;
  }
  
  .word {
    font-size: 1.6rem;
  }
  
  .word-segments {
    gap: 0.5px;
  }
  
  .word-segment {
    font-size: 0.9em;
  }
  
  .phonetics-section {
    gap: 4px;
  }
  
  .phonetic-text {
    font-size: 0.8rem;
  }
  
  .phonetic-item {
    padding: 3px 6px;
  }
}
</style> 
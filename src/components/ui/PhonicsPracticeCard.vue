<template>
  <div class="phonics-practice-card" :class="cardClasses">
    <!-- 练习标题 -->
    <div class="practice-header">
      <h3 class="practice-title">{{ exercise.question }}</h3>
      <div class="practice-progress">
        <span class="progress-text">{{ currentIndex + 1 }}/{{ totalQuestions }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 单词展示区域 -->
    <div class="word-display-area">
      <PhonicsVisualizer
        :word="exercise.word"
        display-mode="phonics"
        :visual-theme="visualTheme"
        :animation-enabled="animationEnabled"
        :show-confidence="false"
        :show-validation="false"
        @segment-click="handleSegmentClick"
        @segment-hover="handleSegmentHover"
      />
    </div>

    <!-- 反馈区域 -->
    <div v-if="feedback" class="feedback-area" :class="feedbackClasses">
      <div class="feedback-content">
        <span class="feedback-icon">{{ feedbackIcon }}</span>
        <span class="feedback-text">{{ feedback }}</span>
      </div>
      <div class="feedback-actions">
        <button class="feedback-btn next-btn" @click="handleNext">
          {{ isLastQuestion ? '完成练习' : '下一题' }}
        </button>
        <button v-if="!isLastQuestion" class="feedback-btn skip-btn" @click="handleSkip">
          跳过
        </button>
      </div>
    </div>

    <!-- 提示区域 -->
    <div v-if="showHint" class="hint-area">
      <div class="hint-content">
        <span class="hint-icon">💡</span>
        <span class="hint-text">提示：点击单词中对应的音素片段</span>
      </div>
    </div>

    <!-- 音频播放按钮 -->
    <div class="audio-controls">
      <button class="audio-btn" @click="playWordAudio" title="播放单词发音">
        🔊
      </button>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import PhonicsVisualizer from './PhonicsVisualizer.vue'

export default {
  name: 'PhonicsPracticeCard',
  components: {
    PhonicsVisualizer
  },
  props: {
    exercise: {
      type: Object,
      required: true
    },
    currentIndex: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    visualTheme: {
      type: String,
      default: 'colorful'
    },
    animationEnabled: {
      type: Boolean,
      default: true
    },
    showHint: {
      type: Boolean,
      default: true
    }
  },
  emits: ['answer-submitted', 'next-question', 'skip-question'],
  setup(props, { emit }) {
    const feedback = ref(null)
    const isAnswered = ref(false)
    const selectedSegment = ref(null)
    
    console.log('PhonicsPracticeCard setup with props:', props)
    console.log('Exercise:', props.exercise)

    // 计算属性
    const progressPercentage = computed(() => {
      return ((props.currentIndex + 1) / props.totalQuestions) * 100
    })

    const isLastQuestion = computed(() => {
      return props.currentIndex === props.totalQuestions - 1
    })

    const cardClasses = computed(() => [
      'practice-card',
      { 'answered': isAnswered.value },
      { 'correct': feedback.value?.correct },
      { 'incorrect': feedback.value && !feedback.value.correct }
    ])

    const feedbackClasses = computed(() => [
      'feedback',
      { 'correct': feedback.value?.correct },
      { 'incorrect': feedback.value && !feedback.value.correct }
    ])

    const feedbackIcon = computed(() => {
      if (!feedback.value) return ''
      return feedback.value.correct ? '✅' : '❌'
    })

    // 监听练习变化，重置状态
    watch(() => props.exercise, () => {
      resetState()
    })

    // 方法
    const handleSegmentClick = (segmentData) => {
      console.log('=== 练习卡片：音素片段点击 ===')
      console.log('点击的音素片段:', segmentData)
      console.log('当前练习题目:', props.exercise)
      console.log('目标音素:', props.exercise?.targetSegment)
      
      if (isAnswered.value) {
        console.log('Already answered, ignoring click')
        return
      }

      // 提取实际的 segment 数据
      const actualSegment = segmentData.segment || segmentData
      console.log('提取的实际音素片段:', actualSegment)

      selectedSegment.value = actualSegment
      isAnswered.value = true

      // 触发答案提交事件
      const answerData = {
        exercise: props.exercise,
        selectedSegment: actualSegment,
        timestamp: new Date().toISOString()
      }
      console.log('Emitting answer-submitted:', answerData)
      emit('answer-submitted', answerData)
    }

    const handleSegmentHover = (segmentData) => {
      console.log('Segment hovered:', segmentData)
    }

    const handleNext = () => {
      if (isLastQuestion.value) {
        emit('next-question', { completed: true })
      } else {
        emit('next-question', { completed: false })
      }
    }

    const handleSkip = () => {
      emit('skip-question', {
        exercise: props.exercise,
        skipped: true,
        timestamp: new Date().toISOString()
      })
    }

    const playWordAudio = () => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(props.exercise.word)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    }

    const resetState = () => {
      feedback.value = null
      isAnswered.value = false
      selectedSegment.value = null
    }

    const setFeedback = (feedbackData) => {
      console.log('Setting feedback:', feedbackData)
      feedback.value = feedbackData
    }

    return {
      feedback,
      isAnswered,
      selectedSegment,
      progressPercentage,
      isLastQuestion,
      cardClasses,
      feedbackClasses,
      feedbackIcon,
      handleSegmentClick,
      handleSegmentHover,
      handleNext,
      handleSkip,
      playWordAudio,
      setFeedback
    }
  }
}
</script>

<style scoped>
.phonics-practice-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.phonics-practice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.phonics-practice-card.answered {
  border-color: #e5e9f2;
}

.phonics-practice-card.correct {
  border-color: #42b983;
  background: linear-gradient(135deg, #f0f9f4 0%, #ffffff 100%);
}

.phonics-practice-card.incorrect {
  border-color: #e74c3c;
  background: linear-gradient(135deg, #fdf2f2 0%, #ffffff 100%);
}

/* 练习标题 */
.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.practice-title {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  min-width: 200px;
}

.practice-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: #e5e9f2;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b983, #36976b);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 单词展示区域 */
.word-display-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e9f2;
}

/* 反馈区域 */
.feedback-area {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  animation: slideIn 0.3s ease;
}

.feedback-area.correct {
  background: #f0f9f4;
  border: 1px solid #42b983;
}

.feedback-area.incorrect {
  background: #fdf2f2;
  border: 1px solid #e74c3c;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feedback-icon {
  font-size: 1.2rem;
}

.feedback-text {
  color: #2c3e50;
  font-weight: 500;
}

.feedback-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.feedback-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.next-btn {
  background: #42b983;
  color: #fff;
}

.next-btn:hover {
  background: #36976b;
  transform: translateY(-1px);
}

.skip-btn {
  background: #6c757d;
  color: #fff;
}

.skip-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* 提示区域 */
.hint-area {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
}

.hint-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hint-icon {
  font-size: 1rem;
}

.hint-text {
  color: #856404;
  font-size: 0.9rem;
}

/* 音频控制 */
.audio-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.audio-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.audio-btn:hover {
  background: rgba(66, 185, 131, 0.1);
  color: #42b983;
  transform: scale(1.1);
}

/* 动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .phonics-practice-card {
    padding: 1.5rem;
  }

  .practice-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .practice-title {
    font-size: 1.1rem;
  }

  .word-display-area {
    min-height: 100px;
  }

  .feedback-actions {
    flex-direction: column;
  }

  .feedback-btn {
    width: 100%;
  }
}
</style> 
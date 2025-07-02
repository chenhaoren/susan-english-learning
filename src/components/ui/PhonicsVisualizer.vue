<template>
  <div class="phonics-visualizer" :class="visualizerClasses">
    <!-- 普通模式 -->
    <div v-if="displayMode === 'normal'" class="normal-mode">
      <span class="word-text">{{ word }}</span>
    </div>

    <!-- 自然拼读模式 -->
    <div v-else-if="displayMode === 'phonics'" class="phonics-mode">
      <div class="word-segments" :class="segmentsClasses">
        <transition-group 
          name="segment-fade" 
          tag="div" 
          class="segments-container"
          :class="{ 'animated': animationEnabled }"
        >
          <span 
            v-for="(segment, index) in segments" 
            :key="`${segment.text}-${index}`"
            class="word-segment"
            :class="getSegmentClasses(segment)"
            :style="getSegmentStyles(segment, index)"
            @click="handleSegmentClick(segment, index)"
            @mouseenter="handleSegmentHover(segment, index)"
            @mouseleave="handleSegmentLeave"
          >
            {{ segment.text }}
            <span v-if="showConfidence && segment.confidence" class="confidence-badge">
              {{ Math.round(segment.confidence * 100) }}%
            </span>
          </span>
        </transition-group>
      </div>
    </div>

    <!-- 详细模式 -->
    <div v-else-if="displayMode === 'detailed'" class="detailed-mode">
      <div class="word-segments" :class="segmentsClasses">
        <transition-group 
          name="segment-fade" 
          tag="div" 
          class="segments-container"
          :class="{ 'animated': animationEnabled }"
        >
          <span 
            v-for="(segment, index) in segments" 
            :key="`${segment.text}-${index}`"
            class="word-segment detailed"
            :class="getSegmentClasses(segment)"
            :style="getSegmentStyles(segment, index)"
            @click="handleSegmentClick(segment, index)"
            @mouseenter="handleSegmentHover(segment, index)"
            @mouseleave="handleSegmentLeave"
          >
            <span class="segment-text">{{ segment.text }}</span>
            <span class="segment-type">{{ getSegmentTypeLabel(segment.type) }}</span>
            <span v-if="showConfidence && segment.confidence" class="confidence-badge">
              {{ Math.round(segment.confidence * 100) }}%
            </span>
          </span>
        </transition-group>
      </div>

      <!-- 验证信息 -->
      <div v-if="validation && showValidation" class="validation-info">
        <div class="validation-header">
          <span class="validation-title">验证信息</span>
          <span class="validation-confidence" :class="getConfidenceClass(validation.confidence)">
            {{ Math.round(validation.confidence * 100) }}% 置信度
          </span>
        </div>
        <div class="validation-details">
          <div class="validation-item">
            <span class="label">音节数:</span>
            <span class="value">{{ validation.actualSyllables }}/{{ validation.expectedSyllables }}</span>
          </div>
          <div class="validation-item">
            <span class="label">音素数:</span>
            <span class="value">{{ validation.actualPhonemes }}/{{ validation.expectedPhonemes }}</span>
          </div>
          <div class="validation-item">
            <span class="label">数据源:</span>
            <span class="value">{{ sources.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span class="loading-text">分析中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ error }}</span>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted } from 'vue'
import { phonicsEngine } from '../../utils/PhonicsRules.js'
import { phonicsAPIService } from '../../services/PhonicsAPI.js'

export default {
  name: 'PhonicsVisualizer',
  props: {
    word: {
      type: String,
      required: true
    },
    displayMode: {
      type: String,
      default: 'normal',
      validator: value => ['normal', 'phonics', 'detailed'].includes(value)
    },
    visualTheme: {
      type: String,
      default: 'colorful',
      validator: value => ['colorful', 'minimal', 'educational'].includes(value)
    },
    animationEnabled: {
      type: Boolean,
      default: true
    },
    validationLevel: {
      type: String,
      default: 'basic',
      validator: value => ['basic', 'advanced', 'expert'].includes(value)
    },
    showConfidence: {
      type: Boolean,
      default: false
    },
    showValidation: {
      type: Boolean,
      default: true
    },
    autoValidate: {
      type: Boolean,
      default: true
    }
  },
  emits: ['segment-click', 'segment-hover', 'analysis-complete'],
  setup(props, { emit }) {
    const segments = ref([])
    const validation = ref(null)
    const sources = ref([])
    const loading = ref(false)
    const error = ref(null)
    const hoveredSegment = ref(null)

    // 计算属性
    const visualizerClasses = computed(() => [
      `theme-${props.visualTheme}`,
      `mode-${props.displayMode}`,
      { 'has-animation': props.animationEnabled }
    ])

    const segmentsClasses = computed(() => [
      `theme-${props.visualTheme}`,
      { 'animated': props.animationEnabled }
    ])

    // 分析单词
    const analyzeWord = async () => {
      if (!props.word) {
        segments.value = []
        validation.value = null
        sources.value = []
        return
      }

      loading.value = true
      error.value = null

      try {
        let result

        if (props.validationLevel === 'basic') {
          // 仅使用本地规则库
          segments.value = phonicsEngine.analyzeWord(props.word)
          validation.value = null
          sources.value = ['local-rules']
        } else {
          // 使用API服务
          const options = {
            usePhonicsStuff: props.validationLevel === 'expert',
            useCMU: props.validationLevel !== 'basic'
          }

          result = await phonicsAPIService.getEnhancedPhonicsAnalysis(props.word, options)
          
          if (result.segments && result.segments.length > 0) {
            segments.value = result.segments
          } else {
            // 降级到本地规则库
            segments.value = phonicsEngine.analyzeWord(props.word)
          }

          validation.value = result.validation
          sources.value = result.sources
        }

        emit('analysis-complete', {
          word: props.word,
          segments: segments.value,
          validation: validation.value,
          sources: sources.value
        })
      } catch (err) {
        console.error('单词分析失败:', err)
        error.value = '分析失败，请稍后重试'
        
        // 降级到本地规则库
        segments.value = phonicsEngine.analyzeWord(props.word)
        validation.value = null
        sources.value = ['local-rules-fallback']
      } finally {
        loading.value = false
      }
    }

    // 获取片段样式类
    const getSegmentClasses = (segment) => {
      const classes = [
        `segment-${segment.type}`,
        `priority-${segment.priority || 10}`
      ]

      if (hoveredSegment.value === segment) {
        classes.push('hovered')
      }

      return classes
    }

    // 获取片段样式
    const getSegmentStyles = (segment, index) => {
      const styles = {}

      if (props.animationEnabled) {
        styles.animationDelay = `${index * 0.1}s`
      }

      return styles
    }

    // 获取片段类型标签
    const getSegmentTypeLabel = (type) => {
      const labels = {
        'vowel': '元音',
        'consonant': '辅音',
        'digraph': '双字母',
        'vowel-team': '元音团队',
        'r-controlled': 'R控制音',
        'silent-e': '静音e',
        'trigraph': '三字母',
        'blend': '混合音',
        'prefix': '前缀',
        'suffix': '后缀',
        'other': '其他'
      }
      return labels[type] || type
    }

    // 获取置信度样式类
    const getConfidenceClass = (confidence) => {
      if (confidence >= 0.8) return 'high'
      if (confidence >= 0.6) return 'medium'
      return 'low'
    }

    // 事件处理
    const handleSegmentClick = (segment, index) => {
      emit('segment-click', { segment, index, word: props.word })
    }

    const handleSegmentHover = (segment, index) => {
      hoveredSegment.value = segment
      emit('segment-hover', { segment, index, word: props.word })
    }

    const handleSegmentLeave = () => {
      hoveredSegment.value = null
    }

    // 监听属性变化
    watch(() => props.word, analyzeWord, { immediate: true })
    watch(() => props.validationLevel, analyzeWord)
    watch(() => props.autoValidate, (newVal) => {
      if (newVal && props.word) {
        analyzeWord()
      }
    })

    // 组件挂载时初始化
    onMounted(() => {
      if (props.autoValidate && props.word) {
        analyzeWord()
      }
    })

    return {
      segments,
      validation,
      sources,
      loading,
      error,
      hoveredSegment,
      visualizerClasses,
      segmentsClasses,
      getSegmentClasses,
      getSegmentStyles,
      getSegmentTypeLabel,
      getConfidenceClass,
      handleSegmentClick,
      handleSegmentHover,
      handleSegmentLeave
    }
  }
}
</script>

<style scoped>
.phonics-visualizer {
  position: relative;
  display: inline-block;
  font-family: 'Arial', sans-serif;
  transition: all 0.3s ease;
}

/* 主题样式 */
.theme-colorful {
  --vowel-color: #e74c3c;
  --vowel-bg: rgba(231, 76, 60, 0.1);
  --consonant-color: #3498db;
  --consonant-bg: rgba(52, 152, 219, 0.1);
  --digraph-color: #9b59b6;
  --digraph-bg: rgba(155, 89, 182, 0.1);
  --vowel-team-color: #f39c12;
  --vowel-team-bg: rgba(243, 156, 18, 0.1);
  --r-controlled-color: #e67e22;
  --r-controlled-bg: rgba(230, 126, 34, 0.1);
  --silent-e-color: #27ae60;
  --silent-e-bg: rgba(39, 174, 96, 0.1);
  --trigraph-color: #8e44ad;
  --trigraph-bg: rgba(142, 68, 173, 0.1);
  --blend-color: #16a085;
  --blend-bg: rgba(22, 160, 133, 0.1);
  --prefix-color: #d35400;
  --prefix-bg: rgba(211, 84, 0, 0.1);
  --suffix-color: #c0392b;
  --suffix-bg: rgba(192, 57, 43, 0.1);
  --other-color: #95a5a6;
  --other-bg: rgba(149, 165, 166, 0.1);
}

.theme-minimal {
  --vowel-color: #2c3e50;
  --vowel-bg: rgba(44, 62, 80, 0.05);
  --consonant-color: #34495e;
  --consonant-bg: rgba(52, 73, 94, 0.05);
  --digraph-color: #2c3e50;
  --digraph-bg: rgba(44, 62, 80, 0.08);
  --vowel-team-color: #34495e;
  --vowel-team-bg: rgba(52, 73, 94, 0.08);
  --r-controlled-color: #2c3e50;
  --r-controlled-bg: rgba(44, 62, 80, 0.08);
  --silent-e-color: #34495e;
  --silent-e-bg: rgba(52, 73, 94, 0.08);
  --trigraph-color: #2c3e50;
  --trigraph-bg: rgba(44, 62, 80, 0.08);
  --blend-color: #34495e;
  --blend-bg: rgba(52, 73, 94, 0.08);
  --prefix-color: #2c3e50;
  --prefix-bg: rgba(44, 62, 80, 0.08);
  --suffix-color: #34495e;
  --suffix-bg: rgba(52, 73, 94, 0.08);
  --other-color: #7f8c8d;
  --other-bg: rgba(127, 140, 141, 0.05);
}

.theme-educational {
  --vowel-color: #e74c3c;
  --vowel-bg: rgba(231, 76, 60, 0.15);
  --consonant-color: #3498db;
  --consonant-bg: rgba(52, 152, 219, 0.15);
  --digraph-color: #9b59b6;
  --digraph-bg: rgba(155, 89, 182, 0.15);
  --vowel-team-color: #f39c12;
  --vowel-team-bg: rgba(243, 156, 18, 0.15);
  --r-controlled-color: #e67e22;
  --r-controlled-bg: rgba(230, 126, 34, 0.15);
  --silent-e-color: #27ae60;
  --silent-e-bg: rgba(39, 174, 96, 0.15);
  --trigraph-color: #8e44ad;
  --trigraph-bg: rgba(142, 68, 173, 0.15);
  --blend-color: #16a085;
  --blend-bg: rgba(22, 160, 133, 0.15);
  --prefix-color: #d35400;
  --prefix-bg: rgba(211, 84, 0, 0.15);
  --suffix-color: #c0392b;
  --suffix-bg: rgba(192, 57, 43, 0.15);
  --other-color: #95a5a6;
  --other-bg: rgba(149, 165, 166, 0.15);
}

/* 模式样式 */
.normal-mode {
  font-size: 2rem;
  font-weight: 700;
  color: #42b983;
}

.phonics-mode,
.detailed-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.word-segments {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2px;
  font-size: 1.8rem;
  font-weight: 700;
}

.segments-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2px;
}

.word-segment {
  position: relative;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  border: 2px solid transparent;
}

.word-segment:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.word-segment.hovered {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 音素类型样式 */
.segment-vowel {
  color: var(--vowel-color);
  background: var(--vowel-bg);
  border-color: var(--vowel-color);
}

.segment-consonant {
  color: var(--consonant-color);
  background: var(--consonant-bg);
  border-color: var(--consonant-color);
}

.segment-digraph {
  color: var(--digraph-color);
  background: var(--digraph-bg);
  border-color: var(--digraph-color);
}

.segment-vowel-team {
  color: var(--vowel-team-color);
  background: var(--vowel-team-bg);
  border-color: var(--vowel-team-color);
}

.segment-r-controlled {
  color: var(--r-controlled-color);
  background: var(--r-controlled-bg);
  border-color: var(--r-controlled-color);
}

.segment-silent-e {
  color: var(--silent-e-color);
  background: var(--silent-e-bg);
  border-color: var(--silent-e-color);
}

.segment-trigraph {
  color: var(--trigraph-color);
  background: var(--trigraph-bg);
  border-color: var(--trigraph-color);
}

.segment-blend {
  color: var(--blend-color);
  background: var(--blend-bg);
  border-color: var(--blend-color);
}

.segment-prefix {
  color: var(--prefix-color);
  background: var(--prefix-bg);
  border-color: var(--prefix-color);
}

.segment-suffix {
  color: var(--suffix-color);
  background: var(--suffix-bg);
  border-color: var(--suffix-color);
}

.segment-other {
  color: var(--other-color);
  background: var(--other-bg);
  border-color: var(--other-color);
}

/* 详细模式样式 */
.word-segment.detailed {
  flex-direction: column;
  padding: 6px 8px;
  min-width: 40px;
  text-align: center;
}

.segment-text {
  font-size: 1.2rem;
  font-weight: 700;
}

.segment-type {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.8;
  margin-top: 2px;
}

.confidence-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b6b;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 8px;
  border: 1px solid white;
  min-width: 20px;
  text-align: center;
}

/* 验证信息样式 */
.validation-info {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.validation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.validation-title {
  font-weight: 600;
  color: #495057;
}

.validation-confidence {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.validation-confidence.high {
  background: #d4edda;
  color: #155724;
}

.validation-confidence.medium {
  background: #fff3cd;
  color: #856404;
}

.validation-confidence.low {
  background: #f8d7da;
  color: #721c24;
}

.validation-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.validation-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.validation-item .label {
  color: #6c757d;
  font-weight: 500;
}

.validation-item .value {
  color: #495057;
  font-weight: 600;
}

/* 动画效果 */
.segments-container.animated .word-segment {
  animation: segmentFadeIn 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes segmentFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 过渡动画 */
.segment-fade-enter-active,
.segment-fade-leave-active {
  transition: all 0.3s ease;
}

.segment-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.segment-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 加载状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 10;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.8rem;
  color: #6c757d;
}

/* 错误状态 */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
  font-size: 0.8rem;
}

.error-icon {
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .normal-mode {
    font-size: 1.6rem;
  }

  .word-segments {
    font-size: 1.4rem;
    gap: 1px;
  }

  .word-segment {
    padding: 3px 4px;
  }

  .word-segment.detailed {
    min-width: 32px;
    padding: 4px 6px;
  }

  .segment-text {
    font-size: 1rem;
  }

  .segment-type {
    font-size: 0.6rem;
  }

  .validation-info {
    padding: 8px;
  }

  .validation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style> 
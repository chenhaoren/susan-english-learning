<template>
  <div class="phonics-practice">
    <div class="practice-header">
      <h1>自然拼读练习</h1>
      <p>通过互动练习掌握自然拼读规则</p>
    </div>

    <!-- 练习选择区域 -->
    <div v-if="!currentExercise" class="exercise-selection">
      <div class="selection-header">
        <h2>选择练习类型</h2>
        <p>从以下练习类型中选择一个开始学习</p>
      </div>
      
      <div class="exercise-types">
        <div 
          v-for="type in exerciseTypes" 
          :key="type.id"
          class="exercise-type-card"
          @click="startExercise(type.id)"
        >
          <div class="type-icon">{{ type.icon }}</div>
          <h3>{{ type.title }}</h3>
          <p>{{ type.description }}</p>
          <div class="type-difficulty">
            <span class="difficulty-label">难度:</span>
            <span class="difficulty-stars">{{ type.difficulty }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 练习进行中 -->
    <div v-else class="exercise-in-progress">
      <!-- 调试信息 -->
      <div class="debug-info" style="background: #f0f0f0; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
        <h4>调试信息：</h4>
        <p><strong>当前练习：</strong>{{ currentExercise ? '已加载' : '未加载' }}</p>
        <p><strong>练习数量：</strong>{{ currentExercise?.exercises?.length || 0 }}</p>
        <p><strong>当前索引：</strong>{{ currentIndex }}</p>
        <p><strong>当前练习题目：</strong>{{ currentExercise?.exercises?.[currentIndex]?.word || '无' }}</p>
        <p><strong>目标音素：</strong>{{ currentExercise?.exercises?.[currentIndex]?.targetSegment?.text || '无' }}</p>
        <p><strong>练习卡片引用：</strong>{{ practiceCardRef ? '已设置' : '未设置' }}</p>
      </div>

      <div class="exercise-stats">
        <div class="stat-item">
          <span class="stat-label">得分</span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">正确率</span>
          <span class="stat-value">{{ accuracy }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">进度</span>
          <span class="stat-value">{{ currentIndex + 1 }}/{{ totalQuestions }}</span>
        </div>
      </div>

      <PhonicsPracticeCard
        v-if="currentExercise && currentExercise.exercises[currentIndex]"
        :exercise="currentExercise.exercises[currentIndex]"
        :current-index="currentIndex"
        :total-questions="totalQuestions"
        @answer-submitted="handleAnswerSubmitted"
        @next-question="handleNextQuestion"
        ref="practiceCardRef"
      />

      <div class="exercise-controls">
        <button class="control-btn secondary" @click="resetExercise">重新开始</button>
        <button class="control-btn secondary" @click="exitExercise">退出练习</button>
      </div>
    </div>

    <!-- 练习完成 -->
    <div v-if="exerciseCompleted" class="exercise-completed">
      <div class="completion-card">
        <div class="completion-icon">🎉</div>
        <h2>练习完成！</h2>
        <div class="final-stats">
          <div class="final-stat">
            <span class="stat-label">最终得分</span>
            <span class="stat-value">{{ finalScore }}</span>
          </div>
          <div class="final-stat">
            <span class="stat-label">正确率</span>
            <span class="stat-value">{{ finalAccuracy }}%</span>
          </div>
        </div>
        <div class="completion-actions">
          <button class="action-btn primary" @click="startNewExercise">再来一次</button>
          <button class="action-btn secondary" @click="exitExercise">返回选择</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { PhonicsPracticeEngine } from '../utils/PhonicsPracticeEngine.js'
import PhonicsPracticeCard from '../components/ui/PhonicsPracticeCard.vue'

export default {
  name: 'PhonicsPractice',
  components: { PhonicsPracticeCard },
  setup() {
    const currentExercise = ref(null)
    const currentIndex = ref(0)
    const exerciseCompleted = ref(false)
    const practiceCardRef = ref(null)
    const phonicsPracticeEngine = new PhonicsPracticeEngine()
    
    const exerciseTypes = [
      {
        id: 'phoneme-identification',
        title: '音素识别',
        description: '点击单词中指定类型的音素片段',
        icon: '🎯',
        difficulty: '⭐⭐⭐'
      }
    ]
    
    const totalQuestions = computed(() => currentExercise.value?.exercises?.length || 0)
    const score = computed(() => phonicsPracticeEngine.score)
    const accuracy = computed(() => {
      const stats = phonicsPracticeEngine.getScoreStats()
      return stats.accuracy
    })
    const finalScore = computed(() => phonicsPracticeEngine.score)
    const finalAccuracy = computed(() => {
      const stats = phonicsPracticeEngine.getScoreStats()
      return stats.accuracy
    })
    
    const startExercise = (exerciseType) => {
      console.log('Starting exercise:', exerciseType)
      console.log('PhonicsPracticeEngine instance:', phonicsPracticeEngine)
      
      phonicsPracticeEngine.reset()
      exerciseCompleted.value = false
      currentIndex.value = 0
      
      if (exerciseType === 'phoneme-identification') {
        try {
          currentExercise.value = phonicsPracticeEngine.generatePhonemeIdentificationExercise(
            null,
            { wordCount: 5, difficulty: 'medium' }
          )
          console.log('Generated exercise:', currentExercise.value)
          
          if (currentExercise.value && currentExercise.value.exercises) {
            console.log('Number of exercises:', currentExercise.value.exercises.length)
            currentExercise.value.exercises.forEach((exercise, index) => {
              console.log(`Exercise ${index}:`, exercise)
            })
          }
        } catch (error) {
          console.error('Error generating exercise:', error)
        }
      }
    }
    
    const handleAnswerSubmitted = (data) => {
      console.log('=== 练习页面：答案提交 ===')
      console.log('提交的数据:', data)
      console.log('练习题目:', data.exercise)
      console.log('选择的音素:', data.selectedSegment)
      
      const result = phonicsPracticeEngine.validatePhonemeIdentification(
        data.exercise,
        data.selectedSegment
      )
      
      console.log('验证结果:', result)
      
      // 将结果传递给练习卡片组件
      if (practiceCardRef.value) {
        console.log('Setting feedback on practice card')
        practiceCardRef.value.setFeedback(result)
      } else {
        console.log('Practice card ref is null')
      }
    }
    
    const handleNextQuestion = (data) => {
      if (data.completed) {
        exerciseCompleted.value = true
      } else {
        currentIndex.value++
      }
    }
    
    const resetExercise = () => {
      if (currentExercise.value) {
        startExercise('phoneme-identification')
      }
    }
    
    const exitExercise = () => {
      currentExercise.value = null
      exerciseCompleted.value = false
      phonicsPracticeEngine.reset()
    }
    
    const startNewExercise = () => {
      exerciseCompleted.value = false
      if (currentExercise.value) {
        startExercise('phoneme-identification')
      }
    }
    
    return {
      currentExercise,
      currentIndex,
      exerciseCompleted,
      practiceCardRef,
      exerciseTypes,
      totalQuestions,
      score,
      accuracy,
      finalScore,
      finalAccuracy,
      startExercise,
      handleAnswerSubmitted,
      handleNextQuestion,
      resetExercise,
      exitExercise,
      startNewExercise
    }
  }
}
</script>

<style scoped>
.phonics-practice {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.practice-header {
  text-align: center;
  margin-bottom: 3rem;
}

.practice-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.practice-header p {
  color: #666;
  font-size: 1.1rem;
}

.exercise-selection {
  margin-bottom: 3rem;
}

.selection-header {
  text-align: center;
  margin-bottom: 2rem;
}

.selection-header h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.exercise-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.exercise-type-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.exercise-type-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: #42b983;
}

.type-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-align: center;
}

.exercise-type-card h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  text-align: center;
}

.exercise-type-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.type-difficulty {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.difficulty-label {
  color: #666;
  font-size: 0.9rem;
}

.difficulty-stars {
  color: #f39c12;
  font-size: 1rem;
}

.exercise-in-progress {
  margin-bottom: 2rem;
}

.exercise-stats {
  display: flex;
  justify-content: space-around;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.exercise-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.control-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn.secondary {
  background: #6c757d;
  color: #fff;
}

.control-btn.secondary:hover {
  background: #5a6268;
}

.exercise-completed {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.completion-card {
  background: #fff;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.completion-card h2 {
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.final-stat {
  text-align: center;
}

.completion-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.action-btn.primary {
  background: #42b983;
  color: #fff;
}

.action-btn.primary:hover {
  background: #36976b;
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: #6c757d;
  color: #fff;
}

.action-btn.secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .phonics-practice {
    padding: 1rem;
  }
  
  .practice-header h1 {
    font-size: 2rem;
  }
  
  .exercise-types {
    grid-template-columns: 1fr;
  }
  
  .exercise-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .final-stats {
    grid-template-columns: 1fr;
  }
  
  .completion-actions {
    flex-direction: column;
  }
}
</style> 
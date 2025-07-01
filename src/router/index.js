import { createRouter, createWebHistory } from 'vue-router'
import RandomSentence from '../views/RandomSentence.vue'
import SentenceTransform from '../views/SentenceTransform.vue'
import WordBank from '../views/WordBank.vue'

const routes = [
  {
    path: '/',
    name: 'RandomSentence',
    component: RandomSentence,
    meta: { title: '随机组句' }
  },
  {
    path: '/sentence-transform',
    name: 'SentenceTransform',
    component: SentenceTransform,
    meta: { title: '句型转换' }
  },
  {
    path: '/word-bank',
    name: 'WordBank',
    component: WordBank,
    meta: { title: '单词库管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Susan英语学习应用'
  next()
})

export default router 
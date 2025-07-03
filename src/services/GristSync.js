/**
 * Grist 远程同步服务
 * 用于实现数据的云端备份和同步功能
 * 基于 GitHub Grist 实现跨端数据同步
 */

class GristSyncService {
  constructor() {
    // GitHub Grist 的 API 地址
    this.baseUrl = 'https://docs.getgrist.com/api'
    this.token = null
    this.orgId = null
    this.docId = null
    this.syncInterval = null
    this.lastSyncTime = null
  }

  /**
   * 设置 Grist API Token
   * @param {string} token - Grist API Token
   */
  setToken(token) {
    this.token = token
    // 保存到本地存储
    localStorage.setItem('gristToken', token)
  }

  /**
   * 获取保存的 Token
   * @returns {string|null} 保存的 Token
   */
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('gristToken')
    }
    return this.token
  }

  /**
   * 清除 Token
   */
  clearToken() {
    this.token = null
    localStorage.removeItem('gristToken')
  }

  /**
   * 设置组织 ID 和文档 ID
   * @param {string} orgId - 组织 ID
   * @param {string} docId - 文档 ID
   */
  setDocumentInfo(orgId, docId) {
    this.orgId = orgId
    this.docId = docId
    localStorage.setItem('gristOrgId', orgId)
    localStorage.setItem('gristDocId', docId)
  }

  /**
   * 获取文档信息
   * @returns {Object} 文档信息
   */
  getDocumentInfo() {
    if (!this.orgId) {
      this.orgId = localStorage.getItem('gristOrgId')
    }
    if (!this.docId) {
      this.docId = localStorage.getItem('gristDocId')
    }
    return { orgId: this.orgId, docId: this.docId }
  }

  /**
   * 测试 Grist 连接
   * @returns {Promise<Object>} 连接测试结果
   */
  async testConnection() {
    try {
      const token = this.getToken()
      if (!token) {
        return { success: false, message: '请先设置 Grist Token' }
      }

      // 调用 Grist API 获取用户信息来测试连接
      const response = await fetch(`${this.baseUrl}/orgs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { 
        success: true, 
        message: '连接测试成功',
        orgs: data
      }
    } catch (error) {
      console.error('Grist 连接测试失败:', error)
      return { success: false, message: '连接测试失败: ' + error.message }
    }
  }

  /**
   * 同步数据到 Grist
   * @param {Object} data - 要同步的数据
   * @returns {Promise<Object>} 同步结果
   */
  async syncToGrist(data) {
    try {
      const token = this.getToken()
      if (!token) {
        return { success: false, message: '请先设置 Grist Token' }
      }

      const { orgId, docId } = this.getDocumentInfo()
      if (!orgId || !docId) {
        return { success: false, message: '请先设置组织 ID 和文档 ID' }
      }

      // 格式化数据
      const syncData = this.formatDataForSync(data)
      
      // 调用 Grist API 更新数据
      const response = await fetch(`${this.baseUrl}/docs/${docId}/tables/Data/records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              timestamp: syncData.timestamp,
              version: syncData.version,
              data: JSON.stringify(syncData.data)
            }
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      this.lastSyncTime = new Date().toISOString()
      localStorage.setItem('lastSyncTime', this.lastSyncTime)
      
      console.log('同步到 Grist 的数据:', syncData)
      
      return { success: true, message: '数据已成功同步到云端' }
    } catch (error) {
      console.error('Grist 同步失败:', error)
      return { success: false, message: '同步失败: ' + error.message }
    }
  }

  /**
   * 从 Grist 同步数据
   * @returns {Promise<Object>} 同步结果
   */
  async syncFromGrist() {
    try {
      const token = this.getToken()
      if (!token) {
        return { success: false, message: '请先设置 Grist Token' }
      }

      const { orgId, docId } = this.getDocumentInfo()
      if (!orgId || !docId) {
        return { success: false, message: '请先设置组织 ID 和文档 ID' }
      }

      // 调用 Grist API 获取最新数据
      const response = await fetch(`${this.baseUrl}/docs/${docId}/tables/Data/records`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.records || data.records.length === 0) {
        return { success: false, message: '云端没有找到数据' }
      }

      // 获取最新的数据记录
      const latestRecord = data.records[data.records.length - 1]
      const syncData = this.parseSyncData({
        timestamp: latestRecord.fields.timestamp,
        version: latestRecord.fields.version,
        data: JSON.parse(latestRecord.fields.data)
      })
      
      console.log('从 Grist 同步的数据:', syncData)
      
      return { 
        success: true, 
        message: '数据已成功从云端同步',
        data: syncData
      }
    } catch (error) {
      console.error('Grist 同步失败:', error)
      return { success: false, message: '同步失败: ' + error.message }
    }
  }

  /**
   * 获取 Grist 文档列表
   * @returns {Promise<Object>} 文档列表
   */
  async getDocuments() {
    try {
      const token = this.getToken()
      if (!token) {
        return { success: false, message: '请先设置 Grist Token' }
      }

      const { orgId } = this.getDocumentInfo()
      if (!orgId) {
        return { success: false, message: '请先设置组织 ID' }
      }

      // 调用 Grist API 获取文档列表
      const response = await fetch(`${this.baseUrl}/orgs/${orgId}/docs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, documents: data }
    } catch (error) {
      console.error('获取 Grist 文档失败:', error)
      return { success: false, message: '获取文档失败: ' + error.message }
    }
  }

  /**
   * 创建新的 Grist 文档
   * @param {string} name - 文档名称
   * @returns {Promise<Object>} 创建结果
   */
  async createDocument(name) {
    try {
      const token = this.getToken()
      if (!token) {
        return { success: false, message: '请先设置 Grist Token' }
      }

      const { orgId } = this.getDocumentInfo()
      if (!orgId) {
        return { success: false, message: '请先设置组织 ID' }
      }

      // 调用 Grist API 创建文档
      const response = await fetch(`${this.baseUrl}/orgs/${orgId}/docs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          isPinned: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // 自动设置新创建的文档为当前文档
      this.setDocumentInfo(orgId, data.id)
      
      return { success: true, document: data }
    } catch (error) {
      console.error('创建 Grist 文档失败:', error)
      return { success: false, message: '创建文档失败: ' + error.message }
    }
  }

  /**
   * 启动定时同步
   * @param {number} intervalMinutes - 同步间隔（分钟）
   */
  startAutoSync(intervalMinutes = 30) {
    this.stopAutoSync() // 先停止之前的定时器
    
    this.syncInterval = setInterval(async () => {
      console.log('执行定时同步...')
      try {
        // 获取所有需要同步的数据
        const syncData = await this.getAllSyncData()
        await this.syncToGrist(syncData.data)
      } catch (error) {
        console.error('定时同步失败:', error)
      }
    }, intervalMinutes * 60 * 1000)
    
    console.log(`定时同步已启动，间隔: ${intervalMinutes} 分钟`)
  }

  /**
   * 停止定时同步
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('定时同步已停止')
    }
  }

  /**
   * 获取所有需要同步的数据
   * @returns {Promise<Object>} 所有数据
   */
  async getAllSyncData() {
    try {
      // 动态导入 stores 避免循环依赖
      const { useWordStore } = await import('../stores/wordStore.js')
      const { useWordBookStore } = await import('../stores/wordBookStore.js')
      const { useSettingsStore } = await import('../stores/settingsStore.js')
      const { useSentenceStore } = await import('../stores/sentenceStore.js')
      
      const wordStore = useWordStore()
      const wordBookStore = useWordBookStore()
      const settingsStore = useSettingsStore()
      const sentenceStore = useSentenceStore()
      
      return {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          wordStore: {
            verbs: wordStore.verbs,
            adjectives: wordStore.adjectives,
            nouns: wordStore.nouns,
            wordPhonetics: wordStore.wordPhonetics,
            phonicsSegments: wordStore.phonicsSegments,
            learningProgress: wordStore.learningProgress,
            wordBooks: wordStore.wordBooks,
            currentWordBook: wordStore.currentWordBook
          },
          wordBookStore: {
            wordBooks: wordBookStore.wordBooks,
            currentWordBookId: wordBookStore.currentWordBookId
          },
          settingsStore: {
            deepseekKey: settingsStore.deepseekKey,
            gristToken: settingsStore.gristToken,
            showPhonics: settingsStore.showPhonics,
            showPhonetics: settingsStore.showPhonetics,
            phonicsConfig: settingsStore.phonicsConfig
          },
          sentenceStore: {
            currentSentence: sentenceStore.currentSentence,
            sentenceResult: sentenceStore.sentenceResult,
            grammarResult: sentenceStore.grammarResult,
            userSentence: sentenceStore.userSentence
          }
        }
      }
    } catch (error) {
      console.error('获取同步数据失败:', error)
      return {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {}
      }
    }
  }

  /**
   * 获取最后同步时间
   * @returns {string|null} 最后同步时间
   */
  getLastSyncTime() {
    if (!this.lastSyncTime) {
      this.lastSyncTime = localStorage.getItem('lastSyncTime')
    }
    return this.lastSyncTime
  }

  /**
   * 检查是否需要同步
   * @param {number} thresholdMinutes - 阈值（分钟）
   * @returns {boolean} 是否需要同步
   */
  needsSync(thresholdMinutes = 30) {
    const lastSync = this.getLastSyncTime()
    if (!lastSync) return true
    
    const lastSyncTime = new Date(lastSync)
    const now = new Date()
    const diffMinutes = (now - lastSyncTime) / (1000 * 60)
    
    return diffMinutes >= thresholdMinutes
  }

  /**
   * 创建新的 Grist 文档
   * @param {string} name - 文档名称
   * @returns {Promise<Object>} 创建结果
   */
  async createDocument(name) {
    try {
      if (!this.token) {
        return { success: false, message: '请先设置 Grist Token' }
      }

      // 这里应该调用 Grist API 创建文档
      // 暂时返回模拟结果
      await this.delay(1500)
      
      const mockDoc = {
        id: 'doc_' + Date.now(),
        name: name,
        created: new Date().toISOString()
      }
      
      return { success: true, document: mockDoc }
    } catch (error) {
      console.error('创建 Grist 文档失败:', error)
      return { success: false, message: '创建文档失败: ' + error.message }
    }
  }

  /**
   * 延迟函数（用于模拟网络延迟）
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise} 延迟 Promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 格式化数据用于同步
   * @param {Object} data - 原始数据
   * @returns {Object} 格式化后的数据
   */
  formatDataForSync(data) {
    return {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: data
    }
  }

  /**
   * 解析同步数据
   * @param {Object} syncData - 同步数据
   * @returns {Object} 解析后的数据
   */
  parseSyncData(syncData) {
    if (syncData && syncData.data) {
      return syncData.data
    }
    return syncData
  }
}

// 创建单例实例
export const gristSyncService = new GristSyncService()

// 导出类（用于测试）
export { GristSyncService } 
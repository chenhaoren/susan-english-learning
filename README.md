# Susan - 智能英语学习助手

一个基于Vue3的智能英语学习应用，专注于随机组句、句型转换和单词库管理，内置权威音标和自然拼读规则。

## ✨ 主要功能

### 🎲 随机组句
- 智能随机组合动词、形容词、名词
- 实时语法检查（基于LanguageTool API）
- AI辅助造句和提示
- 历史记录和复习模式

### 🔄 句型转换
- 多种句型转换练习
- 智能语法分析
- 学习进度跟踪

### 📚 单词库管理
- 支持Excel/CSV批量导入
- 内置权威音标词典
- 英音美音分别显示
- 自然拼读规则颜色分割
- 一键发音播放

### 🎯 核心特色
- **权威音标**：内置完整音标词典，支持英音美音
- **自然拼读**：按发音规则颜色分割，直观易懂
- **智能缓存**：本地缓存机制，响应快速
- **离线支持**：核心功能支持离线使用
- **响应式设计**：完美适配移动端和桌面端

## 🚀 技术栈

- **前端框架**：Vue 3 + Composition API
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **构建工具**：Vite
- **UI设计**：扁平化设计 + 流畅动画
- **音标服务**：Free Dictionary API + 本地缓存
- **语法检查**：LanguageTool API

## 📦 安装和运行

### 环境要求
- Node.js 16+
- npm 或 pnpm

### 安装依赖
```bash
npm install
# 或
pnpm install
```

### 开发模式
```bash
npm run dev
# 或
pnpm dev
```

### 构建生产版本
```bash
npm run build
# 或
pnpm build
```

## 🎨 功能展示

### 自然拼读规则
- **元音字母** (a, e, i, o, u, y) - 🔴 红色
- **辅音字母** (b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, w, x, z) - 🔵 蓝色
- **双字母组合** (ch, sh, th, ph, wh, ck, ng, qu) - 🟣 紫色
- **元音组合** (ai, ay, ee, ea, ie, oa, oe, ue, ui) - 🟠 橙色
- **R控制元音** (ar, er, ir, or, ur) - 🟡 橙色
- **静音E** (a_e, e_e, i_e, o_e, u_e) - 🟢 绿色

### 音标支持
- 🇬🇧 英式音标
- 🇺🇸 美式音标
- 一键播放发音
- 浏览器TTS降级方案

## 📁 项目结构

```
susan/
├── src/
│   ├── components/          # 组件
│   │   ├── business/        # 业务组件
│   │   └── ui/             # UI组件
│   │       └── WordBox.vue  # 单词展示组件
│   ├── views/              # 页面
│   │   ├── RandomSentence.vue  # 随机组句
│   │   ├── SentenceTransform.vue # 句型转换
│   │   └── WordBank.vue    # 单词库
│   ├── stores/             # 状态管理
│   │   ├── wordStore.js    # 单词状态
│   │   ├── sentenceStore.js # 句子状态
│   │   └── settingsStore.js # 设置状态
│   ├── services/           # 服务
│   │   └── api.js          # API服务
│   ├── router/             # 路由
│   ├── styles/             # 样式
│   └── utils/              # 工具函数
├── public/                 # 静态资源
└── 备份/                   # 原始HTML文件
```

## 🔧 配置说明

### API配置
项目使用以下免费API：
- **Free Dictionary API**：获取音标和发音
- **LanguageTool API**：语法检查
- **DeepSeek API**：AI造句（需要API密钥）

### 缓存配置
- 音标数据缓存7天
- 自动清理过期缓存
- 支持离线查看已缓存音标

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Free Dictionary API](https://dictionaryapi.dev/) - 免费音标服务
- [LanguageTool](https://languagetool.org/) - 语法检查服务
- [Vue.js](https://vuejs.org/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 微信联系

---

**Susan** - 让英语学习更智能、更高效！ 🎓 
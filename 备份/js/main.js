// 对话数据
const conversations = {
    daily: {
        greeting: {
            title: "日常问候",
            audio: "audio/greeting.mp3",
            script: [
                { speaker: "A", text: "Hi, how are you today?", translation: "嗨，今天怎么样？" },
                { speaker: "B", text: "I'm good, thank you. How about you?", translation: "我很好，谢谢。你呢？" },
                { speaker: "A", text: "I'm doing great!", translation: "我也很好！" }
            ]
        }
    },
    scenarios: {
        restaurant: {
            title: "餐厅点餐",
            audio: "audio/restaurant.mp3",
            script: [
                { speaker: "Customer", text: "Could I see the menu, please?", translation: "能给我看看菜单吗？" },
                { speaker: "Waiter", text: "Of course, here you are.", translation: "当然，给您。" }
            ]
        },
        shopping: {
            title: "购物对话",
            audio: "audio/shopping.mp3",
            script: [
                { speaker: "Customer", text: "How much is this shirt?", translation: "这件衬衫多少钱？" },
                { speaker: "Shop Assistant", text: "It's $29.99.", translation: "29.99美元。" }
            ]
        },
        travel: {
            title: "旅行交流",
            audio: "audio/travel.mp3",
            script: [
                { speaker: "Tourist", text: "Excuse me, how do I get to the museum?", translation: "打扰一下，怎么去博物馆？" },
                { speaker: "Local", text: "Take the subway line 2 and get off at Central Station.", translation: "坐2号线地铁，在中央站下车。" }
            ]
        }
    }
};

// 词汇数据
const vocabulary = {
    daily: [
        { word: "greeting", meaning: "问候", example: "Morning greeting is important." },
        { word: "farewell", meaning: "告别", example: "Say farewell to your friends." }
    ],
    restaurant: [
        { word: "menu", meaning: "菜单", example: "Please bring me the menu." },
        { word: "order", meaning: "点餐", example: "I'd like to order now." }
    ]
};

// 语法练习数据
const grammarExercises = {
    presentSimple: {
        title: "一般现在时",
        exercises: [
            {
                question: "She ___ to school every day.",
                options: ["go", "goes", "going", "went"],
                correct: "goes"
            }
        ]
    }
};

// 音频播放器
class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentConversation = null;
    }

    play(audioUrl) {
        this.audio.src = audioUrl;
        this.audio.play();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
}

// 对话练习管理器
class ConversationManager {
    constructor() {
        this.player = new AudioPlayer();
        this.currentConversation = null;
    }

    loadConversation(type, scenario) {
        this.currentConversation = conversations[type][scenario];
        this.displayConversation();
    }

    displayConversation() {
        const playerDiv = document.getElementById('conversation-player');
        playerDiv.innerHTML = this.currentConversation.script.map(line => `
            <div class="conversation-line">
                <strong>${line.speaker}:</strong> 
                <span class="english">${line.text}</span>
                <span class="translation">${line.translation}</span>
            </div>
        `).join('');
    }

    playConversation() {
        if (this.currentConversation) {
            this.player.play(this.currentConversation.audio);
        }
    }

    startPractice() {
        // 实现对话练习模式
        const practiceDiv = document.getElementById('conversation-practice');
        practiceDiv.innerHTML = `
            <div class="practice-mode">
                <h4>练习模式</h4>
                <div class="practice-controls">
                    <button onclick="conversationManager.recordPractice()">开始录音</button>
                    <button onclick="conversationManager.comparePractice()">对比发音</button>
                </div>
            </div>
        `;
    }
}

// 词汇游戏管理器
class VocabularyManager {
    constructor() {
        this.currentWords = [];
        this.score = 0;
    }

    loadVocabulary(category) {
        this.currentWords = vocabulary[category];
        this.displayVocabulary();
    }

    displayVocabulary() {
        const vocabDiv = document.getElementById('vocabulary-list');
        vocabDiv.innerHTML = this.currentWords.map(word => `
            <div class="vocabulary-item">
                <h4>${word.word}</h4>
                <p>含义：${word.meaning}</p>
                <p>例句：${word.example}</p>
            </div>
        `).join('');
    }

    startGame() {
        // 实现词汇游戏
        const gameDiv = document.getElementById('vocabulary-game');
        gameDiv.innerHTML = `
            <div class="game-container">
                <h4>词汇配对游戏</h4>
                <div class="game-board">
                    ${this.createGameBoard()}
                </div>
                <div class="score">得分：${this.score}</div>
            </div>
        `;
    }

    createGameBoard() {
        // 创建游戏板
        return this.currentWords.map(word => `
            <div class="game-card" data-word="${word.word}">
                <div class="card-front">${word.word}</div>
                <div class="card-back">${word.meaning}</div>
            </div>
        `).join('');
    }
}

// 语法练习管理器
class GrammarManager {
    constructor() {
        this.currentExercise = null;
    }

    loadExercise(topic) {
        this.currentExercise = grammarExercises[topic];
        this.displayExercise();
    }

    displayExercise() {
        const exerciseDiv = document.getElementById('grammar-exercise');
        exerciseDiv.innerHTML = this.currentExercise.exercises.map(exercise => `
            <div class="exercise-item">
                <p>${exercise.question}</p>
                <div class="options">
                    ${exercise.options.map(option => `
                        <button onclick="grammarManager.checkAnswer('${option}')">${option}</button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    checkAnswer(answer) {
        const exercise = this.currentExercise.exercises[0];
        if (answer === exercise.correct) {
            alert('回答正确！');
        } else {
            alert('再试一次！');
        }
    }
}

// 初始化管理器
const conversationManager = new ConversationManager();
const vocabularyManager = new VocabularyManager();
const grammarManager = new GrammarManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载默认对话
    conversationManager.loadConversation('daily', 'greeting');
    
    // 加载默认词汇
    vocabularyManager.loadVocabulary('daily');
    
    // 加载默认语法练习
    grammarManager.loadExercise('presentSimple');
}); 
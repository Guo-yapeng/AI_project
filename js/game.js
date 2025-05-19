/**
 * 交互式剧情游戏 - 核心游戏逻辑
 */

// 游戏状态管理
const gameState = {
    currentScene: null,
    history: [],
    isPlaying: false
};

// 游戏场景数据 - 在实际应用中，这些数据可以从外部JSON文件加载
const gameScenes = {
    // 开始场景
    'intro': {
        videoSrc: './videos/intro.mp4',  // 视频路径，需要替换为实际视频
        choiceTime: 30,  // 视频播放到多少秒时显示选项
        choices: [
            { text: '选择勇敢前进', nextScene: 'brave_path' },
            { text: '选择谨慎撤退', nextScene: 'cautious_path' }
        ]
    },
    // 勇敢路径
    'brave_path': {
        videoSrc: './videos/brave_path.mp4',
        choiceTime: 25,
        choices: [
            { text: '独自探索', nextScene: 'explore_alone' },
            { text: '寻求帮助', nextScene: 'seek_help' }
        ]
    },
    // 谨慎路径
    'cautious_path': {
        videoSrc: './videos/cautious_path.mp4',
        choiceTime: 20,
        choices: [
            { text: '收集更多信息', nextScene: 'gather_info' },
            { text: '制定详细计划', nextScene: 'make_plan' }
        ]
    },
    // 更多场景可以按照相同的模式添加
    'explore_alone': {
        videoSrc: './videos/explore_alone.mp4',
        choiceTime: -1,  // -1 表示视频结束，游戏结局
        isEnding: true,
        endingTitle: '独行侠结局'
    },
    'seek_help': {
        videoSrc: './videos/seek_help.mp4',
        choiceTime: -1,
        isEnding: true,
        endingTitle: '团队合作结局'
    },
    'gather_info': {
        videoSrc: './videos/gather_info.mp4',
        choiceTime: -1,
        isEnding: true,
        endingTitle: '信息收集者结局'
    },
    'make_plan': {
        videoSrc: './videos/make_plan.mp4',
        choiceTime: -1,
        isEnding: true,
        endingTitle: '策略大师结局'
    }
};

// DOM 元素
const videoElement = document.getElementById('story-video');
const choicesContainer = document.getElementById('choices-container');
const choicesButtons = document.getElementById('choices-buttons');
const startButton = document.getElementById('start-game');
const restartButton = document.getElementById('restart-game');
const videoNotice = document.getElementById('video-notice');
const usePlaceholderButton = document.getElementById('use-placeholder');

// 初始化游戏
function initGame() {
    // 添加事件监听器
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    videoElement.addEventListener('timeupdate', checkVideoProgress);
    videoElement.addEventListener('ended', handleVideoEnd);
    usePlaceholderButton.addEventListener('click', usePlaceholder);
}

// 使用占位图像作为视频
function usePlaceholder() {
    // 修改游戏场景数据，使用SVG占位图像
    Object.keys(gameScenes).forEach(sceneKey => {
        gameScenes[sceneKey].videoSrc = './videos/placeholder.svg';
        // 设置较短的选择时间，方便测试
        if (gameScenes[sceneKey].choiceTime > 0) {
            gameScenes[sceneKey].choiceTime = 3;
        }
    });
    
    // 隐藏提示信息
    videoNotice.classList.add('hidden');
    
    // 提示用户已启用测试模式
    alert('已启用测试模式，使用占位图像代替视频。');
}

// 开始游戏
function startGame() {
    startButton.classList.add('hidden');
    // 隐藏视频提示区域
    videoNotice.classList.add('hidden');
    loadScene('intro');
    gameState.isPlaying = true;
}

// 重新开始游戏
function restartGame() {
    restartButton.classList.add('hidden');
    startButton.classList.remove('hidden');
    choicesContainer.classList.add('hidden');
    gameState.history = [];
    gameState.currentScene = null;
    gameState.isPlaying = false;
    videoElement.pause();
    videoElement.removeAttribute('src');
    videoElement.load();
}

// 加载场景
function loadScene(sceneId) {
    // 保存当前场景到历史记录
    if (gameState.currentScene) {
        gameState.history.push(gameState.currentScene);
    }
    
    // 设置当前场景
    gameState.currentScene = sceneId;
    const scene = gameScenes[sceneId];
    
    // 隐藏选项容器
    choicesContainer.classList.add('hidden');
    
    // 加载视频
    videoElement.src = scene.videoSrc;
    videoElement.load();
    
    // 检查是否是SVG占位图像
    if (scene.videoSrc.endsWith('.svg')) {
        // 对于SVG占位图像，模拟视频播放
        videoElement.onloadeddata = function() {
            // 隐藏提示信息
            videoNotice.classList.add('hidden');
            // 如果是结局场景，直接显示结局
            if (scene.isEnding) {
                setTimeout(() => {
                    handleVideoEnd();
                }, 3000); // 3秒后显示结局
            }
        };
    }
    
    videoElement.play().catch(error => {
        console.error('视频播放失败:', error);
        alert('视频播放失败，请确保视频文件存在并且格式正确。');
    });
    
    // 如果是结局场景，显示重新开始按钮
    if (scene.isEnding) {
        restartButton.classList.remove('hidden');
    }
}

// 检查视频进度，在适当的时间显示选项
function checkVideoProgress() {
    if (!gameState.isPlaying) return;
    
    const scene = gameScenes[gameState.currentScene];
    const currentTime = videoElement.currentTime;
    
    // 当视频播放到指定时间时，显示选项
    if (scene.choiceTime > 0 && currentTime >= scene.choiceTime && choicesContainer.classList.contains('hidden')) {
        videoElement.pause();
        showChoices(scene.choices);
    }
    
    // 对于SVG占位图像，在短暂延迟后自动显示选项
    if (scene.videoSrc.endsWith('.svg') && currentTime >= 2 && !scene.isEnding && choicesContainer.classList.contains('hidden')) {
        videoElement.pause();
        showChoices(scene.choices);
    }
}

// 处理视频结束事件
function handleVideoEnd() {
    const scene = gameScenes[gameState.currentScene];
    
    // 如果不是结局场景且没有显示选项，则显示选项
    if (!scene.isEnding && choicesContainer.classList.contains('hidden')) {
        showChoices(scene.choices);
    }
    
    // 如果是结局场景，显示结局标题
    if (scene.isEnding) {
        showEnding(scene.endingTitle);
    }
}

// 显示选项
function showChoices(choices) {
    // 清空现有选项
    choicesButtons.innerHTML = '';
    
    // 为每个选项创建按钮
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = choice.text;
        button.addEventListener('click', () => makeChoice(choice.nextScene));
        choicesButtons.appendChild(button);
    });
    
    // 显示选项容器
    choicesContainer.classList.remove('hidden');
}

// 做出选择
function makeChoice(nextSceneId) {
    choicesContainer.classList.add('hidden');
    loadScene(nextSceneId);
}

// 显示结局
function showEnding(endingTitle) {
    const endingElement = document.createElement('div');
    endingElement.className = 'ending-title';
    endingElement.textContent = endingTitle;
    
    // 添加到选项容器中
    choicesButtons.innerHTML = '';
    choicesButtons.appendChild(endingElement);
    choicesContainer.classList.remove('hidden');
    
    // 显示重新开始按钮
    restartButton.classList.remove('hidden');
}

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);

// 添加一个提示，告诉用户需要准备视频文件
console.log('游戏初始化完成。请确保在 videos 文件夹中准备好所需的视频文件。');
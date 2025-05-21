/**
 * 交互式剧情游戏 - 核心游戏逻辑
 */

// 游戏状态管理
const gameState = {
    currentScene: null,
    history: [],
    isPlaying: false,
    currentImage: null // 当前显示的图片
};

// 游戏场景数据 - 在实际应用中，这些数据可以从外部JSON文件加载
const gameScenes = {
    // 开始场景
    'intro': {
        videoSrc: './videos/intro.mp4',  // 视频路径，需要替换为实际视频
        choiceTime: 30,  // 视频播放到多少秒时显示选项
        // 图片显示配置，可以设置多个时间点显示不同图片
        images: [
            { 
                time: 10, 
                src: './images/intro_image1.jpg', 
                audioSrc: './audio/intro_image1.mp3', // 对应的音频文件
                duration: 5, 
                title: '重要线索' 
            },
            { 
                time: 20, 
                src: './images/intro_image2.jpg', 
                audioSrc: './audio/intro_image2.mp3', // 对应的音频文件
                duration: 5, 
                title: '神秘地图' 
            }
        ],
        choices: [
            { text: '选择勇敢前进', nextScene: 'brave_path' },
            { text: '选择谨慎撤退', nextScene: 'cautious_path' }
        ]
    },
    // 勇敢路径
    'brave_path': {
        videoSrc: './videos/brave_path.mp4',
        choiceTime: 25,
        images: [
            { 
                time: 8, 
                src: './images/brave_path_image1.jpg', 
                audioSrc: './audio/brave_path_image1.mp3', 
                duration: 4, 
                title: '危险前方' 
            },
            { 
                time: 15, 
                src: './images/brave_path_image2.jpg', 
                audioSrc: './audio/brave_path_image2.mp3', 
                duration: 5, 
                title: '神秘洞穴' 
            }
        ],
        choices: [
            { text: '独自探索', nextScene: 'explore_alone' },
            { text: '寻求帮助', nextScene: 'seek_help' }
        ]
    },
    // 谨慎路径
    'cautious_path': {
        videoSrc: './videos/cautious_path.mp4',
        choiceTime: 20,
        images: [
            { 
                time: 5, 
                src: './images/cautious_path_image1.jpg', 
                audioSrc: './audio/cautious_path_image1.mp3', 
                duration: 4, 
                title: '隐藏线索' 
            },
            { 
                time: 12, 
                src: './images/cautious_path_image2.jpg', 
                audioSrc: './audio/cautious_path_image2.mp3', 
                duration: 5, 
                title: '地图标记' 
            }
        ],
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
        endingTitle: '独行侠结局',
        images: [
            { 
                time: 10, 
                src: './images/explore_alone_image.jpg', 
                audioSrc: './audio/explore_alone_image.mp3', 
                duration: 6, 
                title: '独自探索的发现' 
            }
        ]
    },
    'seek_help': {
        videoSrc: './videos/seek_help.mp4',
        choiceTime: -1,
        isEnding: true,
        endingTitle: '团队合作结局',
        images: [
            { 
                time: 8, 
                src: './images/seek_help_image.jpg', 
                audioSrc: './audio/seek_help_image.mp3', 
                duration: 6, 
                title: '团队的力量' 
            }
        ]
    },
    'gather_info': {
        videoSrc: './videos/gather_info.mp4',
        choiceTime: -1,
        isEnding: true,
        endingTitle: '信息收集者结局',
        images: [
            { 
                time: 7, 
                src: './images/gather_info_image.jpg', 
                audioSrc: './audio/gather_info_image.mp3', 
                duration: 6, 
                title: '关键情报' 
            }
        ]
    },
    'make_plan': {
        videoSrc: './videos/make_plan.mp4',
        choiceTime: -1,
        isEnding: true,
        endingTitle: '策略大师结局',
        images: [
            { 
                time: 9, 
                src: './images/make_plan_image.jpg', 
                audioSrc: './audio/make_plan_image.mp3', 
                duration: 6, 
                title: '完美计划' 
            }
        ]
    }
};

// DOM 元素
const videoElement = document.getElementById('story-video');
const choicesContainer = document.getElementById('choices-container');
const choicesButtons = document.getElementById('choices-buttons');
const startButton = document.getElementById('start-game');
const restartButton = document.getElementById('restart-game');
const videoNotice = document.getElementById('video-notice');
const videoContainer = document.getElementById('video-container');
const imageContainer = document.getElementById('image-container');
const imageElement = document.getElementById('story-image');
const imageTitle = document.getElementById('image-title');
const imageContinueButton = document.getElementById('image-continue-button');
const audioElement = document.getElementById('story-audio');
const audioToggleButton = document.getElementById('audio-toggle');
const audioVolumeSlider = document.getElementById('audio-volume');

// 初始化游戏
function initGame() {
    // 添加事件监听器
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    videoElement.addEventListener('timeupdate', checkVideoProgress);
    videoElement.addEventListener('ended', handleVideoEnd);
}



// 开始游戏
function startGame() {
    startButton.classList.add('hidden');
    // 隐藏视频提示区域
    videoNotice.classList.add('hidden');
    // 显示视频容器
    document.getElementById('video-container').classList.remove('hidden');
    // 进入全屏模式
    const videoContainer = document.getElementById('video-container');
    if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen().catch(err => {
            console.warn('无法进入全屏模式:', err);
        });
    } else if (videoContainer.webkitRequestFullscreen) { // Safari
        videoContainer.webkitRequestFullscreen();
    } else if (videoContainer.msRequestFullscreen) { // IE11
        videoContainer.msRequestFullscreen();
    }
    loadScene('intro');
    gameState.isPlaying = true;
}

// 重新开始游戏
function restartGame() {
    restartButton.classList.add('hidden');
    startButton.classList.remove('hidden');
    choicesContainer.classList.add('hidden');
    imageContainer.classList.add('hidden');
    // 移除结局场景样式类
    choicesContainer.classList.remove('ending-scene');
    gameState.history = [];
    gameState.currentScene = null;
    gameState.isPlaying = false;
    gameState.currentImage = null;
    videoElement.pause();
    videoElement.removeAttribute('src');
    videoElement.load();
    
    // 停止音频播放
    if (audioElement.src) {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement.removeAttribute('src');
    }
    
    // 退出全屏模式
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
            console.warn('退出全屏模式失败:', err);
        });
    } else if (document.webkitExitFullscreen) { // Safari
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE11
        document.msExitFullscreen();
    }
    
    // 隐藏视频容器
    document.getElementById('video-container').classList.add('hidden');
    
    // 确保重启按钮回到原始位置
    if (restartButton.parentElement !== document.querySelector('.game-controls')) {
        document.querySelector('.game-controls').appendChild(restartButton);
    }
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
    
    // 隐藏选项容器和图片容器
    choicesContainer.classList.add('hidden');
    imageContainer.classList.add('hidden');
    
    // 加载视频
    videoElement.src = scene.videoSrc;
    videoElement.load();
    // 移除控制条，实现纯净的视频播放体验
    videoElement.removeAttribute('controls');
    videoElement.style.objectFit = 'cover';
    
    // 重置图片显示状态
    if (scene.images) {
        scene.images.forEach(image => {
            image.shown = false;
        });
    }
    
    videoElement.play().catch(error => {
        console.error('视频播放失败:', error);
        alert('视频播放失败，请确保视频文件存在并且格式正确。');
    });
    
    // 如果是结局场景，显示重新开始按钮
    if (scene.isEnding) {
        restartButton.classList.remove('hidden');
        // 确保重启按钮在全屏模式下显示在视频上方
        videoContainer.appendChild(restartButton);
    } else {
        // 如果不是结局场景，确保重启按钮回到原位置
        if (restartButton.parentElement === videoContainer) {
            document.querySelector('.game-controls').appendChild(restartButton);
        }
    }
}

// 检查视频进度，在适当的时间显示选项或图片
function checkVideoProgress() {
    if (!gameState.isPlaying) return;
    
    const scene = gameScenes[gameState.currentScene];
    const currentTime = videoElement.currentTime;
    
    // 检查是否需要显示图片
    if (scene.images && scene.images.length > 0) {
        for (const image of scene.images) {
            // 如果当前时间达到图片显示时间点，且该图片尚未显示过
            if (currentTime >= image.time && !image.shown) {
                videoElement.pause();
                showImage(image);
                // 标记该图片已显示
                image.shown = true;
                return; // 一次只显示一张图片
            }
        }
    }
    
    // 当视频播放到指定时间时，显示选项
    if (scene.choiceTime > 0 && currentTime >= scene.choiceTime && choicesContainer.classList.contains('hidden')) {
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
    
    // 添加重新开始按钮到结局标题下方
    choicesButtons.appendChild(restartButton);
    restartButton.classList.remove('hidden');
    
    // 添加结局场景样式类，使容器居中显示
    choicesContainer.classList.add('ending-scene');
    choicesContainer.classList.remove('hidden');
}

// 显示图片
function showImage(image) {
    gameState.currentImage = image;
    
    // 设置图片源和标题
    imageElement.src = image.src;
    imageTitle.textContent = image.title || '';
    
    // 设置音频源（如果有）
    if (image.audioSrc) {
        audioElement.src = image.audioSrc;
        audioElement.load();
        audioElement.volume = audioVolumeSlider.value;
        audioElement.play().catch(error => {
            console.warn('音频播放失败:', error);
        });
        
        // 显示音频控制
        document.querySelector('.audio-controls').style.display = 'flex';
        audioToggleButton.textContent = '暂停音频';
    } else {
        // 隐藏音频控制
        document.querySelector('.audio-controls').style.display = 'none';
    }
    
    // 显示图片容器
    imageContainer.classList.remove('hidden');
    
    // 如果设置了持续时间，则在指定时间后自动关闭图片
    if (image.duration && image.duration > 0) {
        setTimeout(() => {
            hideImage();
        }, image.duration * 1000);
    }
}

// 隐藏图片并继续播放视频
function hideImage() {
    imageContainer.classList.add('hidden');
    gameState.currentImage = null;
    
    // 停止音频播放
    if (audioElement.src) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
    
    videoElement.play();
}

// 初始化游戏时添加图片继续按钮的事件监听
function initGame() {
    // 添加事件监听器
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    videoElement.addEventListener('timeupdate', checkVideoProgress);
    videoElement.addEventListener('ended', handleVideoEnd);
    imageContinueButton.addEventListener('click', hideImage);
    
    // 添加音频控制事件监听
    audioToggleButton.addEventListener('click', toggleAudio);
    audioVolumeSlider.addEventListener('input', adjustVolume);
}

// 切换音频播放/暂停
function toggleAudio() {
    if (audioElement.paused) {
        audioElement.play();
        audioToggleButton.textContent = '暂停音频';
    } else {
        audioElement.pause();
        audioToggleButton.textContent = '播放音频';
    }
}

// 调整音频音量
function adjustVolume() {
    audioElement.volume = audioVolumeSlider.value;
}

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);

// 添加一个提示，告诉用户需要准备视频和图片文件
console.log('游戏初始化完成。请确保在 videos 文件夹中准备好所需的视频文件，在 images 文件夹中准备好所需的图片文件。');
// 游戏状态管理
class GameState {
    constructor() {
        this.currentScene = 0;
        this.currentDialogue = 0;
        this.gameData = {};
        this.settings = {
            textSpeed: 5,
            volume: 50,
            autoMode: false
        };
        this.isTyping = false;
        this.autoTimer = null;
    }
    save() {
        const saveData = {
            currentScene: this.currentScene,
            currentDialogue: this.currentDialogue,
            gameData: this.gameData,
            settings: this.settings,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('visualNovelSave', JSON.stringify(saveData));
        alert('游戏已保存！');
    }

    load() {
        const saveData = localStorage.getItem('visualNovelSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.currentScene = data.currentScene;
            this.currentDialogue = data.currentDialogue;
            this.gameData = data.gameData || {};
            this.settings = { ...this.settings, ...data.settings };
            return true;
        }
        return false;
    }
}

// 游戏故事数据
const gameStory = {
    scenes: {
        'intro': {
            backgroundSrc: 'images/backgrounds/.png',
            bgmSrc: 'audio/bgm/.mp3',
            dialogs: [
                {
                    character: '',
                    text: '',
                    position: 'none',
                    expression: null,
                    effect: null,
                    voiceSrc: 'audio/voices/.mp3'
                },
                {
                    character: '',
                    text: '',
                    position: 'none',
                    expression: null,
                    effect: null,
                    voiceSrc: 'audio/voices/.mp3'
                },
                // 更多对话
            ],
            choices: [
                { text: '', nextScene: '' },
                { text: '', nextScene: '' }
            ]
            /*
            autoNextScene: ''   // 自动跳转到下一个场景
            */
        },
    }
};

// 游戏主类
class VisualNovelGame {
    constructor() {
        this.gameState = new GameState();
        this.initializeElements();
        this.bindEvents();
        this.showIntroVideo(); // 直接播放介绍视频
        this.audioElements = {};
        this.videoElement = null;
    }

    initializeElements() {
        this.elements = {
            gameContainer: document.getElementById('game-container'),
            background: document.getElementById('background'),
            backgroundVideo: document.getElementById('background-video'),
            introVideoScreen: document.getElementById('intro-video-screen'),
            introVideo: document.getElementById('intro-video'),
            skipIntroBtn: document.getElementById('skip-intro-btn'),
            continueAfterIntroBtn: document.getElementById('continue-after-intro-btn'),
            characterContainer: document.getElementById('character-container'),
            character: document.getElementById('character'),
            charactersContainer: document.getElementById('characters-container'),
            leftCharacter: document.getElementById('left-character').querySelector('.character-image'),
            centerCharacter: document.getElementById('center-character').querySelector('.character-image'),
            rightCharacter: document.getElementById('right-character').querySelector('.character-image'),
            dialogueBox: document.getElementById('dialogue-box'),
            speakerName: document.getElementById('speaker-name'),
            dialogueText: document.getElementById('dialogue-text'),
            continueIndicator: document.getElementById('continue-indicator'),
            choicesContainer: document.getElementById('choices-container'),
            startScreen: document.getElementById('start-screen'),
            settingsPanel: document.getElementById('settings-panel'),
            textSpeedSlider: document.getElementById('text-speed'),
            volumeSlider: document.getElementById('volume'),
            autoBtn: document.getElementById('auto-btn')
        };
    }

    bindEvents() {
        // 开始界面按钮
        document.getElementById('new-game-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('continue-game-btn').addEventListener('click', () => this.continueGame());
        document.getElementById('about-btn').addEventListener('click', () => this.showAbout());

        // 介绍视频控制
        this.elements.skipIntroBtn.addEventListener('click', () => this.skipIntroVideo());
        this.elements.continueAfterIntroBtn.addEventListener('click', () => this.continueAfterIntro());
        
        // 监听视频结束事件 - 自动进入游戏
        this.elements.introVideo.addEventListener('ended', () => {
            this.continueAfterIntro();
        });

        // 游戏菜单按钮
        document.getElementById('save-btn').addEventListener('click', () => this.gameState.save());
        document.getElementById('load-btn').addEventListener('click', () => this.loadGame());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('auto-btn').addEventListener('click', () => this.toggleAutoMode());

        // 设置面板
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettings());
        this.elements.textSpeedSlider.addEventListener('input', (e) => {
            this.gameState.settings.textSpeed = parseInt(e.target.value);
        });
        this.elements.volumeSlider.addEventListener('input', (e) => {
            this.gameState.settings.volume = parseInt(e.target.value);
            // 实时更新音量显示
            this.updateVolumeDisplay();
            // 实时应用音量到正在播放的音频
            this.updateAudioVolume();
        });

        // 对话框点击事件
        this.elements.dialogueBox.addEventListener('click', () => this.nextDialogue());

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                this.nextDialogue();
            }
        });
    }

    showStartScreen() {
        this.elements.startScreen.style.display = 'flex';
        this.elements.dialogueBox.style.display = 'none';
    }

    hideStartScreen() {
        this.elements.startScreen.style.opacity = '0';
        setTimeout(() => {
            this.elements.startScreen.style.display = 'none';
            // 不要强制显示对话框，让loadScene方法来决定是否显示
        }, 500);
    }

    startNewGame() {
        this.gameState.currentScene = 'intro';
        this.gameState.currentDialogue = 0;
        this.gameState.gameData = {};
        this.hideStartScreen();
        // 延迟加载场景，确保hideStartScreen完成后再执行
        setTimeout(() => {
            this.loadScene('intro');
        }, 600);
    }

    continueGame() {
        if (this.gameState.load()) {
            this.hideStartScreen();
            // 延迟加载场景，确保hideStartScreen完成后再执行
            setTimeout(() => {
                this.loadScene();
            }, 600);
        } else {
            alert('没有找到存档文件！');
        }
    }

    loadGame() {
        if (this.gameState.load()) {
            this.loadScene();
        } else {
            alert('没有找到存档文件！');
        }
    }

    showAbout() {
        alert('梦境之旅\n\n一个简单的视觉小说游戏演示\n\n功能特性：\n- 对话系统\n- 选择分支\n- 保存/读取\n- 自动模式\n- 响应式设计');
    }

    showSettings() {
        this.elements.settingsPanel.style.display = 'block';
        this.elements.textSpeedSlider.value = this.gameState.settings.textSpeed;
        this.elements.volumeSlider.value = this.gameState.settings.volume;
        // 初始化音量显示
        this.updateVolumeDisplay();
    }

    hideSettings() {
        this.elements.settingsPanel.style.display = 'none';
    }

    toggleAutoMode() {
        this.gameState.settings.autoMode = !this.gameState.settings.autoMode;
        this.elements.autoBtn.style.background = this.gameState.settings.autoMode ? 
            'rgba(102, 126, 234, 0.8)' : 'rgba(0, 0, 0, 0.7)';
        
        if (this.gameState.settings.autoMode) {
            this.startAutoMode();
        } else {
            this.stopAutoMode();
        }
    }

    startAutoMode() {
        if (this.gameState.settings.autoMode && !this.gameState.isTyping) {
            this.autoTimer = setTimeout(() => {
                this.nextDialogue();
            }, 3000);
        }
    }

    stopAutoMode() {
        if (this.autoTimer) {
            clearTimeout(this.autoTimer);
            this.autoTimer = null;
        }
    }

    loadScene() {
        const currentSceneId = this.gameState.currentScene;
        const scene = gameStory.scenes[currentSceneId];
        if (!scene) return;

        // 停止之前的音频和视频
        this.stopAllMedia();
        
        // 更新背景
        if (scene.backgroundSrc) {
            this.elements.background.style.background = `url('${scene.backgroundSrc}') no-repeat center center`;
            this.elements.background.style.backgroundSize = 'cover';
            this.elements.background.style.display = 'block';
        } else {
            this.elements.background.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            this.elements.background.style.display = 'block';
        }
        
        // 处理视频背景
        if (scene.videoSrc) {
            this.playVideo(scene.videoSrc);
            // 当播放背景视频时，隐藏所有对话相关UI元素
            this.elements.dialogueBox.style.display = 'none';
            this.elements.characterContainer.style.display = 'none';
            this.elements.charactersContainer.style.display = 'none';
            this.elements.speakerName.style.display = 'none';
            this.elements.dialogueText.style.display = 'none';
            this.elements.continueIndicator.style.display = 'none';
            if (this.elements.choicesContainer) {
                this.elements.choicesContainer.style.display = 'none';
            }
        } else {
            if (this.videoElement) {
                this.videoElement.style.display = 'none';
            }
            // 只有在没有背景视频时才显示UI元素
            this.elements.dialogueBox.style.display = 'block';
            this.elements.characterContainer.style.display = 'block';
            this.elements.charactersContainer.style.display = 'block';
            this.elements.speakerName.style.display = 'block';
            this.elements.dialogueText.style.display = 'block';
            this.elements.continueIndicator.style.display = 'block';
            if (this.elements.choicesContainer) {
                this.elements.choicesContainer.style.display = 'none'; // 选择容器默认隐藏
            }
        }
        
        // 播放背景音乐
        if (scene.bgmSrc) {
            this.playBackgroundMusic(scene.bgmSrc);
        }
        
        // 重置所有角色立绘
        if (this.elements.leftCharacter) this.elements.leftCharacter.style.display = 'none';
        if (this.elements.centerCharacter) this.elements.centerCharacter.style.display = 'none';
        if (this.elements.rightCharacter) this.elements.rightCharacter.style.display = 'none';
        if (this.elements.character) this.elements.character.style.display = 'none';
        
        // 重置对话索引
        if (this.gameState.currentDialogue >= scene.dialogs.length) {
            this.gameState.currentDialogue = 0;
        }
        
        // 只有在没有背景视频时才显示对话
        if (!scene.videoSrc) {
            this.showDialogue();
        }
    }
    
    playBackgroundMusic(src) {
        if (!this.audioElements.bgm) {
            this.audioElements.bgm = new Audio();
            this.audioElements.bgm.loop = true;
        }
        
        this.audioElements.bgm.src = src;
        this.audioElements.bgm.volume = this.gameState.settings.volume / 100;
        this.audioElements.bgm.play().catch(e => console.warn('无法播放背景音乐:', e));
    }
    
    playVoice(src) {
        if (!this.audioElements.voice) {
            this.audioElements.voice = new Audio();
        }
        
        this.audioElements.voice.src = src;
        this.audioElements.voice.volume = this.gameState.settings.volume / 100;
        this.audioElements.voice.play().catch(e => console.warn('无法播放语音:', e));
    }
    
    // 更新音量显示
    updateVolumeDisplay() {
        const volumeLabel = document.querySelector('label[for="volume"]');
        if (volumeLabel) {
            volumeLabel.textContent = `音量: ${this.gameState.settings.volume}%`;
        }
    }
    
    // 实时更新正在播放的音频音量
    updateAudioVolume() {
        const volume = this.gameState.settings.volume / 100;
        
        // 更新背景音乐音量
        if (this.audioElements.bgm) {
            this.audioElements.bgm.volume = volume;
        }
        
        // 更新语音音量
        if (this.audioElements.voice) {
            this.audioElements.voice.volume = volume;
        }
    }
    
    playVideo(src) {
        // 如果视频元素不存在，创建一个
        if (!this.videoElement) {
            this.videoElement = document.createElement('video');
            this.videoElement.style.position = 'absolute';
            this.videoElement.style.top = '0';
            this.videoElement.style.left = '0';
            this.videoElement.style.width = '100%';
            this.videoElement.style.height = '100%';
            this.videoElement.style.objectFit = 'cover';
            this.videoElement.style.zIndex = '1';
            this.elements.gameContainer.insertBefore(this.videoElement, this.elements.background.nextSibling);
        }
        
        this.videoElement.src = src;
        this.videoElement.style.display = 'block';
        
        // 添加视频结束事件监听器
        this.videoElement.onended = () => {
            const currentScene = gameStory.scenes[this.gameState.currentScene];
            if (currentScene.autoNextScene) {
                this.gameState.currentScene = currentScene.autoNextScene;
                this.gameState.currentDialogue = 0;
                this.loadScene();
            }
        };
        
        this.videoElement.play().catch(e => console.warn('无法播放视频:', e));
    }
    
    stopAllMedia() {
        // 停止背景音乐
        if (this.audioElements.bgm) {
            this.audioElements.bgm.pause();
        }
        
        // 停止语音
        if (this.audioElements.voice) {
            this.audioElements.voice.pause();
        }
        
        // 停止视频
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.style.display = 'none';
        }
    }

    // 显示介绍视频
    showIntroVideo() {
        this.elements.introVideoScreen.style.display = 'flex';
        this.elements.continueAfterIntroBtn.style.display = 'none';
        this.elements.skipIntroBtn.style.display = 'block'; // 显示跳过按钮
        
        // 隐藏对话框和人物立绘
        this.elements.dialogueBox.style.display = 'none';
        this.elements.characterContainer.style.display = 'none';
        this.elements.charactersContainer.style.display = 'none';
        
        // 确保所有可能的UI元素都被隐藏
        this.elements.speakerName.style.display = 'none';
        this.elements.dialogueText.style.display = 'none';
        this.elements.continueIndicator.style.display = 'none';
        if (this.elements.choicesContainer) {
            this.elements.choicesContainer.style.display = 'none';
        }
        
        // 隐藏所有角色立绘
        if (this.elements.leftCharacter) this.elements.leftCharacter.style.display = 'none';
        if (this.elements.centerCharacter) this.elements.centerCharacter.style.display = 'none';
        if (this.elements.rightCharacter) this.elements.rightCharacter.style.display = 'none';
        if (this.elements.character) this.elements.character.style.display = 'none';
        
        // 设置视频源（用户需要将intro.mp4放在media/videos/目录下）
        this.elements.introVideo.src = 'media/videos/intro.mp4';
        this.elements.introVideo.load();
        this.elements.introVideo.play().catch(e => {
            console.log('视频播放失败，可能是因为没有找到intro.mp4文件:', e);
            // 如果视频播放失败，直接进入开始界面
            this.skipIntroVideo();
        });
        
        // 设置视频为全屏样式
        this.elements.introVideo.style.width = '100%';
        this.elements.introVideo.style.height = '100%';
        this.elements.introVideo.style.objectFit = 'cover';
    }

    // 跳过介绍视频
    skipIntroVideo() {
        this.elements.introVideoScreen.style.display = 'none';
        this.elements.introVideo.pause();
        this.showStartScreen(); // 显示开始界面
    }

    // 视频播放完毕后继续
    continueAfterIntro() {
        this.elements.introVideoScreen.style.display = 'none';
        this.showStartScreen(); // 显示开始界面
    }

    showDialogue() {
        const scene = gameStory.scenes[this.gameState.currentScene];
        const dialogue = scene.dialogs[this.gameState.currentDialogue];
        
        if (!dialogue) return;

        // 更新说话者名称
        this.elements.speakerName.textContent = dialogue.character;
        
        // 播放语音（如果有）
        if (dialogue.voiceSrc) {
            this.playVoice(dialogue.voiceSrc);
        }
        
        // 更新角色立绘位置和表情
        this.updateCharacter(dialogue);
        
        // 应用特效（如果有）
        if (dialogue.effect) {
            this.applyDialogueEffect(dialogue.effect);
        }
        
        // 打字机效果显示文本
        this.typeText(dialogue.text, () => {
            // 显示选择按钮（如果有）
            if (scene.choices && this.gameState.currentDialogue === scene.dialogs.length - 1) {
                this.showChoices(scene.choices);
            } else {
                this.elements.continueIndicator.style.display = 'block';
                if (this.gameState.settings.autoMode) {
                    this.startAutoMode();
                }
            }
        });
    }
    
    updateCharacter(dialogue) {
        // 如果没有角色信息，隐藏所有角色立绘
        if (!dialogue.character || dialogue.character === '旁白'|| dialogue.character === '警察' || dialogue.character === '神秘男子'
            || dialogue.character === '新闻' || dialogue.character === '外交部长' || dialogue.character === '少女' || dialogue.character === '管家'
            || dialogue.character === '中年男子'||dialogue.character === '约翰'|| dialogue.character === '火星高层'
        ) {
            this.elements.character.style.display = 'none';
            this.elements.leftCharacter.style.display = 'none';
            this.elements.centerCharacter.style.display = 'none';
            this.elements.rightCharacter.style.display = 'none';
            return;
        }
        
        // 根据位置选择对应的角色元素
        let characterElement;
        switch (dialogue.position) {
            case 'left':
                characterElement = this.elements.leftCharacter;
                // 隐藏其他位置的角色
                this.elements.centerCharacter.style.display = 'none';
                this.elements.rightCharacter.style.display = 'none';
                this.elements.character.style.display = 'none';
                break;
            case 'center':
                characterElement = this.elements.centerCharacter;
                // 隐藏其他位置的角色
                this.elements.leftCharacter.style.display = 'none';
                this.elements.rightCharacter.style.display = 'none';
                this.elements.character.style.display = 'none';
                break;
            case 'right':
                characterElement = this.elements.rightCharacter;
                // 隐藏其他位置的角色
                this.elements.leftCharacter.style.display = 'none';
                this.elements.centerCharacter.style.display = 'none';
                this.elements.character.style.display = 'none';
                break;
            case 'none':
                // 隐藏所有人物立绘
                this.elements.leftCharacter.style.display = 'none';
                this.elements.centerCharacter.style.display = 'none';
                this.elements.rightCharacter.style.display = 'none';
                this.elements.character.style.display = 'none';
                break;
            default:
                // 使用原来的单角色显示方式
                const characterImagePath = `images/characters/${dialogue.character.toLowerCase()}_${dialogue.expression || 'neutral'}.png`;
                this.elements.character.src = characterImagePath;
                this.elements.character.style.display = 'block';
                // 隐藏多角色容器
                this.elements.leftCharacter.style.display = 'none';
                this.elements.centerCharacter.style.display = 'none';
                this.elements.rightCharacter.style.display = 'none';
                return;
        }
        
        // 设置角色图片路径（角色名_表情.png）
        const expressionSuffix = dialogue.expression ? `_${dialogue.expression}` : '_neutral';
        const characterImagePath = `images/characters/${dialogue.character}${expressionSuffix}.png`;
        characterElement.src = characterImagePath;
        characterElement.style.display = 'block';
        
        // 设置说话角色高亮效果
        this.elements.leftCharacter.classList.remove('character-speaking', 'character-not-speaking');
        this.elements.centerCharacter.classList.remove('character-speaking', 'character-not-speaking');
        this.elements.rightCharacter.classList.remove('character-speaking', 'character-not-speaking');
        
        characterElement.classList.add('character-speaking');
        
        // 其他显示的角色变暗
        [this.elements.leftCharacter, this.elements.centerCharacter, this.elements.rightCharacter].forEach(el => {
            if (el !== characterElement && el.style.display !== 'none') {
                el.classList.add('character-not-speaking');
            }
        });
    }
    
    applyDialogueEffect(effect) {
        switch (effect) {
            case 'character_in':
                // 角色入场动画 - 适用于多角色系统
                const activeCharacter = this.getActiveCharacter();
                if (activeCharacter) {
                    activeCharacter.style.opacity = '0';
                    activeCharacter.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        activeCharacter.style.transition = 'all 0.5s ease-out';
                        activeCharacter.style.opacity = '1';
                        activeCharacter.style.transform = 'translateY(0)';
                    }, 100);
                }
                break;
                
            case 'character_out':
                // 角色退场动画
                const exitingCharacter = this.getActiveCharacter();
                if (exitingCharacter) {
                    exitingCharacter.style.transition = 'all 0.5s ease-in';
                    exitingCharacter.style.opacity = '0';
                    exitingCharacter.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        exitingCharacter.style.display = 'none';
                    }, 500);
                }
                break;
                
            case 'fade_in':
                // 淡入效果
                this.elements.dialogueBox.style.opacity = '0';
                setTimeout(() => {
                    this.elements.dialogueBox.style.transition = 'opacity 0.5s ease-in';
                    this.elements.dialogueBox.style.opacity = '1';
                }, 100);
                break;
                
            case 'echo':
                // 回声效果（文字颜色变化）
                this.elements.dialogueText.style.color = '#a0a0ff';
                this.elements.dialogueText.style.textShadow = '0 0 5px rgba(160, 160, 255, 0.7)';
                setTimeout(() => {
                    this.elements.dialogueText.style.transition = 'all 2s ease';
                    this.elements.dialogueText.style.color = '#fff';
                    this.elements.dialogueText.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';
                }, 2000);
                break;
                
            case 'shake':
                // 震动效果
                this.elements.dialogueBox.classList.add('shake');
                setTimeout(() => {
                    this.elements.dialogueBox.classList.remove('shake');
                }, 500);
                break;
                
            case 'flash':
                // 闪烁效果
                const flashOverlay = document.createElement('div');
                flashOverlay.style.position = 'absolute';
                flashOverlay.style.top = '0';
                flashOverlay.style.left = '0';
                flashOverlay.style.width = '100%';
                flashOverlay.style.height = '100%';
                flashOverlay.style.backgroundColor = 'white';
                flashOverlay.style.opacity = '0';
                flashOverlay.style.zIndex = '100';
                flashOverlay.style.transition = 'opacity 0.1s ease-in-out';
                
                this.elements.gameContainer.appendChild(flashOverlay);
                
                setTimeout(() => {
                    flashOverlay.style.opacity = '1';
                    setTimeout(() => {
                        flashOverlay.style.opacity = '0';
                        setTimeout(() => {
                            this.elements.gameContainer.removeChild(flashOverlay);
                        }, 100);
                    }, 100);
                }, 0);
                break;
                
            default:
                break;
        }
    }
    
    // 获取当前活跃的角色元素
    getActiveCharacter() {
        if (this.elements.leftCharacter.style.display !== 'none') {
            return this.elements.leftCharacter;
        } else if (this.elements.centerCharacter.style.display !== 'none') {
            return this.elements.centerCharacter;
        } else if (this.elements.rightCharacter.style.display !== 'none') {
            return this.elements.rightCharacter;
        } else if (this.elements.character.style.display !== 'none') {
            return this.elements.character;
        }
        return null;
    }

    typeText(text, callback) {
        this.gameState.isTyping = true;
        this.elements.dialogueText.textContent = '';
        this.elements.continueIndicator.style.display = 'none';
        this.stopAutoMode();
        
        let index = 0;
        const speed = 100 - (this.gameState.settings.textSpeed * 8);
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                this.elements.dialogueText.textContent += text[index];
                index++;
            } else {
                clearInterval(typeInterval);
                this.gameState.isTyping = false;
                if (callback) callback();
            }
        }, speed);
    }

    showChoices(choices) {
        this.elements.choicesContainer.innerHTML = '';
        this.elements.choicesContainer.style.display = 'block';
        this.elements.continueIndicator.style.display = 'none';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn slide-up';
            button.textContent = choice.text;
            button.style.animationDelay = `${index * 0.1}s`;
            
            button.addEventListener('click', () => {
                this.makeChoice(choice);
            });
            
            this.elements.choicesContainer.appendChild(button);
        });
    }

    makeChoice(choice) {
        this.elements.choicesContainer.style.display = 'none';
        
        if (choice.nextScene !== undefined) {
            // 保存选择到游戏数据中
            if (!this.gameState.gameData.choices) {
                this.gameState.gameData.choices = [];
            }
            this.gameState.gameData.choices.push({
                fromScene: this.gameState.currentScene,
                choice: choice.text,
                toScene: choice.nextScene,
                timestamp: new Date().toISOString()
            });
            
            // 切换到下一个场景
            this.gameState.currentScene = choice.nextScene;
            this.gameState.currentDialogue = 0;
            this.loadScene();
        }
    }

    nextDialogue() {
        if (this.gameState.isTyping) return;
        
        const scene = gameStory.scenes[this.gameState.currentScene];
        
        // 如果当前场景有背景视频，不处理对话逻辑
        if (scene.videoSrc) {
            return;
        }
        
        // 如果是最后一个对话且有选择，不自动前进
        if (this.gameState.currentDialogue === scene.dialogs.length - 1 && scene.choices) {
            return;
        }
        
        this.gameState.currentDialogue++;
        
        if (this.gameState.currentDialogue >= scene.dialogs.length) {
            // 检查是否有自动切换的下一个场景
            if (scene.autoNextScene) {
                this.gameState.currentScene = scene.autoNextScene;
                this.gameState.currentDialogue = 0;
                this.loadScene();
                return;
            }
            // 如果没有选择，但是对话结束了，可以添加默认场景切换逻辑
            else if (!scene.choices) {
                // 默认返回到开始场景
                this.gameState.currentScene = 'intro';
                this.gameState.currentDialogue = 0;
                this.loadScene();
                return;
            }
            // 否则保持在最后一个对话，等待玩家选择
            this.gameState.currentDialogue = scene.dialogs.length - 1;
        }
        
        // 只有在没有背景视频时才显示对话
        const currentScene = gameStory.scenes[this.gameState.currentScene];
        if (!currentScene.videoSrc) {
            this.showDialogue();
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new VisualNovelGame();
});
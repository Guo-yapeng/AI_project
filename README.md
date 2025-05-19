# 交互式剧情游戏

这是一个基于网页的交互式剧情游戏，允许用户通过选择不同的剧情分支来影响故事的发展方向。

## 功能特点

- 视频播放：嵌入视频作为剧情展示
- 分支选择：在关键时刻暂停视频并提供选择
- 多结局：根据用户的选择导向不同的结局
- 响应式设计：适配不同屏幕尺寸

## 使用说明

1. 准备视频文件
   - 在项目根目录创建 `videos` 文件夹
   - 准备以下视频文件并放入 `videos` 文件夹：
     - intro.mp4（介绍场景）
     - brave_path.mp4（勇敢路径场景）
     - cautious_path.mp4（谨慎路径场景）
     - explore_alone.mp4（独自探索结局）
     - seek_help.mp4（寻求帮助结局）
     - gather_info.mp4（收集信息结局）
     - make_plan.mp4（制定计划结局）

2. 启动游戏
   - 直接在浏览器中打开 `index.html` 文件
   - 点击"开始游戏"按钮开始体验

## 自定义游戏

如果你想自定义游戏内容，可以编辑 `js/game.js` 文件中的 `gameScenes` 对象：

```javascript
const gameScenes = {
    'scene_id': {
        videoSrc: './videos/your_video.mp4',  // 视频路径
        choiceTime: 30,  // 视频播放到多少秒时显示选项
        choices: [
            { text: '选项文本', nextScene: '下一个场景ID' },
            // 更多选项...
        ]
    },
    // 更多场景...
};
```

## 技术栈

- HTML5：页面结构和视频播放
- CSS3：样式和动画效果
- JavaScript：游戏逻辑和交互控制

## 注意事项

- 视频文件需要是MP4格式，确保兼容性
- 视频文件大小会影响加载速度，建议适当压缩
- 可以根据需要调整CSS样式，自定义游戏外观
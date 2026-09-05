# 恐龙养成记 (Dino Quest)

一款为孩子设计、运行在 iPad 上的家庭养成类游戏。孩子通过在家完成任务（做家务、学习、锻炼等）获得积分，用积分在游戏内商城兑换食物、水和武器，喂养并装扮自己的恐龙，让它变得更强大。

> 这是一个记录父子/父女共同创造游戏的开源项目。从零开始，一步步把想法变成孩子可以玩的东西。

## 🎮 游戏简介

- **平台**：iPad（React + Vite PWA，加到主屏幕即可）
- **玩家**：爸爸、妈妈、哥哥、妹妹（4 人家庭账号）
- **核心循环**：现实中完成任务 → 每周家庭会议对齐积分 → 录入 iPad → 商城消费 → 培养恐龙 → 恐龙成长
- **教育目标**：培养孩子的责任感、目标感和延迟满足能力

## ✨ 核心玩法

1. **任务系统**：任务在**线下**运作。每人有实体计分板，每周日晚上开家庭会议对齐积分，家长录入 iPad。
2. **积分商城**：使用积分购买食物、水、武器、装饰品。
3. **恐龙养成**：每人一只 AIGC 生成的专属恐龙，5 个成长阶段（幼年 → 少年 → 青年 → 成年 → 究极），约 6 个月养到究极。
4. **状态与提醒**：饱食度/口渴度/心情会自然衰减，需要主人主动喂养。低于阈值时全屏和 tab 栏会有红点提醒。
5. **家庭互动**：家庭大厅排行榜，看得到彼此的恐龙进度。

## 📁 项目结构

```
game/
├── README.md
├── docs/                # 设计文档
│   ├── GDD.md           # 游戏设计文档
│   ├── ROADMAP.md       # 开发路线图
│   └── DEVLOG.md        # 开发日志
├── public/              # PWA 图标、manifest
├── src/                 # React 源代码
│   ├── App.jsx / App.css
│   ├── store.js         # 单文件状态管理（localStorage 持久化）
│   ├── catalog.js       # 数值中心：商城物品、阶段经验、成长属性
│   ├── ConfirmModal.jsx / LevelUpModal.jsx
│   └── screens/         # 5 个屏幕：Family / Home / Entry / Shop / Inventory
├── index.html
└── vite.config.js
```

## 🚀 当前进度

- [x] 项目立项
- [x] 游戏设计文档 v0.3
- [x] 技术栈选型（React + Vite PWA）
- [x] 数字原型 + MVP 核心闭环
- [ ] 家庭内测第 1 轮 ← **进行中**
- [ ] 武器战斗系统
- [ ] Web Push 通知

详见 [ROADMAP](docs/ROADMAP.md) 和 [DEVLOG](docs/DEVLOG.md)。

## 🛠️ 开发上手

**要求**：Node.js 18+（推荐 20+），任意 macOS/Linux。

```bash
git clone git@github.com:zhangguoqing024-dotcom/dino-quest.git
cd dino-quest
npm install
npm run dev
```

Vite 启动后会打印 `Local` 和 `Network` 两个地址：
- Mac 上浏览器打开 `Local` 那个
- 同一 WiFi 下的 iPad Safari 打开 `Network` 那个 → 分享 → **添加到主屏幕**

代码改动会通过 HMR 实时推送到 iPad，不用刷新（有时候 tab 栏刷不出来切一下前后台就行）。

### 从另一台 Mac 上开发

如果你已经在一台电脑上配好了 SSH，另一台需要单独走一遍：

```bash
# 1. 生成一把 GitHub 专用 SSH key（和公司/其他账号隔离）
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_personal -C "personal-github" -N ""

# 2. 打印公钥，加到 GitHub → Settings → SSH and GPG keys
cat ~/.ssh/id_ed25519_personal.pub

# 3. 让 github.com 走这把 key（追加到 ~/.ssh/config）
cat >> ~/.ssh/config <<'EOF'

Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  IdentitiesOnly yes
EOF

# 4. clone 并配置本仓库的 git 作者（不影响全局）
git clone git@github.com:zhangguoqing024-dotcom/dino-quest.git
cd dino-quest
git config user.name "GQ024"
git config user.email "zhangguoqing024@gmail.com"

# 5. 跑起来
npm install
npm run dev
```

### 常用脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | 本地开发服务（默认 5173，`--host` 局域网可访问） |
| `npm run build` | 生产构建到 `dist/` |
| `npm run preview` | 预览生产构建 |

### 数据存储

游戏数据存在浏览器 `localStorage` 里，key 为 `dino-quest:v1`。同一台设备同一浏览器数据共享；换设备/清缓存 = 从头再来。想清空存档：App 右上角"重置"按钮。

## 👨‍👩‍👧‍👦 关于这个项目

这不只是一款游戏，也是一次和孩子一起把想象变成现实的旅程。欢迎其他家庭参考、Fork，甚至一起共创。

## 📄 License

MIT

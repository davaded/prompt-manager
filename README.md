# Prompt Manager

桌面端 Prompt 管理工具，支持变量替换、版本历史追踪、标签分类。基于 Tauri 2.0 构建。

## 功能特性

- ✅ **变量系统**: 支持 `{{variable}}` 语法，包括文本变量、下拉选择、系统剪贴板、日期时间
- ✅ **标签管理**: 多标签分类，快速筛选
- ✅ **搜索功能**: 支持标题、内容、标签全文搜索
- ✅ **版本历史**: 自动记录每次修改，支持查看历史版本
- ✅ **全局快捷键**: `Ctrl+Shift+P` (或 `Cmd+Shift+P`) 快速唤起/隐藏
- ✅ **深色模式**: 支持浅色/深色主题
- ✅ **实时预览**: 变量替换实时预览，一键复制

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2.0 (Rust) |
| 前端框架 | React 18 + TypeScript |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion |
| 状态管理 | Zustand |
| 数据库 | SQLite (SQLx) |

## 安装前置要求

### 1. Node.js 环境
需要 Node.js 18+ 和 pnpm：

```bash
# 安装 pnpm（如果还没有）
npm install -g pnpm
```

### 2. Rust 工具链
Tauri 需要 Rust 编译环境：

**Windows:**
1. 访问 https://rustup.rs/ 下载安装
2. 或使用命令：
```powershell
# 下载并运行 rustup-init.exe
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**macOS/Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 3. 系统依赖

**Windows:**
- Microsoft Visual Studio C++ Build Tools
- WebView2 (Windows 10+ 自带)

**macOS:**
- Xcode Command Line Tools: `xcode-select --install`

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 开发模式

```bash
pnpm tauri dev
```

这会启动：
- Vite 开发服务器 (http://localhost:1420)
- Tauri 应用窗口（带热重载）

### 3. 生产构建

```bash
pnpm tauri build
```

构建产物：
- Windows: `src-tauri/target/release/bundle/nsis/*.exe`
- macOS: `src-tauri/target/release/bundle/dmg/*.dmg`
- Linux: `src-tauri/target/release/bundle/deb/*.deb` 或 `appimage/*.AppImage`

## 项目结构

```
prompt-manager/
├── src/                      # 前端源码
│   ├── components/          # React 组件
│   │   ├── PromptList.tsx   # Prompt 列表
│   │   ├── PromptEditor.tsx # 编辑器
│   │   ├── SearchBar.tsx    # 搜索栏
│   │   ├── TagFilter.tsx    # 标签筛选
│   │   └── VariableInput.tsx # 变量输入
│   ├── store/               # Zustand 状态管理
│   │   └── promptStore.ts   # Prompt 数据 Store
│   ├── api/                 # Tauri API 封装
│   │   └── prompt.ts        # Prompt CRUD 接口
│   ├── utils/               # 工具函数
│   │   ├── variableParser.ts # 变量解析与替换
│   │   └── dateFormat.ts    # 日期格式化
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── src-tauri/               # Rust 后端
│   ├── src/
│   │   ├── main.rs          # 主入口，窗口管理、快捷键
│   │   ├── commands.rs      # Tauri Commands
│   │   ├── db.rs            # SQLite 数据库层
│   │   └── models.rs        # 数据模型
│   ├── migrations/          # 数据库迁移
│   │   └── 001_init.sql     # 初始化表结构
│   ├── Cargo.toml           # Rust 依赖配置
│   └── tauri.conf.json      # Tauri 配置
├── package.json             # Node.js 依赖
├── tsconfig.json            # TypeScript 配置
├── tailwind.config.js       # Tailwind 配置
├── vite.config.ts           # Vite 配置
└── CLAUDE.md                # 开发指南
```

## 使用说明

### 变量语法

在 Prompt 内容中使用以下语法定义变量：

| 语法 | 类型 | 示例 |
|------|------|------|
| `{{name}}` | 文本输入 | `你好，{{name}}` |
| `{{clipboard}}` | 系统剪贴板 | `分析这段代码：{{clipboard}}` |
| `{{date}}` | 当前日期 | `今天是 {{date}}` |
| `{{time}}` | 当前时间 | `现在是 {{time}}` |
| `{{tone\|正式,随意,友好}}` | 下拉选择 | `使用{{tone\|正式,随意}}的语气` |

### 快捷键

- `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS): 显示/隐藏窗口

### 数据库位置

- Windows: `C:\Users\{用户名}\AppData\Roaming\com.promptmanager.app\prompt-manager.db`
- macOS: `~/Library/Application Support/com.promptmanager.app/prompt-manager.db`
- Linux: `~/.local/share/com.promptmanager.app/prompt-manager.db`

## 开发阶段

### ✅ Skeleton 阶段
- [x] Tauri 项目初始化
- [x] 全局快捷键 (Ctrl+Shift+P)
- [x] 窗口显示/隐藏

### ✅ MVP 阶段（当前）
- [x] Prompt CRUD 操作
- [x] 标签系统
- [x] 变量替换引擎
- [x] 搜索功能
- [x] SQLite 数据库
- [x] 基础 UI 组件

### 🚧 Advanced 阶段（待开发）
- [ ] 版本历史查看与回滚 UI
- [ ] Diff 对比可视化
- [ ] 数据导入/导出 (JSON)
- [ ] 使用统计分析

### 🚧 Polish 阶段（待开发）
- [ ] 页面过渡动画优化
- [ ] 深色模式切换 UI
- [ ] 拖拽排序
- [ ] 键盘快捷键支持

## 常见问题

### Q: 编译失败 "cargo not found"
A: 需要先安装 Rust 工具链，参考上面的「安装前置要求」

### Q: 如何修改快捷键？
A: 编辑 `src-tauri/tauri.conf.json` 中的 `plugins.globalShortcut.shortcuts`

### Q: 数据如何备份？
A: 直接复制数据库文件 `prompt-manager.db`（位置见上）

### Q: 支持哪些平台？
A: Windows 10+, macOS 10.15+, Linux (各主流发行版)

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

# Prompt Manager - 开发指南

本文档面向开发者，提供项目开发、调试和贡献的详细指南。

## 目录

- [环境准备](#环境准备)
- [项目结构](#项目结构)
- [开发流程](#开发流程)
- [技术细节](#技术细节)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)

## 环境准备

### 必需环境

1. **Node.js 18+**
   ```bash
   node --version  # 应该 >= 18.0.0
   ```

2. **pnpm**
   ```bash
   npm install -g pnpm
   pnpm --version
   ```

3. **Rust 工具链**

   **Windows:**
   ```powershell
   winget install Rustlang.Rustup
   # 或访问 https://rustup.rs/
   ```

   **macOS/Linux:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

4. **系统依赖**

   **Windows:**
   - Visual Studio Build Tools
   - WebView2 Runtime (Win 10+ 自带)

   **macOS:**
   ```bash
   xcode-select --install
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.1-dev \
     build-essential curl wget file \
     libssl-dev libayatana-appindicator3-dev librsvg2-dev
   ```

### 可选工具

- **VS Code** + 推荐扩展：
  - Tauri
  - rust-analyzer
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Error Lens

- **数据库工具**
  - DB Browser for SQLite
  - SQLite Viewer (VS Code 扩展)

## 项目结构

### 前端架构

```
src/
├── components/           # React 组件
│   ├── PromptList.tsx   # 状态：prompts, filteredPrompts
│   ├── PromptEditor.tsx # 状态：currentPrompt, variableValues
│   ├── HistoryViewer.tsx# 状态：history, selectedVersion
│   ├── ToastContainer.tsx
│   ├── SettingsMenu.tsx
│   └── ...
├── store/               # 状态管理
│   ├── promptStore.ts   # Prompt 数据和业务逻辑
│   ├── toastStore.ts    # Toast 通知队列
│   └── themeStore.ts    # 主题配置
├── api/                 # Tauri API 封装
│   ├── prompt.ts        # invoke('command')
│   └── importExport.ts
├── utils/               # 纯函数工具
│   ├── variableParser.ts
│   ├── diffViewer.ts
│   └── dateFormat.ts
├── hooks/               # 自定义 Hooks
│   └── useKeyboardShortcut.ts
└── App.tsx              # 根组件
```

### 后端架构

```
src-tauri/
├── src/
│   ├── main.rs          # 应用入口，窗口管理
│   ├── commands.rs      # #[tauri::command] 导出函数
│   ├── db.rs            # Database struct，CRUD 方法
│   ├── models.rs        # Rust 数据结构
│   └── import_export.rs # 文件 I/O 操作
├── migrations/
│   └── 001_init.sql     # 数据库 Schema
├── Cargo.toml           # Rust 依赖配置
└── tauri.conf.json      # Tauri 应用配置
```

## 开发流程

### 1. 克隆并安装

```bash
# 克隆仓库
git clone <repo-url>
cd prompt-manager

# 安装依赖
pnpm install
```

### 2. 开发模式

**启动开发服务器:**

```bash
pnpm tauri dev
```

这会：
1. 启动 Vite 开发服务器 (http://localhost:1420)
2. 编译 Rust 代码
3. 打开 Tauri 应用窗口
4. 启用热重载（前端代码修改自动刷新）

**仅前端开发（无 Rust）:**

```bash
pnpm dev
```

注意：Tauri API 调用会失败，适合纯 UI 开发。

### 3. 代码规范

**TypeScript/React:**
- 使用 functional components + hooks
- 所有组件使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化

**Rust:**
- 使用 `cargo fmt` 格式化
- 遵循 Clippy 建议
- async/await 异步模式
- 错误使用 `Result<T, E>` 处理

### 4. 提交代码

```bash
# 检查 TypeScript 类型
pnpm run build

# 格式化代码（如果有配置）
pnpm run format

# 提交
git add .
git commit -m "feat: 添加新功能"
git push
```

### 5. 构建发布

```bash
# 生产构建
pnpm tauri build

# 输出位置
# Windows: src-tauri/target/release/bundle/nsis/*.exe
# macOS:   src-tauri/target/release/bundle/dmg/*.dmg
# Linux:   src-tauri/target/release/bundle/deb/*.deb
```

## 技术细节

### Zustand Store 模式

```typescript
// promptStore.ts
export const usePromptStore = create<PromptStore>((set, get) => ({
  // State
  prompts: [],
  currentPrompt: null,

  // Actions
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

  // Computed
  filteredPrompts: () => {
    const { prompts, searchQuery } = get()
    return prompts.filter(/* ... */)
  }
}))
```

**使用方式:**
```typescript
function Component() {
  const { prompts, setCurrentPrompt } = usePromptStore()
  const filtered = usePromptStore(state => state.filteredPrompts())
}
```

### Tauri Command 模式

**后端定义:**
```rust
// src-tauri/src/commands.rs
#[tauri::command]
pub async fn create_prompt(
    db: State<'_, Database>,
    input: CreatePromptInput,
) -> Result<Prompt, String> {
    // ...
}

// 注册到 main.rs
.invoke_handler(tauri::generate_handler![
    commands::create_prompt,
])
```

**前端调用:**
```typescript
// src/api/prompt.ts
import { invoke } from '@tauri-apps/api/core'

export const promptApi = {
  async createPrompt(input: CreatePromptInput): Promise<Prompt> {
    return await invoke('create_prompt', { input })
  }
}
```

### SQLite 数据库操作

**查询示例:**
```rust
// 单条查询
let row = sqlx::query("SELECT * FROM prompts WHERE id = ?")
    .bind(id)
    .fetch_optional(&self.pool)
    .await?;

// 批量查询
let rows = sqlx::query("SELECT * FROM prompts ORDER BY updated_at DESC")
    .fetch_all(&self.pool)
    .await?;

// 插入
sqlx::query("INSERT INTO prompts (id, title, content) VALUES (?, ?, ?)")
    .bind(&id)
    .bind(&title)
    .bind(&content)
    .execute(&self.pool)
    .await?;
```

### 变量替换引擎

```typescript
// 解析 {{variable}} 模式
const regex = /\{\{(\w+(?:\|[^}]+)?)\}\}/g

// 提取变量名
const matches = content.matchAll(regex)
for (const match of matches) {
  const fullMatch = match[1]  // "tone|formal,casual"
  const varName = fullMatch.split('|')[0]  // "tone"
  const options = fullMatch.split('|')[1]?.split(',')  // ["formal", "casual"]
}

// 替换变量
content.replace(/\{\{clipboard\}\}/g, clipboardValue)
```

### Diff 算法

使用 `diff-match-patch` 库：

```typescript
import DiffMatchPatch from 'diff-match-patch'

const dmp = new DiffMatchPatch()
const diffs = dmp.diff_main(oldText, newText)
dmp.diff_cleanupSemantic(diffs)

// diffs: Array<[operation, text]>
// operation: -1 (删除), 0 (相同), 1 (插入)
```

## 调试技巧

### 前端调试

**开发工具:**
```bash
pnpm tauri dev
# 窗口打开后按 F12 或 Ctrl+Shift+I
```

**Console 日志:**
```typescript
console.log('Debug:', data)
console.error('Error:', error)
```

**React DevTools:**
- 安装浏览器扩展
- 在 Tauri 窗口中使用

### 后端调试

**Rust 日志:**
```rust
println!("Debug: {:?}", variable);
eprintln!("Error: {}", error);
```

**查看编译错误:**
```bash
cargo build 2>&1 | less
```

**SQLite 调试:**
```rust
// 查看生成的 SQL
let sql = sqlx::query("SELECT * FROM prompts")
    .sql();
println!("SQL: {}", sql);
```

### 数据库调试

**查看数据库文件:**

Windows:
```powershell
# 找到数据库
cd $env:APPDATA\com.promptmanager.app
# 使用 DB Browser for SQLite 打开
```

**SQL 查询:**
```sql
-- 查看所有 Prompt
SELECT * FROM prompts ORDER BY updated_at DESC;

-- 查看标签使用情况
SELECT t.name, COUNT(*) as count
FROM tags t
JOIN prompt_tags pt ON t.id = pt.tag_id
GROUP BY t.id
ORDER BY count DESC;

-- 查看版本历史
SELECT p.title, h.version_id, h.timestamp
FROM prompts p
JOIN prompt_history h ON p.id = h.prompt_id
ORDER BY h.timestamp DESC
LIMIT 10;
```

## 常见问题

### Q: 编译失败 "cargo not found"

**A:** 需要安装 Rust 工具链。

```bash
# Windows
winget install Rustlang.Rustup

# 重启终端后
rustc --version
```

### Q: 前端修改不生效

**A:** 确保 `pnpm tauri dev` 正在运行，Vite 会自动热重载。

如果不生效：
1. 检查终端是否有错误
2. 刷新窗口 (Ctrl+R)
3. 重启开发服务器

### Q: 数据库迁移失败

**A:** 删除旧数据库重新创建。

```bash
# Windows
rm $env:APPDATA\com.promptmanager.app\prompt-manager.db

# macOS/Linux
rm ~/Library/Application\ Support/com.promptmanager.app/prompt-manager.db
```

### Q: Tauri API 调用 "command not found"

**A:** 检查：
1. Command 是否在 `commands.rs` 中定义
2. 是否在 `main.rs` 中注册到 `invoke_handler`
3. 前端调用的命令名是否匹配（snake_case）

### Q: 窗口无法显示

**A:** 检查 `tauri.conf.json`:
```json
{
  "app": {
    "windows": [{
      "visible": true  // 改为 true
    }]
  }
}
```

## 贡献指南

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

### Pull Request 流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码审查清单

- [ ] TypeScript 无类型错误
- [ ] 所有组件有适当的 prop types
- [ ] 错误处理完善
- [ ] Toast 反馈友好
- [ ] 无 console.log 残留
- [ ] 代码格式正确
- [ ] 功能正常工作

## 相关资源

### 官方文档
- [Tauri 2.0 文档](https://v2.tauri.app/)
- [React 文档](https://react.dev/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

### 工具
- [Tauri Studio](https://tauri.studio/)
- [SQLite Browser](https://sqlitebrowser.org/)
- [Rust Playground](https://play.rust-lang.org/)

### 社区
- [Tauri Discord](https://discord.com/invite/tauri)
- [Rust 中文社区](https://rustcc.cn/)
- [React 中文社区](https://zh-hans.react.dev/)

---

有问题欢迎提 Issue 或加入讨论！

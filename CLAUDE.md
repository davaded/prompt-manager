# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prompt Manager - 桌面端 Prompt 管理工具，支持变量替换、版本历史追踪、标签分类。基于 Tauri 2.0 构建。

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop | Tauri 2.0 (Rust backend) |
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand |
| Database | SQLite (SQLx) |
| Diff | diff-match-patch |

## Build Commands

```bash
pnpm install          # Install dependencies
pnpm tauri dev        # Development with hot reload
pnpm tauri build      # Production build
pnpm dev              # Frontend only
```

## Data Model

```json
{
  "id": "uuid",
  "title": "string",
  "tags": ["string"],
  "content": "Prompt with {{variable}} placeholders",
  "variables": [
    { "key": "clipboard", "type": "system_clipboard" },
    { "key": "tone", "type": "select", "options": [...], "default": "..." }
  ],
  "meta": { "created_at": timestamp, "updated_at": timestamp, "usage_count": number },
  "history": [{ "version_id": "v1", "timestamp": ..., "content": "...", "diff_summary": "..." }]
}
```

## Variable System

| Syntax | Type | Description |
|--------|------|-------------|
| `{{variable}}` | text | 用户输入文本 |
| `{{clipboard}}` | system_clipboard | 系统剪贴板内容 |
| `{{date}}` | system | 当前日期 |
| `{{time}}` | system | 当前时间 |
| `{{var\|options}}` | select | 下拉选择，支持预设选项和默认值 |

## Architecture

### Frontend → Backend Communication
- Tauri Commands: 前端通过 `invoke()` 调用 Rust 函数
- Tauri Events: 后端推送事件到前端

### Core Modules
- **PromptStore**: Zustand store 管理 Prompt 列表和当前编辑状态
- **VariableParser**: 解析并替换 `{{}}` 变量
- **HistoryManager**: 版本对比与回滚（diff-match-patch）
- **HotkeyService**: 全局快捷键监听

## Development Phases

1. **Skeleton**: Tauri 环境 + 全局快捷键唤起/隐藏窗口
2. **MVP**: CRUD + 标签系统 + 变量替换 + 搜索
3. **Advanced**: 时光机 + 数据导入导出
4. **Polish**: 动画优化 + 深色模式

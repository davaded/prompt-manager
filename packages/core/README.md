# @prompt-manager/core

Prompt Manager 的核心领域模块（无 UI 依赖）。

## 包含能力

- 变量提取：`parseVariables`
- 变量自动识别：`autoDetectVariables`
- 模板渲染：`renderPrompt`
- 规格校验：`validatePromptSpec`

## 设计约束

- 不依赖 Tauri / React
- 可同时复用于 Desktop / CLI / Web API

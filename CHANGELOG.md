# Changelog

All notable changes to Prompt Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-15

### 🎉 Initial Release

#### Added - Core Features
- **Prompt Management**
  - Create, read, update, and delete prompts
  - Auto-save on blur
  - Real-time content preview
  - Prompt usage tracking

- **Variable System**
  - Text input variables `{{name}}`
  - Dropdown selection `{{tone|formal,casual}}`
  - System clipboard integration `{{clipboard}}`
  - System date/time `{{date}}`, `{{time}}`
  - Auto-detection from content
  - Real-time variable replacement
  - One-click copy to clipboard

- **Tag Management**
  - Multi-tag support
  - Tag-based filtering
  - Tag creation and deletion
  - Visual tag chips

- **Search Functionality**
  - Full-text search across titles, content, and tags
  - Real-time filtering
  - Search result highlighting

#### Added - Advanced Features
- **Version History**
  - Automatic version saving on every update
  - Visual diff viewer with syntax highlighting
  - Compare with current or previous version
  - One-click version restoration
  - Version timeline with timestamps

- **Data Import/Export**
  - Export all prompts to JSON format
  - Import prompts from JSON files
  - Bulk data migration support
  - Import progress feedback

- **Toast Notifications**
  - Success/Error/Warning/Info message types
  - Auto-dismiss with configurable duration
  - Manual dismiss option
  - Smooth animations
  - Non-blocking UI

#### Added - UI/UX
- **Theme System**
  - Light mode
  - Dark mode
  - System theme auto-detection
  - Theme persistence
  - Smooth theme transitions

- **Keyboard Shortcuts**
  - `Ctrl+Shift+P` / `Cmd+Shift+P`: Toggle window visibility
  - `Ctrl+,`: Open settings
  - `Enter`: Add tag
  - Custom keyboard shortcut hook

- **Animations**
  - Framer Motion integration
  - List item fade-in animations
  - Modal popup animations
  - Smooth page transitions

- **User Experience**
  - Loading states for all async operations
  - Empty state illustrations
  - Inline error messages
  - Responsive layout
  - Accessibility improvements

#### Technical
- **Frontend Stack**
  - React 18.3 with TypeScript 5.3
  - Tailwind CSS 3.4 for styling
  - Zustand 4.5 for state management
  - Framer Motion 11.0 for animations
  - Vite 5.4 as build tool

- **Backend Stack**
  - Tauri 2.0 framework
  - Rust backend with async/await
  - SQLite database with SQLx
  - Tauri plugins: clipboard, dialog, global-shortcut

- **Database Schema**
  - 5 core tables with proper relationships
  - Optimized indexes for queries
  - Migration system with SQL scripts

- **Architecture**
  - Component-based React architecture
  - Centralized state management
  - API abstraction layer
  - Utility function modules
  - Custom hooks for reusable logic

### 🔧 Configuration
- **Application Settings**
  - Default window size: 900x700
  - Minimum window size: 600x400
  - Window always centered on launch
  - Window hidden (not closed) on close button

- **Data Storage**
  - Windows: `%APPDATA%\com.promptmanager.app\`
  - macOS: `~/Library/Application Support/com.promptmanager.app/`
  - Linux: `~/.local/share/com.promptmanager.app/`

### 📝 Documentation
- Comprehensive README with installation guide
- Project structure documentation
- API reference in code comments
- Development setup instructions
- Troubleshooting guide

### 🐛 Known Issues
- Requires Rust toolchain for compilation
- Windows WebView2 dependency (pre-installed on Win 10+)
- macOS requires Xcode Command Line Tools

### 🔮 Future Enhancements
See PROJECT_SUMMARY.md for planned features and potential improvements.

---

## Version History

### [Unreleased]
- To be determined based on user feedback

### [0.1.0] - 2024-01-15
- Initial release with complete MVP functionality

---

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details

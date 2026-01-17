# Cursor IDE Tutorial App 🎓

An interactive, realistic replica of the Cursor IDE interface designed to teach new users how to use Cursor's AI-powered features.

![Cursor Tutorial Preview](https://via.placeholder.com/800x500/1e1e1e/cccccc?text=Cursor+Tutorial+App)

## Features

This tutorial app replicates the **actual Cursor IDE interface** including:

### 🖥️ Realistic IDE Components
- **Title Bar** - macOS-style window controls
- **Activity Bar** - File explorer, search, git, extensions icons
- **Sidebar** - Expandable file tree with realistic project structure
- **Editor Tabs** - Multiple open files with close buttons
- **Code Editor** - Syntax highlighting, line numbers, minimap
- **Status Bar** - Git branch, errors, language mode

### 🤖 AI Feature Demos
- **AI Chat (⌘L)** - Interactive chat panel with simulated responses
- **Inline Edit (⌘K)** - Code editing popup with quick actions
- **Composer (⌘I)** - Multi-file editing modal
- **Command Palette (⌘⇧P)** - Searchable command interface

### 📚 Guided Tutorial
- **Step-by-step walkthrough** of all major features
- **Interactive hints** showing keyboard shortcuts
- **Progress tracking** through tutorial steps
- **Welcome modal** with feature overview

## Quick Start

```bash
# Navigate to the tutorial app
cd cursor-tutorial-app

# Install dependencies
npm install

# Start the development server
npm run dev

# Open in browser
open http://localhost:5173
```

## Keyboard Shortcuts (Demo)

These shortcuts work within the tutorial app:

| Shortcut | Action |
|----------|--------|
| `⌘L` / `Ctrl+L` | Open AI Chat |
| `⌘K` / `Ctrl+K` | Inline Edit |
| `⌘I` / `Ctrl+I` | Open Composer |
| `⌘⇧P` / `Ctrl+Shift+P` | Command Palette |
| `⌃\`` / `Ctrl+\`` | Toggle Terminal |
| `⌘B` / `Ctrl+B` | Toggle Sidebar |
| `Escape` | Close modals |

## Project Structure

```
cursor-tutorial-app/
├── src/
│   ├── components/
│   │   ├── CursorIDELayout.tsx   # Main layout orchestrator
│   │   ├── TitleBar.tsx          # Window title bar
│   │   ├── ActivityBar.tsx       # Left icon bar
│   │   ├── Sidebar.tsx           # File explorer
│   │   ├── EditorTabs.tsx        # Open file tabs
│   │   ├── EditorContent.tsx     # Code editor with highlighting
│   │   ├── AIChat.tsx            # Chat panel (⌘L)
│   │   ├── InlineEdit.tsx        # Inline edit popup (⌘K)
│   │   ├── Composer.tsx          # Multi-file editor (⌘I)
│   │   ├── CommandPalette.tsx    # Command search (⌘⇧P)
│   │   ├── Terminal.tsx          # Integrated terminal
│   │   ├── StatusBar.tsx         # Bottom status bar
│   │   ├── TutorialOverlay.tsx   # Tutorial guide card
│   │   └── WelcomeModal.tsx      # Initial welcome screen
│   ├── context/
│   │   └── TutorialContext.tsx   # Tutorial state management
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind + custom styles
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Customization

### Adding New Tutorial Steps

Edit `src/context/TutorialContext.tsx`:

```tsx
const tutorialSteps: TutorialStep[] = [
  // ... existing steps
  {
    id: 'new-feature',
    title: 'New Feature Title',
    description: 'Description of the feature...',
    target: 'element-id',
    shortcut: '⌘X',
    action: 'What user should do',
    completed: false
  }
];
```

### Modifying File Tree

Edit the `fileTree` array in `src/components/Sidebar.tsx`:

```tsx
const fileTree: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: 'App.tsx', type: 'file' },
      // Add more files...
    ]
  }
];
```

### Adding Editor File Contents

Edit `fileContents` in `src/components/EditorContent.tsx`:

```tsx
const fileContents: Record<string, { content: string; language: string }> = {
  'NewFile.tsx': {
    language: 'typescript',
    content: `// Your file content here`
  }
};
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Use Cases

1. **Onboarding** - Introduce new team members to Cursor
2. **Training** - Teach AI coding workflows
3. **Documentation** - Interactive feature demos
4. **Presentations** - Show Cursor capabilities

## License

MIT - Feel free to use and modify for your team's needs.

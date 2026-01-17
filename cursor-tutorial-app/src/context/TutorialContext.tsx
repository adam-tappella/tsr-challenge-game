import { createContext, useContext, useState, ReactNode } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or component name
  action?: string; // What the user needs to do
  shortcut?: string;
  completed: boolean;
}

interface TutorialContextType {
  currentStep: number;
  steps: TutorialStep[];
  isActive: boolean;
  setCurrentStep: (step: number) => void;
  completeStep: (stepId: string) => void;
  startTutorial: () => void;
  endTutorial: () => void;
  highlightedElement: string | null;
  setHighlightedElement: (element: string | null) => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Cursor! 👋',
    description: 'Cursor is an AI-powered code editor. Let\'s explore its key features together.',
    target: 'welcome',
    completed: false
  },
  {
    id: 'file-explorer',
    title: 'File Explorer',
    description: 'The sidebar shows your project files. Click folders to expand them, and files to open them in the editor.',
    target: 'sidebar-explorer',
    action: 'Click on a file to open it',
    completed: false
  },
  {
    id: 'editor',
    title: 'Code Editor',
    description: 'This is where you write and edit code. Cursor provides syntax highlighting, auto-completion, and more.',
    target: 'editor-area',
    completed: false
  },
  {
    id: 'ai-chat',
    title: 'AI Chat (⌘L / Ctrl+L)',
    description: 'Open the AI chat panel to ask questions, get explanations, or request code changes. This is your AI pair programmer!',
    target: 'ai-chat',
    shortcut: '⌘L',
    action: 'Press ⌘L (or Ctrl+L) to open AI Chat',
    completed: false
  },
  {
    id: 'inline-edit',
    title: 'Inline Edit (⌘K / Ctrl+K)',
    description: 'Select code and press ⌘K to edit it inline with AI. Describe what you want to change and AI will do it.',
    target: 'inline-edit',
    shortcut: '⌘K',
    action: 'Select code and press ⌘K',
    completed: false
  },
  {
    id: 'composer',
    title: 'Composer (⌘I / Ctrl+I)',
    description: 'Composer lets AI make changes across multiple files at once. Perfect for larger refactoring tasks.',
    target: 'composer',
    shortcut: '⌘I',
    action: 'Press ⌘I to open Composer',
    completed: false
  },
  {
    id: 'terminal',
    title: 'Integrated Terminal',
    description: 'Open the terminal to run commands without leaving Cursor. Use ⌃` (Ctrl+`) to toggle it.',
    target: 'terminal',
    shortcut: '⌃`',
    action: 'Press ⌃` to toggle terminal',
    completed: false
  },
  {
    id: 'command-palette',
    title: 'Command Palette (⌘⇧P)',
    description: 'Access any command quickly. Search for actions, settings, and more.',
    target: 'command-palette',
    shortcut: '⌘⇧P',
    action: 'Press ⌘⇧P to open Command Palette',
    completed: false
  },
  {
    id: 'cursor-rules',
    title: '.cursorrules File',
    description: 'Create a .cursorrules file to give AI context about your project\'s coding standards and patterns.',
    target: 'cursorrules',
    completed: false
  },
  {
    id: 'settings',
    title: 'Settings (⚙️)',
    description: 'Customize Cursor to your preferences. Click the settings icon in the activity bar to configure themes, AI models, editor options, and more.',
    target: 'settings-button',
    action: 'Click the settings icon to open Settings',
    completed: false
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🎉',
    description: 'You now know the essentials of Cursor. Start coding and let AI help you build amazing things!',
    target: 'complete',
    completed: false
  }
];

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(tutorialSteps);
  const [isActive, setIsActive] = useState(true);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  const completeStep = (stepId: string) => {
    setSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const startTutorial = () => setIsActive(true);
  const endTutorial = () => setIsActive(false);

  return (
    <TutorialContext.Provider value={{
      currentStep,
      steps,
      isActive,
      setCurrentStep,
      completeStep,
      startTutorial,
      endTutorial,
      highlightedElement,
      setHighlightedElement
    }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}

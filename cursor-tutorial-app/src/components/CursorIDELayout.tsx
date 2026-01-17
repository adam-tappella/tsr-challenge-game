import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { EditorTabs } from './EditorTabs';
import { EditorContent } from './EditorContent';
import { AIChat } from './AIChat';
import { Terminal } from './Terminal';
import { StatusBar } from './StatusBar';
import { TitleBar } from './TitleBar';
import { ActivityBar } from './ActivityBar';
import { Composer } from './Composer';
import { CommandPalette } from './CommandPalette';
import { InlineEdit } from './InlineEdit';
import { TutorialOverlay } from './TutorialOverlay';
import { Settings } from './Settings';
import { useTutorial } from '../context/TutorialContext';

/**
 * Main Cursor IDE Layout
 * Replicates the actual Cursor IDE interface with all panels
 */
export function CursorIDELayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(400);
  const [composerOpen, setComposerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [inlineEditOpen, setInlineEditOpen] = useState(false);
  const [inlineEditPosition, setInlineEditPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('App.tsx');
  const [activeActivityItem, setActiveActivityItem] = useState('explorer');
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const { completeStep, currentStep, steps } = useTutorial();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      
      // ⌘L / Ctrl+L - AI Chat
      if (cmdKey && e.key === 'l') {
        e.preventDefault();
        setChatOpen(prev => !prev);
        if (steps[currentStep]?.id === 'ai-chat') {
          completeStep('ai-chat');
        }
      }
      
      // ⌘I / Ctrl+I - Composer
      if (cmdKey && e.key === 'i') {
        e.preventDefault();
        setComposerOpen(prev => !prev);
        if (steps[currentStep]?.id === 'composer') {
          completeStep('composer');
        }
      }
      
      // ⌘K / Ctrl+K - Inline Edit
      if (cmdKey && e.key === 'k') {
        e.preventDefault();
        setInlineEditOpen(prev => !prev);
        if (steps[currentStep]?.id === 'inline-edit') {
          completeStep('inline-edit');
        }
      }
      
      // ⌘⇧P / Ctrl+Shift+P - Command Palette
      if (cmdKey && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        if (steps[currentStep]?.id === 'command-palette') {
          completeStep('command-palette');
        }
      }
      
      // Ctrl+` - Terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setTerminalOpen(prev => !prev);
        if (steps[currentStep]?.id === 'terminal') {
          completeStep('terminal');
        }
      }
      
      // ⌘B / Ctrl+B - Toggle Sidebar
      if (cmdKey && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      
      // Escape - Close modals
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setInlineEditOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [completeStep, currentStep, steps]);

  return (
    <div className="flex flex-col h-full">
      {/* Title Bar */}
      <TitleBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar 
          activeItem={activeActivityItem}
          onItemClick={setActiveActivityItem}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={() => {
            setSettingsOpen(true);
            if (steps[currentStep]?.id === 'settings') {
              completeStep('settings');
            }
          }}
        />
        
        {/* Sidebar */}
        {sidebarOpen && (
          <Sidebar 
            width={sidebarWidth}
            activeTab={activeTab}
            onFileClick={(file) => {
              setActiveTab(file);
              if (steps[currentStep]?.id === 'file-explorer') {
                completeStep('file-explorer');
              }
            }}
            activeView={activeActivityItem}
          />
        )}
        
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Tabs */}
          <EditorTabs 
            activeTab={activeTab}
            onTabClick={setActiveTab}
            onTabClose={(tab) => {
              if (tab === activeTab) {
                setActiveTab('App.tsx');
              }
            }}
          />
          
          {/* Editor Content */}
          <div className="flex-1 overflow-hidden relative" id="editor-area" data-tutorial-target="editor-area">
            <EditorContent activeFile={activeTab} />
            
            {/* Inline Edit Overlay */}
            {inlineEditOpen && (
              <InlineEdit 
                position={inlineEditPosition}
                onClose={() => setInlineEditOpen(false)}
              />
            )}
          </div>
          
          {/* Terminal */}
          {terminalOpen && (
            <Terminal 
              height={terminalHeight}
              onClose={() => setTerminalOpen(false)}
            />
          )}
        </div>
        
        {/* AI Chat Panel */}
        {chatOpen && (
          <AIChat 
            width={chatWidth}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>
      
      {/* Status Bar */}
      <StatusBar 
        terminalOpen={terminalOpen}
        onTerminalClick={() => setTerminalOpen(!terminalOpen)}
      />
      
      {/* Composer Modal */}
      {composerOpen && (
        <Composer onClose={() => setComposerOpen(false)} />
      )}
      
      {/* Command Palette */}
      {commandPaletteOpen && (
        <CommandPalette onClose={() => setCommandPaletteOpen(false)} />
      )}
      
      {/* Settings */}
      {settingsOpen && (
        <Settings onClose={() => setSettingsOpen(false)} />
      )}
      
      {/* Tutorial Overlay */}
      <TutorialOverlay 
        onOpenChat={() => setChatOpen(true)}
        onOpenComposer={() => setComposerOpen(true)}
        onOpenTerminal={() => setTerminalOpen(true)}
      />
    </div>
  );
}

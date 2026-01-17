import { useState } from 'react';

interface SettingsProps {
  onClose: () => void;
}

interface SettingSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  settings: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'input' | 'textarea';
  value: any;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

/**
 * Settings Component
 * Comprehensive settings page/wizard for Cursor IDE configuration
 */
export function Settings({ onClose }: SettingsProps) {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General
    theme: 'dark',
    fontSize: '14',
    fontFamily: 'SF Mono',
    autoSave: true,
    formatOnSave: true,
    
    // Editor
    tabSize: '2',
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    bracketPairColorization: true,
    
    // AI Features
    aiModel: 'claude-3.5-sonnet',
    aiTemperature: '0.7',
    autoComplete: true,
    inlineSuggestions: true,
    codeActions: true,
    
    // Terminal
    terminalShell: 'zsh',
    terminalFontSize: '12',
    
    // Extensions
    extensionAutoUpdate: true,
    
    // Cursor Rules
    cursorRulesEnabled: true,
    cursorRulesPath: '.cursorrules'
  });

  const sections: SettingSection[] = [
    {
      id: 'general',
      title: 'General',
      icon: SettingsIcon,
      settings: [
        {
          id: 'theme',
          label: 'Color Theme',
          description: 'Choose your preferred color theme',
          type: 'select',
          value: settings.theme,
          options: [
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
            { label: 'High Contrast', value: 'high-contrast' }
          ]
        },
        {
          id: 'fontSize',
          label: 'Font Size',
          description: 'Editor font size in pixels',
          type: 'input',
          value: settings.fontSize,
          placeholder: '14'
        },
        {
          id: 'fontFamily',
          label: 'Font Family',
          description: 'Editor font family',
          type: 'input',
          value: settings.fontFamily,
          placeholder: 'SF Mono'
        },
        {
          id: 'autoSave',
          label: 'Auto Save',
          description: 'Automatically save files after delay',
          type: 'toggle',
          value: settings.autoSave
        },
        {
          id: 'formatOnSave',
          label: 'Format on Save',
          description: 'Format code when saving files',
          type: 'toggle',
          value: settings.formatOnSave
        }
      ]
    },
    {
      id: 'editor',
      title: 'Editor',
      icon: EditorIcon,
      settings: [
        {
          id: 'tabSize',
          label: 'Tab Size',
          description: 'Number of spaces per tab',
          type: 'input',
          value: settings.tabSize,
          placeholder: '2'
        },
        {
          id: 'wordWrap',
          label: 'Word Wrap',
          description: 'Wrap lines that exceed editor width',
          type: 'toggle',
          value: settings.wordWrap
        },
        {
          id: 'minimap',
          label: 'Minimap',
          description: 'Show code minimap on the right',
          type: 'toggle',
          value: settings.minimap
        },
        {
          id: 'lineNumbers',
          label: 'Line Numbers',
          description: 'Show line numbers in editor',
          type: 'toggle',
          value: settings.lineNumbers
        },
        {
          id: 'bracketPairColorization',
          label: 'Bracket Pair Colorization',
          description: 'Color matching brackets',
          type: 'toggle',
          value: settings.bracketPairColorization
        }
      ]
    },
    {
      id: 'ai',
      title: 'AI Features',
      icon: AIIcon,
      settings: [
        {
          id: 'aiModel',
          label: 'AI Model',
          description: 'Default AI model for code generation',
          type: 'select',
          value: settings.aiModel,
          options: [
            { label: 'Claude 3.5 Sonnet', value: 'claude-3.5-sonnet' },
            { label: 'Claude 3 Opus', value: 'claude-3-opus' },
            { label: 'GPT-4', value: 'gpt-4' }
          ]
        },
        {
          id: 'aiTemperature',
          label: 'AI Temperature',
          description: 'Creativity level (0.0 - 1.0)',
          type: 'input',
          value: settings.aiTemperature,
          placeholder: '0.7'
        },
        {
          id: 'autoComplete',
          label: 'AI Auto Complete',
          description: 'Show AI-powered code completions',
          type: 'toggle',
          value: settings.autoComplete
        },
        {
          id: 'inlineSuggestions',
          label: 'Inline Suggestions',
          description: 'Show inline AI code suggestions',
          type: 'toggle',
          value: settings.inlineSuggestions
        },
        {
          id: 'codeActions',
          label: 'Code Actions',
          description: 'Enable AI-powered code actions',
          type: 'toggle',
          value: settings.codeActions
        }
      ]
    },
    {
      id: 'terminal',
      title: 'Terminal',
      icon: TerminalIcon,
      settings: [
        {
          id: 'terminalShell',
          label: 'Shell',
          description: 'Default terminal shell',
          type: 'select',
          value: settings.terminalShell,
          options: [
            { label: 'zsh', value: 'zsh' },
            { label: 'bash', value: 'bash' },
            { label: 'fish', value: 'fish' },
            { label: 'PowerShell', value: 'powershell' }
          ]
        },
        {
          id: 'terminalFontSize',
          label: 'Terminal Font Size',
          description: 'Terminal font size in pixels',
          type: 'input',
          value: settings.terminalFontSize,
          placeholder: '12'
        }
      ]
    },
    {
      id: 'cursor-rules',
      title: 'Cursor Rules',
      icon: CursorRulesIcon,
      settings: [
        {
          id: 'cursorRulesEnabled',
          label: 'Enable Cursor Rules',
          description: 'Use .cursorrules file for AI context',
          type: 'toggle',
          value: settings.cursorRulesEnabled
        },
        {
          id: 'cursorRulesPath',
          label: 'Cursor Rules Path',
          description: 'Path to .cursorrules file',
          type: 'input',
          value: settings.cursorRulesPath,
          placeholder: '.cursorrules'
        }
      ]
    }
  ];

  const handleSettingChange = (id: string, value: any) => {
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const activeSectionData = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div 
        className="w-[900px] h-[600px] bg-[#1e1e1e] border border-[#3c3c3c] rounded-xl shadow-2xl overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
        id="settings"
      >
        {/* Sidebar */}
        <div className="w-48 bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-[#1e1e1e]">
            <h2 className="text-[14px] font-semibold text-white">Settings</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full px-4 py-2 flex items-center gap-3 text-left
                    transition-colors
                    ${isActive 
                      ? 'bg-[#094771] text-white' 
                      : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-[13px]">{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#3c3c3c] flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-[16px] font-semibold text-white flex items-center gap-2">
                <activeSectionData.icon className="w-5 h-5 text-[#6366f1]" />
                {activeSectionData.title}
              </h3>
              <p className="text-[12px] text-[#8b8b8b] mt-1">
                Configure {activeSectionData.title.toLowerCase()} preferences
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Settings List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {activeSectionData.settings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[14px] font-medium text-white block">
                        {setting.label}
                      </label>
                      {setting.description && (
                        <p className="text-[12px] text-[#8b8b8b] mt-0.5">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    
                    {setting.type === 'toggle' && (
                      <ToggleSwitch
                        checked={setting.value}
                        onChange={(checked) => handleSettingChange(setting.id, checked)}
                      />
                    )}
                    
                    {setting.type === 'select' && (
                      <select
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="px-3 py-1.5 bg-[#2d2d2d] border border-[#3c3c3c] rounded text-[13px] text-white focus:border-[#6366f1] outline-none"
                      >
                        {setting.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {setting.type === 'input' && (
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        placeholder={setting.placeholder}
                        className="w-32 px-3 py-1.5 bg-[#2d2d2d] border border-[#3c3c3c] rounded text-[13px] text-white focus:border-[#6366f1] outline-none"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#3c3c3c] bg-[#252526] flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-[#8b8b8b] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Reset to defaults
                  console.log('Reset settings');
                }}
                className="px-4 py-2 text-[13px] text-[#8b8b8b] hover:text-white transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  // Save settings
                  console.log('Save settings', settings);
                  onClose();
                }}
                className="px-4 py-2 bg-[#6366f1] text-white text-[13px] rounded font-medium hover:bg-[#5558e3] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative w-11 h-6 rounded-full transition-colors
        ${checked ? 'bg-[#6366f1]' : 'bg-[#3c3c3c]'}
      `}
    >
      <div
        className={`
          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
          transition-transform
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

// Icons
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function EditorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function AIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0L9.937 15.5z" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 3v10h16V3H0zm15 9H1V4h14v8zM3 6l3 2-3 2V6zm4 4h5v1H7v-1z" />
    </svg>
  );
}

function CursorRulesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
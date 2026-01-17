import { useState, useEffect, useRef } from 'react';

interface CommandPaletteProps {
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  category: string;
  icon?: string;
}

const commands: Command[] = [
  { id: 'file-open', label: 'Go to File...', shortcut: '⌘P', category: 'File' },
  { id: 'symbol', label: 'Go to Symbol in Workspace...', shortcut: '⌘T', category: 'Navigation' },
  { id: 'line', label: 'Go to Line...', shortcut: '⌃G', category: 'Navigation' },
  { id: 'settings', label: 'Preferences: Open Settings', shortcut: '⌘,', category: 'Preferences' },
  { id: 'theme', label: 'Preferences: Color Theme', shortcut: '⌘K ⌘T', category: 'Preferences' },
  { id: 'terminal', label: 'Terminal: Create New Terminal', shortcut: '⌃⇧`', category: 'Terminal' },
  { id: 'git-commit', label: 'Git: Commit', category: 'Git' },
  { id: 'git-push', label: 'Git: Push', category: 'Git' },
  { id: 'git-pull', label: 'Git: Pull', category: 'Git' },
  { id: 'format', label: 'Format Document', shortcut: '⇧⌥F', category: 'Editor' },
  { id: 'rename', label: 'Rename Symbol', shortcut: 'F2', category: 'Refactor' },
  { id: 'cursor-chat', label: 'Cursor: Open AI Chat', shortcut: '⌘L', category: 'Cursor AI' },
  { id: 'cursor-composer', label: 'Cursor: Open Composer', shortcut: '⌘I', category: 'Cursor AI' },
  { id: 'cursor-inline', label: 'Cursor: Inline Edit', shortcut: '⌘K', category: 'Cursor AI' },
  { id: 'cursor-rules', label: 'Cursor: Open .cursorrules', category: 'Cursor AI' },
  { id: 'reload', label: 'Developer: Reload Window', shortcut: '⌘R', category: 'Developer' },
];

/**
 * CommandPalette Component
 * Quick command search (⌘⇧P)
 */
export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      id="command-palette"
      data-tutorial-target="command-palette"
    >
      <div 
        className="w-[600px] bg-[#252526] rounded-lg border border-[#454545] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-[#3c3c3c]">
          <ChevronIcon className="w-4 h-4 text-[#858585] ml-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent px-2 py-3 text-[14px] text-white placeholder-[#8b8b8b] outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-1">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              <div className="px-3 py-1 text-[11px] text-[#8b8b8b] font-medium uppercase tracking-wider">
                {category}
              </div>
              {cmds.map((cmd, i) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                const isSelected = globalIndex === selectedIndex;
                return (
                  <div
                    key={cmd.id}
                    className={`
                      flex items-center justify-between px-3 py-1.5 cursor-pointer
                      ${isSelected ? 'bg-[#094771]' : 'hover:bg-[#2a2d2e]'}
                    `}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    onClick={onClose}
                  >
                    <span className="text-[13px] text-[#cccccc]">{cmd.label}</span>
                    {cmd.shortcut && (
                      <span className="text-[11px] text-[#8b8b8b]">{cmd.shortcut}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="px-3 py-4 text-center text-[13px] text-[#8b8b8b]">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7l.7-.7 5 5v.7l-5 5z" />
    </svg>
  );
}

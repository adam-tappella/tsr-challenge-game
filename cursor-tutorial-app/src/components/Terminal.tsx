import { useState, useRef, useEffect } from 'react';

interface TerminalProps {
  height: number;
  onClose: () => void;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

/**
 * Terminal Component
 * Integrated terminal panel at the bottom
 */
export function Terminal({ height, onClose }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Welcome to Cursor Terminal!' },
    { type: 'output', content: 'Type commands below. Try: npm run dev' },
    { type: 'output', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('Terminal');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newLines: TerminalLine[] = [
      ...lines,
      { type: 'input', content: `$ ${input}` }
    ];

    // Simulate command responses
    const cmd = input.trim().toLowerCase();
    
    if (cmd === 'npm run dev' || cmd === 'npm start') {
      newLines.push(
        { type: 'output', content: '' },
        { type: 'output', content: '  VITE v5.0.0  ready in 342 ms' },
        { type: 'output', content: '' },
        { type: 'output', content: '  ➜  Local:   http://localhost:5173/' },
        { type: 'output', content: '  ➜  Network: http://192.168.1.100:5173/' },
        { type: 'output', content: '  ➜  press h + enter to show help' },
      );
    } else if (cmd === 'npm install' || cmd === 'npm i') {
      newLines.push(
        { type: 'output', content: '' },
        { type: 'output', content: 'added 245 packages in 3s' },
        { type: 'output', content: '' },
        { type: 'output', content: '45 packages are looking for funding' },
        { type: 'output', content: '  run `npm fund` for details' },
      );
    } else if (cmd === 'ls' || cmd === 'dir') {
      newLines.push(
        { type: 'output', content: 'README.md        package.json     src/' },
        { type: 'output', content: 'node_modules/    tsconfig.json    public/' },
        { type: 'output', content: '.cursorrules     vite.config.ts   .cursor/' },
      );
    } else if (cmd === 'clear' || cmd === 'cls') {
      setLines([]);
      setInput('');
      return;
    } else if (cmd === 'help') {
      newLines.push(
        { type: 'output', content: '' },
        { type: 'output', content: 'Common commands:' },
        { type: 'output', content: '  npm run dev     Start development server' },
        { type: 'output', content: '  npm install     Install dependencies' },
        { type: 'output', content: '  npm run build   Build for production' },
        { type: 'output', content: '  ls / dir        List files' },
        { type: 'output', content: '  clear           Clear terminal' },
      );
    } else if (cmd.startsWith('git ')) {
      newLines.push(
        { type: 'output', content: 'On branch main' },
        { type: 'output', content: 'Your branch is up to date with \'origin/main\'.' },
      );
    } else {
      newLines.push(
        { type: 'error', content: `zsh: command not found: ${input.split(' ')[0]}` },
        { type: 'output', content: '(This is a demo terminal - try: npm run dev, ls, or help)' },
      );
    }

    setLines(newLines);
    setInput('');
  };

  return (
    <div 
      className="bg-[#1e1e1e] border-t border-[#252526] flex flex-col shrink-0"
      style={{ height }}
      id="terminal"
      data-tutorial-target="terminal"
    >
      {/* Header */}
      <div className="h-[35px] bg-[#252526] flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center">
          {['Problems', 'Output', 'Debug Console', 'Terminal'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-3 h-[35px] text-[13px] border-b-2 transition-colors
                ${activeTab === tab 
                  ? 'text-white border-[#007acc]' 
                  : 'text-[#969696] border-transparent hover:text-white'
                }
              `}
            >
              {tab}
              {tab === 'Problems' && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-[#4d4d4d] text-[10px] rounded-full">0</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white">
            <PlusIcon className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white">
            <SplitIcon className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white">
            <TrashIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Shell Tabs */}
      <div className="h-[26px] bg-[#181818] flex items-center px-2 border-b border-[#252526]">
        <div className="flex items-center gap-1 px-2 py-1 bg-[#1e1e1e] rounded-t text-[12px] text-white">
          <span className="text-[#89d185]">●</span>
          <span>zsh</span>
          <button className="ml-1 hover:bg-[#3c3c3c] rounded p-0.5">
            <CloseSmallIcon className="w-3 h-3 text-[#858585]" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-[13px] leading-[1.4]"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div 
            key={i} 
            className={`
              ${line.type === 'input' ? 'text-[#89d185]' : ''}
              ${line.type === 'error' ? 'text-[#f14c4c]' : ''}
              ${line.type === 'output' ? 'text-[#cccccc]' : ''}
            `}
          >
            {line.content}
          </div>
        ))}
        
        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-[#89d185]">$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#cccccc] caret-white"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z" />
    </svg>
  );
}

function CloseSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z" />
    </svg>
  );
}

function SplitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M14 1H3L2 2v11l1 1h11l1-1V2l-1-1zM8 13H3V2h5v11zm6 0H9V2h5v11z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z" />
    </svg>
  );
}

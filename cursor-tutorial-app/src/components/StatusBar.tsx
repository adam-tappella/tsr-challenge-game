interface StatusBarProps {
  terminalOpen: boolean;
  onTerminalClick: () => void;
}

/**
 * StatusBar Component
 * The bottom status bar with git, errors, and other info
 */
export function StatusBar({ terminalOpen, onTerminalClick }: StatusBarProps) {
  return (
    <div className="h-[22px] bg-[#007acc] flex items-center justify-between text-[12px] text-white shrink-0 select-none">
      {/* Left Section */}
      <div className="flex items-center h-full">
        <button className="px-2 h-full flex items-center gap-1 hover:bg-[#1f8ad2] transition-colors">
          <GitBranchIcon className="w-3.5 h-3.5" />
          <span>main</span>
        </button>
        
        <button className="px-2 h-full flex items-center gap-1 hover:bg-[#1f8ad2] transition-colors">
          <SyncIcon className="w-3.5 h-3.5" />
        </button>
        
        <button className="px-2 h-full flex items-center gap-1 hover:bg-[#1f8ad2] transition-colors">
          <ErrorIcon className="w-3.5 h-3.5" />
          <span>0</span>
          <WarningIcon className="w-3.5 h-3.5 ml-1" />
          <span>0</span>
        </button>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center h-full">
        <button className="px-2 h-full flex items-center gap-1 hover:bg-[#1f8ad2] transition-colors">
          <span>Ln 1, Col 1</span>
        </button>
        
        <button className="px-2 h-full flex items-center hover:bg-[#1f8ad2] transition-colors">
          <span>Spaces: 2</span>
        </button>
        
        <button className="px-2 h-full flex items-center hover:bg-[#1f8ad2] transition-colors">
          <span>UTF-8</span>
        </button>
        
        <button className="px-2 h-full flex items-center hover:bg-[#1f8ad2] transition-colors">
          <span>TypeScript JSX</span>
        </button>
        
        <button className="px-2 h-full flex items-center gap-1 hover:bg-[#1f8ad2] transition-colors">
          <CursorIcon className="w-3.5 h-3.5" />
          <span>Cursor</span>
        </button>
        
        <button 
          onClick={onTerminalClick}
          className={`px-2 h-full flex items-center gap-1 transition-colors ${terminalOpen ? 'bg-[#1f8ad2]' : 'hover:bg-[#1f8ad2]'}`}
        >
          <TerminalIcon className="w-3.5 h-3.5" />
        </button>
        
        <button className="px-2 h-full flex items-center hover:bg-[#1f8ad2] transition-colors">
          <BellIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// Icons
function GitBranchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25zM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM3.5 3.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0z" />
    </svg>
  );
}

function SyncIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M2.006 8.267L.78 9.5 0 8.73l2.09-2.07.76.01 2.09 2.12-.76.76-1.167-1.18a5 5 0 0 0 9.4 1.983l.813.597a6 6 0 0 1-11.22-2.683zm10.99-.5L11.76 6.55l-.76.76 2.09 2.11.76.01 2.09-2.07-.75-.76-1.167 1.18a5 5 0 0 0-9.4-1.983l-.813-.597a6 6 0 0 1 11.22 2.683l.007-.107z" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 8a5 5 0 1 1 10 0A5 5 0 0 1 3 8zm4-2h2v4H7V6zm0 5h2v1H7v-1z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.56 1h.88l6.54 12.26-.44.74H1.44L1 13.26 7.56 1zM8 2.28L2.28 13H13.7L8 2.28zM8.625 12v-1h-1.25v1h1.25zm-1.25-2V6h1.25v4h-1.25z" />
    </svg>
  );
}

function CursorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" />
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

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.377 10.573a7.63 7.63 0 0 1-.383-2.38V6.195a5.115 5.115 0 0 0-1.268-3.446 5.138 5.138 0 0 0-3.242-1.722c-.694-.072-1.4 0-2.07.227-.67.215-1.28.574-1.794 1.053a4.923 4.923 0 0 0-1.208 1.675 5.067 5.067 0 0 0-.431 2.022v2.2a7.61 7.61 0 0 1-.383 2.37L2 12.343l.479.658h3.505c0 .526.215 1.04.586 1.412.37.37.885.586 1.412.586.526 0 1.04-.215 1.411-.586s.587-.886.587-1.412h3.505l.478-.658-.586-1.77zm-4.69 3.147a.997.997 0 0 1-.705.299.997.997 0 0 1-.706-.3.997.997 0 0 1-.3-.705h1.999a.939.939 0 0 1-.287.706zm5.515-1.71H1.81l.18-.537a8.314 8.314 0 0 0 .42-2.565V6.195c0-.618.114-1.223.34-1.792a4.26 4.26 0 0 1 1.036-1.44 4.438 4.438 0 0 1 1.549-.906 4.48 4.48 0 0 1 1.78-.196c1.041.105 2.016.545 2.78 1.246a4.394 4.394 0 0 1 1.09 2.96v1.94c0 .88.144 1.749.42 2.578l.18.524z" />
    </svg>
  );
}

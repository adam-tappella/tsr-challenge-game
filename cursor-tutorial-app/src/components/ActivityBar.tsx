interface ActivityBarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

/**
 * ActivityBar Component
 * The vertical icon bar on the left side of Cursor
 */
export function ActivityBar({ activeItem, onItemClick, onToggleSidebar, onOpenSettings }: ActivityBarProps) {
  const items = [
    { id: 'explorer', icon: FileIcon, label: 'Explorer' },
    { id: 'search', icon: SearchIcon, label: 'Search' },
    { id: 'git', icon: GitIcon, label: 'Source Control' },
    { id: 'debug', icon: DebugIcon, label: 'Run and Debug' },
    { id: 'extensions', icon: ExtensionsIcon, label: 'Extensions' },
  ];

  return (
    <div className="w-12 bg-[#333333] border-r border-[#252526] flex flex-col items-center py-1 shrink-0">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (activeItem === item.id) {
                onToggleSidebar();
              } else {
                onItemClick(item.id);
              }
            }}
            className={`
              w-12 h-12 flex items-center justify-center
              transition-colors relative group
              ${isActive ? 'text-white' : 'text-[#858585] hover:text-white'}
            `}
            title={item.label}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r" />
            )}
            <Icon className="w-6 h-6" />
          </button>
        );
      })}
      
      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center pb-2">
        <button 
          className="w-12 h-12 flex items-center justify-center text-[#858585] hover:text-white transition-colors"
          title="Cursor Settings"
        >
          <CursorIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={onOpenSettings}
          className="w-12 h-12 flex items-center justify-center text-[#858585] hover:text-white transition-colors"
          title="Settings"
          id="settings-button"
          data-tutorial-target="settings-button"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Icons
function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="6" />
      <path d="M21 21L16.65 16.65" />
    </svg>
  );
}

function GitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="6" cy="18" r="2" />
      <path d="M6 8V16" />
      <path d="M18 8V16" />
      <path d="M6 12H18" />
    </svg>
  );
}

function DebugIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2L8 5" />
      <path d="M16 2L16 5" />
      <path d="M3 10H6" />
      <path d="M18 10H21" />
      <path d="M3 16H6" />
      <path d="M18 16H21" />
      <rect x="6" y="5" width="12" height="14" rx="4" />
      <path d="M12 9V14" />
      <path d="M9 12H15" />
    </svg>
  );
}

function ExtensionsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
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

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

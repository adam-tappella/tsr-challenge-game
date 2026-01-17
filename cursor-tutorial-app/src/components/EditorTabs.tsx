interface EditorTabsProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
  onTabClose: (tab: string) => void;
}

const openTabs = ['App.tsx', 'index.css', '.cursorrules'];

/**
 * EditorTabs Component
 * Tab bar for open files, just like in Cursor/VS Code
 */
export function EditorTabs({ activeTab, onTabClick, onTabClose }: EditorTabsProps) {
  return (
    <div className="h-[35px] bg-[#252526] flex items-end border-b border-[#1e1e1e] shrink-0 overflow-x-auto">
      {openTabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <div
            key={tab}
            onClick={() => onTabClick(tab)}
            className={`
              group flex items-center gap-2 h-[35px] px-3 cursor-pointer border-r border-[#252526]
              ${isActive 
                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]' 
                : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2d2d2d]'
              }
            `}
          >
            <FileTypeIcon filename={tab} />
            <span className="text-[13px] whitespace-nowrap">{tab}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab);
              }}
              className={`
                w-5 h-5 flex items-center justify-center rounded
                ${isActive 
                  ? 'hover:bg-[#3d3d3d] opacity-100' 
                  : 'opacity-0 group-hover:opacity-100 hover:bg-[#3d3d3d]'
                }
              `}
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
      
      {/* Empty space to fill the rest */}
      <div className="flex-1 bg-[#252526]" />
    </div>
  );
}

function FileTypeIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const colors: Record<string, string> = {
    tsx: '#3178c6',
    ts: '#3178c6',
    css: '#563d7c',
    cursorrules: '#42a5f5',
  };
  
  const color = colors[ext || ''] || '#8b8b8b';
  
  return (
    <div className="w-4 h-4 flex items-center justify-center">
      <div 
        className="w-3 h-3 rounded-sm"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z" />
    </svg>
  );
}

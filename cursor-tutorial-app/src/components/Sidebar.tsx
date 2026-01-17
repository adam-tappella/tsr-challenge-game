import { useState } from 'react';

interface SidebarProps {
  width: number;
  activeTab: string;
  onFileClick: (file: string) => void;
  activeView: string;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  icon?: string;
}

const fileTree: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Button.tsx', type: 'file' },
          { name: 'Card.tsx', type: 'file' },
          { name: 'Header.tsx', type: 'file' },
        ]
      },
      {
        name: 'hooks',
        type: 'folder',
        children: [
          { name: 'useData.ts', type: 'file' },
        ]
      },
      { name: 'App.tsx', type: 'file' },
      { name: 'main.tsx', type: 'file' },
      { name: 'index.css', type: 'file' },
    ]
  },
  {
    name: '.cursor',
    type: 'folder',
    children: [
      {
        name: 'rules',
        type: 'folder',
        children: [
          { name: 'tech-stack.mdc', type: 'file' },
        ]
      }
    ]
  },
  { name: '.cursorrules', type: 'file' },
  { name: 'package.json', type: 'file' },
  { name: 'tsconfig.json', type: 'file' },
  { name: 'README.md', type: 'file' },
];

/**
 * Sidebar Component
 * File explorer, search, git, and extensions panels
 */
export function Sidebar({ width, activeTab, onFileClick, activeView }: SidebarProps) {
  return (
    <div 
      className="bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0 overflow-hidden"
      style={{ width }}
      id="sidebar-explorer"
      data-tutorial-target="sidebar-explorer"
    >
      {activeView === 'explorer' && (
        <ExplorerView activeTab={activeTab} onFileClick={onFileClick} />
      )}
      {activeView === 'search' && <SearchView />}
      {activeView === 'git' && <GitView />}
      {activeView === 'extensions' && <ExtensionsView />}
    </div>
  );
}

function ExplorerView({ activeTab, onFileClick }: { activeTab: string; onFileClick: (file: string) => void }) {
  return (
    <>
      {/* Header */}
      <div className="h-9 px-4 flex items-center text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wider shrink-0">
        Explorer
      </div>
      
      {/* Project Header */}
      <div className="px-2 py-1 flex items-center gap-1 text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider bg-[#2d2d2d]">
        <ChevronIcon className="w-4 h-4" />
        <span>my-project</span>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {fileTree.map((node) => (
          <FileTreeNode 
            key={node.name} 
            node={node} 
            depth={0}
            activeTab={activeTab}
            onFileClick={onFileClick}
          />
        ))}
      </div>
      
      {/* Outline Section */}
      <div className="border-t border-[#1e1e1e]">
        <div className="px-2 py-1 flex items-center gap-1 text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider">
          <ChevronRightIcon className="w-4 h-4" />
          <span>Outline</span>
        </div>
      </div>
      
      {/* Timeline Section */}
      <div className="border-t border-[#1e1e1e]">
        <div className="px-2 py-1 flex items-center gap-1 text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider">
          <ChevronRightIcon className="w-4 h-4" />
          <span>Timeline</span>
        </div>
      </div>
    </>
  );
}

function FileTreeNode({ 
  node, 
  depth, 
  activeTab, 
  onFileClick 
}: { 
  node: FileNode; 
  depth: number; 
  activeTab: string;
  onFileClick: (file: string) => void;
}) {
  const [expanded, setExpanded] = useState(node.name === 'src');
  const isActive = activeTab === node.name;
  
  const handleClick = () => {
    if (node.type === 'folder') {
      setExpanded(!expanded);
    } else {
      onFileClick(node.name);
    }
  };
  
  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-1 py-[2px] px-2 cursor-pointer text-[13px]
          hover:bg-[#2a2d2e] transition-colors
          ${isActive ? 'bg-[#094771] text-white' : 'text-[#cccccc]'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.type === 'folder' ? (
          expanded ? <ChevronIcon className="w-4 h-4 shrink-0" /> : <ChevronRightIcon className="w-4 h-4 shrink-0" />
        ) : (
          <span className="w-4" />
        )}
        {node.type === 'folder' ? (
          <FolderIcon className="w-4 h-4 shrink-0 text-[#dcb67a]" open={expanded} />
        ) : (
          <FileTypeIcon filename={node.name} className="w-4 h-4 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      
      {node.type === 'folder' && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode 
              key={child.name} 
              node={child} 
              depth={depth + 1}
              activeTab={activeTab}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchView() {
  return (
    <>
      <div className="h-9 px-4 flex items-center text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wider shrink-0">
        Search
      </div>
      <div className="px-3 py-2">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007fd4] rounded px-2 py-1 text-[13px] text-white placeholder-[#8b8b8b] outline-none"
        />
      </div>
      <div className="px-3 py-2 text-[13px] text-[#8b8b8b]">
        Type to search in files
      </div>
    </>
  );
}

function GitView() {
  return (
    <>
      <div className="h-9 px-4 flex items-center text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wider shrink-0">
        Source Control
      </div>
      <div className="px-3 py-2">
        <input
          type="text"
          placeholder="Message (⌘Enter to commit)"
          className="w-full bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007fd4] rounded px-2 py-1 text-[13px] text-white placeholder-[#8b8b8b] outline-none"
        />
      </div>
      <div className="px-2 py-1 text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider flex items-center gap-1">
        <ChevronIcon className="w-4 h-4" />
        Changes
        <span className="ml-auto bg-[#4d4d4d] text-[#cccccc] rounded-full px-1.5 text-[10px]">3</span>
      </div>
      <div className="px-4 py-1 text-[13px] text-[#8b8b8b]">
        <div className="flex items-center gap-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded px-1">
          <span className="text-[#73c991]">M</span>
          <span>App.tsx</span>
        </div>
        <div className="flex items-center gap-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded px-1">
          <span className="text-[#73c991]">M</span>
          <span>index.css</span>
        </div>
        <div className="flex items-center gap-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded px-1">
          <span className="text-[#d7ba7d]">U</span>
          <span>Button.tsx</span>
        </div>
      </div>
    </>
  );
}

function ExtensionsView() {
  const extensions = [
    { name: 'Cursor AI', publisher: 'Cursor', installed: true },
    { name: 'Tailwind CSS IntelliSense', publisher: 'Tailwind Labs', installed: true },
    { name: 'ESLint', publisher: 'Microsoft', installed: true },
    { name: 'Prettier', publisher: 'Prettier', installed: true },
    { name: 'GitHub Copilot', publisher: 'GitHub', installed: false },
  ];
  
  return (
    <>
      <div className="h-9 px-4 flex items-center text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wider shrink-0">
        Extensions
      </div>
      <div className="px-3 py-2">
        <input
          type="text"
          placeholder="Search Extensions in Marketplace"
          className="w-full bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007fd4] rounded px-2 py-1 text-[13px] text-white placeholder-[#8b8b8b] outline-none"
        />
      </div>
      <div className="px-2 py-1 text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider flex items-center gap-1">
        <ChevronIcon className="w-4 h-4" />
        Installed
      </div>
      <div className="flex-1 overflow-y-auto">
        {extensions.filter(e => e.installed).map((ext) => (
          <div key={ext.name} className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2d2e] cursor-pointer">
            <div className="w-10 h-10 bg-[#3c3c3c] rounded flex items-center justify-center text-lg">
              📦
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-white truncate">{ext.name}</div>
              <div className="text-[11px] text-[#8b8b8b]">{ext.publisher}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// Icons
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7l.7-.7 5 5v.7l-5 5z" />
    </svg>
  );
}

function FolderIcon({ className, open }: { className?: string; open?: boolean }) {
  if (open) {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5v7A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5h-6L7 3H1.5z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M14.5 3H7.7l-.85-.85A.5.5 0 0 0 6.5 2h-5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-.5-.5z" />
    </svg>
  );
}

function FileTypeIcon({ filename, className }: { filename: string; className?: string }) {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const colors: Record<string, string> = {
    tsx: '#3178c6',
    ts: '#3178c6',
    jsx: '#61dafb',
    js: '#f7df1e',
    css: '#563d7c',
    json: '#cbcb41',
    md: '#ffffff',
    mdc: '#42a5f5',
  };
  
  const icons: Record<string, string> = {
    tsx: 'TS',
    ts: 'TS',
    jsx: 'JS',
    js: 'JS',
    css: '#',
    json: '{}',
    md: 'M↓',
    mdc: 'M',
  };
  
  const color = colors[ext || ''] || '#8b8b8b';
  const icon = icons[ext || ''] || '📄';
  
  return (
    <div 
      className={`${className} flex items-center justify-center text-[8px] font-bold rounded`}
      style={{ color }}
    >
      {icon}
    </div>
  );
}

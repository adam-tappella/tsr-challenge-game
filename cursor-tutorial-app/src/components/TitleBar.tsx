/**
 * TitleBar Component
 * Replicates Cursor's macOS-style title bar with traffic lights
 */
export function TitleBar() {
  return (
    <div className="h-9 bg-[#323233] border-b border-[#252526] flex items-center px-3 select-none shrink-0">
      {/* Traffic Lights (macOS style) */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 cursor-pointer transition" title="Close" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 cursor-pointer transition" title="Minimize" />
        <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 cursor-pointer transition" title="Maximize" />
      </div>
      
      {/* File Path / Title */}
      <div className="flex-1 flex items-center justify-center gap-2 text-[13px] text-[#8b8b8b]">
        <svg className="w-4 h-4 text-[#6b6b6b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span>my-project</span>
        <span className="text-[#555]">—</span>
        <span>Cursor Tutorial</span>
      </div>
      
      {/* Window Controls Placeholder (right side) */}
      <div className="w-20" />
    </div>
  );
}

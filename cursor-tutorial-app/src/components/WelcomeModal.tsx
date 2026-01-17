interface WelcomeModalProps {
  onClose: () => void;
}

/**
 * WelcomeModal Component
 * Initial welcome screen when the tutorial starts
 */
export function WelcomeModal({ onClose }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[520px] bg-[#1e1e1e] border border-[#3c3c3c] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Gradient Header */}
        <div className="h-32 bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-20 h-20 border border-white/30 rounded-lg rotate-12" />
            <div className="absolute bottom-4 right-8 w-16 h-16 border border-white/30 rounded-full" />
            <div className="absolute top-8 right-16 w-12 h-12 bg-white/10 rounded-lg -rotate-6" />
          </div>
          
          {/* Cursor Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <CursorLogo className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to Cursor! ✨
          </h1>
          <p className="text-[15px] text-[#8b8b8b] mb-6 max-w-md mx-auto leading-relaxed">
            This interactive tutorial will guide you through Cursor's powerful AI features. 
            Learn how to code faster with your new AI pair programmer.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <FeatureCard 
              icon="💬"
              title="AI Chat"
              description="Ask questions, get help"
              shortcut="⌘L"
            />
            <FeatureCard 
              icon="✏️"
              title="Inline Edit"
              description="Edit code with AI"
              shortcut="⌘K"
            />
            <FeatureCard 
              icon="🎼"
              title="Composer"
              description="Multi-file changes"
              shortcut="⌘I"
            />
            <FeatureCard 
              icon="📁"
              title=".cursorrules"
              description="Customize AI behavior"
              shortcut=""
            />
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-[15px] font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Start Tutorial
            <ArrowIcon className="w-4 h-4" />
          </button>

          {/* Skip Option */}
          <button
            onClick={onClose}
            className="mt-3 text-[13px] text-[#6b6b6b] hover:text-[#8b8b8b] transition-colors"
          >
            I'm experienced, skip the tutorial
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#252526] border-t border-[#3c3c3c] text-center">
          <p className="text-[12px] text-[#6b6b6b]">
            💡 Tip: You can always press <kbd className="px-1.5 py-0.5 bg-[#3c3c3c] rounded text-[11px] text-[#cccccc]">⌘⇧P</kbd> to open the Command Palette
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  shortcut 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  shortcut: string;
}) {
  return (
    <div className="bg-[#252526] rounded-xl p-3 text-left border border-[#3c3c3c] hover:border-[#555] transition-colors">
      <div className="flex items-start justify-between mb-1">
        <span className="text-xl">{icon}</span>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 bg-[#3c3c3c] rounded text-[10px] text-[#8b8b8b] font-mono">
            {shortcut}
          </kbd>
        )}
      </div>
      <div className="text-[13px] font-medium text-white">{title}</div>
      <div className="text-[11px] text-[#6b6b6b]">{description}</div>
    </div>
  );
}

// Icons
function CursorLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

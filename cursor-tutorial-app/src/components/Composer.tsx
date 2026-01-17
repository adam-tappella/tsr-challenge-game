import { useState } from 'react';

interface ComposerProps {
  onClose: () => void;
}

/**
 * Composer Component
 * The multi-file editing modal (⌘I)
 */
export function Composer({ onClose }: ComposerProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [changes, setChanges] = useState<Array<{ file: string; action: string; preview: string }>>([]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setChanges([
        {
          file: 'src/components/Button.tsx',
          action: 'Modified',
          preview: '+ Added hover animation\n+ Updated color scheme'
        },
        {
          file: 'src/components/Card.tsx',
          action: 'Created',
          preview: '+ New Card component\n+ Shadow and border styles'
        },
        {
          file: 'src/index.css',
          action: 'Modified',
          preview: '+ Added new animation keyframes'
        }
      ]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div 
        className="w-[700px] bg-[#1e1e1e] rounded-xl border border-[#3c3c3c] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="composer"
        data-tutorial-target="composer"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2">
            <ComposerIcon className="w-5 h-5 text-[#6366f1]" />
            <span className="text-[14px] font-medium text-white">Composer</span>
            <span className="text-[12px] text-[#8b8b8b]">Multi-file editing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6b6b6b] px-2 py-1 bg-[#2d2d2d] rounded">⌘I</span>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Info Box */}
          <div className="bg-[#2d2d2d] rounded-lg p-3 mb-4 flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
            <div className="text-[13px] text-[#cccccc]">
              <p className="mb-1"><strong>Composer</strong> can make changes across multiple files at once.</p>
              <p className="text-[#8b8b8b]">Describe what you want to build or change, and AI will edit the relevant files.</p>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-[#2d2d2d] rounded-lg border border-[#3c3c3c] focus-within:border-[#6366f1] transition-colors mb-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to build or change..."
              className="w-full bg-transparent px-4 py-3 text-[14px] text-white placeholder-[#6b6b6b] outline-none resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex items-center justify-between px-4 py-2 border-t border-[#3c3c3c]">
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-[#3c3c3c] rounded text-[#6b6b6b] hover:text-[#8b8b8b]" title="Add files">
                  <PlusIcon className="w-4 h-4" />
                </button>
                <span className="text-[12px] text-[#6b6b6b]">Add files for context</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isProcessing}
                className="px-4 py-1.5 bg-[#6366f1] text-white text-[13px] rounded-lg font-medium hover:bg-[#5558e3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <SpinnerIcon className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Changes Preview */}
          {changes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#8b8b8b]">Proposed Changes</span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] rounded hover:bg-[#4c4c4c] transition-colors">
                    Reject All
                  </button>
                  <button className="px-3 py-1 bg-[#238636] text-white text-[12px] rounded hover:bg-[#2ea043] transition-colors">
                    Accept All
                  </button>
                </div>
              </div>
              
              {changes.map((change, i) => (
                <div key={i} className="bg-[#2d2d2d] rounded-lg border border-[#3c3c3c] overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
                    <div className="flex items-center gap-2">
                      <FileIcon className="w-4 h-4 text-[#6b6b6b]" />
                      <span className="text-[13px] text-[#cccccc]">{change.file}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${
                        change.action === 'Created' ? 'bg-[#238636] text-white' : 'bg-[#9e6a03] text-white'
                      }`}>
                        {change.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-[#3c3c3c] rounded text-[#6b6b6b] hover:text-[#cccccc]">
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-[#3c3c3c] rounded text-[#6b6b6b] hover:text-[#cccccc]">
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="px-3 py-2 font-mono text-[12px] text-[#73c991] whitespace-pre">
                    {change.preview}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icons
function ComposerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.375-9.375z" />
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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0L9.937 15.5z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

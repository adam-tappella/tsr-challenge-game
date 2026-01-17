import { useState, useEffect, useRef } from 'react';

interface InlineEditProps {
  position: { x: number; y: number };
  onClose: () => void;
}

/**
 * InlineEdit Component
 * The inline AI edit popup (⌘K)
 */
export function InlineEdit({ position, onClose }: InlineEditProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setResult('// AI generated code would appear here\nconst result = processData(input);');
      setIsProcessing(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="absolute z-40"
      style={{ 
        top: position.y || 100,
        left: position.x || 200,
        maxWidth: '500px'
      }}
      id="inline-edit"
      data-tutorial-target="inline-edit"
    >
      <div className="bg-[#1e1e1e] border border-[#6366f1] rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#2d2d2d] border-b border-[#3c3c3c]">
          <SparklesIcon className="w-4 h-4 text-[#6366f1]" />
          <span className="text-[12px] text-[#cccccc]">Edit with AI</span>
          <span className="text-[11px] text-[#6b6b6b] ml-auto">⌘K</span>
        </div>

        {/* Input */}
        <div className="p-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the change..."
            className="w-full bg-[#2d2d2d] border border-[#3c3c3c] focus:border-[#6366f1] rounded px-3 py-2 text-[13px] text-white placeholder-[#6b6b6b] outline-none"
          />
        </div>

        {/* Quick Actions */}
        <div className="px-2 pb-2 flex flex-wrap gap-1">
          {['Add comments', 'Add error handling', 'Optimize', 'Convert to TypeScript'].map((action) => (
            <button
              key={action}
              onClick={() => setInput(action)}
              className="px-2 py-1 bg-[#2d2d2d] text-[11px] text-[#8b8b8b] rounded hover:bg-[#3c3c3c] hover:text-white transition-colors"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Processing / Result */}
        {isProcessing && (
          <div className="px-3 py-2 border-t border-[#3c3c3c] flex items-center gap-2">
            <SpinnerIcon className="w-4 h-4 text-[#6366f1] animate-spin" />
            <span className="text-[12px] text-[#8b8b8b]">Generating...</span>
          </div>
        )}

        {result && !isProcessing && (
          <div className="border-t border-[#3c3c3c]">
            <div className="px-3 py-2 bg-[#1a2e1a] text-[12px] font-mono text-[#73c991] whitespace-pre">
              {result}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t border-[#3c3c3c]">
              <button 
                onClick={onClose}
                className="px-3 py-1 bg-[#238636] text-white text-[12px] rounded hover:bg-[#2ea043] transition-colors"
              >
                Accept
              </button>
              <button 
                onClick={() => setResult(null)}
                className="px-3 py-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] rounded hover:bg-[#4c4c4c] transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={onClose}
                className="px-3 py-1 text-[#8b8b8b] text-[12px] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
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

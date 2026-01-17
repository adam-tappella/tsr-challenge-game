import { useState, useRef, useEffect } from 'react';

interface AIChatProps {
  width: number;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const tutorialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: `👋 **Welcome to Cursor AI Chat!**

I'm your AI coding assistant. Here's what you can do with me:

**Ask Questions**
- "How does this function work?"
- "What does this error mean?"
- "Explain this code to me"

**Request Changes**
- "Add error handling to this function"
- "Refactor this to use TypeScript"
- "Create a new component for..."

**Get Help**
- "How do I set up Tailwind?"
- "What's the best way to..."
- "Show me an example of..."

Try asking me something! Type your message below.`,
    timestamp: new Date()
  }
];

/**
 * AIChat Component
 * The AI chat panel that appears on the right side (⌘L)
 */
export function AIChat({ width, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>(tutorialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: `Great question! 

In a real Cursor session, I would analyze your code and provide a detailed response. Here's how I typically help:

1. **Understanding Context** - I can see your entire project
2. **Suggesting Code** - I'll provide working code snippets
3. **Making Changes** - I can edit files directly when you approve

Try pressing **⌘K** to edit code inline, or **⌘I** to use Composer for multi-file changes!`,
        
        'button': `Here's how you could create a Button component:

\`\`\`tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  children, 
  onClick 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full font-medium',
        variant === 'primary' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      )}
    >
      {children}
    </button>
  );
}
\`\`\`

Want me to create this file for you?`,

        'help': `Here are the most useful Cursor shortcuts:

| Shortcut | Action |
|----------|--------|
| **⌘L** | Open AI Chat (this panel) |
| **⌘K** | Inline Edit - edit selected code |
| **⌘I** | Composer - multi-file changes |
| **⌘⇧P** | Command Palette |
| **⌃\`** | Toggle Terminal |
| **⌘B** | Toggle Sidebar |

**Tips:**
- Use \`@file\` to reference specific files
- Use \`@folder\` to reference directories
- Highlight code before asking about it`
      };

      const lowerInput = input.toLowerCase();
      let response = responses.default;
      
      if (lowerInput.includes('button') || lowerInput.includes('component')) {
        response = responses.button;
      } else if (lowerInput.includes('help') || lowerInput.includes('shortcut') || lowerInput.includes('how')) {
        response = responses.help;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div 
      className="bg-[#1e1e1e] border-l border-[#252526] flex flex-col shrink-0"
      style={{ width }}
      id="ai-chat"
      data-tutorial-target="ai-chat"
    >
      {/* Header */}
      <div className="h-9 bg-[#252526] flex items-center justify-between px-3 shrink-0 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <CursorIcon className="w-4 h-4 text-[#6366f1]" />
          <span className="text-[13px] text-[#cccccc] font-medium">Chat</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white transition-colors">
            <HistoryIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Bar */}
      <div className="px-3 py-2 border-b border-[#252526] flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#2d2d2d] rounded text-[11px] text-[#8b8b8b]">
          <FileIcon className="w-3 h-3" />
          <span>App.tsx</span>
          <button className="hover:text-white">×</button>
        </div>
        <button className="text-[11px] text-[#6b6b6b] hover:text-[#8b8b8b]">
          + Add context
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-3">
            <div className="shrink-0 mt-1">
              {message.role === 'assistant' ? (
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <CursorIcon className="w-3.5 h-3.5 text-white" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded bg-[#3c3c3c] flex items-center justify-center text-[11px] text-white">
                  U
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] leading-relaxed text-[#cccccc] whitespace-pre-wrap">
                <MessageContent content={message.content} />
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shrink-0">
              <CursorIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#252526]">
        <div className="bg-[#2d2d2d] rounded-lg border border-[#3c3c3c] focus-within:border-[#6366f1] transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Enter to send)"
            className="w-full bg-transparent px-3 py-2 text-[13px] text-white placeholder-[#6b6b6b] outline-none resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between px-3 py-2 border-t border-[#3c3c3c]">
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-[#3c3c3c] rounded text-[#6b6b6b] hover:text-[#8b8b8b]" title="Attach file">
                <PaperclipIcon className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-[#3c3c3c] rounded text-[#6b6b6b] hover:text-[#8b8b8b]" title="Add image">
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6b6b6b]">claude-3.5-sonnet</span>
              <button 
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="px-3 py-1 bg-[#6366f1] text-white text-[12px] rounded font-medium hover:bg-[#5558e3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like parsing
  const parsed = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-[#2d2d2d] px-1.5 py-0.5 rounded text-[#e06c75] text-[12px]">$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-[#2d2d2d] p-3 rounded-lg mt-2 mb-2 overflow-x-auto text-[12px]"><code>$2</code></pre>')
    .replace(/\n/g, '<br />');
  
  return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
}

// Icons
function CursorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" />
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

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
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

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

import { useState } from 'react';

interface EditorContentProps {
  activeFile: string;
}

const fileContents: Record<string, { content: string; language: string }> = {
  'App.tsx': {
    language: 'typescript',
    content: `import { useState } from 'react';
import { Button } from './components/Button';
import { Card } from './components/Card';

/**
 * Main App Component
 * This is the entry point of your application
 */
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to Cursor! 🚀
        </h1>
        <p className="text-muted-foreground mt-2">
          Start building amazing things with AI
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Interactive Counter
          </h2>
          <div className="flex items-center gap-4">
            <Button onClick={() => setCount(c => c - 1)}>
              -
            </Button>
            <span className="text-2xl font-mono w-12 text-center">
              {count}
            </span>
            <Button onClick={() => setCount(c => c + 1)}>
              +
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default App;`
  },
  'index.css': {
    language: 'css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode tokens */
  }
}

/* Custom animations */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}`
  },
  '.cursorrules': {
    language: 'markdown',
    content: `# Project Cursor Rules

You are an expert in TypeScript, React, and Tailwind CSS.

## Code Style
- Use functional components with hooks
- Prefer named exports over default exports
- Use TypeScript interfaces for props
- Keep components small and focused

## Naming Conventions
- Components: PascalCase (Button.tsx)
- Hooks: camelCase with "use" prefix (useData.ts)
- Utils: camelCase (formatDate.ts)

## File Structure
\`\`\`
src/
  components/ui/   # Reusable UI components
  hooks/           # Custom React hooks
  stores/          # Zustand state stores
  lib/             # Utility functions
\`\`\`

## Tailwind Patterns
- Use cn() utility for conditional classes
- Follow design tokens from DESIGN_TOKENS.md
- Cards: rounded-[22px] border shadow-sm
- Buttons: rounded-full for pill shape

## When Making Changes
1. Consult STYLE_GUIDE.md for patterns
2. Check existing components for conventions
3. Update docs if behavior changes`
  },
  'Button.tsx': {
    language: 'typescript',
    content: `import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Button Component
 * Reusable button with multiple variants
 */
export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border border-input bg-background hover:bg-accent': variant === 'outline',
        },
        {
          'px-3 py-1 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}`
  }
};

/**
 * EditorContent Component
 * The main code editor area with syntax highlighting
 */
export function EditorContent({ activeFile }: EditorContentProps) {
  const file = fileContents[activeFile];
  const [cursorLine, setCursorLine] = useState(1);
  
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#8b8b8b]">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <div>Select a file to view its contents</div>
        </div>
      </div>
    );
  }
  
  const lines = file.content.split('\n');
  
  return (
    <div className="flex-1 flex overflow-hidden bg-[#1e1e1e]">
      {/* Minimap */}
      <div className="w-[100px] bg-[#1e1e1e] border-l border-[#252526] shrink-0 overflow-hidden order-last">
        <div className="p-1 scale-[0.15] origin-top-left w-[600px] opacity-60">
          {lines.map((line, i) => (
            <div key={i} className="h-[14px] flex items-center">
              <div 
                className="h-[2px] bg-[#6e6e6e] rounded"
                style={{ width: `${Math.min(line.length * 2, 100)}%` }}
              />
            </div>
          ))}
        </div>
        {/* Viewport indicator */}
        <div 
          className="absolute top-0 left-0 right-0 bg-[#79797933] border border-[#79797966]"
          style={{ height: '50px', top: '20px' }}
        />
      </div>
      
      {/* Editor */}
      <div className="flex-1 flex overflow-auto font-mono text-[13px] leading-[20px]">
        {/* Line Numbers */}
        <div className="bg-[#1e1e1e] text-[#858585] text-right py-1 select-none shrink-0 pr-4 pl-4">
          {lines.map((_, i) => (
            <div 
              key={i} 
              className={`h-[20px] ${cursorLine === i + 1 ? 'text-[#c6c6c6]' : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* Code Content */}
        <div 
          className="flex-1 py-1 pl-2 pr-4 overflow-x-auto"
          onClick={(e) => {
            // Calculate line from click position
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const line = Math.floor(y / 20) + 1;
            setCursorLine(Math.min(line, lines.length));
          }}
        >
          {lines.map((line, i) => (
            <div 
              key={i} 
              className={`h-[20px] whitespace-pre ${cursorLine === i + 1 ? 'bg-[#2a2d2e]' : ''}`}
            >
              <SyntaxHighlight line={line} language={file.language} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SyntaxHighlight({ line, language }: { line: string; language: string }) {
  // Simple syntax highlighting
  const highlightedLine = line
    // Keywords
    .replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements|new|this|async|await|default)\b/g, 
      '<span class="text-[#c586c0]">$1</span>')
    // Strings
    .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
      '<span class="text-[#ce9178]">$1$2$1</span>')
    // Comments
    .replace(/(\/\/.*$)/gm, 
      '<span class="text-[#6a9955]">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, 
      '<span class="text-[#6a9955]">$1</span>')
    // JSX tags
    .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*)/g, 
      '<span class="text-[#4ec9b0]">$1</span>')
    // Numbers
    .replace(/\b(\d+)\b/g, 
      '<span class="text-[#b5cea8]">$1</span>')
    // Function calls
    .replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, 
      '<span class="text-[#dcdcaa]">$1</span>(')
    // Types/Classes
    .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, 
      '<span class="text-[#4ec9b0]">$1</span>')
    // CSS properties
    .replace(/^\s*([a-z-]+):/gm, 
      '  <span class="text-[#9cdcfe]">$1</span>:')
    // @ symbols (CSS/decorators)
    .replace(/(@[a-zA-Z]+)/g, 
      '<span class="text-[#c586c0]">$1</span>');
  
  return <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
}

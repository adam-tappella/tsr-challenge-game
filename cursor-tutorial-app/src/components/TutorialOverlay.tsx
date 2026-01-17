import { useTutorial } from '../context/TutorialContext';
import { TutorialHighlight } from './TutorialHighlight';

interface TutorialOverlayProps {
  onOpenChat: () => void;
  onOpenComposer: () => void;
  onOpenTerminal: () => void;
}

/**
 * TutorialOverlay Component
 * Floating tutorial card that guides users through Cursor features
 */
export function TutorialOverlay({ onOpenChat, onOpenComposer, onOpenTerminal }: TutorialOverlayProps) {
  const { 
    currentStep, 
    steps, 
    isActive, 
    setCurrentStep, 
    completeStep,
    endTutorial
  } = useTutorial();

  if (!isActive) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleAction = () => {
    switch (step?.id) {
      case 'welcome':
        // Advance to next step when welcome step is completed
        setCurrentStep(1);
        break;
      case 'ai-chat':
        onOpenChat();
        break;
      case 'composer':
        onOpenComposer();
        break;
      case 'terminal':
        onOpenTerminal();
        break;
      default:
        completeStep(step?.id || '');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] animate-slide-up">
      <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-[#2d2d2d]">
          <div 
            className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
              <CursorIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">Cursor Tutorial</div>
              <div className="text-[11px] text-[#8b8b8b]">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
          </div>
          <button 
            onClick={endTutorial}
            className="text-[11px] text-[#8b8b8b] hover:text-white transition-colors"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-[16px] font-semibold text-white mb-2 flex items-center gap-2">
            {step?.title}
          </h3>
          <p className="text-[13px] text-[#cccccc] leading-relaxed mb-4">
            {step?.description}
          </p>

          {/* Shortcut Display */}
          {step?.shortcut && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[12px] text-[#8b8b8b]">Keyboard shortcut:</span>
              <kbd className="px-2 py-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded text-[12px] text-white font-mono">
                {step.shortcut}
              </kbd>
            </div>
          )}

          {/* Action Hint */}
          {step?.action && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#2d2d2d] rounded-lg mb-4">
              <ArrowIcon className="w-4 h-4 text-[#6366f1] shrink-0" />
              <span className="text-[12px] text-[#cccccc]">{step.action}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#3c3c3c] bg-[#252526]">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-[12px] text-[#8b8b8b] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep 
                    ? 'bg-[#6366f1]' 
                    : i < currentStep 
                      ? 'bg-[#4ade80]' 
                      : 'bg-[#3c3c3c] hover:bg-[#555]'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleAction}
              className="px-4 py-1.5 bg-[#6366f1] text-white text-[12px] font-medium rounded-lg hover:bg-[#5558e3] transition-colors"
            >
              {step?.shortcut ? 'Try It!' : 'Next →'}
            </button>
          ) : (
            <button
              onClick={endTutorial}
              className="px-4 py-1.5 bg-[#22c55e] text-white text-[12px] font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              Finish! 🎉
            </button>
          )}
        </div>
      </div>

      {/* Highlight Target Element */}
      {step?.target && step.target !== 'welcome' && step.target !== 'complete' && (
        <TutorialHighlight 
          target={step.target} 
          position="auto"
          offset={20}
        />
      )}
    </div>
  );
}

// Icons
function CursorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

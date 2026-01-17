import { useState, useEffect } from 'react';
import { CursorIDELayout } from './components/CursorIDELayout';
import { TutorialProvider, useTutorial } from './context/TutorialContext';
import { WelcomeModal } from './components/WelcomeModal';

/**
 * Cursor IDE Tutorial App
 * A realistic replica of Cursor IDE that walks new users through all features
 */
function AppContent() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { setCurrentStep } = useTutorial();

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    // Advance to the first tutorial step (file-explorer) after welcome
    setTimeout(() => {
      setCurrentStep(1);
    }, 100);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1e1e1e] text-[#cccccc] font-['SF_Mono',_'Menlo',_'Monaco',_'Courier_New',_monospace]">
      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
      <CursorIDELayout />
    </div>
  );
}

function App() {
  return (
    <TutorialProvider>
      <AppContent />
    </TutorialProvider>
  );
}

export default App;

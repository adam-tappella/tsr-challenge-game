import { useEffect, useState, useRef } from 'react';

interface TutorialHighlightProps {
  target: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  offset?: number;
}

/**
 * TutorialHighlight Component
 * Creates a spotlight overlay that highlights a target element and points to it with an arrow
 */
export function TutorialHighlight({ target, position = 'auto', offset = 20 }: TutorialHighlightProps) {
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [arrowCoords, setArrowCoords] = useState<{ x: number; y: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      // Find the target element
      let element: HTMLElement | null = null;
      
      // Try by ID first
      element = document.getElementById(target);
      
      // If not found, try by data attribute
      if (!element) {
        element = document.querySelector(`[data-tutorial-target="${target}"]`) as HTMLElement;
      }
      
      // If still not found, try by class or other selector
      if (!element) {
        element = document.querySelector(`.${target}`) as HTMLElement;
      }

      if (!element) {
        console.error(`[TutorialHighlight] Element not found for target: ${target}`);
        setElementRect(null);
        setArrowCoords(null);
        return;
      }
      
      console.log(`[TutorialHighlight] Found element for target: ${target}`, element);
      console.log(`[TutorialHighlight] Element rect:`, element.getBoundingClientRect());

      const rect = element.getBoundingClientRect();
      setElementRect(rect);

      // Calculate arrow position
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let finalPosition: 'top' | 'bottom' | 'left' | 'right' = position === 'auto' ? 'bottom' : position;
      
      if (position === 'auto') {
        // Auto-determine best position
        const spaceTop = rect.top;
        const spaceBottom = viewportHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = viewportWidth - rect.right;
        
        const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
        
        if (maxSpace === spaceBottom) finalPosition = 'bottom';
        else if (maxSpace === spaceTop) finalPosition = 'top';
        else if (maxSpace === spaceRight) finalPosition = 'right';
        else finalPosition = 'left';
      }

      // Calculate arrow coordinates based on position
      let coords: { x: number; y: number };
      
      switch (finalPosition) {
        case 'top':
          coords = {
            x: rect.left + rect.width / 2,
            y: rect.top - offset
          };
          break;
        case 'bottom':
          coords = {
            x: rect.left + rect.width / 2,
            y: rect.bottom + offset
          };
          break;
        case 'left':
          coords = {
            x: rect.left - offset,
            y: rect.top + rect.height / 2
          };
          break;
        case 'right':
          coords = {
            x: rect.right + offset,
            y: rect.top + rect.height / 2
          };
          break;
      }

      setArrowPosition(finalPosition);
      setArrowCoords(coords);
    };

    // Try immediately
    updatePosition();
    
    // Also try after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(updatePosition, 100);
    
    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    // Use ResizeObserver for element size changes
    const findElement = () => {
      return document.getElementById(target) || 
             document.querySelector(`[data-tutorial-target="${target}"]`) as HTMLElement;
    };
    
    const element = findElement();
    
    if (element) {
      const resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(element);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        resizeObserver.disconnect();
      };
    }
    
    // If element not found, try again after a delay
    const retryTimeout = setTimeout(() => {
      const retryElement = findElement();
      if (retryElement) {
        updatePosition();
        const resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(retryElement);
      }
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(retryTimeout);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [target, position, offset]);

  if (!elementRect || !arrowCoords) {
    return null;
  }

  // Create SVG path for spotlight (inverse mask)
  const padding = 8;
  const spotlightRect = {
    x: elementRect.left - padding,
    y: elementRect.top - padding,
    width: elementRect.width + padding * 2,
    height: elementRect.height + padding * 2
  };

  // Create overlay with cutout
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return (
    <>
      {/* Overlay with spotlight effect using box-shadow */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] pointer-events-none"
      >
        {/* Top overlay */}
        {spotlightRect.y > 0 && (
          <div 
            className="absolute bg-black/80"
            style={{
              left: 0,
              top: 0,
              width: viewportWidth,
              height: spotlightRect.y
            }}
          />
        )}
        
        {/* Bottom overlay */}
        {spotlightRect.y + spotlightRect.height < viewportHeight && (
          <div 
            className="absolute bg-black/80"
            style={{
              left: 0,
              top: spotlightRect.y + spotlightRect.height,
              width: viewportWidth,
              height: viewportHeight - (spotlightRect.y + spotlightRect.height)
            }}
          />
        )}
        
        {/* Left overlay */}
        {spotlightRect.x > 0 && (
          <div 
            className="absolute bg-black/80"
            style={{
              left: 0,
              top: spotlightRect.y,
              width: spotlightRect.x,
              height: spotlightRect.height
            }}
          />
        )}
        
        {/* Right overlay */}
        {spotlightRect.x + spotlightRect.width < viewportWidth && (
          <div 
            className="absolute bg-black/80"
            style={{
              left: spotlightRect.x + spotlightRect.width,
              top: spotlightRect.y,
              width: viewportWidth - (spotlightRect.x + spotlightRect.width),
              height: spotlightRect.height
            }}
          />
        )}
        
        {/* Highlight border around element */}
        <div
          className="absolute border-2 border-[#6366f1] rounded-lg animate-pulse-border pointer-events-none"
          style={{
            left: `${spotlightRect.x}px`,
            top: `${spotlightRect.y}px`,
            width: `${spotlightRect.width}px`,
            height: `${spotlightRect.height}px`,
            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.4), inset 0 0 20px rgba(99, 102, 241, 0.1)'
          }}
        />
      </div>

      {/* Arrow pointing to element */}
      <div
        ref={arrowRef}
        className="fixed z-[61] pointer-events-none animate-bounce"
        style={{
          left: `${arrowCoords.x}px`,
          top: `${arrowCoords.y}px`,
          transform: 'translate(-50%, -50%)',
          animationDuration: '2s'
        }}
      >
        <ArrowIcon 
          direction={arrowPosition} 
          className="w-8 h-8 text-[#6366f1] drop-shadow-lg"
        />
      </div>
    </>
  );
}

interface ArrowIconProps {
  direction: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

function ArrowIcon({ direction, className }: ArrowIconProps) {
  const rotation = {
    top: 180,
    bottom: 0,
    left: 90,
    right: -90
  }[direction];

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M12 2L12 22M12 2L2 12M12 2L22 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
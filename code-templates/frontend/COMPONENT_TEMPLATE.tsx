import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  /**
   * Title of the component
   */
  title: string;
  /**
   * Optional class name to override styles
   */
  className?: string;
  /**
   * Optional children elements
   */
  children?: React.ReactNode;
}

/**
 * ComponentName
 * 
 * Description of what this component does.
 * Follows the UI_STYLE_GUIDE.html patterns.
 * 
 * @example
 * <ComponentName title="Example" className="mt-4">
 *   Content
 * </ComponentName>
 */
export const ComponentName = React.memo(({ 
  title, 
  className, 
  children 
}: ComponentNameProps) => {
  // Memoized values for performance
  const containerClasses = useMemo(() => {
    return cn(
      // Base styles from STYLE_GUIDE.md (e.g., card styles)
      "rounded-[22px] border border-border bg-card p-6 shadow-sm",
      "flex flex-col gap-4",
      className
    );
  }, [className]);

  return (
    <div className={containerClasses}>
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        {/* Optional Controls */}
      </div>

      {/* Content Section */}
      <div className="text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  );
});

// Display name for debugging
ComponentName.displayName = 'ComponentName';

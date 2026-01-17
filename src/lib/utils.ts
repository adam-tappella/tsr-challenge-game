import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function for merging Tailwind CSS classes
 * 
 * Combines clsx for conditional classes with tailwind-merge
 * to properly handle Tailwind CSS class conflicts.
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * cn("px-4 py-2", "px-6") // returns "px-6 py-2"
 * cn("text-red-500", condition && "text-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

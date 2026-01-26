/**
 * PageContainer - Standardized page layout wrapper.
 * 
 * Provides consistent padding, max-width, and spacing for all pages
 * inside the AppShell. Eliminates repeated layout classes across pages.
 * 
 * @example
 * // Default page (Dashboard, Settings, etc.)
 * <PageContainer>
 *   <h1>My Page</h1>
 * </PageContainer>
 * 
 * @example
 * // Full-width game page
 * <PageContainer variant="full" noBottomPadding>
 *   <GameBoard />
 * </PageContainer>
 * 
 * @example
 * // Narrow content page (Profile, single article)
 * <PageContainer variant="narrow">
 *   <ProfileCard />
 * </PageContainer>
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type PageContainerVariant = 'default' | 'narrow' | 'wide' | 'full';

export interface PageContainerProps {
  children: ReactNode;
  /** 
   * Page layout variant:
   * - `default`: max-w-7xl - Dashboard, Settings, most pages
   * - `narrow`: max-w-4xl - Profile, single-column content
   * - `wide`: max-w-screen-xl - Blog, content-heavy pages
   * - `full`: max-w-full - Games, full-width experiences
   */
  variant?: PageContainerVariant;
  /** Disable top padding (for pages with custom/sticky headers) */
  noTopPadding?: boolean;
  /** Disable bottom padding (for pages with fixed footers or infinite scroll) */
  noBottomPadding?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Max width classes for each variant
 */
const MAX_WIDTH_CLASSES: Record<PageContainerVariant, string> = {
  default: 'max-w-7xl',
  narrow: 'max-w-4xl',
  wide: 'max-w-screen-xl',
  full: 'max-w-full',
};

/**
 * Standardized page container with consistent spacing and responsive design.
 * 
 * Default spacing:
 * - Top: pt-16 (below mobile menu button / header area)
 * - Bottom: pb-24 on mobile (above bottom nav + music player), pb-8 on desktop
 * - Horizontal: px-4 sm:px-6 lg:px-8
 * - Centering: mx-auto
 */
export function PageContainer({
  children,
  variant = 'default',
  noTopPadding = false,
  noBottomPadding = false,
  className,
}: PageContainerProps) {
  return (
    <div 
      className={cn(
        // Horizontal padding and centering
        'mx-auto px-4 sm:px-6 lg:px-8',
        // Top padding (below header/menu area)
        !noTopPadding && 'pt-4 sm:pt-6',
        // Bottom padding (above mobile nav + music player)
        !noBottomPadding && 'pb-24 lg:pb-8',
        // Max width based on variant
        MAX_WIDTH_CLASSES[variant],
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}

export default PageContainer;

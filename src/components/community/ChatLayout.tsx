import React, { forwardRef } from "react";

interface ChatLayoutProps {
  header: React.ReactNode;
  banner?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  backgroundStyle?: React.CSSProperties;
}

/**
 * ChatLayout - Flex-based container following Web Chat App UI Guide
 * 
 * Core principles:
 * - Only the message list scrolls
 * - Header and input bar never move
 * - Uses 100dvh for proper mobile keyboard handling
 * - Avoids position: fixed for better mobile compatibility
 */
export const ChatLayout = forwardRef<HTMLDivElement, ChatLayoutProps>(({ 
  header, 
  banner, 
  children, 
  footer,
  backgroundStyle 
}, ref) => {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background relative">
      {/* Background layer */}
      {backgroundStyle && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={backgroundStyle}
        />
      )}
      
      {/* Header - flex-shrink: 0, NO fixed positioning */}
      <header className="shrink-0 z-10 relative">
        {header}
      </header>
      
      {/* Optional Banner (e.g., Jude AI for groups) - flex-shrink: 0 */}
      {banner && (
        <div className="shrink-0 z-10 relative">
          {banner}
        </div>
      )}
      
      {/* Message Container - ONLY scrollable section */}
      <main 
        ref={ref}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain z-[1] relative"
      >
        {children}
      </main>
      
      {/* Input Bar - flex-shrink: 0, safe area padding */}
      <footer 
        className="shrink-0 z-10 relative"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {footer}
      </footer>
    </div>
  );
});

ChatLayout.displayName = "ChatLayout";

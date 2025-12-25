import { useState, useRef, useEffect, useCallback, RefObject } from "react";

interface Position {
  x: number;
  y: number;
}

interface DraggableConfig {
  defaultWidth?: number;
  defaultHeight?: number;
  initialRight?: string;
  initialTop?: string;
  initialBottom?: string;
}

interface DraggableReturn {
  position: Position;
  hasMoved: boolean;
  isDragging: boolean;
  hasActuallyDragged: boolean;
  floatingRef: RefObject<HTMLDivElement>;
  chatRef: RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  getPositionStyles: (isOpen: boolean, config?: {
    openWidth?: string;
    openRight?: string;
    openBottom?: string;
    openTop?: string;
    closedWidth?: string;
    closedRight?: string;
    closedTop?: string;
    closedBottom?: string;
  }) => React.CSSProperties;
}

export const useEricDraggable = (
  isOpen: boolean,
  config: DraggableConfig = {}
): DraggableReturn => {
  const {
    defaultWidth = 380,
    defaultHeight = 500,
  } = config;

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [hasActuallyDragged, setHasActuallyDragged] = useState(false);
  
  const floatingRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Constrain position within viewport bounds
  const constrainToViewport = useCallback((pos: Position): Position => {
    if (!hasMoved) return pos;

    const currentRef = isOpen ? chatRef.current : floatingRef.current;
    if (!currentRef) return pos;

    const width = currentRef.offsetWidth || defaultWidth;
    const height = currentRef.offsetHeight || defaultHeight;

    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    return {
      x: Math.max(0, Math.min(pos.x, maxX)),
      y: Math.max(0, Math.min(pos.y, maxY))
    };
  }, [hasMoved, isOpen, defaultWidth, defaultHeight]);

  // Handle window resize to keep element in viewport
  useEffect(() => {
    if (!hasMoved) return;

    const handleResize = () => {
      setPosition(prev => constrainToViewport(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasMoved, constrainToViewport]);

  // Constrain position when state changes
  useEffect(() => {
    if (isOpen && hasMoved) {
      setPosition(prev => constrainToViewport(prev));
    }
  }, [isOpen, hasMoved, constrainToViewport]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, textarea, input, .eric-chat-messages')) {
      return;
    }
    
    // Don't start dragging on the closed element if not yet moved - let click work
    if (!isOpen && !hasMoved) {
      return;
    }
    
    setHasActuallyDragged(false);
    
    if (!hasMoved) {
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      if (currentRef) {
        const rect = currentRef.getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.top });
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    } else {
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
    
    setIsDragging(true);
  }, [isOpen, hasMoved, position]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, textarea, input, .eric-chat-messages')) {
      return;
    }
    
    // Don't start dragging on the closed element if not yet moved - let tap work
    if (!isOpen && !hasMoved) {
      return;
    }
    
    setHasActuallyDragged(false);
    
    const touch = e.touches[0];
    
    if (!hasMoved) {
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      if (currentRef) {
        const rect = currentRef.getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.top });
        setDragStart({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    } else {
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
    
    setIsDragging(true);
  }, [isOpen, hasMoved, position]);

  // Handle mouse/touch move for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setHasActuallyDragged(true);
      setHasMoved(true);
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      const width = currentRef?.offsetWidth || defaultWidth;
      const height = currentRef?.offsetHeight || defaultHeight;
      
      const maxX = window.innerWidth - width;
      const maxY = window.innerHeight - height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      setHasActuallyDragged(true);
      setHasMoved(true);
      
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      const width = currentRef?.offsetWidth || defaultWidth;
      const height = currentRef?.offsetHeight || defaultHeight;
      
      const maxX = window.innerWidth - width;
      const maxY = window.innerHeight - height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, isOpen, defaultWidth, defaultHeight]);

  // Helper to generate position styles
  const getPositionStyles = useCallback((
    forOpenState: boolean,
    styleConfig?: {
      openWidth?: string;
      openRight?: string;
      openBottom?: string;
      openTop?: string;
      closedWidth?: string;
      closedRight?: string;
      closedTop?: string;
      closedBottom?: string;
    }
  ): React.CSSProperties => {
    const cfg = styleConfig || {};
    
    if (forOpenState) {
      // If openTop is provided, position from top instead of bottom
      const hasOpenTop = cfg.openTop !== undefined;
      return {
        position: 'fixed',
        left: hasMoved ? `${position.x}px` : 'auto',
        top: hasMoved ? `${position.y}px` : (hasOpenTop ? cfg.openTop : 'auto'),
        right: hasMoved ? 'auto' : (cfg.openRight || '1.25rem'),
        bottom: hasMoved ? 'auto' : (hasOpenTop ? 'auto' : (cfg.openBottom || '2rem')),
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
      };
    } else {
      return {
        position: 'fixed',
        left: hasMoved ? `${position.x}px` : 'auto',
        top: hasMoved ? `${position.y}px` : (cfg.closedTop || 'auto'),
        right: hasMoved ? 'auto' : (cfg.closedRight || '1.25rem'),
        bottom: hasMoved ? 'auto' : (cfg.closedBottom || 'auto'),
        cursor: isDragging ? 'grabbing' : 'pointer',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'transform 0.3s',
      };
    }
  }, [hasMoved, position, isDragging]);

  return {
    position,
    hasMoved,
    isDragging,
    hasActuallyDragged,
    floatingRef,
    chatRef,
    handleMouseDown,
    handleTouchStart,
    getPositionStyles,
  };
};

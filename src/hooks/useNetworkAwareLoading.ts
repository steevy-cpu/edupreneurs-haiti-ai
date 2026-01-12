import { useState, useEffect, useCallback, useMemo } from 'react';

export type ConnectionSpeed = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
export type LoadingStrategy = 'minimal' | 'reduced' | 'full';

interface NetworkAwareLoading {
  /** Current connection speed */
  connectionSpeed: ConnectionSpeed;
  /** Loading strategy based on connection */
  loadingStrategy: LoadingStrategy;
  /** Whether to load full quality images */
  shouldLoadFullQuality: boolean;
  /** Whether to show animations */
  shouldShowAnimations: boolean;
  /** Whether to defer non-critical resources */
  shouldDeferResources: boolean;
  /** Whether to load blur backgrounds */
  shouldShowBlur: boolean;
  /** Whether user is on save data mode */
  isSaveData: boolean;
  /** Whether connection is slow (2G or 3G) */
  isSlowConnection: boolean;
  /** Recommended image quality (0-100) */
  imageQuality: number;
}

/**
 * Hook that detects network conditions and provides loading strategy recommendations.
 * Optimized for users on 3G connections in Haiti.
 */
export function useNetworkAwareLoading(): NetworkAwareLoading {
  const [connectionSpeed, setConnectionSpeed] = useState<ConnectionSpeed>('unknown');
  const [isSaveData, setIsSaveData] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const updateNetworkInfo = useCallback(() => {
    // Check for reduced motion preference (accessibility)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPrefersReducedMotion(reducedMotion);

    // Check Network Information API
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
    
    if (connection) {
      const { effectiveType, saveData } = connection;
      setIsSaveData(saveData === true);
      
      switch (effectiveType) {
        case 'slow-2g':
          setConnectionSpeed('slow-2g');
          break;
        case '2g':
          setConnectionSpeed('2g');
          break;
        case '3g':
          setConnectionSpeed('3g');
          break;
        case '4g':
          setConnectionSpeed('4g');
          break;
        default:
          setConnectionSpeed('unknown');
      }
    } else {
      // Fallback: assume 4G if API not available
      setConnectionSpeed('unknown');
    }
  }, []);

  useEffect(() => {
    // Initial check
    updateNetworkInfo();
    
    // Listen for network changes
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }
    
    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', updateNetworkInfo);
    
    return () => {
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
      mediaQuery.removeEventListener('change', updateNetworkInfo);
    };
  }, [updateNetworkInfo]);

  // Derive loading strategy from connection speed
  const loadingStrategy = useMemo((): LoadingStrategy => {
    if (isSaveData || prefersReducedMotion) return 'minimal';
    
    switch (connectionSpeed) {
      case 'slow-2g':
      case '2g':
        return 'minimal';
      case '3g':
        return 'reduced';
      case '4g':
      case 'unknown':
      default:
        return 'full';
    }
  }, [connectionSpeed, isSaveData, prefersReducedMotion]);

  // Derive boolean flags
  const isSlowConnection = useMemo(() => {
    return connectionSpeed === 'slow-2g' || 
           connectionSpeed === '2g' || 
           connectionSpeed === '3g';
  }, [connectionSpeed]);

  const shouldLoadFullQuality = useMemo(() => {
    return loadingStrategy === 'full' && !isSaveData;
  }, [loadingStrategy, isSaveData]);

  const shouldShowAnimations = useMemo(() => {
    return !prefersReducedMotion && loadingStrategy !== 'minimal';
  }, [loadingStrategy, prefersReducedMotion]);

  const shouldDeferResources = useMemo(() => {
    return loadingStrategy !== 'full';
  }, [loadingStrategy]);

  const shouldShowBlur = useMemo(() => {
    // Blur effects are expensive on slow connections
    return loadingStrategy === 'full';
  }, [loadingStrategy]);

  const imageQuality = useMemo(() => {
    switch (loadingStrategy) {
      case 'minimal':
        return 40; // Low quality for very slow connections
      case 'reduced':
        return 60; // Medium quality for 3G
      case 'full':
      default:
        return 85; // High quality for 4G/WiFi
    }
  }, [loadingStrategy]);

  return {
    connectionSpeed,
    loadingStrategy,
    shouldLoadFullQuality,
    shouldShowAnimations,
    shouldDeferResources,
    shouldShowBlur,
    isSaveData,
    isSlowConnection,
    imageQuality
  };
}

export default useNetworkAwareLoading;

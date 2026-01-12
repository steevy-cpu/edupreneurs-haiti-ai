import { createContext, useContext, ReactNode } from 'react';
import { useNetworkAwareLoading, LoadingStrategy, ConnectionSpeed } from '@/hooks/useNetworkAwareLoading';

interface NetworkContextValue {
  connectionSpeed: ConnectionSpeed;
  loadingStrategy: LoadingStrategy;
  shouldLoadFullQuality: boolean;
  shouldShowAnimations: boolean;
  shouldDeferResources: boolean;
  shouldShowBlur: boolean;
  isSaveData: boolean;
  isSlowConnection: boolean;
  imageQuality: number;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

/**
 * Provider that makes network-aware loading available throughout the app.
 * Optimized for 3G users in Haiti.
 */
export function NetworkProvider({ children }: NetworkProviderProps) {
  const networkInfo = useNetworkAwareLoading();

  return (
    <NetworkContext.Provider value={networkInfo}>
      {children}
    </NetworkContext.Provider>
  );
}

/**
 * Hook to access network-aware loading context.
 * Falls back to full quality if used outside provider.
 */
export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);
  
  if (!context) {
    // Fallback defaults - assume full quality
    return {
      connectionSpeed: 'unknown',
      loadingStrategy: 'full',
      shouldLoadFullQuality: true,
      shouldShowAnimations: true,
      shouldDeferResources: false,
      shouldShowBlur: true,
      isSaveData: false,
      isSlowConnection: false,
      imageQuality: 85
    };
  }
  
  return context;
}

export default NetworkContext;

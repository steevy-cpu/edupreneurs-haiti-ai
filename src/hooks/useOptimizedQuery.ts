import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getCachedApiResponse, setCachedApiResponse, deduplicateRequest } from "@/utils/performanceOptimization";

/**
 * Optimized query hook with caching and deduplication
 */
export function useOptimizedQuery<T>(
  key: string | string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(key) ? key : [key];
  const cacheKey = queryKey.join(':');

  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      // Check local cache first
      const cached = getCachedApiResponse<T>(cacheKey);
      if (cached) {
        console.log('✅ Cache hit:', cacheKey);
        return cached;
      }

      // Deduplicate concurrent requests
      const data = await deduplicateRequest(cacheKey, queryFn);
      
      // Store in cache
      setCachedApiResponse(cacheKey, data);
      console.log('💾 Cached:', cacheKey);
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    ...options,
  });
}

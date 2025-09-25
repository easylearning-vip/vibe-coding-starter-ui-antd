/**
 * Request deduplication utility to prevent duplicate API calls
 * This helps avoid rate limiting issues and improves performance
 */

interface RequestCacheEntry {
  promise: Promise<any>;
  timestamp: number;
}

class RequestDeduplication {
  private cache = new Map<string, RequestCacheEntry>();
  private readonly CACHE_DURATION = 5000; // 5 seconds

  /**
   * Create a cache key from request parameters
   */
  private createCacheKey(url: string, options: any = {}): string {
    const method = options.method || 'GET';
    const params = options.params ? JSON.stringify(options.params) : '';
    const data = options.data ? JSON.stringify(options.data) : '';
    return `${method}:${url}:${params}:${data}`;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Execute a request with deduplication
   * If the same request is already in progress, return the existing promise
   */
  public async deduplicate<T>(
    requestFn: () => Promise<T>,
    url: string,
    options: any = {}
  ): Promise<T> {
    const cacheKey = this.createCacheKey(url, options);
    
    // Clean up expired entries periodically
    this.cleanupExpiredEntries();

    // Check if there's an ongoing request for the same parameters
    const existingEntry = this.cache.get(cacheKey);
    if (existingEntry) {
      console.log('🔄 Returning cached request:', url);
      return existingEntry.promise;
    }

    // Create new request
    console.log('🌐 Making new request:', url);
    const promise = requestFn().finally(() => {
      // Remove from cache after completion (success or failure)
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, this.CACHE_DURATION);
    });

    // Cache the promise
    this.cache.set(cacheKey, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Clear all cached requests
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cached requests matching a pattern
   */
  public clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const requestDeduplication = new RequestDeduplication();

/**
 * Higher-order function to wrap API functions with deduplication
 */
export function withDeduplication<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  getUrl: (...args: Parameters<T>) => string,
  getOptions?: (...args: Parameters<T>) => any
): T {
  return ((...args: Parameters<T>) => {
    const url = getUrl(...args);
    const options = getOptions ? getOptions(...args) : {};
    
    return requestDeduplication.deduplicate(
      () => apiFunction(...args),
      url,
      options
    );
  }) as T;
}

/**
 * Batch request utility to handle multiple requests efficiently
 */
export class BatchRequestManager {
  private batchQueue = new Map<string, Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    params: any;
  }>>();
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // 50ms delay to collect batch requests

  /**
   * Add a request to the batch queue
   */
  public async batchRequest<T>(
    batchKey: string,
    params: any,
    batchExecutor: (paramsList: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Add to batch queue
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, []);
      }
      
      this.batchQueue.get(batchKey)!.push({ resolve, reject, params });

      // Clear existing timeout and set new one
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      this.batchTimeout = setTimeout(async () => {
        await this.executeBatch(batchKey, batchExecutor);
      }, this.BATCH_DELAY);
    });
  }

  /**
   * Execute batched requests
   */
  private async executeBatch<T>(
    batchKey: string,
    batchExecutor: (paramsList: any[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batchQueue.get(batchKey);
    if (!batch || batch.length === 0) return;

    // Clear the batch
    this.batchQueue.delete(batchKey);

    try {
      const paramsList = batch.map(item => item.params);
      const results = await batchExecutor(paramsList);

      // Resolve all promises with corresponding results
      batch.forEach((item, index) => {
        if (results[index] !== undefined) {
          item.resolve(results[index]);
        } else {
          item.reject(new Error('No result for batch item'));
        }
      });
    } catch (error) {
      // Reject all promises with the error
      batch.forEach(item => {
        item.reject(error);
      });
    }
  }
}

// Export singleton instance
export const batchRequestManager = new BatchRequestManager();

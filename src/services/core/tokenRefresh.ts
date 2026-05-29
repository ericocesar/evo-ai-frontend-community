// Shared token-refresh state used by all axios instances (api, agentProcessorApi, etc.)
// Centralising the flag and queue here avoids multiple simultaneous refresh calls
// when several instances receive a 401 at the same time.

export let isRefreshing = false;

export let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

export function setIsRefreshing(value: boolean): void {
  isRefreshing = value;
}

export function processQueue(error: Error | null, token: string | null = null): void {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

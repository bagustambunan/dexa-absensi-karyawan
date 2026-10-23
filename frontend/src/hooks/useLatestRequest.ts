import { useCallback, useEffect, useRef } from "react";

type RequestCallbacks<T> = {
  onSuccess: (data: T) => void;
  onError: (error: unknown) => void;
  onFinally?: () => void;
};

export function useLatestRequest() {
  const latestRequest = useRef(0);
  const cancelRequest = useCallback(() => {
    latestRequest.current++;
  }, []);

  useEffect(() => cancelRequest, [cancelRequest]);

  const runRequest = useCallback(
    async <T>(request: () => Promise<T>, callbacks: RequestCallbacks<T>) => {
      const id = ++latestRequest.current;
      try {
        const data = await request();
        if (id === latestRequest.current) callbacks.onSuccess(data);
      } catch (error) {
        if (id === latestRequest.current) callbacks.onError(error);
      } finally {
        if (id === latestRequest.current) callbacks.onFinally?.();
      }
    },
    [],
  );

  return { runRequest, cancelRequest };
}

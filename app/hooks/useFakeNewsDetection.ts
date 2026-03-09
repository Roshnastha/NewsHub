import { useState, useCallback } from 'react';
import { predictNews, PredictionResponse, checkApiHealth } from '@/app/lib/api-client';

interface UseFakeNewsDetectionReturn {
  prediction: PredictionResponse | null;
  loading: boolean;
  error: string | null;
  apiAvailable: boolean;
  predict: (title: string, content: string) => Promise<void>;
  checkApi: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for fake news detection
 * Manages prediction state and API calls
 */
export function useFakeNewsDetection(): UseFakeNewsDetectionReturn {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(false);

  const checkApi = useCallback(async () => {
    try {
      const available = await checkApiHealth();
      setApiAvailable(available);
    } catch (err) {
      setApiAvailable(false);
    }
  }, []);

  const predict = useCallback(async (title: string, content: string) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await predictNews(title, content);
      setPrediction(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPrediction(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    prediction,
    loading,
    error,
    apiAvailable,
    predict,
    checkApi,
    reset,
  };
}

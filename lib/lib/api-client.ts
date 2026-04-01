/**
 * Video Deepfake Detection API Client
 * Communicates with FastAPI backend for ONNX video deepfake predictions
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface PredictionResponse {
  prediction: string;
  confidence: number;
  label: 'AI-generated' | 'Real';
  raw_probability: {
    'AI-generated': number;
    Real: number;
  };
  logits: number[][];
}

export interface ApiError {
  error: string;
  detail: string;
}

/**
 * Check if the API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Get API information
 */
export async function getApiInfo() {
  try {
    const response = await fetch(`${API_URL}/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch API info');
    return await response.json();
  } catch (error) {
    console.error('Error fetching API info:', error);
    return null;
  }
}

/**
 * Predict if video is AI-generated or real (deepfake detection)
 * @param videoFile - Video file from input
 */
export async function predictVideo(
  videoFile: File
): Promise<PredictionResponse | null> {
  try {
    // Check if API is available
    const isHealthy = await checkApiHealth();
    if (!isHealthy) {
      throw new Error('API server is not available');
    }

    // Validate file type
    const validVideoTypes = [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'video/x-flv'
    ];
    
    if (!validVideoTypes.includes(videoFile.type)) {
      throw new Error(`Invalid video format. Supported: mp4, avi, mov, mkv, flv`);
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', videoFile);

    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type - browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Prediction failed');
    }

    const data: PredictionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error in video prediction:', error);
    throw error;
  }
}

/**
 * Predict if news is fake or real (legacy - kept for compatibility)
 * @param title - News article title
 * @param content - News article content
 * @deprecated Use predictVideo instead for video deepfake detection
 */
export async function predictNews(
  title: string,
  content: string
): Promise<PredictionResponse | null> {
  try {
    // Check if API is available
    const isHealthy = await checkApiHealth();
    if (!isHealthy) {
      throw new Error('API server is not available');
    }

    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Prediction failed');
    }

    const data: PredictionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error in prediction:', error);
    throw error;
  }
}

/**
 * Get confidence level percentage
 */
export function getConfidencePercentage(confidence: number): number {
  return Math.round(confidence * 100);
}

/**
 * Format prediction for display
 */
export function formatPrediction(response: PredictionResponse): string {
  return response.prediction;
}

/**
 * Get prediction color based on label
 */
export function getPredictionColor(label: 'AI-generated' | 'Real'): string {
  if (label === 'AI-generated') {
    return '#ef4444'; // Red for AI-generated (deepfake)
  }
  return '#22c55e'; // Green for real
}


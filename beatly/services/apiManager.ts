import axios, { AxiosRequestConfig, isAxiosError } from 'axios';

/** Beatly API (MusicController). Override for device/emulator, e.g. http://10.0.2.2:5289/api on Android emulator. */
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5289/api').replace(/\/+$/, '');

function joinApiUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`API path must start with "/": got "${path}"`);
  }
  return `${BASE_URL}${path}`;
}

function messageFromResponseBody(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === 'string') {
    const t = data.trim();
    return t ? t.slice(0, 280) : null;
  }
  if (typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  for (const key of ['error', 'message', 'title', 'detail']) {
    const v = o[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

function messageFromAxiosError(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Request failed';
  }
  const data = error.response?.data;
  const body = messageFromResponseBody(data);
  if (body) return body;

  const status = error.response?.status;
  const reqUrl = error.config?.url ?? '';

  if (status === 422) return 'No playable stream for this track.';
  if (status === 503) return 'Music service unavailable (is metly-proxy running on port 3000?).';

  if (status === 404) {
    return `GET ${reqUrl} → 404. Restart beatly.API from this repo; in Development HTTPS redirect is disabled so use http://…:5289/api. Base is ${BASE_URL}.`;
  }

  return error.message || 'Request failed';
}

class ApiManager {
  static async apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios({
        ...config,
        url: joinApiUrl(typeof config.url === 'string' ? config.url : ''),
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const message = messageFromAxiosError(error);
      console.error('API Error:', message);
      throw new Error(message);
    }
  }
}

export default ApiManager;

import API_BASE_URL from '../config/api';

/**
 * Standardized API client for SafeRoute Mumbai
 * Supports:
 * - Base URL resolution
 * - AbortController signal forwarding and automatic timeout
 * - res.ok checking
 * - Production-safe error extraction
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    timeoutMs = 12000,
    signal: userSignal,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  // If user passed a signal (e.g. from debounce cancellation), listen to it
  if (userSignal) {
    userSignal.addEventListener('abort', () => {
      controller.abort();
    });
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || (
        response.status === 429
          ? "Too many requests. Please wait a moment before trying again."
          : response.status >= 500
            ? "Safety data service is temporarily unavailable. Please try again."
            : "Unable to load safety data. Please try again."
      );

      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (timedOut) {
      const timeoutErr = new Error("Safety data service is starting. This may take a moment. Please try again.");
      timeoutErr.isTimeout = true;
      timeoutErr.status = 408;
      throw timeoutErr;
    }

    if (error.name === 'AbortError') {
      // Intentional cancellation
      const abortErr = new Error("Request cancelled.");
      abortErr.isAborted = true;
      throw abortErr;
    }

    if (!error.status) {
      // Network failure / server offline
      const netErr = new Error("Unable to load safety data. Please try again.");
      netErr.original = error;
      throw netErr;
    }

    throw error;
  }
}

export default apiRequest;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message?: string | null;
  data?: T;
}

export interface ApiRequestResult<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
  status: number;
}

const DEFAULT_ERROR_MESSAGE = 'ارتباط با سرور برقرار نشد.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return isRecord(value) && typeof value.success === 'boolean';
}

export function getApiErrorMessage(
  body: unknown,
  defaultMessage = DEFAULT_ERROR_MESSAGE
): string {
  if (!isRecord(body)) {
    return defaultMessage;
  }

  const candidates = [body.message, body.Message, body.details, body.Details, body.title, body.Title];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  if (isRecord(body.data)) {
    const nested = getApiErrorMessage(body.data, '');
    if (nested) {
      return nested;
    }
  }

  return defaultMessage;
}

export async function apiRequest<T = unknown>(
  url: string,
  options?: RequestInit,
  defaultError = DEFAULT_ERROR_MESSAGE
): Promise<ApiRequestResult<T>> {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch {
    return { ok: false, message: defaultError, status: 0 };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!isApiEnvelope<T>(body)) {
    return {
      ok: response.ok,
      data: body as T,
      message: response.ok ? undefined : defaultError,
      status: response.status
    };
  }

  const ok = response.ok && body.success;
  const message = ok
    ? (typeof body.message === 'string' && body.message.trim() ? body.message : undefined)
    : getApiErrorMessage(body, defaultError);

  return {
    ok,
    data: body.data,
    message,
    status: response.status
  };
}

export async function withLoading<T>(
  setLoading: (loading: boolean) => void,
  action: () => Promise<T>
): Promise<T> {
  setLoading(true);
  try {
    return await action();
  } finally {
    setLoading(false);
  }
}

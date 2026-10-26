import {BASE_URL} from './config';
import type {ApiError, ApiErrorType} from './types';

const REQUEST_TIMEOUT_MS = 10_000;

function createApiError(
  type: ApiErrorType,
  status: number | null,
  message: string,
): ApiError {
  return {type, status, message};
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

async function request<T>(
  path: string,
  method: 'GET' | 'PATCH' | 'POST',
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : {'Content-Type': 'application/json'},
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let responseBody: unknown;
    if (responseText.length > 0) {
      try {
        responseBody = JSON.parse(responseText) as unknown;
      } catch {
        responseBody = responseText;
      }
    }

    if (!response.ok) {
      throw createApiError(
        'http',
        response.status,
        getErrorMessage(
          responseBody,
          response.statusText || `Yêu cầu thất bại (HTTP ${response.status}).`,
        ),
      );
    }

    if (responseText.length === 0) {
      return undefined as T;
    }
    if (typeof responseBody === 'string') {
      throw createApiError(
        'http',
        response.status,
        'Phản hồi từ máy chủ không phải JSON hợp lệ.',
      );
    }
    return responseBody as T;
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }
    if (timedOut) {
      throw createApiError(
        'timeout',
        null,
        'Yêu cầu đã quá thời gian chờ 10 giây.',
      );
    }
    throw createApiError(
      'network',
      null,
      error instanceof Error
        ? error.message
        : 'Không thể kết nối đến máy chủ.',
    );
  } finally {
    clearTimeout(timeout);
  }
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'status' in error &&
    'message' in error &&
    (error.type === 'network' ||
      error.type === 'timeout' ||
      error.type === 'http')
  );
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, 'GET');
  },
  patch<T, TBody>(path: string, body: TBody): Promise<T> {
    return request<T>(path, 'PATCH', body);
  },
  post<T, TBody>(path: string, body: TBody): Promise<T> {
    return request<T>(path, 'POST', body);
  },
};

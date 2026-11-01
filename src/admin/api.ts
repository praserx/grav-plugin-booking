type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export interface GravI18nBridge {
  dir?: string;
  locale?: string;
  t?: (key: string, values?: Record<string, string | number>) => string;
  has?: (key: string) => boolean;
  subscribe?: (callback: (locale: string) => void) => () => void;
}

declare global {
  interface Window {
    __GRAV_API_SERVER_URL?: string;
    __GRAV_API_PREFIX?: string;
    __GRAV_API_TOKEN?: string;
    __GRAV_PAGE_TAG?: string;
    __GRAV_DIALOGS?: {
      confirm?: (options: {
        title?: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        variant?: 'destructive' | 'default';
      }) => Promise<boolean>;
    };
    __GRAV_I18N?: GravI18nBridge;
  }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const server = String(window.__GRAV_API_SERVER_URL || '').replace(/\/$/, '');
  const prefix = String(window.__GRAV_API_PREFIX || '/api/v1').replace(/\/$/, '');
  const headers = new Headers(options.headers);
  if (window.__GRAV_API_TOKEN) headers.set('X-API-Token', window.__GRAV_API_TOKEN);

  let body: BodyInit | undefined;
  if (options.body instanceof FormData || options.body instanceof Blob || typeof options.body === 'string') {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${server}${prefix}/booking${path}`, {
    credentials: 'same-origin',
    ...options,
    headers,
    body,
  });
  let payload: Record<string, any> = {};
  try {
    const parsed = await response.json();
    if (parsed && typeof parsed === 'object') payload = parsed;
  } catch {
    // A non-JSON error is reported from the HTTP status below.
  }
  const data = payload.data ?? payload;
  if (!response.ok) {
    const message = data.message || data.error?.message || payload.message || `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return data as T;
}

export async function confirmAction(options: {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'destructive' | 'default';
}): Promise<boolean> {
  if (window.__GRAV_DIALOGS?.confirm) return window.__GRAV_DIALOGS.confirm(options);
  return window.confirm(`${options.title}\n\n${options.message}`);
}

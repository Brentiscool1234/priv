const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface CreateProjectPayload {
  business_name: string;
  industry: string;
  website_url?: string;
  wordpress_url?: string;
  primary_locale: string;
  secondary_locales?: string[];
  country?: string;
  profile?: {
    business_name?: string;
    description?: string;
    phone?: string;
    email?: string;
    booking_url?: string;
    years_in_business?: number;
    tone?: string;
  };
}

export interface CreateServicePayload {
  name: string;
  locale: string;
  description?: string;
}

export interface CreateLocationPayload {
  city: string;
  state_province?: string;
  country?: string;
  locale?: string;
}

export const api = {
  projects: {
    list: () => apiFetch<unknown[]>('/api/projects'),
    get: (id: string) => apiFetch<unknown>(`/api/projects/${id}`),
    create: (data: CreateProjectPayload) =>
      apiFetch<{ id: string }>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateProjectPayload>) =>
      apiFetch<unknown>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<unknown>(`/api/projects/${id}`, { method: 'DELETE' }),
  },

  services: {
    list: (projectId: string) => apiFetch<unknown[]>(`/api/projects/${projectId}/services`),
    create: (projectId: string, data: CreateServicePayload) =>
      apiFetch<unknown>(`/api/projects/${projectId}/services`, { method: 'POST', body: JSON.stringify(data) }),
  },

  locations: {
    list: (projectId: string) => apiFetch<unknown[]>(`/api/projects/${projectId}/locations`),
    create: (projectId: string, data: CreateLocationPayload) =>
      apiFetch<unknown>(`/api/projects/${projectId}/locations`, { method: 'POST', body: JSON.stringify(data) }),
  },

  sitemap: {
    list: (projectId: string) => apiFetch<unknown[]>(`/api/projects/${projectId}/sitemap`),
    generate: (projectId: string, opts?: { max_pages?: number }) =>
      apiFetch<unknown>(`/api/projects/${projectId}/sitemap/generate`, { method: 'POST', body: JSON.stringify(opts ?? {}) }),
    approveAll: (projectId: string) =>
      apiFetch<unknown>(`/api/projects/${projectId}/sitemap/approve-all`, { method: 'POST' }),
  },

  briefs: {
    list: (projectId: string) => apiFetch<unknown[]>(`/api/projects/${projectId}/briefs`),
    generate: (projectId: string) =>
      apiFetch<unknown>(`/api/projects/${projectId}/briefs/generate`, { method: 'POST' }),
  },

  content: {
    list: (projectId: string) => apiFetch<unknown[]>(`/api/projects/${projectId}/content`),
    generate: (projectId: string) =>
      apiFetch<unknown>(`/api/projects/${projectId}/content/generate`, { method: 'POST' }),
  },

  wordpress: {
    connect: (projectId: string, data: { wp_url: string; plugin_key: string }) =>
      apiFetch<{ connected: boolean; message: string }>(`/api/projects/${projectId}/wp/connect`, { method: 'POST', body: JSON.stringify(data) }),
    deploy: (projectId: string) =>
      apiFetch<unknown>(`/api/projects/${projectId}/wp/deploy`, { method: 'POST' }),
  },

  qa: {
    run: (projectId: string) =>
      apiFetch<unknown>(`/api/projects/${projectId}/qa/run`, { method: 'POST' }),
    report: (projectId: string) =>
      apiFetch<unknown>(`/api/projects/${projectId}/qa/report`),
  },
};

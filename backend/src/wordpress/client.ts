import fetch from 'node-fetch';
import { logger } from '../lib/logger';
import type { WPPageData, BulkResult, MenuItem, StatusResponse } from '../types';

export class WordPressClient {
  private readonly baseUrl: string;
  private readonly pluginKey: string;

  constructor(wpUrl: string, pluginKey: string) {
    // Normalize: strip trailing slash
    this.baseUrl = wpUrl.replace(/\/+$/, '');
    this.pluginKey = pluginKey;
  }

  // ─── Connection & Status ─────────────────────────────────────────────────

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.request('GET', '/wp-json/irents/v1/status');
      const body = (await res.json()) as { connected?: boolean; site_url?: string };
      if (res.ok) {
        return {
          success: true,
          message: `Connected to ${body.site_url ?? this.baseUrl}`,
        };
      }
      return { success: false, message: `HTTP ${res.status}: ${JSON.stringify(body)}` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Connection failed: ${msg}` };
    }
  }

  async getDeploymentStatus(): Promise<StatusResponse> {
    const res = await this.request('GET', '/wp-json/irents/v1/status');
    if (!res.ok) {
      throw new Error(`Failed to get deployment status: HTTP ${res.status}`);
    }
    return (await res.json()) as StatusResponse;
  }

  // ─── Page Management ─────────────────────────────────────────────────────

  async createPage(data: WPPageData): Promise<{ id: number; link: string }> {
    const payload = this.buildPagePayload(data);
    const res = await this.request('POST', '/wp-json/irents/v1/pages', payload);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to create page "${data.slug}": HTTP ${res.status} – ${body}`);
    }

    const json = (await res.json()) as { id: number; link: string };
    logger.info(`Created WP page: ${data.slug} → ID ${json.id}`);
    return json;
  }

  async updatePage(id: number, data: WPPageData): Promise<void> {
    const payload = this.buildPagePayload(data);
    const res = await this.request('PUT', `/wp-json/irents/v1/pages/${id}`, payload);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to update page ID ${id}: HTTP ${res.status} – ${body}`);
    }

    logger.info(`Updated WP page ID ${id}`);
  }

  async bulkCreatePages(pages: WPPageData[]): Promise<BulkResult> {
    const payload = {
      pages: pages.map((p) => this.buildPagePayload(p)),
    };

    const res = await this.request('POST', '/wp-json/irents/v1/pages/bulk-create', payload);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Bulk create failed: HTTP ${res.status} – ${body}`);
    }

    const json = (await res.json()) as BulkResult;
    logger.info(
      `Bulk create complete: ${json.created.length} created, ${json.failed.length} failed`
    );
    return json;
  }

  async setPageMeta(pageId: number, meta: Record<string, string>): Promise<void> {
    const res = await this.request('POST', `/wp-json/irents/v1/pages/${pageId}/meta`, { meta });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to set meta for page ${pageId}: HTTP ${res.status} – ${body}`);
    }
  }

  // ─── Menu Management ─────────────────────────────────────────────────────

  async createMenu(name: string, items: MenuItem[]): Promise<void> {
    const res = await this.request('POST', '/wp-json/irents/v1/menus', { name, items });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to create menu "${name}": HTTP ${res.status} – ${body}`);
    }

    logger.info(`Created WP menu: ${name}`);
  }

  async pushSettings(data: Record<string, unknown>): Promise<void> {
    const res = await this.request('POST', '/wp-json/irents/v1/settings', data);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to push settings: HTTP ${res.status} – ${body}`);
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private buildPagePayload(data: WPPageData): Record<string, unknown> {
    return {
      slug: data.slug,
      title: data.title,
      content: data.content,
      status: data.status ?? 'publish',
      meta: {
        _yoast_wpseo_title: data.meta_title ?? '',
        _yoast_wpseo_metadesc: data.meta_description ?? '',
        _schema_json: data.schema_json ? JSON.stringify(data.schema_json) : '',
      },
      ...(data.parent_id ? { parent: data.parent_id } : {}),
    };
  }

  private async request(
    method: string,
    path: string,
    body?: unknown
  ): Promise<Awaited<ReturnType<typeof fetch>>> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.pluginKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    return fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // 30 second timeout
      ...(process.env.WP_TIMEOUT ? { timeout: Number(process.env.WP_TIMEOUT) } : {}),
    });
  }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordPressClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const logger_1 = require("../lib/logger");
class WordPressClient {
    constructor(wpUrl, pluginKey) {
        // Normalize: strip trailing slash
        this.baseUrl = wpUrl.replace(/\/+$/, '');
        this.pluginKey = pluginKey;
    }
    // ─── Connection & Status ─────────────────────────────────────────────────
    async testConnection() {
        try {
            const res = await this.request('GET', '/wp-json/irents/v1/status');
            const body = (await res.json());
            if (res.ok) {
                return {
                    success: true,
                    message: `Connected to ${body.site_url ?? this.baseUrl}`,
                };
            }
            return { success: false, message: `HTTP ${res.status}: ${JSON.stringify(body)}` };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { success: false, message: `Connection failed: ${msg}` };
        }
    }
    async getDeploymentStatus() {
        const res = await this.request('GET', '/wp-json/irents/v1/status');
        if (!res.ok) {
            throw new Error(`Failed to get deployment status: HTTP ${res.status}`);
        }
        return (await res.json());
    }
    // ─── Page Management ─────────────────────────────────────────────────────
    async createPage(data) {
        const payload = this.buildPagePayload(data);
        const res = await this.request('POST', '/wp-json/irents/v1/pages', payload);
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Failed to create page "${data.slug}": HTTP ${res.status} – ${body}`);
        }
        const json = (await res.json());
        logger_1.logger.info(`Created WP page: ${data.slug} → ID ${json.id}`);
        return json;
    }
    async updatePage(id, data) {
        const payload = this.buildPagePayload(data);
        const res = await this.request('PUT', `/wp-json/irents/v1/pages/${id}`, payload);
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Failed to update page ID ${id}: HTTP ${res.status} – ${body}`);
        }
        logger_1.logger.info(`Updated WP page ID ${id}`);
    }
    async bulkCreatePages(pages) {
        const payload = {
            pages: pages.map((p) => this.buildPagePayload(p)),
        };
        const res = await this.request('POST', '/wp-json/irents/v1/pages/bulk-create', payload);
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Bulk create failed: HTTP ${res.status} – ${body}`);
        }
        const json = (await res.json());
        logger_1.logger.info(`Bulk create complete: ${json.created.length} created, ${json.failed.length} failed`);
        return json;
    }
    async setPageMeta(pageId, meta) {
        const res = await this.request('POST', `/wp-json/irents/v1/pages/${pageId}/meta`, { meta });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Failed to set meta for page ${pageId}: HTTP ${res.status} – ${body}`);
        }
    }
    // ─── Menu Management ─────────────────────────────────────────────────────
    async createMenu(name, items) {
        const res = await this.request('POST', '/wp-json/irents/v1/menus', { name, items });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Failed to create menu "${name}": HTTP ${res.status} – ${body}`);
        }
        logger_1.logger.info(`Created WP menu: ${name}`);
    }
    // ─── Private Helpers ─────────────────────────────────────────────────────
    buildPagePayload(data) {
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
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            Authorization: `Bearer ${this.pluginKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        return (0, node_fetch_1.default)(url, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            // 30 second timeout
            ...(process.env.WP_TIMEOUT ? { timeout: Number(process.env.WP_TIMEOUT) } : {}),
        });
    }
}
exports.WordPressClient = WordPressClient;
//# sourceMappingURL=client.js.map
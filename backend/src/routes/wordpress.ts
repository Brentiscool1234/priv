import { Router } from 'express';
import { getDb } from '../db/client';
import { WordPressClient } from '../wordpress/client';
import { deployPages } from '../wordpress/deployer';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';
import type { ConnectWordPressBody, DeployBody, BusinessProfile } from '../types';

export const wordpressRouter = Router({ mergeParams: true });

wordpressRouter.post('/connect', async (req, res) => {
  try {
    const db = getDb();
    const body = req.body as ConnectWordPressBody;
    if (!body.wp_url || !body.plugin_key) {
      res.status(400).json({ error: 'wp_url and plugin_key are required' });
      return;
    }

    const client = new WordPressClient(body.wp_url, body.plugin_key);
    const test = await client.testConnection();

    const id = uuidv4();
    const now = new Date().toISOString();
    const status = test.success ? 'ok' : 'error';

    // Upsert connection record
    const existing = db.prepare('SELECT id FROM wordpress_connections WHERE project_id = ?').get(( req.params as any).id) as { id: string } | undefined;
    if (existing) {
      db.prepare('UPDATE wordpress_connections SET wp_url = ?, plugin_key = ?, status = ?, last_checked = ? WHERE project_id = ?')
        .run(body.wp_url, body.plugin_key, status, now, ( req.params as any).id);
    } else {
      db.prepare('INSERT INTO wordpress_connections (id, project_id, wp_url, plugin_key, status, last_checked, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, ( req.params as any).id, body.wp_url, body.plugin_key, status, now, now);
    }

    res.json({ connected: test.success, message: test.message });
  } catch (err) {
    logger.error('WP connect error', { err });
    res.status(500).json({ error: String(err) });
  }
});

wordpressRouter.get('/status', async (req, res) => {
  const db = getDb();
  const conn = db.prepare('SELECT * FROM wordpress_connections WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(( req.params as any).id) as { wp_url: string; plugin_key: string; status: string } | undefined;
  if (!conn) return res.json({ connected: false, message: 'No WordPress connection configured' });
  const client = new WordPressClient(conn.wp_url, conn.plugin_key);
  const test = await client.testConnection();
  res.json({ connected: test.success, message: test.message, wp_url: conn.wp_url });
});

wordpressRouter.post('/deploy', async (req, res) => {
  try {
    const db = getDb();
    const projectId = ( req.params as any).id;
    const body = req.body as DeployBody;

    const conn = db.prepare('SELECT * FROM wordpress_connections WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(projectId) as { wp_url: string; plugin_key: string } | undefined;
    if (!conn) {
      res.status(400).json({ error: 'No WordPress connection configured. Use POST /wp/connect first.' });
      return;
    }

    const profileRow = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(projectId) as Record<string, unknown> | undefined;
    const profile: BusinessProfile = profileRow
      ? {
          id: profileRow['id'] as string,
          project_id: projectId,
          business_name: profileRow['business_name'] as string | undefined,
          description: profileRow['description'] as string | undefined,
          phone: profileRow['phone'] as string | undefined,
          email: profileRow['email'] as string | undefined,
          booking_url: profileRow['booking_url'] as string | undefined,
          years_in_business: profileRow['years_in_business'] as number | undefined,
          trust_points: tryParse(profileRow['trust_points'], []) as string[],
          brand_colors: tryParse(profileRow['brand_colors'], {}) as Record<string, string>,
          logo_url: profileRow['logo_url'] as string | undefined,
          tone: profileRow['tone'] as string | undefined,
          target_customer: profileRow['target_customer'] as string | undefined,
          data: tryParse(profileRow['data'], {}) as Record<string, unknown>,
        }
      : { id: '', project_id: projectId, trust_points: [], brand_colors: {}, data: {} };

    const deployment = await deployPages(projectId, conn.wp_url, conn.plugin_key, profile, {
      page_ids: body.page_ids,
      force: body.force,
    });
    res.json(deployment);
  } catch (err) {
    logger.error('Deploy error', { err });
    res.status(500).json({ error: String(err) });
  }
});

wordpressRouter.get('/deploy/:deployId', (req, res) => {
  const db = getDb();
  const dep = db.prepare('SELECT * FROM deployments WHERE id = ? AND project_id = ?').get(( req.params as any).deployId, ( req.params as any).id);
  if (!dep) return res.status(404).json({ error: 'Deployment not found' });
  res.json({ ...(dep as Record<string, unknown>), log: tryParse((dep as any).log, []) });
});

function tryParse(val: unknown, fallback: unknown): unknown {
  try { return val ? JSON.parse(val as string) : fallback; } catch { return fallback; }
}

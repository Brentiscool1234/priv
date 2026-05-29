'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { api } from '@/lib/api';
import PageTypeBadge from '@/components/PageTypeBadge';
import StatusBadge from '@/components/StatusBadge';
import { PageType } from '@/types';

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Briefs', href: '/briefs' },
  { label: 'Content', href: '/content' },
  { label: 'Deploy', href: '/deploy' },
  { label: 'QA', href: '/qa' },
];

const PAGE_TYPES: PageType[] = ['homepage', 'service', 'location', 'service_location', 'about', 'faq', 'contact'];
const selectClass = 'bg-slate-800 border border-slate-600 text-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function SitemapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<PageType | 'all'>('all');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = async () => {
    try {
      const data = await api.sitemap.list(id);
      setPages(data as any[]);
    } catch {
      setMessage({ text: 'Failed to load sitemap', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleGenerate = async () => {
    setWorking(true);
    setMessage(null);
    try {
      const result = await api.sitemap.generate(id) as any;
      await api.sitemap.approveAll(id);
      setMessage({ text: `Generated ${result.count ?? 0} pages.` });
      await load();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed', error: true });
    } finally {
      setWorking(false);
    }
  };

  const filtered = pages.filter((p) => {
    if (typeFilter !== 'all' && p.page_type !== typeFilter) return false;
    if (langFilter !== 'all' && p.locale !== langFilter) return false;
    return true;
  });

  const locales = [...new Set(pages.map((p) => p.locale))];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <Link href="/projects" className="hover:text-slate-200">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:text-slate-200">Project</Link>
          <span>/</span>
          <span className="text-slate-200">Sitemap</span>
        </div>
        <div className="border-b border-slate-700">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <Link key={tab.label} href={`/projects/${id}${tab.href}`}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab.href === '/sitemap' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Sitemap</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} pages</p>
        </div>
        <button onClick={handleGenerate} disabled={working}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-md text-sm transition-colors">
          {working ? 'Generating…' : pages.length > 0 ? 'Regenerate Sitemap' : 'Generate Sitemap'}
        </button>
      </div>

      {message && (
        <p className={`text-sm px-3 py-2 rounded-md ${message.error ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as PageType | 'all')} className={selectClass}>
          <option value="all">All Types</option>
          {PAGE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)} className={selectClass}>
          <option value="all">All Languages</option>
          {locales.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Language</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-slate-300">{page.slug}</td>
                    <td className="px-4 py-3"><PageTypeBadge type={page.page_type} /></td>
                    <td className="px-4 py-3 text-sm text-slate-400">{page.locale}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{page.priority}</td>
                    <td className="px-4 py-3"><StatusBadge status={page.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                {pages.length === 0 ? 'No pages yet — click Generate Sitemap to start.' : 'No pages match filters.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

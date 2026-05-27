'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { MOCK_SITEMAP } from '@/lib/mockData';
import PageTypeBadge from '@/components/PageTypeBadge';
import StatusBadge from '@/components/StatusBadge';
import { PageType, PageStatus } from '@/types';

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Briefs', href: '/briefs' },
  { label: 'Content', href: '/content' },
  { label: 'Deploy', href: '/deploy' },
  { label: 'QA', href: '/qa' },
];

const PAGE_TYPES: PageType[] = ['homepage', 'service', 'location', 'service_location', 'about', 'faq', 'contact'];
const PAGE_STATUSES: PageStatus[] = ['pending', 'generating', 'generated', 'approved'];

export default function SitemapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [typeFilter, setTypeFilter] = useState<PageType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'all'>('all');
  const [langFilter, setLangFilter] = useState<string>('all');

  const pages = MOCK_SITEMAP.filter((p) => p.project_id === id || true);

  const filtered = pages.filter((p) => {
    if (typeFilter !== 'all' && p.page_type !== typeFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (langFilter !== 'all' && p.locale !== langFilter) return false;
    return true;
  });

  const selectClass = 'bg-slate-800 border border-slate-600 text-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Tab Nav */}
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
            {TABS.map((tab) => {
              const href = `/projects/${id}${tab.href}`;
              const isActive = tab.href === '/sitemap';
              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sitemap</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} pages</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors">
            Approve All
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors">
            Generate Sitemap
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors">
            Generate Content
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as PageType | 'all')} className={selectClass}>
          <option value="all">All Types</option>
          {PAGE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PageStatus | 'all')} className={selectClass}>
          <option value="all">All Statuses</option>
          {PAGE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)} className={selectClass}>
          <option value="all">All Languages</option>
          <option value="en-US">en-US</option>
          <option value="en-GB">en-GB</option>
          <option value="nl-BE">nl-BE</option>
          <option value="fr-BE">fr-BE</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Language</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">H1</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.map((page) => (
                <tr key={page.id} className="hover:bg-slate-700/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-slate-300">{page.slug}</td>
                  <td className="px-4 py-3">
                    <PageTypeBadge type={page.page_type} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{page.locale}</td>
                  <td className="px-4 py-3 text-sm text-slate-300 max-w-xs truncate">{page.h1}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={page.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                        Approve
                      </button>
                      <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                        Edit
                      </button>
                      <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                        Regen
                      </button>
                      <button className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No pages match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { MOCK_BRIEFS } from '@/lib/mockData';
import PageTypeBadge from '@/components/PageTypeBadge';
import StatusBadge from '@/components/StatusBadge';
import { PageBrief } from '@/types';

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Briefs', href: '/briefs' },
  { label: 'Content', href: '/content' },
  { label: 'Deploy', href: '/deploy' },
  { label: 'QA', href: '/qa' },
];

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export default function BriefsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedBrief, setSelectedBrief] = useState<PageBrief | null>(null);
  const [editH1, setEditH1] = useState('');
  const [editMetaTitle, setEditMetaTitle] = useState('');
  const [editMetaDesc, setEditMetaDesc] = useState('');

  const openBrief = (brief: PageBrief) => {
    setSelectedBrief(brief);
    setEditH1(brief.h1);
    setEditMetaTitle(brief.meta_title);
    setEditMetaDesc(brief.meta_description);
  };

  const inputClass = 'w-full bg-slate-900 border border-slate-600 text-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Tab Nav */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <Link href="/projects" className="hover:text-slate-200">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:text-slate-200">Project</Link>
          <span>/</span>
          <span className="text-slate-200">Briefs</span>
        </div>
        <div className="border-b border-slate-700">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const href = `/projects/${id}${tab.href}`;
              const isActive = tab.href === '/briefs';
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Page Briefs</h1>
          <p className="text-slate-400 text-sm mt-1">{MOCK_BRIEFS.length} briefs</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors">
          Generate Briefs
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">H1</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Meta Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Meta Desc</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Keyword</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Schema</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {MOCK_BRIEFS.map((brief) => (
                <tr
                  key={brief.id}
                  onClick={() => openBrief(brief)}
                  className="hover:bg-slate-700/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-slate-300">{brief.slug}</td>
                  <td className="px-4 py-3 text-sm text-slate-300 max-w-[160px] truncate">{brief.h1}</td>
                  <td className="px-4 py-3 text-sm text-slate-400 max-w-[180px] truncate">{truncate(brief.meta_title, 40)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400 max-w-[200px] truncate">{truncate(brief.meta_description, 50)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400 max-w-[140px] truncate">{brief.primary_keyword}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{brief.schema_types.join(', ')}</td>
                  <td className="px-4 py-3"><StatusBadge status={brief.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSelectedBrief(null)}
          />
          {/* Panel */}
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-base font-semibold text-white">Brief Details</h2>
                <p className="text-xs text-slate-400 font-mono">{selectedBrief.slug}</p>
              </div>
              <button
                onClick={() => setSelectedBrief(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              <div className="flex gap-2">
                <PageTypeBadge type={selectedBrief.page_type} />
                <StatusBadge status={selectedBrief.status} />
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{selectedBrief.locale}</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">H1</label>
                <input type="text" value={editH1} onChange={(e) => setEditH1(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Meta Title ({editMetaTitle.length} chars)</label>
                <input type="text" value={editMetaTitle} onChange={(e) => setEditMetaTitle(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Meta Description ({editMetaDesc.length} chars)</label>
                <textarea value={editMetaDesc} onChange={(e) => setEditMetaDesc(e.target.value)} rows={3} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Primary Keyword</label>
                <p className="text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded-md">{selectedBrief.primary_keyword}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Secondary Keywords</label>
                <div className="flex flex-wrap gap-1">
                  {selectedBrief.secondary_keywords.map((kw) => (
                    <span key={kw} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{kw}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Schema Types</label>
                <div className="flex flex-wrap gap-1">
                  {selectedBrief.schema_types.map((s) => (
                    <span key={s} className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Word Count</label>
                <p className="text-sm text-slate-300">{selectedBrief.word_count_target} words</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBrief(null)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Cancel
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

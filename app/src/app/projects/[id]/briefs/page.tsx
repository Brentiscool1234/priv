'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { api } from '@/lib/api';
import PageTypeBadge from '@/components/PageTypeBadge';
import StatusBadge from '@/components/StatusBadge';

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Briefs', href: '/briefs' },
  { label: 'Content', href: '/content' },
  { label: 'Deploy', href: '/deploy' },
  { label: 'QA', href: '/qa' },
];

function truncate(str: string = '', n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

const inputClass = 'w-full bg-slate-900 border border-slate-600 text-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function BriefsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<any | null>(null);
  const [editH1, setEditH1] = useState('');
  const [editMetaTitle, setEditMetaTitle] = useState('');
  const [editMetaDesc, setEditMetaDesc] = useState('');

  const load = async () => {
    try {
      const data = await api.briefs.list(id);
      setBriefs(data as any[]);
    } catch {
      setMessage({ text: 'Failed to load briefs', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const openBrief = (brief: any) => {
    setSelectedBrief(brief);
    setEditH1(brief.h1 ?? '');
    setEditMetaTitle(brief.meta_title ?? '');
    setEditMetaDesc(brief.meta_description ?? '');
  };

  const handleGenerate = async () => {
    setWorking(true);
    setMessage(null);
    try {
      const result = await api.briefs.generate(id) as any;
      setMessage({ text: `Generated ${result.generated ?? 0} briefs.` });
      await load();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed', error: true });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6">
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
            {TABS.map((tab) => (
              <Link key={tab.label} href={`/projects/${id}${tab.href}`}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab.href === '/briefs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Page Briefs</h1>
          <p className="text-slate-400 text-sm mt-1">{briefs.length} briefs</p>
        </div>
        <button onClick={handleGenerate} disabled={working}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-md text-sm transition-colors">
          {working ? 'Generating…' : briefs.length > 0 ? 'Regenerate Briefs' : 'Generate Briefs'}
        </button>
      </div>

      {message && (
        <p className={`text-sm px-3 py-2 rounded-md ${message.error ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
          {message.text}
        </p>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">H1</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Meta Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Keyword</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {briefs.map((brief) => (
                  <tr key={brief.id} onClick={() => openBrief(brief)}
                    className="hover:bg-slate-700/40 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-slate-300">{brief.slug}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 max-w-[160px] truncate">{brief.h1}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 max-w-[200px] truncate">{truncate(brief.meta_title, 45)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 max-w-[140px] truncate">{brief.primary_keyword}</td>
                    <td className="px-4 py-3"><StatusBadge status={brief.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {briefs.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No briefs yet — generate the sitemap first, then click Generate Briefs.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-over */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelectedBrief(null)} />
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-base font-semibold text-white">Brief Details</h2>
                <p className="text-xs text-slate-400 font-mono">{selectedBrief.slug}</p>
              </div>
              <button onClick={() => setSelectedBrief(null)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              <div className="flex gap-2 flex-wrap">
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
              {selectedBrief.primary_keyword && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Primary Keyword</label>
                  <p className="text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded-md">{selectedBrief.primary_keyword}</p>
                </div>
              )}
              {selectedBrief.secondary_keywords?.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Secondary Keywords</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedBrief.secondary_keywords.map((kw: string) => (
                      <span key={kw} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedBrief.schema_types?.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Schema Types</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedBrief.schema_types.map((s: string) => (
                      <span key={s} className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 px-2 py-1 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

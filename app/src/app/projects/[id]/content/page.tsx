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

export default function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [previewPage, setPreviewPage] = useState<any | null>(null);

  const load = async () => {
    try {
      const data = await api.content.list(id);
      setPages(data as any[]);
    } catch {
      setMessage({ text: 'Failed to load content', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleGenerate = async () => {
    setWorking(true);
    setMessage(null);
    try {
      const result = await api.content.generate(id) as any;
      setMessage({ text: `Queued ${result.queued ?? 0} pages. Content generates in the background — refresh in a moment.` });
      setTimeout(load, 5000);
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
          <span className="text-slate-200">Content</span>
        </div>
        <div className="border-b border-slate-700">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <Link key={tab.label} href={`/projects/${id}${tab.href}`}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab.href === '/content' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Generated Content</h1>
          <p className="text-slate-400 text-sm mt-1">{pages.length} pages</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors">
            Refresh
          </button>
          <button onClick={handleGenerate} disabled={working}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-md text-sm transition-colors">
            {working ? 'Queuing…' : 'Generate Content'}
          </button>
        </div>
      </div>

      {message && (
        <p className={`text-sm px-3 py-2 rounded-md ${message.error ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
          {message.text}
        </p>
      )}

      {loading ? (
        <div className="py-12 text-center"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="space-y-3">
          {pages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-800 border border-slate-700 rounded-xl">
              No content yet — generate briefs first, then click Generate Content.
            </div>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <PageTypeBadge type={page.page_type} />
                      <StatusBadge status={page.status} />
                      <span className="text-xs text-slate-500">{page.locale}</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{page.h1 || page.slug}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{page.slug}</p>
                    {page.generated_at && (
                      <p className="text-xs text-slate-500 mt-1">Generated: {new Date(page.generated_at).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {(page.content_html || page.html_content) && (
                      <button onClick={() => setPreviewPage(page)}
                        className="text-xs text-blue-400 hover:text-blue-300 bg-slate-900 px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                        Preview
                      </button>
                    )}
                    {page.wp_page_id && (
                      <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">Deployed</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setPreviewPage(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-base font-semibold text-white">{previewPage.h1 || previewPage.slug}</h2>
                <p className="text-xs text-slate-400 font-mono">{previewPage.slug}</p>
              </div>
              <button onClick={() => setPreviewPage(null)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-white rounded-lg p-6 text-slate-900">
                <div dangerouslySetInnerHTML={{ __html: previewPage.content_html || previewPage.html_content || '<p class="text-slate-400 italic">No content yet.</p>' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

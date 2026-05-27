'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { MOCK_CONTENT } from '@/lib/mockData';
import PageTypeBadge from '@/components/PageTypeBadge';
import StatusBadge from '@/components/StatusBadge';
import { GeneratedPage } from '@/types';

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
  const [previewPage, setPreviewPage] = useState<GeneratedPage | null>(null);

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Tab Nav */}
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
            {TABS.map((tab) => {
              const href = `/projects/${id}${tab.href}`;
              const isActive = tab.href === '/content';
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
          <h1 className="text-xl font-bold text-white">Generated Content</h1>
          <p className="text-slate-400 text-sm mt-1">{MOCK_CONTENT.length} pages</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors">
          Generate Content
        </button>
      </div>

      {/* Content list */}
      <div className="space-y-3">
        {MOCK_CONTENT.map((page) => (
          <div key={page.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <PageTypeBadge type={page.page_type} />
                  <StatusBadge status={page.status} />
                  <span className="text-xs text-slate-500">{page.locale}</span>
                </div>
                <p className="text-sm font-medium text-white truncate">{page.h1}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{page.slug}</p>
                {page.generated_at && (
                  <p className="text-xs text-slate-500 mt-1">
                    Generated: {new Date(page.generated_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => setPreviewPage(page)}
                  className="text-xs text-blue-400 hover:text-blue-300 bg-slate-900 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                >
                  Preview
                </button>
                {page.status === 'generated' && (
                  <button className="text-xs text-green-400 hover:text-green-300 bg-slate-900 px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                    Approve
                  </button>
                )}
                <button className="text-xs text-slate-400 hover:text-white bg-slate-900 px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setPreviewPage(null)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-base font-semibold text-white">{previewPage.h1}</h2>
                <p className="text-xs text-slate-400 font-mono">{previewPage.slug}</p>
              </div>
              <button
                onClick={() => setPreviewPage(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-white rounded-lg p-6 text-slate-900">
                {previewPage.html_content ? (
                  <div dangerouslySetInnerHTML={{ __html: previewPage.html_content }} />
                ) : (
                  <p className="text-slate-400 italic">No content generated yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

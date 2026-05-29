'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { api } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Briefs', href: '/briefs' },
  { label: 'Content', href: '/content' },
  { label: 'Deploy', href: '/deploy' },
  { label: 'QA', href: '/qa' },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.projects.get(id)
      .then((p) => setProject(p))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load project'));
  }, [id]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-2">{error}</p>
        <p className="text-sm text-slate-500">Make sure the backend is running on port 4000.</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const secondaryLocales: string[] = Array.isArray(project.secondary_locales)
    ? project.secondary_locales
    : JSON.parse(project.secondary_locales ?? '[]');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/projects" className="hover:text-slate-200 transition-colors">Projects</Link>
            <span>/</span>
            <span className="text-slate-200">{project.business_name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{project.business_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={project.status} />
            <span className="text-sm text-slate-400 capitalize">{project.industry?.replace(/_/g, ' ')}</span>
            <span className="text-sm text-slate-400">{project.primary_locale}</span>
            <span className="text-sm text-slate-400">{project.page_count ?? 0} pages</span>
          </div>
        </div>
        <Link
          href={`/projects/${id}/deploy`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
        >
          Deploy
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700">
        <nav className="flex gap-1">
          {TABS.map((tab) => {
            const href = `/projects/${id}${tab.href}`;
            const isActive = tab.href === '';
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Business Info</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-slate-500">Industry</dt>
              <dd className="text-sm text-slate-200 capitalize">{project.industry?.replace(/_/g, ' ')}</dd>
            </div>
            {project.website_url && (
              <div>
                <dt className="text-xs text-slate-500">Website</dt>
                <dd className="text-sm text-slate-200 truncate">{project.website_url}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-slate-500">Created</dt>
              <dd className="text-sm text-slate-200">{new Date(project.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Language Config</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-slate-500">Primary Locale</dt>
              <dd className="text-sm text-slate-200">{project.primary_locale}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Secondary Locales</dt>
              <dd className="text-sm text-slate-200">{secondaryLocales.length > 0 ? secondaryLocales.join(', ') : 'None'}</dd>
            </div>
            {project.profile?.tone && (
              <div>
                <dt className="text-xs text-slate-500">Tone</dt>
                <dd className="text-sm text-slate-200 capitalize">{project.profile.tone}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">WordPress</h3>
          <dl className="space-y-2">
            {project.wp_connection ? (
              <>
                <div>
                  <dt className="text-xs text-slate-500">URL</dt>
                  <dd className="text-sm text-slate-200 truncate">{project.wp_connection.wp_url}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Status</dt>
                  <dd className={`text-sm font-medium ${project.wp_connection.status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                    {project.wp_connection.status === 'ok' ? 'Connected' : 'Error'}
                  </dd>
                </div>
              </>
            ) : (
              <div>
                <dd className="text-sm text-slate-500">Not configured</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Services & Locations */}
      {(project.services?.length > 0 || project.locations?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.services?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Services ({project.services.length})</h3>
              <ul className="space-y-1">
                {project.services.slice(0, 8).map((s: any) => (
                  <li key={s.id} className="text-sm text-slate-200">{s.name}</li>
                ))}
                {project.services.length > 8 && (
                  <li className="text-xs text-slate-500">+{project.services.length - 8} more</li>
                )}
              </ul>
            </div>
          )}
          {project.locations?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Locations ({project.locations.length})</h3>
              <ul className="space-y-1">
                {project.locations.slice(0, 8).map((l: any) => (
                  <li key={l.id} className="text-sm text-slate-200">{l.city}{l.state_province ? `, ${l.state_province}` : ''}</li>
                ))}
                {project.locations.length > 8 && (
                  <li className="text-xs text-slate-500">+{project.locations.length - 8} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Pipeline</h3>
        <div className="flex flex-wrap gap-3">
          <Link href={`/projects/${id}/deploy`} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors">
            Go to Deploy
          </Link>
          <Link href={`/projects/${id}/sitemap`} className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors">
            Sitemap
          </Link>
          <Link href={`/projects/${id}/content`} className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors">
            Content
          </Link>
          <Link href={`/projects/${id}/qa`} className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors">
            QA
          </Link>
        </div>
      </div>
    </div>
  );
}

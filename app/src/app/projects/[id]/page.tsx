import Link from 'next/link';
import { MOCK_PROJECTS } from '@/lib/mockData';
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

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = MOCK_PROJECTS.find((p) => p.id === id) ?? MOCK_PROJECTS[0];

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
            <span className="text-sm text-slate-400 capitalize">{project.industry.replace(/_/g, ' ')}</span>
            <span className="text-sm text-slate-400">{project.primary_locale}</span>
            <span className="text-sm text-slate-400">{project.page_count} pages</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors">
            Edit
          </button>
          <Link
            href={`/projects/${id}/deploy`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
          >
            Deploy
          </Link>
        </div>
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

      {/* Overview Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Business Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Business Info</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-slate-500">Industry</dt>
              <dd className="text-sm text-slate-200 capitalize">{project.industry.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Country</dt>
              <dd className="text-sm text-slate-200">{project.country}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Created</dt>
              <dd className="text-sm text-slate-200">
                {new Date(project.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Language Config */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Language Config</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-slate-500">Primary Locale</dt>
              <dd className="text-sm text-slate-200">{project.primary_locale}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Secondary Locales</dt>
              <dd className="text-sm text-slate-200">
                {project.secondary_locales.length > 0
                  ? project.secondary_locales.join(', ')
                  : 'None'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Generation Stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Generation Stats</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-slate-500">Total Pages</dt>
              <dd className="text-2xl font-bold text-white">{project.page_count}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Status</dt>
              <dd className="mt-1"><StatusBadge status={project.status} /></dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/projects/${id}/sitemap`}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors"
          >
            Generate Sitemap
          </Link>
          <Link
            href={`/projects/${id}/briefs`}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors"
          >
            Generate Briefs
          </Link>
          <Link
            href={`/projects/${id}/content`}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors"
          >
            Generate Content
          </Link>
          <Link
            href={`/projects/${id}/deploy`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
          >
            Deploy to WordPress
          </Link>
          <Link
            href={`/projects/${id}/qa`}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors"
          >
            Run QA
          </Link>
        </div>
      </div>
    </div>
  );
}

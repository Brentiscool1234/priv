'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { MOCK_QA_REPORT } from '@/lib/mockData';
import { QAStatus } from '@/types';

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Briefs', href: '/briefs' },
  { label: 'Content', href: '/content' },
  { label: 'Deploy', href: '/deploy' },
  { label: 'QA', href: '/qa' },
];

const STATUS_FILTER_OPTIONS: { value: QAStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pass', label: 'Pass' },
  { value: 'warning', label: 'Warning' },
  { value: 'fail', label: 'Fail' },
];

const QA_STATUS_STYLES: Record<QAStatus, string> = {
  pass: 'bg-green-800 text-green-200',
  warning: 'bg-yellow-800 text-yellow-200',
  fail: 'bg-red-800 text-red-200',
};

export default function QAPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [statusFilter, setStatusFilter] = useState<QAStatus | 'all'>('all');
  const report = MOCK_QA_REPORT;

  const filteredIssues = report.issues.filter((issue) =>
    statusFilter === 'all' ? true : issue.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Tab Nav */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <Link href="/projects" className="hover:text-slate-200">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:text-slate-200">Project</Link>
          <span>/</span>
          <span className="text-slate-200">QA</span>
        </div>
        <div className="border-b border-slate-700">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const href = `/projects/${id}${tab.href}`;
              const isActive = tab.href === '/qa';
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
          <h1 className="text-xl font-bold text-white">QA Report</h1>
          <p className="text-slate-400 text-sm mt-1">
            Last run: {new Date(report.run_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-md text-sm transition-colors">
            Export Report
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors">
            Run QA
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-5">
          <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Pass</p>
          <p className="text-3xl font-bold text-green-300">{report.pass_count}</p>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-5">
          <p className="text-xs text-yellow-400 uppercase tracking-wider mb-1">Warning</p>
          <p className="text-3xl font-bold text-yellow-300">{report.warning_count}</p>
        </div>
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-5">
          <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Fail</p>
          <p className="text-3xl font-bold text-red-300">{report.fail_count}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Issues Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Page</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Check</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredIssues.map((issue, idx) => (
                <tr key={idx} className="hover:bg-slate-700/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-slate-300">{issue.page_slug}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{issue.check_name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${QA_STATUS_STYLES[issue.status]}`}>
                      {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{issue.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredIssues.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">No issues match the selected filter.</div>
        )}
      </div>
    </div>
  );
}

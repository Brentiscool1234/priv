'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { MOCK_DEPLOY_LOGS } from '@/lib/mockData';
import { DeploymentLog } from '@/types';

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Briefs', href: '/briefs' },
  { label: 'Content', href: '/content' },
  { label: 'Deploy', href: '/deploy' },
  { label: 'QA', href: '/qa' },
];

const DEPLOY_ACTIONS = [
  { label: 'Test Connection', key: 'test', color: 'bg-slate-700 hover:bg-slate-600 text-slate-200' },
  { label: 'Deploy Templates', key: 'templates', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { label: 'Create Pages', key: 'create', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { label: 'Update Pages', key: 'update', color: 'bg-slate-700 hover:bg-slate-600 text-slate-200' },
  { label: 'Generate Sitemap', key: 'sitemap', color: 'bg-slate-700 hover:bg-slate-600 text-slate-200' },
  { label: 'Run QA', key: 'qa', color: 'bg-green-600 hover:bg-green-700 text-white' },
];

function LogStatusDot({ status }: { status: DeploymentLog['status'] }) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    running: 'bg-blue-500 animate-pulse',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />;
}

export default function DeployPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [logs, setLogs] = useState<DeploymentLog[]>(MOCK_DEPLOY_LOGS);
  const [progress, setProgress] = useState<number | null>(null);
  const [wpStatus] = useState<'connected' | 'disconnected'>('connected');

  const runAction = async (key: string) => {
    setProgress(0);
    const newLog: DeploymentLog = {
      id: Date.now().toString(),
      project_id: id,
      action: DEPLOY_ACTIONS.find((a) => a.key === key)?.label ?? key,
      status: 'running',
      message: 'Running...',
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);

    // Simulate progress
    for (let i = 10; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 150));
      setProgress(i);
    }

    setLogs((prev) =>
      prev.map((l) =>
        l.id === newLog.id
          ? { ...l, status: 'success', message: `${newLog.action} completed successfully.` }
          : l
      )
    );
    setProgress(null);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Tab Nav */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <Link href="/projects" className="hover:text-slate-200">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:text-slate-200">Project</Link>
          <span>/</span>
          <span className="text-slate-200">Deploy</span>
        </div>
        <div className="border-b border-slate-700">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const href = `/projects/${id}${tab.href}`;
              const isActive = tab.href === '/deploy';
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

      <h1 className="text-xl font-bold text-white">Deploy</h1>

      {/* WordPress Connection Status */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">WordPress Connection</h2>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${wpStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${wpStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
              {wpStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <dt className="text-slate-500">URL</dt>
          <dd className="text-slate-200 col-span-1">https://partyperfect.com</dd>
          <dt className="text-slate-500">Last Tested</dt>
          <dd className="text-slate-200">Jan 20, 2024 09:00</dd>
          <dt className="text-slate-500">Plugin Status</dt>
          <dd className="text-green-400">Active</dd>
        </dl>
      </div>

      {/* Action Buttons */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-4">Deployment Actions</h2>
        <div className="flex flex-wrap gap-3">
          {DEPLOY_ACTIONS.map((action) => (
            <button
              key={action.key}
              onClick={() => runAction(action.key)}
              disabled={progress !== null}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${action.color}`}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        {progress !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Running...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Deployment Log */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-base font-semibold text-white">Deployment Log</h2>
        </div>
        <div className="divide-y divide-slate-700">
          {logs.map((log) => (
            <div key={log.id} className="px-5 py-3 flex items-start gap-3">
              <LogStatusDot status={log.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">{log.action}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    log.status === 'success' ? 'bg-green-900/50 text-green-400' :
                    log.status === 'error' ? 'bg-red-900/50 text-red-400' :
                    'bg-blue-900/50 text-blue-400'
                  }`}>
                    {log.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{log.message}</p>
              </div>
              <span className="text-xs text-slate-500 flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
        {logs.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">No deployment actions yet.</div>
        )}
      </div>
    </div>
  );
}

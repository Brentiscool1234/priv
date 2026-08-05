'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { api } from '@/lib/api';

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Briefs', href: '/briefs' },
  { label: 'Content', href: '/content' },
  { label: 'Deploy', href: '/deploy' },
  { label: 'QA', href: '/qa' },
];

type StepStatus = 'idle' | 'running' | 'done' | 'error';

type PipelineState = {
  sitemap: number;
  briefs: number;
  content_done: number;
  content_total: number;
  content_generating: number;
  deployed: number;
  wp_connected: boolean;
  wp_url: string;
};

type LogEntry = {
  id: string;
  step: string;
  status: 'running' | 'success' | 'error';
  message: string;
  ts: string;
};

export default function DeployPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pipeline, setPipeline] = useState<PipelineState | null>(null);
  const [stepStatus, setStepStatus] = useState<Record<string, StepStatus>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const [project, wpSt, sitemap, briefs, content] = await Promise.all([
        api.projects.get(id) as Promise<any>,
        api.wordpress.status(id).catch(() => ({ connected: false, message: '', wp_url: '' })),
        api.sitemap.list(id).catch(() => [] as unknown[]),
        api.briefs.list(id).catch(() => [] as unknown[]),
        api.content.list(id).catch(() => [] as unknown[]),
      ]);

      const contentArr = content as any[];
      setPipeline({
        sitemap: (sitemap as any[]).length,
        briefs: (briefs as any[]).length,
        content_done: contentArr.filter((p: any) => p.status === 'done' || p.content_html).length,
        content_total: contentArr.length,
        content_generating: contentArr.filter((p: any) => p.status === 'generating').length,
        deployed: contentArr.filter((p: any) => p.wp_page_id).length,
        wp_connected: (wpSt as any).connected ?? false,
        wp_url: (wpSt as any).wp_url ?? (project as any).wordpress_url ?? '',
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load project');
    }
  }, [id]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-poll whenever content is generating — starts on mount if already in progress,
  // starts after kicking off generation, and stops when all pages are done/failed.
  useEffect(() => {
    if (pipeline === null) return;

    if (pipeline.content_generating > 0) {
      if (pollRef.current) return; // already polling
      pollRef.current = setInterval(() => {
        load();
      }, 3000);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, [pipeline?.content_generating, load]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const addLog = (step: string, status: LogEntry['status'], message: string): string => {
    const entry: LogEntry = { id: Date.now().toString(), step, status, message, ts: new Date().toISOString() };
    setLogs((prev) => [entry, ...prev]);
    return entry.id;
  };

  const updateLog = (logId: string, status: LogEntry['status'], message: string) => {
    setLogs((prev) => prev.map((l) => l.id === logId ? { ...l, status, message } : l));
  };

  const isRunning = Object.values(stepStatus).some((s) => s === 'running');

  const runStep = async (key: string, label: string, fn: () => Promise<string>) => {
    if (isRunning) return;
    setStepStatus((s) => ({ ...s, [key]: 'running' }));
    const logId = addLog(label, 'running', 'Running...');
    try {
      const msg = await fn();
      updateLog(logId, 'success', msg);
      setStepStatus((s) => ({ ...s, [key]: 'done' }));
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      updateLog(logId, 'error', msg);
      setStepStatus((s) => ({ ...s, [key]: 'error' }));
    }
  };

  const handleGenerateSitemap = () =>
    runStep('sitemap', 'Generate Sitemap', async () => {
      const result = await api.sitemap.generate(id) as any;
      await api.sitemap.approveAll(id);
      return `Generated ${result.generated ?? result.count ?? 0} pages.`;
    });

  const handleGenerateBriefs = () =>
    runStep('briefs', 'Generate Briefs', async () => {
      const result = await api.briefs.generate(id) as any;
      await api.briefs.approveAll(id);
      return `Generated ${result.generated ?? 0} briefs.`;
    });

  // Non-blocking: just queue the job and let auto-polling show progress
  const handleGenerateContent = async () => {
    if (isRunning || (pipeline?.content_generating ?? 0) > 0) return;
    setStepStatus((s) => ({ ...s, content: 'running' }));
    const logId = addLog('Generate Content', 'running', 'Queuing...');
    try {
      const result = await api.content.generate(id) as any;
      updateLog(logId, 'running', `Generating ${result.queued ?? 0} pages in background — progress updates automatically.`);
      setStepStatus((s) => ({ ...s, content: 'done' }));
      // load() will detect generating pages and auto-start polling
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      updateLog(logId, 'error', msg);
      setStepStatus((s) => ({ ...s, content: 'error' }));
    }
  };

  const handleDeploy = () =>
    runStep('deploy', 'Deploy to WordPress', async () => {
      const result = await api.wordpress.deploy(id);
      return `Deployed ${(result as any).pages_created ?? 0} pages to WordPress.`;
    });

  const handleQA = () =>
    runStep('qa', 'Run QA', async () => {
      const result = await api.qa.run(id) as any;
      const issues = result.issues_count ?? result.total ?? 0;
      return `QA complete. ${issues} issues found.`;
    });

  const handleTestConnection = () =>
    runStep('test', 'Test WP Connection', async () => {
      const result = await api.wordpress.status(id);
      await load();
      return result.message || (result.connected ? 'Connected' : 'Not connected');
    });

  if (loadError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-4">{loadError}</p>
        <button onClick={load} className="text-sm text-slate-400 hover:text-white underline">Retry</button>
      </div>
    );
  }

  const contentIsGenerating = (pipeline?.content_generating ?? 0) > 0;
  const contentProgress = pipeline
    ? `${pipeline.content_done}/${pipeline.content_total || pipeline.briefs}`
    : undefined;

  const steps = [
    {
      key: 'sitemap',
      label: 'Generate Sitemap',
      description: 'Plan all pages based on your services and locations.',
      count: pipeline?.sitemap,
      unit: 'pages planned',
      ready: true,
      done: (pipeline?.sitemap ?? 0) > 0,
      action: handleGenerateSitemap,
      buttonLabel: (pipeline?.sitemap ?? 0) > 0 ? 'Regenerate' : 'Generate Sitemap',
    },
    {
      key: 'briefs',
      label: 'Generate Briefs',
      description: 'Create SEO briefs for each planned page.',
      count: pipeline?.briefs,
      unit: 'briefs',
      ready: (pipeline?.sitemap ?? 0) > 0,
      done: (pipeline?.briefs ?? 0) > 0,
      action: handleGenerateBriefs,
      buttonLabel: (pipeline?.briefs ?? 0) > 0 ? 'Regenerate' : 'Generate Briefs',
    },
    {
      key: 'content',
      label: 'Generate Content',
      description: 'Write full HTML content for each page using AI.',
      count: contentProgress,
      unit: 'pages written',
      ready: (pipeline?.briefs ?? 0) > 0,
      done: (pipeline?.content_done ?? 0) > 0 && pipeline?.content_done === pipeline?.content_total && !contentIsGenerating,
      action: handleGenerateContent,
      buttonLabel: contentIsGenerating ? 'Running...' : (pipeline?.content_done ?? 0) > 0 ? 'Regenerate' : 'Generate Content',
      isGenerating: contentIsGenerating,
    },
    {
      key: 'deploy',
      label: 'Deploy to WordPress',
      description: 'Push all generated pages to your WordPress site.',
      count: pipeline?.deployed,
      unit: 'pages deployed',
      ready: (pipeline?.content_done ?? 0) > 0 && !contentIsGenerating,
      done: (pipeline?.deployed ?? 0) > 0,
      action: handleDeploy,
      buttonLabel: (pipeline?.deployed ?? 0) > 0 ? 'Redeploy' : 'Deploy to WordPress',
      highlight: true,
    },
    {
      key: 'qa',
      label: 'Run QA',
      description: 'Check all deployed pages for SEO issues.',
      count: undefined,
      unit: '',
      ready: (pipeline?.deployed ?? 0) > 0,
      done: false,
      action: handleQA,
      buttonLabel: 'Run QA',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Tabs */}
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
            {TABS.map((tab) => (
              <Link
                key={tab.label}
                href={`/projects/${id}${tab.href}`}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab.href === '/deploy'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <h1 className="text-xl font-bold text-white">Deploy Pipeline</h1>

      {/* WordPress Connection Status */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">WordPress Connection</h2>
            <p className="text-sm text-slate-400">{pipeline?.wp_url || 'No URL configured'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${pipeline?.wp_connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${pipeline?.wp_connected ? 'text-green-400' : 'text-red-400'}`}>
                {pipeline === null ? 'Loading...' : pipeline.wp_connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={isRunning}
              className="text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 px-3 py-1.5 rounded-md transition-colors"
            >
              {stepStatus['test'] === 'running' ? 'Testing...' : 'Test'}
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const status = stepStatus[step.key];
          const running = status === 'running' || ('isGenerating' in step && step.isGenerating);
          return (
            <div
              key={step.key}
              className={`bg-slate-800 border rounded-xl p-5 transition-opacity ${
                !step.ready ? 'opacity-50' : ''
              } ${step.done ? 'border-green-700/50' : 'border-slate-700'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step.done ? 'bg-green-600 text-white' :
                    running ? 'bg-blue-600 text-white' :
                    status === 'error' ? 'bg-red-600 text-white' :
                    'bg-slate-600 text-slate-300'
                  } ${running ? 'animate-pulse' : ''}`}>
                    {step.done ? '✓' : running ? '…' : status === 'error' ? '!' : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{step.label}</span>
                      {step.count !== undefined && (
                        <span className="text-xs text-slate-400">{step.count} {step.unit}</span>
                      )}
                      {'isGenerating' in step && step.isGenerating && (
                        <span className="text-xs text-blue-400 animate-pulse">● generating…</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                    {'isGenerating' in step && step.isGenerating && pipeline && pipeline.content_total > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.round((pipeline.content_done / pipeline.content_total) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">
                          {Math.round((pipeline.content_done / pipeline.content_total) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={step.action}
                  disabled={!step.ready || isRunning || ('isGenerating' in step && step.isGenerating)}
                  className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    step.highlight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  {running && !('isGenerating' in step) ? 'Running...' : step.buttonLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log */}
      {logs.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Activity Log</h2>
            {contentIsGenerating && (
              <span className="text-xs text-blue-400 animate-pulse">Auto-refreshing every 3s</span>
            )}
          </div>
          <div className="divide-y divide-slate-700/50 max-h-64 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  log.status === 'success' ? 'bg-green-500' :
                  log.status === 'error' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'
                }`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-200">{log.step}</span>
                  <p className="text-xs text-slate-400 mt-0.5 break-words">{log.message}</p>
                </div>
                <span className="text-xs text-slate-500 shrink-0">{new Date(log.ts).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

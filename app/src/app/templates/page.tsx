export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Templates</h1>
        <p className="text-slate-400 mt-1">Manage WordPress page templates</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <h2 className="text-lg font-medium text-slate-300 mb-2">Templates coming soon</h2>
        <p className="text-slate-500 text-sm">Template management will be available in a future update.</p>
      </div>
    </div>
  );
}

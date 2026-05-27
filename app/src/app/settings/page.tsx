export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Application configuration</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Application Name</label>
              <input
                type="text"
                defaultValue="WP Site Generator"
                className="w-full max-w-sm bg-slate-900 border border-slate-600 text-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Default Locale</label>
              <select className="w-full max-w-sm bg-slate-900 border border-slate-600 text-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="en-US">🇺🇸 English (United States)</option>
                <option value="en-GB">🇬🇧 English (United Kingdom)</option>
                <option value="nl-BE">🇧🇪 Dutch (Belgium)</option>
              </select>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-5">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

import { LOCALES } from '@/lib/locales';

export default function LanguagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Languages</h1>
        <p className="text-slate-400 mt-1">Supported locales and their configuration</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Locale</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Language</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Country</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Currency</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Formality</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">CTA Style</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {Object.values(LOCALES).map((locale) => (
                <tr key={locale.code} className="hover:bg-slate-700/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-300">{locale.code}</td>
                  <td className="px-6 py-4 text-sm text-white">
                    <span className="mr-2">{locale.flag_emoji}</span>
                    {locale.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{locale.language}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{locale.country}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{locale.currency}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 capitalize">{locale.formality}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{locale.cta_style}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

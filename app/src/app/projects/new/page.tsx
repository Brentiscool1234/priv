'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocaleCode, Industry } from '@/types';
import { LOCALES } from '@/lib/locales';

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'party_rentals', label: 'Party Rentals' },
  { value: 'dumpster_rentals', label: 'Dumpster Rentals' },
  { value: 'tree_service', label: 'Tree Service' },
  { value: 'pool_installation', label: 'Pool Installation' },
  { value: 'event_rentals', label: 'Event Rentals' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning_services', label: 'Cleaning Services' },
  { value: 'pest_control', label: 'Pest Control' },
];

const STEPS = [
  'Business Profile',
  'Services',
  'Locations',
  'Language & Locale',
  'WordPress Connection',
  'Review & Create',
];

interface ServiceEntry {
  id: string;
  name: string;
  description: string;
}

interface CityEntry {
  id: string;
  city: string;
  state: string;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              isDone
                ? 'bg-green-600 text-white'
                : isActive
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {isDone ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : stepNum}
            </div>
            {idx < total - 1 && (
              <div className={`h-0.5 w-8 ${isDone ? 'bg-green-600' : 'bg-slate-700'}`} />
            )}
          </div>
        );
      })}
      <span className="ml-2 text-sm text-slate-400">
        Step {current} of {total}: <span className="text-slate-200">{STEPS[current - 1]}</span>
      </span>
    </div>
  );
}

const inputClass = 'w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500';
const labelClass = 'block text-sm font-medium text-slate-300 mb-1';

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Business Profile
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState<Industry>('party_rentals');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Services
  const [services, setServices] = useState<ServiceEntry[]>([
    { id: '1', name: '', description: '' },
  ]);

  // Step 3: Locations
  const [locations, setLocations] = useState<CityEntry[]>([
    { id: '1', city: '', state: '' },
  ]);

  // Step 4: Language & Locale
  const [primaryLocale, setPrimaryLocale] = useState<LocaleCode>('en-US');
  const [secondaryLocales, setSecondaryLocales] = useState<LocaleCode[]>([]);
  const [tone, setTone] = useState('neutral');

  // Step 5: WordPress Connection
  const [wpUrl, setWpUrl] = useState('');
  const [pluginKey, setPluginKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');

  const allLocales = Object.values(LOCALES);

  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: '', description: '' }]);
  };
  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };
  const updateService = (id: string, field: keyof ServiceEntry, value: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addLocation = () => {
    setLocations([...locations, { id: Date.now().toString(), city: '', state: '' }]);
  };
  const removeLocation = (id: string) => {
    setLocations(locations.filter((l) => l.id !== id));
  };
  const updateLocation = (id: string, field: keyof CityEntry, value: string) => {
    setLocations(locations.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const toggleSecondaryLocale = (code: LocaleCode) => {
    if (code === primaryLocale) return;
    setSecondaryLocales((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const testConnection = async () => {
    if (!wpUrl || !pluginKey) {
      setConnectionStatus('error');
      setConnectionMessage('Enter both WordPress URL and Plugin Key first.');
      return;
    }
    setConnectionStatus('testing');
    setConnectionMessage('');
    try {
      const { api } = await import('@/lib/api');
      const result = await api.wordpress.test({ wp_url: wpUrl, plugin_key: pluginKey });
      setConnectionStatus(result.connected ? 'success' : 'error');
      setConnectionMessage(result.message);
    } catch (err) {
      setConnectionStatus('error');
      setConnectionMessage(err instanceof Error ? err.message : 'Connection failed. Is the backend running?');
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const { api } = await import('@/lib/api');

      // 1. Create the project
      const locale = primaryLocale.startsWith('nl') || primaryLocale.startsWith('fr') || primaryLocale.startsWith('de') ? 'BE' :
                     primaryLocale === 'en-GB' ? 'GB' : 'US';
      const project = await api.projects.create({
        business_name: businessName || 'New Project',
        industry,
        website_url: websiteUrl || undefined,
        wordpress_url: wpUrl || undefined,
        primary_locale: primaryLocale,
        secondary_locales: secondaryLocales,
        country: locale,
        profile: {
          business_name: businessName,
          description: description || undefined,
          phone: phone || undefined,
          email: email || undefined,
          booking_url: bookingUrl || undefined,
          years_in_business: yearsInBusiness ? Number(yearsInBusiness) : undefined,
          tone,
        },
      });

      const projectId = project.id;

      // 2. Save services
      const validServices = services.filter((s) => s.name.trim());
      for (const svc of validServices) {
        await api.services.create(projectId, {
          name: svc.name.trim(),
          locale: primaryLocale,
          description: svc.description || undefined,
        });
      }

      // 3. Save locations
      const validLocations = locations.filter((l) => l.city.trim());
      for (const loc of validLocations) {
        await api.locations.create(projectId, {
          city: loc.city.trim(),
          state_province: loc.state || undefined,
          locale: primaryLocale,
        });
      }

      // 4. Save WordPress connection if provided
      if (wpUrl && pluginKey) {
        try {
          await api.wordpress.connect(projectId, { wp_url: wpUrl, plugin_key: pluginKey });
        } catch {
          // Non-fatal: WP connection failure shouldn't block project creation
        }
      }

      router.push(`/projects/${projectId}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create project. Is the backend running?');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Project</h1>
        <p className="text-slate-400 mt-1">Set up a new WordPress site generation project</p>
      </div>

      <StepIndicator current={step} total={STEPS.length} />

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        {/* Step 1: Business Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Business Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Party Perfect Rentals"
                />
              </div>
              <div>
                <label className={labelClass}>Industry *</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as Industry)}
                  className={inputClass}
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="contact@business.com"
                />
              </div>
              <div>
                <label className={labelClass}>Booking URL</label>
                <input
                  type="url"
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://booking.example.com"
                />
              </div>
              <div>
                <label className={labelClass}>Years in Business</label>
                <input
                  type="number"
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 10"
                  min="0"
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Business Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder="Brief description of the business..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Services</h2>
            <p className="text-sm text-slate-400">Add the services this business offers.</p>
            <div className="space-y-3">
              {services.map((service, idx) => (
                <div key={service.id} className="bg-slate-900 border border-slate-600 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Service {idx + 1}</span>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeService(service.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                    className={inputClass}
                    placeholder="Service name (e.g. Tent Rentals)"
                  />
                  <input
                    type="text"
                    value={service.description}
                    onChange={(e) => updateService(service.id, 'description', e.target.value)}
                    className={inputClass}
                    placeholder="Brief description (optional)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={addService}
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-slate-900 border border-slate-600 px-3 py-2 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Service
              </button>
              <button className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-600 px-3 py-2 rounded-md transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload CSV
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Locations */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Locations</h2>
            <p className="text-sm text-slate-400">Add the cities this business serves.</p>
            <div className="space-y-3">
              {locations.map((loc, idx) => (
                <div key={loc.id} className="bg-slate-900 border border-slate-600 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Location {idx + 1}</span>
                    {locations.length > 1 && (
                      <button
                        onClick={() => removeLocation(loc.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={loc.city}
                      onChange={(e) => updateLocation(loc.id, 'city', e.target.value)}
                      className={inputClass}
                      placeholder="City (e.g. Austin)"
                    />
                    <input
                      type="text"
                      value={loc.state}
                      onChange={(e) => updateLocation(loc.id, 'state', e.target.value)}
                      className={inputClass}
                      placeholder="State (e.g. TX)"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={addLocation}
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-slate-900 border border-slate-600 px-3 py-2 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Location
              </button>
              <button className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-600 px-3 py-2 rounded-md transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload CSV
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Language & Locale */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white mb-4">Language & Locale</h2>
            <div>
              <label className={labelClass}>Primary Locale *</label>
              <select
                value={primaryLocale}
                onChange={(e) => setPrimaryLocale(e.target.value as LocaleCode)}
                className={inputClass}
              >
                {allLocales.map((locale) => (
                  <option key={locale.code} value={locale.code}>
                    {locale.flag_emoji} {locale.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Secondary Locales</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {allLocales
                  .filter((l) => l.code !== primaryLocale)
                  .map((locale) => (
                    <label
                      key={locale.code}
                      className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded-md px-3 py-2 cursor-pointer hover:bg-slate-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={secondaryLocales.includes(locale.code)}
                        onChange={() => toggleSecondaryLocale(locale.code)}
                        className="accent-blue-500"
                      />
                      <span className="text-sm text-slate-300">
                        {locale.flag_emoji} {locale.name}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Tone / Formality</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={inputClass}
              >
                <option value="formal">Formal</option>
                <option value="neutral">Neutral</option>
                <option value="casual">Casual</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 5: WordPress Connection */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">WordPress Connection</h2>
            <div>
              <label className={labelClass}>WordPress URL *</label>
              <input
                type="url"
                value={wpUrl}
                onChange={(e) => setWpUrl(e.target.value)}
                className={inputClass}
                placeholder="https://yoursite.com"
              />
            </div>
            <div>
              <label className={labelClass}>Plugin Key</label>
              <input
                type="password"
                value={pluginKey}
                onChange={(e) => setPluginKey(e.target.value)}
                className={inputClass}
                placeholder="Enter your plugin secret key"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {connectionStatus === 'testing' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Testing...
                  </>
                ) : 'Test Connection'}
              </button>
              {connectionStatus === 'success' && (
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {connectionMessage || 'Connected successfully'}
                </span>
              )}
              {connectionStatus === 'error' && (
                <span className="text-sm text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {connectionMessage || 'Connection failed'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Review & Create */}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Review & Create</h2>
            <div className="space-y-3">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-300">Business Profile</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="text-slate-200">{businessName || '—'}</dd>
                  <dt className="text-slate-500">Industry</dt>
                  <dd className="text-slate-200 capitalize">{industry.replace(/_/g, ' ')}</dd>
                  <dt className="text-slate-500">Website</dt>
                  <dd className="text-slate-200">{websiteUrl || '—'}</dd>
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="text-slate-200">{phone || '—'}</dd>
                </dl>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-300">Services & Locations</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt className="text-slate-500">Services</dt>
                  <dd className="text-slate-200">{services.filter((s) => s.name).length}</dd>
                  <dt className="text-slate-500">Locations</dt>
                  <dd className="text-slate-200">{locations.filter((l) => l.city).length}</dd>
                </dl>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-300">Language & WordPress</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt className="text-slate-500">Primary Locale</dt>
                  <dd className="text-slate-200">{primaryLocale}</dd>
                  <dt className="text-slate-500">Secondary Locales</dt>
                  <dd className="text-slate-200">{secondaryLocales.length > 0 ? secondaryLocales.join(', ') : 'None'}</dd>
                  <dt className="text-slate-500">Tone</dt>
                  <dd className="text-slate-200 capitalize">{tone}</dd>
                  <dt className="text-slate-500">WP URL</dt>
                  <dd className="text-slate-200">{wpUrl || '—'}</dd>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {createError && (
        <div className="mt-4 bg-red-900/40 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm">
          {createError}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        {step < STEPS.length ? (
          <button
            type="button"
            onClick={() => setStep(Math.min(STEPS.length, step + 1))}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {creating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Create Project
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

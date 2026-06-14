import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';
import { HardDrive, CheckCircle, XCircle, Loader2, Database, Cloud, Save, Zap, Shield, ArrowRight, Server } from 'lucide-react';
import MigrationConfirmationModal from '@/Components/Storage/MigrationConfirmationModal';
import MigrationProgressWidget from '@/Components/Storage/MigrationProgressWidget';

// ── Brand SVG icons ──────────────────────────────────────────────────────────

const CloudflareIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M39.5 41.5H16a7 7 0 0 1-.7-13.9l1-.1.2-1a11 11 0 0 1 21.4-1.5l.3 1.1 1.1.1a6 6 0 0 1 .2 11.3z" fill="#F6821F"/>
        <path d="M44.8 33.5l-.4-.1v-.3a8.3 8.3 0 0 0-8.2-7c-1.3 0-2.6.3-3.7.9l-.6.3-.2-.6a11.7 11.7 0 0 0-11-7.7 11.7 11.7 0 0 0-11.6 10.3l-.1.8-.8.1A8.5 8.5 0 0 0 9.5 48H44a5.8 5.8 0 0 0 .8-11.5z" fill="white" fillOpacity="0.15"/>
        <path d="M46 35.5c.4-1.5.3-2.9-.3-4a5.5 5.5 0 0 0-3.5-2.5l-.5-.1-.1-.5a8.5 8.5 0 0 0-8.2-6.9c-2.7 0-5.2 1.3-6.8 3.4l-.3.4-.4-.2a7 7 0 0 0-3-.7A7.5 7.5 0 0 0 16 32l.1.7-.7.1a5 5 0 0 0 .6 9.9h27.5a4.7 4.7 0 0 0 2.5-7.2z" fill="#F6821F" fillOpacity="0.8"/>
    </svg>
);

const AwsS3Icon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M32 10L14 20v24l18 10 18-10V20L32 10z" fill="#E8832A"/>
        <path d="M32 10L14 20l18 10 18-10L32 10z" fill="#F9BF8F"/>
        <path d="M14 20v24l18 10V30L14 20z" fill="#C66B1A"/>
        <path d="M50 20v24L32 54V30l18-10z" fill="#E8832A"/>
        <text x="32" y="38" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="monospace">S3</text>
    </svg>
);

const DigitalOceanIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="32" cy="25" r="13" fill="#0080FF"/>
        <circle cx="32" cy="25" r="7" fill="white"/>
        <rect x="19" y="40" width="9" height="5" rx="1" fill="#0080FF"/>
        <rect x="19" y="47" width="6" height="4" rx="1" fill="#0080FF"/>
    </svg>
);

const WasabiIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M32 8c-1.5 4-5 7-5 13 0 4 2.5 7.5 5 9 2.5-1.5 5-5 5-9 0-6-3.5-9-5-13z" fill="#3DB843"/>
        <path d="M20 20c3.5 1.5 5.5 5 7 10-3 1-7 0-10-3-2.5-3.5-2-8 3-7z" fill="#3DB843"/>
        <path d="M44 20c-3.5 1.5-5.5 5-7 10 3 1 7 0 10-3 2.5-3.5 2-8-3-7z" fill="#3DB843"/>
        <ellipse cx="32" cy="42" rx="14" ry="10" fill="#3DB843"/>
        <ellipse cx="32" cy="40" rx="10" ry="7" fill="#5CCF62"/>
    </svg>
);

const MinioIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="12" y="14" width="40" height="10" rx="3" fill="#C83B3B"/>
        <rect x="12" y="27" width="40" height="10" rx="3" fill="#E05252"/>
        <rect x="12" y="40" width="40" height="10" rx="3" fill="#C83B3B"/>
        <circle cx="47" cy="19" r="2.5" fill="#FF9E9E"/>
        <circle cx="47" cy="32" r="2.5" fill="#FF9E9E"/>
        <circle cx="47" cy="45" r="2.5" fill="#FF9E9E"/>
    </svg>
);

const GoogleCloudIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M38 20h-4l-2-4H22a4 4 0 0 0-4 4v4h28v-2a2 2 0 0 0-2-2h-6z" fill="#4285F4"/>
        <rect x="12" y="24" width="40" height="24" rx="3" fill="#4285F4"/>
        <path d="M12 36h40v12a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V36z" fill="#34A853"/>
        <path d="M12 30h12v18H15a3 3 0 0 1-3-3V30z" fill="#FBBC05"/>
        <circle cx="32" cy="34" r="5" fill="white" fillOpacity="0.3"/>
    </svg>
);

// ── Provider metadata ────────────────────────────────────────────────────────
const PROVIDER_META = {
    default:   { Icon: CloudflareIcon, ring: 'ring-orange-200', border: 'border-orange-300', activeBg: 'bg-orange-50', badge: 'bg-orange-50 text-orange-700 border-orange-200', note: 'Free egress',       storageType: 'Object Storage', storageIcon: Cloud },
    r2_custom: { Icon: CloudflareIcon, ring: 'ring-orange-200', border: 'border-orange-300', activeBg: 'bg-orange-50', badge: 'bg-orange-50 text-orange-600 border-orange-200', note: 'Custom account',    storageType: 'Object Storage', storageIcon: Cloud },
    s3:        { Icon: AwsS3Icon,      ring: 'ring-yellow-200', border: 'border-yellow-400', activeBg: 'bg-yellow-50', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', note: 'Industry standard', storageType: 'Block Storage',  storageIcon: HardDrive },
    spaces:    { Icon: DigitalOceanIcon,ring: 'ring-blue-200',  border: 'border-blue-400',   activeBg: 'bg-blue-50',   badge: 'bg-blue-50 text-blue-700 border-blue-200',       note: 'With CDN',          storageType: 'Object + CDN',   storageIcon: Cloud },
    wasabi:    { Icon: WasabiIcon,     ring: 'ring-green-200',  border: 'border-green-400',  activeBg: 'bg-green-50',  badge: 'bg-green-50 text-green-700 border-green-200',    note: 'Hot storage',       storageType: 'Object Storage', storageIcon: Database },
    minio:     { Icon: MinioIcon,      ring: 'ring-red-200',    border: 'border-red-400',    activeBg: 'bg-red-50',    badge: 'bg-red-50 text-red-700 border-red-200',          note: 'Self-hosted',       storageType: 'Self-Hosted',    storageIcon: Server },
    gcs:       { Icon: GoogleCloudIcon,ring: 'ring-sky-200',    border: 'border-sky-400',    activeBg: 'bg-sky-50',    badge: 'bg-sky-50 text-sky-700 border-sky-200',          note: 'Google Cloud',      storageType: 'Object Storage', storageIcon: Cloud },
};

export default function Storage({ currentProvider, usageStats, providers }) {
    const { flash } = usePage().props;
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [showMigrationModal, setShowMigrationModal] = useState(false);
    const [migrationInfo, setMigrationInfo] = useState(null);
    const [activeMigration, setActiveMigration] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        driver: currentProvider.driver || 'default',
        credentials: {},
        bucket: currentProvider.bucket || '',
        region: currentProvider.region || '',
        endpoint: currentProvider.endpoint || '',
        path_prefix: currentProvider.path_prefix || '',
    });

    const selectedProvider = providers.find(p => p.value === data.driver);
    const hasCredentialFields = selectedProvider && selectedProvider.fields.length > 0;
    const meta = PROVIDER_META[data.driver] ?? { letter: '??', bg: 'bg-gray-400', ring: 'ring-gray-200', badge: 'bg-gray-50 text-gray-600 border-gray-200', note: '' };

    const handleProviderChange = (driver) => {
        setData({ driver, credentials: {}, bucket: '', region: '', endpoint: '', path_prefix: '' });
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        setTestResult(null);
        try {
            const response = await fetch(route('admin.settings.storage.test'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify({ driver: data.driver, credentials: data.credentials, bucket: data.bucket, region: data.region, endpoint: data.endpoint }),
            });
            setTestResult(await response.json());
        } catch (error) {
            setTestResult({ success: false, message: 'Failed to test connection: ' + error.message });
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (data.driver !== currentProvider.driver) {
            try {
                const response = await fetch(route('admin.settings.storage.migration-info'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                    body: JSON.stringify({ new_driver: data.driver }),
                });
                const info = await response.json();
                if (info.provider_changed && info.total_files > 0) { setMigrationInfo(info); setShowMigrationModal(true); return; }
            } catch (error) { console.error('Failed to fetch migration info:', error); }
        }
        post(route('admin.settings.storage.update'));
    };

    const handleConfirmMigration = (shouldMigrate) => {
        setShowMigrationModal(false);
        post(route('admin.settings.storage.update'), {
            data: { ...data, auto_migrate: shouldMigrate },
            preserveScroll: true,
            onSuccess: () => {
                if (flash?.migration_started) { setActiveMigration(flash.migration_started); startPolling(flash.migration_started.migration_id); }
            },
        });
    };

    const startPolling = (migrationId) => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(route('admin.settings.storage.migration-progress', migrationId));
                const progress = await response.json();
                setActiveMigration(prev => ({ ...prev, progress }));
                if (progress.status === 'completed' || progress.status === 'failed') { clearInterval(interval); setPollingInterval(null); }
            } catch (error) { console.error('Failed to fetch progress:', error); }
        }, 3000);
        setPollingInterval(interval);
    };

    useEffect(() => () => { if (pollingInterval) clearInterval(pollingInterval); }, [pollingInterval]);
    useEffect(() => { if (flash?.migration_started) { setActiveMigration(flash.migration_started); startPolling(flash.migration_started.migration_id); } }, []);

    return (
        <AdminLayout title="Storage Settings">
            <Head title="Storage Settings" />

            {showMigrationModal && (
                <MigrationConfirmationModal migrationInfo={migrationInfo} onConfirm={handleConfirmMigration} onCancel={() => setShowMigrationModal(false)} />
            )}
            {activeMigration && <MigrationProgressWidget migration={activeMigration} />}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Storage Settings</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage where your digital files are stored</p>
                    </div>
                    <button
                        type="submit"
                        disabled={processing || (hasCredentialFields && !testResult?.success)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
                    >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {processing ? 'Saving…' : 'Save Configuration'}
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        icon={Database}
                        iconBg="bg-blue-100" iconColor="text-blue-600"
                        label="Total Files"
                        value={usageStats.total_files?.toLocaleString() ?? '—'}
                    />
                    <StatCard
                        icon={HardDrive}
                        iconBg="bg-violet-100" iconColor="text-violet-600"
                        label="Storage Used"
                        value={`${usageStats.total_size_gb?.toFixed(2) ?? '0.00'} GB`}
                    />
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 flex-shrink-0">
                            {meta.Icon ? <meta.Icon /> : <Cloud className="w-12 h-12 text-gray-400" />}
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs text-gray-500 mb-0.5">Active Provider</div>
                            <div className="font-bold text-gray-900 truncate">{currentProvider.name}</div>
                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border font-medium ${meta.badge}`}>{meta.note}</span>
                        </div>
                    </div>
                </div>

                {/* Main layout */}
                <div className="grid lg:grid-cols-3 gap-5 items-start">
                    {/* Left — provider picker (2/3) */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="text-sm font-semibold text-gray-900 mb-4">Choose Storage Provider</div>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                                {providers.map((provider) => {
                                    const pm = PROVIDER_META[provider.value] ?? { Icon: null, ring: 'ring-gray-200', border: 'border-gray-300', activeBg: 'bg-gray-50', badge: 'bg-gray-50 text-gray-600 border-gray-200', note: '', storageType: 'Storage', storageIcon: HardDrive };
                                    const active = data.driver === provider.value;
                                    const StorIcon = pm.storageIcon;
                                    return (
                                        <button
                                            key={provider.value}
                                            type="button"
                                            onClick={() => handleProviderChange(provider.value)}
                                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                                active
                                                    ? `${pm.border} ${pm.activeBg} ring-4 ${pm.ring}`
                                                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            {/* Selected check */}
                                            {active && (
                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                                                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}

                                            {/* Brand icon */}
                                            <div className="w-10 h-10 mb-3">
                                                {pm.Icon ? <pm.Icon /> : <HardDrive className="w-10 h-10 text-gray-400" />}
                                            </div>

                                            <div className="font-semibold text-gray-900 text-sm leading-tight">{provider.label}</div>
                                            <div className="text-xs text-gray-500 mt-0.5 mb-2">{provider.description}</div>

                                            {/* Bottom row: storage type + feature badge */}
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                    <StorIcon className="w-3 h-3" />{pm.storageType}
                                                </span>
                                                {pm.note && (
                                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${pm.badge}`}>{pm.note}</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Credential fields */}
                        {hasCredentialFields && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <Shield className="w-4 h-4 text-gray-500" />
                                    <div className="text-sm font-semibold text-gray-900">Credentials & Configuration</div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {selectedProvider.fields.map((field) => (
                                        <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                                                {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    value={data.credentials[field.name] || ''}
                                                    onChange={(e) => setData('credentials', { ...data.credentials, [field.name]: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required={field.required}
                                                >
                                                    <option value="">Select {field.label}</option>
                                                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : field.type === 'textarea' ? (
                                                <textarea
                                                    value={data.credentials[field.name] || ''}
                                                    onChange={(e) => setData('credentials', { ...data.credentials, [field.name]: e.target.value })}
                                                    rows={4}
                                                    placeholder={field.placeholder}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                                    required={field.required}
                                                />
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    value={data.credentials[field.name] || data[field.name] || ''}
                                                    onChange={(e) => {
                                                        if (field.name === 'bucket' || field.name === 'endpoint') setData(field.name, e.target.value);
                                                        else setData('credentials', { ...data.credentials, [field.name]: e.target.value });
                                                    }}
                                                    placeholder={field.placeholder}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required={field.required}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {/* Path prefix */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Path Prefix <span className="normal-case text-gray-400 font-normal">(optional)</span></label>
                                        <input
                                            type="text"
                                            value={data.path_prefix}
                                            onChange={(e) => setData('path_prefix', e.target.value)}
                                            placeholder="tenant-files/"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {errors.general && (
                                    <div className="mt-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl px-4 py-3">{errors.general}</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right — status + test + tips (1/3) */}
                    <div className="space-y-4">
                        {/* Connection test */}
                        {hasCredentialFields && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                <div className="text-sm font-semibold text-gray-900 mb-3">Connection Test</div>
                                <p className="text-xs text-gray-500 mb-4">Verify your credentials are correct before saving.</p>
                                <button
                                    type="button"
                                    onClick={handleTestConnection}
                                    disabled={testingConnection}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                                >
                                    {testingConnection ? <><Loader2 className="w-4 h-4 animate-spin" /> Testing…</> : <><Zap className="w-4 h-4" /> Test Connection</>}
                                </button>

                                {testResult && (
                                    <div className={`mt-3 flex items-start gap-3 p-3 rounded-xl border text-sm ${
                                        testResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                        {testResult.success
                                            ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                            : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
                                        {testResult.message}
                                    </div>
                                )}

                                {hasCredentialFields && !testResult?.success && (
                                    <p className="mt-3 text-xs text-amber-600 flex items-center gap-1.5">
                                        <ArrowRight className="w-3 h-3" /> Test connection first to enable save
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Cloud className="w-4 h-4 text-blue-600" />
                                <div className="text-sm font-semibold text-blue-900">Storage Tips</div>
                            </div>
                            <ul className="space-y-2 text-xs text-blue-800">
                                <li className="flex gap-2"><span className="text-blue-400 mt-0.5">•</span> Cloudflare R2 is recommended — zero egress fees</li>
                                <li className="flex gap-2"><span className="text-blue-400 mt-0.5">•</span> Changing provider triggers an optional file migration</li>
                                <li className="flex gap-2"><span className="text-blue-400 mt-0.5">•</span> All files use signed URLs — access is always secure</li>
                                <li className="flex gap-2"><span className="text-blue-400 mt-0.5">•</span> Path prefix keeps your bucket organised per tenant</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
                <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
        </div>
    );
}

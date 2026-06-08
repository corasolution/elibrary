import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, Palette, RefreshCw, Bell } from 'lucide-react';

const TABS = [
    { key: 'general',     label: 'General',     icon: Building2 },
    { key: 'branding',    label: 'Branding',     icon: Palette },
    { key: 'circulation', label: 'Circulation',  icon: RefreshCw },
    { key: 'notifications', label: 'Notifications', icon: Bell },
];

export default function Settings({ settings = {} }) {
    const { flash } = usePage().props;
    const [tab, setTab] = useState('general');

    const { data, setData, post, processing, errors } = useForm({
        // General
        library_name:         settings.library_name ?? '',
        library_tagline:      settings.library_tagline ?? '',
        library_email:        settings.library_email ?? '',
        library_phone:        settings.library_phone ?? '',
        library_address:      settings.library_address ?? '',
        default_language:     settings.default_language ?? 'en',
        timezone:             settings.timezone ?? 'Asia/Phnom_Penh',
        opac_welcome_text:    settings.opac_welcome_text ?? '',
        // Branding
        primary_color:        settings.primary_color ?? '#2563eb',
        logo:                 null,
        favicon:              null,
        // Circulation
        default_loan_days:    settings.default_loan_days ?? '14',
        max_loans_per_patron: settings.max_loans_per_patron ?? '5',
        fine_rate_per_day:    settings.fine_rate_per_day ?? '0.10',
        max_fine:             settings.max_fine ?? '10.00',
        grace_period_days:    settings.grace_period_days ?? '0',
        reservation_expiry:   settings.reservation_expiry ?? '7',
        enable_self_registration: settings.enable_self_registration ?? '1',
        require_email_verification: settings.require_email_verification ?? '0',
        // Notifications
        notifications_email:   settings.notifications_email ?? '',
        send_overdue_notices:  settings.send_overdue_notices ?? '1',
        send_due_reminders:    settings.send_due_reminders ?? '1',
        reminder_days_before:  settings.reminder_days_before ?? '3',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), { forceFormData: true });
    };

    return (
        <AdminLayout title="Library Settings">
            <form onSubmit={submit}>
                <div className="flex gap-6">
                    {/* Tab sidebar */}
                    <div className="w-48 flex-shrink-0">
                        <nav className="space-y-1">
                            {TABS.map(t => {
                                const Icon = t.icon;
                                return (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => setTab(t.key)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                                            tab === t.key
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        {t.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                        {flash?.success && (
                            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">
                                {flash.success}
                            </div>
                        )}

                        {/* General */}
                        {tab === 'general' && (
                            <Section title="Library Information">
                                <Field label="Library Name" error={errors.library_name}>
                                    <Input value={data.library_name} onChange={v => setData('library_name', v)} placeholder="e.g. National Library of Cambodia" />
                                </Field>
                                <Field label="Tagline">
                                    <Input value={data.library_tagline} onChange={v => setData('library_tagline', v)} placeholder="e.g. Knowledge for All" />
                                </Field>
                                <Field label="OPAC Welcome Message">
                                    <Input value={data.opac_welcome_text} onChange={v => setData('opac_welcome_text', v)} placeholder="Welcome to our library catalog." />
                                </Field>
                                <Field label="Contact Email" error={errors.library_email}>
                                    <Input type="email" value={data.library_email} onChange={v => setData('library_email', v)} placeholder="library@example.com" />
                                </Field>
                                <Field label="Phone">
                                    <Input value={data.library_phone} onChange={v => setData('library_phone', v)} placeholder="+855 23 xxx xxx" />
                                </Field>
                                <Field label="Address">
                                    <textarea
                                        value={data.library_address}
                                        onChange={e => setData('library_address', e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Full address"
                                    />
                                </Field>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label="Default Language">
                                        <select value={data.default_language} onChange={e => setData('default_language', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="en">English</option>
                                            <option value="km">ភាសាខ្មែរ (Khmer)</option>
                                            <option value="fr">Français</option>
                                            <option value="zh">中文</option>
                                        </select>
                                    </Field>
                                    <Field label="Timezone">
                                        <select value={data.timezone} onChange={e => setData('timezone', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="Asia/Phnom_Penh">Asia/Phnom_Penh (UTC+7)</option>
                                            <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                                            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
                                            <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                                            <option value="Asia/Jakarta">Asia/Jakarta (UTC+7)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </Field>
                                </div>
                            </Section>
                        )}

                        {/* Branding */}
                        {tab === 'branding' && (
                            <Section title="Branding & Appearance">
                                <Field label="Primary Color">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={data.primary_color}
                                            onChange={e => setData('primary_color', e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            value={data.primary_color}
                                            onChange={e => setData('primary_color', e.target.value)}
                                            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="#2563eb"
                                        />
                                        <div
                                            className="flex-1 h-10 rounded-lg border border-gray-200"
                                            style={{ background: data.primary_color }}
                                        />
                                    </div>
                                </Field>
                                <Field label="Library Logo">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setData('logo', e.target.files[0])}
                                        className="block text-sm text-gray-600"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">PNG or SVG recommended, max 2MB.</p>
                                    {settings.logo_url && (
                                        <img src={settings.logo_url} alt="Logo" className="mt-3 h-12 object-contain border border-gray-200 rounded-lg p-1" />
                                    )}
                                </Field>
                                <Field label="Favicon">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setData('favicon', e.target.files[0])}
                                        className="block text-sm text-gray-600"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">PNG or ICO, 32×32px, max 512KB.</p>
                                </Field>
                            </Section>
                        )}

                        {/* Circulation */}
                        {tab === 'circulation' && (
                            <Section title="Circulation Rules">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label="Default Loan Period (days)" error={errors.default_loan_days}>
                                        <Input type="number" min="1" max="365" value={data.default_loan_days} onChange={v => setData('default_loan_days', v)} />
                                    </Field>
                                    <Field label="Max Loans per Patron" error={errors.max_loans_per_patron}>
                                        <Input type="number" min="1" max="100" value={data.max_loans_per_patron} onChange={v => setData('max_loans_per_patron', v)} />
                                    </Field>
                                    <Field label="Fine Rate ($/day)" error={errors.fine_rate_per_day}>
                                        <Input type="number" step="0.01" min="0" value={data.fine_rate_per_day} onChange={v => setData('fine_rate_per_day', v)} />
                                    </Field>
                                    <Field label="Maximum Fine ($)" error={errors.max_fine}>
                                        <Input type="number" step="0.01" min="0" value={data.max_fine} onChange={v => setData('max_fine', v)} />
                                    </Field>
                                    <Field label="Grace Period (days before fines)" error={errors.grace_period_days}>
                                        <Input type="number" min="0" max="30" value={data.grace_period_days} onChange={v => setData('grace_period_days', v)} />
                                    </Field>
                                    <Field label="Reservation Expiry (days)" error={errors.reservation_expiry}>
                                        <Input type="number" min="1" max="90" value={data.reservation_expiry} onChange={v => setData('reservation_expiry', v)} />
                                    </Field>
                                </div>
                                <Field label="Patron Self-Registration">
                                    <Toggle
                                        checked={data.enable_self_registration === '1' || data.enable_self_registration === true}
                                        onChange={v => setData('enable_self_registration', v ? '1' : '0')}
                                        label="Allow patrons to register online"
                                    />
                                </Field>
                                <Field label="Email Verification">
                                    <Toggle
                                        checked={data.require_email_verification === '1' || data.require_email_verification === true}
                                        onChange={v => setData('require_email_verification', v ? '1' : '0')}
                                        label="Require email verification for new patrons"
                                    />
                                </Field>
                            </Section>
                        )}

                        {/* Notifications */}
                        {tab === 'notifications' && (
                            <Section title="Email Notifications">
                                <Field label="Notification Email" error={errors.notifications_email}>
                                    <Input type="email" value={data.notifications_email} onChange={v => setData('notifications_email', v)} placeholder="staff@library.com" />
                                    <p className="text-xs text-gray-400 mt-1">Receives copies of outgoing patron notifications.</p>
                                </Field>
                                <Field label="Overdue Notices">
                                    <Toggle
                                        checked={data.send_overdue_notices === '1' || data.send_overdue_notices === true}
                                        onChange={v => setData('send_overdue_notices', v ? '1' : '0')}
                                        label="Send overdue notices to patrons automatically"
                                    />
                                </Field>
                                <Field label="Due Date Reminders">
                                    <Toggle
                                        checked={data.send_due_reminders === '1' || data.send_due_reminders === true}
                                        onChange={v => setData('send_due_reminders', v ? '1' : '0')}
                                        label="Send due date reminder emails"
                                    />
                                </Field>
                                <Field label="Reminder Days Before Due" error={errors.reminder_days_before}>
                                    <Input type="number" min="1" max="30" value={data.reminder_days_before} onChange={v => setData('reminder_days_before', v)} />
                                    <p className="text-xs text-gray-400 mt-1">How many days before the due date to send a reminder.</p>
                                </Field>
                            </Section>
                        )}

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
                            >
                                {processing ? 'Saving…' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-5">{title}</h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, children, error }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function Input({ type = 'text', value, onChange, placeholder, min, max, step }) {
    return (
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <div
                onClick={() => onChange(!checked)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-gray-700">{label}</span>
        </label>
    );
}

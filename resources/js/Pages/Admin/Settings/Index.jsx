import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Palette, RefreshCw, Bell, UploadCloud, Image as ImageIcon, X } from 'lucide-react';

export default function Settings({ settings = {} }) {
    const { flash } = usePage().props;
    const { t } = useTranslation();
    const [tab, setTab] = useState('general');

    const TABS = [
        { key: 'general',       label: t('admin.settings_ui.tab_general'),       icon: Building2 },
        { key: 'branding',      label: t('admin.settings_ui.tab_branding'),      icon: Palette },
        { key: 'circulation',   label: t('admin.settings_ui.tab_circulation'),   icon: RefreshCw },
        { key: 'notifications', label: t('admin.settings_ui.tab_notifications'), icon: Bell },
    ];

    const { data, setData, post, processing, errors } = useForm({
        library_name:               settings.library_name ?? '',
        library_tagline:            settings.library_tagline ?? '',
        library_email:              settings.library_email ?? '',
        library_phone:              settings.library_phone ?? '',
        library_address:            settings.library_address ?? '',
        default_language:           settings.default_language ?? 'en',
        timezone:                   settings.timezone ?? 'Asia/Phnom_Penh',
        opac_welcome_text:          settings.opac_welcome_text ?? '',
        site_title:                 settings.site_title ?? '',
        primary_color:              settings.primary_color ?? '#2563eb',
        logo:                       null,
        favicon:                    null,
        default_loan_days:          settings.default_loan_days ?? '14',
        max_loans_per_patron:       settings.max_loans_per_patron ?? '5',
        fine_rate_per_day:          settings.fine_rate_per_day ?? '0.10',
        max_fine:                   settings.max_fine ?? '10.00',
        grace_period_days:          settings.grace_period_days ?? '0',
        reservation_expiry:         settings.reservation_expiry ?? '7',
        enable_self_registration:   settings.enable_self_registration ?? '1',
        require_email_verification: settings.require_email_verification ?? '0',
        notifications_email:        settings.notifications_email ?? '',
        send_overdue_notices:       settings.send_overdue_notices ?? '1',
        send_due_reminders:         settings.send_due_reminders ?? '1',
        reminder_days_before:       settings.reminder_days_before ?? '3',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), { forceFormData: true });
    };

    return (
        <AdminLayout title={t('admin.settings_ui.page_title')}>
            <form onSubmit={submit}>
                <div className="flex gap-6">
                    {/* Tab sidebar */}
                    <div className="w-48 flex-shrink-0">
                        <nav className="space-y-1">
                            {TABS.map(item => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setTab(item.key)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                                            tab === item.key
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        {item.label}
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
                            <Section title={t('admin.settings_ui.section_library_info')}>
                                <Field label={t('admin.settings_ui.library_name')} error={errors.library_name}>
                                    <Input value={data.library_name} onChange={v => setData('library_name', v)} placeholder="e.g. National Library of Cambodia" />
                                </Field>
                                <Field label={t('admin.settings_ui.library_tagline')}>
                                    <Input value={data.library_tagline} onChange={v => setData('library_tagline', v)} placeholder="e.g. Knowledge for All" />
                                </Field>
                                <Field label={t('admin.settings_ui.opac_welcome')}>
                                    <Input value={data.opac_welcome_text} onChange={v => setData('opac_welcome_text', v)} placeholder="Welcome to our library catalog." />
                                </Field>
                                <Field label={t('admin.settings_ui.contact_email')} error={errors.library_email}>
                                    <Input type="email" value={data.library_email} onChange={v => setData('library_email', v)} placeholder="library@example.com" />
                                </Field>
                                <Field label={t('admin.settings_ui.phone')}>
                                    <Input value={data.library_phone} onChange={v => setData('library_phone', v)} placeholder="+855 23 xxx xxx" />
                                </Field>
                                <Field label={t('admin.settings_ui.address')}>
                                    <textarea
                                        value={data.library_address}
                                        onChange={e => setData('library_address', e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Full address"
                                    />
                                </Field>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label={t('admin.settings_ui.default_language')}>
                                        <select value={data.default_language} onChange={e => setData('default_language', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="en">English</option>
                                            <option value="km">ភាសាខ្មែរ (Khmer)</option>
                                            <option value="fr">Français</option>
                                            <option value="zh">中文</option>
                                        </select>
                                    </Field>
                                    <Field label={t('admin.settings_ui.timezone')}>
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
                            <Section title={t('admin.settings_ui.section_branding')}>
                                <Field label={t('admin.settings_ui.site_title', 'Browser / Site Title')} error={errors.site_title}>
                                    <Input
                                        value={data.site_title}
                                        onChange={v => setData('site_title', v)}
                                        placeholder={data.library_name || 'My Library'}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        {t('admin.settings_ui.site_title_hint', 'Shown in the browser tab for your public catalog. Leave blank to use your library name.')}
                                    </p>
                                </Field>
                                <Field label={t('admin.settings_ui.primary_color')}>
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
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label={t('admin.settings_ui.logo')}>
                                        <ImageUpload
                                            value={data.logo}
                                            currentUrl={settings.logo_url}
                                            onChange={file => setData('logo', file)}
                                            hint={t('admin.settings_ui.logo_hint')}
                                        />
                                    </Field>
                                    <Field label={t('admin.settings_ui.favicon')}>
                                        <ImageUpload
                                            value={data.favicon}
                                            currentUrl={settings.favicon_url}
                                            onChange={file => setData('favicon', file)}
                                            hint={t('admin.settings_ui.favicon_hint')}
                                            square
                                        />
                                    </Field>
                                </div>
                            </Section>
                        )}

                        {/* Circulation */}
                        {tab === 'circulation' && (
                            <Section title={t('admin.settings_ui.section_circulation')}>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label={t('admin.settings_ui.loan_period')} error={errors.default_loan_days}>
                                        <Input type="number" min="1" max="365" value={data.default_loan_days} onChange={v => setData('default_loan_days', v)} />
                                    </Field>
                                    <Field label={t('admin.settings_ui.max_loans')} error={errors.max_loans_per_patron}>
                                        <Input type="number" min="1" max="100" value={data.max_loans_per_patron} onChange={v => setData('max_loans_per_patron', v)} />
                                    </Field>
                                    <Field label={t('admin.settings_ui.fine_rate')} error={errors.fine_rate_per_day}>
                                        <Input type="number" step="0.01" min="0" value={data.fine_rate_per_day} onChange={v => setData('fine_rate_per_day', v)} />
                                    </Field>
                                    <Field label={t('admin.settings_ui.max_fine')} error={errors.max_fine}>
                                        <Input type="number" step="0.01" min="0" value={data.max_fine} onChange={v => setData('max_fine', v)} />
                                    </Field>
                                    <Field label={t('admin.settings_ui.grace_period')} error={errors.grace_period_days}>
                                        <Input type="number" min="0" max="30" value={data.grace_period_days} onChange={v => setData('grace_period_days', v)} />
                                    </Field>
                                    <Field label={t('admin.settings_ui.reservation_expiry')} error={errors.reservation_expiry}>
                                        <Input type="number" min="1" max="90" value={data.reservation_expiry} onChange={v => setData('reservation_expiry', v)} />
                                    </Field>
                                </div>
                                <Field label={t('admin.settings_ui.self_registration')}>
                                    <Toggle
                                        checked={data.enable_self_registration === '1' || data.enable_self_registration === true}
                                        onChange={v => setData('enable_self_registration', v ? '1' : '0')}
                                        label={t('admin.settings_ui.allow_self_reg')}
                                    />
                                </Field>
                                <Field label={t('admin.settings_ui.email_verification')}>
                                    <Toggle
                                        checked={data.require_email_verification === '1' || data.require_email_verification === true}
                                        onChange={v => setData('require_email_verification', v ? '1' : '0')}
                                        label={t('admin.settings_ui.require_verification')}
                                    />
                                </Field>
                            </Section>
                        )}

                        {/* Notifications */}
                        {tab === 'notifications' && (
                            <Section title={t('admin.settings_ui.section_notifications')}>
                                <Field label={t('admin.settings_ui.notif_email')} error={errors.notifications_email}>
                                    <Input type="email" value={data.notifications_email} onChange={v => setData('notifications_email', v)} placeholder="staff@library.com" />
                                    <p className="text-xs text-gray-400 mt-1">{t('admin.settings_ui.notif_email_hint')}</p>
                                </Field>
                                <Field label={t('admin.settings_ui.overdue_notices')}>
                                    <Toggle
                                        checked={data.send_overdue_notices === '1' || data.send_overdue_notices === true}
                                        onChange={v => setData('send_overdue_notices', v ? '1' : '0')}
                                        label={t('admin.settings_ui.send_overdue')}
                                    />
                                </Field>
                                <Field label={t('admin.settings_ui.due_reminders')}>
                                    <Toggle
                                        checked={data.send_due_reminders === '1' || data.send_due_reminders === true}
                                        onChange={v => setData('send_due_reminders', v ? '1' : '0')}
                                        label={t('admin.settings_ui.send_reminders')}
                                    />
                                </Field>
                                <Field label={t('admin.settings_ui.reminder_days')} error={errors.reminder_days_before}>
                                    <Input type="number" min="1" max="30" value={data.reminder_days_before} onChange={v => setData('reminder_days_before', v)} />
                                    <p className="text-xs text-gray-400 mt-1">{t('admin.settings_ui.reminder_hint')}</p>
                                </Field>
                            </Section>
                        )}

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
                            >
                                {processing ? t('admin.settings_ui.saving') : t('admin.settings_ui.save_settings')}
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

function ImageUpload({ value, currentUrl, onChange, hint, accept = 'image/*', square = false }) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState(currentUrl ?? null);

    // Build (and clean up) a blob URL for the freshly-picked file;
    // fall back to the saved image when nothing is selected.
    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreview(currentUrl ?? null);
    }, [value, currentUrl]);

    const pick = (files) => {
        if (files && files[0]) onChange(files[0]);
    };

    const clear = (e) => {
        e.stopPropagation();
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files); }}
            className={`group relative flex items-center gap-4 rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-all ${
                dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
        >
            {/* Preview thumbnail */}
            <div className={`flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 bg-white ${
                square ? 'w-14 h-14 rounded-lg' : 'w-16 h-16 rounded-xl'
            }`}>
                {preview ? (
                    <img src={preview} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                )}
            </div>

            {/* Label + hint */}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">
                    {value instanceof File
                        ? value.name
                        : (preview ? 'Replace image' : 'Click or drag & drop to upload')}
                </p>
                {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
            </div>

            {/* Action */}
            {value instanceof File ? (
                <button
                    type="button"
                    onClick={clear}
                    title="Remove"
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            ) : (
                <UploadCloud className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={(e) => pick(e.target.files)}
                className="hidden"
            />
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

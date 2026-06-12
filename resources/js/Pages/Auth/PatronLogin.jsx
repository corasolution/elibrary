import { useForm, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, LogIn, QrCode } from 'lucide-react';
import { useState } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';

export default function PatronLogin() {
    const { t } = useTranslation();
    const { tenant, flash } = usePage().props;
    const base = tenant?.base_url ?? '';
    const [showPwd, setShowPwd] = useState(false);
    const [tab, setTab] = useState('email'); // 'email' | 'qr'

    const { data, setData, post, processing, errors } = useForm({
        email: '', password: '', remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`${base}/login`);
    };

    return (
        <AuthLayout
            title={t('auth.patron_login_title')}
            subtitle={t('auth.welcome_back')}
        >
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
                <button
                    type="button"
                    onClick={() => setTab('email')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                        tab === 'email'
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                </button>
                <button
                    type="button"
                    onClick={() => setTab('qr')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                        tab === 'qr'
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Login
                    <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full leading-none">Soon</span>
                </button>
            </div>

            {/* Server-side error flash */}
            {flash?.error && tab === 'email' && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {flash.error}
                </div>
            )}

            {/* ── QR Login panel ── */}
            {tab === 'qr' && (
                <div className="flex flex-col items-center py-4 gap-5">
                    {/* QR placeholder frame */}
                    <div className="relative w-44 h-44 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 flex items-center justify-center">
                        <QrCode className="w-20 h-20 text-blue-200" />
                        {/* Coming soon overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-white/70 flex flex-col items-center justify-center gap-1">
                            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Coming Soon</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Scan to Log In</p>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-[220px]">
                            Open your library card app and scan the QR code to sign in instantly — no password needed.
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 text-gray-400 text-sm font-semibold rounded-xl cursor-not-allowed"
                    >
                        <QrCode className="w-4 h-4" />
                        QR Login — Coming Soon
                    </button>
                </div>
            )}

            {/* ── Email / Password form ── */}
            {tab === 'email' && <form onSubmit={submit} className="space-y-5">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t('auth.email')}
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                            }`}
                            autoComplete="email"
                            required
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t('auth.password')}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type={showPwd ? 'text' : 'password'}
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                            }`}
                            autoComplete="current-password"
                            required
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={e => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {t('auth.remember_me')}
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                        {t('auth.forgot_password')}
                    </a>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-600/20"
                >
                    {processing ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Signing in…
                        </span>
                    ) : (
                        <>
                            <LogIn className="w-4 h-4" />
                            {t('auth.login')}
                        </>
                    )}
                </button>
            </form>}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{t('auth.no_account') ?? "Don't have an account?"}</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Register link */}
            <Link
                href={`${base}/register`}
                className="w-full flex items-center justify-center py-2.5 px-4 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-sm font-semibold rounded-xl transition-all"
            >
                {t('auth.register') ?? 'Create Account'}
            </Link>
        </AuthLayout>
    );
}

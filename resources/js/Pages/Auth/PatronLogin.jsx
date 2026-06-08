import { useForm, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';

export default function PatronLogin() {
    const { t } = useTranslation();
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';
    const [showPwd, setShowPwd] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '', password: '', remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`${base}/login`);
    };

    return (
        <AuthLayout title={t('auth.patron_login_title')} subtitle={t('auth.welcome_back')}>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="field-label">{t('auth.email')}</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="input"
                        autoComplete="email"
                        required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="field-label">{t('auth.password')}</label>
                    <div className="relative">
                        <input
                            type={showPwd ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="input pr-10"
                            autoComplete="current-password"
                            required
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        {t('auth.remember_me')}
                    </label>
                    <a href="#" className="text-blue-600 hover:underline">{t('auth.forgot_password')}</a>
                </div>

                <button type="submit" disabled={processing}
                    className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
                    {processing ? 'Signing in…' : t('auth.login')}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                {t('auth.no_account')}{' '}
                <Link href={`${base}/register`} className="text-blue-600 hover:underline font-medium">
                    {t('auth.register')}
                </Link>
            </p>
        </AuthLayout>
    );
}

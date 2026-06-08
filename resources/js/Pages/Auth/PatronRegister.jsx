import { useForm, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@/Layouts/AuthLayout';

export default function PatronRegister() {
    const { t } = useTranslation();
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';

    const { data, setData, post, processing, errors } = useForm({
        first_name: '', last_name: '', email: '',
        password: '', password_confirmation: '', phone: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(`${base}/register`);
    };

    return (
        <AuthLayout
            title={t('auth.patron_register_title')}
            subtitle="Register to access the library"
            maxWidth="max-w-md"
        >
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="field-label">First Name *</label>
                        <input type="text" value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            className="input" required />
                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                        <label className="field-label">Last Name</label>
                        <input type="text" value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            className="input" />
                    </div>
                </div>

                <div>
                    <label className="field-label">{t('auth.email')} *</label>
                    <input type="email" value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="input" required />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="field-label">{t('auth.phone')} ({t('common.optional')})</label>
                    <input type="tel" value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="input" />
                </div>

                <div>
                    <label className="field-label">{t('auth.password')} *</label>
                    <input type="password" value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="input" required />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                    <label className="field-label">Confirm Password *</label>
                    <input type="password" value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="input" required />
                </div>

                <button type="submit" disabled={processing}
                    className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
                    {processing ? 'Creating account…' : t('auth.register')}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                {t('auth.have_account')}{' '}
                <Link href={`${base}/login`} className="text-blue-600 hover:underline font-medium">
                    {t('auth.login')}
                </Link>
            </p>
        </AuthLayout>
    );
}

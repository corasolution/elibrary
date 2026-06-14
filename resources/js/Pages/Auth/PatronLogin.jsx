import { useForm, Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, LogIn, QrCode, Camera, X, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';

// QR scanner component using html5-qrcode
function QrLoginScanner({ slug }) {
    const [stage, setStage] = useState('idle'); // idle | scanning | submitting | error
    const [errMsg, setErrMsg] = useState('');
    const scannerRef = useRef(null);

    const startScan = async () => {
        setStage('scanning');
        setErrMsg('');

        const { Html5QrcodeScanner } = await import('html5-qrcode');

        scannerRef.current = new Html5QrcodeScanner(
            'qr-reader',
            { fps: 10, qrbox: { width: 200, height: 200 }, rememberLastUsedCamera: true },
            false
        );

        scannerRef.current.render(
            (decodedText) => {
                stopScan();
                setStage('submitting');
                submitToken(decodedText);
            },
            () => {} // continuous scan errors ignored
        );
    };

    const stopScan = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(() => {});
            scannerRef.current = null;
        }
    };

    const submitToken = (token) => {
        router.post(`/${slug}/login/qr`, { qr_token: token }, {
            onSuccess: () => {},
            onError: (errs) => {
                setErrMsg(errs.qr || 'Invalid QR code. Please try again.');
                setStage('error');
            },
        });
    };

    const reset = () => {
        stopScan();
        setStage('idle');
        setErrMsg('');
    };

    useEffect(() => { return () => stopScan(); }, []);

    return (
        <div className="flex flex-col items-center gap-4 py-2">
            {stage === 'scanning' && (
                <div className="w-full">
                    <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
                </div>
            )}

            {stage === 'idle' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-44 h-44 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 flex items-center justify-center">
                        <Camera className="w-16 h-16 text-blue-300" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Scan Your Library Card</p>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-[220px]">
                            Hold your library card QR code up to the camera to sign in instantly.
                        </p>
                    </div>
                    <button type="button" onClick={startScan}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                        <Camera className="w-4 h-4" />
                        Open Camera
                    </button>
                </div>
            )}

            {stage === 'submitting' && (
                <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm font-medium text-gray-700">Verifying...</p>
                </div>
            )}

            {stage === 'error' && (
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="w-full flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{errMsg}</p>
                    </div>
                    <button type="button" onClick={reset}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                        <Camera className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            )}

            {stage === 'scanning' && (
                <button type="button" onClick={reset}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                    <X className="w-3.5 h-3.5" /> Cancel
                </button>
            )}
        </div>
    );
}

export default function PatronLogin() {
    const { t } = useTranslation();
    const { tenant, flash } = usePage().props;
    const base = tenant?.base_url ?? '';
    const slug = tenant?.slug ?? '';
    const [showPwd, setShowPwd] = useState(false);
    const [tab, setTab] = useState('email');

    const { data, setData, post, processing, errors } = useForm({
        login: '', password: '', remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`${base}/login`);
    };

    return (
        <AuthLayout title={t('auth.patron_login_title')} subtitle={t('auth.welcome_back')}>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
                <button type="button" onClick={() => setTab('email')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'email' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Mail className="w-3.5 h-3.5" />
                    Email
                </button>
                <button type="button" onClick={() => setTab('qr')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'qr' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <QrCode className="w-3.5 h-3.5" />
                    QR Login
                </button>
            </div>

            {flash?.error && tab === 'email' && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {flash.error}
                </div>
            )}

            {tab === 'qr' && <QrLoginScanner slug={slug} />}

            {tab === 'email' && (
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.login_identifier', 'Email or card number')}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input type="text" value={data.login} onChange={e => setData('login', e.target.value)}
                                placeholder={t('auth.login_identifier_placeholder', 'you@example.com or P00012')} autoComplete="username" required
                                className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.login ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`} />
                        </div>
                        {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.password')}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input type={showPwd ? 'text' : 'password'} value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="..." autoComplete="current-password" required
                                className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`} />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                            <input type="checkbox" checked={data.remember} onChange={e => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            {t('auth.remember_me')}
                        </label>
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                            {t('auth.forgot_password')}
                        </a>
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-600/20">
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            <><LogIn className="w-4 h-4" />{t('auth.login')}</>
                        )}
                    </button>
                </form>
            )}

            {tenant?.self_registration && (
                <>
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">{t('auth.no_account') ?? "Don't have an account?"}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <Link href={`${base}/register`}
                        className="w-full flex items-center justify-center py-2.5 px-4 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-sm font-semibold rounded-xl transition-all">
                        {t('auth.register') ?? 'Create Account'}
                    </Link>
                </>
            )}
        </AuthLayout>
    );
}

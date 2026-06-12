import OpacLayout from '@/Layouts/OpacLayout';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Clock, Bookmark, History, User, AlertCircle, QrCode, Download, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

function LibraryCardQr({ base, patron }) {
    const [qrToken, setQrToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef(null);

    useEffect(() => {
        fetch(`${base}/account/qr-token`, { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.json())
            .then(d => { setQrToken(d.qr_token); setLoading(false); })
            .catch(() => setLoading(false));
    }, [base]);

    const downloadQr = () => {
        const canvas = document.querySelector('#patron-qr canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `library-card-${patron.patron_number}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const printQr = () => {
        const canvas = document.querySelector('#patron-qr canvas');
        if (!canvas) return;
        const w = window.open('', '_blank');
        w.document.write(`
            <html><body style="text-align:center;font-family:sans-serif;padding:20px">
            <h3>${patron.first_name} ${patron.last_name}</h3>
            <p style="font-size:12px;color:#666">${patron.patron_number}</p>
            <img src="${canvas.toDataURL('image/png')}" style="width:180px;height:180px" />
            <p style="font-size:11px;color:#999;margin-top:8px">Library Card</p>
            </body></html>
        `);
        w.document.close();
        w.focus();
        w.print();
        w.close();
    };

    return (
        <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-4 h-4 text-blue-600" />
                <h2 className="font-semibold text-gray-900 text-sm">Library Card QR</h2>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!loading && qrToken && (
                <div className="flex flex-col items-center gap-3">
                    <div id="patron-qr" className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <QRCode value={qrToken} size={160} level="H" includeMargin />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-gray-800 text-sm">{patron.first_name} {patron.last_name}</p>
                        <p className="text-xs text-gray-400 font-mono">{patron.patron_number}</p>
                    </div>
                    <div className="flex gap-2 w-full">
                        <button onClick={downloadQr}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Download
                        </button>
                        <button onClick={printQr}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center leading-relaxed">
                        Use this QR code at any library terminal to sign in without a password.
                    </p>
                </div>
            )}

            {!loading && !qrToken && (
                <p className="text-sm text-gray-400 text-center py-4">QR code not available.</p>
            )}
        </div>
    );
}

export default function MyAccount({ patron, reservationCount }) {
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';
    const { t } = useTranslation();

    const memberSince = patron.created_at
        ? new Date(patron.created_at).getFullYear()
        : '—';

    const expiryDate = patron.membership_expiry
        ? new Date(patron.membership_expiry).toLocaleDateString()
        : '—';

    const isExpired = patron.membership_expiry && new Date(patron.membership_expiry) < new Date();

    return (
        <OpacLayout>
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Profile header */}
                <div className="card p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {patron.first_name} {patron.last_name}
                        </h1>
                        {patron.first_name_km && (
                            <p className="text-gray-500 font-khmer">{patron.first_name_km} {patron.last_name_km}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            {t('account.card')}: <span className="font-mono font-medium">{patron.patron_number}</span>
                            {' · '}
                            {patron.category?.name ?? 'Member'}
                            {' · '}
                            {t('account.member_since')} {memberSince}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">{t('account.membership_expires')}</p>
                        <p className={`font-semibold text-sm ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                            {expiryDate}
                        </p>
                        {isExpired && (
                            <span className="badge badge-amber text-xs mt-1">{t('account.expired')}</span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Clock} label={t('account.active_loans')} value={patron.active_loans ?? 0} color="blue" />
                    <StatCard icon={BookOpen} label={t('account.total_checkouts')} value={patron.total_checkouts ?? 0} color="green" />
                    <StatCard icon={Bookmark} label={t('account.reservations')} value={reservationCount ?? 0} color="amber" />
                    <StatCard icon={AlertCircle} label={t('account.fines')} value="$0.00" color="red" />
                </div>

                {/* Main content grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                    {/* Navigation cards (2 col) */}
                    <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4 content-start">
                        <AccountLink href={`${base}/account/loans`} icon={Clock}
                            title={t('account.current_loans')} description={t('account.current_loans_desc')} />
                        <AccountLink href={`${base}/account/reservations`} icon={Bookmark}
                            title={t('account.my_reservations')} description={t('account.reservations_desc')} />
                        <AccountLink href={`${base}/account/history`} icon={History}
                            title={t('account.loan_history')} description={t('account.history_desc')} />
                        <AccountLink href={`${base}/catalog`} icon={BookOpen}
                            title={t('account.browse_catalog')} description={t('account.browse_catalog_desc')} />
                    </div>

                    {/* QR Card (1 col) */}
                    <div>
                        <LibraryCardQr base={base} patron={patron} />
                    </div>
                </div>
            </div>
        </OpacLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        blue:  'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
        red:   'bg-red-50 text-red-600',
    };
    return (
        <div className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        </div>
    );
}

function AccountLink({ href, icon: Icon, title, description }) {
    return (
        <Link href={href} className="card p-5 flex gap-4 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
        </Link>
    );
}


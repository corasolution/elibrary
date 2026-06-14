import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm, router } from '@inertiajs/react';
import {
    BookMarked, Clock, CheckCircle2, XCircle, BookOpen,
    AlertTriangle, X, CheckCheck, CalendarDays, TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = {
    pending:   { bg: 'bg-amber-100',   text: 'text-amber-700',   ring: 'ring-amber-200',  dot: 'bg-amber-400',  icon: Clock },
    waiting:   { bg: 'bg-blue-100',    text: 'text-blue-700',    ring: 'ring-blue-200',   dot: 'bg-blue-400',   icon: TrendingUp },
    ready:     { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200',dot: 'bg-emerald-500',icon: CheckCircle2 },
    fulfilled: { bg: 'bg-gray-100',    text: 'text-gray-500',    ring: 'ring-gray-200',   dot: 'bg-gray-400',   icon: CheckCheck },
    cancelled: { bg: 'bg-red-100',     text: 'text-red-600',     ring: 'ring-red-200',    dot: 'bg-red-400',    icon: XCircle },
    expired:   { bg: 'bg-orange-100',  text: 'text-orange-700',  ring: 'ring-orange-200', dot: 'bg-orange-400', icon: AlertTriangle },
};

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isExpiringSoon(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return (d - new Date()) < 1000 * 60 * 60 * 48; // < 48h
}

function initials(first, last) {
    return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase() || '?';
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500'];
function avatarColor(name = '') {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function ReservationsIndex({ reservations, filters = {}, stats = {} }) {
    const list       = reservations?.data ?? [];
    const activeTab  = filters?.status ?? '';
    const { t } = useTranslation();

    const total     = stats.total     ?? (reservations?.total ?? 0);
    const pending   = stats.pending   ?? list.filter(r => r.status === 'pending').length;
    const ready     = stats.ready     ?? list.filter(r => r.status === 'ready').length;
    const fulfilled = stats.fulfilled ?? 0;

    const FILTER_TABS = [
        { key: '',          label: t('common.all') },
        { key: 'pending',   label: t('admin.reservations_ui.status_pending', 'Pending') },
        { key: 'waiting',   label: t('admin.reservations_ui.status_waiting', 'Waiting') },
        { key: 'ready',     label: t('admin.reservations_ui.status_ready', 'Ready') },
        { key: 'fulfilled', label: t('admin.reservations_ui.status_fulfilled', 'Fulfilled') },
        { key: 'expired',   label: t('admin.reservations_ui.status_expired', 'Expired') },
    ];

    return (
        <AdminLayout title={t('admin.reservations_ui.page_title')}>
            <div className="space-y-6">

                {/* ── Stats row ──────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={BookMarked}   color="blue"    label={t('admin.reservations_ui.stat_total')}     value={total}     />
                    <StatCard icon={Clock}        color="amber"   label={t('admin.reservations_ui.status_pending', 'Pending')}  value={pending}   />
                    <StatCard icon={CheckCircle2} color="emerald" label={t('admin.reservations_ui.status_ready', 'Ready')}     value={ready}     />
                    <StatCard icon={CheckCheck}   color="gray"    label={t('admin.reservations_ui.status_fulfilled', 'Fulfilled')} value={fulfilled} />
                </div>

                {/* ── Main card ──────────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                                <BookMarked className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">{t('admin.reservations_ui.page_title')}</h2>
                                <p className="text-xs text-gray-500">{reservations?.total ?? 0} {t('admin.reservations_ui.holds')}</p>
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div className="ml-auto flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
                            {FILTER_TABS.map(tab => (
                                <button key={tab.key}
                                    onClick={() => router.get(route('admin.reservations.index'), tab.key ? { status: tab.key } : {}, { preserveState: true })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        activeTab === tab.key
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    {list.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/70 border-b border-gray-100">
                                            <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('admin.reservations_ui.col_patron')}</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('admin.reservations_ui.col_title')}</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('admin.reservations_ui.col_reserved')}</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('admin.reservations_ui.col_expires')}</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('admin.reservations_ui.col_status')}</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('admin.reservations_ui.col_queue')}</th>
                                            <th className="py-3 px-4 w-40" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {list.map((r, i) => {
                                            const sm = STATUS_COLORS[r.status] ?? STATUS_COLORS.pending;
                                            const patronName = `${r.patron?.first_name ?? ''} ${r.patron?.last_name ?? ''}`.trim();
                                            const expiring = r.status === 'ready' && isExpiringSoon(r.expiry_date);

                                            return (
                                                <tr key={r.id} className={`group transition-colors hover:bg-gray-50/80 ${expiring ? 'bg-orange-50/30' : ''}`}>

                                                    {/* Patron */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${avatarColor(patronName)}`}>
                                                                {initials(r.patron?.first_name, r.patron?.last_name)}
                                                            </div>
                                                            <div>
                                                                <Link href={route('admin.patrons.show', r.patron?.id)}
                                                                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm">
                                                                    {patronName || '—'}
                                                                </Link>
                                                                <div className="text-xs text-gray-400 font-mono mt-0.5">{r.patron?.patron_number}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Title */}
                                                    <td className="py-3.5 px-4 max-w-xs">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-6 h-8 bg-gradient-to-b from-blue-100 to-blue-200 rounded flex-shrink-0 flex items-center justify-center">
                                                                <BookOpen className="w-3 h-3 text-blue-500" />
                                                            </div>
                                                            <span className="truncate text-gray-800 text-sm font-medium" title={r.bibliographic_record?.title}>
                                                                {r.bibliographic_record?.title ?? '—'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Reserved */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                            <CalendarDays className="w-3 h-3 flex-shrink-0" />
                                                            {formatDate(r.reserved_at)}
                                                        </div>
                                                    </td>

                                                    {/* Expires */}
                                                    <td className="py-3.5 px-4">
                                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${expiring ? 'text-orange-600' : 'text-gray-500'}`}>
                                                            {expiring && <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
                                                            {!expiring && <Clock className="w-3 h-3 flex-shrink-0" />}
                                                            {formatDate(r.expiry_date)}
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${sm.bg} ${sm.text} ${sm.ring}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sm.dot}`} />
                                                            {t(`admin.reservations_ui.status_${r.status}`, { defaultValue: r.status })}
                                                        </span>
                                                    </td>

                                                    {/* Queue # */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        {r.queue_position ? (
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold ring-1 ring-blue-200">
                                                                #{r.queue_position}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-300 text-sm">—</span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            {r.status === 'pending' && <ReadyButton id={r.id} />}
                                                            {['pending','waiting','ready'].includes(r.status) && <CancelButton id={r.id} />}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={reservations?.links} />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                                <BookMarked className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-400">{t('admin.reservations_ui.no_reservations')}</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

// ── Stat card ────────────────────────────────────────────────────────────────
const COLOR_MAP = {
    blue:    { bg: 'bg-blue-100',    icon: 'text-blue-600',    num: 'text-blue-700' },
    amber:   { bg: 'bg-amber-100',   icon: 'text-amber-600',   num: 'text-amber-700' },
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', num: 'text-emerald-700' },
    gray:    { bg: 'bg-gray-100',    icon: 'text-gray-500',    num: 'text-gray-700' },
};

function StatCard({ icon: Icon, color, label, value }) {
    const c = COLOR_MAP[color] ?? COLOR_MAP.gray;
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                <Icon className={`w-5 h-5 ${c.icon}`} />
            </div>
            <div>
                <div className={`text-xl font-bold ${c.num}`}>{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
            </div>
        </div>
    );
}

// ── Action buttons ───────────────────────────────────────────────────────────
function ReadyButton({ id }) {
    const { post, processing } = useForm();
    const { t } = useTranslation();
    return (
        <button onClick={() => post(route('admin.reservations.ready', id))} disabled={processing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 ring-1 ring-emerald-200 transition-colors">
            {processing
                ? <span className="w-3 h-3 border-2 border-emerald-400/50 border-t-emerald-600 rounded-full animate-spin" />
                : <CheckCircle2 className="w-3 h-3" />
            }
            {t('admin.reservations_ui.fulfill_btn')}
        </button>
    );
}

function CancelButton({ id }) {
    const { post, processing } = useForm();
    const { t } = useTranslation();
    return (
        <button onClick={() => post(route('admin.reservations.cancel', id))} disabled={processing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 ring-1 ring-red-200 transition-colors">
            {processing
                ? <span className="w-3 h-3 border-2 border-red-300/50 border-t-red-600 rounded-full animate-spin" />
                : <X className="w-3 h-3" />
            }
            {t('admin.reservations_ui.cancel_btn')}
        </button>
    );
}

// ── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Showing page results</p>
            <div className="flex gap-1">
                {links.map((link, i) => (
                    link.url
                        ? <Link key={i} href={link.url}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                                link.active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }} />
                        : <span key={i} className="px-3 py-1.5 text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>
        </div>
    );
}

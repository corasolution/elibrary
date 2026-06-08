import OpacLayout from '@/Layouts/OpacLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { BookOpen, Bookmark, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const STATUS_CONFIG = {
    pending:   { label: 'Pending',   icon: Clock,        color: 'badge-amber' },
    waiting:   { label: 'Waiting',   icon: Clock,        color: 'badge-blue' },
    ready:     { label: 'Ready!',    icon: CheckCircle,  color: 'badge-green' },
    fulfilled: { label: 'Fulfilled', icon: CheckCircle,  color: 'badge-gray' },
    cancelled: { label: 'Cancelled', icon: XCircle,      color: 'badge-red' },
    expired:   { label: 'Expired',   icon: XCircle,      color: 'badge-gray' },
};

export default function MyReservations({ reservations }) {
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';

    return (
        <OpacLayout>
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="flex items-center gap-3 mb-6">
                    <Link href={`${base}/account`} className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
                    <span className="badge badge-blue">{reservations.length} active</span>
                </div>

                {reservations.length === 0 ? (
                    <div className="card p-12 text-center text-gray-400">
                        <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No active reservations</p>
                        <Link href={`${base}/catalog`} className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                            Browse the catalog →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reservations.map(res => {
                            const record = res.bibliographic_record;
                            const cfg = STATUS_CONFIG[res.status] ?? STATUS_CONFIG.pending;
                            const StatusIcon = cfg.icon;
                            return (
                                <div key={res.id} className={`card p-4 flex gap-4 ${res.status === 'ready' ? 'border-green-300 bg-green-50' : ''}`}>
                                    <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                        {record?.cover_image_url
                                            ? <img src={record.cover_image_url} alt="" className="object-cover w-full h-full rounded-lg" />
                                            : <BookOpen className="w-5 h-5 text-gray-300" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`${base}/catalog/${record?.id}`}
                                            className="font-semibold text-gray-900 hover:text-blue-700 line-clamp-1">
                                            {record?.title ?? 'Unknown Title'}
                                        </Link>
                                        <p className="text-sm text-gray-500">{record?.authors?.[0]?.name ?? '—'}</p>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                            <span>Reserved: {new Date(res.reserved_at).toLocaleDateString()}</span>
                                            {res.expiry_date && (
                                                <span>Expires: {new Date(res.expiry_date).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        {res.status === 'ready' && (
                                            <p className="text-xs text-green-700 font-medium mt-1">
                                                Your item is ready for pickup!
                                            </p>
                                        )}
                                    </div>
                                    <div className="shrink-0 flex flex-col items-end gap-2">
                                        <span className={`badge ${cfg.color} flex items-center gap-1`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {cfg.label}
                                        </span>
                                        {!['fulfilled', 'cancelled', 'expired'].includes(res.status) && (
                                            <CancelButton id={res.id} slug={tenant?.slug} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </OpacLayout>
    );
}

function CancelButton({ id, slug }) {
    const { delete: destroy, processing } = useForm();
    return (
        <button
            onClick={() => { if (confirm('Cancel this reservation?')) destroy(route('library.opac.account.reservations.cancel', { slug, id })); }}
            disabled={processing}
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
        >
            Cancel
        </button>
    );
}

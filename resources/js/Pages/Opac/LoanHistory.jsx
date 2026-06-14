import OpacLayout from '@/Layouts/OpacLayout';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, CheckCircle, ArrowLeft } from 'lucide-react';
import { fmtDate } from '@/utils/date';

export default function LoanHistory({ history }) {
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';

    return (
        <OpacLayout>
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="flex items-center gap-3 mb-6">
                    <Link href={`${base}/account`} className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Loan History</h1>
                    <span className="badge badge-blue">{history.total ?? 0} total</span>
                </div>

                {history.data?.length === 0 ? (
                    <div className="card p-12 text-center text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No loan history yet.</p>
                    </div>
                ) : (
                    <div className="card divide-y divide-gray-100 overflow-hidden">
                        {history.data.map(loan => {
                            const record = loan.item?.bibliographic_record;
                            return (
                                <div key={loan.id} className="flex gap-4 p-4 hover:bg-gray-50">
                                    <div className="w-10 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                        {record?.cover_image_url
                                            ? <img src={record.cover_image_url} alt="" className="object-cover w-full h-full rounded-lg" />
                                            : <BookOpen className="w-4 h-4 text-gray-300" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`${base}/catalog/${record?.id}`}
                                            className="font-medium text-gray-900 hover:text-blue-700 line-clamp-1 text-sm">
                                            {record?.title ?? 'Unknown Title'}
                                        </Link>
                                        <p className="text-xs text-gray-500">{record?.authors?.[0]?.name ?? '—'}</p>
                                        <div className="flex gap-3 mt-1 text-xs text-gray-400">
                                            <span>Out: {fmtDate(loan.checked_out_at)}</span>
                                            <span>Returned: {fmtDate(loan.returned_at)}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="badge badge-green text-xs">Returned</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {history.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {history.links?.map((link, i) => (
                            <Link key={i} href={link.url ?? '#'}
                                className={`px-3 py-1.5 rounded-lg text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'} ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </OpacLayout>
    );
}

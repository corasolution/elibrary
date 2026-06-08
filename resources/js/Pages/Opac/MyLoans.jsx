import OpacLayout from '@/Layouts/OpacLayout';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, AlertCircle, Clock, ArrowLeft } from 'lucide-react';

export default function MyLoans({ loans }) {
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';

    return (
        <OpacLayout>
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="flex items-center gap-3 mb-6">
                    <Link href={`${base}/account`} className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Current Loans</h1>
                </div>

                {loans.data?.length === 0 ? (
                    <div className="card p-12 text-center text-gray-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No active loans</p>
                        <Link href={`${base}/catalog`} className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                            Browse the catalog →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {loans.data.map(loan => (
                            <LoanCard key={loan.id} loan={loan} base={base} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {loans.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {loans.links?.map((link, i) => (
                            <Link key={i} href={link.url ?? '#'}
                                className={`px-3 py-1.5 rounded-lg text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'} ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </OpacLayout>
    );
}

function LoanCard({ loan, base }) {
    const dueDate  = new Date(loan.due_date);
    const today    = new Date();
    const daysLeft = Math.ceil((dueDate - today) / 86400000);
    const isOverdue = daysLeft < 0;
    const isDueSoon = !isOverdue && daysLeft <= 3;

    const record = loan.item?.bibliographic_record;

    return (
        <div className={`card p-4 flex gap-4 ${isOverdue ? 'border-red-200' : isDueSoon ? 'border-amber-200' : ''}`}>
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
                <p className="text-sm text-gray-500">
                    {record?.authors?.[0]?.name ?? '—'}
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    <span className="text-gray-400">
                        Barcode: <span className="font-mono">{loan.item?.barcode}</span>
                    </span>
                    <span className="text-gray-400">
                        Checked out: {new Date(loan.checked_out_at).toLocaleDateString()}
                    </span>
                    {loan.renewals_count > 0 && (
                        <span className="badge badge-blue">Renewed ×{loan.renewals_count}</span>
                    )}
                </div>
            </div>
            <div className="text-right shrink-0">
                <div className={`flex items-center gap-1 text-sm font-semibold ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-gray-700'}`}>
                    {(isOverdue || isDueSoon) && <AlertCircle className="w-4 h-4" />}
                    <Clock className="w-4 h-4" />
                    {dueDate.toLocaleDateString()}
                </div>
                <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-500' : 'text-gray-400'}`}>
                    {isOverdue
                        ? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue`
                        : daysLeft === 0 ? 'Due today'
                        : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                    }
                </p>
                {loan.fine_amount > 0 && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                        Fine: ${Number(loan.fine_amount).toFixed(2)}
                    </p>
                )}
            </div>
        </div>
    );
}

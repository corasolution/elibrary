import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';
import { BookmarkPlus } from 'lucide-react';

const STATUS_COLORS = {
    pending:   'badge-amber',
    waiting:   'badge-blue',
    ready:     'badge-green',
    fulfilled: 'badge-gray',
    cancelled: 'badge-red',
    expired:   'badge-gray',
};

export default function ReservationsIndex({ reservations, filters = {} }) {
    const list = reservations?.data ?? [];

    return (
        <AdminLayout title="Reservations">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                    <BookmarkPlus className="w-4 h-4 text-blue-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Active Reservations</h2>
                    <span className="ml-auto text-xs text-gray-400">{reservations?.total ?? 0} total</span>
                </div>

                {list.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Patron</th>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Title</th>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Reserved</th>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Expires</th>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Status</th>
                                        <th className="py-2 px-4" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.map(r => (
                                        <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="py-2 px-4">
                                                <Link href={route('admin.patrons.show', r.patron?.id)} className="font-medium text-blue-600 hover:underline">
                                                    {r.patron?.first_name} {r.patron?.last_name}
                                                </Link>
                                                <div className="text-xs text-gray-400">{r.patron?.patron_number}</div>
                                            </td>
                                            <td className="py-2 px-4 max-w-xs">
                                                <div className="truncate text-gray-800">{r.bibliographic_record?.title ?? '—'}</div>
                                            </td>
                                            <td className="py-2 px-4 text-gray-600">{r.reserved_at?.substring(0,10)}</td>
                                            <td className="py-2 px-4 text-gray-600">{r.expiry_date ?? '—'}</td>
                                            <td className="py-2 px-4">
                                                <span className={`badge capitalize ${STATUS_COLORS[r.status] ?? 'badge-blue'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <div className="flex gap-2 justify-end">
                                                    {r.status === 'pending' && <ReadyButton id={r.id} />}
                                                    {['pending','waiting','ready'].includes(r.status) && <CancelButton id={r.id} />}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={reservations?.links} />
                    </>
                ) : (
                    <div className="text-center py-16 text-sm text-gray-400">
                        <BookmarkPlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        No active reservations.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function ReadyButton({ id }) {
    const { post, processing } = useForm();
    return (
        <button onClick={() => post(route('admin.reservations.ready', id))} disabled={processing}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 font-medium">
            Mark Ready
        </button>
    );
}

function CancelButton({ id }) {
    const { post, processing } = useForm();
    return (
        <button onClick={() => post(route('admin.reservations.cancel', id))} disabled={processing}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 font-medium">
            Cancel
        </button>
    );
}

function Pagination({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="px-5 py-3 border-t border-gray-100 flex gap-1 justify-end text-sm">
            {links.map((link, i) => (
                link.url
                    ? <Link key={i} href={link.url} className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                    : <span key={i} className="px-3 py-1 text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
            ))}
        </div>
    );
}

import { Head, Link, router, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { ArrowLeft, Send, Building2, CheckCircle, XCircle, Trash2, Plus } from 'lucide-react';

const STATUS_STYLES = {
    pending:  'bg-blue-100 text-blue-700',
    reviewed: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const SIZE_LABELS = {
    'under-500': 'Under 500',
    '500-5000': '500–5,000',
    '5000-50000': '5,000–50,000',
    '50000-plus': '50,000+',
};

export default function RegistrationRequestShow({ request: r }) {
    const { data, setData, put, processing } = useForm({
        status: r.status,
        admin_notes: r.admin_notes || '',
    });

    const setStatus = (status) => {
        put(route('central.registration-requests.update-status', r.id), {
            data: { status, admin_notes: data.admin_notes },
            preserveScroll: true,
        });
    };

    const saveNotes = () => {
        put(route('central.registration-requests.update-status', r.id), { preserveScroll: true });
    };

    const remove = () => {
        if (confirm('Delete this registration request?')) {
            router.delete(route('central.registration-requests.destroy', r.id));
        }
    };

    // Prefill the library create form from this request.
    const createLibraryUrl = route('central.tenants.create', {
        name: r.library_name,
        slug: r.slug || '',
        admin_name: r.contact_name,
        admin_email: r.contact_email,
        plan_id: r.plan_id || '',
        registration_request_id: r.id,
    });

    return (
        <CentralLayout>
            <Head title={`Request — ${r.library_name}`} />

            <div className="max-w-4xl mx-auto">
                <Link href={route('central.registration-requests.index')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to requests
                </Link>

                {/* Header */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{r.library_name}</h1>
                            {r.slug && <p className="text-sm text-gray-400 mt-0.5">Proposed URL: /{r.slug}</p>}
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>
                            {r.status}
                        </span>
                    </div>

                    {r.status === 'approved' && r.tenant_id && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <CheckCircle className="w-4 h-4" /> A library has been created from this request.
                            <Link href={route('central.tenants.show', r.tenant_id)} className="underline font-medium">View library</Link>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <Detail label="Contact name" value={r.contact_name} />
                    <Detail label="Email" value={r.contact_email} />
                    <Detail label="Telegram" value={r.telegram} icon={<Send className="w-3.5 h-3.5 text-blue-500" />} />
                    <Detail label="Phone" value={r.contact_phone} />
                    <Detail label="Library type" value={r.library_type} />
                    <Detail label="Approx. titles" value={SIZE_LABELS[r.collection_size] || r.collection_size} />
                    <Detail label="Country" value={r.country} />
                    <Detail label="Interested plan" value={r.plan?.name} />
                    <Detail label="Address" value={r.address} className="sm:col-span-2" />
                    <Detail label="Submitted" value={new Date(r.created_at).toLocaleString()} />
                    {r.reviewed_at && <Detail label="Reviewed" value={new Date(r.reviewed_at).toLocaleString()} />}
                </div>

                {/* Admin notes */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Internal notes</label>
                    <textarea
                        value={data.admin_notes}
                        onChange={(e) => setData('admin_notes', e.target.value)}
                        rows={3}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Notes from your Telegram verification, etc."
                    />
                    <button onClick={saveNotes} disabled={processing}
                        className="mt-2 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Save notes
                    </button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    <a href={createLibraryUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4" /> Create Library
                    </a>
                    <button onClick={() => setStatus('reviewed')} disabled={processing}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50">
                        <Building2 className="w-4 h-4" /> Mark Reviewed
                    </button>
                    <button onClick={() => setStatus('rejected')} disabled={processing}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50">
                        <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={remove}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 ml-auto">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>
        </CentralLayout>
    );
}

function Detail({ label, value, icon, className = '' }) {
    return (
        <div className={className}>
            <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
            <div className="text-gray-800 font-medium flex items-center gap-1.5 mt-0.5">
                {icon}{value || '—'}
            </div>
        </div>
    );
}

import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, RefreshCw, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

const STATUS_BADGE = {
    received: 'badge-green',
    expected: 'badge-blue',
    late:     'badge-amber',
    missing:  'badge-red',
};

export default function SerialShow({ serial }) {
    const [receiving, setReceiving] = useState(null);

    return (
        <AdminLayout title={serial.bibliographic_record?.title ?? 'Serial'}>
            <div className="space-y-5">
                {/* Header card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{serial.bibliographic_record?.title ?? 'Untitled'}</h1>
                            {serial.bibliographic_record?.issn && <p className="text-sm text-gray-500 mt-0.5">ISSN: {serial.bibliographic_record.issn}</p>}
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                                <span><span className="font-medium">Frequency:</span> <span className="capitalize">{serial.frequency}</span></span>
                                {serial.supplier && <span><span className="font-medium">Supplier:</span> {serial.supplier}</span>}
                                {serial.subscription_expiry && <span><span className="font-medium">Expires:</span> {serial.subscription_expiry}</span>}
                                {serial.collection && <span><span className="font-medium">Collection:</span> {serial.collection.name}</span>}
                                {serial.location && <span><span className="font-medium">Location:</span> {serial.location.name}</span>}
                                {serial.subscription_cost && <span><span className="font-medium">Annual Cost:</span> {serial.currency} {Number(serial.subscription_cost).toFixed(2)}</span>}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Link href={route('admin.serials.edit', serial.id)} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50">
                                <Pencil className="w-3.5 h-3.5" /> Edit
                            </Link>
                            <RegenerateButton serialId={serial.id} />
                        </div>
                    </div>

                    {/* Issue stats */}
                    {serial.stats && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-6 text-sm">
                            <Stat label="Received" value={serial.stats.received} color="text-green-600" />
                            <Stat label="Expected" value={serial.stats.expected} color="text-blue-600" />
                            <Stat label="Late"     value={serial.stats.late}     color="text-amber-600" />
                            <Stat label="Missing"  value={serial.stats.missing}  color="text-red-600" />
                            <Stat label="Total"    value={serial.stats.total}    color="text-gray-700" />
                        </div>
                    )}
                </div>

                {/* Issues table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700">Issues</h2>
                    </div>

                    {serial.issues?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Vol / Issue</th>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Expected</th>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Received</th>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Barcode</th>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600">Status</th>
                                        <th className="py-2 px-4" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {serial.issues.map(issue => (
                                        <tr key={issue.id} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="py-2 px-4 font-mono text-xs">
                                                v{issue.volume} #{issue.issue_number}
                                            </td>
                                            <td className="py-2 px-4 text-gray-600">{issue.expected_date ?? issue.publication_date ?? '—'}</td>
                                            <td className="py-2 px-4 text-gray-600">{issue.received_date ?? '—'}</td>
                                            <td className="py-2 px-4 font-mono text-xs text-gray-500">{issue.physical_item?.barcode ?? '—'}</td>
                                            <td className="py-2 px-4">
                                                <span className={`badge capitalize ${STATUS_BADGE[issue.effective_status ?? issue.status] ?? 'badge-blue'}`}>
                                                    {issue.effective_status ?? issue.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <div className="flex gap-1.5 justify-end">
                                                    {['expected','late'].includes(issue.effective_status ?? issue.status) && (
                                                        <button onClick={() => setReceiving(issue)}
                                                            className="px-2.5 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium">
                                                            Receive
                                                        </button>
                                                    )}
                                                    {(issue.effective_status ?? issue.status) === 'late' && (
                                                        <ClaimButton serialId={serial.id} issueId={issue.id} />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-sm text-gray-400">No issues generated yet.</div>
                    )}
                </div>
            </div>

            {/* Receive modal */}
            {receiving && (
                <ReceiveModal issue={receiving} serialId={serial.id} onClose={() => setReceiving(null)} />
            )}
        </AdminLayout>
    );
}

function Stat({ label, value, color }) {
    return (
        <div className="flex flex-col items-center min-w-[60px]">
            <span className={`text-xl font-bold ${color}`}>{value}</span>
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
}

function RegenerateButton({ serialId }) {
    const { post, processing } = useForm();
    return (
        <button onClick={() => { if (window.confirm('Regenerate expected issues?')) post(route('admin.serials.generate-issues', serialId)); }}
            disabled={processing}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
        </button>
    );
}

function ClaimButton({ serialId, issueId }) {
    const { post, processing } = useForm();
    return (
        <button onClick={() => post(route('admin.serials.claim-issue', { serial: serialId, issue: issueId }))}
            disabled={processing}
            className="px-2.5 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 disabled:opacity-50 font-medium">
            Claim
        </button>
    );
}

function ReceiveModal({ issue, serialId, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        received_date: new Date().toISOString().substring(0, 10),
        volume:        issue.volume ?? '',
        issue_number:  issue.issue_number ?? '',
        barcode:       '',
        notes:         '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.serials.receive-issue', { serial: serialId, issue: issue.id }), {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                    Receive Issue — v{issue.volume} #{issue.issue_number}
                </h2>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Received Date" required>
                        <input type="date" value={data.received_date} onChange={e => setData('received_date', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Volume">
                            <input type="text" value={data.volume} onChange={e => setData('volume', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </Field>
                        <Field label="Issue #">
                            <input type="text" value={data.issue_number} onChange={e => setData('issue_number', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </Field>
                    </div>
                    <Field label="Barcode (optional)">
                        <input type="text" value={data.barcode} onChange={e => setData('barcode', e.target.value)}
                            placeholder="Scan or enter barcode"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </Field>
                    <Field label="Notes">
                        <input type="text" value={data.notes} onChange={e => setData('notes', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </Field>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60">
                            {processing ? 'Saving…' : 'Mark Received'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="px-5 py-2 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, children, error, required }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

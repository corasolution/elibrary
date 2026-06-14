import { Head, Link, router } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import {
    CheckCircle,
    XCircle,
    Clock,
    Image as ImageIcon,
    Building2,
    DollarSign,
    Calendar,
    User
} from 'lucide-react';
import { useState } from 'react';

export default function PaymentsIndex({ payments, statistics, filters }) {
    const [selectedProof, setSelectedProof] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleVerify = (id) => {
        if (confirm('Approve this payment and activate subscription?')) {
            router.post(route('central.payments.verify', id));
        }
    };

    const handleReject = (id) => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        router.post(route('central.payments.reject', id), {
            reason: rejectReason,
        }, {
            onSuccess: () => {
                setRejectingId(null);
                setRejectReason('');
            }
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle },
            rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const currentStatus = filters?.status || 'pending';

    return (
        <CentralLayout>
            <Head title="Payment Verification" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Review and approve customer payment submissions
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Verified</p>
                                <p className="text-2xl font-bold text-green-600">{statistics.verified}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg border border-gray-200 p-2">
                    <div className="flex gap-2">
                        {['pending', 'verified', 'rejected', 'all'].map((status) => (
                            <Link
                                key={status}
                                href={route('central.payments.index', { status })}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    currentStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Payments List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {payments.data.length === 0 ? (
                        <div className="text-center py-12">
                            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {currentStatus === 'pending'
                                    ? 'No pending payments to review'
                                    : `No ${currentStatus} payments`}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {payments.data.map((payment) => (
                                <div key={payment.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-start justify-between gap-6">
                                        {/* Payment Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Building2 className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {payment.tenant.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{window.location.host}/{payment.tenant.slug}</p>
                                                </div>
                                                {getStatusBadge(payment.status)}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Amount</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {payment.currency} ${payment.amount}
                                                    </p>
                                                </div>

                                                {payment.plan && (
                                                    <div>
                                                        <p className="text-gray-600">Plan</p>
                                                        <p className="font-semibold text-gray-900">{payment.plan.name}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="text-gray-600">Submitted</p>
                                                    <p className="font-semibold text-gray-900">{payment.created_at}</p>
                                                </div>

                                                {payment.verified_at && (
                                                    <div>
                                                        <p className="text-gray-600">Verified</p>
                                                        <p className="font-semibold text-gray-900">{payment.verified_at}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {payment.notes && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Note:</span> {payment.notes}
                                                    </p>
                                                </div>
                                            )}

                                            {payment.rejection_reason && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                                    <p className="text-sm text-red-700">
                                                        <span className="font-medium">Rejected:</span> {payment.rejection_reason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Transaction Proof & Actions */}
                                        <div className="flex flex-col items-end gap-3">
                                            {payment.proof_url ? (
                                                <button
                                                    onClick={() => setSelectedProof(payment.proof_url)}
                                                    className="group relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-all"
                                                >
                                                    <img
                                                        src={payment.proof_url}
                                                        alt="Transaction proof"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ImageIcon className="w-8 h-8 text-white" />
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}

                                            {/* Actions for Pending */}
                                            {payment.status === 'pending' && (
                                                <div className="flex flex-col gap-2 w-full">
                                                    {rejectingId === payment.id ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={rejectReason}
                                                                onChange={(e) => setRejectReason(e.target.value)}
                                                                placeholder="Reason for rejection..."
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                                                rows="3"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleReject(payment.id)}
                                                                    className="flex-1 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => setRejectingId(null)}
                                                                    className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleVerify(payment.id)}
                                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectingId(payment.id)}
                                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {payment.verified_by && (
                                                <div className="text-xs text-gray-500">
                                                    By: {payment.verified_by}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {payments.data.length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{payments.from}</span> to{' '}
                                    <span className="font-medium">{payments.to}</span> of{' '}
                                    <span className="font-medium">{payments.total}</span> payments
                                </div>
                                <div className="flex gap-2">
                                    {payments.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-sm rounded-lg ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {selectedProof && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedProof(null)}
                >
                    <div className="max-w-4xl max-h-[90vh] relative">
                        <button
                            onClick={() => setSelectedProof(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300"
                        >
                            <XCircle className="w-8 h-8" />
                        </button>
                        <img
                            src={selectedProof}
                            alt="Transaction proof"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </CentralLayout>
    );
}

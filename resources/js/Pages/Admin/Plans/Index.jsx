import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { CreditCard, Plus, Edit, Trash2, Check, X, Infinity } from 'lucide-react';

export default function PlansIndex({ plans }) {
    const handleDelete = (plan) => {
        if (confirm(`Are you sure you want to delete the "${plan.name}" plan?`)) {
            router.delete(route('admin.plans.destroy', plan.id));
        }
    };

    const formatLimit = (value) => {
        return value ? value.toLocaleString() : <Infinity className="w-4 h-4 inline" />;
    };

    return (
        <AdminLayout title="Subscription Plans">
            <Head title="Subscription Plans" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Subscription Plans</h1>
                            <p className="text-sm text-gray-600">Manage pricing tiers and features</p>
                        </div>
                    </div>
                    <Link
                        href={route('admin.plans.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Plan
                    </Link>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-blue-300 transition-colors overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold text-gray-900">
                                        ${plan.price_usd}
                                    </span>
                                    <span className="text-gray-600 text-sm">
                                        /{plan.billing_cycle === 'annual' ? 'year' : 'month'}
                                    </span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="px-6 py-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Titles</span>
                                    <span className="font-medium text-gray-900">{formatLimit(plan.max_titles)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Patrons</span>
                                    <span className="font-medium text-gray-900">{formatLimit(plan.max_patrons)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Storage</span>
                                    <span className="font-medium text-gray-900">
                                        {plan.max_storage_gb ? `${plan.max_storage_gb} GB` : <Infinity className="w-4 h-4 inline" />}
                                    </span>
                                </div>

                                {plan.features && plan.features.length > 0 && (
                                    <div className="pt-3 border-t border-gray-200 space-y-2">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
                                <Link
                                    href={route('admin.plans.edit', plan.id)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(plan)}
                                    className="px-3 py-2 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-600 text-sm font-medium rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {plans.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No plans yet</h3>
                        <p className="text-gray-600 mb-4">Create your first subscription plan to get started</p>
                        <Link
                            href={route('admin.plans.create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Plan
                        </Link>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

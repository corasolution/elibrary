import { Head, Link, router } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import {
    Plus,
    Edit,
    Trash2,
    Crown,
    Check,
    Users,
    DollarSign
} from 'lucide-react';

export default function PlansIndex({ plans }) {
    const handleDelete = (plan) => {
        if (plan.subscriptions_count > 0) {
            alert(`Cannot delete plan "${plan.name}" - it has ${plan.subscriptions_count} active subscriptions.`);
            return;
        }

        if (confirm(`Are you sure you want to delete the "${plan.name}" plan? This action cannot be undone.`)) {
            router.delete(route('central.plans.destroy', plan.id));
        }
    };

    const formatPrice = (price, cycle) => {
        if (price === 0) return 'Free';
        return `$${price}/${cycle === 'yearly' ? 'year' : 'month'}`;
    };

    const getPlanColor = (name) => {
        const colors = {
            'Free': 'from-gray-500 to-gray-600',
            'Starter': 'from-blue-500 to-blue-600',
            'Pro': 'from-purple-500 to-purple-600',
            'Enterprise': 'from-indigo-500 to-indigo-600',
        };
        return colors[name] || 'from-gray-500 to-gray-600';
    };

    return (
        <CentralLayout>
            <Head title="Subscription Plans" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage subscription tiers and pricing for your libraries
                        </p>
                    </div>
                    <Link
                        href={route('central.plans.create')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Plan</span>
                    </Link>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                            <Crown className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No plans yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating your first subscription plan
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('central.plans.create')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create Plan</span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all overflow-hidden group"
                            >
                                {/* Header with gradient */}
                                <div className={`bg-gradient-to-r ${getPlanColor(plan.name)} p-6 text-white`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Crown className="w-6 h-6" />
                                        {!plan.is_active && (
                                            <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <div className="mt-3">
                                        <span className="text-3xl font-bold">
                                            {plan.price_usd === 0 ? 'Free' : `$${plan.price_usd}`}
                                        </span>
                                        {plan.price_usd > 0 && (
                                            <span className="text-sm opacity-90">
                                                /{plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="p-6">
                                    <div className="space-y-3 text-sm">
                                        {plan.max_titles && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span>{plan.max_titles === -1 ? 'Unlimited' : plan.max_titles.toLocaleString()} Titles</span>
                                            </div>
                                        )}
                                        {plan.max_patrons && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span>{plan.max_patrons === -1 ? 'Unlimited' : plan.max_patrons.toLocaleString()} Patrons</span>
                                            </div>
                                        )}
                                        {plan.max_storage_gb && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span>{plan.max_storage_gb === -1 ? 'Unlimited' : `${plan.max_storage_gb} GB`} Storage</span>
                                            </div>
                                        )}

                                        {(() => {
                                            const features = Array.isArray(plan.features)
                                                ? plan.features
                                                : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []);

                                            return features.length > 0 && features.map((feature, index) => (
                                                <div key={index} className="flex items-center gap-2 text-gray-700">
                                                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </div>
                                            ));
                                        })()}
                                    </div>

                                    {/* Stats */}
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Users className="w-4 h-4" />
                                            <span>{plan.subscriptions_count} active {plan.subscriptions_count === 1 ? 'subscription' : 'subscriptions'}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            href={route('central.plans.edit', plan.id)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span>Edit</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(plan)}
                                            disabled={plan.subscriptions_count > 0}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </CentralLayout>
    );
}

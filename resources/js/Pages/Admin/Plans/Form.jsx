import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { CreditCard, Save, ArrowLeft, Plus, X } from 'lucide-react';

export default function PlanForm({ plan }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: plan?.name || '',
        price_usd: plan?.price_usd || '',
        billing_cycle: plan?.billing_cycle || 'monthly',
        max_titles: plan?.max_titles || '',
        max_patrons: plan?.max_patrons || '',
        max_storage_gb: plan?.max_storage_gb || '',
        features: plan?.features || [],
    });

    const [newFeature, setNewFeature] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (plan) {
            put(route('admin.plans.update', plan.id));
        } else {
            post(route('admin.plans.store'));
        }
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setData('features', [...data.features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        setData('features', data.features.filter((_, i) => i !== index));
    };

    return (
        <AdminLayout title={plan ? 'Edit Plan' : 'Create Plan'}>
            <Head title={plan ? 'Edit Plan' : 'Create Plan'} />

            <div className="max-w-3xl">
                {/* Back Button */}
                <Link
                    href={route('admin.plans.index')}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Plans
                </Link>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {plan ? 'Edit Plan' : 'Create New Plan'}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {plan ? 'Update pricing and features' : 'Define a new subscription tier'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Plan Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Plan Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Starter, Pro, Enterprise"
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Price (USD) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price_usd}
                                        onChange={(e) => setData('price_usd', e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="29.00"
                                        required
                                    />
                                </div>
                                {errors.price_usd && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price_usd}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Billing Cycle <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.billing_cycle}
                                    onChange={(e) => setData('billing_cycle', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="annual">Annual</option>
                                </select>
                                {errors.billing_cycle && (
                                    <p className="mt-1 text-sm text-red-600">{errors.billing_cycle}</p>
                                )}
                            </div>
                        </div>

                        {/* Limits */}
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">Resource Limits</h3>
                            <p className="text-xs text-gray-500">Leave empty for unlimited</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Titles
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.max_titles}
                                        onChange={(e) => setData('max_titles', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Unlimited"
                                    />
                                    {errors.max_titles && (
                                        <p className="mt-1 text-sm text-red-600">{errors.max_titles}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Patrons
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.max_patrons}
                                        onChange={(e) => setData('max_patrons', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Unlimited"
                                    />
                                    {errors.max_patrons && (
                                        <p className="mt-1 text-sm text-red-600">{errors.max_patrons}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Storage (GB)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.max_storage_gb}
                                        onChange={(e) => setData('max_storage_gb', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Unlimited"
                                    />
                                    {errors.max_storage_gb && (
                                        <p className="mt-1 text-sm text-red-600">{errors.max_storage_gb}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">Plan Features</h3>

                            {/* Feature List */}
                            {data.features.length > 0 && (
                                <div className="space-y-2">
                                    {data.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                            <span className="flex-1 text-sm text-gray-900">{feature}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Feature */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add a feature (e.g., 'Digital Library Access')"
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Error Display */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3">
                                {errors.general}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
                            </button>
                            <Link
                                href={route('admin.plans.index')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

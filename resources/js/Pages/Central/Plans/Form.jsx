import { Head, Link, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Save, ArrowLeft, AlertCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function PlanForm({ plan }) {
    const isEditing = !!plan;

    const { data, setData, post, put, processing, errors } = useForm({
        name: plan?.name || '',
        price_usd: plan?.price_usd || '',
        billing_cycle: plan?.billing_cycle || 'monthly',
        max_titles: plan?.max_titles || '',
        max_patrons: plan?.max_patrons || '',
        max_storage_gb: plan?.max_storage_gb || '',
        features: plan?.features ? (typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features) : [],
        is_active: plan?.is_active ?? true,
        is_popular: plan?.is_popular ?? false,
    });

    const [newFeature, setNewFeature] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('central.plans.update', plan.id));
        } else {
            post(route('central.plans.store'));
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
        <CentralLayout>
            <Head title={isEditing ? 'Edit Plan' : 'Create Plan'} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={route('central.plans.index')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Plans</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {isEditing ? 'Update plan details and pricing' : 'Define a new subscription tier for libraries'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Plan Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Plan Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="e.g., Pro, Enterprise"
                                    required
                                />
                                {errors.name && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="price_usd" className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (USD) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                                    <input
                                        id="price_usd"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price_usd}
                                        onChange={(e) => setData('price_usd', e.target.value)}
                                        className={`block w-full pl-8 pr-3 py-2 border ${
                                            errors.price_usd ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Use 0 for free plans</p>
                                {errors.price_usd && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.price_usd}</span>
                                    </div>
                                )}
                            </div>

                            {/* Billing Cycle */}
                            <div>
                                <label htmlFor="billing_cycle" className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Cycle <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="billing_cycle"
                                    value={data.billing_cycle}
                                    onChange={(e) => setData('billing_cycle', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Active Plan</span>
                                        <p className="text-xs text-gray-500">Visible to customers</p>
                                    </div>
                                </label>
                            </div>

                            {/* Most Popular */}
                            <div className="flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_popular}
                                        onChange={(e) => setData('is_popular', e.target.checked)}
                                        className="w-4 h-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Most Popular</span>
                                        <p className="text-xs text-gray-500">Highlights this plan on the landing page (only one at a time)</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Resource Limits */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Limits</h3>
                        <p className="text-sm text-gray-600 mb-4">Leave blank or use -1 for unlimited</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Max Titles */}
                            <div>
                                <label htmlFor="max_titles" className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Titles
                                </label>
                                <input
                                    id="max_titles"
                                    type="number"
                                    min="-1"
                                    value={data.max_titles}
                                    onChange={(e) => setData('max_titles', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Unlimited"
                                />
                                <p className="mt-1 text-xs text-gray-500">Books, eBooks, etc.</p>
                            </div>

                            {/* Max Patrons */}
                            <div>
                                <label htmlFor="max_patrons" className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Patrons
                                </label>
                                <input
                                    id="max_patrons"
                                    type="number"
                                    min="-1"
                                    value={data.max_patrons}
                                    onChange={(e) => setData('max_patrons', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Unlimited"
                                />
                                <p className="mt-1 text-xs text-gray-500">Library members</p>
                            </div>

                            {/* Max Storage */}
                            <div>
                                <label htmlFor="max_storage_gb" className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Storage (GB)
                                </label>
                                <input
                                    id="max_storage_gb"
                                    type="number"
                                    min="-1"
                                    value={data.max_storage_gb}
                                    onChange={(e) => setData('max_storage_gb', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Unlimited"
                                />
                                <p className="mt-1 text-xs text-gray-500">Digital files</p>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>

                        {/* Feature List */}
                        {data.features.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {data.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <span className="flex-1 text-sm text-gray-700">{feature}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="text-red-600 hover:text-red-700"
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
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., AI-powered search, Priority support"
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                        <Link
                            href={route('central.plans.index')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : (isEditing ? 'Update Plan' : 'Create Plan')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </CentralLayout>
    );
}

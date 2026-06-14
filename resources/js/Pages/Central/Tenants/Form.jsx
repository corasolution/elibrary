import { Head, Link, useForm, usePage } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Save, ArrowLeft, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TenantForm({ tenant, plans, prefill = {}, registrationRequestId = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: tenant?.name || prefill.name || '',
        slug: tenant?.slug || prefill.slug || '',
        domain: tenant?.domain || '',
        status: tenant?.status || 'active',
        plan_id: tenant?.plan_id || prefill.plan_id || '',
        trial_ends_at: tenant?.trial_ends_at || '',
        contact_name: tenant?.data?.contact_name || prefill.admin_name || '',
        contact_email: tenant?.data?.contact_email || prefill.admin_email || '',
        contact_phone: tenant?.data?.contact_phone || '',
        is_featured: tenant?.is_featured || false,
        featured_order: tenant?.featured_order || '',
        // Admin account (only for new libraries)
        admin_name: prefill.admin_name || '',
        admin_email: prefill.admin_email || '',
        admin_password: '',
        admin_password_confirmation: '',
        // Link back to the registration request (marks it approved on success)
        registration_request_id: registrationRequestId || '',
    });

    const isEditing = !!tenant;

    // Slug availability checking
    const [slugCheck, setSlugCheck] = useState({
        checking: false,
        available: null,
        message: ''
    });

    // Auto-generate slug from name
    useEffect(() => {
        if (!isEditing && data.name) {
            const slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setData('slug', slug);
        }
    }, [data.name, isEditing]);

    // Check slug availability with debounce
    useEffect(() => {
        if (isEditing || !data.slug || data.slug.length < 3) {
            setSlugCheck({ checking: false, available: null, message: '' });
            return;
        }

        setSlugCheck({ checking: true, available: null, message: '' });

        const timer = setTimeout(async () => {
            try {
                const response = await axios.get(route('central.tenants.check-slug', data.slug));
                setSlugCheck({
                    checking: false,
                    available: response.data.available,
                    message: response.data.message
                });
            } catch (error) {
                setSlugCheck({
                    checking: false,
                    available: null,
                    message: 'Error checking availability'
                });
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [data.slug, isEditing]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('central.tenants.update', tenant.id));
        } else {
            post(route('central.tenants.store'));
        }
    };

    return (
        <CentralLayout>
            <Head title={isEditing ? 'Edit Library' : 'Create New Library'} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={route('central.tenants.index')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Tenants</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Library' : 'Create New Library'}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {isEditing
                            ? 'Update library details'
                            : 'Register a new library tenant on the platform'
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

                        <div className="space-y-4">
                            {/* Library Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Library Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="National Library of Cambodia"
                                    required
                                />
                                {errors.name && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Slug */}
                            <div>
                                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug (URL Path) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                        bannalai.com/
                                    </span>
                                    <div className="relative flex-1">
                                        <input
                                            id="slug"
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            className={`block w-full px-3 py-2 pr-10 border ${
                                                errors.slug
                                                    ? 'border-red-300'
                                                    : slugCheck.available === false
                                                    ? 'border-red-300'
                                                    : slugCheck.available === true
                                                    ? 'border-green-300'
                                                    : 'border-gray-300'
                                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                            placeholder="national-library"
                                            required
                                            disabled={isEditing}
                                        />
                                        {!isEditing && data.slug && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                {slugCheck.checking && (
                                                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                                )}
                                                {!slugCheck.checking && slugCheck.available === true && (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                )}
                                                {!slugCheck.checking && slugCheck.available === false && (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Validation feedback */}
                                {!isEditing && slugCheck.message && (
                                    <div className={`mt-1 flex items-start gap-1.5 text-sm ${
                                        slugCheck.available ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {slugCheck.available ? (
                                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span>{slugCheck.message}</span>
                                    </div>
                                )}

                                <p className="mt-1 text-xs text-gray-500">
                                    {isEditing
                                        ? 'Slug cannot be changed after creation. Library URL: bannalai.com/' + data.slug
                                        : 'Only lowercase letters, numbers, and hyphens. Creates URL: bannalai.com/your-slug'
                                    }
                                </p>
                                {errors.slug && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.slug}</span>
                                    </div>
                                )}
                            </div>

                            {/* Custom Domain - Hidden for path-based tenancy */}
                            <input type="hidden" name="domain" value="" />
                        </div>
                    </div>

                    {/* Subscription & Status */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription & Status</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.status ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {errors.status && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.status}</span>
                                    </div>
                                )}
                            </div>

                            {/* Plan */}
                            <div>
                                <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subscription Plan
                                </label>
                                <select
                                    id="plan_id"
                                    value={data.plan_id}
                                    onChange={(e) => setData('plan_id', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.plan_id ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                >
                                    <option value="">No Plan</option>
                                    {plans && plans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - ${plan.price_usd}/{plan.billing_cycle}
                                        </option>
                                    ))}
                                </select>
                                {errors.plan_id && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.plan_id}</span>
                                    </div>
                                )}
                            </div>

                            {/* Trial Ends At */}
                            <div className="md:col-span-2">
                                <label htmlFor="trial_ends_at" className="block text-sm font-medium text-gray-700 mb-1">
                                    Trial End Date
                                </label>
                                <input
                                    id="trial_ends_at"
                                    type="date"
                                    value={data.trial_ends_at}
                                    onChange={(e) => setData('trial_ends_at', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.trial_ends_at ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Leave empty for no trial or already subscribed tenants
                                </p>
                                {errors.trial_ends_at && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.trial_ends_at}</span>
                                    </div>
                                )}
                            </div>

                            {/* Featured on landing page (edit only) */}
                            {isEditing && (
                                <div className="md:col-span-2 flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Featured on landing page
                                        </span>
                                    </label>
                                    {data.is_featured && (
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="featured_order" className="text-sm text-gray-500">Order</label>
                                            <input
                                                id="featured_order"
                                                type="number"
                                                min="1"
                                                value={data.featured_order}
                                                onChange={(e) => setData('featured_order', e.target.value)}
                                                className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="1"
                                            />
                                        </div>
                                    )}
                                    {errors.featured_order && (
                                        <span className="text-red-600 text-sm">{errors.featured_order}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information (Optional)</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Contact Name */}
                            <div>
                                <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Name
                                </label>
                                <input
                                    id="contact_name"
                                    type="text"
                                    value={data.contact_name}
                                    onChange={(e) => setData('contact_name', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Contact Email */}
                            <div>
                                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Email
                                </label>
                                <input
                                    id="contact_email"
                                    type="email"
                                    value={data.contact_email}
                                    onChange={(e) => setData('contact_email', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="contact@library.com"
                                />
                            </div>

                            {/* Contact Phone */}
                            <div className="md:col-span-2">
                                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Phone
                                </label>
                                <input
                                    id="contact_phone"
                                    type="tel"
                                    value={data.contact_phone}
                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="+855 12 345 678"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admin Account (Only for new libraries) */}
                    {!isEditing && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Account</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Create an admin user who will manage this library
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Admin Name */}
                                <div>
                                    <label htmlFor="admin_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Admin Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="admin_name"
                                        type="text"
                                        value={data.admin_name}
                                        onChange={(e) => setData('admin_name', e.target.value)}
                                        className={`block w-full px-3 py-2 border ${
                                            errors.admin_name ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Library Administrator"
                                        required={!isEditing}
                                    />
                                    {errors.admin_name && (
                                        <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{errors.admin_name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Admin Email */}
                                <div>
                                    <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Admin Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="admin_email"
                                        type="email"
                                        value={data.admin_email}
                                        onChange={(e) => setData('admin_email', e.target.value)}
                                        className={`block w-full px-3 py-2 border ${
                                            errors.admin_email ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="admin@library.com"
                                        required={!isEditing}
                                    />
                                    {errors.admin_email && (
                                        <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{errors.admin_email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Admin Password */}
                                <div>
                                    <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="admin_password"
                                        type="password"
                                        value={data.admin_password}
                                        onChange={(e) => setData('admin_password', e.target.value)}
                                        className={`block w-full px-3 py-2 border ${
                                            errors.admin_password ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="••••••••"
                                        required={!isEditing}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                                    {errors.admin_password && (
                                        <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{errors.admin_password}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="admin_password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="admin_password_confirmation"
                                        type="password"
                                        value={data.admin_password_confirmation}
                                        onChange={(e) => setData('admin_password_confirmation', e.target.value)}
                                        className={`block w-full px-3 py-2 border ${
                                            errors.admin_password_confirmation ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="••••••••"
                                        required={!isEditing}
                                    />
                                    {errors.admin_password_confirmation && (
                                        <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{errors.admin_password_confirmation}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                        <Link
                            href={route('central.tenants.index')}
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
                            <span>{processing ? 'Saving...' : (isEditing ? 'Update Library' : 'Create Library')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </CentralLayout>
    );
}

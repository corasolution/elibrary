import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Building2, Save, ArrowLeft } from 'lucide-react';

export default function TenantForm({ tenant, plans }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: tenant?.name || '',
        slug: tenant?.slug || '',
        domain: tenant?.domain || '',
        plan_id: tenant?.plan_id || '',
        trial_ends_at: tenant?.trial_ends_at || '',
        status: tenant?.status || 'active',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tenant) {
            put(route('admin.tenants.update', tenant.id));
        } else {
            post(route('admin.tenants.store'));
        }
    };

    const handleSlugGenerate = () => {
        if (data.name && !tenant) {
            const slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setData('slug', slug);
        }
    };

    return (
        <AdminLayout title={tenant ? 'Edit Tenant' : 'Create Tenant'}>
            <Head title={tenant ? 'Edit Tenant' : 'Create Tenant'} />

            <div className="max-w-3xl">
                {/* Back Button */}
                <Link
                    href={route('admin.tenants.index')}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Tenants
                </Link>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {tenant ? 'Edit Tenant' : 'Create New Tenant'}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {tenant ? 'Update tenant information' : 'Add a new library to the system'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Library Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Library Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                onBlur={handleSlugGenerate}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., National Library of Cambodia"
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Slug (Subdomain) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">{window.location.host}/</span>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                    placeholder="national-library"
                                    pattern="[a-z0-9-]+"
                                    required
                                    disabled={!!tenant}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Lowercase letters, numbers, and hyphens only. {tenant ? 'Cannot be changed after creation.' : 'Auto-generated from name.'}
                            </p>
                            {errors.slug && (
                                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                            )}
                        </div>

                        {/* Custom Domain */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Custom Domain (Optional)
                            </label>
                            <input
                                type="text"
                                value={data.domain}
                                onChange={(e) => setData('domain', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="library.example.com"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Point your domain's DNS to our servers to use a custom domain
                            </p>
                            {errors.domain && (
                                <p className="mt-1 text-sm text-red-600">{errors.domain}</p>
                            )}
                        </div>

                        {/* Plan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Subscription Plan
                            </label>
                            <select
                                value={data.plan_id}
                                onChange={(e) => setData('plan_id', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">No Plan (Free)</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - ${plan.price_usd}/month
                                    </option>
                                ))}
                            </select>
                            {errors.plan_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.plan_id}</p>
                            )}
                        </div>

                        {/* Trial End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Trial Ends At
                            </label>
                            <input
                                type="date"
                                value={data.trial_ends_at}
                                onChange={(e) => setData('trial_ends_at', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Leave empty for no trial period
                            </p>
                            {errors.trial_ends_at && (
                                <p className="mt-1 text-sm text-red-600">{errors.trial_ends_at}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                            )}
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
                                {processing ? 'Saving...' : tenant ? 'Update Tenant' : 'Create Tenant'}
                            </button>
                            <Link
                                href={route('admin.tenants.index')}
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

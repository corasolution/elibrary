import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { ArrowLeft, Save, Search, Building2, Check } from 'lucide-react';

export default function AssignTenants({ partner, allTenants, assignedTenantIds }) {
    const [searchQuery, setSearchQuery] = useState('');
    const { data, setData, post, processing } = useForm({
        tenant_ids: assignedTenantIds || [],
    });

    const handleToggleTenant = (tenantId) => {
        if (data.tenant_ids.includes(tenantId)) {
            setData('tenant_ids', data.tenant_ids.filter(id => id !== tenantId));
        } else {
            setData('tenant_ids', [...data.tenant_ids, tenantId]);
        }
    };

    const handleSelectAll = () => {
        const filteredIds = filteredTenants.map(t => t.id);
        setData('tenant_ids', filteredIds);
    };

    const handleDeselectAll = () => {
        setData('tenant_ids', []);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('central.partners.assign-tenants', partner.id));
    };

    const filteredTenants = allTenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const badges = {
            active: { label: 'Active', color: 'bg-green-100 text-green-700' },
            pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
            suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
            cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <CentralLayout>
            <Head title={`Assign Libraries - ${partner.name}`} />

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={route('central.partners.index')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Partners</span>
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Assign Libraries</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Assign libraries to <span className="font-medium">{partner.name}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.tenant_ids.length}
                            </div>
                            <div className="text-xs text-gray-500">
                                {data.tenant_ids.length === 1 ? 'library' : 'libraries'} selected
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search libraries by name or slug..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Select All ({filteredTenants.length})
                            </button>
                            <button
                                type="button"
                                onClick={handleDeselectAll}
                                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tenants List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {filteredTenants.length === 0 ? (
                            <div className="text-center py-12">
                                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No libraries found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchQuery
                                        ? 'Try adjusting your search criteria'
                                        : 'No libraries available to assign'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredTenants.map((tenant) => {
                                    const isSelected = data.tenant_ids.includes(tenant.id);
                                    return (
                                        <label
                                            key={tenant.id}
                                            className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                                                isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleTenant(tenant.id)}
                                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-medium">
                                                        {tenant.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {tenant.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {window.location.host}/{tenant.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {tenant.plan && (
                                                    <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                        {tenant.plan.name}
                                                    </div>
                                                )}
                                                {getStatusBadge(tenant.status)}
                                                {isSelected && (
                                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Summary & Submit */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {data.tenant_ids.length} {data.tenant_ids.length === 1 ? 'library' : 'libraries'} selected
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {partner.name} will be able to manage {data.tenant_ids.length === 0 ? 'no' : 'the selected'} {data.tenant_ids.length === 1 ? 'library' : 'libraries'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('central.partners.index')}
                                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{processing ? 'Saving...' : 'Save Assignments'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CentralLayout>
    );
}

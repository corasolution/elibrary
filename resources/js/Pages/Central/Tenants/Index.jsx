import { Head, Link, router, usePage } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { useState } from 'react';
import {
    Building2,
    Plus,
    Search,
    Trash2,
    Edit,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    User,
    Undo2,
    Trash,
    Star
} from 'lucide-react';

export default function TenantsIndex({ tenants, filters, partner, canCreateTenant, isSuperAdmin }) {
    const [search, setSearch] = useState(filters?.q || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('central.tenants.index'),
            { q: search, status: statusFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleToggleFeatured = (tenant) => {
        router.post(route('central.tenants.toggle-featured', tenant.id), {}, { preserveScroll: true });
    };

    const handleDelete = (tenant) => {
        if (confirm(`Move "${tenant.name}" to trash?\n\nThe library will be deleted but can be restored within 30 days.\nAfter 30 days, it will be permanently deleted automatically.`)) {
            router.delete(route('central.tenants.destroy', tenant.id));
        }
    };

    const handleRestore = (tenant) => {
        if (confirm(`Restore "${tenant.name}"? The library will be reactivated.`)) {
            router.post(route('central.tenants.restore', tenant.id));
        }
    };

    const handleForceDelete = (tenant) => {
        if (confirm(`⚠️ PERMANENT DELETE "${tenant.name}"?\n\nThis will PERMANENTLY delete the tenant database and ALL data.\n\nThis action CANNOT be undone!\n\nType the tenant name to confirm.`)) {
            const confirmation = prompt(`Type "${tenant.name}" to confirm permanent deletion:`);
            if (confirmation === tenant.name) {
                router.delete(route('central.tenants.force-delete', tenant.id));
            } else {
                alert('Confirmation failed. Tenant was not deleted.');
            }
        }
    };

    const getStatusBadge = (tenant) => {
        // Check if tenant is deleted
        if (tenant.is_deleted) {
            return (
                <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border bg-red-100 text-red-800 border-red-200">
                        <Trash2 className="w-3 h-3" />
                        Deleted
                    </span>
                    {tenant.days_until_permanent_deletion && (
                        <div className="text-xs text-gray-500 mt-1">
                            Deletes in {tenant.days_until_permanent_deletion} days
                        </div>
                    )}
                </div>
            );
        }

        const status = tenant.status;
        const config = {
            active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            pending: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
            suspended: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
            cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
        };
        const { color, icon: Icon } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <CentralLayout>
            <Head title="Libraries" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Libraries</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {isSuperAdmin
                                    ? 'Manage all libraries'
                                    : 'Manage your assigned libraries'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* View Trash Button */}
                            <Link
                                href={route('central.tenants.index', { status: 'deleted' })}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>View Trash</span>
                                {filters?.status === 'deleted' && (
                                    <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                        Active
                                    </span>
                                )}
                            </Link>

                            {/* Create Button */}
                            {canCreateTenant && (
                                <Link
                                    href={route('central.tenants.create')}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create New Library</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Partner Filter Banner */}
                {partner && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-blue-900">Filtered by Partner</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Showing libraries managed by <span className="font-semibold">{partner.name}</span>
                                </p>
                            </div>
                            <Link
                                href={route('central.tenants.index')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Clear Filter</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Trash Info Banner */}
                {filters?.status === 'deleted' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-red-900">Viewing Deleted Libraries (Trash)</h3>
                                <p className="text-sm text-red-700 mt-1">
                                    These libraries have been deleted and will be permanently removed after 30 days.
                                    You can restore them or delete them permanently.
                                </p>
                            </div>
                            <Link
                                href={route('central.tenants.index')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Back to Active</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, slug, or domain..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="deleted">🗑️ Deleted (Trash)</option>
                        </select>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            Filter
                        </button>
                        {(filters?.q || filters?.status) && (
                            <Link
                                href={route('central.tenants.index')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                Clear
                            </Link>
                        )}
                    </form>
                </div>

                {/* Libraries Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {tenants.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No libraries found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filters?.q
                                    ? 'Try adjusting your search criteria'
                                    : canCreateTenant
                                    ? 'Get started by creating a new library'
                                    : 'No libraries have been assigned to you yet'
                                }
                            </p>
                            {canCreateTenant && !filters?.q && (
                                <div className="mt-6">
                                    <Link
                                        href={route('central.tenants.create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Create New Library</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Library
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Plan
                                        </th>
                                        {isSuperAdmin && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Managed By
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tenants.data.map((tenant) => (
                                        <tr key={tenant.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                                                            {tenant.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <Link
                                                            href={route('central.tenants.show', tenant.id)}
                                                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                                        >
                                                            {tenant.name}
                                                        </Link>
                                                        <a href={`/${tenant.slug}`} target="_blank" rel="noreferrer"
                                                            className="block text-sm text-gray-500 hover:text-blue-600">
                                                            {window.location.host}/{tenant.slug}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {tenant.plan ? tenant.plan.name : '—'}
                                                </div>
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {tenant.managed_by ? (
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-900">
                                                                {tenant.managed_by.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">—</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(tenant)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(tenant.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    {tenant.is_deleted ? (
                                                        // Deleted tenant - show restore and permanent delete
                                                        <>
                                                            {isSuperAdmin && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleRestore(tenant)}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                                                    >
                                                                        <Undo2 className="w-3.5 h-3.5" />
                                                                        <span>Restore</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleForceDelete(tenant)}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                                                    >
                                                                        <Trash className="w-3.5 h-3.5" />
                                                                        <span>Delete Forever</span>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        // Active tenant - show featured toggle, edit and delete
                                                        <>
                                                            {isSuperAdmin && (
                                                                <button
                                                                    onClick={() => handleToggleFeatured(tenant)}
                                                                    title={tenant.is_featured ? 'Remove from landing page' : 'Feature on landing page'}
                                                                    className={`inline-flex items-center p-1.5 rounded-lg transition-colors ${
                                                                        tenant.is_featured
                                                                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                                                            : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'
                                                                    }`}
                                                                >
                                                                    <Star className="w-4 h-4" fill={tenant.is_featured ? 'currentColor' : 'none'} />
                                                                </button>
                                                            )}
                                                            <Link
                                                                href={route('central.tenants.edit', tenant.id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                                <span>Edit</span>
                                                            </Link>
                                                            {isSuperAdmin && (
                                                                <button
                                                                    onClick={() => handleDelete(tenant)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    <span>Delete</span>
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {tenants.data.length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{tenants.from}</span> to{' '}
                                    <span className="font-medium">{tenants.to}</span> of{' '}
                                    <span className="font-medium">{tenants.total}</span> libraries
                                </div>
                                <div className="flex gap-2">
                                    {tenants.links.map((link, index) => (
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
        </CentralLayout>
    );
}

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import {
    Plus,
    Search,
    Users,
    Edit,
    Trash2,
    Building2,
    UserCheck,
    UserX,
    Settings
} from 'lucide-react';

export default function PartnersIndex({ partners, filters }) {
    const [search, setSearch] = useState(filters?.q || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('central.partners.index'), { q: search }, {
            preserveState: true,
            replace: true
        });
    };

    const handleDelete = (partner) => {
        if (confirm(`Are you sure you want to delete ${partner.name}? This action cannot be undone.`)) {
            router.delete(route('central.partners.destroy', partner.id), {
                preserveScroll: true
            });
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            partner: { label: 'Partner', color: 'bg-blue-100 text-blue-700' },
            sales_agent: { label: 'Sales Agent', color: 'bg-purple-100 text-purple-700' }
        };
        const badge = badges[role] || badges.partner;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <CentralLayout>
            <Head title="Partners" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage partner accounts and their tenant assignments
                            </p>
                        </div>
                        <Link
                            href={route('central.partners.create')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Partner</span>
                        </Link>
                    </div>
                </div>

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
                                placeholder="Search partners by name or email..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            Search
                        </button>
                        {filters?.q && (
                            <Link
                                href={route('central.partners.index')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                Clear
                            </Link>
                        )}
                    </form>
                </div>

                {/* Partners List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {partners.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No partners found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filters?.q
                                    ? 'Try adjusting your search criteria'
                                    : 'Get started by creating a new partner account'
                                }
                            </p>
                            {!filters?.q && (
                                <div className="mt-6">
                                    <Link
                                        href={route('central.partners.create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Partner</span>
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
                                            Partner
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Libraries
                                        </th>
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
                                    {partners.data.map((partner) => (
                                        <tr key={partner.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                                            {partner.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {partner.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {partner.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRoleBadge(partner.role)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={route('central.tenants.index', { partner: partner.id })}
                                                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                                    title="View libraries managed by this partner"
                                                >
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900 font-medium">
                                                        {partner.tenants_count}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {partner.tenants_count === 1 ? 'library' : 'libraries'}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {partner.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <UserCheck className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        <UserX className="w-3 h-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(partner.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('central.partners.assign-tenants.show', partner.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                                        title="Assign Libraries"
                                                    >
                                                        <Settings className="w-3.5 h-3.5" />
                                                        <span>Assign</span>
                                                    </Link>
                                                    <Link
                                                        href={route('central.partners.edit', partner.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Edit Partner"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        <span>Edit</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(partner)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Delete Partner"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {partners.data.length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{partners.from}</span> to{' '}
                                    <span className="font-medium">{partners.to}</span> of{' '}
                                    <span className="font-medium">{partners.total}</span> partners
                                </div>
                                <div className="flex gap-2">
                                    {partners.links.map((link, index) => (
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

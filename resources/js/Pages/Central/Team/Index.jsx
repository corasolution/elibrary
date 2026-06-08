import { Head, Link, router, usePage } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { useState } from 'react';
import {
    UserCog,
    Plus,
    Search,
    Trash2,
    Edit,
    CheckCircle,
    XCircle,
    User,
    Shield
} from 'lucide-react';

export default function TeamIndex({ teamMembers, filters, availableRoles }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters?.q || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('central.team.index'),
            { q: search, role: roleFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (member) => {
        // Prevent self-deletion
        if (member.id === auth.user.id) {
            alert('You cannot delete your own account!');
            return;
        }

        if (confirm(`Are you sure you want to delete "${member.name}"? This action cannot be undone.`)) {
            router.delete(route('central.team.destroy', member.id));
        }
    };

    const getRoleBadge = (role) => {
        const config = {
            super_admin: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Super Admin', icon: Shield },
            admin: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Admin', icon: Shield },
            support_staff: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Support Staff', icon: User },
            partner: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Partner', icon: User },
            sales_agent: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Sales Agent', icon: User },
        };
        const { color, label, icon: Icon } = config[role] || config.support_staff;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
                <Icon className="w-3 h-3" />
                {label}
            </span>
        );
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3" />
                Active
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border bg-red-100 text-red-800 border-red-200">
                <XCircle className="w-3 h-3" />
                Inactive
            </span>
        );
    };

    const getAvatarColor = (index) => {
        const colors = [
            'from-purple-500 to-pink-500',
            'from-blue-500 to-indigo-500',
            'from-green-500 to-teal-500',
            'from-orange-500 to-red-500',
            'from-cyan-500 to-blue-500',
        ];
        return colors[index % colors.length];
    };

    return (
        <CentralLayout>
            <Head title="Team Members" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage internal team members and their roles
                            </p>
                        </div>
                        <Link
                            href={route('central.team.create')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Team Member</span>
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
                                placeholder="Search by name or email..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Roles</option>
                            {Object.entries(availableRoles).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            Filter
                        </button>
                        {(filters?.q || filters?.role) && (
                            <Link
                                href={route('central.team.index')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                Clear
                            </Link>
                        )}
                    </form>
                </div>

                {/* Team Members Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {teamMembers.data.length === 0 ? (
                        <div className="text-center py-12">
                            <UserCog className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No team members found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filters?.q
                                    ? 'Try adjusting your search criteria'
                                    : 'Get started by adding a new team member'
                                }
                            </p>
                            {!filters?.q && (
                                <div className="mt-6">
                                    <Link
                                        href={route('central.team.create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Team Member</span>
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
                                            Team Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
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
                                    {teamMembers.data.map((member, index) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarColor(index)} flex items-center justify-center text-white font-medium`}>
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {member.name}
                                                            {member.id === auth.user.id && (
                                                                <span className="ml-2 text-xs text-blue-600">(You)</span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRoleBadge(member.role)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(member.is_active)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(member.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('central.team.edit', member.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        <span>Edit</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(member)}
                                                        disabled={member.id === auth.user.id}
                                                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                            member.id === auth.user.id
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                        }`}
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
                    {teamMembers.data.length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{teamMembers.from}</span> to{' '}
                                    <span className="font-medium">{teamMembers.to}</span> of{' '}
                                    <span className="font-medium">{teamMembers.total}</span> team members
                                </div>
                                <div className="flex gap-2">
                                    {teamMembers.links.map((link, index) => (
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

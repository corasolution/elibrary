import { Head, Link } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import {
    Building2,
    Users,
    BookOpen,
    BookCheck,
    Plus,
    ExternalLink,
    Settings as SettingsIcon,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Crown
} from 'lucide-react';

export default function PartnerDashboard({ partner, libraries, statistics, canCreateLibraries }) {
    const getStatusBadge = (status) => {
        const badges = {
            active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
            pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700', icon: AlertCircle },
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    return (
        <CentralLayout>
            <Head title="Partner Portal" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-8 h-8" />
                                <h1 className="text-3xl font-bold">Welcome back, {partner.name}!</h1>
                            </div>
                            <p className="text-blue-100">
                                Manage your libraries and track their performance from one place
                            </p>
                        </div>
                        {canCreateLibraries && (
                            <Link
                                href={route('central.tenants.create')}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add New Library</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Libraries */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Libraries</p>
                            <p className="text-3xl font-bold text-gray-900">{statistics.total_libraries}</p>
                            <p className="text-xs text-green-600 mt-2">
                                {statistics.active_libraries} active
                            </p>
                        </div>
                    </div>

                    {/* Total Patrons */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Patrons</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {statistics.total_patrons.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Across all libraries
                            </p>
                        </div>
                    </div>

                    {/* Total Catalog Items */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <BookOpen className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Catalog Items</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {statistics.total_catalog_items.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Books, eBooks, media
                            </p>
                        </div>
                    </div>

                    {/* Active Loans */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <BookCheck className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Active Loans</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {statistics.total_active_loans.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Currently borrowed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Libraries Grid */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">My Libraries</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {libraries.length} {libraries.length === 1 ? 'library' : 'libraries'} under your management
                        </p>
                    </div>

                    {libraries.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No libraries yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {canCreateLibraries
                                    ? 'Get started by creating your first library'
                                    : 'Contact your administrator to get access to libraries'
                                }
                            </p>
                            {canCreateLibraries && (
                                <div className="mt-6">
                                    <Link
                                        href={route('central.tenants.create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Create Library</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {libraries.map((library) => (
                                <div
                                    key={library.id}
                                    className="p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Library Icon */}
                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                                {library.name.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Library Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {library.name}
                                                    </h3>
                                                    {getStatusBadge(library.status)}
                                                    {library.is_trial && (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                            Trial: {library.trial_ends_at}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="w-4 h-4" />
                                                        {window.location.host}/{library.slug}
                                                    </span>
                                                    {library.plan && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                                            <Crown className="w-3 h-3" />
                                                            {library.plan.name} Plan
                                                        </span>
                                                    )}
                                                    <span className="text-gray-500">
                                                        Created: {library.created_at}
                                                    </span>
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={library.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Visit OPAC</span>
                                                    </a>

                                                    <a
                                                        href={`${library.url}/admin`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                                    >
                                                        <SettingsIcon className="w-3.5 h-3.5" />
                                                        <span>Admin Panel</span>
                                                    </a>

                                                    <Link
                                                        href={route('central.tenants.edit', library.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                                    >
                                                        <SettingsIcon className="w-3.5 h-3.5" />
                                                        <span>Configure</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CentralLayout>
    );
}

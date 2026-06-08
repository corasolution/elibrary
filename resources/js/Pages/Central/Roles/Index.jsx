import { Head } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Shield, Users, Lock, CheckCircle } from 'lucide-react';

export default function RolesIndex({ roles, availablePermissions }) {
    const getRoleIcon = (roleId) => {
        const gradients = {
            super_admin: 'from-purple-500 to-pink-500',
            admin: 'from-blue-500 to-indigo-500',
            support_staff: 'from-green-500 to-teal-500',
            partner: 'from-orange-500 to-red-500',
            sales_agent: 'from-gray-500 to-gray-600',
        };
        return gradients[roleId] || gradients.support_staff;
    };

    return (
        <CentralLayout>
            <Head title="Roles & Permissions" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        System roles and their permissions
                    </p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-900">System Roles</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                These are built-in roles with predefined permissions. Custom roles can be created in a future update.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Role Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${getRoleIcon(role.id)} flex items-center justify-center`}>
                                            <Shield className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                                        </div>
                                    </div>
                                    {role.system && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                            System
                                        </span>
                                    )}
                                </div>

                                {/* User Count */}
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{role.user_count} {role.user_count === 1 ? 'user' : 'users'} with this role</span>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="p-6 bg-gray-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lock className="w-4 h-4 text-gray-600" />
                                    <h4 className="text-sm font-medium text-gray-900">Permissions</h4>
                                </div>

                                {role.permissions && role.permissions.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {role.permissions.map((permission, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-2 text-sm"
                                            >
                                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">
                                                    {permission === '*' ? (
                                                        <strong>Full Access</strong>
                                                    ) : (
                                                        <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                                            {permission}
                                                        </code>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No permissions assigned</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Available Permissions Reference */}
                {availablePermissions && Object.keys(availablePermissions).length > 0 && (
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Permissions Reference</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(availablePermissions).map(([category, permissions]) => (
                                <div key={category}>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">{category}</h3>
                                    <ul className="space-y-1">
                                        {Object.entries(permissions).map(([key, label]) => (
                                            <li key={key} className="text-sm text-gray-600">
                                                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {key}
                                                </code>
                                                <span className="ml-2 text-xs">{label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </CentralLayout>
    );
}

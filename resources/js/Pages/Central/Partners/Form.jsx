import { Head, Link, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Save, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function PartnerForm({ partner, roleOptions }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: partner?.name || '',
        email: partner?.email || '',
        password: '',
        role: partner?.role || 'partner',
        is_active: partner?.is_active ?? true,
    });

    const [showPassword, setShowPassword] = useState(false);
    const isEditing = !!partner;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('central.partners.update', partner.id));
        } else {
            post(route('central.partners.store'));
        }
    };

    return (
        <CentralLayout>
            <Head title={isEditing ? 'Edit Partner' : 'Create Partner'} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={route('central.partners.index')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Partners</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Partner' : 'Create New Partner'}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {isEditing
                            ? 'Update partner account details'
                            : 'Create a new partner account to manage tenants'
                        }
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="John Doe"
                                    required
                                />
                                {errors.name && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.email ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="partner@example.com"
                                    required
                                />
                                {errors.email && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {!isEditing && <span className="text-red-500">*</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`block w-full px-3 py-2 pr-10 border ${
                                            errors.password ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder={isEditing ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                                        required={!isEditing}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                                {isEditing && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave blank to keep the current password
                                    </p>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.role ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    required
                                >
                                    {roleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.role}</span>
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Partners can manage assigned tenants. Sales Agents have limited access.
                                </p>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-start gap-3">
                                <div className="flex items-center h-5">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                        Active Account
                                    </label>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Inactive accounts cannot log in to the central admin portal
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Partner Account Permissions</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Partners can create new tenants for their clients</li>
                                    <li>Partners can only see and manage their assigned tenants</li>
                                    <li>Super Admins can assign/reassign tenants to partners</li>
                                    <li>Partners cannot access partner management (Super Admin only)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
                            <span>{processing ? 'Saving...' : isEditing ? 'Update Partner' : 'Create Partner'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </CentralLayout>
    );
}

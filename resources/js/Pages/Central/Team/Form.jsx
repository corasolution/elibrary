import { Head, Link, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Save, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function TeamForm({ teamMember, availableRoles }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: teamMember?.name || '',
        email: teamMember?.email || '',
        password: '',
        password_confirmation: '',
        role: teamMember?.role || 'support_staff',
        is_active: teamMember?.is_active ?? true,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const isEditing = !!teamMember;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('central.team.update', teamMember.id));
        } else {
            post(route('central.team.store'));
        }
    };

    return (
        <CentralLayout>
            <Head title={isEditing ? 'Edit Team Member' : 'Add Team Member'} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={route('central.team.index')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Team</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Team Member' : 'Add Team Member'}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {isEditing
                            ? 'Update team member account details'
                            : 'Create a new team member account with assigned role'
                        }
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Account Information */}
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
                                    placeholder="admin@example.com"
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
                                        placeholder={isEditing ? 'Leave blank to keep current password' : '••••••••'}
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
                                {!isEditing && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Minimum 8 characters
                                    </p>
                                )}
                                {isEditing && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave blank to keep current password
                                    </p>
                                )}
                                {errors.password && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                            </div>

                            {/* Password Confirmation */}
                            {(data.password || !isEditing) && (
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password {!isEditing && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={`block w-full px-3 py-2 pr-10 border ${
                                                errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                            placeholder="••••••••"
                                            required={!isEditing || data.password}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{errors.password_confirmation}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Role & Status */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Role & Status</h3>

                        <div className="space-y-4">
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
                                    {Object.entries(availableRoles).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    {data.role === 'super_admin' && 'Full platform access with all permissions'}
                                    {data.role === 'admin' && 'Manage tenants and team members'}
                                    {data.role === 'support_staff' && 'View and provide support to tenants'}
                                    {data.role === 'partner' && 'Create and manage assigned tenants'}
                                    {data.role === 'sales_agent' && 'View tenants and create leads'}
                                </p>
                                {errors.role && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.role}</span>
                                    </div>
                                )}
                            </div>

                            {/* Active Status */}
                            <div>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Active Account</span>
                                        <p className="text-xs text-gray-500">
                                            Inactive accounts cannot log in to the platform
                                        </p>
                                    </div>
                                </label>
                                {errors.is_active && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.is_active}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                        <Link
                            href={route('central.team.index')}
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
                            <span>{processing ? 'Saving...' : (isEditing ? 'Update Member' : 'Add Member')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </CentralLayout>
    );
}

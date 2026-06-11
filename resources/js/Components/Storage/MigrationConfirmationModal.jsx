import React from 'react';
import { AlertTriangle, Database, HardDrive, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function MigrationConfirmationModal({ migrationInfo, onConfirm, onCancel }) {
    if (!migrationInfo) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 rounded-t-2xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <AlertTriangle className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-1">
                                Confirm Storage Migration
                            </h2>
                            <p className="text-amber-50 text-sm">
                                This will transfer all your files to the new storage provider
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Provider Flow */}
                    <div className="flex items-center justify-center gap-4 py-4">
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-500 mb-2">Current Provider</div>
                            <div className="px-4 py-3 bg-gray-100 rounded-xl">
                                <div className="font-semibold text-gray-900">
                                    {migrationInfo.current_provider}
                                </div>
                            </div>
                        </div>

                        <ArrowRight className="w-8 h-8 text-gray-400 mt-8" />

                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-500 mb-2">New Provider</div>
                            <div className="px-4 py-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                                <div className="font-semibold text-blue-900">
                                    {migrationInfo.new_provider}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Total Files */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <Database className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                                    Files
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-900">
                                {migrationInfo.total_files.toLocaleString()}
                            </div>
                        </div>

                        {/* Total Size */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <HardDrive className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                                    Size
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-purple-900">
                                {migrationInfo.total_size_gb} GB
                            </div>
                        </div>

                        {/* Estimated Time */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-500 rounded-lg">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-xs font-medium text-green-700 uppercase tracking-wide">
                                    Est. Time
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-green-900">
                                ~{migrationInfo.estimated_minutes}m
                            </div>
                        </div>
                    </div>

                    {/* Safety Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 text-sm text-blue-900">
                                <div className="font-semibold mb-1">Safe Migration Process</div>
                                <ul className="space-y-1 text-blue-800">
                                    <li>• Files are copied, not moved (originals remain intact)</li>
                                    <li>• MD5 checksum verification ensures data integrity</li>
                                    <li>• Migration runs in background (you can continue working)</li>
                                    <li>• All files remain accessible during migration</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Migration Options */}
                    <div className="border-t pt-6 space-y-3">
                        <div className="text-sm font-medium text-gray-700 mb-3">
                            What would you like to do?
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Migrate Later */}
                            <button
                                onClick={() => onConfirm(false)}
                                className="px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                            >
                                Migrate Later
                            </button>

                            {/* Migrate Now */}
                            <button
                                onClick={() => onConfirm(true)}
                                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transition-all duration-200"
                            >
                                Migrate Now
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-2">
                            You can manually migrate files later from this page
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

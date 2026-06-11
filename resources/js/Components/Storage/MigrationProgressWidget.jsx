import React, { useState } from 'react';
import { Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export default function MigrationProgressWidget({ migration }) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!migration || !migration.progress) return null;

    const { progress } = migration;
    const progressPercent = Math.min(100, Math.round((progress.processed / progress.total_resources) * 100));

    // Determine status icon and color
    const getStatusConfig = () => {
        switch (progress.status) {
            case 'processing':
                return {
                    icon: <Loader2 className="w-5 h-5 animate-spin" />,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    progressColor: 'bg-blue-500',
                    label: 'Migrating Files...',
                };
            case 'completed':
                return {
                    icon: <CheckCircle className="w-5 h-5" />,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    progressColor: 'bg-green-500',
                    label: 'Migration Complete',
                };
            case 'failed':
                return {
                    icon: <XCircle className="w-5 h-5" />,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    progressColor: 'bg-red-500',
                    label: 'Migration Failed',
                };
            default:
                return {
                    icon: <Loader2 className="w-5 h-5" />,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    progressColor: 'bg-gray-500',
                    label: 'Pending...',
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <div className={`rounded-xl border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} overflow-hidden mb-6`}>
            {/* Header (Always Visible) */}
            <div
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={statusConfig.color}>
                        {statusConfig.icon}
                    </div>
                    <div>
                        <div className={`font-semibold ${statusConfig.color}`}>
                            {statusConfig.label}
                        </div>
                        <div className="text-sm text-gray-600">
                            {progress.processed} / {progress.total_resources} files • {progressPercent}%
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {progress.status === 'processing' && progress.speed_files_per_minute && (
                        <div className="text-sm text-gray-600 mr-2">
                            {progress.speed_files_per_minute} files/min
                        </div>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
                    {/* Progress Bar */}
                    <div className="pt-4">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className={`h-4 ${statusConfig.progressColor} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                style={{ width: `${progressPercent}%` }}
                            >
                                {progressPercent > 10 && (
                                    <span className="text-xs font-bold text-white">
                                        {progressPercent}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        {/* Processed */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Processed</div>
                            <div className="text-xl font-bold text-gray-900">
                                {progress.processed}
                            </div>
                        </div>

                        {/* Success */}
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                            <div className="text-xs text-green-600 mb-1">Success</div>
                            <div className="text-xl font-bold text-green-700">
                                {progress.succeeded}
                            </div>
                        </div>

                        {/* Failed */}
                        <div className="bg-white rounded-lg p-3 border border-red-200">
                            <div className="text-xs text-red-600 mb-1">Failed</div>
                            <div className="text-xl font-bold text-red-700">
                                {progress.failed}
                            </div>
                        </div>

                        {/* ETA */}
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                            <div className="text-xs text-blue-600 mb-1">ETA</div>
                            <div className="text-xl font-bold text-blue-700">
                                {progress.estimated_time_remaining || '--'}
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {progress.status === 'completed' && (
                        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 text-sm text-green-900">
                                    <div className="font-semibold mb-1">Migration Completed Successfully!</div>
                                    <p>
                                        All {progress.succeeded} files have been successfully transferred to the new storage provider.
                                        {progress.failed > 0 && ` ${progress.failed} files failed to migrate.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {progress.status === 'failed' && (
                        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 text-sm text-red-900">
                                    <div className="font-semibold mb-1">Migration Failed</div>
                                    <p>{progress.error_message || 'An error occurred during migration.'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error List */}
                    {progress.errors && progress.errors.length > 0 && (
                        <details className="bg-white border border-amber-200 rounded-lg p-4">
                            <summary className="cursor-pointer font-semibold text-amber-900 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                View Errors ({progress.errors.length})
                            </summary>
                            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                                {progress.errors.slice(0, 10).map((error, index) => (
                                    <div key={index} className="text-sm bg-amber-50 rounded p-2 border border-amber-100">
                                        <div className="font-mono text-xs text-amber-900">
                                            {error.file_path || error.resource_id}
                                        </div>
                                        <div className="text-xs text-amber-800 mt-1">
                                            {error.error || error.message}
                                        </div>
                                    </div>
                                ))}
                                {progress.errors.length > 10 && (
                                    <div className="text-xs text-amber-600 text-center pt-2">
                                        ... and {progress.errors.length - 10} more errors
                                    </div>
                                )}
                            </div>
                        </details>
                    )}
                </div>
            )}
        </div>
    );
}

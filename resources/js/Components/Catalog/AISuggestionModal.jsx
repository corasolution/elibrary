import { X, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function AISuggestionModal({
    isOpen,
    onClose,
    suggestion,
    onAccept,
    title = "AI Suggestion"
}) {
    const [editedValue, setEditedValue] = useState(suggestion?.value || '');

    // Update edited value when suggestion changes
    useState(() => {
        if (suggestion?.value) {
            setEditedValue(suggestion.value);
        }
    }, [suggestion]);

    if (!isOpen) return null;

    const confidenceColor = (score) => {
        if (score >= 0.8) return 'bg-green-100 text-green-700 border-green-200';
        if (score >= 0.6) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-orange-100 text-orange-700 border-orange-200';
    };

    const confidenceLabel = (score) => {
        if (score >= 0.8) return 'High Confidence';
        if (score >= 0.6) return 'Medium Confidence';
        return 'Low Confidence';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                            <p className="text-sm text-gray-500">Review and edit before accepting</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Confidence Badge */}
                    {suggestion?.confidence !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className={`
                                px-3 py-1 rounded-full text-sm font-medium border
                                ${confidenceColor(suggestion.confidence)}
                            `}>
                                {confidenceLabel(suggestion.confidence)}
                                <span className="ml-1 opacity-75">
                                    ({Math.round(suggestion.confidence * 100)}%)
                                </span>
                            </span>
                        </div>
                    )}

                    {/* Suggestion Value (Editable) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Suggested Value
                        </label>
                        <textarea
                            value={editedValue}
                            onChange={(e) => setEditedValue(e.target.value)}
                            rows={suggestion?.value?.length > 100 ? 6 : 3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        {suggestion?.label && (
                            <p className="mt-1 text-sm text-gray-500">{suggestion.label}</p>
                        )}
                    </div>

                    {/* Warning for Low Confidence */}
                    {suggestion?.confidence !== undefined && suggestion.confidence < 0.6 && (
                        <div className="flex gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-800">
                                Low confidence suggestion. Please verify before accepting.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onAccept(editedValue);
                            onClose();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}

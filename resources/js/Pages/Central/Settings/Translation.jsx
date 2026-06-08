import { Head, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Save, Languages, DollarSign, Info } from 'lucide-react';

export default function TranslationSettings({ settings, usage }) {
    const { data, setData, post, processing, errors } = useForm({
        translation_enabled: settings?.translation_enabled ?? true,
        translation_monthly_budget: settings?.translation_monthly_budget ?? 10.00,
        translation_auto_translate_new: settings?.translation_auto_translate_new ?? false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('central.settings.translation.update'));
    };

    const usagePercentage = usage?.percentage ?? 0;
    const isOverBudget = usagePercentage > 100;

    return (
        <CentralLayout>
            <Head title="Translation Settings" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Translation API Settings</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure Gemini API for automatic English → Khmer translation
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-900">About Translation API</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    The CMS uses the same Gemini API configured in AI Settings for automatic translation.
                                    These settings control usage limits and features specifically for the translation feature.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Usage Statistics */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Monthly Usage</h3>
                                <p className="text-sm text-gray-500">Current translation API costs</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">
                                    ${usage?.this_month?.toFixed(4) ?? '0.0000'}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">Used This Month</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">
                                    ${usage?.budget?.toFixed(2) ?? '10.00'}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">Monthly Budget</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                    ${usage?.remaining?.toFixed(4) ?? '10.0000'}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">Remaining</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${
                                    isOverBudget ? 'bg-red-600' : usagePercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-center">
                            {usagePercentage.toFixed(1)}% of budget used
                        </p>

                        {isOverBudget && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">
                                    Warning: You have exceeded your monthly translation budget. Consider increasing the budget or translating manually.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Languages className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Translation Configuration</h3>
                                <p className="text-sm text-gray-500">Control translation features and limits</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Enable Translation */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="translation_enabled"
                                    checked={data.translation_enabled}
                                    onChange={(e) => setData('translation_enabled', e.target.checked)}
                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                    <label htmlFor="translation_enabled" className="block text-sm font-medium text-gray-700">
                                        Enable AI Translation
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Allow automatic translation of English content to Khmer using Gemini API
                                    </p>
                                </div>
                            </div>

                            {/* Monthly Budget */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Monthly Budget (USD)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.translation_monthly_budget}
                                    onChange={(e) => setData('translation_monthly_budget', parseFloat(e.target.value))}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Set a monthly budget limit for translation API usage
                                </p>
                                {errors.translation_monthly_budget && (
                                    <p className="mt-1 text-xs text-red-600">{errors.translation_monthly_budget}</p>
                                )}
                            </div>

                            {/* Auto Translate */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="translation_auto_translate_new"
                                    checked={data.translation_auto_translate_new}
                                    onChange={(e) => setData('translation_auto_translate_new', e.target.checked)}
                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                    <label htmlFor="translation_auto_translate_new" className="block text-sm font-medium text-gray-700">
                                        Auto-translate New Content
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Automatically translate new English content to Khmer when created (uses API credits)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : 'Save Settings'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </CentralLayout>
    );
}

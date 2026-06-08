import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Sparkles, DollarSign, Activity, TrendingUp, Zap, Clock, CheckCircle, AlertCircle, Download, Settings } from 'lucide-react';
import { useState } from 'react';

export default function AIUsage({ stats, monthlyUsage, recentLogs, budgetSettings }) {
    const formatCost = (cost) => `$${parseFloat(cost).toFixed(4)}`;
    const formatNumber = (num) => num.toLocaleString();
    const [showBudgetForm, setShowBudgetForm] = useState(false);

    const { data, setData, post, processing } = useForm({
        monthly_budget: budgetSettings?.monthly_budget || 50.00,
        alert_threshold: budgetSettings?.alert_threshold || 0.80,
        auto_disable: budgetSettings?.auto_disable !== false,
    });

    const handleBudgetSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.ai-usage.budget'), {
            onSuccess: () => setShowBudgetForm(false),
        });
    };

    const handleExport = () => {
        window.location.href = route('admin.settings.ai-usage.export');
    };

    return (
        <AdminLayout title="AI Usage & Costs">
            <Head title="AI Usage" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                            AI Usage & Costs
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Track your library's AI-powered cataloging usage and costs
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setShowBudgetForm(!showBudgetForm)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Budget Settings
                        </button>
                    </div>
                </div>

                {/* Budget Settings Form */}
                {showBudgetForm && (
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Settings</h3>
                        <form onSubmit={handleBudgetSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Monthly Budget (USD)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.monthly_budget}
                                    onChange={(e) => setData('monthly_budget', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                    placeholder="50.00"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Set to 0 for unlimited usage. Includes 30% platform fee.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alert Threshold (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={data.alert_threshold}
                                    onChange={(e) => setData('alert_threshold', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                    placeholder="0.80"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Receive alert when usage reaches this percentage (0.80 = 80%)
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="auto_disable"
                                    checked={data.auto_disable}
                                    onChange={(e) => setData('auto_disable', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="auto_disable" className="text-sm text-gray-700">
                                    Automatically disable AI features when budget is exceeded
                                </label>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Budget Settings'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowBudgetForm(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Cost Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={DollarSign}
                        label="This Month"
                        value={formatCost(stats.monthly_cost)}
                        color="purple"
                        subtitle="Total AI costs"
                    />
                    <StatCard
                        icon={Activity}
                        label="API Calls"
                        value={formatNumber(stats.total_calls)}
                        color="blue"
                        subtitle="This month"
                    />
                    <StatCard
                        icon={Zap}
                        label="Cache Hit Rate"
                        value={`${stats.cache_hit_rate}%`}
                        color="green"
                        subtitle="Saving costs"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Avg Response"
                        value={`${stats.avg_response_time}ms`}
                        color="orange"
                        subtitle="API speed"
                    />
                </div>

                {/* Monthly Trend Chart */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage Trend</h3>
                    <div className="space-y-3">
                        {monthlyUsage.map((month, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">
                                            {month.month}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {formatNumber(month.calls)} calls · {formatCost(month.cost)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(month.calls / stats.total_calls) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feature Breakdown */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Usage by Feature
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.by_feature.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                name={feature.name}
                                calls={feature.calls}
                                cost={feature.cost}
                                successRate={feature.success_rate}
                            />
                        ))}
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-600" />
                            Recent AI Activity
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Feature
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tokens
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cost
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatFeatureName(log.feature)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {log.status === 'success' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Success
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Error
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {log.cache_hit ? (
                                                <span className="text-green-600 font-medium">Cached</span>
                                            ) : (
                                                `${formatNumber(log.input_tokens + log.output_tokens)}`
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.cache_hit ? (
                                                <span className="text-green-600">$0.0000</span>
                                            ) : (
                                                formatCost(log.cost_usd)
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {log.response_time_ms}ms
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cost Savings Info */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                                Cost Savings with Caching
                            </h3>
                            <p className="text-green-700 mb-3">
                                Your cache hit rate of <strong>{stats.cache_hit_rate}%</strong> has saved approximately{' '}
                                <strong>{formatCost(stats.savings_from_cache)}</strong> this month!
                            </p>
                            <p className="text-sm text-green-600">
                                Without caching, your costs would be {formatCost(stats.cost_without_cache)} instead of {formatCost(stats.monthly_cost)}.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Budget Alert (Optional) */}
                {stats.budget_limit && (
                    <div className={`border rounded-lg p-6 ${
                        stats.monthly_cost >= stats.budget_limit
                            ? 'bg-red-50 border-red-200'
                            : stats.monthly_cost >= stats.budget_limit * 0.8
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                    }`}>
                        <div className="flex items-start gap-4">
                            <AlertCircle className={`w-6 h-6 ${
                                stats.monthly_cost >= stats.budget_limit
                                    ? 'text-red-600'
                                    : stats.monthly_cost >= stats.budget_limit * 0.8
                                    ? 'text-yellow-600'
                                    : 'text-blue-600'
                            }`} />
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">
                                    Monthly Budget: {formatCost(stats.budget_limit)}
                                </h3>
                                <div className="mb-2">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span>Used: {formatCost(stats.monthly_cost)}</span>
                                        <span>{Math.round((stats.monthly_cost / stats.budget_limit) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-white rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                stats.monthly_cost >= stats.budget_limit
                                                    ? 'bg-red-600'
                                                    : stats.monthly_cost >= stats.budget_limit * 0.8
                                                    ? 'bg-yellow-500'
                                                    : 'bg-blue-600'
                                            }`}
                                            style={{ width: `${Math.min((stats.monthly_cost / stats.budget_limit) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                {stats.monthly_cost >= stats.budget_limit && (
                                    <p className="text-sm text-red-700">
                                        ⚠️ Monthly budget exceeded. AI features may be disabled.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function StatCard({ icon: Icon, label, value, color, subtitle }) {
    const colors = {
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
    };

    return (
        <div className={`${colors[color]} border rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-3">
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm opacity-75">{label}</div>
                {subtitle && <div className="text-xs opacity-60 mt-1">{subtitle}</div>}
            </div>
        </div>
    );
}

function FeatureCard({ name, calls, cost, successRate }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">
                {formatFeatureName(name)}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                    <span>Calls:</span>
                    <span className="font-medium">{calls.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-medium">${parseFloat(cost).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Success:</span>
                    <span className="font-medium text-green-600">{successRate}%</span>
                </div>
            </div>
        </div>
    );
}

function formatFeatureName(feature) {
    const names = {
        'ddc_lcc_classification': 'DDC/LCC Classification',
        'abstract_generation': 'Abstract Generation',
        'subject_extraction': 'Subject Extraction',
        'keyword_extraction': 'Keyword Extraction',
        'khmer_translation': 'Khmer Translation',
        'search_query_parsing': 'Search Query Parsing',
        'search_query_expansion': 'Query Expansion',
        'search_autocomplete': 'Search Autocomplete',
    };
    return names[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BookOpen, TrendingUp, ArrowLeft, AlertTriangle, BarChart2,
    RefreshCw, Search
} from 'lucide-react';

const ratioColor = (ratio) => {
    if (ratio >= 999) return { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Critical',  badge: 'bg-red-500' };
    if (ratio >= 5)   return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Very High', badge: 'bg-orange-500' };
    if (ratio >= 3)   return { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'High',      badge: 'bg-amber-500' };
    if (ratio >= 1)   return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moderate',  badge: 'bg-yellow-500' };
    return             { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Normal',   badge: 'bg-emerald-500' };
};

export default function HoldRatios({ ratios = [], minHolds = 1 }) {
    const [minVal, setMinVal] = useState(String(minHolds));

    const applyFilter = () => {
        router.get(route('admin.reservations.hold-ratios'), { min_holds: minVal }, { preserveState: true });
    };

    const critical = ratios.filter(r => r.ratio >= 999 || r.available_copies === 0);
    const high     = ratios.filter(r => r.ratio >= 3 && r.ratio < 999 && r.available_copies > 0);

    return (
        <AdminLayout title="Hold Ratios">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.get(route('admin.reservations.index'))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-black text-gray-900">Hold Ratios</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Titles with high demand — identify where more copies are needed</p>
                    </div>
                </div>

                {/* Summary chips */}
                {ratios.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-bold text-red-800">{critical.length} critical</span>
                            <span className="text-xs text-red-500">(no available copies)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-bold text-amber-800">{high.length} high demand</span>
                            <span className="text-xs text-amber-500">(ratio ≥ 3)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                            <BarChart2 className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-bold text-gray-700">{ratios.length} titles tracked</span>
                        </div>
                    </div>
                )}

                {/* Filter bar */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">Min active holds:</label>
                        <input
                            type="number" min="1" max="100" value={minVal}
                            onChange={e => setMinVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilter()}
                            className="w-20 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <button onClick={applyFilter}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl">
                        <Search className="w-3.5 h-3.5" /> Apply
                    </button>
                    <button onClick={() => router.reload()}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium rounded-xl ml-auto">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Normal (< 1)', color: 'bg-emerald-500' },
                        { label: 'Moderate (1–3)', color: 'bg-yellow-500' },
                        { label: 'High (3–5)', color: 'bg-amber-500' },
                        { label: 'Very High (5+)', color: 'bg-orange-500' },
                        { label: 'Critical (no copies)', color: 'bg-red-500' },
                    ].map(({ label, color }) => (
                        <span key={label} className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                            <span className={`w-2 h-2 rounded-full ${color}`} />
                            {label}
                        </span>
                    ))}
                </div>

                {/* Table */}
                {ratios.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
                        <BarChart2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-600">No titles match</h3>
                        <p className="text-sm text-gray-400 mt-1">Try lowering the minimum holds threshold.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Copies</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Available</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Holds</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ratio</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Demand</th>
                                        <th className="py-3 px-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {ratios.map((r, idx) => {
                                        const meta = ratioColor(Number(r.ratio));
                                        const ratioDisplay = Number(r.ratio) >= 999 ? '∞' : Number(r.ratio).toFixed(2);
                                        return (
                                            <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-4 text-xs text-gray-400 font-mono">{idx + 1}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-6 h-8 bg-gradient-to-b from-slate-100 to-slate-200 rounded flex items-center justify-center flex-shrink-0">
                                                            <BookOpen className="w-3 h-3 text-slate-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-semibold text-gray-800 truncate max-w-xs">{r.title}</div>
                                                            {r.isbn && <div className="text-[10px] text-gray-400 font-mono">{r.isbn}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-right text-xs font-semibold text-gray-700">{r.total_copies}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={`text-xs font-bold ${Number(r.available_copies) === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        {r.available_copies}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right text-xs font-bold text-blue-700">{r.active_holds}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={`text-sm font-black ${meta.text}`}>{ratioDisplay}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                                                        {meta.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => router.get(route('admin.catalog.show', r.id))}
                                                        className="text-xs text-blue-600 hover:underline font-medium">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
                            Ratio = Active Holds ÷ Available Copies. Showing up to 100 titles ordered by highest demand. ∞ = no available copies.
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

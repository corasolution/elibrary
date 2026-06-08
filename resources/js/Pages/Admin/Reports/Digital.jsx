import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, Download, Radio, Users } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function DigitalReport({ dailyActivity, topResources, summary, from, to }) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo,   setDateTo]   = useState(to);

    const apply = () => router.get(route('admin.reports.digital'), { from: dateFrom, to: dateTo }, { preserveState: true });

    // Group daily activity into per-date view/download/stream
    const chartData = (() => {
        const map = {};
        (dailyActivity ?? []).forEach(r => {
            if (!map[r.date]) map[r.date] = { date: r.date, view: 0, download: 0, stream: 0 };
            map[r.date][r.action] = (map[r.date][r.action] ?? 0) + r.count;
        });
        return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    })();

    return (
        <AdminLayout title="Digital Usage">
            <div className="space-y-6">
                {/* Date filter */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                    <button onClick={apply}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Apply
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card icon={Eye}      color="blue"   label="Total Views"     value={summary.total_views} />
                    <Card icon={Download} color="green"  label="Total Downloads" value={summary.total_downloads} />
                    <Card icon={Radio}    color="purple" label="Total Streams"   value={summary.total_streams} />
                    <Card icon={Users}    color="amber"  label="Unique Users"    value={summary.unique_users} />
                </div>

                {/* Area chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Digital Activity</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                                <defs>
                                    <linearGradient id="gView" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gDownload" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="view"     name="Views"     stroke="#3b82f6" fill="url(#gView)"     strokeWidth={2} />
                                <Area type="monotone" dataKey="download" name="Downloads" stroke="#22c55e" fill="url(#gDownload)" strokeWidth={2} />
                                <Area type="monotone" dataKey="stream"   name="Streams"   stroke="#8b5cf6" fill="none"            strokeWidth={2} strokeDasharray="4 2" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyState />}
                </div>

                {/* Top resources */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 10 Digital Resources</h2>
                    {(topResources ?? []).length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">Title</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">Format</th>
                                        <th className="text-right py-2 px-3 font-medium text-gray-600">Views</th>
                                        <th className="text-right py-2 px-3 font-medium text-gray-600">Downloads</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topResources.map((r, i) => (
                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-2 px-3 text-gray-800 max-w-xs truncate">{r.title}</td>
                                            <td className="py-2 px-3"><span className="badge badge-blue uppercase text-xs">{r.format}</span></td>
                                            <td className="py-2 px-3 text-right font-medium">{r.views}</td>
                                            <td className="py-2 px-3 text-right font-medium">{r.downloads}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <EmptyState />}
                </div>
            </div>
        </AdminLayout>
    );
}

function Card({ icon: Icon, color, label, value }) {
    const cls = {
        blue:   'bg-blue-50 text-blue-600 ring-blue-100',
        green:  'bg-green-50 text-green-600 ring-green-100',
        purple: 'bg-purple-50 text-purple-600 ring-purple-100',
        amber:  'bg-amber-50 text-amber-600 ring-amber-100',
    }[color];
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg ring-1 flex items-center justify-center ${cls}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900">{value ?? 0}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
        </div>
    );
}

function EmptyState() {
    return <div className="text-center py-8 text-sm text-gray-400">No data for this period.</div>;
}

import { Head } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Sparkles, DollarSign, Cpu, Building2 } from 'lucide-react';

const money = (n) => '$' + Number(n ?? 0).toFixed(4);
const num = (n) => Number(n ?? 0).toLocaleString();
const PROVIDER = { gemini: { label: 'Gemini', cls: 'bg-blue-100 text-blue-700' }, claude: { label: 'Claude', cls: 'bg-orange-100 text-orange-700' } };

export default function AiUsage({ totals, byProvider = [], byFeature = [], byTenant = [], monthEarning = 0 }) {
    return (
        <CentralLayout
            title="AI Usage & Earnings"
            breadcrumbs={[
                { label: 'Dashboard', href: route('central.dashboard') },
                { label: 'AI Usage' },
            ]}
        >
            <Head title="AI Usage & Earnings" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-3 mb-1">
                        <Sparkles className="w-7 h-7" />
                        <h1 className="text-2xl font-bold">AI Usage & Earnings</h1>
                    </div>
                    <p className="text-emerald-100 text-sm">Token usage by API and your platform earnings (markup over API cost), across all libraries.</p>
                </div>

                {/* Top stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Stat icon={Cpu} label="Total calls" value={num(totals?.calls)} />
                    <Stat icon={Cpu} label="Total tokens" value={num((totals?.input_tokens ?? 0) * 1 + (totals?.output_tokens ?? 0) * 1)} />
                    <Stat icon={DollarSign} label="API cost (all time)" value={money(totals?.api_cost)} />
                    <Stat icon={DollarSign} label="Your earning (all time)" value={money(totals?.earning)} highlight />
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
                    💰 <strong>This month's earning:</strong> {money(monthEarning)} &nbsp;·&nbsp; billed to libraries (all time): <strong>{money(totals?.billed)}</strong>
                </div>

                {/* By provider */}
                <Card title="By API / Provider">
                    <Table head={['Provider', 'Calls', 'Tokens', 'API cost', 'Billed', 'Earning']}>
                        {byProvider.map((r) => (
                            <tr key={r.provider} className="border-t">
                                <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROVIDER[r.provider]?.cls ?? 'bg-gray-100 text-gray-600'}`}>{PROVIDER[r.provider]?.label ?? r.provider}</span></td>
                                <td className="px-4 py-2">{num(r.calls)}</td>
                                <td className="px-4 py-2">{num(r.tokens)}</td>
                                <td className="px-4 py-2 font-mono text-xs">{money(r.api_cost)}</td>
                                <td className="px-4 py-2 font-mono text-xs">{money(r.billed)}</td>
                                <td className="px-4 py-2 font-mono text-xs text-emerald-700 font-semibold">{money(r.earning)}</td>
                            </tr>
                        ))}
                        {byProvider.length === 0 && <EmptyRow cols={6} />}
                    </Table>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                    <Card title="By Feature">
                        <Table head={['Feature', 'Calls', 'Tokens', 'Earning']}>
                            {byFeature.map((r) => (
                                <tr key={r.feature} className="border-t">
                                    <td className="px-4 py-2">{r.feature}</td>
                                    <td className="px-4 py-2">{num(r.calls)}</td>
                                    <td className="px-4 py-2">{num(r.tokens)}</td>
                                    <td className="px-4 py-2 font-mono text-xs text-emerald-700">{money(r.earning)}</td>
                                </tr>
                            ))}
                            {byFeature.length === 0 && <EmptyRow cols={4} />}
                        </Table>
                    </Card>

                    <Card title="By Library" icon={Building2}>
                        <Table head={['Library', 'Calls', 'Tokens', 'Billed', 'Earning']}>
                            {byTenant.map((r) => (
                                <tr key={r.tenant_id ?? 'none'} className="border-t">
                                    <td className="px-4 py-2 truncate max-w-[160px]">{r.tenant_name}</td>
                                    <td className="px-4 py-2">{num(r.calls)}</td>
                                    <td className="px-4 py-2">{num(r.tokens)}</td>
                                    <td className="px-4 py-2 font-mono text-xs">{money(r.billed)}</td>
                                    <td className="px-4 py-2 font-mono text-xs text-emerald-700">{money(r.earning)}</td>
                                </tr>
                            ))}
                            {byTenant.length === 0 && <EmptyRow cols={5} />}
                        </Table>
                    </Card>
                </div>
            </div>
        </CentralLayout>
    );
}

function Stat({ icon: Icon, label, value, highlight }) {
    return (
        <div className={`rounded-lg border p-4 ${highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
            <div className="flex items-center gap-2 text-gray-500 text-xs"><Icon className="w-4 h-4" /> {label}</div>
            <div className={`mt-1 text-2xl font-bold ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>{value}</div>
        </div>
    );
}
function Card({ title, icon: Icon, children }) {
    return (
        <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold text-gray-800 flex items-center gap-2">{Icon && <Icon className="w-4 h-4 text-gray-500" />}{title}</div>
            <div className="overflow-x-auto">{children}</div>
        </div>
    );
}
function Table({ head, children }) {
    return (
        <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-gray-600">{head.map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>{children}</tbody>
        </table>
    );
}
function EmptyRow({ cols }) {
    return <tr><td colSpan={cols} className="px-4 py-8 text-center text-gray-400">No AI usage recorded yet.</td></tr>;
}

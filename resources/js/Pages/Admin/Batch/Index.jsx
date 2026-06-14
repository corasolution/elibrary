import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import {
    Layers, Edit3, Trash2, FileText, Barcode, ArrowRight,
    Zap, Shield, Clock, CheckCircle2
} from 'lucide-react';

const TOOLS = [
    {
        href:    'admin.batch.item-modification',
        icon:    Edit3,
        color:   'blue',
        title:   'Batch Item Modification',
        desc:    'Modify status, collection, location, condition and more across hundreds of items at once using barcode lists.',
        features:['Barcode list or CSV upload', 'Live item preview', 'Field-by-field control', 'Instant apply'],
        badge:   'Most used',
    },
    {
        href:    'admin.batch.item-deletion',
        icon:    Trash2,
        color:   'red',
        title:   'Batch Item Deletion',
        desc:    'Remove withdrawn or lost items in bulk. Checked-out items are always protected from accidental deletion.',
        features:['Barcode input or paste', 'Safety check on checkout', 'Soft or hard delete', 'Confirmation step'],
        badge:   'Destructive',
    },
    {
        href:    'admin.batch.record-modification',
        icon:    FileText,
        color:   'violet',
        title:   'Batch Record Modification',
        desc:    'Update language, status, or publisher across multiple bibliographic records matched by ISBN or record ID.',
        features:['ISBN or record ID input', 'Selective field updates', 'Preview before apply', 'Bulk update'],
        badge:   null,
    },
];

const COLOR = {
    blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   grad: 'from-blue-500 to-blue-700',   ring: 'ring-blue-200',   btn: 'bg-blue-600 hover:bg-blue-700' },
    red:    { bg: 'bg-red-100',    text: 'text-red-600',    grad: 'from-red-500 to-red-700',     ring: 'ring-red-200',    btn: 'bg-red-600 hover:bg-red-700' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-600', grad: 'from-violet-500 to-violet-700',ring: 'ring-violet-200', btn: 'bg-violet-600 hover:bg-violet-700' },
};

export default function BatchIndex() {
    return (
        <AdminLayout title="Batch Tools">
            <div className="space-y-6">

                {/* Header card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Layers className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">Batch Tools</h1>
                            <p className="text-slate-300 mt-1 text-sm max-w-xl">
                                Bulk operations for your catalog. Modify, delete, or update hundreds of records at once —
                                faster than Koha, with live preview and safety checks built in.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-4">
                                {[
                                    { icon: Zap,          label: 'Instant preview' },
                                    { icon: Shield,       label: 'Checkout protection' },
                                    { icon: Clock,        label: 'Bulk speed' },
                                    { icon: CheckCircle2, label: 'Confirm before apply' },
                                ].map(({ icon: Ico, label }) => (
                                    <div key={label} className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium">
                                        <Ico className="w-3 h-3" />{label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tool cards */}
                <div className="grid md:grid-cols-3 gap-5">
                    {TOOLS.map(tool => {
                        const c = COLOR[tool.color];
                        const Icon = tool.icon;
                        return (
                            <div key={tool.href} className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm ring-0 hover:ring-2 ${c.ring} transition-all group`}>
                                {/* Gradient header */}
                                <div className={`bg-gradient-to-br ${c.grad} px-6 py-5`}>
                                    <div className="flex items-start justify-between">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        {tool.badge && (
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                                tool.badge === 'Destructive' ? 'bg-red-900/40 text-red-200' : 'bg-white/20 text-white'
                                            }`}>
                                                {tool.badge}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-white font-bold text-base mt-3">{tool.title}</h2>
                                </div>

                                {/* Body */}
                                <div className="p-5 flex flex-col h-full">
                                    <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>

                                    <ul className="mt-4 space-y-1.5">
                                        {tool.features.map(f => (
                                            <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                                                <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${c.text}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-5 pt-4 border-t border-gray-100">
                                        <Link href={route(tool.href)}
                                            className={`inline-flex items-center gap-2 px-4 py-2 ${c.btn} text-white text-sm font-semibold rounded-xl w-full justify-center transition-colors`}>
                                            Open Tool <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tips */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Pro Tips
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4 text-xs text-amber-700">
                        <div><span className="font-semibold">Barcode scanner:</span> Use a USB barcode wand — scan directly into the barcode input box, each scan auto-submits.</div>
                        <div><span className="font-semibold">CSV upload:</span> Export barcodes from a spreadsheet, paste the column directly — commas, spaces, and newlines all work.</div>
                        <div><span className="font-semibold">Safety first:</span> Batch deletion always checks for checked-out status. Bibliographic records with active loans are blocked from deletion.</div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

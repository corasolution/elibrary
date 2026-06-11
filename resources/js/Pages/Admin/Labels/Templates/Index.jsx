import AdminLayout from '@/Layouts/AdminLayout';
import CardRenderer from '@/Components/Cards/CardRenderer';
import { Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Star, ScanBarcode, ChevronLeft } from 'lucide-react';

const SAMPLE = {
    barcode_value: 'LIB-000001',
    title: 'The Art of Computer Programming',
    title_km: 'សិល្បៈនៃការសរសេរកម្មវិធី',
    author: 'Donald Knuth',
    call_number: '005.1 KNU',
    accession_number: 'ACC-0001',
    collection: 'General',
    library_name: 'Alpha eLibrary',
};

export default function LabelTemplatesIndex({ templates = [] }) {
    const branding = usePage().props?.branding ?? {};

    const setDefault = (id) => router.post(route('admin.labels.templates.default', id), {}, { preserveScroll: true });
    const remove = (id, name) => {
        if (!confirm(`Delete label template "${name}"?`)) return;
        router.delete(route('admin.labels.templates.destroy', id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Label Templates">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Link href={route('admin.labels.index')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                        <ChevronLeft className="w-4 h-4" /> Back to Barcode Labels
                    </Link>
                    <Link href={route('admin.labels.templates.create')}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                        <Plus className="w-4 h-4" /> New Template
                    </Link>
                </div>

                {templates.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                        <ScanBarcode className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 mb-4">No label templates yet.</p>
                        <Link href={route('admin.labels.templates.create')} className="text-sm text-blue-600 hover:underline">Create your first template</Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {templates.map(t => (
                            <div key={t.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                                <div className="bg-gray-100 p-4 flex items-center justify-center">
                                    <CardRenderer
                                        template={{ width_mm: t.label_width_mm, height_mm: t.label_height_mm, background_color: t.background_color, elements: t.elements }}
                                        data={SAMPLE} branding={branding} scale={1.5} />
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-gray-900 flex-1 truncate">{t.name}</h3>
                                        {t.is_default && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Default</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{t.columns}×{t.rows} on {t.page_size} · {t.label_width_mm}×{t.label_height_mm} mm</p>
                                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                                        <Link href={route('admin.labels.templates.edit', t.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </Link>
                                        {!t.is_default && <button onClick={() => setDefault(t.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg"><Star className="w-3.5 h-3.5" /> Set default</button>}
                                        <button onClick={() => remove(t.id, t.name)} className="ml-auto p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

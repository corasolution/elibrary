import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, Headphones, Film, Globe } from 'lucide-react';

const TYPE_ICONS = {
    book: BookOpen, ebook: FileText, audio: Headphones, video: Film,
    journal: Globe, article: FileText, thesis: BookOpen,
};

export default function RecordCard({ record }) {
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';
    const TypeIcon = TYPE_ICONS[record.material_type?.code] ?? BookOpen;
    const primaryAuthor = record.authors?.[0]?.name;
    const hasDigital = record.digital_resources?.length > 0;
    const availableCopies = record.physical_items?.filter(i => i.item_status === 'available').length ?? 0;

    return (
        <Link href={`${base}/catalog/${record.id}`} className="group flex flex-col card hover:shadow-md transition-all">
            {/* Cover */}
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden flex items-center justify-center relative">
                {record.cover_image_url ? (
                    <img src={record.cover_image_url} alt={record.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <TypeIcon className="w-10 h-10 text-gray-300" />
                )}

                {/* Digital badge */}
                {hasDigital && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        e
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col flex-1">
                <h3 className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {record.title}
                </h3>
                {primaryAuthor && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{primaryAuthor}</p>
                )}
                <div className="mt-auto pt-2 flex items-center justify-between">
                    {record.publication_year && (
                        <span className="text-xs text-gray-400">{record.publication_year}</span>
                    )}
                    {availableCopies > 0 ? (
                        <span className="text-[10px] badge badge-green">{availableCopies} avail.</span>
                    ) : hasDigital ? (
                        <span className="text-[10px] badge badge-blue">Digital</span>
                    ) : (
                        <span className="text-[10px] badge badge-amber">No copies</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

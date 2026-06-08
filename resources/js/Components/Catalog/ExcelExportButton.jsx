import { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown, FileSpreadsheet, Filter } from 'lucide-react';

export default function ExcelExportButton({ filters = {} }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const hasFilters = Object.values(filters).some(v => v !== '' && v != null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const buildFilteredUrl = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v != null) params.set(k, v); });
        const qs = params.toString();
        return route('admin.catalog.excel.export-filtered') + (qs ? '?' + qs : '');
    };

    const handleExportAll = () => {
        window.location.href = route('admin.catalog.excel.export-all');
        setOpen(false);
    };

    const handleExportFiltered = () => {
        window.location.href = buildFilteredUrl();
        setOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 bg-white"
            >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                Export
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1.5 overflow-hidden">
                    <button
                        onClick={handleExportAll}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                        <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                            <div className="font-medium">Export All Records</div>
                            <div className="text-xs text-gray-400">All active catalog records</div>
                        </div>
                    </button>
                    <button
                        onClick={handleExportFiltered}
                        disabled={!hasFilters}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left ${
                            hasFilters
                                ? 'text-gray-700 hover:bg-gray-50'
                                : 'text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                            <div className="font-medium">Export Filtered Results</div>
                            <div className="text-xs text-gray-400">
                                {hasFilters ? 'Current search/filter applied' : 'No active filters'}
                            </div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}

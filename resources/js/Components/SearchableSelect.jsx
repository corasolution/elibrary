import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

/**
 * Lightweight searchable dropdown (combobox). No external dependency.
 *
 * Props:
 *  - options: [{ value, label }]
 *  - value: current value
 *  - onChange: (value) => void
 *  - placeholder, searchPlaceholder, error, className, allowClear
 */
export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = '— Select —',
    searchPlaceholder = 'Search…',
    error = false,
    className = '',
    allowClear = true,
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const ref = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    const filtered = useMemo(() => {
        if (!q.trim()) return options;
        const needle = q.toLowerCase();
        return options.filter(o => String(o.label).toLowerCase().includes(needle));
    }, [q, options]);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const pick = (v) => { onChange(v); setOpen(false); setQ(''); };

    const base = `w-full rounded-lg border px-3 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
        error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
    }`;

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button type="button" onClick={() => setOpen(o => !o)} className={base}>
                <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                autoFocus
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <ul className="max-h-60 overflow-auto py-1">
                        {allowClear && (
                            <li>
                                <button type="button" onClick={() => pick('')}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50">
                                    {placeholder}
                                </button>
                            </li>
                        )}
                        {filtered.map(o => {
                            const active = String(o.value) === String(value);
                            return (
                                <li key={o.value}>
                                    <button type="button" onClick={() => pick(o.value)}
                                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 hover:bg-blue-50 ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}>
                                        <span className="truncate">{o.label}</span>
                                        {active && <Check className="w-4 h-4 shrink-0" />}
                                    </button>
                                </li>
                            );
                        })}
                        {filtered.length === 0 && (
                            <li className="px-3 py-3 text-sm text-gray-400 text-center">No matches</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

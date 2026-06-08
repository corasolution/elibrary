import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';

function Accordion({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 pb-3 mb-3">
            <button onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2">
                {title}
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {open && children}
        </div>
    );
}

export default function FacetedFilter({ materialTypes = [], filters = {}, onChange }) {
    const { t } = useTranslation();
    const current = { ...filters };

    const update = (key, value) => {
        const next = { ...current, [key]: value || undefined };
        onChange(next);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

            <Accordion title={t('catalog.type')}>
                <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="material_type" value=""
                            checked={!current.material_type_id}
                            onChange={() => update('material_type_id', '')}
                            className="text-blue-600" />
                        <span className="text-gray-600">All Types</span>
                    </label>
                    {materialTypes.map((type) => (
                        <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="material_type" value={type.id}
                                checked={current.material_type_id == type.id}
                                onChange={() => update('material_type_id', type.id)}
                                className="text-blue-600" />
                            <span className="text-gray-600">{type.name}</span>
                        </label>
                    ))}
                </div>
            </Accordion>

            <Accordion title={t('catalog.language')}>
                <div className="space-y-1.5">
                    {[['', 'All Languages'], ['en', 'English'], ['km', 'Khmer'], ['fr', 'French'], ['zh', 'Chinese']].map(([val, label]) => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="language" value={val}
                                checked={(current.language || '') === val}
                                onChange={() => update('language', val)}
                                className="text-blue-600" />
                            <span className="text-gray-600">{label}</span>
                        </label>
                    ))}
                </div>
            </Accordion>

            <Accordion title="Publication Year">
                <div className="flex gap-2 items-center">
                    <input type="number" placeholder="From" value={current.year_from || ''}
                        onChange={(e) => update('year_from', e.target.value)}
                        className="w-20 input text-xs py-1" min="1800" max="2026" />
                    <span className="text-gray-400">—</span>
                    <input type="number" placeholder="To" value={current.year_to || ''}
                        onChange={(e) => update('year_to', e.target.value)}
                        className="w-20 input text-xs py-1" min="1800" max="2026" />
                </div>
            </Accordion>

            <Accordion title="Availability">
                <div className="space-y-1.5">
                    {[['', 'All'], ['available', 'Available Now'], ['digital', 'Digital Access']].map(([val, label]) => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="availability" value={val}
                                checked={(current.availability || '') === val}
                                onChange={() => update('availability', val)}
                                className="text-blue-600" />
                            <span className="text-gray-600">{label}</span>
                        </label>
                    ))}
                </div>
            </Accordion>

            <button onClick={() => onChange({})}
                className="text-xs text-gray-400 hover:text-red-500 mt-2">
                Clear all filters
            </button>
        </div>
    );
}

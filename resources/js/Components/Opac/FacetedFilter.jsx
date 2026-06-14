import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANG_LABELS = { en: 'English', km: 'Khmer', fr: 'French', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ar: 'Arabic' };

function Section({ title, children, defaultOpen = true, badge }) {
    const [open, setOpen] = useState(defaultOpen);
    const { theme } = usePage().props;
    const primary = theme?.colors?.primary || '#3B82F6';

    return (
        <div className="border-b border-gray-100 last:border-0">
            <button onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full py-3 text-left group">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 group-hover:text-gray-900">
                    {title}
                </span>
                <div className="flex items-center gap-1.5">
                    {badge > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: primary }}>{badge}</span>
                    )}
                    {open
                        ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                        : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </div>
            </button>
            {open && <div className="pb-3">{children}</div>}
        </div>
    );
}

function RadioOption({ name, value, checked, label, count, onChange, primary }) {
    return (
        <label className="flex items-center justify-between gap-2 cursor-pointer py-1 group">
            <div className="flex items-center gap-2">
                <input type="radio" name={name} value={value} checked={checked} onChange={onChange}
                    className="shrink-0 w-3.5 h-3.5 cursor-pointer" style={{ accentColor: primary }} />
                <span className={`text-sm leading-snug ${checked ? 'font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}
                    style={checked ? { color: primary } : {}}>
                    {label}
                </span>
            </div>
            {count != null && (
                <span className="text-[11px] text-gray-400 shrink-0">{count.toLocaleString()}</span>
            )}
        </label>
    );
}

function CheckOption({ value, checked, label, count, onChange, primary }) {
    return (
        <label className="flex items-center justify-between gap-2 cursor-pointer py-1 group">
            <div className="flex items-center gap-2">
                <input type="checkbox" value={value} checked={checked} onChange={onChange}
                    className="shrink-0 w-3.5 h-3.5 rounded cursor-pointer" style={{ accentColor: primary }} />
                <span className={`text-sm leading-snug ${checked ? 'font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}
                    style={checked ? { color: primary } : {}}>
                    {label}
                </span>
            </div>
            {count != null && (
                <span className="text-[11px] text-gray-400 shrink-0">{count.toLocaleString()}</span>
            )}
        </label>
    );
}

export default function FacetedFilter({ materialTypes = [], filters = {}, facets = {}, onChange }) {
    const { theme } = usePage().props;
    const primary = theme?.colors?.primary || '#3B82F6';
    const [showAllSubjects, setShowAllSubjects] = useState(false);
    const { t } = useTranslation();

    const cur = { ...filters };

    const set = (key, val) => onChange({ ...cur, [key]: val || undefined });
    const clear = () => onChange({});

    const activeCount = Object.values(cur).filter(v => v !== undefined && v !== '').length;

    const { typeCounts = {}, langCounts = {}, subjectCounts = {}, yearMin, yearMax } = facets;

    const subjects = Object.entries(subjectCounts);
    const visibleSubjects = showAllSubjects ? subjects : subjects.slice(0, 8);

    return (
        <div className="text-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-1 pb-2 border-b border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('catalog.filter_ui.refine')}</span>
                {activeCount > 0 && (
                    <button onClick={clear}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                        <X className="w-3 h-3" /> {t('catalog.filter_ui.clear_all')}
                    </button>
                )}
            </div>

            {/* Availability */}
            <Section title={t('catalog.filter_ui.availability')} badge={cur.availability ? 1 : 0}>
                {[
                    { value: '',          label: t('catalog.filter_ui.all_items')    },
                    { value: 'available', label: t('catalog.filter_ui.available_now') },
                    { value: 'digital',   label: t('catalog.filter_ui.online_access') },
                ].map(({ value, label }) => (
                    <RadioOption key={value} name="availability" value={value}
                        checked={(cur.availability || '') === value}
                        label={label}
                        onChange={() => set('availability', value)}
                        primary={primary} />
                ))}
            </Section>

            {/* Format / Type */}
            <Section title={t('catalog.filter_ui.format')} badge={cur.material_type_id ? 1 : 0}>
                <RadioOption name="material_type" value=""
                    checked={!cur.material_type_id}
                    label={t('catalog.filter_ui.all_formats')}
                    onChange={() => set('material_type_id', '')}
                    primary={primary} />
                {materialTypes.map((type) => (
                    <RadioOption key={type.id} name="material_type" value={type.id}
                        checked={cur.material_type_id == type.id}
                        label={type.name}
                        count={typeCounts[type.id]}
                        onChange={() => set('material_type_id', type.id)}
                        primary={primary} />
                ))}
            </Section>

            {/* Subject */}
            {subjects.length > 0 && (
                <Section title={t('catalog.filter_ui.subject')} defaultOpen={true} badge={cur.subject ? 1 : 0}>
                    {cur.subject && (
                        <div className="flex items-center justify-between mb-2 px-2 py-1 rounded text-xs font-semibold"
                            style={{ backgroundColor: primary + '15', color: primary }}>
                            <span className="truncate">{cur.subject}</span>
                            <button onClick={() => set('subject', '')} className="shrink-0 ml-1 hover:opacity-70">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    {visibleSubjects.map(([term, count]) => (
                        <RadioOption key={term} name="subject" value={term}
                            checked={cur.subject === term}
                            label={term}
                            count={count}
                            onChange={() => set('subject', cur.subject === term ? '' : term)}
                            primary={primary} />
                    ))}
                    {subjects.length > 8 && (
                        <button onClick={() => setShowAllSubjects(!showAllSubjects)}
                            className="text-xs font-semibold mt-1 hover:underline"
                            style={{ color: primary }}>
                            {showAllSubjects ? t('catalog.filter_ui.show_less') : t('catalog.filter_ui.more_subjects', { count: subjects.length - 8 })}
                        </button>
                    )}
                </Section>
            )}

            {/* Language */}
            <Section title={t('catalog.filter_ui.language')} badge={cur.language ? 1 : 0}>
                <RadioOption name="language" value=""
                    checked={!cur.language}
                    label={t('catalog.filter_ui.all_languages')}
                    onChange={() => set('language', '')}
                    primary={primary} />
                {Object.entries(langCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([code, count]) => (
                        <RadioOption key={code} name="language" value={code}
                            checked={cur.language === code}
                            label={LANG_LABELS[code] || code.toUpperCase()}
                            count={count}
                            onChange={() => set('language', code)}
                            primary={primary} />
                    ))}
            </Section>

            {/* Publication Year */}
            <Section title={t('catalog.filter_ui.pub_year')} badge={(cur.year_from || cur.year_to) ? 1 : 0}>
                <div className="flex gap-2 items-center mt-1">
                    <input type="number" placeholder={yearMin || 'From'}
                        value={cur.year_from || ''}
                        onChange={(e) => set('year_from', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-gray-400"
                        min="1800" max={new Date().getFullYear()} />
                    <span className="text-gray-400 shrink-0 text-xs">—</span>
                    <input type="number" placeholder={yearMax || 'To'}
                        value={cur.year_to || ''}
                        onChange={(e) => set('year_to', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-gray-400"
                        min="1800" max={new Date().getFullYear()} />
                </div>
                {(cur.year_from || cur.year_to) && (
                    <button onClick={() => onChange({ ...cur, year_from: undefined, year_to: undefined })}
                        className="text-xs mt-1 hover:underline" style={{ color: primary }}>
                        {t('catalog.filter_ui.clear_year')}
                    </button>
                )}
            </Section>
        </div>
    );
}

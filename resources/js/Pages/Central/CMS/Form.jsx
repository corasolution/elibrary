import { Head, Link, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Save, ArrowLeft } from 'lucide-react';

export default function CMSForm({ translation, sections }) {
    const { data, setData, post, put, processing, errors } = useForm({
        section: translation?.section || 'landing',
        key: translation?.key || '',
        en_value: translation?.en_value || '',
        km_value: translation?.km_value || '',
        description: translation?.description || '',
        is_published: translation?.is_published ?? true,
        change_note: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (translation) {
            put(route('central.cms.update', translation.id));
        } else {
            post(route('central.cms.store'));
        }
    };

    return (
        <CentralLayout>
            <Head title={translation ? 'Edit Translation' : 'Add Translation'} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {translation ? 'Edit Translation' : 'Add Translation'}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {translation ? `Editing: ${translation.section}.${translation.key}` : 'Create a new translation key'}
                        </p>
                    </div>

                    <Link
                        href={route('central.cms.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                    {/* Section & Key */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.section}
                                onChange={(e) => setData('section', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            >
                                {sections.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            {errors.section && <p className="mt-1 text-xs text-red-600">{errors.section}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Key <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.key}
                                onChange={(e) => setData('key', e.target.value)}
                                placeholder="hero_title"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                                required
                            />
                            {errors.key && <p className="mt-1 text-xs text-red-600">{errors.key}</p>}
                        </div>
                    </div>

                    {/* English Value */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            English Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={data.en_value}
                            onChange={(e) => setData('en_value', e.target.value)}
                            rows={4}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                        />
                        {errors.en_value && <p className="mt-1 text-xs text-red-600">{errors.en_value}</p>}
                    </div>

                    {/* Khmer Value */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Khmer Content
                        </label>
                        <textarea
                            value={data.km_value}
                            onChange={(e) => setData('km_value', e.target.value)}
                            rows={4}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Leave empty to translate later with AI"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Leave empty to use Gemini AI translation later
                        </p>
                        {errors.km_value && <p className="mt-1 text-xs text-red-600">{errors.km_value}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description / Context
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={2}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Optional: Add context to help with translation"
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>

                    {/* Change Note (for edits only) */}
                    {translation && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Change Note
                            </label>
                            <input
                                type="text"
                                value={data.change_note}
                                onChange={(e) => setData('change_note', e.target.value)}
                                placeholder="Optional: Describe what changed"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    )}

                    {/* Published Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={data.is_published}
                            onChange={(e) => setData('is_published', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="is_published" className="text-sm text-gray-700">
                            Publish this translation (will be exported to JSON files)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <Link
                            href={route('central.cms.index')}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : translation ? 'Update Translation' : 'Create Translation'}
                        </button>
                    </div>
                </form>
            </div>
        </CentralLayout>
    );
}

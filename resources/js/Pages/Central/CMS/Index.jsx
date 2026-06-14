import { Head, Link, router } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { useState } from 'react';
import {
    FileText, Plus, Edit, Trash2, Upload, Download,
    Languages, CheckCircle, Clock, Search, Eye, EyeOff
} from 'lucide-react';

export default function CMSIndex({ translations, sections, sectionCounts = {}, filters, stats }) {
    const [search, setSearch] = useState(filters?.q || '');
    const [section, setSection] = useState(filters?.section || '');
    const [status, setStatus] = useState(filters?.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('central.cms.index'), { q: search, section, status }, {
            preserveState: true,
            replace: true,
        });
    };

    // Jump straight to a section group (keeps current search/status).
    const goToSection = (s) => {
        setSection(s);
        router.get(route('central.cms.index'), { q: search, section: s, status }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTranslate = (id) => {
        if (confirm('Translate this key using Gemini API?')) {
            router.post(route('central.cms.translate', id));
        }
    };

    const handleBatchTranslate = () => {
        if (confirm(`Translate all pending keys${section ? ` in section "${section}"` : ''}?`)) {
            router.post(route('central.cms.batch-translate'), { section });
        }
    };

    const handlePublish = () => {
        if (confirm('Publish all translations to JSON files? Frontend rebuild required after.')) {
            router.post(route('central.cms.publish'));
        }
    };

    const handleToggleActive = (id, isActive) => {
        const action = isActive ? 'hide' : 'show';
        if (confirm(`Are you sure you want to ${action} this translation from the public?`)) {
            router.post(route('central.cms.toggle-active', id));
        }
    };

    const handleDelete = (id, key) => {
        if (confirm(`Delete translation key "${key}"?`)) {
            router.delete(route('central.cms.destroy', id));
        }
    };

    return (
        <CentralLayout>
            <Head title="Content Management System" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Landing Page CMS</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage translations for all landing pages
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.post(route('central.cms.import'))}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                        >
                            <Upload className="w-4 h-4" />
                            Import from Files
                        </button>

                        <button
                            onClick={handlePublish}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        >
                            <Download className="w-4 h-4" />
                            Publish to Files
                        </button>

                        <Link
                            href={route('central.cms.create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Add Translation
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-sm text-gray-600">Total Keys</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                        <div className="text-sm text-gray-600">Active (Visible)</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-3xl font-bold text-gray-600">{stats.inactive}</div>
                        <div className="text-sm text-gray-600">Inactive (Hidden)</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-3xl font-bold text-purple-600">{stats.published}</div>
                        <div className="text-sm text-gray-600">Published</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-3xl font-bold text-orange-600">{stats.needs_translation}</div>
                        <div className="text-sm text-gray-600">Needs Translation</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by key or content..."
                                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section
                            </label>
                            <select
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">All Sections</option>
                                {sections.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">All Status</option>
                                <option value="needs_translation">Needs Translation</option>
                                <option value="auto">Auto-translated</option>
                                <option value="manual">Manual</option>
                                <option value="approved">Approved</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            Filter
                        </button>

                        {stats.needs_translation > 0 && (
                            <button
                                type="button"
                                onClick={handleBatchTranslate}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                            >
                                <Languages className="w-4 h-4" />
                                Batch Translate ({stats.needs_translation})
                            </button>
                        )}
                    </form>
                </div>

                {/* Group navigation — jump to a section, with counts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-6">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Groups</span>
                        <button
                            onClick={() => goToSection('')}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                !section
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                            All <span className="opacity-70">{stats?.total ?? 0}</span>
                        </button>
                        {sections.map(s => (
                            <button
                                key={s}
                                onClick={() => goToSection(s)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                    section === s
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                {s} <span className="opacity-70">{sectionCounts?.[s] ?? 0}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">English</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khmer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {translations.data.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {t.section}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{t.key}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{t.en_value}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                        {t.km_value || <span className="text-orange-500">—</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {t.translation_status === 'auto' && (
                                            <span className="inline-flex items-center gap-1 text-xs text-purple-700">
                                                <Languages className="w-3 h-3" /> Auto
                                            </span>
                                        )}
                                        {t.translation_status === 'manual' && (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                                <CheckCircle className="w-3 h-3" /> Manual
                                            </span>
                                        )}
                                        {t.translation_status === 'pending' && (
                                            <span className="inline-flex items-center gap-1 text-xs text-orange-700">
                                                <Clock className="w-3 h-3" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {t.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                <Eye className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                                <EyeOff className="w-3 h-3" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm flex gap-2 justify-end">
                                        {!t.km_value && (
                                            <button
                                                onClick={() => handleTranslate(t.id)}
                                                className="text-purple-600 hover:text-purple-800"
                                                title="Translate with AI"
                                            >
                                                <Languages className="w-4 h-4" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleToggleActive(t.id, t.is_active)}
                                            className={t.is_active ? "text-gray-600 hover:text-gray-800" : "text-green-600 hover:text-green-800"}
                                            title={t.is_active ? "Hide from public" : "Show to public"}
                                        >
                                            {t.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>

                                        <Link
                                            href={route('central.cms.edit', t.id)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(t.id, t.key)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {translations.links && (
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {translations.from} to {translations.to} of {translations.total} results
                            </div>
                            <div className="flex gap-1">
                                {translations.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm border rounded ${
                                            link.active
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CentralLayout>
    );
}

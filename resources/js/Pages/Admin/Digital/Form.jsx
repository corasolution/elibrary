import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const ACCESS_TYPES = ['open_access','registered','restricted','embargo'];
const FORMATS = ['pdf','epub','mp3','mp4','docx','xlsx','csv','zip','other'];

export default function DigitalForm({ resource, biblios = [] }) {
    const isEdit = !!resource;
    const { data, setData, post, put, processing, errors } = useForm({
        biblio_id:    resource?.biblio_id ?? '',
        format:       resource?.format ?? 'pdf',
        access_type:  resource?.access_type ?? 'restricted',
        embargo_until:resource?.embargo_until ?? '',
        version:      resource?.version ?? '1.0',
        url:          resource?.url ?? '',
        is_external:  resource?.is_external ?? false,
        notes:        '',
        file:         null,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('admin.digital.update', resource.id), { forceFormData: true, _method: 'PUT' });
        } else {
            post(route('admin.digital.store'), { forceFormData: true });
        }
    };

    return (
        <AdminLayout title={isEdit ? 'Edit Digital Resource' : 'New Digital Resource'}>
            <div className="max-w-2xl">
                <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                    <Field label="Bibliographic Record" error={errors.biblio_id} required>
                        <select value={data.biblio_id} onChange={e => setData('biblio_id', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">— Select a title —</option>
                            {biblios.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                        </select>
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Format" error={errors.format}>
                            <select value={data.format} onChange={e => setData('format', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {FORMATS.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                            </select>
                        </Field>
                        <Field label="Access Type" error={errors.access_type}>
                            <select value={data.access_type} onChange={e => setData('access_type', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {ACCESS_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                            </select>
                        </Field>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Version">
                            <input type="text" value={data.version} onChange={e => setData('version', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </Field>
                        {data.access_type === 'embargo' && (
                            <Field label="Embargo Until" error={errors.embargo_until}>
                                <input type="date" value={data.embargo_until} onChange={e => setData('embargo_until', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </Field>
                        )}
                    </div>

                    <Field label="External URL (leave blank to upload file)" error={errors.url}>
                        <input type="url" value={data.url} onChange={e => { setData('url', e.target.value); if (e.target.value) setData('is_external', true); }}
                            placeholder="https://..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </Field>

                    {!data.url && (
                        <Field label="Upload File" error={errors.file}>
                            <input type="file" onChange={e => setData('file', e.target.files[0])}
                                className="block text-sm text-gray-600" />
                            <p className="text-xs text-gray-400 mt-1">PDF, ePub, MP3, MP4, etc.</p>
                        </Field>
                    )}

                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" disabled={processing}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                            {processing ? 'Saving…' : (isEdit ? 'Update Resource' : 'Create Resource')}
                        </button>
                        <button type="button" onClick={() => router.get(route('admin.digital.index'))}
                            className="px-5 py-2 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

function Field({ label, children, error, required }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, Link } from '@inertiajs/react';
import { ChevronRight, Loader2, Upload, X, User, Edit, QrCode, RefreshCw, Printer, Download } from 'lucide-react';
import { useState } from 'react';
import { compressImage, fileToBase64 } from '@/utils/imageCompression';
import PhotoEditor from '@/Components/PhotoEditor';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

export default function PatronForm({ patron, categories }) {
    const isEdit = !!patron;
    const [photoPreview, setPhotoPreview] = useState(patron?.photo_url || null);
    const [compressing, setCompressing] = useState(false);
    const [photoSize, setPhotoSize] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editorImage, setEditorImage] = useState(null);

    const { data, setData, post, put, processing, errors } = useForm({
        first_name:          patron?.first_name         ?? '',
        last_name:           patron?.last_name          ?? '',
        email:               patron?.email              ?? '',
        phone:               patron?.phone              ?? '',
        gender:              patron?.gender             ?? '',
        date_of_birth:       patron?.date_of_birth      ?? '',
        address:             patron?.address            ?? '',
        city:                patron?.city               ?? '',
        patron_category_id:  patron?.patron_category_id ?? '',
        status:              patron?.status             ?? 'active',
        membership_expiry:   patron?.membership_expiry  ?? '',
        notes:               patron?.notes              ?? '',
        photo:               null,  // Will hold base64 string
    });

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        try {
            // Convert to base64 for editor
            const base64 = await fileToBase64(file);
            setEditorImage(base64);
            setShowEditor(true);
        } catch (error) {
            console.error('Error loading image:', error);
            alert('Failed to load image. Please try another photo.');
        }
    };

    const handleEditorSave = async (editedImageBase64) => {
        try {
            setCompressing(true);
            setShowEditor(false);

            // Convert base64 back to file for compression
            const response = await fetch(editedImageBase64);
            const blob = await response.blob();
            const file = new File([blob], 'edited-photo.jpg', { type: 'image/jpeg' });

            // Compress the edited image
            const compressedFile = await compressImage(file, 30); // 30KB max
            const sizeKB = (compressedFile.size / 1024).toFixed(1);
            setPhotoSize(sizeKB);

            // Convert to base64
            const base64 = await fileToBase64(compressedFile);

            // Update form data and preview
            setData('photo', base64);
            setPhotoPreview(base64);
        } catch (error) {
            console.error('Error processing edited image:', error);
            alert('Failed to process edited image. Please try again.');
        } finally {
            setCompressing(false);
        }
    };

    const handleEditorCancel = () => {
        setShowEditor(false);
        setEditorImage(null);
    };

    const editExistingPhoto = () => {
        if (photoPreview) {
            setEditorImage(photoPreview);
            setShowEditor(true);
        }
    };

    const removePhoto = () => {
        setData('photo', null);
        setPhotoPreview(null);
        setPhotoSize(null);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.patrons.update', patron.id));
        } else {
            post(route('admin.patrons.store'));
        }
    };

    return (
        <AdminLayout title={isEdit ? 'Edit Patron' : 'New Patron'}>
            {/* Photo Editor Modal */}
            {showEditor && editorImage && (
                <PhotoEditor
                    imageUrl={editorImage}
                    onSave={handleEditorSave}
                    onCancel={handleEditorCancel}
                />
            )}

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <Link href={route('admin.patrons.index')} className="hover:text-gray-700">Patrons</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium">
                    {isEdit ? `${patron.first_name} ${patron.last_name}` : 'New Patron'}
                </span>
            </nav>

            <form onSubmit={submit} className="space-y-4 max-w-5xl">
                {/* Personal Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>

                    {/* Photo Upload */}
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {/* Photo Preview */}
                        <div className="flex-shrink-0">
                            {photoPreview ? (
                                <div className="relative group">
                                    <img
                                        src={photoPreview}
                                        alt="Patron photo"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={editExistingPhoto}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Edit photo"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={removePhoto}
                                        className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove photo"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <User className="w-10 h-10 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex-1">
                            <label className="block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    disabled={compressing}
                                    className="hidden"
                                />
                                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50">
                                    {compressing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Compressing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                                        </>
                                    )}
                                </div>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">
                                JPG, PNG or GIF. Auto-compressed to under 30KB.
                                {photoSize && <span className="ml-1 text-green-600 font-medium">Current: {photoSize}KB</span>}
                            </p>
                            {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="First Name *" error={errors.first_name}>
                            <input value={data.first_name} onChange={e => setData('first_name', e.target.value)}
                                className="input" required />
                        </Field>
                        <Field label="Last Name" error={errors.last_name}>
                            <input value={data.last_name} onChange={e => setData('last_name', e.target.value)}
                                className="input" />
                        </Field>
                        <Field label="Email" error={errors.email}>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                className="input" />
                        </Field>
                        <Field label="Phone" error={errors.phone}>
                            <input value={data.phone} onChange={e => setData('phone', e.target.value)}
                                className="input" placeholder="+855 xx xxx xxx" />
                        </Field>
                        <Field label="Gender">
                            <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="input">
                                <option value="">— Select —</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </Field>
                        <Field label="Date of Birth">
                            <input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)}
                                className="input" />
                        </Field>
                    </div>

                    <Field label="Address">
                        <input value={data.address} onChange={e => setData('address', e.target.value)}
                            className="input" placeholder="Street address" />
                    </Field>

                    <Field label="City">
                        <input value={data.city} onChange={e => setData('city', e.target.value)}
                            className="input" placeholder="Phnom Penh" />
                    </Field>
                </div>

                {/* Membership */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700">Membership</h2>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <Field label="Category" error={errors.patron_category_id}>
                            <select value={data.patron_category_id} onChange={e => setData('patron_category_id', e.target.value)}
                                className="input">
                                <option value="">— Select —</option>
                                {categories?.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Status" error={errors.status}>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className="input">
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="suspended">Suspended</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </Field>
                        <Field label="Membership Expiry">
                            <input type="date" value={data.membership_expiry}
                                onChange={e => setData('membership_expiry', e.target.value)}
                                className="input" />
                        </Field>
                    </div>

                    <Field label="Notes">
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                            className="input" rows={3} placeholder="Internal staff notes" />
                    </Field>
                </div>

                {/* Library Card QR — edit mode only */}
                {isEdit && <PatronQrCard patron={patron} />}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Link href={route('admin.patrons.index')}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">
                        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEdit ? 'Update Patron' : 'Create Patron'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

function PatronQrCard({ patron }) {
    const [qrToken, setQrToken] = useState(patron?.qr_token ?? null);
    const [regenerating, setRegenerating] = useState(false);

    const regenerate = () => {
        setRegenerating(true);
        fetch(route('admin.patrons.regenerate-qr', patron.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '',
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(r => r.json())
            .then(d => { if (d.qr_token) setQrToken(d.qr_token); })
            .catch(() => {})
            .finally(() => setRegenerating(false));
    };

    const downloadQr = () => {
        const canvas = document.querySelector('#admin-patron-qr canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `library-card-${patron.patron_number}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const printQr = () => {
        const canvas = document.querySelector('#admin-patron-qr canvas');
        if (!canvas) return;
        const w = window.open('', '_blank');
        w.document.write(`<html><body style="text-align:center;font-family:sans-serif;padding:20px">
            <h3>${patron.first_name} ${patron.last_name}</h3>
            <p style="font-size:12px;color:#666">${patron.patron_number}</p>
            <img src="${canvas.toDataURL('image/png')}" style="width:180px;height:180px" />
            <p style="font-size:11px;color:#999;margin-top:8px">Library Card</p>
            </body></html>`);
        w.document.close();
        w.focus();
        w.print();
        w.close();
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-semibold text-gray-700">Library Card QR</h2>
                </div>
                <button type="button" onClick={regenerate} disabled={regenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                    {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Regenerate QR
                </button>
            </div>

            {qrToken ? (
                <div className="flex items-start gap-6">
                    <div id="admin-patron-qr" className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm shrink-0">
                        <QRCode value={qrToken} size={140} level="H" includeMargin />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-800">{patron.first_name} {patron.last_name}</p>
                        <p className="text-xs text-gray-400 font-mono mb-4">{patron.patron_number}</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={downloadQr}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Download className="w-3 h-3" /> Download PNG
                            </button>
                            <button type="button" onClick={printQr}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Printer className="w-3 h-3" /> Print Card
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                            Patron scans this code at the login page to access their account without a password.
                            Regenerating invalidates the old code.
                        </p>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-400">No QR token yet. Click Regenerate to create one.</p>
            )}
        </div>
    );
}

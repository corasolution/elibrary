import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, Link } from '@inertiajs/react';
import { ChevronRight, Loader2 } from 'lucide-react';

export default function PatronForm({ patron, categories }) {
    const isEdit = !!patron;

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
    });

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
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <Link href={route('admin.patrons.index')} className="hover:text-gray-700">Patrons</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium">
                    {isEdit ? `${patron.first_name} ${patron.last_name}` : 'New Patron'}
                </span>
            </nav>

            <form onSubmit={submit} className="space-y-4 max-w-3xl">
                {/* Personal Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>

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

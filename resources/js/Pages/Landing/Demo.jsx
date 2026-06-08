import LandingLayout from '@/Layouts/LandingLayout';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircle, Loader2, BookOpen, ArrowRight } from 'lucide-react';

const LIBRARY_TYPES = ['School Library', 'Public Library', 'University Library', 'Government Archive', 'Corporate Library', 'Other'];
const PATRON_COUNTS = ['Under 100', '100–500', '500–2,000', '2,000–10,000', '10,000+'];

export default function Demo() {
    const [form, setForm]     = useState({ name: '', email: '', library: '', type: '', patrons: '', notes: '' });
    const [sent, setSent]     = useState(false);
    const [sending, setSending] = useState(false);

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        await new Promise(r => setTimeout(r, 900));
        setSent(true);
        setSending(false);
    };

    return (
        <LandingLayout>
            <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-16 items-start">
                {/* Left: why */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Request a Free Demo</h1>
                    <p className="text-gray-500 leading-relaxed mb-8">
                        See CoraLibrary in action with your own sample data. One of our library specialists
                        will walk you through the full system — cataloging, circulation, OPAC, and reports.
                    </p>
                    <ul className="space-y-3 mb-8">
                        {[
                            '30-minute personalised walkthrough',
                            'Live cataloging demonstration with ISBN lookup',
                            'Patron self-service OPAC tour',
                            'Q&A with a library systems specialist',
                            'Free trial setup if you proceed',
                        ].map(item => (
                            <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div className="p-5 bg-brand-50 rounded-xl border border-brand-100">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-5 h-5 text-brand-600" />
                            <span className="font-semibold text-brand-800">Try the Demo Library</span>
                        </div>
                        <p className="text-sm text-brand-700 mb-3">
                            Prefer to explore on your own? Browse our live demo library right now.
                        </p>
                        <Link href="/demo-library"
                            className="flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900">
                            Open Demo Library <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Right: form */}
                <div className="card p-6">
                    {sent ? (
                        <div className="text-center py-8">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Demo Requested!</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                We'll reach out within 1 business day to schedule your personalised demo.
                            </p>
                            <Link href="/demo-library"
                                className="btn-primary text-sm">
                                Explore Demo Library Now
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="field-label">Your Name *</label>
                                    <input value={form.name} onChange={e => set('name', e.target.value)}
                                        className="input" required />
                                </div>
                                <div>
                                    <label className="field-label">Email *</label>
                                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                                        className="input" required />
                                </div>
                            </div>
                            <div>
                                <label className="field-label">Library / Institution Name *</label>
                                <input value={form.library} onChange={e => set('library', e.target.value)}
                                    className="input" required />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="field-label">Library Type</label>
                                    <select value={form.type} onChange={e => set('type', e.target.value)} className="input">
                                        <option value="">— Select —</option>
                                        {LIBRARY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="field-label">Number of Patrons</label>
                                    <select value={form.patrons} onChange={e => set('patrons', e.target.value)} className="input">
                                        <option value="">— Select —</option>
                                        {PATRON_COUNTS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="field-label">Anything else?</label>
                                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                                    className="input" rows={3} placeholder="Current system, special requirements, etc." />
                            </div>
                            <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {sending ? 'Submitting…' : 'Request Demo'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </LandingLayout>
    );
}

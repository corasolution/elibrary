import LandingLayout from '@/Layouts/LandingLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

export default function Contact() {
    const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent]     = useState(false);
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        // In production, POST to /api/contact
        await new Promise(r => setTimeout(r, 800));
        setSent(true);
        setSending(false);
    };

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    return (
        <LandingLayout>
            <Head>
                <title>Contact Us | Alpha eLibrary Cambodia</title>
                <meta name="description" content="Get in touch with Alpha eLibrary. Based in Phnom Penh, Cambodia. Contact us for demos, enterprise plans, or support. We speak Khmer and English." head-key="description" />
                <meta property="og:title" content="Contact Us | Alpha eLibrary Cambodia" head-key="og:title" />
                <meta property="og:description" content="Based in Phnom Penh, Cambodia. Contact us for demos, enterprise plans, or support." head-key="og:description" />
            </Head>

            {/* Hero */}
            <section className="py-16 px-4 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
                <p className="text-gray-500 max-w-xl mx-auto">
                    Have a question, want a demo, or need enterprise pricing? We'd love to hear from you.
                </p>
            </section>

            <section className="max-w-5xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-12">
                {/* Contact info */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                    <div className="space-y-5">
                        <ContactItem icon={Mail} label="Email" value="hello@corasoft.io" />
                        <ContactItem icon={Phone} label="Phone / Telegram" value="+855 12 xxx xxx" />
                        <ContactItem icon={MapPin} label="Address" value="Phnom Penh, Cambodia" />
                    </div>

                    <div className="mt-8 p-5 bg-brand-50 rounded-xl border border-brand-100">
                        <h3 className="font-semibold text-brand-800 mb-2">Enterprise & Government</h3>
                        <p className="text-sm text-brand-700">
                            Need a custom deployment, data residency requirements, or dedicated support?
                            Contact us for an enterprise quote.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="card p-6">
                    {sent ? (
                        <div className="text-center py-8">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Message sent!</h3>
                            <p className="text-gray-500 text-sm">We'll get back to you within 1 business day.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="field-label">Name</label>
                                    <input value={form.name} onChange={e => set('name', e.target.value)}
                                        className="input" required placeholder="Your name" />
                                </div>
                                <div>
                                    <label className="field-label">Email</label>
                                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                                        className="input" required placeholder="you@example.com" />
                                </div>
                            </div>
                            <div>
                                <label className="field-label">Subject</label>
                                <select value={form.subject} onChange={e => set('subject', e.target.value)}
                                    className="input" required>
                                    <option value="">— Select a topic —</option>
                                    <option value="demo">Request a Demo</option>
                                    <option value="pricing">Pricing / Plans</option>
                                    <option value="enterprise">Enterprise Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Message</label>
                                <textarea value={form.message} onChange={e => set('message', e.target.value)}
                                    className="input" rows={5} required placeholder="Tell us about your library…" />
                            </div>
                            <button type="submit" disabled={sending}
                                className="btn-primary w-full flex items-center justify-center gap-2">
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {sending ? 'Sending…' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </LandingLayout>
    );
}

function ContactItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-brand-600" />
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-gray-800 font-medium">{value}</p>
            </div>
        </div>
    );
}

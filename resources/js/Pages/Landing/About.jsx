import LandingLayout from '@/Layouts/LandingLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Globe, Users, Award } from 'lucide-react';

const VALUES = [
    { icon: BookOpen, title: 'Open Knowledge', desc: 'We believe every library — from a village school to a national institution — deserves modern, affordable software.' },
    { icon: Globe, title: 'Built for Southeast Asia', desc: 'Khmer language, local payment methods, regional data sovereignty, and Southeast Asian library standards.' },
    { icon: Users, title: 'Community Driven', desc: 'We work closely with librarians, educators, and government institutions to shape every feature.' },
    { icon: Award, title: 'AI-Native', desc: "Built from day one with AI assistance — faster iteration, smarter catalog tools, and better patron experiences." },
];

export default function About() {
    return (
        <LandingLayout>
            <Head>
                <title>About — Built in Cambodia for Southeast Asia | Alpha eLibrary</title>
                <meta name="description" content="Alpha eLibrary is built by Corasoft, Cambodia's AI-native software agency in Phnom Penh. We bring modern library technology to schools, universities and NGOs across Southeast Asia." head-key="description" />
                <meta property="og:title" content="About Alpha eLibrary — Built in Cambodia for Southeast Asia" head-key="og:title" />
                <meta property="og:description" content="Built by Corasoft in Phnom Penh, Cambodia. Modern library OS for Southeast Asia." head-key="og:description" />
            </Head>

            {/* Hero */}
            <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white py-20 px-4 text-center">
                <h1 className="text-4xl font-bold mb-4">About CoraLibrary</h1>
                <p className="text-brand-200 text-lg max-w-2xl mx-auto">
                    Built by Corasoft — Cambodia's AI-native software agency — to bring the modern library operating system to Southeast Asia.
                </p>
            </section>

            {/* Story */}
            <section className="max-w-3xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                    <p>
                        CoraLibrary was born from a simple observation: the best library management systems in the world —
                        Koha, Evergreen, DSpace — are powerful but complex to deploy and maintain, especially for
                        under-resourced libraries in the developing world.
                    </p>
                    <p>
                        Corasoft set out to build a cloud-native, SaaS alternative that any library — a school in Siem Reap,
                        a university in Phnom Penh, a public library in Bangkok — could be up and running within minutes,
                        with no server management and no upfront cost.
                    </p>
                    <p>
                        CoraLibrary is built on Laravel, React, and FilamentPHP — modern, battle-tested technologies —
                        with first-class support for the Khmer language, Cambodian payment methods, and the metadata
                        standards (Dublin Core, MARC21, DDC, LCC) used by professional librarians worldwide.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">What We Stand For</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {VALUES.map(v => {
                            const Icon = v.icon;
                            return (
                                <div key={v.title} className="card p-6 flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                                        <Icon className="w-6 h-6 text-brand-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team note */}
            <section className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Made in Cambodia 🇰🇭</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Corasoft is a software agency based in Phnom Penh, Cambodia. We build AI-assisted software
                    for education, government, and enterprise clients across Southeast Asia.
                </p>
                <Link href="/contact"
                    className="bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 inline-block">
                    Get in Touch
                </Link>
            </section>
        </LandingLayout>
    );
}

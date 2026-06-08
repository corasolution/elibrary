import LandingLayout from '@/Layouts/LandingLayout';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    BookMarked, RefreshCw, BookOpen, Users, BarChart2, Globe,
    Search, Tag, Barcode, Bell, FileText, Shield, CheckCircle,
} from 'lucide-react';

const COLOR_MAP = {
    blue:   'bg-blue-100 text-blue-600',
    green:  'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber:  'bg-amber-100 text-amber-600',
    teal:   'bg-teal-100 text-teal-600',
    red:    'bg-red-100 text-red-600',
};

export default function Features() {
    const { t } = useTranslation();

    const FEATURE_SECTIONS = [
        {
            title: t('features.cataloging_title'),
            icon: BookMarked,
            color: 'blue',
            desc: t('features.cataloging_desc'),
            items: [
                t('features.cataloging_item1'),
                t('features.cataloging_item2'),
                t('features.cataloging_item3'),
                t('features.cataloging_item4'),
                t('features.cataloging_item5'),
                t('features.cataloging_item6'),
            ],
        },
        {
            title: t('features.circulation_title'),
            icon: RefreshCw,
            color: 'green',
            desc: t('features.circulation_desc'),
            items: [
                t('features.circulation_item1'),
                t('features.circulation_item2'),
                t('features.circulation_item3'),
                t('features.circulation_item4'),
                t('features.circulation_item5'),
                t('features.circulation_item6'),
            ],
        },
        {
            title: t('features.elibrary_title'),
            icon: BookOpen,
            color: 'purple',
            desc: t('features.elibrary_desc'),
            items: [
                t('features.elibrary_item1'),
                t('features.elibrary_item2'),
                t('features.elibrary_item3'),
                t('features.elibrary_item4'),
                t('features.elibrary_item5'),
                t('features.elibrary_item6'),
            ],
        },
        {
            title: t('features.opac_title'),
            icon: Search,
            color: 'amber',
            desc: t('features.opac_desc'),
            items: [
                t('features.opac_item1'),
                t('features.opac_item2'),
                t('features.opac_item3'),
                t('features.opac_item4'),
                t('features.opac_item5'),
                t('features.opac_item6'),
            ],
        },
        {
            title: t('features.patrons_title'),
            icon: Users,
            color: 'teal',
            desc: t('features.patrons_desc'),
            items: [
                t('features.patrons_item1'),
                t('features.patrons_item2'),
                t('features.patrons_item3'),
                t('features.patrons_item4'),
                t('features.patrons_item5'),
                t('features.patrons_item6'),
            ],
        },
        {
            title: t('features.reports_title'),
            icon: BarChart2,
            color: 'red',
            desc: t('features.reports_desc'),
            items: [
                t('features.reports_item1'),
                t('features.reports_item2'),
                t('features.reports_item3'),
                t('features.reports_item4'),
                t('features.reports_item5'),
                t('features.reports_item6'),
            ],
        },
    ];
    return (
        <LandingLayout>
            {/* Hero */}
            <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('features.hero_title')}</h1>
                <p className="text-brand-200 text-lg max-w-2xl mx-auto mb-8">
                    {t('features.hero_subtitle')}
                </p>
                <Link href="/demo" className="btn-primary bg-white text-brand-800 hover:bg-brand-50 px-8 py-3 text-base">
                    {t('features.cta_demo')}
                </Link>
            </section>

            {/* Feature sections */}
            <section className="max-w-6xl mx-auto px-4 py-20">
                <div className="space-y-20">
                    {FEATURE_SECTIONS.map((section, i) => {
                        const Icon = section.icon;
                        const isEven = i % 2 === 0;
                        return (
                            <div key={section.title}
                                className={`flex flex-col md:flex-row gap-12 items-start ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                                <div className="md:w-1/2">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${COLOR_MAP[section.color]}`}>
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
                                    <p className="text-gray-600 leading-relaxed mb-6">{section.desc}</p>
                                    <ul className="space-y-2.5">
                                        {section.items.map(item => (
                                            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="md:w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-64 flex items-center justify-center">
                                    <Icon className="w-24 h-24 text-gray-300" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-brand-700 text-white py-16 px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">{t('features.cta_final_title')}</h2>
                <p className="text-brand-200 mb-8">{t('features.cta_final_subtitle')}</p>
                <div className="flex gap-4 justify-center">
                    <Link href="/demo" className="bg-white text-brand-700 px-8 py-3 rounded-xl font-semibold hover:bg-brand-50">
                        {t('features.cta_demo')}
                    </Link>
                    <Link href="/pricing" className="border border-brand-400 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-600">
                        {t('features.cta_see_pricing')}
                    </Link>
                </div>
            </section>
        </LandingLayout>
    );
}

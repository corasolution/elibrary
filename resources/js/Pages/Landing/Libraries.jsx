import LandingLayout from '@/Layouts/LandingLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Library } from 'lucide-react';

export default function Libraries({ libraries = [] }) {
    const { t } = useTranslation();

    return (
        <LandingLayout>
            <Head>
                <title>Libraries Using Alpha eLibrary — Cambodia &amp; Southeast Asia</title>
                <meta name="description" content="Browse the growing network of schools, universities, NGOs and government libraries using Alpha eLibrary across Cambodia and Southeast Asia." head-key="description" />
                <meta property="og:title" content="Libraries Using Alpha eLibrary — Cambodia & Southeast Asia" head-key="og:title" />
                <meta property="og:description" content="Growing network of libraries across Cambodia and Southeast Asia powered by Alpha eLibrary." head-key="og:description" />
            </Head>

            <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        {t('libraries.title', 'Our Libraries')}
                    </h1>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                        {t('libraries.subtitle', 'Explore every library running on our platform')}
                    </p>
                </div>
            </section>

            <section className="bg-white py-16 px-6 min-h-[40vh]">
                <div className="max-w-7xl mx-auto">
                    {libraries.length === 0 ? (
                        <div className="text-center py-20">
                            <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">{t('libraries.empty', 'No libraries yet — be the first to register!')}</p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
                            >
                                {t('home.cta_start_trial', 'Start free trial')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {libraries.map(lib => (
                                <Link
                                    key={lib.slug}
                                    href={`/${lib.slug}`}
                                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all group"
                                >
                                    {lib.logo_url ? (
                                        <img
                                            src={lib.logo_url}
                                            alt={lib.name}
                                            className="w-16 h-16 rounded-2xl object-contain bg-white border border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                                            {lib.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm font-semibold text-gray-800 text-center leading-tight group-hover:text-blue-700">
                                        {lib.name}
                                    </span>
                                    <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        {t('libraries.visit', 'Visit library')}
                                        <ArrowRight className="w-3 h-3" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </LandingLayout>
    );
}

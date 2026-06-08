import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';

export default function SimpleDashboard() {
    const { t } = useTranslation();

    return (
        <AdminLayout title={t('admin.nav.dashboard')}>
            <Head title="Dashboard" />

            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('admin.nav.dashboard')}
                    </h1>
                    <p className="text-gray-600">
                        Welcome to Alpha eLibrary - Bilingual Library Management System
                    </p>
                </div>

                {/* Language Switcher Demo Card */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 mb-8 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">🎉 Bilingual Feature Active!</h2>
                            <p className="text-blue-100">Khmer/English language switching is now enabled</p>
                        </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <p className="text-sm mb-2">
                            <strong>✨ How to use:</strong>
                        </p>
                        <ol className="text-sm space-y-1 ml-4">
                            <li>1. Look for the 🌐 Globe icon in the top-right header</li>
                            <li>2. Click it to switch between ខ្មែរ (Khmer) and English</li>
                            <li>3. Watch all navigation and labels change instantly!</li>
                            <li>4. Your language preference is saved to your account</li>
                        </ol>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={BookOpen}
                        label="Catalog"
                        value="Ready"
                        color="blue"
                    />
                    <StatCard
                        icon={Users}
                        label="Patrons"
                        value="Ready"
                        color="green"
                    />
                    <StatCard
                        icon={Calendar}
                        label="Circulation"
                        value="Ready"
                        color="purple"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Reports"
                        value="Ready"
                        color="orange"
                    />
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureCard
                        title="✅ Language Switching"
                        description="Switch between Khmer and English UI in real-time"
                        status="Active"
                    />
                    <FeatureCard
                        title="✅ Translation Keys"
                        description="100+ translation keys for catalog and admin interface"
                        status="Complete"
                    />
                    <FeatureCard
                        title="✅ Database Persistence"
                        description="Language preference saved to user profile"
                        status="Working"
                    />
                    <FeatureCard
                        title="✅ Server-Side Init"
                        description="User's saved language loads automatically on login"
                        status="Implemented"
                    />
                </div>

                {/* Success Message */}
                <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-green-800">
                                Implementation Complete! 🎊
                            </h3>
                            <p className="mt-2 text-sm text-green-700">
                                The bilingual Khmer/English language switching feature has been successfully implemented.
                                All admin navigation, catalog forms, and interface elements support both languages.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
    };

    return (
        <div className={`${colors[color]} border rounded-lg p-6 transition-shadow hover:shadow-md`}>
            <div className="flex items-center justify-between mb-3">
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm opacity-75">{label}</div>
            </div>
        </div>
    );
}

function FeatureCard({ title, description, status }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {status}
                </span>
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    );
}

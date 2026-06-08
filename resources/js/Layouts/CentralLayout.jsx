import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Building2,
    Users,
    Menu,
    X,
    LogOut,
    ChevronDown,
    LayoutDashboard,
    Settings,
    UserCog,
    Shield,
    Database,
    Home,
    Crown,
    DollarSign,
    FileText
} from 'lucide-react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function CentralLayout({ children }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Different navigation for Partners vs Super Admins
    const navigation = [];

    // Partners and Sales Agents see Partner Portal navigation
    if (auth?.user?.role === 'partner' || auth?.user?.role === 'sales_agent') {
        navigation.push({
            name: 'Dashboard',
            href: route('central.partner-portal.dashboard'),
            icon: Home,
            current: route().current('central.partner-portal.*')
        });

        navigation.push({
            name: 'My Libraries',
            href: route('central.tenants.index'),
            icon: Building2,
            current: route().current('central.tenants.*')
        });
    }

    // Super Admins see full admin navigation
    if (auth?.user?.is_super_admin) {
        navigation.push({
            name: 'Libraries',
            href: route('central.tenants.index'),
            icon: Building2,
            current: route().current('central.tenants.*')
        });
        navigation.push({
            name: 'Partners',
            href: route('central.partners.index'),
            icon: Users,
            current: route().current('central.partners.*')
        });

        // Add Plans menu for super admins
        navigation.push({
            name: 'Plans',
            href: route('central.plans.index'),
            icon: Crown,
            current: route().current('central.plans.*')
        });

        // Add Payments menu for super admins
        navigation.push({
            name: 'Payments',
            href: route('central.payments.index'),
            icon: DollarSign,
            current: route().current('central.payments.*')
        });

        // Add Team Members menu for super admins
        navigation.push({
            name: 'Team Members',
            href: route('central.team.index'),
            icon: UserCog,
            current: route().current('central.team.*')
        });

        // Add Roles & Permissions for super admins
        navigation.push({
            name: 'Roles & Permissions',
            href: route('central.roles.index'),
            icon: Shield,
            current: route().current('central.roles.*')
        });

        // Add CMS for super admins
        navigation.push({
            name: 'CMS',
            href: route('central.cms.index'),
            icon: FileText,
            current: route().current('central.cms.*')
        });

        // Add Settings menu items for super admins
        navigation.push({
            name: 'AI Settings',
            href: route('central.settings.ai'),
            icon: Settings,
            current: route().current('central.settings.ai*')
        });

        navigation.push({
            name: 'Storage',
            href: route('central.settings.storage'),
            icon: Database,
            current: route().current('central.settings.storage*')
        });

        navigation.push({
            name: 'General Settings',
            href: route('central.settings.general'),
            icon: Settings,
            current: route().current('central.settings.general*')
        });
    }

    const handleLogout = () => {
        router.post(route('central.logout'));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">Central Admin</div>
                            <div className="text-xs text-gray-500">Platform</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${item.current
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User info at bottom */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white font-medium">
                            {auth?.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                                {auth?.user?.name}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                                {auth?.user?.role?.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-2 lg:hidden">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">Central Admin</span>
                        </div>

                        <div className="hidden lg:block">
                            {/* Breadcrumbs or page title could go here */}
                        </div>

                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            {/* User badge */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {auth?.user?.is_super_admin ? '⭐ Super Admin' : '🤝 Partner'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mx-4 sm:mx-6 mt-4">
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="mx-4 sm:mx-6 mt-4">
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{flash.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page content */}
                <main className="p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

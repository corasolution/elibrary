import { Link, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard, BookOpen, RefreshCw, Users, ShoppingCart,
    Newspaper, BarChart2, Settings, ChevronDown, ChevronRight,
    Menu, X, LogOut, Bell, Boxes, BookMarked, Building2, CreditCard,
} from 'lucide-react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function AdminLayout({ children, title }) {
    const { auth, tenant, flash, url } = usePage().props;
    const { t } = useTranslation();

    const NAV = [
        {
            group: 'Catalog',
            icon: BookOpen,
            items: [
                { label: 'Bibliographic Records', href: 'admin.catalog.index' },
                { label: 'Physical Items', href: 'admin.items.index' },
                { label: 'Digital Resources', href: 'admin.digital.index' },
            ],
        },
        {
            group: 'Circulation',
            icon: RefreshCw,
            items: [
                { label: 'Quick Checkout', href: 'admin.circulation.quick-checkout' },
                { label: 'Active Loans', href: 'admin.loans.index' },
                { label: 'Overdue Items', href: 'admin.loans.overdue' },
                { label: 'Reservations', href: 'admin.reservations.index' },
                { label: 'Fines', href: 'admin.fines.index' },
            ],
        },
        { label: 'Patrons', icon: Users, href: 'admin.patrons.index' },
        {
            group: 'Acquisitions',
            icon: ShoppingCart,
            items: [
                { label: 'Orders', href: 'admin.acquisitions.index' },
            ],
        },
        {
            group: 'Serials',
            icon: Newspaper,
            items: [
                { label: 'Subscriptions', href: 'admin.serials.index' },
            ],
        },
        {
            group: 'Reports',
            icon: BarChart2,
            items: [
                { label: 'Circulation', href: 'admin.reports.circulation' },
                { label: 'Collection', href: 'admin.reports.collection' },
                { label: 'Digital Usage', href: 'admin.reports.digital' },
                { label: 'Overdue', href: 'admin.reports.overdue' },
            ],
        },
        {
            group: 'Settings',
            icon: Settings,
            items: [
                { label: 'General', href: 'admin.settings' },
                { label: 'Theme', href: 'admin.settings.theme.index' },
                { label: 'Storage', href: 'admin.settings.storage.index' },
                { label: 'Collections & Locations', href: 'admin.collections-locations.index' },
                { label: 'Patron Categories', href: 'admin.patron-categories.index' },
            ],
        },
    ];

    const SUPER_ADMIN_NAV = [
        { label: 'Tenants', icon: Building2, href: 'admin.tenants.index' },
        { label: 'Plans',   icon: CreditCard, href: 'admin.plans.index' },
    ];
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navRef = useRef(null);
    const [openGroups, setOpenGroups] = useState(() => {
        const defaults = {};
        NAV.forEach(n => { defaults[n.group] = true; });
        return defaults;
    });

    const toggleGroup = (group) => {
        setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const logout = () => router.post(route('admin.logout'));

    // Scroll active menu item into view on navigation/refresh
    useEffect(() => {
        const timer = setTimeout(() => {
            if (navRef.current) {
                const activeItem = navRef.current.querySelector('[data-active="true"]');
                if (activeItem) {
                    activeItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [url]);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col
                transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:static lg:translate-x-0 lg:flex
            `}>
                {/* Brand */}
                <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-700/60 flex-shrink-0">
                    <BookMarked className="w-6 h-6 text-blue-400" />
                    <span className="font-semibold text-sm leading-tight">
                        {tenant?.name ?? 'Alpha eLibrary'}
                        <span className="block text-xs font-normal text-gray-400">Staff Panel</span>
                    </span>
                    <button
                        className="ml-auto lg:hidden text-gray-400 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav ref={navRef} className="flex-1 overflow-y-auto py-4 px-2">
                    {/* Dashboard */}
                    <Link
                        href={route('admin.dashboard')}
                        data-active={url === route('admin.dashboard')}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-1 ${
                            url === route('admin.dashboard')
                                ? 'bg-blue-600/20 text-blue-300 font-medium'
                                : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                        Dashboard
                    </Link>

                    {NAV.map((entry) => {
                        const Icon = entry.icon;
                        // Flat direct link (no sub-items)
                        if (entry.href) {
                            return (
                                <NavItem
                                    key={entry.href}
                                    href={entry.href}
                                    label={entry.label}
                                    icon={Icon}
                                    flat
                                />
                            );
                        }
                        // Expandable group
                        const { group, items } = entry;
                        return (
                            <div key={group} className="mb-1">
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700/40"
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="flex-1 text-left font-medium">{group}</span>
                                    {openGroups[group]
                                        ? <ChevronDown className="w-3.5 h-3.5" />
                                        : <ChevronRight className="w-3.5 h-3.5" />
                                    }
                                </button>
                                {openGroups[group] && (
                                    <div className="ml-4 pl-3 border-l border-gray-700/50 mt-0.5 space-y-0.5">
                                        {items.map(item => (
                                            <NavItem key={item.href} href={item.href} label={item.label} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Super Admin Section */}
                    {auth?.user?.roles?.includes('super_admin') && (
                        <>
                            <div className="mx-2 my-3 border-t border-gray-700/50"></div>
                            <div className="px-2 mb-2">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                                    Super Admin
                                </div>
                                {SUPER_ADMIN_NAV.map((entry) => {
                                    const Icon = entry.icon;
                                    return (
                                        <NavItem
                                            key={entry.href}
                                            href={entry.href}
                                            label={entry.label}
                                            icon={Icon}
                                            flat
                                        />
                                    );
                                })}
                            </div>
                        </>
                    )}
                </nav>

                {/* User */}
                <div className="border-t border-gray-700/60 px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {auth?.user?.name?.charAt(0)?.toUpperCase() ?? 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{auth?.user?.name ?? 'Staff'}</div>
                        <div className="text-xs text-gray-400 truncate">{auth?.user?.email}</div>
                    </div>
                    <button onClick={logout} className="text-gray-400 hover:text-red-400" title="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-4 lg:px-6 flex-shrink-0">
                    <button
                        className="lg:hidden text-gray-500 hover:text-gray-900"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {title && (
                        <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
                    )}

                    <div className="ml-auto flex items-center gap-3">
                        <LanguageSwitcher />
                        <button className="text-gray-400 hover:text-gray-600">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="text-sm text-gray-600 hidden sm:block">{auth?.user?.name}</div>
                    </div>
                </header>

                {/* Flash */}
                {(flash?.success || flash?.error) && (
                    <div className="px-4 lg:px-6 pt-4">
                        {flash.success && (
                            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">
                                {flash.success}
                            </div>
                        )}
                        {flash.error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-2.5">
                                {flash.error}
                            </div>
                        )}
                    </div>
                )}

                {/* Page content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, label, icon: Icon, flat = false }) {
    const { url } = usePage();
    const resolvedHref = route(href);
    const isActive = url.startsWith(resolvedHref.replace(window.location.origin, ''));

    if (flat) {
        return (
            <Link
                href={resolvedHref}
                data-active={isActive}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                    isActive
                        ? 'bg-blue-600/20 text-blue-300 font-medium'
                        : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                }`}
            >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                {label}
            </Link>
        );
    }

    return (
        <Link
            href={resolvedHref}
            data-active={isActive}
            className={`block px-3 py-1.5 rounded text-sm transition-colors ${
                isActive
                    ? 'bg-blue-600/20 text-blue-300 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/40'
            }`}
        >
            {label}
        </Link>
    );
}

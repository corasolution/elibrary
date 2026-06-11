import { Link, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard, BookOpen, RefreshCw, Users, ShoppingCart,
    Newspaper, BarChart2, Settings, ChevronDown, ChevronRight,
    Menu, X, LogOut, Bell, Boxes, BookMarked, Building2, CreditCard, ScanBarcode,
} from 'lucide-react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function AdminLayout({ children, title }) {
    const page = usePage();
    const { auth, tenant, flash } = page.props;
    const url = page.url;
    const { t } = useTranslation();

    // Active-route helper (path-aware, origin-safe)
    const isActive = (name) => {
        try {
            const resolved = route(name).replace(window.location.origin, '');
            return url === resolved || url.startsWith(resolved + '/') || url.startsWith(resolved + '?');
        } catch { return false; }
    };

    const NAV = [
        {
            group: t('admin.nav.catalog'),
            groupKey: 'Catalog',
            icon: BookOpen,
            items: [
                { label: t('admin.nav.bibliographic_records'), href: 'admin.catalog.index' },
                { label: t('admin.nav.items'), href: 'admin.items.index' },
                { label: t('admin.nav.digital_resources'), href: 'admin.digital.index' },
            ],
        },
        {
            group: t('admin.nav.circulation'),
            groupKey: 'Circulation',
            icon: RefreshCw,
            items: [
                { label: t('admin.nav.quick_checkout'), href: 'admin.circulation.quick-checkout' },
                { label: t('admin.nav.active_loans'), href: 'admin.loans.index' },
                { label: t('admin.nav.overdue'), href: 'admin.loans.overdue' },
                { label: t('admin.nav.reservations'), href: 'admin.reservations.index' },
                { label: t('admin.nav.fines'), href: 'admin.fines.index' },
            ],
        },
        {
            group: t('admin.nav.labels'),
            groupKey: 'Labels',
            icon: ScanBarcode,
            items: [
                { label: t('admin.nav.labels_print'), href: 'admin.labels.index' },
                { label: t('admin.nav.label_templates'), href: 'admin.labels.templates.index' },
            ],
        },
        { label: t('admin.nav.patrons'), icon: Users, href: 'admin.patrons.index' },
        {
            group: t('admin.nav.cards'),
            groupKey: 'Cards',
            icon: CreditCard,
            items: [
                { label: t('admin.nav.card_maker'), href: 'admin.cards.index' },
                { label: t('admin.nav.card_templates'), href: 'admin.cards.templates.index' },
            ],
        },
        {
            group: t('admin.nav.acquisitions'),
            groupKey: 'Acquisitions',
            icon: ShoppingCart,
            items: [
                { label: t('admin.nav.orders'), href: 'admin.acquisitions.index' },
            ],
        },
        {
            group: t('admin.nav.serials'),
            groupKey: 'Serials',
            icon: Newspaper,
            items: [
                { label: t('admin.nav.subscriptions'), href: 'admin.serials.index' },
            ],
        },
        {
            group: t('admin.nav.reports'),
            groupKey: 'Reports',
            icon: BarChart2,
            items: [
                { label: t('admin.nav.circulation_report'), href: 'admin.reports.circulation' },
                { label: t('admin.nav.collection_report'), href: 'admin.reports.collection' },
                { label: t('admin.nav.digital_usage'), href: 'admin.reports.digital' },
                { label: t('admin.nav.overdue_report'), href: 'admin.reports.overdue' },
            ],
        },
        {
            group: t('admin.nav.settings'),
            groupKey: 'Settings',
            icon: Settings,
            items: [
                { label: t('admin.nav.general'), href: 'admin.settings' },
                { label: t('admin.nav.ai_features'), href: 'admin.settings.ai' },
                { label: t('admin.nav.theme'), href: 'admin.settings.theme.index' },
                { label: t('admin.nav.storage'), href: 'admin.settings.storage.index' },
                { label: t('admin.nav.collections_locations'), href: 'admin.collections-locations.index' },
                { label: t('admin.nav.categories'), href: 'admin.patron-categories.index' },
            ],
        },
    ];

    const SUPER_ADMIN_NAV = [
        { label: t('admin.nav.tenants'), icon: Building2, href: 'admin.tenants.index' },
        { label: t('admin.nav.plans'),   icon: CreditCard, href: 'admin.plans.index' },
    ];
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navRef = useRef(null);
    const [openGroups, setOpenGroups] = useState(() => {
        const defaults = {};
        NAV.forEach(n => { if (n.groupKey) defaults[n.groupKey] = true; });
        return defaults;
    });

    const toggleGroup = (groupKey) => {
        setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
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
                fixed inset-y-0 left-0 z-30 w-64 flex flex-col
                bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white
                ring-1 ring-white/5 shadow-xl
                transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:static lg:translate-x-0 lg:flex
            `}>
                {/* Brand */}
                <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5 flex-shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-900/40">
                        <BookMarked className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm leading-tight">
                        <span className="truncate">{tenant?.name ?? 'Alpha eLibrary'}</span>
                        <span className="block text-[11px] font-normal text-slate-400 tracking-wide">{t('admin.ui.staff')}</span>
                    </span>
                    <button
                        className="ml-auto lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav ref={navRef} className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                    {/* Dashboard */}
                    <NavItem href="admin.dashboard" label={t('admin.nav.dashboard')} icon={LayoutDashboard} flat active={isActive('admin.dashboard')} />

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
                                    active={isActive(entry.href)}
                                />
                            );
                        }
                        // Expandable group
                        const { group, groupKey, items } = entry;
                        const groupActive = items.some(item => isActive(item.href));
                        const open = openGroups[groupKey];
                        return (
                            <div key={groupKey}>
                                <button
                                    onClick={() => toggleGroup(groupKey)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                        groupActive
                                            ? 'text-white'
                                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${groupActive ? 'text-blue-400' : ''}`} />
                                    <span className="flex-1 text-left font-medium">{group}</span>
                                    <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                                </button>
                                {open && (
                                    <div className="ml-[22px] pl-3 border-l border-white/10 mt-0.5 mb-1 space-y-0.5">
                                        {items.map(item => (
                                            <NavItem key={item.href} href={item.href} label={item.label} active={isActive(item.href)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Super Admin Section */}
                    {auth?.user?.roles?.includes('super_admin') && (
                        <div className="pt-3 mt-3 border-t border-white/5">
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 pb-1.5">
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
                                        active={isActive(entry.href)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </nav>

                {/* User */}
                <div className="border-t border-white/5 p-3 flex-shrink-0">
                    <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow flex-shrink-0">
                            {auth?.user?.name?.charAt(0)?.toUpperCase() ?? 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate capitalize">{auth?.user?.name ?? t('admin.ui.staff')}</div>
                            <div className="text-xs text-slate-400 truncate">{auth?.user?.email}</div>
                        </div>
                        <button
                            onClick={logout}
                            title="Logout"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
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

function NavItem({ href, label, icon: Icon, flat = false, active: activeProp }) {
    const { url } = usePage();
    const resolvedHref = route(href);
    const isActive = activeProp ?? url.startsWith(resolvedHref.replace(window.location.origin, ''));

    if (flat) {
        return (
            <Link
                href={resolvedHref}
                data-active={isActive}
                className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                        ? 'bg-gradient-to-r from-blue-600/25 to-indigo-600/10 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
            >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-blue-400" />}
                {Icon && <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />}
                {label}
            </Link>
        );
    }

    return (
        <Link
            href={resolvedHref}
            data-active={isActive}
            className={`relative flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isActive
                    ? 'text-white font-medium bg-white/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
        >
            <span className={`mr-2.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`} />
            {label}
        </Link>
    );
}

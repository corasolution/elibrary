import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard, BookOpen, RefreshCw, Users, ShoppingCart,
    BarChart2, Settings, Building2, CreditCard, Wrench,
    Menu, X, LogOut, Bell, BookMarked, ChevronLeft, ChevronRight,
    List, Layers, FileDigit, ScanBarcode, ScanLine, AlertTriangle,
    BellRing, CalendarClock, BookmarkCheck, TrendingUp, BadgeDollarSign,
    UserRound, Tag, Printer, CreditCard as CardIcon, Package, Hammer,
    ClipboardList, Rss, LineChart, LayoutGrid, Database, AlertCircle,
    ShoppingBag, SlidersHorizontal, Sparkles, Palette, Cloud, FolderOpen,
} from 'lucide-react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function AdminLayout({ children, title }) {
    const page = usePage();
    const { auth, tenant, flash } = page.props;
    const url = page.url;
    const { t } = useTranslation();

    const isActive = (name) => {
        try {
            const resolved = route(name).replace(window.location.origin, '');
            return url === resolved || url.startsWith(resolved + '/') || url.startsWith(resolved + '?');
        } catch { return false; }
    };

    const MODULES = [
        {
            key: 'dashboard', label: t('admin.nav.dashboard'),
            icon: LayoutDashboard, href: 'admin.dashboard', direct: true,
        },
        {
            key: 'catalog', label: t('admin.nav.catalog'), icon: BookOpen,
            items: [
                { icon: List,        label: t('admin.nav.bibliographic_records'), href: 'admin.catalog.index' },
                { icon: ScanBarcode, label: t('admin.nav.items'),                 href: 'admin.items.index' },
                { icon: FileDigit,   label: t('admin.nav.digital_resources'),     href: 'admin.digital.index' },
            ],
        },
        {
            key: 'circulation', label: t('admin.nav.circulation'), icon: RefreshCw,
            items: [
                { icon: ScanLine,       label: t('admin.nav.quick_checkout'),    href: 'admin.circulation.quick-checkout' },
                { icon: BookMarked,     label: t('admin.nav.active_loans'),      href: 'admin.loans.index' },
                { icon: AlertTriangle,  label: t('admin.nav.overdue'),           href: 'admin.loans.overdue' },
                { icon: BellRing,       label: t('admin.nav.overdue_notices'),   href: 'admin.loans.overdue-notices' },
                { icon: BookmarkCheck,  label: t('admin.nav.reservations'),      href: 'admin.reservations.index' },
                { icon: CalendarClock,  label: t('admin.nav.holds_to_pull'),     href: 'admin.reservations.holds-to-pull' },
                { icon: TrendingUp,     label: t('admin.nav.hold_ratios'),       href: 'admin.reservations.hold-ratios' },
                { icon: BadgeDollarSign,label: t('admin.nav.fines'),             href: 'admin.fines.index' },
            ],
        },
        {
            key: 'members', label: t('admin.nav.members', 'Members'), icon: Users,
            items: [
                { icon: UserRound, label: t('admin.nav.patrons'),    href: 'admin.patrons.index' },
                { icon: Tag,       label: t('admin.nav.categories'), href: 'admin.patron-categories.index' },
            ],
        },
        {
            key: 'tools', label: t('admin.nav.tools', 'Tools'), icon: Wrench,
            items: [
                { icon: Printer,   label: t('admin.nav.labels_print'),      href: 'admin.labels.index' },
                { icon: Layers,    label: t('admin.nav.label_templates'),   href: 'admin.labels.templates.index' },
                { icon: CardIcon,  label: t('admin.nav.card_maker'),        href: 'admin.cards.index' },
                { icon: LayoutGrid,label: t('admin.nav.card_templates'),    href: 'admin.cards.templates.index' },
                { icon: Package,   label: t('admin.nav.inventory'),         href: 'admin.inventory.index' },
                { icon: Hammer,    label: t('admin.nav.batch_tools'),       href: 'admin.batch.index' },
            ],
        },
        {
            key: 'acquisitions', label: t('admin.nav.acquisitions', 'Acquisitions'), icon: ShoppingCart,
            items: [
                { icon: ShoppingBag, label: t('admin.nav.orders'),        href: 'admin.acquisitions.index' },
                { icon: Rss,         label: t('admin.nav.subscriptions'), href: 'admin.serials.index' },
            ],
        },
        {
            key: 'reports', label: t('admin.nav.reports'), icon: BarChart2,
            items: [
                { icon: RefreshCw,    label: t('admin.nav.circulation_report'),  href: 'admin.reports.circulation' },
                { icon: BookOpen,     label: t('admin.nav.collection_report'),   href: 'admin.reports.collection' },
                { icon: ClipboardList,label: t('admin.nav.catalog_report'),      href: 'admin.reports.catalog' },
                { icon: FileDigit,    label: t('admin.nav.digital_usage'),       href: 'admin.reports.digital' },
                { icon: AlertCircle,  label: t('admin.nav.overdue_report'),      href: 'admin.reports.overdue' },
                { icon: LineChart,    label: t('admin.nav.acquisitions_report'), href: 'admin.reports.acquisitions' },
            ],
        },
        {
            key: 'settings', label: t('admin.nav.settings'), icon: Settings,
            items: [
                { icon: SlidersHorizontal, label: t('admin.nav.general'),               href: 'admin.settings' },
                { icon: Sparkles,          label: t('admin.nav.ai_features'),           href: 'admin.settings.ai' },
                { icon: Palette,           label: t('admin.nav.theme'),                 href: 'admin.settings.theme.index' },
                { icon: Cloud,             label: t('admin.nav.storage'),               href: 'admin.settings.storage.index' },
                { icon: FolderOpen,        label: t('admin.nav.collections_locations'), href: 'admin.collections-locations.index' },
            ],
        },
    ];

    const SUPER_ADMIN_MODULES = [
        { key: 'tenants', label: t('admin.nav.tenants'), icon: Building2, href: 'admin.tenants.index', direct: true },
        { key: 'plans',   label: t('admin.nav.plans'),   icon: CreditCard, href: 'admin.plans.index',   direct: true },
    ];

    const [activeModule, setActiveModule] = useState(null);
    const [subPanelOpen, setSubPanelOpen] = useState(true);
    const [sidebarOpen, setSidebarOpen]   = useState(false);

    // Auto-detect active module from current URL
    useEffect(() => {
        const found = MODULES.find(m =>
            !m.direct && m.items?.some(item => isActive(item.href))
        );
        if (found) {
            setActiveModule(found.key);
            setSubPanelOpen(true);
        }
    }, [url]);

    const handleModuleClick = (mod) => {
        if (mod.direct) {
            router.get(route(mod.href));
            setSidebarOpen(false);
            return;
        }
        if (activeModule === mod.key) {
            setSubPanelOpen(prev => !prev);
        } else {
            setActiveModule(mod.key);
            setSubPanelOpen(true);
        }
    };

    const isModuleActive = (mod) => {
        if (mod.direct) return isActive(mod.href);
        return mod.items?.some(item => isActive(item.href)) ?? false;
    };

    const currentModule = MODULES.find(m => m.key === activeModule);
    const logout = () => router.post(route('admin.logout'));

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — fixed on mobile, static on desktop */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 flex
                transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:static lg:translate-x-0
            `}>
                {/* ── Icon rail ──────────────────────────────────────── */}
                <div className="w-14 flex flex-col bg-slate-950 border-r border-white/5">
                    {/* Brand */}
                    <div className="h-14 flex items-center justify-center border-b border-white/5 flex-shrink-0">
                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-900/40">
                            <BookMarked className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Module icons */}
                    <nav className="flex-1 flex flex-col items-center py-3 gap-0.5 overflow-y-auto scrollbar-hide">
                        {MODULES.map(mod => {
                            const active     = isModuleActive(mod);
                            const panelShown = !mod.direct && activeModule === mod.key && subPanelOpen;
                            return (
                                <RailButton
                                    key={mod.key}
                                    icon={mod.icon}
                                    label={mod.label}
                                    active={active}
                                    panelShown={panelShown}
                                    onClick={() => handleModuleClick(mod)}
                                />
                            );
                        })}
                    </nav>

                    {/* Super admin icons */}
                    {auth?.user?.roles?.includes('super_admin') && (
                        <div className="flex flex-col items-center pb-2 gap-0.5 border-t border-white/5 pt-2 flex-shrink-0">
                            {SUPER_ADMIN_MODULES.map(mod => (
                                <RailButton
                                    key={mod.key}
                                    icon={mod.icon}
                                    label={mod.label}
                                    active={isActive(mod.href)}
                                    onClick={() => handleModuleClick(mod)}
                                />
                            ))}
                        </div>
                    )}

                    {/* User + logout */}
                    <div className="flex flex-col items-center py-3 border-t border-white/5 gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
                            {auth?.user?.name?.charAt(0)?.toUpperCase() ?? 'S'}
                        </div>
                        <button
                            onClick={logout}
                            title="Logout"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* ── Sub-panel ──────────────────────────────────────── */}
                {currentModule && subPanelOpen && (
                    <div className="w-[200px] flex flex-col bg-slate-900 border-r border-white/5">
                        {/* Header */}
                        <div className="h-14 flex items-center justify-between px-3 border-b border-white/5 flex-shrink-0">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate pr-2">
                                {currentModule.label}
                            </span>
                            <button
                                onClick={() => setSubPanelOpen(false)}
                                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-white rounded hover:bg-white/5 transition flex-shrink-0"
                                title="Collapse panel"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Nav items */}
                        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                            {currentModule.items?.map(item => (
                                <SubItem
                                    key={item.href}
                                    href={item.href}
                                    label={item.label}
                                    icon={item.icon}
                                    active={isActive(item.href)}
                                    onClick={() => setSidebarOpen(false)}
                                />
                            ))}
                        </nav>

                        {/* Tenant label */}
                        <div className="px-3 py-2.5 border-t border-white/5 flex-shrink-0">
                            <div className="text-[10px] text-slate-500 truncate font-medium">
                                {tenant?.name ?? 'Alpha eLibrary'}
                            </div>
                            <div className="text-[10px] text-slate-600 truncate">
                                {auth?.user?.email}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile close button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden absolute -right-8 top-3 w-7 h-7 flex items-center justify-center bg-slate-800/90 text-white rounded-r-lg"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </aside>

            {/* ── Main area ──────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 lg:px-5 flex-shrink-0">
                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden text-gray-500 hover:text-gray-900 -ml-1"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Re-open sub-panel (desktop, when collapsed) */}
                    {activeModule && !subPanelOpen && (
                        <button
                            onClick={() => setSubPanelOpen(true)}
                            className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition"
                        >
                            <ChevronRight className="w-3 h-3" />
                            {currentModule?.label}
                        </button>
                    )}

                    {title && (
                        <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
                    )}

                    <div className="ml-auto flex items-center gap-3">
                        <LanguageSwitcher />
                        <button className="text-gray-400 hover:text-gray-600">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="text-sm text-gray-500 hidden sm:block truncate max-w-[140px]">
                            {auth?.user?.name}
                        </div>
                    </div>
                </header>

                {/* Flash messages */}
                {(flash?.success || flash?.error) && (
                    <div className="px-4 lg:px-6 pt-4">
                        {flash?.success && (
                            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
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

// ── Rail Button ───────────────────────────────────────────────────────────────

function RailButton({ icon: Icon, label, active, panelShown, onClick }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`
                relative group w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150
                ${active
                    ? 'bg-indigo-500/20 ring-1 ring-indigo-500/30 text-indigo-400'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                }
            `}
        >
            <Icon className="w-[18px] h-[18px]" />

            {/* Tooltip */}
            <span className="
                pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2
                bg-slate-700 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg
                whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50
                shadow-xl shadow-black/30
            ">
                {label}
            </span>

            {/* Dot: active but sub-panel collapsed */}
            {active && !panelShown && (
                <span className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-indigo-400" />
            )}
        </button>
    );
}

// ── Sub-panel Item ────────────────────────────────────────────────────────────

function SubItem({ href, label, icon: Icon, active, onClick }) {
    const resolvedHref = route(href);
    return (
        <Link
            href={resolvedHref}
            onClick={onClick}
            className={`
                relative flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors
                ${active
                    ? 'text-white font-medium bg-white/8'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
            `}
        >
            {Icon
                ? <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                : <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${active ? 'bg-indigo-400' : 'bg-slate-600'}`} />
            }
            <span className="truncate">{label}</span>
        </Link>
    );
}

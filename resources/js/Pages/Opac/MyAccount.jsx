import OpacLayout from '@/Layouts/OpacLayout';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Clock, Bookmark, History, User, AlertCircle } from 'lucide-react';

export default function MyAccount({ patron }) {
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';

    const memberSince = patron.created_at
        ? new Date(patron.created_at).getFullYear()
        : '—';

    const expiryDate = patron.membership_expiry
        ? new Date(patron.membership_expiry).toLocaleDateString()
        : '—';

    const isExpired = patron.membership_expiry && new Date(patron.membership_expiry) < new Date();

    return (
        <OpacLayout>
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Profile header */}
                <div className="card p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {patron.first_name} {patron.last_name}
                        </h1>
                        {patron.first_name_km && (
                            <p className="text-gray-500 font-khmer">{patron.first_name_km} {patron.last_name_km}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            Card: <span className="font-mono font-medium">{patron.patron_number}</span>
                            {' · '}
                            {patron.category?.name ?? 'Member'}
                            {' · '}
                            Member since {memberSince}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Membership expires</p>
                        <p className={`font-semibold text-sm ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                            {expiryDate}
                        </p>
                        {isExpired && (
                            <span className="badge badge-amber text-xs mt-1">Expired</span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Clock} label="Active Loans" value={patron.active_loans ?? 0} color="blue" />
                    <StatCard icon={BookOpen} label="Total Checkouts" value={patron.total_checkouts ?? 0} color="green" />
                    <StatCard icon={Bookmark} label="Reservations" value="—" color="amber" />
                    <StatCard icon={AlertCircle} label="Fines" value="$0.00" color="red" />
                </div>

                {/* Navigation cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <AccountLink
                        href={`${base}/account/loans`}
                        icon={Clock}
                        title="Current Loans"
                        description="View books you currently have checked out and their due dates"
                    />
                    <AccountLink
                        href={`${base}/account/reservations`}
                        icon={Bookmark}
                        title="My Reservations"
                        description="Track items you've reserved that are on hold or waiting"
                    />
                    <AccountLink
                        href={`${base}/account/history`}
                        icon={History}
                        title="Loan History"
                        description="Browse everything you've previously borrowed"
                    />
                    <AccountLink
                        href={`${base}/catalog`}
                        icon={BookOpen}
                        title="Browse Catalog"
                        description="Search and discover new titles in the library collection"
                    />
                </div>
            </div>
        </OpacLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        blue:  'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
        red:   'bg-red-50 text-red-600',
    };
    return (
        <div className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        </div>
    );
}

function AccountLink({ href, icon: Icon, title, description }) {
    return (
        <Link href={href} className="card p-5 flex gap-4 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
        </Link>
    );
}

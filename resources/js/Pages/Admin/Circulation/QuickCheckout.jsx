import AdminLayout from '@/Layouts/AdminLayout';
import { Maximize2, WifiOff } from 'lucide-react';
import CheckoutCore from './CheckoutCore';
import useOfflineQueue from '@/hooks/useOfflineQueue';

export default function QuickCheckout() {
    const offline = useOfflineQueue();

    return (
        <AdminLayout title="Quick Checkout">
            <div className="flex justify-end mb-3">
                <button
                    onClick={() => window.open(route('admin.circulation.kiosk'), '_blank')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-lg bg-white transition-colors">
                    <Maximize2 className="w-4 h-4" />
                    Open Fullscreen Kiosk
                </button>
            </div>

            {!offline.isOnline && (
                <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-semibold">
                    <WifiOff className="w-4 h-4 flex-shrink-0" />
                    OFFLINE MODE — transactions will be queued and synced when reconnected
                    {offline.queue.length > 0 && (
                        <span className="ml-auto text-red-500 font-medium">{offline.queue.length} pending</span>
                    )}
                </div>
            )}

            <CheckoutCore offline={offline} />
        </AdminLayout>
    );
}

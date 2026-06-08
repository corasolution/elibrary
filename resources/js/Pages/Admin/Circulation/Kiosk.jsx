import KioskLayout from '@/Layouts/KioskLayout';
import CheckoutCore from './CheckoutCore';
import useOfflineQueue from '@/hooks/useOfflineQueue';

export default function Kiosk() {
    const offline = useOfflineQueue();

    return (
        <KioskLayout
            isOnline={offline.isOnline}
            queueCount={offline.queue.length}
            syncStatus={offline.syncStatus}>
            <CheckoutCore fullscreen offline={offline} />
        </KioskLayout>
    );
}

import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { BookOpen, ExternalLink, WifiOff, Loader2, CheckCircle } from 'lucide-react';

export default function KioskLayout({ children, isOnline = true, queueCount = 0, syncStatus = 'idle' }) {
    const { auth } = usePage().props;
    const [time, setTime] = useState('');

    useEffect(() => {
        const tick = () => {
            setTime(new Date().toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
            }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const libraryName = auth?.user?.name ? `${auth.user.name}'s Library` : 'Alpha eLibrary';

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header bar */}
            <header className="h-12 bg-gray-900 flex items-center justify-between px-5 flex-shrink-0 gap-3">
                <div className="flex items-center gap-2 text-white flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold">{libraryName}</span>
                </div>

                {/* Status chip — center */}
                <div className="flex-1 flex justify-center">
                    {!isOnline && (
                        <div className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                            <WifiOff className="w-3.5 h-3.5" />
                            OFFLINE MODE
                            {queueCount > 0 && (
                                <span className="ml-1 bg-red-800 text-white rounded-full px-1.5 py-0.5 text-xs">
                                    {queueCount}
                                </span>
                            )}
                        </div>
                    )}
                    {isOnline && syncStatus === 'syncing' && (
                        <div className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Syncing...
                        </div>
                    )}
                    {isOnline && (syncStatus === 'done' || syncStatus === 'partial') && (
                        <div className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {syncStatus === 'done' ? 'Synced' : 'Partially synced'}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-gray-300 text-sm font-mono tracking-widest">
                        {time}
                    </div>
                    <a
                        href="/admin"
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Exit Kiosk
                    </a>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col p-5" style={{ minHeight: 'calc(100vh - 48px)' }}>
                {children}
            </main>
        </div>
    );
}

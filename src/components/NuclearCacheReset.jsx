import { useEffect } from 'react';

// Force a new version timestamp here manually on every deploy affecting cache
const CURRENT_VERSION = '2.2.3-' + new Date().getTime();

export default function NuclearCacheReset() {
    useEffect(() => {
        const checkVersion = async () => {
            const lastVersion = localStorage.getItem('app_version');

            // If version changed significantly or is missing
            if (lastVersion !== CURRENT_VERSION) {
                console.log('New version detected. Executing legacy cache purge...');

                // 1. Clear LocalStorage version
                localStorage.setItem('app_version', CURRENT_VERSION);

                // 2. Unregister ALL Service Workers
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                        await registration.unregister();
                        console.log('Unregistered SW:', registration);
                    }
                }

                // 3. Clear Caches API
                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(
                        keys.map(key => caches.delete(key))
                    );
                    console.log('Cleared all caches');
                }

                // 4. Force Hard Reload from Server
                window.location.reload(true);
            }
        };

        checkVersion();
    }, []);

    return null;
}

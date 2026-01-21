import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';

export default function ReloadPrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    useEffect(() => {
        if (needRefresh) {
            // Auto-update specifically for this redesign push to ensure user sees changes
            updateServiceWorker(true);
        }
    }, [needRefresh, updateServiceWorker]);

    return null; // Invisible auto-updater for now to fix the blockage
}

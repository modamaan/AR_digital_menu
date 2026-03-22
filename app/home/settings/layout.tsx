import { ReactNode } from 'react';
import SettingsSidebar from '@/components/home/SettingsSidebar';

interface SettingsLayoutProps {
    children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="flex h-full">
            <SettingsSidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

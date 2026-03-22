import { redirect } from 'next/navigation';

export default function SettingsPage() {
    // Redirect to store settings by default
    redirect('/home/settings/store');
}

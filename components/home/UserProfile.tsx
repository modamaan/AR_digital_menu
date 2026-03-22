'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';

export default function UserProfile() {
    const { user } = useUser();
    const { signOut } = useClerk();

    const userName = user?.fullName || 'User';
    const email = user?.primaryEmailAddress?.emailAddress || '';

    return (
        <div className="px-4 py-6 border-b border-purple-200">
            <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="relative">
                    <button
                        onClick={() => signOut()}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#4E44FD] transition-colors"
                    >
                        {user?.imageUrl ? (
                            <Image
                                src={user.imageUrl}
                                alt={userName}
                                width={40}
                                height={40}
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#4E44FD] flex items-center justify-center text-white font-semibold">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </button>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {userName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {/* Online indicator */}
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-xs text-gray-600 truncate">{email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

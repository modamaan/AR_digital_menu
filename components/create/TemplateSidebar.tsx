'use client';
import Image from 'next/image';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';


interface TemplateSidebarProps {
    currentStep: number;
}

export default function TemplateSidebar({ currentStep }: TemplateSidebarProps) {
    const { signOut } = useClerk();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    const steps = [
        {
            number: 1,
            title: 'Setup',
            subtitle: 'Set name & bio'
        },
        {
            number: 2,
            title: 'Finish',
            subtitle: 'Store is ready'
        }
    ];

    return (
        <>
            {/* Mobile Top Header - Visible only on mobile */}
            <div className="lg:hidden w-full bg-white border-b border-gray-100 p-4 sticky top-0 z-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="VisionDine Logo"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span className="text-xl font-bold text-[#4E44FD] tracking-tight">VisionDine</span>
                    </div>
                    <button onClick={handleLogout} className="text-[#4E44FD] font-bold text-sm flex items-center gap-1">
                        Logout
                    </button>
                </div>

                {/* Mobile Horizontal Stepper */}
                <div className="flex justify-between items-center relative px-2">
                    {/* Progress Line */}
                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-10" />

                    {steps.map((step) => (
                        <div key={step.number} className="flex flex-col items-center gap-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step.number === currentStep
                                    ? 'bg-[#4E44FD] text-white ring-4 ring-purple-100 shadow-lg'
                                    : step.number < currentStep
                                        ? 'bg-[#4E44FD] text-white'
                                        : 'bg-white border-2 border-gray-200 text-gray-400'
                                    }`}
                            >
                                {step.number < currentStep ? '✓' : step.number}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step.number === currentStep ? 'text-[#4E44FD]' : 'text-gray-400'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop Sidebar - Visible only on LG and up */}
            <div className="hidden lg:flex w-80 bg-white border-r border-gray-100 p-10 flex-col h-screen sticky top-0">
                {/* Logo */}
                <div className="mb-16">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="VisionDine Logo"
                            width={40}
                            height={40}
                            className="rounded-xl shadow-lg shadow-[#4E44FD]/20"
                        />
                        <span className="text-2xl font-bold text-[#4E44FD] tracking-tight">VisionDine</span>
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-12 flex-1">
                    {steps.map((step) => (
                        <div key={step.number} className="flex gap-5 group">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${step.number === currentStep
                                        ? 'bg-[#4E44FD] text-white ring-4 ring-purple-50 shadow-xl'
                                        : step.number < currentStep
                                            ? 'bg-[#4E44FD] text-white'
                                            : 'bg-gray-50 border-2 border-gray-100 text-gray-400'
                                        }`}
                                >
                                    {step.number < currentStep ? '✓' : step.number}
                                </div>
                                {step.number !== 2 && (
                                    <div className={`w-0.5 h-12 my-2 transition-colors duration-300 ${step.number < currentStep ? 'bg-[#4E44FD]' : 'bg-gray-100'
                                        }`} />
                                )}
                            </div>
                            <div className="pt-0.5">
                                <h3
                                    className={`font-bold text-base transition-colors duration-300 ${step.number === currentStep ? 'text-gray-900' : 'text-gray-400'
                                        }`}
                                >
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 leading-tight">{step.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Link */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-[#4E44FD] hover:bg-purple-50 px-6 py-3 rounded-2xl transition-all font-bold group w-full">
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                        <span>{currentStep === 2 ? 'Back To Dashboard' : 'Log Out'}</span>
                    </button>
                </div>
            </div>
        </>
    );
}

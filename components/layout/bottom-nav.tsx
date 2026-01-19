'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Music, Users, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
    };

    const links = [
        {
            href: '/home',
            label: 'Home',
            icon: Home
        },
        {
            href: '/vibes',
            label: 'Vibes',
            icon: Music
        },
        {
            href: '/community',
            label: 'Community',
            icon: Users
        },
        {
            href: '/profile',
            label: 'Profile',
            icon: User
        }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[2px] border-black pb-1">
            <div className="flex justify-around items-center h-[60px]">
                {links.map((link) => {
                    const isActive = pathname?.startsWith(link.href) ?? false;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative flex flex-col items-center justify-center w-full h-full"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-active-pill"
                                    className="absolute inset-x-2 top-1 bottom-1 bg-[#FB58B4]/20 rounded-lg"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <div className={`relative flex flex-col items-center gap-0.5 transition-all duration-300 z-10 ${isActive ? 'scale-105' : 'scale-100 opacity-70 hover:opacity-100'}`}>
                                <link.icon
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-black fill-black/10' : 'text-black'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className={`text-[8px] font-black uppercase tracking-wider ${isActive ? 'text-black' : 'text-black/60'}`}>
                                    {link.label}
                                </span>
                            </div>
                        </Link>
                    );
                })}

                <button
                    onClick={handleLogout}
                    className="relative flex flex-col items-center justify-center w-full h-full group active:scale-95 transition-transform"
                >
                    <div className="relative flex flex-col items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <LogOut className="w-5 h-5 text-red-500 stroke-2" />
                        <span className="text-[8px] font-black uppercase tracking-wider text-red-500">
                            Logout
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
}

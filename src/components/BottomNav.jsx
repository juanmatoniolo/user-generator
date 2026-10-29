'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Verificamos si la cookie de sesión existe en el navegador
        const hasSession = document.cookie.includes('auth_session=');
        setIsAuth(hasSession);
    }, [pathname]);

    // Evitamos errores de hidratación
    if (!isClient) return null;

    // Si no está autenticado, o está en el login, no mostramos el menú
    if (!isAuth || pathname === '/' || pathname.startsWith('/login')) return null;

    const cerrarSesion = (e) => {
        e.preventDefault();
        document.cookie = "auth_session=; path=/; max-age=0";
        router.push('/');
        router.refresh();
    };

    return (
        <nav className="md:hidden fixed bottom-0 w-full bg-[#1B4F93] text-white flex justify-around p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
            <Link href="/dashboard" className={`flex flex-col items-center text-xs gap-1 hover:text-gray-300 ${pathname === '/dashboard' ? 'text-yellow-400 font-bold' : ''}`}>
                <span className="text-xl">👥</span> Clientes
            </Link>
            <Link href="/pagos" className={`flex flex-col items-center text-xs gap-1 hover:text-gray-300 ${pathname === '/pagos' ? 'text-yellow-400 font-bold' : ''}`}>
                <span className="text-xl">💵</span> Pagos
            </Link>
            <button onClick={cerrarSesion} className="flex flex-col items-center text-xs gap-1 text-red-300 hover:text-red-100">
                <span className="text-xl">🚪</span> Salir
            </button>
        </nav>
    );
}
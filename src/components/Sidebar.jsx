'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === '/') return null;

    const cerrarSesion = (e) => {
        e.preventDefault();
        document.cookie = "auth_session=; path=/; max-age=0"; // Borra la cookie
        router.push('/');
        router.refresh();
    };

    return (
        <aside className="w-64 bg-[#1B4F93] text-white p-6 hidden md:flex flex-col gap-2 shadow-xl h-screen sticky top-0">
            <h2 className="text-xl font-bold mb-8 pb-4 border-b border-blue-800 text-center">STJER Admin</h2>
            <Link href="/dashboard" className={`hover:bg-blue-800 p-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${pathname === '/dashboard' ? 'bg-blue-800' : ''}`}>👥 Gestión de Clientes</Link>
            <Link href="/pagos" className={`hover:bg-blue-800 p-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${pathname === '/pagos' ? 'bg-blue-800' : ''}`}>💵 Historial de Pagos</Link>
            <button onClick={cerrarSesion} className="mt-auto bg-red-900/40 hover:bg-red-600 p-3 rounded-lg transition-colors text-center font-medium">Cerrar Sesión</button>
        </aside>
    );
}
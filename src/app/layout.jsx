import './globals.css';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

const URL_SITIO = 'https://user-generator-fg1w.vercel.app';

export const metadata = {
  metadataBase: new URL(URL_SITIO),
  title: 'STJER Admin | Gestión de Clientes',
  description: 'Panel de administración para la gestión de licencias y pagos de STJER.',
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon.ico' },
  openGraph: {
    title: 'STJER Admin | Gestión de Clientes',
    description: 'Administración de licencias y pagos.',
    url: URL_SITIO,
    siteName: 'STJER Admin',
    images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'Logo STJER' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'STJER Admin', description: 'Panel de gestión.', images: ['/logo.jpg'] },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex flex-col md:flex-row min-h-screen bg-gray-100 pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto"><div className="max-w-6xl mx-auto">{children}</div></main>
        <BottomNav />
      </body>
    </html>
  );
}
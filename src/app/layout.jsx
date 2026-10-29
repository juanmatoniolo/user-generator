import './globals.css';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';

// IMPORTANTE: Cambiá esta URL por tu dominio real cuando lo subas a Vercel
const URL_SITIO = 'https://user-generator-fg1w.vercel.app';

export const metadata = {
  // Configuración base
  metadataBase: new URL(URL_SITIO),
  title: 'STJER Admin | Gestión de Clientes',
  description: 'Panel de administración para la gestión de licencias, pagos y vencimientos de STJER Expedientes.',

  // Favicon (ícono de la pestaña)
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico', // Para dispositivos Apple
  },

  // Configuración para WhatsApp, Facebook, LinkedIn (Open Graph)
  openGraph: {
    title: 'STJER Admin | Gestión de Clientes',
    description: 'Administración de licencias y pagos.',
    url: URL_SITIO,
    siteName: 'STJER Admin',
    images: [
      {
        url: '/logo.jpg', // La imagen que se verá al compartir el link
        width: 1200,
        height: 630,
        alt: 'Logo de STJER Admin',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },

  // Configuración para Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'STJER Admin',
    description: 'Panel de gestión de licencias.',
    images: ['/logo.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex flex-col md:flex-row min-h-screen bg-gray-100 pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
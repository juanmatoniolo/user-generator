'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // <-- Aquí está definido router correctamente

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Petición a la API segura
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Creamos la cookie (1 día)
        document.cookie = `auth_session=${data.username}; path=/; max-age=86400`;
        // Redirigimos al Dashboard protegido
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] w-full">
      <form onSubmit={handleLogin} className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-[90%] max-w-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#1B4F93]">Acceso Admin</h1>

        {error && <p className="text-red-600 text-sm mb-4 text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Usuario Root</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F93]" placeholder="Ingrese su usuario" required />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F93]" placeholder="••••••••" required />
        </div>

        <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 rounded-lg transition shadow-lg ${loading ? 'bg-gray-400' : 'bg-[#1B4F93] hover:bg-blue-800'}`}>
          {loading ? 'Validando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
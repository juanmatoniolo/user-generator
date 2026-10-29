'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Trash2, Edit, Plus, DollarSign, User, Key, Calendar, Crown, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, username: '', password: '', fecha_vencimiento: '', is_vip: false });
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [pagoData, setPagoData] = useState({ username: '', monto: '', notas: '' });
  const [adminName, setAdminName] = useState('');

  // ESTADO PARA EVITAR DOBLE CLIC
  const [isProcessingPago, setIsProcessingPago] = useState(false);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    setAdminName(getCookie('auth_session') || 'Admin');
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('usuarios_app').select('*').order('id', { ascending: false });
    if (!error) setUsuarios(data);
    setLoading(false);
  };

  const calcularDias = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    return Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const fechaFinal = formData.is_vip ? null : (formData.fecha_vencimiento || null);

    if (formData.id) {
      await supabase.from('usuarios_app').update({
        username: formData.username,
        password: formData.password,
        fecha_vencimiento: fechaFinal,
        is_vip: formData.is_vip
      }).eq('id', formData.id);
    } else {
      await supabase.from('usuarios_app').insert([{
        username: formData.username,
        password: formData.password,
        fecha_vencimiento: fechaFinal,
        creado_por: adminName,
        activo: true,
        is_vip: formData.is_vip
      }]);
    }
    setIsModalOpen(false);
    fetchUsuarios();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Seguro que querés eliminar este usuario?')) {
      await supabase.from('usuarios_app').delete().eq('id', id);
      fetchUsuarios();
    }
  };

  const toggleActivo = async (id, estadoActual) => {
    await supabase.from('usuarios_app').update({ activo: !estadoActual }).eq('id', id);
    fetchUsuarios();
  };

  const registrarPago = async (e) => {
    e.preventDefault();
    setIsProcessingPago(true); // Bloqueamos el botón

    try {
      await supabase.from('pagos_app').insert([{ username: pagoData.username, monto: parseFloat(pagoData.monto), notas: pagoData.notas }]);

      const user = usuarios.find(u => u.username === pagoData.username);
      if (user) {
        const baseDate = user.fecha_vencimiento ? new Date(user.fecha_vencimiento) : new Date();
        baseDate.setDate(baseDate.getDate() + 30);
        await supabase.from('usuarios_app').update({
          fecha_vencimiento: baseDate.toISOString().split('T')[0],
          activo: true,
          is_vip: false
        }).eq('id', user.id);
      }

      setIsPagoModalOpen(false);
      fetchUsuarios();
      alert('Pago registrado correctamente (+30 días).');
    } catch (error) {
      alert('Error al registrar el pago: ' + error.message);
    } finally {
      setIsProcessingPago(false); // Desbloqueamos el botón por si falla
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
        <button onClick={() => { setFormData({ id: null, username: '', password: '', fecha_vencimiento: '', is_vip: false }); setIsModalOpen(true); }} className="w-full md:w-auto bg-[#1B4F93] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition shadow-lg">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      {loading ? <p className="text-gray-600">Cargando...</p> : (
        <>
          {/* TABLA PC */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="p-4 font-semibold">Usuario / Pass</th>
                  <th className="p-4 font-semibold">Tipo</th>
                  <th className="p-4 font-semibold">Vencimiento</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => {
                  const dias = calcularDias(u.fecha_vencimiento);
                  const vencido = dias !== 'Sin fecha' && dias <= 0;
                  return (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{u.username}</p>
                        <p className="text-gray-500 font-mono text-xs">{u.password}</p>
                      </td>
                      <td className="p-4">
                        {u.is_vip ? (
                          <span className="flex items-center gap-1 text-yellow-600 font-bold text-sm bg-yellow-50 px-2 py-1 rounded w-fit"><Crown size={14} /> VIP</span>
                        ) : (
                          <span className="text-gray-500 text-sm">Estándar</span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.is_vip ? (
                          <span className="text-gray-400 text-sm">Ilimitado</span>
                        ) : u.fecha_vencimiento ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${vencido ? 'bg-red-100 text-red-700' : dias <= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {u.fecha_vencimiento} ({dias} días)
                          </span>
                        ) : <span className="text-gray-400 text-sm">-</span>}
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleActivo(u.id, u.activo)} className={`px-3 py-1 rounded-full text-xs font-bold transition ${u.activo ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>{u.activo ? 'Activo' : 'Inactivo'}</button>
                      </td>
                      <td className="p-4 flex gap-2 justify-center">
                        <button onClick={() => { setPagoData({ username: u.username, monto: '', notas: '' }); setIsPagoModalOpen(true); }} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"><DollarSign size={18} /></button>
                        <button onClick={() => { setFormData(u); setIsModalOpen(true); }} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TARJETAS CELULAR */}
          <div className="md:hidden flex flex-col gap-4">
            {usuarios.map(u => {
              const dias = calcularDias(u.fecha_vencimiento);
              const vencido = dias !== 'Sin fecha' && dias <= 0;
              return (
                <div key={u.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        {u.username} {u.is_vip && <Crown size={16} className="text-yellow-500" />}
                      </h3>
                      <p className="text-gray-500 font-mono text-xs">Pass: {u.password}</p>
                    </div>
                    <button onClick={() => toggleActivo(u.id, u.activo)} className={`px-3 py-1 rounded-full text-xs font-bold ${u.activo ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>{u.activo ? 'Activo' : 'Inactivo'}</button>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p><span className="font-semibold">Vence:</span> {u.is_vip ? 'Ilimitado (VIP)' : (u.fecha_vencimiento || '-')} {!u.is_vip && dias !== 'Sin fecha' && <span className={vencido ? 'text-red-500' : 'text-green-600'}>({dias} días)</span>}</p>
                  </div>
                  <div className="flex justify-between gap-2 border-t pt-3">
                    <button onClick={() => { setPagoData({ username: u.username, monto: '', notas: '' }); setIsPagoModalOpen(true); }} className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-lg flex justify-center items-center gap-1 text-sm font-medium"><DollarSign size={16} /> Pago</button>
                    <button onClick={() => { setFormData(u); setIsModalOpen(true); }} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg flex justify-center items-center gap-1 text-sm font-medium"><Edit size={16} /> Editar</button>
                    <button onClick={() => handleDelete(u.id)} className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg flex justify-center items-center gap-1 text-sm font-medium"><Trash2 size={16} /> Borrar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL CREAR/EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6 text-[#1B4F93]">
              <User size={24} />
              <h2 className="text-xl font-bold">{formData.id ? 'Editar' : 'Nuevo'} Cliente</h2>
            </div>

            <div className="relative mb-4">
              <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input type="text" placeholder="Nombre de Usuario" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full pl-10 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B4F93] transition outline-none" required />
            </div>

            <div className="relative mb-4">
              <Key size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input type="text" placeholder="Contraseña" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B4F93] transition outline-none" required />
            </div>

            <div className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-xl mb-4">
              <div className="flex items-center gap-2 text-yellow-700 font-medium">
                <Crown size={18} /> ¿Es usuario VIP?
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.is_vip || false} onChange={e => setFormData({ ...formData, is_vip: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>

            {!formData.is_vip && (
              <div className="relative mb-6">
                <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input type="date" value={formData.fecha_vencimiento || ''} onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })} className="w-full pl-10 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B4F93] transition outline-none text-gray-600" />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition font-medium">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-[#1B4F93] text-white rounded-xl hover:bg-blue-800 transition shadow-lg font-medium flex items-center gap-2"><CheckCircle2 size={18} /> Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL REGISTRAR PAGO (CON BLOQUEO) */}
      {isPagoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={registrarPago} className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
              <DollarSign size={24} />
              <h2 className="text-xl font-bold">Registrar Pago</h2>
            </div>
            <p className="text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg border text-sm">Cliente: <strong className="text-black">{pagoData.username}</strong></p>

            <div className="relative mb-4">
              <span className="absolute left-4 top-3.5 text-gray-500 font-bold">$</span>
              <input type="number" placeholder="Monto" value={pagoData.monto} onChange={e => setPagoData({ ...pagoData, monto: e.target.value })} className="w-full pl-8 p-3 text-lg border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none font-semibold" required />
            </div>

            <textarea placeholder="Notas (Ej: Pago Octubre, Transferencia...)" value={pagoData.notas} onChange={e => setPagoData({ ...pagoData, notas: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none mb-6 h-24 resize-none"></textarea>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsPagoModalOpen(false)} disabled={isProcessingPago} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition font-medium disabled:opacity-50">Cancelar</button>

              {/* BOTÓN BLOQUEADO MIENTRAS SE PROCESA */}
              <button
                type="submit"
                disabled={isProcessingPago}
                className={`px-5 py-2 text-white rounded-xl transition shadow-lg font-medium flex items-center gap-2 ${isProcessingPago ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isProcessingPago ? 'Procesando...' : 'Confirmar Pago (+30 días)'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
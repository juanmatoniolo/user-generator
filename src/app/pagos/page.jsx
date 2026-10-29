'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Receipt, Calendar, User, Trash2 } from 'lucide-react';

export default function Pagos() {
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('');

    useEffect(() => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };
        setAdminName(getCookie('auth_session') || '');
        fetchPagos();
    }, []);

    const fetchPagos = async () => {
        const { data, error } = await supabase.from('pagos_app').select('*').order('fecha_pago', { ascending: false });
        if (!error) setPagos(data);
        setLoading(false);
    };

    const handleDeletePago = async (id) => {
        if (confirm('¿Estás seguro de eliminar este registro de pago?\n\nADVERTENCIA: Esto solo borra el registro del historial. Si querés quitarle los 30 días al usuario, tenés que editarlo manualmente en la pestaña de Clientes.')) {
            const { error } = await supabase.from('pagos_app').delete().eq('id', id);
            if (error) alert('Error al eliminar: ' + error.message);
            else fetchPagos();
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <Receipt size={28} className="text-[#1B4F93]" />
                <h1 className="text-2xl font-bold text-gray-800">Historial de Pagos</h1>
            </div>

            {loading ? <p className="text-gray-600">Cargando...</p> : (
                <>
                    {/* VISTA PC */}
                    <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                    <th className="p-4 font-semibold">Fecha</th>
                                    <th className="p-4 font-semibold">Cliente</th>
                                    <th className="p-4 font-semibold">Monto</th>
                                    <th className="p-4 font-semibold">Notas</th>
                                    {adminName === 'pome' && <th className="p-4 font-semibold text-center">Opciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {pagos.map(p => (
                                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-600 text-sm">{new Date(p.fecha_pago).toLocaleDateString('es-AR')}</td>
                                        <td className="p-4 font-bold text-gray-800">{p.username}</td>
                                        <td className="p-4 text-emerald-600 font-bold">${p.monto}</td>
                                        <td className="p-4 text-gray-500 text-sm">{p.notas}</td>
                                        {adminName === 'pome' && (
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleDeletePago(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Eliminar Pago"><Trash2 size={18} /></button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* VISTA CELULAR */}
                    <div className="md:hidden flex flex-col gap-3">
                        {pagos.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-2">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <div className="flex items-center gap-2 font-bold text-gray-800"><User size={16} className="text-gray-400" /> {p.username}</div>
                                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">${p.monto}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <Calendar size={14} /> {new Date(p.fecha_pago).toLocaleDateString('es-AR')} - {new Date(p.fecha_pago).toLocaleTimeString('es-AR')}
                                </div>
                                {p.notas && <p className="text-gray-600 text-sm mt-1 bg-gray-50 p-2 rounded">{p.notas}</p>}
                                {adminName === 'pome' && (
                                    <button onClick={() => handleDeletePago(p.id)} className="mt-2 text-red-500 hover:text-red-700 flex items-center justify-center gap-1 text-sm font-medium border-t pt-2 transition"><Trash2 size={16} /> Eliminar Pago</button>
                                )}
                            </div>
                        ))}
                    </div>

                    {pagos.length === 0 && <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500 border">No hay pagos registrados todavía.</div>}
                </>
            )}
        </div>
    );
}
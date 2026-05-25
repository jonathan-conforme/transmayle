import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

// Iconos de Material UI
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import LocalTaxiOutlinedIcon from '@mui/icons-material/LocalTaxiOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

export default function Welcome({ auth }) {
    // Estados para la consulta de deudas pública
    const [criterio, setCriterio] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);

    const handleConsulta = async (e) => {
        e.preventDefault();
        if (!criterio.trim()) return;
        
        setLoading(true);
        setResultado(null);
        
        try {
            const response = await fetch(`/consulta-publica?search=${encodeURIComponent(criterio)}`);
            const data = await response.json();
            setResultado(data);
        } catch (error) {
            setResultado({ status: 'error', message: 'Ocurrió un error al consultar. Reintente más tarde.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Bienvenidos - Transmaylen" />
            
            <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
                
                {/* 1. BARRA DE NAVEGACIÓN */}
                <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/20">
                            <TwoWheelerOutlinedIcon className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-lg tracking-tight leading-none text-white">
                                TRANS<span className="text-indigo-400">MAYLEN</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                                Servicio de Pasajeros
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center space-x-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-sm transition-all active:scale-[0.98]"
                            >
                                <DashboardOutlinedIcon fontSize="small" />
                                <span>Panel Interno</span>
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm rounded-xl border border-white/10 transition-all active:scale-[0.98]"
                            >
                                <LoginOutlinedIcon fontSize="small" />
                                <span>Ingreso Administrativo</span>
                            </Link>
                        )}
                    </nav>
                </header>

                {/* 2. SECCIÓN HERO */}
                <section className="relative w-full max-w-5xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="absolute top-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-widest rounded-full mb-6">
                        Compañía de Transporte Profesional
                    </span>
                    
                    <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none max-w-3xl">
                        Eficiencia y Seguridad en el <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            Traslado de Pasajeros
                        </span>
                    </h1>
                    
                    <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-xl font-medium leading-relaxed">
                        Comprometidos con llevar a cada ciudadano a su destino de forma rápida, cómoda y segura. Garantizamos un servicio puerta a puerta excepcional.
                    </p>
                </section>

                {/* 3. 🔍 NUEVA SECCIÓN: CONSULTA TU PUESTO / DEUDAS PÚBLICAS */}
                <section className="w-full max-w-3xl mx-auto px-6 pb-24 relative z-10">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                        <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-wider rounded-md">
                            Consulta Rápida de Socios
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FactCheckOutlinedIcon className="text-indigo-400" />
                                <span>Consultar Estado de Obligaciones</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Si eres conductor o propietario de Transmaylen, ingresa tu número de cédula o la placa del vehículo para verificar tus mensualidades pendientes.
                            </p>
                        </div>

                        <form onSubmit={handleConsulta} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <SearchOutlinedIcon fontSize="small" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={criterio}
                                    onChange={(e) => setCriterio(e.target.value)}
                                    placeholder="Ej: 0928347162 o ABC-1234"
                                    className="w-full bg-slate-950 text-white rounded-xl pl-10 pr-4 py-3 text-sm border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? 'Buscando...' : 'Consultar Saldos'}
                            </button>
                        </form>

                        {/* RENDERIZADO DINÁMICO DEL ESTADO DE CUENTA */}
                        {resultado && (
                            <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-white/5 animate-fadeIn">
                                {resultado.status === 'success' && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Unidad N° {resultado.unidad}</h4>
                                                <p className="text-xs text-slate-400">Propietario: {resultado.propietario}</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-indigo-400 border border-white/5">
                                                    Placa: {resultado.placa}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                                                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Meses en Mora</span>
                                                <span className={`text-xl font-black ${resultado.cantidad_meses >= 6 ? 'text-rose-400' : resultado.cantidad_meses > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {resultado.cantidad_meses} {resultado.cantidad_meses === 1 ? 'Mes' : 'Meses'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                                                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Pendiente</span>
                                                <span className={`text-xl font-black ${resultado.cantidad_meses >= 6 ? 'text-rose-400' : 'text-white'}`}>
                                                    ${resultado.total_deuda}
                                                </span>
                                            </div>
                                        </div>

                                        {resultado.meses.length > 0 && (
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1.5">Detalle de periodos vencidos:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {resultado.meses.map((mes, idx) => (
                                                        <span key={idx} className="bg-slate-900 text-slate-300 font-mono text-[11px] px-2.5 py-1 rounded border border-white/5 capitalize">
                                                            {mes}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {resultado.cantidad_meses >= 6 && (
                                            <p className="text-[11px] text-rose-400 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl font-medium">
                                                ⚠️ <strong>Atención:</strong> Su cuenta supera el límite permitido. Por favor acérquese a las oficinas administrativas para regularizar su situación.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {resultado.status === 'not_found' && (
                                    <p className="text-sm font-medium text-amber-400 text-center py-2">
                                        ℹ️ {resultado.message}
                                    </p>
                                )}

                                {resultado.status === 'error' && (
                                    <p className="text-sm font-medium text-rose-400 text-center py-2">
                                        ❌ {resultado.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. SECCIÓN SECCIONES COMPLEMENTARIAS: VALORES DE LA EMPRESA */}
                <section className="w-full max-w-6xl mx-auto px-6 pb-24 border-t border-white/5 pt-20">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <h2 className="text-2xl sm:text-3xl font-black text-white">Pilares de Nuestro Servicio</h2>
                        <p className="text-xs sm:text-sm text-slate-400 mt-2">Garantizamos una experiencia de transporte de pasajeros superior bajo altos estándares de organización.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pilar 1 */}
                        <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                                <LocalTaxiOutlinedIcon />
                            </div>
                            <h3 className="text-base font-bold text-white">Dejar Pasajeros Puerta a Puerta</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Ofrecemos un servicio de traslado con cobertura completa, recogiendo y dejando a los pasajeros exactamente en su punto de destino de forma ágil.
                            </p>
                        </div>

                        {/* Pilar 2 */}
                        <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-400 mb-4 border border-purple-500/20">
                                <SecurityOutlinedIcon />
                            </div>
                            <h3 className="text-base font-bold text-white">Conductores Calificados</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Todas nuestras unidades y choferes pasan por filtros estrictos de control interno y legal para brindar total tranquilidad en cada carrera.
                            </p>
                        </div>

                        {/* Pilar 3 */}
                        <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                                <PeopleOutlinedIcon />
                            </div>
                            <h3 className="text-base font-bold text-white">Flota Organizada</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Administramos cada unidad mediante puestos asignados y registros automatizados para asegurar la disponibilidad continua de transporte.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. FOOTER */}
                <footer className="w-full max-w-7xl mx-auto px-6 py-8 text-center border-t border-white/5 bg-slate-950">
                    <p className="text-xs text-slate-500 font-medium">
                        &copy; {new Date().getFullYear()} Compañía TRANSMAYLEN S.A. Todos los derechos reservados. <br />
                        <span className="text-[10px] text-slate-600 mt-1 block">Conectando destinos, cuidando de ti en cada trayecto.</span>
                    </p>
                </footer>
            </div>
        </>
    );
}
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react'; // 👈 Importamos usePage para capturar los flash messages
import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Iconos de Material UI
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CircularProgress from '@mui/material/CircularProgress';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'; // 👈 Icono para pagar

// 👈 Componentes de Material UI para la notificación
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function Deudas({ unidadesConDeuda = [], mototaxis = [] }) {
    // Capturamos las propiedades de flash de Laravel (success, error, etc.)
    const { flash } = usePage().props;

    // Estados de los Modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [isDevModalOpen, setIsDevModalOpen] = useState(false); // 👈 NUEVO: Estado para el modal de desarrollo
    const [selectedUnidadPago, setSelectedUnidadPago] = useState(null);
    
    // Estados para el buscador interactivo
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    // Estados para las Notificaciones (Toast/Snackbar)
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Formulario de Creación de Deuda
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        mototaxi_id: '',
        monto: '',
        fecha_vencimiento: '',
        descripcion: '',
        mes: new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date()),
        anio: new Date().getFullYear().toString(),
        estado: 'pendiente',
        observacion: '',
    });

    // Formulario para Procesar el Pago
    const pagoForm = useForm({
        observacion: '',
    });

    // 🔔 Efecto para escuchar los mensajes Flash enviados por Laravel de forma automática
    useEffect(() => {
        if (flash?.success) {
            setToast({ open: true, message: flash.success, severity: 'success' });
        } else if (flash?.error) {
            setToast({ open: true, message: flash.error, severity: 'error' });
        }
    }, [flash]);

    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast(prev => ({ ...prev, open: false }));
    };

    // Función para calcular la posición exacta del botón en la pantalla
    const updateDropdownPosition = () => {
        if (dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom,
                left: rect.left,
                width: rect.width
            });
        }
    };

    const toggleDropdown = () => {
        if (!isDropdownOpen) updateDropdownPosition();
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Efecto para cerrar dropdown y recalcular posiciones
    useEffect(() => {
        function handleClickOutside(event) {
            const portalMenu = document.getElementById('portal-dropdown-menu');
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                portalMenu && !portalMenu.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        }

        if (isDropdownOpen) {
            window.addEventListener('resize', updateDropdownPosition);
            const formElement = document.querySelector('.modal-form-scroll');
            if (formElement) formElement.addEventListener('scroll', updateDropdownPosition);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener('resize', updateDropdownPosition);
            const formElement = document.querySelector('.modal-form-scroll');
            if (formElement) formElement.removeEventListener('scroll', updateDropdownPosition);
        };
    }, [isDropdownOpen]);

    const openCreateModal = () => {
        clearErrors();
        reset();
        setSearchTerm('');
        setIsModalOpen(true);
    };

    const openPagoModal = (unidad) => {
        pagoForm.reset();
        setSelectedUnidadPago(unidad);
        setIsPagoModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/deudas', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                setSearchTerm('');
            },
        });
    };

    // Enviar el pago al servidor (Deshabilitado temporalmente por el modal estático)
    const submitPago = (e) => {
        e.preventDefault();
        pagoForm.post(`/deudas/${selectedUnidadPago.id}/pagar`, {
            onSuccess: () => {
                setIsPagoModalOpen(false);
                setSelectedUnidadPago(null);
            }
        });
    };

    // 🔍 Filtro inteligente en tiempo real
    const filteredMototaxis = useMemo(() => {
        if (!searchTerm) return mototaxis;
        const lowSearch = searchTerm.toLowerCase();
        return mototaxis.filter((m) => {
            const numUnidad = m.numero_unidad?.toString() || '';
            const placa = m.placa?.toLowerCase() || '';
            const primerNombre = m.propietario?.name?.toLowerCase() || '';
            const apellido = m.propietario?.apellido?.toLowerCase() || '';
            const nombreCompletoBackend = m.propietario?.nombre_completo?.toLowerCase() || '';
            const nombreCompleto = `${primerNombre} ${apellido} ${nombreCompletoBackend}`;
            const cedula = m.propietario?.cedula?.toString() || '';

            return numUnidad.includes(lowSearch) || 
                   placa.includes(lowSearch) || 
                   nombreCompleto.includes(lowSearch) || 
                   cedula.includes(lowSearch);
        });
    }, [searchTerm, mototaxis]);

    const selectedMototaxi = useMemo(() => {
        return mototaxis.find(m => m.id === data.mototaxi_id);
    }, [data.mototaxi_id, mototaxis]);

    const mesesAnio = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            Estado de Cuenta y Morosidad
                        </h2>
                        <p className="text-xs text-slate-400 font-normal mt-0.5">
                            Resumen unificado de unidades con valores pendientes y meses acumulados
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-indigo-700 transition-all"
                    >
                        <AddOutlinedIcon fontSize="small" />
                        <span>Generar Nueva Deuda</span>
                    </button>
                </div>
            }
        >
            <Head title="Estado de Deudas" />

            <div className="space-y-5">
                {/* 📊 TABLA PRINCIPAL DE DEUDAS */}
                <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <th className="px-6 py-3.5">Unidad / Vehículo</th>
                                <th className="px-6 py-3.5">Propietario</th>
                                <th className="px-6 py-3.5 text-center">Meses Pendientes</th>
                                <th className="px-6 py-3.5">Meses Detallados</th>
                                <th className="px-6 py-3.5">Total Adeudado</th>
                                <th className="px-6 py-3.5">Alerta</th>
                                <th className="px-6 py-3.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {unidadesConDeuda.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <WarningAmberOutlinedIcon className="text-emerald-400" fontSize="large" />
                                            <p className="text-sm font-medium text-slate-600">¡Excelente! Ninguna unidad registra deudas pendientes actualmente.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                unidadesConDeuda.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        className={`hover:bg-slate-50/50 transition-colors ${item.cantidad_meses >= 6 ? 'bg-red-50/30' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            <div className="flex flex-col">
                                                <span className="text-sm">Unidad {item.numero_unidad}</span>
                                                <span className="text-xs font-mono text-slate-400 uppercase">{item.placa}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-slate-700">
                                            {item.propietario ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">{item.propietario.nombre_completo}</span>
                                                    <span className="text-xs text-slate-400 font-mono">C.I. {item.propietario.cedula}</span>
                                                </div>
                                            ) : (
                                                <span className="text-red-400 text-xs font-medium">Sin dueño asignado</span>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${item.cantidad_meses >= 6 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {item.cantidad_meses} {item.cantidad_meses === 1 ? 'Mes' : 'Meses'}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex flex-wrap gap-1">
                                                {item.meses_detallados.map((mes, idx) => (
                                                    <span key={idx} className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200 capitalize">
                                                        {mes}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                                            <span className={item.cantidad_meses >= 6 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}>
                                                ${item.total_deuda}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {item.cantidad_meses >= 6 ? (
                                                <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-600 uppercase tracking-tight bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                                                    <WarningAmberOutlinedIcon fontSize="inherit" />
                                                    <span>Crítico / Suspender</span>
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Regular</span>
                                            )}
                                        </td>

                                        {/* 🛠️ ACCIÓN BOTÓN PAGAR */}
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => openPagoModal(item)}
                                                className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                                            >
                                                <CreditCardOutlinedIcon sx={{ fontSize: 14 }} />
                                                <span>Pagar</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🔳 MODAL REGISTRO DE NUEVAS DEUDAS */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !processing && setIsModalOpen(false)} />

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] z-10 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Asignar Nueva Obligación</h3>
                                <p className="text-xs text-slate-400">Añadir un mes de cobro al historial vehicular</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} disabled={processing} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="modal-form-scroll p-6 space-y-4 flex-1 overflow-y-auto max-h-[calc(90vh-140px)] flex flex-col justify-between">
                            <div className="space-y-4">
                                {Object.keys(errors).length > 0 && (
                                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
                                        <ul className="list-disc list-inside text-xs text-red-600 font-medium">
                                            {Object.entries(errors).map(([key, value]) => <li key={key} className="capitalize"><strong>{key}:</strong> {value}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <div className="relative" ref={dropdownRef}>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Seleccionar Unidad (Buscador)</label>
                                    <div 
                                        onClick={() => !processing && toggleDropdown()}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 bg-slate-50/30 focus-within:bg-white focus-within:border-indigo-500 flex items-center justify-between cursor-pointer select-none"
                                    >
                                        {selectedMototaxi ? (
                                            <div className="flex flex-col text-left">
                                                <span className="font-semibold text-slate-800">
                                                    Unidad N° {selectedMototaxi.numero_unidad} — {selectedMototaxi.propietario?.nombre_completo || <span className="text-red-400 font-normal text-xs">Sin dueño asignado</span>}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono">
                                                    Placa: {selectedMototaxi.placa} {selectedMototaxi.propietario?.cedula ? `| C.I: ${selectedMototaxi.propietario.cedula}` : ''}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">-- Escribe Placa, Cédula, Dueño o Unidad --</span>
                                        )}
                                        <KeyboardArrowDownIcon className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fontSize="small" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Monto ($)</label>
                                        <div className="relative rounded-xl shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <AttachMoneyOutlinedIcon fontSize="small" />
                                            </div>
                                            <input
                                                type="number" step="0.01" value={data.monto}
                                                onChange={(e) => setData('monto', e.target.value)} placeholder="0.00"
                                                className="w-full rounded-xl pl-10 pr-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fecha Vencimiento</label>
                                        <input
                                            type="date" value={data.fecha_vencimiento}
                                            onChange={(e) => setData('fecha_vencimiento', e.target.value)}
                                            className="w-full rounded-xl px-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mes</label>
                                        <select
                                            value={data.mes} onChange={(e) => setData('mes', e.target.value)}
                                            className="w-full rounded-xl px-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white"
                                        >
                                            {mesesAnio.map((m) => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Año</label>
                                        <input
                                            type="number" value={data.anio} onChange={(e) => setData('anio', e.target.value)}
                                            className="w-full rounded-xl px-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Descripción Corta</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <DescriptionOutlinedIcon fontSize="small" />
                                        </div>
                                        <input
                                            type="text" value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)}
                                            placeholder="Ej. Alicuota de Cooperativa"
                                            className="w-full rounded-xl pl-10 pr-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-6 mt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50">Cancelar</button>
                                <button type="submit" disabled={processing} className="inline-flex items-center space-x-2 px-5 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700">
                                    {processing ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon fontSize="small" />}
                                    <span>Guardar Deuda</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔳 MODAL PARA PROCESAR PAGO DE LIQUIDACIÓN */}
            {isPagoModalOpen && selectedUnidadPago && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !pagoForm.processing && setIsPagoModalOpen(false)} />

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full z-10 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">Procesar Recaudación Total</h3>
                            <button onClick={() => setIsPagoModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Resumen de Cuenta</p>
                                <div className="flex justify-between text-sm"><span className="text-slate-600">Unidad Vehicular:</span> <strong className="text-slate-900">N° {selectedUnidadPago.numero_unidad} ({selectedUnidadPago.placa})</strong></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-600">Propietario:</span> <strong className="text-slate-900">{selectedUnidadPago.propietario?.nombre_completo || 'N/A'}</strong></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-600">Meses acumulados:</span> <strong className="text-amber-700 bg-amber-50 px-1.5 rounded text-xs">{selectedUnidadPago.cantidad_meses} meses</strong></div>
                                <div className="border-t border-slate-200/60 my-2 pt-2 flex justify-between text-base"><span className="font-bold text-slate-800">Total a Cancelar:</span> <strong className="text-emerald-600 font-extrabold">${selectedUnidadPago.total_deuda}</strong></div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Observación / Nota de Pago</label>
                                <textarea 
                                    rows="3"
                                    value={pagoForm.data.observacion}
                                    onChange={e => pagoForm.setData('observacion', e.target.value)}
                                    placeholder="Ej. Pago en efectivo por taquilla de administración."
                                    className="w-full rounded-xl px-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white"
                                />
                            </div>

                            {/* Botones de acción del modal de pago principal */}
                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsPagoModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">Cerrar</button>
                                
                                {/* 🔘 BOTÓN MODIFICADO: Ahora abre el aviso de desarrollo */}
                                <button 
                                    type="button" 
                                    onClick={() => setIsDevModalOpen(true)} 
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 shadow-sm"
                                >
                                    <AttachMoneyOutlinedIcon fontSize="inherit" />
                                    <span>Registrar Cobro</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🚨 MODAL: PÁGINA EN DESARROLLO (Aviso emergente) */}
            {isDevModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden p-6 transform transition-all scale-100">
                        
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-50 text-amber-500 mb-4">
                            <WarningAmberOutlinedIcon fontSize="medium" />
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-950">Módulo en Desarrollo</h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                El registro automatizado de cobros y transacciones monetarias se encuentra actualmente en fase de pruebas con la base de datos.
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                Si necesitas asentar este cobro con urgencia en el sistema, comunícate directamente con el desarrollador.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-2">
                            <a 
                                href="https://wa.me/593980659712?text=Hola%20Jonathan%20conforme,%20necesito%20asistencia%20con%20el%20módulo%20de%20cobros%20del%20sistema." 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm text-center"
                            >
                                Contactar 
                            </a>
                            <button 
                                type="button" 
                                onClick={() => setIsDevModalOpen(false)}
                                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

         {/* 🔍 PORTAL DROPDOWN BUSCADOR */}
            {isModalOpen && isDropdownOpen && createPortal(
                <div 
                    id="portal-dropdown-menu"
                    style={{ position: 'fixed', top: `${coords.top}px`, left: `${coords.left}px`, width: `${coords.width}px` }}
                    className="bg-white border border-slate-200 rounded-xl shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-52 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <input
                            type="text" autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por unidad, placa, apellido o cédula..."
                            className="w-full rounded-lg px-3 py-1.5 text-xs border-slate-200 focus:border-indigo-500 focus:ring-0"
                        />
                    </div>

                    <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                        {filteredMototaxis.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">No se encontraron coincidencias</div>
                        ) : (
                            filteredMototaxis.map((m) => (
                                <button
                                    key={m.id} type="button"
                                    onClick={() => {
                                        setData('mototaxi_id', m.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex flex-col transition-colors ${data.mototaxi_id === m.id ? 'bg-indigo-50/60 hover:bg-indigo-50' : ''}`}
                                >
                                    <span className="text-xs font-bold text-slate-800">
                                        Unidad N° {m.numero_unidad} <span className="font-normal font-mono text-slate-400 uppercase">({m.placa})</span>
                                    </span>
                                    <span className="text-[11px] text-slate-500 mt-0.5">
                                        {m.propietario ? (
                                            <>{m.propietario.nombre_completo || `${m.propietario.name || ''} ${m.propietario.apellido || ''}`.trim()} {m.propietario.cedula && ` • C.I. ${m.propietario.cedula}`}</>
                                        ) : (
                                            <span className="text-red-500 text-[10px] font-medium">Sin dueño asignado</span>
                                        )}
                                    </span>
                                </button>
                            )) // <-- Corregido aquí: Cerramos el .map() con )
                        )} {/* <-- Corregido aquí: Cerramos el operador ternario con } */}
                    </div>
                </div>, // <-- Coma obligatoria de createPortal
                document.body
            )
        }
        </AuthenticatedLayout>
    );
}
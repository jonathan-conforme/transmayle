import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react'; 
import { useState, useMemo, useEffect } from 'react';

// Iconos de Material UI
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'; 
import { Snackbar, Alert } from '@mui/material'; // <-- Agregamos Snackbar y Alert

export default function Mototaxis({ mototaxis = {}, propietarios = [] }) {
    // Extraemos el flash de las props de la página
    const { flash } = usePage().props;

    // Estados para la notificación (Toast)
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); 
    
    const [searchPropietario, setSearchPropietario] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Formulario de Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        propietario_id: '',
        placa: '',
        modelo: '',
        numero_unidad: '',
        anio: new Date().getFullYear().toString(),
        estado: 'activo',
        observaciones: '',
    });
    

    // Leer el tipo de notificación cuando Laravel responda
    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setToastSeverity('success'); // Verde
            setToastOpen(true);
        } else if (flash?.info) {
            setToastMessage(flash.info);
            setToastSeverity('info'); // Azul
            setToastOpen(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastSeverity('error'); // Rojo
            setToastOpen(true);
        }
    }, [flash]);

    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') return;
        setToastOpen(false);
    };

    // Filtro de propietarios
    const propietariosFiltrados = useMemo(() => {
        if (!searchPropietario) return propietarios;
        const query = searchPropietario.toLowerCase();
        return propietarios.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.apellido.toLowerCase().includes(query) || 
            p.cedula.includes(query)
        );
    }, [searchPropietario, propietarios]);

    const propietarioSeleccionado = propietarios.find(p => p.id == data.propietario_id);

    // Abrir modal en modo CREAR
    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingId(null);
        setSearchPropietario('');
        setIsModalOpen(true);
    };

    // Abrir modal en modo EDITAR cargando los datos
    const openEditModal = (moto) => {
        clearErrors();
        setEditingId(moto.id);
        setData({
            propietario_id: moto.propietario_id || '',
            placa: moto.placa,
            modelo: moto.modelo,
            numero_unidad: moto.numero_unidad,
            anio: (moto.anio || new Date().getFullYear()).toString(),
            estado: moto.estado,
            observaciones: moto.observaciones || '',
        });
        setSearchPropietario('');
        setIsModalOpen(true);
    };

    // Función para activar/desactivar rápido con un switch desde la tabla
    const handleToggleEstado = (moto) => {
        const nuevoEstado = moto.estado === 'activo' ? 'inactivo' : 'activo';
        
        router.put(`/mototaxis/${moto.id}`, {
            ...moto,
            estado: nuevoEstado
        }, {
            preserveScroll: true, 
        });
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (editingId) {
            put(`/mototaxis/${editingId}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/mototaxis', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            Control de Mototaxis
                        </h2>
                        <p className="text-xs text-slate-400 font-normal mt-0.5">
                            Administración de unidades vehiculares y vinculación con sus dueños
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
                    >
                        <AddOutlinedIcon fontSize="small" />
                        <span>Nueva Unidad</span>
                    </button>
                </div>
            }
        >
            <Head title="Mototaxis" />

            <div className="space-y-5">
                {/* 🔍 BARRA DE BÚSQUEDA GENERAL */}
                <div className="flex items-center max-w-md relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <SearchOutlinedIcon fontSize="small" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por placa, unidad o modelo..."
                        className="w-full rounded-xl pl-10 pr-4 py-2 text-sm border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                    />
                </div>

                {/* TABLA DE MOTOTAXIS */}
                <div className="overflow-x-auto -mx-6 sm:mx-0 rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse bg-white">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <th className="px-6 py-3.5">N° Unidad</th>
                                <th className="px-6 py-3.5">Placa</th>
                                <th className="px-6 py-3.5">Modelo / Año</th>
                                <th className="px-6 py-3.5">Propietario</th>
                                <th className="px-6 py-3.5">Estado (Toggle)</th>
                                <th className="px-6 py-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {!mototaxis.data || mototaxis.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <TwoWheelerOutlinedIcon className="text-slate-300" fontSize="large" />
                                            <p className="text-sm font-medium">No hay mototaxis registradas todavía.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                mototaxis.data.map((moto) => (
                                    <tr key={moto.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs">
                                                Unidad {moto.numero_unidad}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-mono font-medium uppercase">{moto.placa}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {moto.modelo} <span className="text-slate-400 text-xs">({moto.anio || 'N/A'})</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {moto.propietario ? (
                                                <span className="font-medium text-slate-900">{moto.propietario.name} {moto.propietario.apellido}</span>
                                            ) : (
                                                <span className="text-red-400 text-xs">Sin dueño asignado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleEstado(moto)}
                                                    className={`${
                                                        moto.estado === 'activo' ? 'bg-emerald-500' : 'bg-slate-300'
                                                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                                                >
                                                    <span
                                                        className={`${
                                                            moto.estado === 'activo' ? 'translate-x-5' : 'translate-x-0'
                                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                                    />
                                                </button>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${moto.estado === 'activo' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                    {moto.estado}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(moto)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all"
                                                title="Editar Mototaxi"
                                            >
                                                <EditOutlinedIcon fontSize="small" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-slate-100 sm:px-6 rounded-b-xl">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <Link
                                href={mototaxis.prev_page_url || '#'}
                                disabled={!mototaxis.prev_page_url}
                                className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                            >
                                Anterior
                            </Link>
                            <Link
                                href={mototaxis.next_page_url || '#'}
                                disabled={!mototaxis.next_page_url}
                                className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                            >
                                Siguiente
                            </Link>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Mostrando <span className="font-semibold text-slate-700">{mototaxis.from || 0}</span> a{' '}
                                    <span className="font-semibold text-slate-700">{mototaxis.to || 0}</span> de{' '}
                                    <span className="font-semibold text-slate-700">{mototaxis.total || 0}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    {(mototaxis.links || []).map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            disabled={!link.url}
                                            className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold transition-all ${
                                                link.active
                                                    ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                    : 'text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:outline-none'
                                            } ${index === 0 ? 'rounded-l-md' : ''} ${
                                                index === (mototaxis.links?.length - 1) ? 'rounded-r-md' : ''
                                            } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DINÁMICO (REGISTRO / EDICIÓN) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !processing && setIsModalOpen(false)} />

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto z-10 flex flex-col animate-scale-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editingId ? 'Modificar Unidad Vehicular' : 'Registrar Unidad Vehicular'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {editingId ? 'Edita los campos necesarios de la mototaxi' : 'Asocia una nueva mototaxi de forma rápida y asistida'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} disabled={processing} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-4 flex-1">
                            {Object.keys(errors).length > 0 && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1">
                                    <div className="flex items-center space-x-2 text-red-800 font-bold text-xs uppercase tracking-wider">
                                        <ErrorOutlineOutlinedIcon fontSize="small" />
                                        <span>Errores de Validación detectados:</span>
                                    </div>
                                    <ul className="list-disc list-inside text-xs text-red-600 font-medium pl-1">
                                        {Object.entries(errors).map(([key, value]) => (
                                            <li key={key} className="capitalize">
                                                <strong>{key}:</strong> {value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* BUSCADOR DE PROPIETARIO */}
                            <div className="relative">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Propietario / Dueño responsable</label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <PersonOutlineOutlinedIcon fontSize="small" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={`w-full text-left rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-slate-50/30 hover:bg-white transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${errors.propietario_id ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                                    >
                                        {propietarioSeleccionado 
                                            ? `${propietarioSeleccionado.apellido} ${propietarioSeleccionado.name} — (C.I. ${propietarioSeleccionado.cedula})`
                                            : "Haz clic para buscar propietario..."
                                        }
                                    </button>
                                </div>

                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
                                        <div className="absolute left-0 right-0 mt-1 z-30 bg-white border border-slate-200 shadow-xl rounded-xl p-2 max-h-64 overflow-y-auto space-y-2">
                                            <div className="sticky top-0 bg-white pb-1">
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                                        <SearchOutlinedIcon fontSize="small" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={searchPropietario}
                                                        onChange={(e) => setSearchPropietario(e.target.value)}
                                                        placeholder="Escribe apellido, nombre o cédula..."
                                                        className="w-full text-xs rounded-lg pl-8 pr-3 py-1.5 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="divide-y divide-slate-50">
                                                {propietariosFiltrados.length === 0 ? (
                                                    <p className="text-xs text-slate-400 p-3 text-center">No se encontraron resultados</p>
                                                ) : (
                                                    propietariosFiltrados.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setData('propietario_id', p.id);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex flex-col ${data.propietario_id == p.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                                                        >
                                                            <span>{p.apellido} {p.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-mono">C.I. {p.cedula}</span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {errors.propietario_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.propietario_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Número de Unidad</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <NumbersOutlinedIcon fontSize="small" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.numero_unidad}
                                            onChange={(e) => setData('numero_unidad', e.target.value)}
                                            placeholder="Ej. 042"
                                            className={`w-full rounded-xl pl-10 pr-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all ${errors.numero_unidad ? 'border-red-300' : ''}`}
                                        />
                                    </div>
                                    {errors.numero_unidad && <p className="text-red-500 text-xs mt-1 font-medium">{errors.numero_unidad}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Placa</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <TwoWheelerOutlinedIcon fontSize="small" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.placa}
                                            onChange={(e) => setData('placa', e.target.value)}
                                            placeholder="ABC-1234"
                                            className={`w-full rounded-xl pl-10 pr-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all ${errors.placa ? 'border-red-300' : ''}`}
                                        />
                                    </div>
                                    {errors.placa && <p className="text-red-500 text-xs mt-1 font-medium">{errors.placa}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Modelo / Marca</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <TwoWheelerOutlinedIcon fontSize="small" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.modelo}
                                            onChange={(e) => setData('modelo', e.target.value)}
                                            placeholder="Ej. Honda Civic 125"
                                            className={`w-full rounded-xl pl-10 pr-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all ${errors.modelo ? 'border-red-300' : ''}`}
                                        />
                                    </div>
                                    {errors.modelo && <p className="text-red-500 text-xs mt-1 font-medium">{errors.modelo}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Año fabricación</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <CalendarMonthOutlinedIcon fontSize="small" />
                                        </div>
                                        <input
                                            type="number"
                                            value={data.anio}
                                            onChange={(e) => setData('anio', e.target.value)}
                                            className="w-full rounded-xl pl-10 pr-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Estado Operativo</label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <ToggleOnOutlinedIcon fontSize="small" />
                                    </div>
                                    <select
                                        value={data.estado}
                                        onChange={(e) => setData('estado', e.target.value)}
                                        className="w-full rounded-xl pl-10 pr-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-500 transition-all"
                                    >
                                        <option value="activo">Activo (Operando en cooperativa)</option>
                                        <option value="inactivo">Inactivo (Suspendido / Retirado)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Observaciones</label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 pt-2.5 flex items-start pointer-events-none text-slate-400">
                                        <NotesOutlinedIcon fontSize="small" />
                                    </div>
                                    <textarea
                                        value={data.observaciones}
                                        rows={2}
                                        onChange={(e) => setData('observaciones', e.target.value)}
                                        placeholder="Detalles sobre choques, estado mecánico, papeles, etc."
                                        className="w-full rounded-xl pl-10 pr-4 py-2 text-sm border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50">
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processing ? <CircularProgress size={20} color="inherit" /> : <SaveOutlinedIcon fontSize="small" />}
                                    {editingId ? 'Guardar Cambios' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* NOTIFICACIÓN (TOAST DINÁMICO) ARRIBA A LA DERECHA */}
            <Snackbar 
                open={toastOpen} 
                autoHideDuration={4000} 
                onClose={handleCloseToast} 
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
            >
                <Alert 
                    onClose={handleCloseToast} 
                    severity={toastSeverity} 
                    variant="filled" 
                    sx={{ width: '100%', borderRadius: '12px', boxShadow: 3 }}
                >
                    {toastMessage}
                </Alert>
            </Snackbar>
        </AuthenticatedLayout>
    );
}
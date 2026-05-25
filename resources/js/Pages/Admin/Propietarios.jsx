import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react'; // <-- Importamos Link para la paginación
import { useState, useEffect } from 'react';

// Componentes de Material UI para la notificación
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Iconos de Material UI
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

// Ahora propietarios espera la estructura del paginador de Laravel por defecto
export default function Propietarios({ propietarios = { data: [], links: [] } }) {
    // Capturamos las propiedades globales (incluyendo los flash messages de Laravel)
    const { flash } = usePage().props;

    // Estados para modales y notificaciones
   const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success'); // <-- Nuevo estado para el color
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedPropietario, setSelectedPropietario] = useState(null);
    const [propietarioToDelete, setPropietarioToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Formulario reactivo de Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        apellido: '',
        email: '',
        cedula: '',
        telefono: '',
        direccion: '',
    });

    // Escucha cuando el backend envía un mensaje flash de éxito
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

    // Control de Modal de Creación/Edición
    const openCreateModal = () => {
        setSelectedPropietario(null);
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (propietario) => {
        setSelectedPropietario(propietario);
        clearErrors();
        setData({
            name: propietario.name || '',
            apellido: propietario.apellido || '',
            email: propietario.email || '',
            cedula: propietario.cedula || '',
            telefono: propietario.telefono || '',
            direccion: propietario.direccion || '',
        });
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (selectedPropietario) {
            put(`/propietarios/${selectedPropietario.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/propietarios', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    // Control de Modal de Eliminación
    const openDeleteModal = (propietario) => {
        setPropietarioToDelete(propietario);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (propietarioToDelete) {
            router.delete(`/propietarios/${propietarioToDelete.id}`, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setPropietarioToDelete(null);
                },
            });
        }
    };

    // Filtro de búsqueda en tiempo real aplicado sobre propietarios.data
    const filteredPropietarios = (propietarios.data || []).filter((p) => {
        const fullSearch = `${p.name} ${p.apellido} ${p.cedula} ${p.email}`.toLowerCase();
        return fullSearch.includes(searchTerm.toLowerCase());
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            Control de Propietarios
                        </h2>
                        <p className="text-xs text-slate-400 font-normal mt-0.5">
                            Administra y visualiza las cuentas de los dueños de las unidades
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
                    >
                        <AddOutlinedIcon fontSize="small" />
                        <span>Nuevo Propietario</span>
                    </button>
                </div>
            }
        >
            <Head title="Propietarios" />

            <div className="space-y-5">
                {/* Barra de Búsqueda */}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="relative w-full max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <SearchOutlinedIcon fontSize="small" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, cédula o correo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                        Mostrando: {filteredPropietarios.length} de {propietarios.total || 0}
                    </span>
                </div>

                {/* Tabla de Datos */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <th className="py-4 px-6">Propietario</th>
                                    <th className="py-4 px-6">Identificación</th>
                                    <th className="py-4 px-6">Contacto</th>
                                    <th className="py-4 px-6">Dirección</th>
                                    <th className="py-4 px-6 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                                {filteredPropietarios.length > 0 ? (
                                    filteredPropietarios.map((propietario) => (
                                        <tr key={propietario.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-slate-900">
                                                    {propietario.name} {propietario.apellido}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-slate-500">
                                                {propietario.cedula}
                                            </td>
                                            <td className="py-4 px-6 space-y-0.5">
                                                <div className="text-xs text-slate-400">{propietario.email}</div>
                                                <div className="text-xs font-medium text-slate-500">{propietario.telefono}</div>
                                            </td>
                                            <td className="py-4 px-6 max-w-xs truncate text-slate-500">
                                                {propietario.direccion || <span className="text-slate-300 italic">No registrada</span>}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(propietario)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <EditOutlinedIcon fontSize="small" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(propietario)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <DeleteOutlineOutlinedIcon fontSize="small" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400">
                                            No se encontraron propietarios registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* BLOQUE DE PAGINACIÓN ADICIONADO */}
                    {propietarios.links && propietarios.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                            <div className="text-xs text-slate-500">
                                Página <span className="font-semibold">{propietarios.current_page}</span> de <span className="font-semibold">{propietarios.last_page}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                {propietarios.links.map((link, index) => {
                                    // Si no hay URL disponible (ej. botón "Anterior" en la pág 1), renderizamos un span deshabilitado
                                    if (link.url === null) {
                                        return (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 text-xs text-slate-400 border border-slate-200 rounded-lg cursor-not-allowed bg-white select-none"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    // Si hay URL, usamos el componente <Link> de Inertia para peticiones SPA (sin recargar la pantalla)
                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-all ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: CREAR / EDITAR */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Cabecera Modal */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {selectedPropietario ? 'Modificar Datos de Propietario' : 'Registrar Nuevo Propietario'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Asegúrate de llenar correctamente los campos obligatorios.
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Nombre *</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><PersonOutlineOutlinedIcon fontSize="small" /></span>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" placeholder="Ej. Juan" />
                                    </div>
                                    {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>}
                                </div>

                                {/* Apellido */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Apellido *</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><PersonOutlineOutlinedIcon fontSize="small" /></span>
                                        <input type="text" value={data.apellido} onChange={e => setData('apellido', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" placeholder="Ej. Pérez" />
                                    </div>
                                    {errors.apellido && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.apellido}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Cédula */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Cédula *</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><BadgeOutlinedIcon fontSize="small" /></span>
                                        <input type="text" value={data.cedula} onChange={e => setData('cedula', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" placeholder="09xxxxxxxx" />
                                    </div>
                                    {errors.cedula && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.cedula}</p>}
                                </div>

                                {/* Correo */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Correo Electrónico *</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><MailOutlinedIcon fontSize="small" /></span>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" placeholder="juan@correo.com" />
                                    </div>
                                    {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>}
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Teléfono Celular *</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><PhoneOutlinedIcon fontSize="small" /></span>
                                    <input type="text" value={data.telefono} onChange={e => setData('telefono', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" placeholder="0987654321" />
                                </div>
                                {errors.telefono && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.telefono}</p>}
                            </div>

                            {/* Dirección */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Dirección Domiciliaria</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><HomeOutlinedIcon fontSize="small" /></span>
                                    <input type="text" value={data.direccion} onChange={e => setData('direccion', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" placeholder="Ej. Av. Principal y Calle Secundaria" />
                                </div>
                                {errors.direccion && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.direccion}</p>}
                            </div>

                            {/* Footer Modal */}
                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="inline-flex items-center space-x-2 px-5 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all">
                                    <SaveOutlinedIcon fontSize="small" />
                                    <span>{processing ? 'Guardando...' : 'Guardar Propietario'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CONFIRMACIÓN ELIMINAR */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 w-full max-w-md text-center">
                        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600 mb-4">
                            <DeleteOutlineOutlinedIcon />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">¿Eliminar este Propietario?</h3>
                        <p className="text-xs text-slate-400 mt-2">
                            Esta acción borrará a <strong>{propietarioToDelete?.name} {propietarioToDelete?.apellido}</strong> del sistema de manera irreversible.
                        </p>
                        <div className="flex items-center justify-center space-x-3 mt-6">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                                Cancelar
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 active:scale-[0.98] transition-all">
                                Eliminar Definitivamente
                            </button>
                        </div>
                    </div>
                </div>
            )}

          {/* NOTIFICACIÓN (TOAST DINÁMICO) */}
            <Snackbar 
                open={toastOpen} 
                autoHideDuration={4000} 
                onClose={handleCloseToast} 
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // <-- Cambiado a 'top' (arriba)
            >
                <Alert 
                    onClose={handleCloseToast} 
                    severity={toastSeverity} // <-- Cambia el color dinámicamente
                    variant="filled" 
                    sx={{ width: '100%', borderRadius: '12px', boxShadow: 3 }}
                >
                    {toastMessage}
                </Alert>
            </Snackbar>

        </AuthenticatedLayout>
    );
}
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Importación de Iconos de Material UI
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined'; // Para las rutas/carreras con origen y destino
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined'; // Para los mandados/encargos express
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'; // Para delimitar las zonas de cobro de la mototaxi

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';
    };

    // Estructura de navegación (con iconos en versión 'Outlined' que dan mejor UX)
    const navigationLinks = [
        { name: 'Dashboard', route: 'dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
        { name: 'Propietarios', route: 'propietarios.index', icon: <GroupOutlinedIcon fontSize="small" /> },
        { name: 'Mototaxis', route: 'mototaxis.index', icon: <TwoWheelerOutlinedIcon fontSize="small" /> },
         { name: 'Deudas', route: 'deudas.index', icon: <RequestQuoteOutlinedIcon fontSize="small" /> },
       // --- 🏁 MVP 2: Módulo de Carreras, Destinos y Encomiendas en Moto ---
    { 
        name: 'Despacho de Carreras', 
        route: 'dashboard', // En el MVP 2 apuntará a 'carreras.index'
        icon: <AltRouteOutlinedIcon fontSize="small" />, // Icono de rutas/vías
        isMvp2: true,
        detail: 'Origen, Destino y Pasajero'
    },
    { 
        name: 'Mandados / Encomiendas', 
        route: 'dashboard', // En el MVP 2 apuntará a 'encomiendas.index'
        icon: <LocalPostOfficeOutlinedIcon fontSize="small" />, // Icono de entregas rápidas
        isMvp2: true,
        detail: 'Envíos pequeños en moto'
    },
    { 
        name: 'Sectores y Tarifas', 
        route: 'dashboard', // En el MVP 2 apuntará a 'sectores.index'
        icon: <MapOutlinedIcon fontSize="small" />, // Icono de mapa de cobertura
        isMvp2: true,
        detail: 'Precios por zonas'
    }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-800">
            
            {/* 📱 NAVBAR MÓVIL (Limpia y minimalista) */}
            <div className="bg-white border-b border-slate-200/80 px-5 py-3.5 flex items-center justify-between md:hidden sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
                <Link href="/" className="flex items-center space-x-2">
                    <ApplicationLogo className="block h-8 w-auto text-indigo-600 fill-current" />
                    <span className="font-bold text-slate-900 text-sm tracking-tight">Tricimotos</span>
                </Link>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none"
                >
                    {isSidebarOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
                </button>
            </div>

            {/* 🖥️ SIDEBAR PREMIUM CLARO */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                transition-transform duration-200 ease-in-out
                md:translate-x-0 md:static md:h-screen flex flex-col justify-between
            `}>
                
                <div>
                    {/* Header del Sidebar */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-100">
                        <Link href="/" className="flex items-center space-x-2.5 group">
                            <ApplicationLogo className="block h-8 w-auto text-indigo-600 fill-current transition-transform group-hover:scale-105 duration-200" />
                            <span className="text-slate-900 font-bold tracking-tight text-base">Tricimotos App</span>
                        </Link>
                    </div>

                    {/* Links de Navegación con UX Mejorada */}
                    <nav className="mt-5 px-3 space-y-1">
                        {navigationLinks.map((link) => {
                            const isActive = route().current(link.route);
                            return (
                                <Link
                                    key={link.name}
                                    href={route(link.route)}
                                    className={`
                                        flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                                        ${isActive 
                                            ? 'bg-indigo-50 text-indigo-600' 
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    <span className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                        {link.icon}
                                    </span>
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Info de Usuario Inferior (Sidebar Desktop) */}
                <div className="p-4 border-t border-slate-100 hidden md:block bg-slate-50/50">
                    <div className="flex items-center space-x-3 p-1.5 rounded-xl">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-700">
                            {getInitials(user.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 🖤 OVERLAY PARA MÓVIL */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
                />
            )}

            {/* 📦 ÁREA DE CONTENIDO */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                
                {/* TOPBAR SUPERIOR (Limpia) */}
                <header className="bg-white h-16 border-b border-slate-200/80 hidden md:flex items-center justify-between px-8 sticky top-0 z-30">
                    <div className="text-xs font-medium text-slate-400 tracking-wider uppercase">
                        Panel de Control Interno
                    </div>

                    {/* Menú Dropdown de Usuario */}
                    <div className="flex items-center">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button type="button" className="inline-flex items-center space-x-2.5 rounded-xl p-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-bold text-white shadow-sm shadow-indigo-600/10">
                                        {getInitials(user.name)}
                                    </div>
                                    <span className="max-w-[140px] truncate text-slate-700 text-xs font-semibold">{user.name}</span>
                                    <KeyboardArrowDownIcon fontSize="small" className="text-slate-400 -ms-1" />
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content width="48" align="right" className="rounded-xl shadow-xl border border-slate-100 py-1 bg-white">
                                <Dropdown.Link href={route('profile.edit')} className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                                    <AccountCircleOutlinedIcon fontSize="small" className="text-slate-400" />
                                    <span>Mi Perfil</span>
                                </Dropdown.Link>
                                <div className="border-t border-slate-100 my-1"></div>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="flex w-full items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left">
                                    <LogoutOutlinedIcon fontSize="small" className="text-red-400" />
                                    <span>Cerrar Sesión</span>
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* CONTENIDO INTERNO */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {header && (
                        <div className="mb-6">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                {header}
                            </h1>
                        </div>
                    )}
                    
                    {/* Lienzo en Blanco Premium para las Tablas o Formularios */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm min-h-[calc(100vh-12rem)]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
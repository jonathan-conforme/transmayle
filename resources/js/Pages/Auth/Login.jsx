import { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

// Importación de Iconos de Material UI
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            {/* Contenedor Principal Adaptable */}
            <div className="w-full max-w-md mx-auto sm:px-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight sm:text-3xl">
                        ¡Bienvenido de nuevo!
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Ingresa tus credenciales para acceder al sistema
                    </p>
                </div>

                {status && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-sm font-medium text-green-600 rounded-lg shadow-sm">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    {/* Campo de Correo Electrónico */}
                    <div>
                        <InputLabel htmlFor="email" value="Correo Electrónico" className="text-gray-700 font-medium" />
                        <div className="mt-1.5 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <EmailIcon fontSize="small" />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full pl-10 pr-4 py-2.5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition duration-150 ease-in-out"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="tu@correo.com"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    {/* Campo de Contraseña */}
                    <div>
                        <InputLabel htmlFor="password" value="Contraseña" className="text-gray-700 font-medium" />
                        <div className="mt-1.5 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <LockIcon fontSize="small" />
                            </div>
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="block w-full pl-10 pr-11 py-2.5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition duration-150 ease-in-out"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            {/* Botón interactivo para alternar visibilidad */}
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    {/* Opciones Adicionales (Recuérdame y Olvidé mi contraseña) */}
                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between pt-1">
                        <label className="inline-flex items-center cursor-pointer select-none">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ms-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                Recordarme en este equipo
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-4 decoration-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>

                    {/* Botón de Enviar */}
                    <div className="pt-2">
                        <PrimaryButton 
                            className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-150 flex items-center space-x-2 disabled:opacity-50" 
                            disabled={processing}
                        >
                            <LoginIcon fontSize="small" />
                            <span>Iniciar Sesión</span>
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
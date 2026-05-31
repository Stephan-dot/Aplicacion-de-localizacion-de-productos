import { useNavigate, Link } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { MapPin, Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

// GRASP: Controller - maneja el flujo de login y coordina la llamada al contexto de autenticación.
export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const {register, handleSubmit, formState: {errors}}= useForm({mode: 'onChange'})
  
  const onSubmit = async (data) => { 
    const response = await login(data.email, data.password); 
    
    if (response.success) {
      console.log("Respuesta del login:", response);
      toast.success(response.message);
      navigate('/home');
    } else {
      toast.error(response.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-4">
            <MapPin className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Donde Hay Cuba</h1>
          <p className="text-emerald-100">Encuentra medicamentos y alimentos cerca de ti</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="correo@ejemplo.com"
                  {...register("email", {
                    required: 'El correo es obligatorio',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Formato de correo invalido'
                    }
                  })}
                />
              </div>
              {errors.email && <p className='text-red-500'>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 " />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  {...register('password', {
                    required: 'La constraseña es obligatoria',
                    minLength: {
                      value: 8,
                      message: "Debe tener al menos 8 caracteres"
                    },
                    validate: (value)=>{
                      if(!/[A-Z]/.test(value)) return 'Debe contener una mayuscula';
                      if(!/[0-9]/.test(value)) return 'Debe contener un numero';
                      if(!/[!@#$%^&*(){};:"/]/.test(value)) return 'Debe contener un caracter especial';
                    }
                  })}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className='text-red-500'>{errors.password.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Entrar
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

import { useNavigate } from 'react-router';
import { MapPin, Home } from 'lucide-react';
import { motion } from 'motion/react';

// GRASP: Controller - maneja la ruta de error 404 y navegación de retorno.
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-500 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <MapPin className="w-16 h-16 text-emerald-500" />
        </motion.div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-white mb-8">Página no encontrada</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold shadow-lg flex items-center gap-2 mx-auto"
        >
          <Home className="w-5 h-5" />
          Volver al Inicio
        </motion.button>
      </motion.div>
    </div>
  );
}

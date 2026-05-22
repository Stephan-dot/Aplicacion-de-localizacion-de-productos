import { Link, useLocation, useNavigate } from 'react-router';
import { Home, Search, MapPin, User, ShieldCheck, PlusCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'motion/react';

// GRASP: Controller - decide qué rutas mostrar en la navegación según el usuario.
export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const navItems = [
    { path: '/home', icon: Home, label: 'Inicio' },
    { path: '/buscar', icon: Search, label: 'Buscar' },
    { path: '/mapa', icon: MapPin, label: 'Mapa' },
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];
  if (currentUser?.labels[0] === 'admin') {
    navItems.push({ path: '/admin', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-emerald-200 z-50 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-emerald-700">Donde Hay Cuba</h1>
              <p className="text-xs text-gray-500">Encuentra lo que necesitas</p>
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/productos/nuevo')}
            className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <PlusCircle className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-emerald-200 z-50 shadow-lg">
        <div className="max-w-lg mx-auto px-2 h-20 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1 px-3 py-2"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    className={`p-2 rounded-full ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-gray-500'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span
                    className={`text-xs ${
                      isActive ? 'text-emerald-600 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Store, Package, TrendingUp, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect} from 'react';
import Loading from './Loading';

// GRASP: Controller - coordina la presentación de dashboard en función del estado global.
export default function Home() {
  const navigate = useNavigate();
  const { currentUser, products, loading,commerces, fetchData } = useApp();

  const topProducts = [...products]
    .sort((a, b) => b.votantes.length -a.votantes.length)
    .slice(0, 3);

  const stats = [
    { label: 'Productos', value: products.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Comercios', value: commerces.length, icon: Store, color: 'bg-purple-500' },
    { label: 'Disponibles', value: products.filter(p => p.esDisponible).length, icon: TrendingUp, color: 'bg-emerald-500' }
  ];

  /*useEffect(()=>{
      const loadData = async()=>{
        await fetchData();
      }
      loadData(); 
    },[])*/

  return (
    loading ? (
      <div className="col-span-3 py-8">
        <Loading message="Cargando estadísticas..." />
      </div>
    ) : (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl p-6 text-white shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-2">¡Hola, {currentUser?.name}!</h2>
        <p className="text-emerald-100">¿Qué necesitas encontrar hoy?</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/comercios/nuevo')}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Store className="w-10 h-10 text-purple-500 mb-3 mx-auto" />
            <p className="font-semibold text-gray-800">Agregar Comercio</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/productos/nuevo')}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Package className="w-10 h-10 text-emerald-500 mb-3 mx-auto" />
            <p className="font-semibold text-gray-800">Agregar Producto</p>
          </motion.button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Más Votados</h3>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="space-y-3">
          {topProducts.map((product, index) => {
            const commerce = commerces.find(c => c.$id === product.comercioId);
            return (
              <motion.div
                key={product.$id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate('/mapa')}
                className="bg-white rounded-2xl p-4 shadow-lg flex gap-4 cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={product.fotoUrl}
                    alt={product.producto}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{product.producto}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{commerce?.nombre}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-emerald-600 font-bold">${product.precio}</span>
                    <span className="text-sm text-gray-500">👍 {product.votantes.length}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
        ));
}

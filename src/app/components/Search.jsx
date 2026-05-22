import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Search as SearchIcon, Filter, MapPin, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// GRASP: Controller - gestiona la búsqueda y filtrado de productos usando el contexto.
export default function Search() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('todos');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { searchProducts, commerces, obtenerUbicacionUsuario, setSelectedProductFromSearch } = useApp();
  const navigate = useNavigate();
  let results = []; 
  results = searchProducts(query, type, parseFloat(maxPrice) || 0, location);
  console.log("RESULTADO DE BUSQUEDA: ", results)

  const handleObtenerUbicacion = async () => {
    const ubicacion = await obtenerUbicacionUsuario();
    setLocation(ubicacion);
    console.log('Ubicacion del usuario', ubicacion)
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Buscar</h1>
        <p className="text-gray-600">Encuentra productos y comercios</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-4 space-y-4"
      >
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="Buscar productos..."
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-center gap-2 py-2 text-emerald-600 font-medium"
        >
          <Filter className="w-5 h-5" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setShowFilters(!showFilters);
            setQuery('');
            setType('todos');
            setMaxPrice('');
            setLocation('');
          }}
          className="w-full flex items-center justify-center gap-2 py-2 text-emerald-600 font-medium"
        >
          <Filter className="w-5 h-5" />
           Restablecer Filtros
        </motion.button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Producto
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="todos">Todos</option>
                  <option value="medicamento">Medicamentos</option>
                  <option value="alimento">Alimentos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Máximo
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={location? `${location.lat}, ${location.lng}`: ''}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Ubicacion"
                  />
                  <button
                    className='absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-2 rounded-xl'
                    onClick={handleObtenerUbicacion}>
                    Productos cercanos
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-800">
          {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
        </h2>
        {results.length > 0 ? (
          results.map((product, index) => {
          const commerce = commerces.find(c => c.$id === product.comercioId);
          return (
            <motion.div
              key={product.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                setSelectedProductFromSearch(product.$id);
                navigate('/mapa', { state: { fromSearchProductId: product.$id } });
              }}
              className="bg-white rounded-2xl p-4 shadow-lg flex gap-4 cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={product.fotoUrl}
                  alt={product.producto}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 mb-1">{product.producto}</h3>
                <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium mb-2 ${
                  product.tipo === 'medicamento'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {product.tipo === 'medicamento' ? 'Medicamento' : 'Alimento'}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{commerce?.nombre}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 font-bold text-lg">${product.precio}</span>
                  <span className="text-sm text-gray-500">👍 {product.votantes.length}</span>
                </div>
              </div>
            </motion.div>
          );
        })
        ):(
          <p>No hay productos relacionados</p>
        )}
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { User, Store, Package, LogOut, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useEffect, useState} from 'react';
import Loading from './Loading';

// GRASP: Controller - administra operaciones de perfil y acciones del usuario.
export default function Profile() {
  const { currentUser, logout, commerces, products, deleteCommerce, deleteProduct,  loading } = useApp();
  const navigate = useNavigate();
   
  const userCommerces = commerces.filter(c => c.userId === currentUser.$id);
  const userProducts = products.filter(p => p.userId === currentUser.$id);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };
  
  const handleDeleteCommerce = async (id, name) => {
    toast.custom((t) => (
      <div className="space-y-3 text-left bg-white  rounded-2xl p-4 shadow-lg shadow-black/20 absolute bottom-4 -right-2 w-80">
        <p>¿Estás seguro de eliminar el comercio "{name}"? Esto también eliminará todos sus productos.</p>
        <div className="flex justify-end gap-2">
          <button
            className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
          <button
            className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id);
              const response = await deleteCommerce(id);
              if (response) {
                toast.success('Comercio eliminado');
              } else {
                toast.error('Error al eliminar el comercio');
              }
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    ));
  };

  const handleUpdateProduct = async (id) => {
    if(id){
      navigate(`/producto/edit/${id}`)
    }else{
      toast.error('Por favor seleccione un producto');
    }
  } 

  const handleUpdateCommerce = async (id) => {
    if(id){
      navigate(`/comercio/edit/${id}`)
    }else{
      toast.error('Por favor seleccione un comercio'); 
    }
  };

  const handleDeleteProduct = async (id, name) => {
    toast.custom((t) => (
      <div className="space-y-3 text-left bg-white  rounded-2xl p-4 shadow-lg shadow-black/20 absolute bottom-4 -right-2 w-80">
        <p>{`¿Estás seguro de eliminar el producto "${name}"?`}</p>
        <div className="flex justify-end gap-2 ">
          <button
            className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
          <button
            className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id);
              const response = await deleteProduct(id);
              if (response) {
                toast.success('Producto eliminado');
              } else {
                toast.error('Error al eliminar el producto');
              }
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    ));
  };

  return (
    loading?(
    <div className="col-span-3 text-center py-8">
      <Loading message="Cargando datos..." />
    </div>):(
      <div className="max-w-lg mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
            <p className="text-emerald-100">{currentUser?.email}</p>
            <p className="text-emerald-100">{currentUser?.phone}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full bg-white/20 backdrop-blur-lg text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </motion.button>
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="w-6 h-6 text-purple-500" />
            Mis Comercios ({userCommerces.length})
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/comercios/nuevo')}
            className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white"
          >
            +
          </motion.button>
        </div>
        {userCommerces.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No tienes comercios registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userCommerces.map((commerce, index) => (
              <motion.div
                key={commerce.$id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{commerce.nombre}</h4>
                    <p className="text-sm text-gray-500">{commerce.direccion}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={() => handleUpdateCommerce(commerce.$id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDeleteCommerce(commerce.$id, commerce.nombre)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-500" />
            Mis Productos ({userProducts.length})
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/productos/nuevo')}
            className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white"
          >
            +
          </motion.button>
        </div>
        {userProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No tienes productos registrados</p>
          </div>
        ) : (
          <div className="space-y-3 relative">
            {userProducts.map((product, index) => (
              <motion.div
                key={product.$id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-lg flex gap-4"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={product.fotoUrl}
                    alt={product.producto}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 mb-1">{product.producto}</h4>
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium mb-2 ${
                    product.tipo === 'medicamento'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {product.tipo === 'medicamento' ? 'Medicamento' : 'Alimento'}
                  </span>
                  <div className="flex items-center justify-between ">
                    <span className="text-emerald-600 font-bold">${product.precio}</span>
                    <span className="text-sm text-gray-500">👍 {product.votantes.length}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-start absolute right-2">
                  <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={() => handleUpdateProduct(product.$id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDeleteProduct(product.$id, product.producto)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
        ));
}

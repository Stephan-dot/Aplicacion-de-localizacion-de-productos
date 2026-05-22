import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { ShieldCheck, Users, Store, Package, Ban, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { adminService } from '../service/admin-service';
import Loading from './Loading';

// GRASP: Controller - ordena el flujo de administración y usa datos globales del contexto.
export default function Admin() {
  const { currentUser, users, setUsers, comments, commerces,loading, products, refreshUsers, fetchData,blockUser } = useApp();
  const navigate = useNavigate();
  const [selectedId, setSelectedId]= useState([]); 
  const [expandedProducts, setExpandedProducts] = useState([]);
  
  const toggleComments = (productId) => {
    setExpandedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  useEffect(() => {
    if (currentUser?.labels?.[0] === 'admin') {
      // Solo hacer refresh si users está vacío
      if (Array.isArray(users) && users.length === 0) {
        refreshUsers();
      }
    }
  }, [currentUser]);

  if (currentUser?.labels?.[0] !== 'admin') {
    navigate('/home');
    return null;
  }

  const topProducts = [...products]
    .sort((a, b) => {
        a.votantes.length - b.votantes.length
    })
    .slice(0, 5);
  const handleCheckboxChange = (id)=>{
    console.log("ID seleccionado", id); 
    setSelectedId(prev => prev.includes(id) 
            ? prev.filter(selectedId => selectedId !== id) 
            : [...prev, id]
        );
  }
  const handleBlockUser = (userId, userName, isBlocked) => {
    if (confirm(`¿Estás seguro de ${isBlocked ? 'desbloquear' : 'bloquear'} a ${userName}?`)) {
      blockUser(userId);
      toast.success(`Usuario ${isBlocked ? 'desbloqueado' : 'bloqueado'}`);
    }
  };
  const handleDeleteUser =async () => {
    let aux= false;
    if (!currentUser) {
      showToast('Debes iniciar sesión para eliminar comercios', 'error')
      return;
    }
    try {
      for(const userId of selectedId){
        console.log("ID a eliminar", userId);
        try {
          const result = await adminService.deleteUser(userId); 
          console.log("Resultado obtenido a eliminar", result); 
          if(result.success){
            aux=true;
          }
        } catch (error) {
          aux=false;
          toast.error('Error al eliminar usuario',error);
          console.error(`Error Eliminando usuario:`, error);
          
        }
      }
      if(aux) {
        console.log('auxdespues de eliminar', aux);
        const dbusers = await adminService.getAllUsers();
        setUsers(dbusers.data);
        setSelectedId([]);
        toast.success('Usuario(s) eliminado(s) correctamente');
      }
      
    } catch (error) {
      console.error('Error general al eliminar usuario', error)
      toast.error('Error al eliminar usuario')
    }
  };

  return (
    loading ? (
      <div className="col-span-3 py-8">
        <Loading message="Cargando estadísticas..." />
      </div>
    ) : (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-10 h-10" />
          <div>
            <h1 className="text-3xl font-bold">Panel de Administrador</h1>
            <p className="text-purple-100">Gestión completa del sistema</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-4 shadow-lg"
        >
          <Users className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{Array.isArray(users) ? users.length : 0}</p>
          <p className="text-sm text-gray-500">Usuarios</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-lg"
        >
          <Store className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{commerces.length}</p>
          <p className="text-sm text-gray-500">Comercios</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-lg"
        >
          <Package className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
          <p className="text-sm text-gray-500">Productos</p>
        </motion.div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
          Ranking de Productos
        </h2>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {topProducts.map((product, index) => {
            const commerce = commerces.find(c => c.id === product.commercioId);
            const user = Array.isArray(users) ? users.find(u => u?.id === product.userId) : null;
            return (
              <motion.div
                key={product.$id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    #{index + 1}
                  </div>
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={product.fotoUrl}
                      alt={product.producto}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{product.producto}</h3>
                    <p className="text-sm text-gray-500">
                      {commerce?.nombre} • Por {user?.name}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-emerald-600 font-bold">${product.precio}</span>
                      <span className="text-sm text-gray-500">
                        👍 {product.votantes.length} votos
                      </span>
                      <span className="text-sm text-gray-500">
                        💬 {comments.filter(comment => comment.productId === product.$id).length} comentarios
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleComments(product.$id)}
                      className="mt-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {expandedProducts.includes(product.$id) ? 'Ocultar comentarios' : 'Mostrar comentarios'}
                    </button>
                  </div>
                </div>
                
               {expandedProducts.includes(product.$id) && comments.length > 0 && (
                  <div className="mt-3 pl-16 space-y-2">
                    {comments
                      .filter(comment => comment.productId === product.$id)
                      .map((comment) => {
                        const aux = users.find(u => u.$id === comment.userId);
                        return(
                          <div key={comment.$id} className="bg-gray-100 border border-black-300 rounded-lg p-2 text-sm">
                            <p className="font-semibold text-gray-700">{aux?.email}</p>
                            <p className="text-gray-600">{comment.content}</p>
                          </div>
                        )})}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          Usuarios
        </h2>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {Array.isArray(users) && users.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between ">
                <div className="flex-1 relative">
                  <label htmlFor={`${index}`} className='absolute w-full h-full'></label>
                  <input
                  id={`${index}`}
                  type="checkbox"
                  checked={selectedId.includes(user.$id)}
                  onChange={() => handleCheckboxChange(user.$id)}
                  className=''/>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                    {user.labels[0] === 'admin' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg font-medium">
                        Admin
                      </span>
                    )}
                    {user.blocked && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-medium">
                        Bloqueado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>
                      {commerces.filter(c => c.userId === user.id).length} comercios
                    </span>
                    <span>
                      {products.filter(p => p.userId === user.id).length} productos
                    </span>
                  </div>
                </div>
                {user.labels[0] !== 'admin' && (
                  <div className='flex flex-col gap-2'>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBlockUser(user.id, user.name, user.blocked)}
                      className={`px-2 py-2 rounded-xl font-semibold flex items-center gap-1 ${
                        user.blocked
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                      {user.blocked ? 'Desbloquear' : 'Bloquear'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeleteUser}
                      className={`px-2 py-2 rounded-xl font-semibold flex items-center gap-1 ${
                        user.blocked
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                      {'Eliminar'}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    )
  );
}

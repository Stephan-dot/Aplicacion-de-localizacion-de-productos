import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLocation } from 'react-router';
import { MapPin, X, ThumbsUp, ThumbsDown, MessageCircle, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import CubaMap from './CubaMap';
import { set } from 'date-fns';
import Loading from './Loading';

// GRASP: Controller - coordina selección de productos y acciones de voto/comentario.
export default function Map() {
  const { products, commerces, loading, voteProduct, addComment, deleteComment, users, comments, selectedProductFromSearch, setSelectedProductFromSearch } = useApp();
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [commentText, setCommentText] = useState('');
  const product = products.find(p => p.$id === selectedProduct);
  const comment = product? comments.filter(c => c.productId === product.$id) : null;
  const commerce = product ? commerces.find(c => c.$id === product.comercioId) : null;
  const [checkVote, setCheckVote] = useState(false);

  const handleVote = async (productId, vote) => {
    if(vote>0){
      setCheckVote(true);
    }else{
      setCheckVote(false);
    }
    const response = await voteProduct(productId, vote);
    if(response){
    toast.success(vote > 0 ? '¡Voto positivo registrado!' : 'Voto negativo registrado');
    }else{
      toast.error('Ya has votado este producto');
    }
  };

  const handleComment = async (productId) => {
    if (!commentText.trim()) return;
    const success = await addComment(productId, commentText);
    if (success) {
      setCommentText('');
      toast.success('¡Comentario agregado!');
    } else {
      toast.error('Error al agregar comentario');
    }
  };
  const handleDeleteComment = async (id)=>{
    const success = await deleteComment(id);
    if (success) {
      setCommentText('');
      toast.success('¡Comentario eliminado!');
    } else {
      toast.error('Error al eliminar comentario');
    }
  }

  useEffect(() => {
    const searchProductId = location.state?.fromSearchProductId;
    if (searchProductId) {
      setSelectedProductFromSearch(searchProductId);
      return;
    }

    if (selectedProductFromSearch) {
      setSelectedProductFromSearch(null);
    }
  }, [location.state, selectedProductFromSearch, setSelectedProductFromSearch]);

  return (
    loading ? (<Loading message="Cargando datos..." />):
    (<div className="max-w-lg mx-auto h-[calc(100vh-9rem)] relative">
      {/* Contenedor del mapa - sin overflow-hidden que bloquea el desplazamiento */}
      <div className="absolute inset-0">
        <CubaMap onProductSelect={setSelectedProduct} selectedProductFromSearch={selectedProductFromSearch} />
      </div>

      <AnimatePresence>
        {selectedProduct && product && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[70%] overflow-y-auto z-30"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">{product.producto}</h2>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium mt-2 ${
                    product.tipo === 'medicamento'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {product.tipo === 'medicamento' ? 'Medicamento' : 'Alimento'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </motion.button>
              </div>

              <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={product.fotoUrl}
                  alt={product.producto}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Precio</p>
                  <p className="text-2xl font-bold text-emerald-600">${product.precio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Comercio</p>
                  <p className="font-semibold text-gray-800">{commerce?.nombre}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Direccion</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {commerce?.direccion ? `${commerce.direccion}` : 'Direccion no disponible'}
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVote(product.$id, 1)}
                    className={`flex-1 ${checkVote ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}  py-3 rounded-xl font-semibold flex items-center justify-center gap-2`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  Me Gusta ({product.votantes.length || 0})
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVote(product.$id, -1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="w-5 h-5" />
                  No Disponible
                </motion.button>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-emerald-500" />
                  Comentarios ({comment?.length || 0})
                </h3>
                <div className="space-y-3 mb-4">
                  {comment && comment.map((commen, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start gap-2 justify-between mb-1">
                        <p className="font-semibold text-sm text-gray-800 w-65">
                          {users.find(u => u.$id === commen.userId)?.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 w-27">
                          {commen.fechaComentario ? new Date(commen.fechaComentario).toLocaleDateString() : new Date().toLocaleDateString()}
                        </p>
                        <Trash2 className='w-8 h-5 hover:text-gray-700 cursor-pointer' onClick={() => handleDeleteComment(commen.$id)} />
                      </div>
                      <p className="text-sm text-gray-700">{commen.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(product.$id)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleComment(product.$id)}
                    className="px-4 bg-emerald-500 text-white rounded-xl"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>)
  );
}
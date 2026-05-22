import { useParams, useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Package, DollarSign, ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useEffect, useState} from 'react';
import { ID } from 'appwrite';
import { storage } from '../service/appwrite-config';

// GRASP: Controller - coordina la edición de producto y reutiliza datos del contexto.
export default function EditProduct() {
  const { register, handleSubmit, reset, watch, formState: { errors }} = useForm({mode: 'onChange'});
  const { commerces, products, currentUser, obtener, updateProduct } = useApp();
  const navigate = useNavigate();
  const [fotoPreview, setFotoPreview] = useState(null);
  const [uploadImage, setUploadImage] = useState('');
  const [originalCommerceId, setOriginarlCommerceId] =useState('')
  const {id}=useParams()
  const userCommerces = commerces.filter(c => c.userId === currentUser.$id);
  const selectedType = watch('type');

  useEffect(()=>{
    const obtenerProducto = async(id) => {
      try {
        const producto = await obtener(id, 'Producto'); 
        console.log("Producto: ", producto);
        const comercio = await obtener(producto[0].comercioId, 'Comercio')
        setOriginarlCommerceId(comercio[0].$id)
        setFotoPreview(producto[0].fotoUrl); 
        console.log("Comercio: ", comercio);
        // Resetear el formulario con los datos del comercio
        reset({
        name: producto[0].producto ,
        type: producto[0].tipo,
        commerceId: producto[0].comercioId,
        price: producto[0].precio,
        //image: producto[0].fotoUrl,
        available: producto[0].esDisponible
        // No incluyas ubicacion aquí porque es un campo separado
        });
        
      } catch (error) {
        console.error("Error editar producto", error.message);
        throw new Error(`${error.message}`); 
      }
    }
          
    if(id) {
      obtenerProducto(id);
    }
  }, [id, reset])

  const handleFileChange = (e) =>{
    console.log('Cambiando');
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error('Por favor solo se permiten imagenes', 'error')
        return;
      }
            
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 2MB', 'error')
        return;
      }
      
      setUploadImage(file);
            
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
        reader.readAsDataURL(file);
      }
    }

  const onSubmit = async (data) => {
    let fotoUrl ='';
    const commerce = commerces.find(c => c.$id === data.commerceId);
    const product = products.find(p=>p.$id ===id); 
    if (!commerce) {
      toast.error('Comercio no encontrado');
      return;
    }

    if (uploadImage) {
      const fileId = ID.unique();
              await storage.createFile(
              import.meta.env.VITE_STORAGE_ID, // Bucket ID
              fileId,
              uploadImage
              );
      fotoUrl = `https://cloud.appwrite.io/v1/storage/buckets/6836a7d200386f17c01b/files/${fileId}/view?project=6836a79400199dcfe521&mode=admin`
                        ; 
    }

    const productImages = {
      medicamento: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
        'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
        'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
      ],
      alimento: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
        'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
      ],
    };

    const randomImage = productImages[data.type][Math.floor(Math.random() * productImages[data.type].length)];
    
    const productData = {
      producto: data.name,
      tipo: data.type,
      ubicacion: [22, -82],
      precio: parseFloat(data.price),
      esDisponible: data.available,                    
      comercioId: commerce.$id,
      fotoUrl: fotoUrl || product.fotoUrl,
    };
    
    const response = await updateProduct(id, productData);
    if(response){
      toast.success('¡Producto registrado exitosamente!');
      reset(); // Limpiar el formulario
      navigate('/perfil');
    }else{
      toast.error('Error al agregar producto');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Editar Producto</h1>
        <p className="text-gray-600 mt-2">Editar un nuevo producto disponible</p>
      </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-white" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nombre del Producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Paracetamol 500mg"
                {...register('name', {
                  required: 'El nombre del producto es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'El nombre debe tener al menos 3 caracteres'
                  },
                  maxLength: {
                    value: 100,
                    message: 'El nombre no puede exceder 100 caracteres'
                  },
                  pattern: {
                    value: /^[a-zA-ZáéíóúñÑüÜ0-9\s]+$/,
                    message: 'El nombre solo puede contener letras, números y espacios'
                  },
                  validate: (value) => {
                    if (value.trim().length === 0) return 'El nombre no puede estar vacío';
                    if (value.length < 3) return 'El nombre es demasiado corto';
                    if(!/[A-Z]/.test(value)) return 'El nombre debe empezar con mayuscula';
                    if(/[0-9]/.test(value)) return 'El nombre no debe contener numeros';
                    return true;
                  }
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
                        {/* Tipo de Producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Producto *
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none bg-white"
                {...register('type', {
                  required: 'Debes seleccionar un tipo de producto'
                })}
              >
                <option value="medicamento">medicamento</option>
                <option value="alimento">alimento</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>
            {/* Comercio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comercio *
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none bg-white"
                {...register('commerceId', {
                  required: 'Debes seleccionar un comercio'
                })}
              >
                <option value=""  >Selecciona un comercio</option>
                {userCommerces.map((commerce) => (
                  <option key={commerce.$id} value={commerce.$id}>
                    {commerce.nombre}
                    {commerce.$id === originalCommerceId && " (actual)"}
                  </option>
                ))}
              </select>
              {errors.commerceId && (
                <p className="text-red-500 text-sm mt-1">{errors.commerceId.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {originalCommerceId && "El comercio actual está marcado como (actual)"}
              </p>
            </div>
            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (CUP) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  {...register('price', {
                    required: 'El precio es obligatorio',
                    min: {
                      value: 0.01,
                      message: 'El precio debe ser mayor a 0'
                    },
                    max: {
                      value: 999999.99,
                      message: 'El precio no puede exceder 999,999.99 CUP'
                    },
                    validate: {
                      positive: (value) => parseFloat(value) > 0 || 'El precio debe ser positivo',
                      notZero: (value) => parseFloat(value) !== 0 || 'El precio no puede ser cero'
                    }
                  })}
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>
            {/* URL de Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Imagen (opcional)
              </label>
              <div className= {fotoPreview? 'flex items-end gap-2' : ''}>
                {fotoPreview && (
               <div className="w-40 h-40 rounded-xl bg-gray-100 flex-shrink-0 relative">
                        <img src={fotoPreview} alt="VistaPrevia"
                        className='w-full h-full object-cover ' />
                        <button
                        type='button'
                        onClick={()=>{
                            setFotoPreview(null); 
                        }}
                        className='absolute top-1 right-1'>
                            <Trash2 className='w-4 h-4 text-red-500'/>
                        </button>
                </div> 
              )}
              <div>
                <input
                type="file"
                accept='image/'
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                  errors.image ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedType === 'medicamento' 
                  ? 'Si no proporcionas una, se asignará una imagen de medicamento aleatoria'
                  : 'Si no proporcionas una, se asignará una imagen de alimento aleatoria'}
              </p>
              </div>
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="available"
                className="w-5 h-5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                {...register('available')}
              />
              <label htmlFor="available" className="text-sm font-medium text-gray-700">
                Producto disponible
              </label>
            </div>

            {/* Botón de envío */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all `}
            >
              Editar Producto
            </motion.button>
          </form>
        </motion.div>
      
    </div>
  );
}
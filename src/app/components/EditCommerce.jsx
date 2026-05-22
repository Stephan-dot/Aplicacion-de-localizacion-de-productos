import { useParams, useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Store, MapPin, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react';
import Loading from './Loading';

// GRASP: Controller - ajusta la edición de comercio usando el contexto y manejo de ubicación.
export default function EditCommerce() {
    const {register, handleSubmit, reset, formState: {errors}} = useForm({mode: 'onChange'})
    const { updateCommerces, obtenerUbicacionUsuario, obtener} = useApp();
    const navigate = useNavigate();
    const [ubicacionUser, setUbicacionUser] = useState(null);
    const [selected, setSelected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [comercioOriginal, setComercioOriginal] = useState([]); // Guardar ubicación original
    const {id} = useParams()

    useEffect(()=>{
        const obtenerComercio = async(id) => {
            setLoading(true);
            const comercio = await obtener(id, 'Comercio'); 
            console.log("Comercio: ", comercio);
            
            // Guardar el comercio original para la ubicación
            setComercioOriginal(comercio[0]);
            
            // Si el comercio tiene ubicación, establecerla en el estado
            if(comercio[0].ubicacion && comercio[0].ubicacion.length === 2) {
                setUbicacionUser({
                    lat: comercio[0].ubicacion[0],
                    lng: comercio[0].ubicacion[1]
                });
            console.log("Comercio origial", comercioOriginal);
            }
            
            // Resetear el formulario con los datos del comercio
            reset({
                nombre: comercio[0].nombre ,
                direccion: comercio[0].direccion,
                // No incluyas ubicacion aquí porque es un campo separado
            });
            
            setLoading(false);
        }
        
        if(id) {
            obtenerComercio(id);
        }
    }, [id, reset])

    const handleObtenerUbicacion = async () => {
        setSelected(true);
        const ubicacion = await obtenerUbicacionUsuario();
        if(ubicacion) {
            setUbicacionUser(ubicacion);
            console.log('Ubicacion del usuario', ubicacion);
        }
    };
    
    const onSubmit = async (data) => {
        if(!id) {
            toast.info("No hay comercio seleccionado");
            return;
        }
        
        if(!ubicacionUser) {
            toast.error("Debes seleccionar una ubicación");
            return;
        }
        
        console.log('Id:', id);
        
        const newdata = {
            nombre: data.nombre,
            direccion: data.direccion,
            ubicacion: [ubicacionUser.lat, ubicacionUser.lng]
        };
        
        const response = await updateCommerces(id, newdata); // Asegúrate de pasar el ID
        
        if(response.error) {
            console.log("Respuesta del registro", response.error);
            toast.error(`Error Editar comercio`);
        } else {
            toast.success('Comercio actualizado exitosamente');
            setSelected(false);
            navigate('/perfil');
        }
    };

    if(loading) {
        return (
            <div className="max-w-lg mx-auto p-4">
                <Loading message="Cargando comercio..." />
            </div>
        );
    }

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
        <h1 className="text-3xl font-bold text-gray-800">Editar Comercio</h1>
        <p className="text-gray-600 mt-2">Editar informacion del comercio</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl p-6"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="w-8 h-8 text-white" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Comercio
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Ej: Farmacia Central"
              {...register('nombre',{
                    required: 'El nombre es obligatorio',
                    validate: (value) => {
                      if(!/[A-Z]/.test(value?.charAt(0))) return 'El nombre debe empezar con mayuscula';
                      if(/[0-9]/.test(value)) return 'El nombre no debe contener numeros';
                      return true;
                    },
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos dos letras'
                    }
                  })}
            />
            {errors.nombre && <p className='text-red-500'>{errors.nombre.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Ej: Calle 23 #456, Vedado"
              {...register('direccion', {required: 'La direccion es obligatoria'})}
            />
            {errors.direccion && <p className='text-red-500'>{errors.direccion.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicacion
            </label>
            <div className="relative flex flex-col gap-4 items-center">
              <div className="relative w-full">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50"
                  value={ubicacionUser ? `${ubicacionUser.lat}, ${ubicacionUser.lng}` : (comercioOriginal?.ubicacion ? `${comercioOriginal.ubicacion[0]}, ${comercioOriginal.ubicacion[1]}` : 'No se ha seleccionado ubicación')}
                  readOnly
                  placeholder="Selecciona tu ubicación actual"
                />
              </div>
              <button
                type='button'
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={handleObtenerUbicacion}
              >
                Usar mi ubicación actual
              </button>
            </div>
            {selected && (
              <p className="text-sm text-gray-600 mt-2">
                ¿Estás en la ubicación física del comercio? Para mejor precisión, deberías estar en el lugar, sino puedes cambiarla después.
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Editar Comercio
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
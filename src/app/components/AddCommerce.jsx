import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Store, MapPin, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form'
import { useState } from 'react';

// GRASP: Controller - administra la creación de comercios y la geolocalización del usuario.
export default function AddCommerce() {
  const {register, handleSubmit, formState: {errors}}= useForm({mode: 'onChange'})
  const { addCommerce,  obtenerUbicacionUsuario} = useApp();
  const navigate = useNavigate();
  const [ubicacionUser, setUbicacionUser]= useState('');
  const [selected, setSelected] = useState(false);
  
  const handleObtenerUbicacion = async () => {
    setSelected(true);
    const ubicacion = await obtenerUbicacionUsuario();
    setUbicacionUser(ubicacion);
    console.log('Ubicacion del usuario', ubicacionUser)
  };
  const onSubmit = async (data) => {
    //const selectedCity = cubanCities.find(city => city.name === data.ubicacion);
    //console.log("Ciudad selecionada", selectedCity)
    const newdata = {
      nombre: data.nombre,
      direccion: data.direccion,
      ubicacion: [ubicacionUser.lat, ubicacionUser.lng]

    }
    const response = await addCommerce(newdata); 
    
    if(response.error){
      console.log("Respuesta del registro", response)
      toast.error(`${response.error}`)
    }else{
      toast.success('Comercio registrado exitosamente');
      setSelected(false);
      navigate('/perfil');
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
        <h1 className="text-3xl font-bold text-gray-800">Registrar Comercio</h1>
        <p className="text-gray-600 mt-2">Agrega un nuevo comercio al sistema</p>
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
                    required: 'El nombre es obligaroio ',
                    validate: (value)=>{
                      if(!/[A-Z]/.test(value)) return 'El nombre debe empezar con mayuscula';
                      if(/[0-9]/.test(value)) return 'El nombre no debe contener numeros';
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
              {...register('direccion',{required: 'La direccion es obligaroia '})}
            />
          </div>
          {errors.direccion && <p className='text-red-500'>{errors.direccion.message}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicacion
            </label>
            <div className="relative flex flex-col gap-4 items-center">
              <MapPin className="absolute left-2 top-1/2 -translate-y-10 w-5 h-5 text-gray-400" />
              <input type="text"
              className="w-full px-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              defaultValue={!ubicacionUser ? '': `${ubicacionUser.lat}, ${ubicacionUser.lng}`}/>
              <button
              type='button'
              className="w-3.0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={handleObtenerUbicacion}
              >
              Mi ubicacion    
              </button>
            </div>
            {selected&& <p>¿Estás en la ubicación física del comercio? Para mejor precisión, deberías estar en el lugar, sino puede cambiarla despues</p>}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Registrar Comercio
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

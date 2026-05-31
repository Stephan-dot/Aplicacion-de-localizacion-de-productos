export const register = async ({newUser, account, setCurrentUser, setLoading})=>{
setLoading(true);
    
     try {
        const response = await account.create(
            newUser.$id, 
            newUser.email,     
            newUser.password,
            newUser.name,
            newUser.phone,     
        );
          setCurrentUser(newUser);
          return {success: true, message: "Registro exitoso"};
        
    } catch (error) { 
        if (error.code === 409) {
            return { 
                success: false, 
                error: 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.'
            }
        }else if (error.message === 'Failed to fetch' || 
            error.code === 'ERR_NETWORK' ||
            error.toString().includes('Failed to fetch')) {
            return {
                success: false, 
                error: '⚠️ Sin conexión a internet. Verifica tu red e intenta nuevamente.'
            };
        }else {
            return{
                success: false,
                error: error.message
            }
        }
    }finally{
      setLoading(false); 
    }
}
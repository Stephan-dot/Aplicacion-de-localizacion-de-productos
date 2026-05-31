export const login = async({account, setCurrentUser, fetchData, setLoading, email, password})=>{
setLoading(true);
    try { 
        console.log("Credenciles", email, password)
      const sesion = await account.createEmailPasswordSession(email, password);

      const user = await account.get();
      setCurrentUser(user);
      await fetchData();
      return {success: true, message: `Bienvenido`};
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.code === 401) {
        console.error('Credenciales incorrectas');
        return {
            success: false, 
            error: 'Credenciales incorrectas'
        };
      } else if (error.code === 429) {
        console.error('Demasiados intentos, espere un momento');
        return {
            success: false, 
            error: 'Demasiados intentos, espere un momento'
        };
      } else if (error.code === 403) {
        console.error('Cuenta de Usuario Bloqueda');
        return {
            success: false, 
            error: 'No puede acceder al ssitema. Cuenta de Usuario Bloqueda'
        };
      } else if (error.message === 'Failed to fetch' || 
        error.code === 'ERR_NETWORK' ||
        error.toString().includes('Failed to fetch')) {
        return {
            success: false, 
            error: '⚠️ Sin conexión a internet. Verifica tu red e intenta nuevamente.'
        };
      }  else {
        console.error('Error al iniciar sesión:', error.message);
        return {
            success: false, 
            error: "Error al iniciar sesión"
        };
      }
    }finally{
      setLoading(false);
    }
}
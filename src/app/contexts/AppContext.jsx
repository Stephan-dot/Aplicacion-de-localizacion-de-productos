import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { account, databases, storage } from '../service/appwrite-config';
import { adminService } from '../service/admin-service';
import { searchProducts as searchProductsHelper } from '../service/search-service';
import { ID, Query } from 'appwrite';
import { toast } from 'sonner';
// GRASP: Controller - coordina las operaciones de la aplicación y actúa como punto de entrada para la lógica de negocio.
// GRASP: Information Expert - este proveedor conoce el estado de usuarios, comercios, productos y comentarios.
const AppContext = createContext(undefined);

export const AppProvider= ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [commerces, setCommerces] = useState([]);
  const [products, setProducts] = useState([]);
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false); 
  const [selectedProductFromSearch, setSelectedProductFromSearch] = useState(null); 

  useEffect(() => {
    const loadData = async()=>{
      const user = await account.get();
      setCurrentUser(user);
      await fetchData();
    }
    loadData(); 
  }, []);

  const fetchData = async()=>{
    setLoading(true);
    try {
      const productos = await fetchpProductos(); 
      const comercios = await fetchComercios();
      const comentarios = await fetchComments(); 
      const dbusers = await adminService.getAllUsers()

      setUsers(dbusers.data); 
      setProducts(productos);
      setCommerces(comercios);
      setComments(comentarios);
      
    } catch (error) {
      console.error("Error al obtener datos rebice su conexion");
      toast.info("Carga de datos lenta... Revise su conexion"); 
    }finally{
      setLoading(false); 
    }
  }
  const fetchComercios = async () => {
    setLoading(true);
    try {
      const currentUser = await account.get();
      if (!currentUser) {
        console.error("No hay un usuario logueado");
        showToast('No hay usuario logueado', 'error')
        return;
      }
      let response = []; 
      if (currentUser.labels[0] === 'admin') {
        response = await databases.listDocuments(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_COMMERCE_COLLECTION_ID,
         );
      }else{
        response = await databases.listDocuments(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_COMMERCE_COLLECTION_ID,
          [Query.equal('userId', currentUser.$id)]
          );}
      setCommerces(response.documents);
      return response.documents; 
    } catch (error) {
      console.error("Error al obtener los comercios:", error);
      setCommerces([]);
    }finally{
      setLoading(false);
    }
  };

  const fetchpProductos = async () => {
    setLoading(true);
    try {
      const currentUser = await account.get();
      if (!currentUser) {
        console.error("No hay un usuario logueado");
        showToast('No hay usuario logueado', 'error')
        return;
      }
      let response = []; 
      if (currentUser.labels[0] === 'admin') {
        response = await databases.listDocuments(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_PRODUCTS_COLLECTION_ID,
         );
         console.log('Productos obtenidos:', response.documents);
      }else{
        response = await databases.listDocuments(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_PRODUCTS_COLLECTION_ID,
          [Query.equal('userId', currentUser.$id)]
          );console.log('Productos obtenidos:', response.documents);}
      setProducts(response.documents);
      return response.documents;
    } catch (error) {
      console.error("Error al obtener los comercios:", error);
      setProducts([]);
    }finally{
      setLoading(false);
    }
  };
  
  const fetchComments = async () => {
    setLoading(true);
    try {
      const currentUser = await account.get();
      if (!currentUser) {
        console.error("No hay un usuario logueado");
        showToast('No hay usuario logueado', 'error')
        return;
      }
      let response = []; 
      if (currentUser.labels[0] === 'admin') {
        response = await databases.listDocuments(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_COMMENTS_COLLECTION_ID,
         );
      }else{
        response = await databases.listDocuments(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_COMMENTS_COLLECTION_ID,
          [Query.equal('userId', currentUser.$id)]
          );}
      setComments(response.documents);
      return response.documents;
    } catch (error) {
      console.error("Error al obtener los comentarios:", error);
      setCommerces([]);
    }finally{
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try { 
      const response = await account.createEmailPasswordSession(email, password);
      if(response){
        const dbusers = await adminService.getAllUsers();
        console.log('Usuarios obtenidos:', dbusers); 
        const user = dbusers.data.find(u => u.email === email);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setUsers(dbusers.data);
        localStorage.setItem('usersList', JSON.stringify(dbusers.data));
        await fetchData();
        return true;
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }finally{
      setLoading(false);
    }
    return false;
  };

  const registro =async (userData) => {
    setLoading(true);
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      role: 'user',
      blocked: false,
    };
    console.log('Registering user:', newUser);
    console.log('Registro recibido', userData)
     try {
        const response = await account.create(
            `${Math.random()}`, 
            newUser.email,     
            newUser.password,
            newUser.name,
            newUser.phone,     
        );
        if(response){
          setUsers([...users, newUser]);
          setCurrentUser(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          return true;
        } 
    } catch (error) {
        console.log(error.message);  
        if (error.code === 409) {
            return { 
                success: false, 
                error: 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.'
            }
    }}finally{
      setLoading(false); 
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSession('current');
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      if (error.code !== 401 && !error.message?.includes('missing scopes')) {
      console.error('Error al cerrar sesión:', error);
    };
    }finally{
      setLoading(false); 
    }
  };

  const refreshUsers = useCallback(async () => {
    if (!currentUser?.labels?.[0] || currentUser.labels[0] !== 'admin') return;
    setLoading(true);
    try {
      const dbusers = await adminService.getAllUsers();
      setUsers(dbusers.data);
      localStorage.setItem('usersList', JSON.stringify(dbusers.data));
      return dbusers.data;
    } catch (error) {
      console.error('Error refreshing users:', error);
      // No lanzar error, solo retornar estado actual
      return users;
    }finally{
      setLoading(false); 
    }
  }, [currentUser, users]);

  const addCommerce = async (commerce) => {
    setLoading(true);
    try {
      if (!currentUser) return;
      console.log("Comercio recibido", commerce); 
      const newCommerce = {
        ...commerce,
        verificada: true,
        userId: currentUser.$id,
      };
      console.log("Comercio a enviar", newCommerce)
      
      const response = await databases.createDocument(
        import.meta.env.VITE_DATABASE_ID, // Database ID
        import.meta.env.VITE_COMMERCE_COLLECTION_ID,
        ID.unique(), // Collection ID
        newCommerce);
      await fetchComercios();
      return response; 
      //setCommerces([...commerces, newCommerce]);
    } catch (error) {
      console.error("Error al agregar el comercio", error); 
      throw new Error("Error al agregar comercio"); 
    }finally{
      setLoading(false);
    }
  };

  const addProduct = async (product) => {
    if (!currentUser) return Error("No hay un usuario logueado");
    setLoading(true);
    try {
      if(product){
        const newProduct = {...product, userId: currentUser.$id, esComercioVerificado: true,
        fecha: new Date(),verificaciones: 1, votantes: [] };
        
        const response = await databases.createDocument(import.meta.env.VITE_DATABASE_ID, 
        import.meta.env.VITE_PRODUCTS_COLLECTION_ID, ID.unique(), newProduct); 

        if(response){
          await fetchpProductos();
          return true; 
        }else{
          throw new Error("No se pudo crear el producto");
        }
      }else{
        throw new Error("No se recibieron datos del producto");
      }
    } catch (error) {
      console.error("Error al crear producto", error.message);
      return false; 
    }finally{
      setLoading(false); 
    }
  };

  const obtener = (id, accion) => {
    setLoading(true)
    try {
      console.log("Accion", accion);
      if(accion =='Comercio'){
        const searchCommerce = commerces.filter((e)=> e.$id== id); 
        return searchCommerce; 
      }else if(accion =='Producto'){
        const searchProduct = products.filter((e)=> e.$id== id); 
        console.log("Producto a editar", searchProduct); 
        return searchProduct; 
      }
    } catch (error) {
      console.error("Error al editar el comercio", error.message);
      return false; 
    }finally{
      setLoading(false); 
    }
  };

  const updateCommerces = async (id,commerce)=>{
    setLoading(true);
    try {
      const newCommerce = {
        ...commerce,
        verificada: true,
        userId: currentUser.$id,
      };
      console.log("Comercio a editar: ", newCommerce); 
      const result = await databases.updateDocument(
        import.meta.env.VITE_DATABASE_ID, // Database ID
        import.meta.env.VITE_COMMERCE_COLLECTION_ID,
        id,
        newCommerce
      )
      await fetchComercios();
      return result;
    } catch (error) {
      console.error("Error al editar comercios", error.message)
      throw new Error("Error al editar el comercio")
    }finally{
      setLoading(false); 
    }
  }

  const updateProduct = async (id, product) => {    
  setLoading(true);
    try {
      const newProduct = {
        ...product,
        userId: currentUser.$id,
        esComercioVerificado: true,
        fecha: new Date(),
        verificaciones: 1,
        votantes: []
      };
      console.log("Producto a editar: ", newProduct); 
      const result = await databases.updateDocument(
        import.meta.env.VITE_DATABASE_ID, // Database ID
        import.meta.env.VITE_PRODUCTS_COLLECTION_ID,
        id,
        newProduct
      )
      await fetchpProductos();
      return result;
    } catch (error) {
      console.error("Error al editar producto", error.message)
      throw new Error("Error al editar el producto")
    }finally{
      setLoading(false); 
    }
  };

  const deleteCommerce =async  (id) => {
    setLoading(true); 
    try {
      if (!currentUser) return;
      for(let i=0; i<products.length; i++){
        console.log(products[i].comercioId)
        if(products[i].comercioId ==id){
          const response = await databases.deleteDocument(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_PRODUCTS_COLLECTION_ID,
          products[i].$id)
        }
      }
      const response = await databases.deleteDocument(
        import.meta.env.VITE_DATABASE_ID,
        import.meta.env.VITE_COMMERCE_COLLECTION_ID,
        id
      )
      await fetchData(); 
      return true; 
    } catch (error) {
      console.error("Error al eliminar comercio", error);
      return false;
    }finally{
      setLoading(false); 
    }
    //setCommerces(commerces.filter(c => c.id !== id));
    //setProducts(products.filter(p => p.commerceId !== id));
  };

  const deleteProduct = async (id) => {
    setLoading(true); 
    try {
      if (!currentUser) return;
      const response = await databases.deleteDocument(
        import.meta.env.VITE_DATABASE_ID,
        import.meta.env.VITE_PRODUCTS_COLLECTION_ID,
        id
      )
      await fetchData(); 
      return true; 
    } catch (error) {
      console.error("Error al eliminar comercio", error);
      return false;
    }finally{
      setLoading(false);
    }
    //setProducts(products.filter(p => p.id !== id));
  };

  const voteProduct = async (productId, vote) => {
    setLoading(true);
    try {
      let votes = products.find(p => p.$id === productId)?.votantes || [];
      const userId = currentUser.$id;
      console.log("Votantes del Producto", votes); 
      if(vote>0){
        if (votes.includes(userId)) {
          return false;
        }
        const result = await databases.updateDocument(
        import.meta.env.VITE_DATABASE_ID,
        import.meta.env.VITE_PRODUCTS_COLLECTION_ID,
        productId,
        { votantes: [...votes, userId] }
      );
      await fetchData();
      return true; 
      }else{
        const newvotentes = votes.filter(v=> v !== userId); 
        console.log("Votantes después de eliminar voto", newvotentes);
        const result = await databases.updateDocument(
        import.meta.env.VITE_DATABASE_ID,
        import.meta.env.VITE_PRODUCTS_COLLECTION_ID,
        productId,
        { votantes: newvotentes.length > 0 ? newvotentes : [] }
      );
      await fetchData();
      return true; 
      }
    } catch (error) {
      console.error("Error al votar producto", error.message);
      throw new Error("Error al votar el producto");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (productId, text) => {
    if (!currentUser) return;
    setLoading(true)
    try {
      console.log("Datos recibido de comentario", { content: text, productId: productId });
      const newComment = {
        userId: currentUser.$id,
        content: text,
        fechaComentario: new Date().toISOString().split('T')[0],
        productId: productId
      };
      console.log("Comentario a agregar:", newComment);
      const response = await databases.createDocument(
        import.meta.env.VITE_DATABASE_ID, // Database ID
        import.meta.env.VITE_COMMENTS_COLLECTION_ID,
        ID.unique(), // Collection ID
        newComment); 

      await fetchComments();
      return true; 
      
    } catch (error) {
      console.error("Error al agregar comentario", error.message);
      return false;
    }finally{
      setLoading(false)
    }
  };

    const deleteComment = async (id) => {
    if (!currentUser) return;
    setLoading(true)
    try {
      const response = await databases.deleteDocument(
        import.meta.env.VITE_DATABASE_ID, // Database ID
        import.meta.env.VITE_COMMENTS_COLLECTION_ID,
        id
      );
      await fetchComments();
      return true; 
    } catch (error) {
      console.error("Error al eliminar comentario", error.message);
      return false;
    }finally{
      setLoading(false)
    }
  };

  const blockUser = (userId) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u);
    setUsers(updatedUsers);
    localStorage.setItem('usersList', JSON.stringify(updatedUsers));
  };

  const searchProducts = (query, type, maxPrice, userLocation, maxDistance = 10) => {
    console.log('Buscando productos...', { query, type, maxPrice, userLocation, maxDistance });
    return searchProductsHelper(products, query, type, maxPrice, userLocation, maxDistance);
  };

  const obtenerUbicacionUsuario = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalización no soportada');
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            reject(error.message);
          }
        );
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setUsers,
        commerces,
        fetchData,
        products,
        comments,
        login,
        deleteComment,
        registro,
        logout,
        addCommerce,
        addProduct,
        obtener,
        updateProduct,
        deleteCommerce,
        deleteProduct,
        voteProduct,
        addComment,
        obtenerUbicacionUsuario,
        blockUser,
        searchProducts,
        refreshUsers,
        loading,
        selectedProductFromSearch,
        setSelectedProductFromSearch,
        updateCommerces
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// GRASP: Controller / Pure Fabrication - hook reutilizable que encapsula acceso seguro al contexto.
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

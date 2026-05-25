// GRASP: Pure Fabrication - esta función maneja la lógica de creación de producto fuera del contexto/UI.
// GRASP: Low Coupling - reduce el acoplamiento entre AppContext y Appwrite.
const databaseId = import.meta.env?.VITE_DATABASE_ID || 'default_database';
const collectionId = import.meta.env?.VITE_PRODUCTS_COLLECTION_ID || 'default_products_collection';
const documentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;

export const addProduct = async ({ product, currentUser, databases, fetchProducts, setLoading }) => {
  setLoading(true);

  try {
    if (!currentUser) {
      return { success: false, error: 'No hay un usuario logueado' };
    }

    if (!product) {
      return { success: false, error: 'No se recibieron datos del producto' };
    }

    const newProduct = {
      ...product,
      userId: currentUser.$id,
      esComercioVerificado: true,
      fecha: new Date(),
      verificaciones: 1,
      votantes: [],
    };

    const response = await databases.createDocument(databaseId, collectionId, documentId, newProduct);

    if (!response) {
      return { success: false, error: 'No se pudo crear el producto' };
    }

    if (typeof fetchProducts === 'function') {
      await fetchProducts();
    }

    return { success: true, response };
  } catch (error) {
    return { success: false, error: error?.message || 'Error al crear producto' };
  } finally {
    setLoading(false);
  }
};

export const obtenerProducto = async ({ currentUser, databases, setLoading, setProducts }) => {
  setLoading(true);
  try {
    
    if (!currentUser) {
      return {success: false, error: 'No hay un usuario logueado' };
    }
    let response = []; 

    if (currentUser.labels[0] === 'admin') {
      response = await databases.listDocuments( databaseId, collectionId );
        
    }else{
      response = await databases.listDocuments( databaseId, collectionId, [Query.equal('userId', currentUser.$id)])
    }
    setProducts(response.documents);
    return {success: true, response};
  } catch (error) {
    return { success: false, error: error?.message || 'Error al obtener los productos' }
  }finally{
    setLoading(false);
  }
}

// product-service.js - Añadir esta función
export const editProduct = async ({ productId, product, currentUser, databases, fetchProducts, setLoading }) => {
  setLoading(true);

  try {
    if (!currentUser) {
      return { success: false, error: 'No hay un usuario logueado' };
    }

    if (!productId) {
      return { success: false, error: 'No se recibió el ID del producto' };
    }

    if (!product) {
      return { success: false, error: 'No se recibieron datos del producto' };
    }
    
    const updatedProduct = {
      ...product,
      fechaModificacion: new Date(),
    };

    const response = await databases.updateDocument(databaseId, collectionId, productId, updatedProduct);

    if (!response) {
      return { success: false, error: 'No se pudo actualizar el producto' };
    }

    if (typeof fetchProducts === 'function') {
      await fetchProducts();
    }

    return { success: true, response };
  } catch (error) {
    return { success: false, error: error?.message || 'Error al editar producto' };
  } finally {
    setLoading(false);
  }
};

export const deleteProduct = async ({ productId, currentUser, databases, fetchProducts, setLoading }) => {
  setLoading(true); 
  try {
    if (!currentUser) return{success: false, error: 'No hay un usuario logueado' };

    if(!productId) return{success: false, error: 'No se recibió el ID del producto' };

    const response = await databases.deleteDocument(databaseId, collectionId, productId )
    
    if(!response) return { success: false, error: 'No se pudo eliminar el producto' };
    
    if (typeof fetchProducts === 'function') {
      await fetchProducts();
    }
    return { success: true, response };
  } catch (error) {
    return { success: false, error: error?.message || 'Error al eliminar producto' };
  }finally{
    setLoading(false);
  }
}
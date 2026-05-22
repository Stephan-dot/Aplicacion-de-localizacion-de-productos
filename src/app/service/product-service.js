// GRASP: Pure Fabrication - esta función maneja la lógica de creación de producto fuera del contexto/UI.
// GRASP: Low Coupling - reduce el acoplamiento entre AppContext y Appwrite.
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

    const databaseId = import.meta.env?.VITE_DATABASE_ID || 'default_database';
    const collectionId = import.meta.env?.VITE_PRODUCTS_COLLECTION_ID || 'default_products_collection';
    const documentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;

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

const databeseID = import.meta.env.VITE_DATABASE_ID;
const collectionID= import.meta.env.VITE_COMMERCE_COLLECTION_ID;
const documentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
const addCommerce = ({currentUser, commerce, databases, fetchComercios, setLoading})=>{
    setLoading(true);
    try {
        if (!currentUser) return {success: false, error: "No hay usuario logueado"};
        if(!commerce) return {succes: false, error: "No se recibieron datos del comercio"}
        const newCommerce = {
        ...commerce,
        verificada: true,
        userId: currentUser.$id,
        };

        const response = await databases.createDocument(databeseID, collectionID,documentId, newCommerce);
        await fetchComercios();
        return {success: true, message: "Comercio agregado"}; 
    } catch (error) {
        return {success: false, message: "Error al agregar el comercio"}
    }finally{
        setLoading(false);
    }
}
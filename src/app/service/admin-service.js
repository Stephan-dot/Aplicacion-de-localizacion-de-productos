import { Client, Functions } from 'appwrite';
import { account } from './appwrite-config';


// GOF: Facade - oculta la complejidad de Appwrite Functions detrás de un servicio simple.
// GRASP: Pure Fabrication - separa la lógica de backend de los componentes y del contexto.
const client = new Client()
    .setEndpoint(import.meta.env.VITE_ENPOINT_PROYECT)
    .setProject(import.meta.env.VITE_PROYECT_ID);

const functions = new Functions(client);

const FUNCTION_ID = import.meta.env.VITE_FUNCTION_ID; 

const callAdminFunction = async (action, userId = null) => {
    console.log(`Llamando función con acción: ${action} y userId: ${userId?.userId}`);
    try {
        const currentUser = await account.get();
        console.log('Usuario autenticado:', currentUser.email);
        const execution = await functions.createExecution(
            FUNCTION_ID,           // ID de la función
            JSON.stringify({ action, userId: userId?.userId }),  // Payload (cuerpo)
            false,                 // Async? false = esperar respuesta
            '/',                   // Path
            'GET'                 // Método HTTP
        );
        
        console.log('Ejecución de función:', execution);
        // Verificar si la ejecución fue exitosa
        if (execution.status === 'failed') {
            throw new Error(execution.errors || 'Función falló');
        }
        
        // Parsear la respuesta
        if (execution.responseBody) {
            return JSON.parse(execution.responseBody);
        }
        
        return { success: false, error: 'Respuesta vacía' };
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};


export const adminService = {
    // Usuarios
    getAllUsers: async () => {
        return await callAdminFunction('users_list');
    },
    getUser: async (userId) => {
        return await callAdminFunction('users_get', { userId });
    },
    createUser: async (userData) => {
        return await callAdminFunction('users_create', userData);
    },
    updateUser: async (userId, updateData) => {
        return await callAdminFunction('users_update', { userId, ...updateData });
    },
    blockUser: async (userId) => {
        return await callAdminFunction('users_block', { userId });
    },
    unblockUser: async (userId) => {
        return await callAdminFunction('users_unblock', { userId });
    },
    deleteUser: async (userId) => {
        return await callAdminFunction('users_delete', { userId });
    },
    
    // Comercios
    getAllCommerces: async (filters = {}) => {
        return await callAdminFunction('commerce_list', filters);
    },
    getCommerce: async (commerceId) => {
        return await callAdminFunction('commerce_get', { commerceId });
    },
    createCommerce: async (commerceData) => {
        return await callAdminFunction('commerce_create', commerceData);
    },
    updateCommerce: async (commerceId, updateData) => {
        return await callAdminFunction('commerce_update', { commerceId, ...updateData });
    },
    deleteCommerce: async (commerceId) => {
        return await callAdminFunction('commerce_delete', { commerceId });
    },
    
    // Productos
    getAllProducts: async (filters = {}) => {
        return await callAdminFunction('product_list', filters);
    },
    getProduct: async (productId) => {
        return await callAdminFunction('product_get', { productId });
    },
    createProduct: async (productData) => {
        return await callAdminFunction('product_create', productData);
    },
    updateProduct: async (productId, updateData) => {
        return await callAdminFunction('product_update', { productId, ...updateData });
    },
    deleteProduct: async (productId) => {
        return await callAdminFunction('product_delete', { productId });
    },
    voteProduct: async (productId, voteChange) => {
        return await callAdminFunction('product_vote', { productId, voteChange });
    }
};
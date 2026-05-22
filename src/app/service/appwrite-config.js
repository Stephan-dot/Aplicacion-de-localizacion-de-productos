import { Client, Account, Databases, Storage } from 'appwrite';

// GOF: Facade - abstrae la configuración y creación de clientes Appwrite.
// GRASP: Pure Fabrication - esta capa no pertenece a la lógica de dominio, pero reduce el acoplamiento.
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') 
    .setProject('6836a79400199dcfe521'); 

// GOF: Singleton-like - el módulo exporta instancias compartidas que se reutilizan en toda la app.
export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client); 
